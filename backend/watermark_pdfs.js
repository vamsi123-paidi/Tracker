import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, degrees, PDFName, PDFDict } from 'pdf-lib';

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

// Function to apply watermark, header brand, and remove original watermark images
async function watermarkPDF(filePath) {
  try {
    console.log(`Watermarking & Rebranding: ${filePath}...`);
    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const context = pdfDoc.context;
    
    // 1. Remove original image watermarks (e.g. Innomatics image watermarks)
    let replacedImageCount = 0;
    context.indirectObjects.forEach((value, ref) => {
      if (value.constructor.name === 'PDFRawStream') {
        if (value.dict && value.dict.get) {
          const subtype = value.dict.get(PDFName.of('Subtype'));
          if (subtype && subtype.toString() === '/Image') {
            // Replace the image stream with a tiny blank 1x1 gray pixel to effectively erase it
            const dict = context.obj({
              Type: 'XObject',
              Subtype: 'Image',
              Width: 1,
              Height: 1,
              ColorSpace: 'DeviceGray',
              BitsPerComponent: 8,
            });
            const emptyStream = context.stream(new Uint8Array([0]), dict);
            context.assign(ref, emptyStream);
            replacedImageCount++;
          }
        }
      }
    });
    
    if (replacedImageCount > 0) {
      console.log(`  Successfully erased ${replacedImageCount} background image watermarks.`);
    }

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // 2. Draw diagonal watermark in the center
      page.drawText('SPARK.io', {
        x: width / 2 - 120,
        y: height / 2 - 50,
        size: 55,
        color: rgb(0.1, 0.6, 0.3), // Emerald Green watermark
        opacity: 0.08,             // Very light transparency
        rotate: degrees(35),
      });
      
      // 3. Draw a dark header bar at the top to cover other headers/brandings
      page.drawRectangle({
        x: 0,
        y: height - 25,
        width: width,
        height: 25,
        color: rgb(0.02, 0.02, 0.04), // Dark header bar background
      });
      
      // 4. Draw clean website branding in the header bar
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
    console.log(`Successfully completed watermarking: ${filePath}\n`);
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

async function run() {
  const pdfs = [
    ...findPDFFiles(NOTES_DIR),
    ...findPDFFiles(INTERVIEW_DIR)
  ];
  
  console.log(`Found ${pdfs.length} PDFs to rebrand.`);
  for (const pdf of pdfs) {
    await watermarkPDF(pdf);
  }
  console.log('All PDF rebranding tasks completed successfully!');
}

run();
