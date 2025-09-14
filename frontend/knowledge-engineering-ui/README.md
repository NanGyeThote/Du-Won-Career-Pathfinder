# Knowledge Engineering UI

A React-based user interface for a university knowledge engineering project focused on career guidance and developer insights.

## Features

- **Two Main Sections**:
  - Career Guidance: Personalized career path recommendations
  - Developer Insights: Technical documentation and knowledge base access

- **Interactive Design**:
  - Hover effects on cards
  - Click to expand sections to full screen
  - Smooth animations and transitions
  - Responsive design

- **Design System**:
  - Custom color tokens for different sections
  - Gradient backgrounds
  - Modern glassmorphism effects

## Project Structure

```
knowledge-engineering-ui/
├── src/
│   ├── components/
│   │   ├── KnowledgeEngineeringSystem.tsx  # Main component
│   │   └── SectionCard.tsx                 # Interactive card component
│   ├── lib/
│   │   └── utils.ts                        # Utility functions
│   └── styles/
│       └── index.css                       # Design system & styles
├── tailwind.config.js                      # Tailwind configuration
├── package.json                            # Dependencies
└── README.md                              # This file
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Usage

Import and use the main component:

```tsx
import KnowledgeEngineeringSystem from './components/KnowledgeEngineeringSystem';

function App() {
  return <KnowledgeEngineeringSystem />;
}
```

## Customization

- **Colors**: Modify CSS variables in `src/styles/index.css`
- **Animations**: Update Tailwind config in `tailwind.config.js`
- **Content**: Edit descriptions and titles in component props

## University Project

This UI was created for the University of Information Technology's Knowledge Engineering Project, focusing on AI-powered career guidance and technical insights.