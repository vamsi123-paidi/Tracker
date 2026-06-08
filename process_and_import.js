const XLSX = require('./backend/node_modules/xlsx');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    // Read input Excel file
    const inputFilePath = path.join(__dirname, '7201 students details.xlsx');
    console.log('Reading:', inputFilePath);
    const inputWorkbook = XLSX.readFile(inputFilePath);
    const inputSheet = inputWorkbook.Sheets[inputWorkbook.SheetNames[0]];
    const inputData = XLSX.utils.sheet_to_json(inputSheet);

    console.log(`Processing ${inputData.length} student records...`);

    // Create CSV content
    let csvContent = 'name,email,password,collegeCode,collegeName\n';
    for (const row of inputData) {
      const name = row['Name'] ? row['Name'].trim().replace(/"/g, '""') : '';
      const email = row['mail id'] ? row['mail id'].trim().toLowerCase() : '';
      if (name && email) {
        csvContent += `"${name}","${email}","1234","SRHP","SRHP"\n`;
      }
    }

    // Save CSV file
    const outputFilePath = path.join(__dirname, 'students_ready_for_import.csv');
    fs.writeFileSync(outputFilePath, csvContent, 'utf-8');
    console.log('Saved formatted CSV file to:', outputFilePath);

    // 1. Authenticate with the live Render backend
    console.log('Logging in as trainer to live backend...');
    const loginRes = await fetch('https://holotrack-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vamsi@tracker.com', password: 'Tracker@123' })
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Successfully logged in.');

    // 2. Prepare file data using native Blob and File
    const fileBuffer = fs.readFileSync(outputFilePath);
    const fileBlob = new Blob([fileBuffer], { type: 'text/csv' });
    const file = new File([fileBlob], 'students_ready_for_import.csv', { type: 'text/csv' });

    const formData = new FormData();
    formData.append('file', file);

    // 3. Upload the CSV file to the production import endpoint
    console.log('Uploading CSV file to register students in database...');
    const importRes = await fetch('https://holotrack-backend.onrender.com/api/admin/import-students', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!importRes.ok) {
      const errorText = await importRes.text().catch(() => 'Could not read text');
      throw new Error(`Upload failed with status ${importRes.status}: ${errorText}`);
    }

    const importData = await importRes.json();
    console.log('Import Status:', importData.message);
    if (importData.errors && importData.errors.length > 0) {
      console.log('Import skipped some records:', importData.errors);
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

main();
