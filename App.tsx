import React, { useState, useRef } from 'react';
import { 
  FileUp, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  Presentation, 
  Cpu, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  Trash2,
  FileIcon,
  CheckCircle,
  Square,
  CheckSquare,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { PdfPageInfo, ExportFormat, AnalysisResult } from './types';
import { loadPdf, convertToImage, convertToWord, convertToPptx, downloadBlob } from './services/pdfService';
import { analyzePage } from './services/geminiService';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PdfPageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<Record<number, AnalysisResult>>({});
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if AI is enabled (not on GitHub Pages demo)
  const isAIEnabled = import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'disabled';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setIsLoading(true);
      setFile(selectedFile);
      setSelectedIndices(new Set());
      try {
        const loadedPages = await loadPdf(selectedFile);
        setPages(loadedPages);
      } catch (err) {
        console.error("Error loading PDF", err);
        alert("Failed to process PDF. Please try another file.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const reset = () => {
    setFile(null);
    setPages([]);
    setAnalysis({});
    setSelectedIndices(new Set());
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const selectAll = () => {
    setSelectedIndices(new Set(pages.map(p => p.index)));
  };

  const deselectAll = () => {
    setSelectedIndices(new Set());
  };

  const handleExport = async (page: PdfPageInfo, format: ExportFormat) => {
    setProcessingId(page.index);
    try {
      const highResImage = await convertToImage(page.blob);
      let outBlob: Blob;
      let extension: string;

      switch (format) {
        case ExportFormat.IMAGE:
          outBlob = await (await fetch(highResImage)).blob();
          extension = 'png';
          break;
        case ExportFormat.WORD:
          outBlob = await convertToWord(highResImage);
          extension = 'docx';
          break;
        case ExportFormat.PPTX:
          outBlob = await convertToPptx(highResImage);
          extension = 'pptx';
          break;
        case ExportFormat.PDF:
        default:
          outBlob = page.blob;
          extension = 'pdf';
          break;
      }

      downloadBlob(outBlob, `page_${page.index + 1}.${extension}`);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleBatchExport = async (format: ExportFormat) => {
    if (selectedIndices.size === 0) return;
    setIsBatchProcessing(true);
    try {
      for (const index of selectedIndices) {
        const page = pages.find(p => p.index === index);
        if (page) await handleExport(page, format);
      }
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleAIAnalyze = async (page: PdfPageInfo) => {
    setProcessingId(page.index);
    try {
      const highResImage = await convertToImage(page.blob);
      const result = await analyzePage(highResImage);
      setAnalysis(prev => ({ ...prev, [page.index]: result }));
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleBatchAIAnalyze = async () => {
    if (selectedIndices.size === 0) return;
    setIsBatchProcessing(true);
    try {
      for (const index of selectedIndices) {
        const page = pages.find(p => p.index === index);
        if (page && !analysis[index]) {
          await handleAIAnalyze(page);
        }
      }
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const isSelected = (index: number) => selectedIndices.has(index);

  const handleCardKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleSelection(index);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-44 md:pb-32">
      {/* Promotional Banner */}
      {!isAIEnabled && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 md:p-6 text-white shadow-xl animate-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shrink-0">
                <Cpu size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-black text-lg md:text-xl mb-1">🚀 Want AI-Powered Analysis?</h2>
                <p className="text-blue-100 text-sm md:text-base">
                  Get intelligent page summaries and keyword extraction with our full app!
                </p>
              </div>
            </div>
            <a
              href="https://pdfslicendice.sjdev.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm md:text-base hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              Try Full App
              <ChevronRight size={20} />
            </a>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="mb-10 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 group">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-xl shadow-blue-200 transition-transform group-hover:scale-105 group-hover:-rotate-3">
              <Layers size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              SLICE<span className="text-blue-600 tracking-widest">&</span>DICE
            </h1>
          </div>
          <p className="text-slate-500 text-base md:text-lg font-medium max-w-lg leading-relaxed">
            Professional PDF extraction tool with AI-powered insights and multi-format conversion.
          </p>
        </div>
        
        {file && (
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onClick={pages.length === selectedIndices.size ? deselectAll : selectAll}
              className="dice-button-secondary flex-1 md:flex-none justify-center"
              aria-label={pages.length === selectedIndices.size ? "Deselect all pages" : "Select all pages"}
            >
              {pages.length === selectedIndices.size ? <XCircle size={18} /> : <CheckCircle size={18} />}
              <span className="hidden sm:inline">{pages.length === selectedIndices.size ? 'Deselect All' : 'Select All'}</span>
              <span className="sm:hidden">{pages.length === selectedIndices.size ? 'None' : 'All'}</span>
            </button>
            <button 
              onClick={reset}
              className="dice-button-secondary text-red-600 border-red-100 bg-red-50/50 hover:bg-red-50 hover:border-red-200 hover:text-red-700 flex-1 md:flex-none justify-center"
              aria-label="Clear document and reset"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Clear Document</span>
              <span className="sm:hidden">Reset</span>
            </button>
          </div>
        )}
      </header>

      {!file ? (
        /* Upload Area */
        <div 
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') fileInputRef.current?.click(); }}
          role="button"
          tabIndex={0}
          aria-label="Click or press enter to upload a PDF file"
          className="relative group max-w-3xl mx-auto cursor-pointer outline-none"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 bg-white rounded-2xl py-16 px-6 md:py-24 md:px-12 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 focus-visible:ring-4 focus-visible:ring-blue-500/30">
            <div className="bg-slate-50 p-6 rounded-2xl mb-8 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-500 shadow-sm">
              <FileUp className="w-12 h-12 md:w-16 md:h-16 text-blue-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Load your PDF</h2>
            <p className="text-slate-500 mt-3 max-w-md text-base md:text-lg leading-relaxed">
              {isAIEnabled 
                ? 'Extract slides, convert to Word/PPTX, or let AI summarize your content.'
                : 'Extract slides and convert to Word/PPTX.'}
            </p>
            
            <div className="mt-8 md:mt-10 flex flex-wrap justify-center gap-3">
              {(isAIEnabled 
                ? ['Batch Operations', 'Local Processing', 'AI Powered']
                : ['Batch Operations', 'Local Processing']
              ).map((tag) => (
                <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-10 md:mt-12 dice-button-primary w-full md:w-auto md:text-lg px-8 py-4 group-hover:shadow-blue-500/30">
              Select PDF File
              <ChevronRight size={20} />
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden" 
              aria-hidden="true"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* Sidebar Properties */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-8 order-2 lg:order-1">
            <div className="dice-card p-5 md:p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-xs uppercase tracking-widest border-b border-slate-100 pb-3">
                <FileIcon className="text-blue-600" size={16} />
                File Properties
              </h3>
              <div className="space-y-4">
                <DetailRow label="Filename" value={file.name} truncate />
                <DetailRow label="Page Count" value={pages.length.toString()} />
                <DetailRow label="Selection" value={`${selectedIndices.size} pages`} highlight={selectedIndices.size > 0} />
                <DetailRow label="File Size" value={`${(file.size / 1024 / 1024).toFixed(2)} MB`} />
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl ring-1 ring-white/10 hidden lg:block">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <Cpu size={18} />
                <span className="font-bold text-[10px] uppercase tracking-widest">Power Tip</span>
              </div>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                Use <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">Space</kbd> to toggle selection on focused cards. Select multiple pages to unlock the batch toolbar below.
              </p>
            </div>
          </div>

          {/* Grid Content */}
          <div className="lg:col-span-9 order-1 lg:order-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-slate-200 shadow-sm text-center px-4">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl animate-pulse rounded-full"></div>
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative" />
                </div>
                <h3 className="text-slate-900 font-bold text-xl mb-2">Processing Document</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  We are rendering high-quality thumbnails locally in your browser.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pages.map((page) => (
                  <div 
                    key={page.index}
                    role="checkbox"
                    aria-checked={isSelected(page.index)}
                    tabIndex={0}
                    onKeyDown={(e) => handleCardKeyDown(e, page.index)}
                    className={`dice-card group flex flex-col cursor-pointer overflow-hidden ${
                      isSelected(page.index) 
                        ? 'ring-2 ring-blue-500 border-transparent shadow-lg shadow-blue-100' 
                        : 'hover:border-blue-300 hover:shadow-md'
                    }`}
                    onClick={() => toggleSelection(page.index)}
                  >
                    {/* Thumbnail Section */}
                    <div className="relative aspect-[4/3] bg-slate-100 border-b border-slate-100">
                      <img 
                        src={page.thumbnail} 
                        alt={`Preview of page ${page.index + 1}`} 
                        className={`w-full h-full object-contain transition-transform duration-500 ${isSelected(page.index) ? 'scale-90 p-4' : 'group-hover:scale-105'}`}
                      />
                      
                      {/* Overlay Controls */}
                      <div className="absolute inset-x-0 top-0 p-3 flex justify-between items-start pointer-events-none">
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm backdrop-blur-sm pointer-events-auto
                          ${isSelected(page.index) ? 'bg-blue-600 text-white' : 'bg-white/90 text-slate-400 group-hover:bg-white'}
                        `}>
                          {isSelected(page.index) ? <CheckSquare size={18} strokeWidth={3} /> : <Square size={18} />}
                        </div>
                        <span className="bg-slate-900/90 backdrop-blur text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm uppercase tracking-wider">
                          P.{page.index + 1}
                        </span>
                      </div>

                      {processingId === page.index && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
                          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Processing</span>
                        </div>
                      )}
                    </div>

                    {/* Actions Section */}
                    <div className="p-4 flex-1 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-2">
                        <ActionButton 
                          icon={<FileText size={14} />} 
                          label="PDF" 
                          onClick={() => handleExport(page, ExportFormat.PDF)}
                          disabled={processingId !== null || isBatchProcessing}
                        />
                        <ActionButton 
                          icon={<ImageIcon size={14} />} 
                          label="IMG" 
                          onClick={() => handleExport(page, ExportFormat.IMAGE)}
                          disabled={processingId !== null || isBatchProcessing}
                        />
                        <ActionButton 
                          icon={<FileText size={14} />} 
                          label="DOC" 
                          onClick={() => handleExport(page, ExportFormat.WORD)}
                          disabled={processingId !== null || isBatchProcessing}
                        />
                        <ActionButton 
                          icon={<Presentation size={14} />} 
                          label="PPT" 
                          onClick={() => handleExport(page, ExportFormat.PPTX)}
                          disabled={processingId !== null || isBatchProcessing}
                        />
                      </div>

                      <button 
                        onClick={() => handleAIAnalyze(page)}
                        disabled={!isAIEnabled || processingId !== null || isBatchProcessing}
                        className="w-full py-3 bg-blue-50/80 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!isAIEnabled ? "AI features available in full app" : ""}
                      >
                        <Cpu size={14} />
                        Gemini Insight
                      </button>

                      {analysis[page.index] && (
                        <div className="mt-auto pt-3 border-t border-slate-100 animate-in slide-in-from-top-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 mb-2 uppercase tracking-tighter">
                            <CheckCircle2 size={12} />
                            Analysis Ready
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed italic mb-2 line-clamp-3">
                            "{analysis[page.index].summary}"
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis[page.index].keywords.slice(0, 3).map((kw, i) => (
                              <span key={i} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase border border-slate-200">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Floating Batch Toolbar */}
      {selectedIndices.size > 0 && !isLoading && (
         <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-50 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-4 md:gap-6 border border-white/10 ring-1 ring-black/10 mx-auto max-w-2xl">
                
                {/* Batch Status Header */}
                <div className="flex items-center justify-between w-full md:w-auto gap-4 border-b md:border-b-0 border-white/10 pb-3 md:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-1.5 rounded-lg shrink-0">
                      <CheckCircle2 size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-0.5">Selection</p>
                      <p className="text-base font-bold leading-none whitespace-nowrap">{selectedIndices.size} <span className="text-slate-400 text-xs font-normal">Pages</span></p>
                    </div>
                  </div>
                  <button 
                    onClick={deselectAll}
                    className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
                    aria-label="Close selection"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <div className="h-8 w-px bg-white/10 hidden md:block"></div>

                {/* Batch Actions Scrollable Area */}
                <div className="flex items-center justify-between w-full md:w-auto gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                  <div className="flex gap-2">
                    <BatchButton 
                      icon={isBatchProcessing ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                      label="PDF"
                      onClick={() => handleBatchExport(ExportFormat.PDF)}
                      disabled={isBatchProcessing}
                    />
                    <BatchButton 
                      icon={isBatchProcessing ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                      label="IMG"
                      onClick={() => handleBatchExport(ExportFormat.IMAGE)}
                      disabled={isBatchProcessing}
                    />
                    <BatchButton 
                      icon={isBatchProcessing ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                      label="DOC"
                      onClick={() => handleBatchExport(ExportFormat.WORD)}
                      disabled={isBatchProcessing}
                    />
                     <BatchButton 
                      icon={isBatchProcessing ? <Loader2 className="animate-spin" size={16} /> : <Presentation size={16} />}
                      label="PPT"
                      onClick={() => handleBatchExport(ExportFormat.PPTX)}
                      disabled={isBatchProcessing}
                    />
                  </div>
                  
                  <div className="w-px h-6 bg-white/10 mx-2 hidden md:block"></div>
                  
                  <button 
                    onClick={handleBatchAIAnalyze}
                    disabled={!isAIEnabled || isBatchProcessing}
                    className="ml-auto md:ml-0 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 uppercase tracking-widest whitespace-nowrap ring-offset-slate-900 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none disabled:cursor-not-allowed"
                    title={!isAIEnabled ? "AI features available in full app" : ""}
                  >
                    {isBatchProcessing ? <Loader2 className="animate-spin" size={14} /> : <Cpu size={14} />}
                    AI Batch
                  </button>
                </div>

                <button 
                  onClick={deselectAll}
                  className="hidden md:block p-2 hover:bg-white/10 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
                  title="Deselect All"
                >
                  <XCircle size={20} className="text-slate-400" />
                </button>
            </div>
         </div>
      )}
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string; truncate?: boolean; highlight?: boolean }> = ({ label, value, truncate, highlight }) => (
  <div className="flex flex-row justify-between items-center md:flex-col md:items-start gap-0.5 w-full">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className={`text-sm font-bold ${highlight ? 'text-blue-600' : 'text-slate-700'} ${truncate ? 'truncate max-w-[150px]' : ''}`}>{value}</span>
  </div>
);

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, disabled }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    disabled={disabled}
    className="dice-action-btn disabled:opacity-50 disabled:cursor-not-allowed w-full"
    aria-label={`Export as ${label}`}
  >
    {icon}
    {label}
  </button>
);

const BatchButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-bold uppercase tracking-widest border border-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    aria-label={`Batch export as ${label}`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default App;