import { Readable } from 'stream';
import * as ExcelJS from 'exceljs';

/**
 * Fila normalizada del archivo .xlsx/.csv de carga masiva del admin.
 * Columnas esperadas (header, sin distinguir mayusculas/acentos):
 * Nombre, Apellido, Grupo, PuedePlusOne, MaxIntegrantesGrupo.
 */
export interface FilaImportada {
  /** Numero de fila en el archivo (1 = header, primera fila de datos = 2). */
  fila: number;
  nombre: string;
  apellido: string;
  /** Nombre del grupo, o null si es un invitado individual. */
  grupo: string | null;
  /** null = no especificado en el archivo (no se toca el override). */
  puedePlusOne: boolean | null;
  maxIntegrantesGrupo: number | null;
}

const VALORES_AFIRMATIVOS = new Set(['si', 'sí', 'true', '1', 'x', 'yes']);

function celdaAString(valor: ExcelJS.CellValue): string {
  if (valor === null || valor === undefined) return '';
  if (valor instanceof Date) return valor.toISOString();
  if (typeof valor === 'object') {
    const obj = valor as any;
    if (typeof obj.text === 'string') return obj.text;
    if (Array.isArray(obj.richText)) {
      return obj.richText.map((r: any) => r.text ?? '').join('');
    }
    if ('result' in obj) return String(obj.result ?? '');
  }
  return String(valor);
}

/**
 * Normaliza el nombre de columna del header: sin acentos, minusculas, sin espacios.
 * Asi "Puede PlusOne", "puedeplusone", "PUEDE_PLUSONE" matchean todos.
 */
function normalizarHeader(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export async function parsearArchivoInvitados(
  file: Express.Multer.File,
): Promise<FilaImportada[]> {
  const workbook = new ExcelJS.Workbook();
  const esCsv =
    file.mimetype === 'text/csv' ||
    file.originalname.toLowerCase().endsWith('.csv');

  if (esCsv) {
    await workbook.csv.read(Readable.from(file.buffer));
  } else {
    await workbook.xlsx.load(file.buffer as unknown as ExcelJS.Buffer);
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const columnas = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, colNumber) => {
    columnas.set(normalizarHeader(celdaAString(cell.value)), colNumber);
  });

  const idxNombre = columnas.get('nombre');
  const idxApellido = columnas.get('apellido');

  if (!idxNombre || !idxApellido) {
    throw new Error(
      'El archivo debe tener columnas "Nombre" y "Apellido" en la primera fila.',
    );
  }

  const idxGrupo = columnas.get('grupo');
  const idxPuedePlusOne = columnas.get('puedeplusone');
  const idxMaxIntegrantes = columnas.get('maxintegrantesgrupo');

  const filas: FilaImportada[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header

    const nombre = idxNombre ? celdaAString(row.getCell(idxNombre).value).trim() : '';
    const apellido = idxApellido ? celdaAString(row.getCell(idxApellido).value).trim() : '';

    if (!nombre && !apellido) return; // fila vacia, se ignora silenciosamente

    const grupoRaw = idxGrupo ? celdaAString(row.getCell(idxGrupo).value).trim() : '';
    const plusOneRaw = idxPuedePlusOne
      ? celdaAString(row.getCell(idxPuedePlusOne).value).trim().toLowerCase()
      : '';
    const maxRaw = idxMaxIntegrantes
      ? celdaAString(row.getCell(idxMaxIntegrantes).value).trim()
      : '';

    filas.push({
      fila: rowNumber,
      nombre,
      apellido,
      grupo: grupoRaw || null,
      puedePlusOne: plusOneRaw ? VALORES_AFIRMATIVOS.has(plusOneRaw) : null,
      maxIntegrantesGrupo: maxRaw && !Number.isNaN(Number(maxRaw)) ? Number(maxRaw) : null,
    });
  });

  return filas;
}
