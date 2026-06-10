import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

// Target directories (relative to backend)
const NOTES_DIR = path.resolve('../notes for mern fullstack');
const INTERVIEW_DIR = path.resolve('../interview questions');

// Helper to recursively find all PDFs
function findPDFFiles(dirPath, fileList = []) {
  if (!fs.existsSync(dirPath)) return fileList;
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findPDFFiles(fullPath, fileList);
    } else if (path.extname(file).toLowerCase() === '.pdf') {
      fileList.push(fullPath);
    }
  });
  return fileList;
}

// Function to apply watermark and header brand
async function watermarkPDF(filePath) {
  try {
    console.log(`Watermarking: ${filePath}...`);
    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // 1. Draw diagonal watermark in the center
      page.drawText('SPARK.io', {
        x: width / 2 - 120,
        y: height / 2 - 50,
        size: 55,
        color: rgb(0.1, 0.6, 0.3), // Emerald Green watermark
        opacity: 0.08,             // Very light transparency
        rotate: degrees(35),
      });
      
      // 2. Draw a dark header bar at the top to cover other headers/brandings
      page.drawRectangle({
        x: 0,
        y: height - 25,
        width: width,
        height: 25,
        color: rgb(0.02, 0.02, 0.04), // Dark header bar background
      });
      
      // 3. Draw clean website branding in the header bar
      page.drawText('SPARK.io Academic Portal | Student Study Resource', {
        x: 20,
        y: height - 16,
        size: 8,
        color: rgb(0.1, 0.6, 0.3), // Emerald Green text
        opacity: 0.9,
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);
    console.log(`Successfully watermarked: ${filePath}`);
  } catch (err) {
    console.error(`Error watermarking ${filePath}:`, err);
  }
}

async function run() {
  const pdfs = [
    ...findPDFFiles(NOTES_DIR),
    ...findPDFFiles(INTERVIEW_DIR)
  ];
  
  console.log(`Found ${pdfs.length} PDFs to watermark.`);
  for (const pdf of pdfs) {
    await watermarkPDF(pdf);
  }
  console.log('PDF Watermarking Complete!');
}

run();
