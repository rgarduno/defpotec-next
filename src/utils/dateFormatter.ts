export function formatDateStr(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  
  const parts = dateStr.split(" de ");
  if (parts.length === 2) {
    const day = parts[0];
    const monthYear = parts[1].trim().split(/\s+/);
    
    if (monthYear.length === 2) {
      const monthNum = parseInt(monthYear[0], 10);
      const year = monthYear[1];
      const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      
      if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        return `${day} de ${months[monthNum - 1]} del ${year}`;
      }
    }
  }
  
  return dateStr;
}
