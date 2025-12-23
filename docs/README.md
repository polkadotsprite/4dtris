# GitHub Pages Setup

This directory (`docs/`) is configured to be served via GitHub Pages.

## Enabling GitHub Pages

To enable GitHub Pages for this repository:

1. Go to the repository Settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "Deploy from a branch"
4. Under "Branch", select "main" (or your default branch) and choose "/docs" folder
5. Click "Save"

The site will be available at: `https://polkadotsprite.github.io/4dtris/`

## Local Development

To test locally:

```bash
# Using Python 3
cd docs
python3 -m http.server 8000

# Using Node.js
npx http-server docs -p 8000
```

Then open `http://localhost:8000` in your browser.

## Files Structure

- `index.html` - Main entry point
- `css/` - Stylesheets
- `js/` - JavaScript modules
  - `main.js` - Game controller
  - `engine.js` - Game logic
  - `renderer.js` - Canvas 2D renderer
  - `math4d.js` - 4D math library
- `assets/` - Images and other assets (if any)
- `.nojekyll` - Tells GitHub Pages not to process with Jekyll

## Browser Compatibility

The game uses modern JavaScript features:
- ES6 Modules (import/export)
- Canvas 2D API
- requestAnimationFrame

Supported browsers:
- Chrome/Edge 89+
- Firefox 89+
- Safari 15+
