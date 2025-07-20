# Memory Matching Game

## Overview

This is a browser-based memory matching card game built with vanilla HTML, CSS, and JavaScript. Players flip cards to find matching pairs, tracking their time, number of tries, and progress. The game features a clean, modern interface with gradient backgrounds and uses Feather icons for card symbols.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Pure client-side application with no backend dependencies
- **Vanilla JavaScript**: Object-oriented approach using ES6 classes for game logic
- **Component Structure**: Modular design with clear separation between game logic and UI rendering
- **CSS3 Styling**: Modern CSS with gradients, backdrop filters, and responsive design

### Game Engine
- **Class-based Architecture**: `MemoryGame` class encapsulates all game state and logic
- **Event-driven Programming**: DOM event listeners handle user interactions
- **State Management**: Internal game state tracking for cards, matches, timer, and game progress

## Key Components

### Core Game Logic (`script.js`)
- **MemoryGame Class**: Main game controller handling:
  - Card creation and shuffling
  - Game state management (flipped cards, matches, tries)
  - Timer functionality
  - Victory condition detection
  - UI updates and event handling

### User Interface (`index.html`)
- **Game Header**: Title, statistics display, and restart button
- **Game Board**: Dynamic 4x4 grid for card layout
- **Victory Modal**: Popup displaying final game statistics
- **Responsive Layout**: Adaptive design for different screen sizes

### Styling (`style.css`)
- **Modern Design**: Gradient backgrounds and glassmorphism effects
- **Card Animations**: Flip transitions and hover effects
- **Responsive Grid**: CSS Grid layout for card arrangement
- **Visual Feedback**: Color coding for different card states

## Data Flow

1. **Game Initialization**:
   - Create card pairs with Feather icon symbols
   - Shuffle card array for random placement
   - Render cards to DOM
   - Initialize event listeners

2. **Card Interaction Flow**:
   - User clicks card → Card flips → Check for matches
   - If two cards flipped → Compare symbols
   - Match found → Keep cards revealed, increment score
   - No match → Flip cards back after delay
   - Update statistics and check victory condition

3. **Game State Updates**:
   - Timer updates every second once game starts
   - Try counter increments on each pair attempt
   - Match counter updates when pairs are found
   - Victory modal displays when all pairs matched

## External Dependencies

### Third-party Libraries
- **Feather Icons**: Icon library loaded via CDN for card symbols
  - Used for: Visual representation of card symbols
  - Integration: Script tag in HTML head, JavaScript API calls

### Browser APIs
- **DOM Manipulation**: Native DOM APIs for element creation and updates
- **Timer Functions**: `setInterval` for game timer functionality
- **Event System**: Native event listeners for user interactions

## Deployment Strategy

### Static Hosting
- **No Server Required**: Pure client-side application
- **File Structure**: Simple three-file setup (HTML, CSS, JS)
- **CDN Dependencies**: External resources loaded from unpkg.com
- **Browser Compatibility**: Modern browsers supporting ES6 features

### Deployment Options
- **Static Site Hosts**: Can be deployed to GitHub Pages, Netlify, Vercel
- **Local Serving**: Can run directly from file system or local server
- **No Build Process**: Ready to deploy without compilation or bundling

### Performance Considerations
- **Lightweight**: Minimal resource requirements
- **Fast Loading**: Small file sizes and minimal dependencies
- **Client-side Only**: No server requests after initial load