import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename = 'export.xlsx', sheetName = 'Sheet1') => {
  // data should be an array of objects
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Format cells if needed
  // ...
  
  // Export
  XLSX.writeFile(workbook, filename);
};
