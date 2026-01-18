# Run and deploy your AI Studio app

This app provides professional PDF extraction with AI-powered insights. The PDF processing (splitting, editing, conversion) runs entirely in your browser for offline use, while AI analysis features require a backend service to keep API keys secure.

View your app in AI Studio: https://ai.studio/apps/drive/1DuUT1CmF_CY6ZhEV9hmnU6-L9QsEcIvr

## Features

- **Offline PDF Processing**: Split, edit, and convert PDFs to different formats (Image, Word, PowerPoint) - works entirely in your browser
- **Secure AI Analysis**: Get AI-powered summaries and keywords through a secure backend service
- **Batch Operations**: Process multiple pages at once

## Run Locally

**Prerequisites:**  Node.js (v16 or higher)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy the template file and add your Gemini API key:
```bash
cp .env.local.template .env.local
```

Edit `.env.local` and set:
- `GEMINI_API_KEY`: Your Gemini API key from https://aistudio.google.com/app/apikey
- `VITE_BACKEND_URL`: Backend URL (defaults to http://localhost:3001)

### 3. Run the backend service
In one terminal, start the backend server:
```bash
npm run server:dev
```

The backend will run on http://localhost:3001

### 4. Run the frontend
In another terminal, start the frontend:
```bash
npm run dev
```

The app will be available at http://localhost:5173

## Architecture

### Frontend (Client-side)
- PDF loading and rendering
- Page extraction and splitting
- Format conversion (PDF → Image, Word, PowerPoint)
- Works offline once loaded

### Backend (Server-side)
- Gemini API integration
- AI-powered content analysis
- Secure API key handling

## Security

The Gemini API key is stored **only** on the backend server and never exposed to the frontend. This prevents:
- API key exposure in browser code
- Unauthorized API usage
- Key theft from client-side code

1. Install dependencies:
   `npm install`
2. Set the `VITE_GEMINI_API_KEY` in `.env.local` to your Gemini API key (copy from `.env.local.template`)
3. Run the app:
   `npm run dev`

## Testing

This project includes a comprehensive test suite using Vitest and React Testing Library.

**Run tests:**
```bash
npm test          # Run tests in watch mode
npm run test:run  # Run tests once
npm run test:ui   # Run tests with UI
```

Tests are automatically run on every push and pull request via GitHub Actions CI.

See [tests/README.md](tests/README.md) for more details.

## Building

Build the production version:
```bash
npm run build
```
All core PDF features work offline without requiring the backend.
