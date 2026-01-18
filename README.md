<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1DuUT1CmF_CY6ZhEV9hmnU6-L9QsEcIvr

## Run Locally

**Prerequisites:**  Node.js


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
