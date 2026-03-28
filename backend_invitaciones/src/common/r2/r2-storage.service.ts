// src/common/r2/r2-storage.service.ts
import {
  Injectable,
  Logger,
  OnModuleInit,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// ═══════════════════════════════════════════
// Constantes de validación (SRS + API docs)
// ═══════════════════════════════════════════

/** MIME types permitidos para fotos (RF-6.4) */
const MIME_FOTOS_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/** MIME type permitido para música */
const MIME_MUSICA_PERMITIDO = 'audio/mpeg';

/** Tamaño máximo por foto: 15 MB en bytes */
const MAX_FOTO_SIZE = 15 * 1024 * 1024;

/** Tamaño máximo de música: 20 MB en bytes */
const MAX_MUSICA_SIZE = 20 * 1024 * 1024;

/** Resultado de una subida exitosa */
export interface UploadResult {
  url: string;
  tamano: number;
  mimeType: string;
}

@Injectable()
export class R2StorageService implements OnModuleInit {
  private readonly logger = new Logger(R2StorageService.name);
  private s3!: S3Client;
  private bucketName!: string;
  private publicUrl!: string;

  constructor(private readonly configService: ConfigService) {}

  // ═══════════════════════════════════════════
  // Inicialización — Se ejecuta al arrancar el módulo
  // ═══════════════════════════════════════════

  onModuleInit() {
    this.bucketName = this.configService.getOrThrow<string>('R2_BUCKET_NAME');
    this.publicUrl = this.configService.getOrThrow<string>('R2_PUBLIC_URL');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: this.configService.getOrThrow<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
    });

    this.logger.log(
      `☁️ Cloudflare R2 inicializado — Bucket: ${this.bucketName}`,
    );
  }

  // ═══════════════════════════════════════════
  // Subir foto a galería (público, sin auth en MVP)
  // ═══════════════════════════════════════════

  async subirFotoGaleria(
    invitacionId: string,
    archivo: Express.Multer.File,
  ): Promise<UploadResult> {
    this.validarMime(archivo, MIME_FOTOS_PERMITIDOS);
    this.validarTamano(archivo, MAX_FOTO_SIZE, '15 MB');

    const extension = this.obtenerExtension(archivo.mimetype);
    const key = `invitaciones/${invitacionId}/galeria/${uuidv4()}.${extension}`;
    return this.subirArchivo(key, archivo);
  }

  // ═══════════════════════════════════════════
  // Subir fotos del anfitrión (máx 5, con orden)
  // ═══════════════════════════════════════════

  async subirFotoAnfitrion(
    invitacionId: string,
    archivo: Express.Multer.File,
    orden: number,
  ): Promise<UploadResult> {
    this.validarMime(archivo, MIME_FOTOS_PERMITIDOS);
    this.validarTamano(archivo, MAX_FOTO_SIZE, '15 MB');

    const extension = this.obtenerExtension(archivo.mimetype);
    const key = `invitaciones/${invitacionId}/anfitrion/${orden}-foto.${extension}`;
    return this.subirArchivo(key, archivo);
  }

  // ═══════════════════════════════════════════
  // Subir imagen de sección de historia
  // ═══════════════════════════════════════════

  async subirImagenHistoria(
    invitacionId: string,
    archivo: Express.Multer.File,
    orden: number,
  ): Promise<UploadResult> {
    this.validarMime(archivo, MIME_FOTOS_PERMITIDOS);
    this.validarTamano(archivo, MAX_FOTO_SIZE, '15 MB');

    const extension = this.obtenerExtension(archivo.mimetype);
    const key = `invitaciones/${invitacionId}/historias/${orden}-historia.${extension}`;
    return this.subirArchivo(key, archivo);
  }

  // ═══════════════════════════════════════════
  // Subir música (MP3, máx 20 MB)
  // ═══════════════════════════════════════════

  async subirMusica(
    invitacionId: string,
    archivo: Express.Multer.File,
  ): Promise<UploadResult> {
    this.validarMime(archivo, [MIME_MUSICA_PERMITIDO]);
    this.validarTamano(archivo, MAX_MUSICA_SIZE, '20 MB');

    // Nombre fijo: solo 1 MP3 por invitación (reemplaza el existente)
    const key = `invitaciones/${invitacionId}/musica/musica.mp3`;
    return this.subirArchivo(key, archivo);
  }

  // ═══════════════════════════════════════════
  // Eliminar un archivo por URL pública
  // ═══════════════════════════════════════════

  async eliminarArchivo(url: string): Promise<void> {
    try {
      const key = this.extraerKeyDesdeUrl(url);

      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      this.logger.log(`🗑️ Archivo eliminado de R2: ${key}`);
    } catch (error: any) {
      // DeleteObject en S3/R2 no falla si el objeto no existe (idempotente)
      this.logger.error(
        `❌ Error eliminando archivo de R2: ${error.message}`,
      );
      throw error;
    }
  }

  // ═══════════════════════════════════════════
  // Eliminar carpeta completa de una invitación
  // Usado por DELETE /invitaciones/:id y cron job nocturno
  // ═══════════════════════════════════════════

  async eliminarCarpetaInvitacion(invitacionId: string): Promise<number> {
    const prefix = `invitaciones/${invitacionId}/`;
    let totalEliminados = 0;
    let continuationToken: string | undefined;

    try {
      // Listar y eliminar en loop (R2 pagina a 1000 objetos por request)
      do {
        const listResponse = await this.s3.send(
          new ListObjectsV2Command({
            Bucket: this.bucketName,
            Prefix: prefix,
            ContinuationToken: continuationToken,
          }),
        );

        const objetos = listResponse.Contents ?? [];

        if (objetos.length === 0) break;

        // Eliminar en paralelo con batches de 10
        const batchSize = 10;
        for (let i = 0; i < objetos.length; i += batchSize) {
          const batch = objetos.slice(i, i + batchSize);
          await Promise.all(
            batch.map((obj) =>
              this.s3.send(
                new DeleteObjectCommand({
                  Bucket: this.bucketName,
                  Key: obj.Key!,
                }),
              ),
            ),
          );
        }

        totalEliminados += objetos.length;
        continuationToken = listResponse.IsTruncated
          ? listResponse.NextContinuationToken
          : undefined;
      } while (continuationToken);

      if (totalEliminados > 0) {
        this.logger.log(
          `☁️ ${totalEliminados} archivos eliminados de R2 — ` +
          `Invitación: ${invitacionId}`,
        );
      } else {
        this.logger.log(
          `📂 Sin archivos para eliminar en R2: ${prefix}`,
        );
      }

      return totalEliminados;
    } catch (error: any) {
      this.logger.error(
        `❌ Error eliminando carpeta de R2: ${error.message}`,
      );
      throw error;
    }
  }

  // ═══════════════════════════════════════════
  // Obtener URL firmada temporal (para download ZIP)
  // ═══════════════════════════════════════════

  async obtenerUrlFirmada(
    url: string,
    expiraEnSegundos = 3600,
  ): Promise<string> {
    const key = this.extraerKeyDesdeUrl(url);

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: expiraEnSegundos,
    });
  }

  // ═══════════════════════════════════════════
  // Listar archivos de una carpeta (para stats de galería)
  // ═══════════════════════════════════════════

  async listarArchivos(
    prefix: string,
  ): Promise<{ key: string; tamano: number }[]> {
    const resultados: { key: string; tamano: number }[] = [];
    let continuationToken: string | undefined;

    do {
      const response = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );

      for (const obj of response.Contents ?? []) {
        resultados.push({
          key: obj.Key!,
          tamano: obj.Size ?? 0,
        });
      }

      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : undefined;
    } while (continuationToken);

    return resultados;
  }

  // ═══════════════════════════════════════════
  // Métodos privados
  // ═══════════════════════════════════════════

  /**
   * Sube un archivo a una key específica dentro del bucket.
   * Retorna la URL pública y metadatos.
   */
  private async subirArchivo(
    key: string,
    archivo: Express.Multer.File,
  ): Promise<UploadResult> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: archivo.buffer,
        ContentType: archivo.mimetype,
      }),
    );

    // La URL pública se construye con el dominio público del bucket
    const url = `${this.publicUrl}/${key}`;

    this.logger.log(
      `📤 Archivo subido a R2 — Key: ${key} | ` +
      `Tamaño: ${(archivo.size / 1024).toFixed(1)} KB | ` +
      `MIME: ${archivo.mimetype}`,
    );

    return {
      url,
      tamano: archivo.size,
      mimeType: archivo.mimetype,
    };
  }

  /**
   * Valida que el MIME type del archivo esté en la lista permitida.
   * No confía en el Content-Type del cliente (RF-6.4).
   */
  private validarMime(
    archivo: Express.Multer.File,
    permitidos: string[],
  ): void {
    if (!permitidos.includes(archivo.mimetype)) {
      throw new UnsupportedMediaTypeException(
        `Tipo de archivo no permitido: ${archivo.mimetype}. ` +
        `Formatos aceptados: ${permitidos.join(', ')}`,
      );
    }
  }

  /**
   * Valida que el tamaño del archivo no exceda el límite.
   */
  private validarTamano(
    archivo: Express.Multer.File,
    maxBytes: number,
    maxLabel: string,
  ): void {
    if (archivo.size > maxBytes) {
      throw new PayloadTooLargeException(
        `El archivo excede el tamaño máximo de ${maxLabel}. ` +
        `Tamaño recibido: ${(archivo.size / (1024 * 1024)).toFixed(1)} MB`,
      );
    }
  }

  /**
   * Extrae la key del objeto desde una URL pública.
   * "https://pub-XXX.r2.dev/invitaciones/abc/foto.jpg"
   * → "invitaciones/abc/foto.jpg"
   */
  private extraerKeyDesdeUrl(url: string): string {
    // Soporta tanto r2.dev como custom domain
    const publicPrefix = this.publicUrl.endsWith('/')
      ? this.publicUrl
      : `${this.publicUrl}/`;

    if (url.startsWith(publicPrefix)) {
      return decodeURIComponent(url.substring(publicPrefix.length));
    }

    // Fallback: asumir que ya es una key directa
    return url;
  }

  /**
   * Obtiene la extensión del archivo según su MIME type.
   */
  private obtenerExtension(mimeType: string): string {
    const mapa: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'audio/mpeg': 'mp3',
    };
    return mapa[mimeType] ?? 'bin';
  }
}