# FLASHion Frontend

This is the frontend application for FLASHion, a virtual makeup try-on platform.

## Features

- Virtual makeup try-on using camera or uploaded photos
- Modern, responsive UI built with Material-UI
- Smooth animations with Framer Motion
- TypeScript for type safety

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Project Structure

```
frontend/
├── public/              # Static files
├── src/                 # Source code
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── App.tsx         # Main App component
│   └── index.tsx       # Entry point
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Dependencies

- React
- Material-UI
- Framer Motion
- TypeScript
- React Router 