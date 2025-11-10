# Unified AI Project

This is a unified application that combines both **MentaLLaMA** and **SereneMind** projects into a single application.

## Features

When you run the application, you'll be presented with a landing page where you can choose between:

1. **MentaLLaMA** - An empathetic AI mental health companion with:
   - Chat interface with history & sessions
   - Emotion analysis
   - Coping strategies
   - Theme customization

2. **SereneMind** - An AI companion for mental well-being with:
   - Voice call support
   - Text chat interface
   - Text-to-speech capabilities

Both projects maintain all their original functionalities and work exactly as they did when running separately.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   Create a `.env.local` file in the root directory and add:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the application:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. When you first open the application, you'll see a landing page with two project options
2. Click on either "Launch MentaLLaMA" or "Launch SereneMind" to enter the respective project
3. Use the "Back" button in the top-left corner to return to the project selection page
4. Each project works independently with its own features and state

## Project Structure

```
unified-app/
├── src/
│   ├── components/
│   │   └── LandingPage.tsx      # Landing page with project selection
│   ├── mentallama/              # MentaLLaMA project files
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── ...
│   ├── serenemind/              # SereneMind project files
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── utils/
│   │   └── ...
│   ├── App.tsx                  # Main app with routing
│   └── index.tsx                # Entry point
├── public/
│   └── index.css
├── package.json
├── vite.config.ts
└── index.html
```

## Development

- The app runs on port 3000 by default
- Both projects share the same API key configuration
- Each project maintains its own state and functionality
- All original features from both projects are preserved

## Notes

- Both projects are AI-powered tools and not substitutes for professional medical advice
- Make sure to set your `GEMINI_API_KEY` in the `.env.local` file before running
- The back button allows you to switch between projects without reloading the page

