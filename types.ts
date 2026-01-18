
export enum ExportFormat {
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  WORD = 'WORD',
  PPTX = 'PPTX'
}

export interface PdfPageInfo {
  index: number;
  thumbnail: string;
  blob: Blob;
  width: number;
  height: number;
}

export interface AnalysisResult {
  summary: string;
  keywords: string[];
}
