# PresentBuddy Website

The official website for PresentBuddy, built with Next.js and following the Neo-Brutalism design system.

## Design System

This website follows a strict Neo-Brutalism design language:
- High contrast (black and white)
- Thick 4px borders
- No rounded corners
- Offset shadows (not soft/blurred)
- Bold typography (font-black for headings, font-bold for body)
- Yellow (#FDE047) accent color

See `DESIGN_SYSTEM.md` for complete design guidelines.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## Project Structure

```
website/
├── app/
│   ├── globals.css          # Design system CSS variables and utilities
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page implementation
├── components/
│   └── ui/
│       ├── button.tsx       # Button component with brutal styling
│       └── card.tsx         # Card component with brutal styling
└── lib/
    └── utils.ts             # Utility functions
```

## License

MIT

