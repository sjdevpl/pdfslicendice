import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the services to avoid actual API calls and PDF processing
vi.mock('../services/pdfService', () => ({
  loadPdf: vi.fn(),
  convertToImage: vi.fn(),
  convertToWord: vi.fn(),
  convertToPptx: vi.fn(),
  downloadBlob: vi.fn(),
}));

vi.mock('../services/geminiService', () => ({
  analyzePage: vi.fn(),
}));

describe('App Component', () => {
  it('should render the app title', () => {
    render(<App />);
    expect(screen.getByText(/SLICE/i)).toBeInTheDocument();
    expect(screen.getByText(/&/)).toBeInTheDocument();
    expect(screen.getByText(/DICE/i)).toBeInTheDocument();
  });

  it('should render the upload area when no file is loaded', () => {
    render(<App />);
    expect(screen.getByText(/Load your PDF/i)).toBeInTheDocument();
  });

  it('should render file input element', () => {
    render(<App />);
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', '.pdf');
  });

  it('should render the "Select PDF File" button', () => {
    render(<App />);
    expect(screen.getByText('Select PDF File')).toBeInTheDocument();
  });

  it('should have proper description text', () => {
    render(<App />);
    expect(screen.getByText(/Professional PDF extraction tool with AI-powered insights and multi-format conversion/i)).toBeInTheDocument();
  });

  describe('when AI is enabled', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');
    });

    it('should show AI-enabled description text', () => {
      render(<App />);
      expect(screen.getByText(/Extract slides, convert to Word\/PPTX, or let AI summarize your content/i)).toBeInTheDocument();
    });

    it('should show AI Powered tag in upload area', () => {
      render(<App />);
      expect(screen.getByText('Batch Operations')).toBeInTheDocument();
      expect(screen.getByText('Local Processing')).toBeInTheDocument();
      expect(screen.getByText('AI Powered')).toBeInTheDocument();
    });

    it('should not show promotional banner', () => {
      render(<App />);
      expect(screen.queryByText(/Want AI-Powered Analysis/i)).not.toBeInTheDocument();
    });
  });

  describe('when AI is disabled', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'disabled');
    });

    it('should show non-AI description text', () => {
      render(<App />);
      expect(screen.getByText(/Extract slides and convert to Word\/PPTX\./i)).toBeInTheDocument();
    });

    it('should not show AI Powered tag in upload area', () => {
      render(<App />);
      expect(screen.getByText('Batch Operations')).toBeInTheDocument();
      expect(screen.getByText('Local Processing')).toBeInTheDocument();
      expect(screen.queryByText('AI Powered')).not.toBeInTheDocument();
    });

    it('should show promotional banner', () => {
      render(<App />);
      expect(screen.getByText(/Want AI-Powered Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/Get intelligent page summaries and keyword extraction with our full app/i)).toBeInTheDocument();
    });

    it('should show link to full app in promotional banner', () => {
      render(<App />);
      const link = screen.getByRole('link', { name: /Try Full App/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://pdfslicendice.sjdev.pl');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });
});
