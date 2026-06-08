const XLSX = require('./backend/node_modules/xlsx');
const path = require('path');

const filePath = path.join(__dirname, '7201 students details.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total Rows Found:', data.length);
console.log('Headers:', Object.keys(data[0] || {}));
console.log('Sample Row 1:', data[0]);
console.log('Sample Row 2:', data[1]);
