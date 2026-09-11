import * as ExcelJS from 'exceljs';

export interface FilaExportAsistente {
  nombre: string;
  /** Nombre completo del titular, si esta fila ES su plus-one. */
  plusOneDe: string | null;
  /** Nombre del grupo, si esta fila es integrante de un grupo. */
  grupo: string | null;
  confirmo: boolean;
}

export interface RestriccionExport {
  /** Nombre del titular, o "Grupo: <nombre>" para una restricción de grupo. */
  invitado: string;
  descripcion: string;
}

/**
 * El único export XLSX del sistema (descargado desde /asistentes por los novios).
 * Hoja 1: una fila por persona (individuales + plus-ones + integrantes de grupo).
 * Hoja 2: restricciones alimentarias asociadas a un titular o a un grupo.
 */
export async function generarExcelAsistentes(
  filas: FilaExportAsistente[],
  restricciones: RestriccionExport[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  const hojaAsistentes = workbook.addWorksheet('Asistentes');
  hojaAsistentes.columns = [
    { header: 'Nombre', key: 'nombre', width: 30 },
    { header: 'Plus-one de', key: 'plusOneDe', width: 25 },
    { header: 'Grupo', key: 'grupo', width: 25 },
    { header: 'Confirmó', key: 'confirmo', width: 12 },
  ];
  hojaAsistentes.getRow(1).font = { bold: true };

  let totalConfirmados = 0;
  for (const fila of filas) {
    if (fila.confirmo) totalConfirmados++;
    hojaAsistentes.addRow({
      nombre: fila.nombre,
      plusOneDe: fila.plusOneDe ?? '',
      grupo: fila.grupo ?? '',
      confirmo: fila.confirmo ? 'Sí' : 'No',
    });
  }

  hojaAsistentes.addRow([]);
  const filaTotal = hojaAsistentes.addRow(['Total confirmados', totalConfirmados]);
  filaTotal.font = { bold: true };

  const hojaRestricciones = workbook.addWorksheet('Restricciones alimentarias');
  hojaRestricciones.columns = [
    { header: 'Invitado', key: 'invitado', width: 30 },
    { header: 'Descripción', key: 'descripcion', width: 60 },
  ];
  hojaRestricciones.getRow(1).font = { bold: true };
  for (const restriccion of restricciones) {
    hojaRestricciones.addRow(restriccion);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
