import { PDFDocument, rgb ,StandardFonts }  from "pdf-lib";
import fs from "fs";
const fsNew=fs.promises


import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
async function generatePDF(date,customer_name,customer_email,amount,utr,payment_no) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 300]);

  const { width, height } = page.getSize();
  
  const fontSize = 12;
  const textLineHeight = 15;
  const x = 50;
  let y = height - 50;
  page.drawText(`Payment Receipt ${payment_no}`, { x, y, size: 16, color: rgb(0, 0, 0) });
  y -= textLineHeight;
  page.drawText(`Date: ${date}`, { x, y, size: fontSize, color: rgb(0, 0, 0) });
  y -= textLineHeight;
  page.drawText(`Amount: Rs ${amount}`, { x, y, size: fontSize, color: rgb(0, 0, 0) });
  y -= textLineHeight;
  page.drawText(`Payment UTR: ${utr}`, { x, y, size: fontSize, color: rgb(0, 0, 0) });
  y -= textLineHeight;
  page.drawText(`Customer Name: ${customer_name}`, { x, y, size: fontSize, color: rgb(0, 0, 0) });
  y -= textLineHeight;
  

  // Save the PDF to a file
  const pdfBytes = await pdfDoc.save();
  
 
  return {content:pdfBytes}
}



export {generatePDF}
