import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { Document, Packer, Paragraph, ImageRun } from 'docx';
import pptxgen from 'pptxgenjs';
import { PdfPageInfo } from '../types';

/**
 * Modern bundler-friendly way to load the worker from the local node_modules.
 */
try {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
} catch (e) {
  // Fallback for environments where import.meta.url might fail
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;
}

export const loadPdf = async (file: File): Promise<PdfPageInfo[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pdfjsDoc = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  
  const pages: PdfPageInfo[] = [];
  const pageCount = pdfDoc.getPageCount();

  for (let i = 0; i < pageCount; i++) {
    const subDoc = await PDFDocument.create();
    const [copiedPage] = await subDoc.copyPages(pdfDoc, [i]);
    subDoc.addPage(copiedPage);
    const pdfBytes = await subDoc.save();
    // Wrap in Uint8Array to satisfy TypeScript's BlobPart type constraint with pdf-lib's Uint8Array<ArrayBufferLike>
    const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

    const page = await pdfjsDoc.getPage(i + 1);
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport, canvas }).promise;
      const thumbnail = canvas.toDataURL('image/png');
      
      pages.push({
        index: i,
        thumbnail,
        blob: pdfBlob,
        width: viewport.width,
        height: viewport.height
      });
    }
  }
  
  return pages;
};

export const convertToImage = async (pdfBlob: Blob): Promise<string> => {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfjsDoc = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const page = await pdfjsDoc.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 }); 
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  await page.render({ canvasContext: context, viewport, canvas }).promise;
  return canvas.toDataURL('image/png');
};

export const convertToWord = async (imageUri: string): Promise<Blob> => {
  const response = await fetch(imageUri);
  const buffer = await response.arrayBuffer();
  
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                data: buffer,
                type: 'png',
                transformation: {
                  width: 600,
                  height: 800,
                },
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};

export const convertToPptx = async (imageUri: string): Promise<Blob> => {
  const pres = new pptxgen();
  const slide = pres.addSlide();
  slide.addImage({ data: imageUri, x: 0, y: 0, w: '100%', h: '100%' });
  const buffer = await pres.write({ outputType: 'arraybuffer' }) as ArrayBuffer;
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};