# MindMapper: Interactive Mind Map Generator

---

## Overview

MindMapper is an AI-powered tool that transforms any prompt into an interactive, visually appealing mind map. Built with Next.js and React Flow, it provides an intuitive interface for exploring complex topics through connected concepts.

## Features

- **AI-Powered Generation**: Convert any text prompt into a structured mind map
- **Interactive Visualization**: Drag, expand, and connect nodes to customize your mind map
- **Detailed Information**: Click on any node to reveal detailed descriptions and context
- **Custom Connections**: Create your own connections between related concepts
- **Export Capability**: Save your mind maps as high-quality PNG images
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Dark Mode Interface**: Easy on the eyes with an elegant dark theme


## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Visualization**: React Flow for node-based visualization
- **AI Integration**: Google Gemini API for content generation
- **Styling**: shadcn/ui components for consistent design
- **State Management**: React hooks for local state management


## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Google Gemini API key


### Installation

1. Clone the repository:

```shellscript
git clone https://github.com/17arhaan/Mind_Mapper.git
cd mindmapper
```


2. Install dependencies:

```shellscript
npm install
# or
yarn install
```


3. Create a `.env.local` file in the root directory and add your Gemini API key:

```plaintext
GEMINI_API_KEY=your_api_key_here
```


4. Start the development server:

```shellscript
npm run dev
# or
yarn dev
```


5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## Usage

1. Enter any topic, question, or concept in the input field
2. Click "Generate Mind Map" or press Enter
3. Explore the generated mind map:

1. Click on nodes to expand and view detailed information
2. Drag nodes to reposition them
3. Create new connections by dragging from node handles



4. Export your mind map as a PNG image using the export button


## Project Structure

```plaintext
mindmapper/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── custom-node.tsx   # Custom node component
│   ├── custom-edge.tsx   # Custom edge component
│   ├── mind-mapper.tsx   # Main mind mapper component
│   └── mind-map-dialog.tsx # Dialog for displaying mind maps
├── lib/                  # Utility functions and types
│   ├── mind-map-generator.ts # Mind map generation logic
│   ├── prompt-analyzer.ts    # Prompt analysis utilities
│   └── types.ts          # TypeScript type definitions
└── public/               # Static assets
```

## Future Enhancements

- Save mind maps to user accounts
- Collaborative editing features
- Additional export formats (SVG, PDF)
- Template library for common mind map structures
- Enhanced customization options for nodes and connections


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React Flow](https://reactflow.dev/) for the powerful node-based visualization library
- [Google Gemini API](https://ai.google.dev/) for AI-powered content generation
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) for the React framework


---

Developed with ❤️ by [Arhaan Girdhar](https://github.com/17arhaan)
