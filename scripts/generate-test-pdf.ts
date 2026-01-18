import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Cleans text by removing emojis and special characters that can't be encoded in PDF
 */
function cleanText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove emojis and special Unicode characters that can't be encoded
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emojis
    .replace(/[\u{2600}-\u{26FF}]/gu, '') // Miscellaneous symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '') // Variation selectors
    .replace(/[\u{200D}]/gu, '') // Zero-width joiner
    .replace(/[\u{200B}-\u{200D}]/gu, '') // Zero-width spaces
    .replace(/✅/g, '[OK]')
    .replace(/❌/g, '[X]')
    .replace(/📄/g, '[PDF]')
    .replace(/🖼️/g, '[IMG]')
    .replace(/📝/g, '[DOC]')
    .replace(/📊/g, '[PPT]')
    .replace(/🤖/g, '[AI]')
    .replace(/🔍/g, '[SEARCH]')
    .replace(/🚀/g, '[ROCKET]')
    .replace(/🌐/g, '[WEB]')
    .replace(/✨/g, '[STAR]')
    // Remove any remaining non-ASCII characters that can't be encoded
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Try to map common characters, otherwise remove
      const charMap: Record<string, string> = {
        '\u2014': '--',  // em dash
        '\u2013': '-',   // en dash
        '\u201C': '"',   // left double quote
        '\u201D': '"',   // right double quote
        '\u2018': "'",   // left single quote
        '\u2019': "'",   // right single quote
        '\u2026': '...', // ellipsis
      };
      return charMap[char] || '';
    })
    .trim();
}

/**
 * Generates a test PDF file from README.md
 * This creates a multi-page PDF with the README content for testing purposes
 */
async function generateTestPdf() {
  try {
    // Read README.md
    const readmePath = join(process.cwd(), 'README.md');
    const readmeContent = readFileSync(readmePath, 'utf-8');
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // PDF page dimensions (A4)
    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 50;
    const lineHeight = 20;
    const fontSize = 12;
    const titleFontSize = 16;
    
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;
    
    // Split content into lines and process
    const lines = readmeContent.split('\n');
    
    for (const line of lines) {
      // Check if we need a new page
      if (yPosition < margin + lineHeight) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
      }
      
      // Skip empty lines (but add some spacing)
      if (line.trim() === '') {
        yPosition -= lineHeight * 0.5;
        continue;
      }
      
      // Detect markdown headers
      if (line.startsWith('# ')) {
        // Main title
        const text = cleanText(line.substring(2));
        currentPage.drawText(text, {
          x: margin,
          y: yPosition,
          size: titleFontSize + 4,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight * 2;
      } else if (line.startsWith('## ')) {
        // Section header
        const text = cleanText(line.substring(3));
        currentPage.drawText(text, {
          x: margin,
          y: yPosition,
          size: titleFontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight * 1.5;
      } else if (line.startsWith('### ')) {
        // Subsection header
        const text = cleanText(line.substring(4));
        currentPage.drawText(text, {
          x: margin,
          y: yPosition,
          size: fontSize + 2,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight * 1.2;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // List item
        const text = cleanText(line.substring(2));
        currentPage.drawText(`• ${text}`, {
          x: margin + 20,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;
      } else if (line.startsWith('```')) {
        // Code block marker - skip or add visual separator
        yPosition -= lineHeight * 0.5;
      } else {
        // Regular text
        const cleanedLine = cleanText(line);
        
        // Handle long lines by wrapping
        const maxWidth = pageWidth - (margin * 2);
        const words = cleanedLine.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (textWidth > maxWidth && currentLine) {
            // Draw current line and start new one
            currentPage.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight;
            
            // Check if we need a new page
            if (yPosition < margin + lineHeight) {
              currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
              yPosition = pageHeight - margin;
            }
            
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        // Draw remaining line
        if (currentLine) {
          currentPage.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
        }
      }
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Create fixtures directory if it doesn't exist
    const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
    mkdirSync(fixturesDir, { recursive: true });
    
    // Write PDF file
    const outputPath = join(fixturesDir, 'test.pdf');
    writeFileSync(outputPath, pdfBytes);
    
    console.log(`✅ Test PDF generated successfully: ${outputPath}`);
    console.log(`   Pages: ${pdfDoc.getPageCount()}`);
    console.log(`   Size: ${(pdfBytes.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Error generating test PDF:', error);
    process.exit(1);
  }
}

generateTestPdf();
