import { Folio } from "@/app/admin/context/AdminContext";

/**
 * Escapes CSV field value to handle commas, quotes, and newlines properly.
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports an array of Folio objects to an Excel-friendly CSV file.
 * Includes UTF-8 BOM so Microsoft Excel automatically recognizes Spanish characters (tildes, ñ, etc.).
 */
export function exportFoliosToCsv(folios: Folio[], filename: string = "Lista_de_Pacientes_Defpotec.csv") {
  if (!folios || folios.length === 0) return;

  const headers = [
    "Código de Folio",
    "Nombre del Paciente",
    "Correo Electrónico",
    "Teléfono / Celular",
    "Número de Pacientes",
    "Campaña / Jornada",
    "Fecha de Campaña",
    "Horario Preferido",
    "Estado"
  ];

  const rows = folios.map((f) => [
    escapeCsvValue(f.code || f.id),
    escapeCsvValue(f.name || ""),
    escapeCsvValue(f.email || ""),
    escapeCsvValue(f.cellphone || ""),
    escapeCsvValue(f.numberOfPatients || 1),
    escapeCsvValue(f.campaignTitle || f.dayTrip || ""),
    escapeCsvValue(
      f.campaignDate || (f.day && f.month && f.year ? `${f.day}/${f.month}/${f.year}` : "")
    ),
    escapeCsvValue(f.hour || ""),
    escapeCsvValue(f.active ? "Activo" : "Completado")
  ]);

  const csvHeaderStr = headers.map((h) => `"${h}"`).join(",");
  const csvRowsStr = rows.map((r) => r.join(",")).join("\n");
  
  // Add UTF-8 BOM (\uFEFF) for Excel Spanish encoding compatibility
  const csvContent = "\uFEFF" + csvHeaderStr + "\n" + csvRowsStr;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generic JSON array to CSV exporter with UTF-8 BOM.
 */
export function exportToCsvData(data: Record<string, any>[], filename: string = "export.csv") {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((item) => headers.map((h) => escapeCsvValue(item[h])));

  const csvHeaderStr = headers.map((h) => `"${h}"`).join(",");
  const csvRowsStr = rows.map((r) => r.join(",")).join("\n");

  const csvContent = "\uFEFF" + csvHeaderStr + "\n" + csvRowsStr;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
