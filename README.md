   __      ___         ________  ___     __   _____  
 / /__   / _ \  ____ /__   __/\/ _ \   /_/\ / ___/\ 
/_  _/\ / // /\/___/\\_/  /\_\/ _  /\ / /\/_\__ \\/ 
\/_/\\//____/ /\___\/ /__/ / /_//_/\//_/ //_____/\
 \_\/  \____\/        \__\/  \_\\_\/ \_\/ \_____\/  

___________________________________________________________________

# 4DTRIS - Tetris Extended to 4 Dimensions

A challenging puzzle game that extends traditional Tetris into four spatial dimensions!

## 🎮 Play Online

**[Play 4DTRIS now!](https://polkadotsprite.github.io/4dtris/)**

Experience the mind-bending challenge of 4D Tetris directly in your browser - no installation required!

---

## 📖 About

4DTRIS is a Tetris game extended to 4 dimensions, created by Simon Laszlo. This repository contains both the original OpenGL/GLUT desktop version and a modern web-based version that can be played in any browser.

### What is 4D Tetris?

In traditional Tetris, pieces fall on a 2D plane. In 4DTRIS:
- Pieces fall through a **4D hypercube** space (X, Y, Z, W axes)
- The game board is a 2×2×2×2 space extending to 12 levels in the W direction
- You can rotate pieces in **6 different planes** (XY, XZ, XW, YZ, YW, ZW)
- Clear complete 3D "hyperplanes" instead of 2D lines
- Visualized as a 3D projection of the 4D space

---

## 🌐 Web Version

The web version features:

### ✨ Modern Features
- **Browser-based gameplay** - No installation needed
- **Canvas 2D rendering** - Isometric 3D visualization with smooth animations
- **Responsive design** - Works on desktop and mobile devices
- **Intuitive controls** - Keyboard support for all 4D movements and rotations
- **Real-time scoring** - Track score, level, and lines cleared
- **Next piece preview** - Plan your strategy
- **Help system** - Built-in tutorial explaining 4D concepts
- **Visual effects** - Color/opacity gradients to visualize the 4th dimension

### 🎮 How to Play (Web Version)

#### Controls

**Movement (4 axes):**
- `Arrow Keys` - Move in X/Y plane
- `W/S` - Move along Z axis
- `A/D` - Move along W axis (4th dimension!)

**Rotations (6 planes):**
- `Q/E` - Rotate in XY plane
- `Z/X` - Rotate in XZ plane
- `C/V` - Rotate in XW plane (4D rotation!)

**Game Controls:**
- `Space` - Drop piece instantly
- `P` - Pause game

#### Game Objective

Fill complete 3D hyperplanes (all positions at a W-level) to clear them and score points. The game ends when pieces can no longer spawn at the top.

#### Tips for Success
1. Start slowly and understand how pieces move in 4D space
2. Pay attention to the W-axis position (shown by color/opacity)
3. Experiment with 4D rotations (XW, YW, ZW planes)
4. Try to clear multiple hyperplanes at once for bonus points
5. The game speeds up as you level up!

### 🎨 Visualization

The web version uses color and transparency to help visualize the 4th dimension:
- **Brighter/more opaque** blocks are "closer" in the W dimension
- **Dimmer/more transparent** blocks are "farther" in the W dimension
- The camera slowly rotates to give you different perspectives

---

## 💻 Original Desktop Version

The original C++ version uses OpenGL and GLUT for visualization.

### Prerequisites

- C++ compiler (gcc/g++)
- OpenGL
- GLUT (freeglut)
- autotools (for bzr version)

### Installation

#### From bzr version:
```bash
./autogen.sh
./configure
make
make install
```

#### From release:
```bash
./configure
make
make install
```

### Running

```bash
4dtris
```

---

## 🏗️ Technical Details

### Web Version Architecture

The web implementation consists of:

1. **math4d.js** - 4D vector and matrix math library
   - Vector4D class for 4D positions
   - Matrix4D class for 4D transformations
   - Rotation matrices for all 6 planes
   - 4D to 3D projection algorithms

2. **engine.js** - Game logic engine
   - 4D game board representation (2×2×2×12 hypercube)
   - 6 piece types with 1-4 blocks each
   - Collision detection in 4D space
   - Line clearing for complete hyperplanes
   - Scoring and level progression

3. **renderer.js** - Canvas 2D visualization
   - 4D to 3D projection with perspective
   - Isometric rendering style
   - Smooth camera rotation animations
   - W-axis visualization indicators

4. **main.js** - Game controller
   - UI management
   - Input handling
   - Game loop
   - State management

### Piece Types

The game includes 6 types of 4D pieces:
1. **Dot** (1 block) - Single hypercube
2. **Line** (2 blocks) - Two connected blocks
3. **Corner** (3 blocks) - L-shaped configuration
4. **Tetracube-1** (4 blocks) - 2×2 square in one plane
5. **Tetracube-2** (4 blocks) - T-shaped variant
6. **Tetracube-3** (4 blocks) - Z-shaped variant

### 4D Rotations

Unlike 2D Tetris (1 rotation axis) or 3D (3 axes), 4D space has **6 rotation planes**:
- **3D-like rotations:** XY, XZ, YZ
- **4D rotations:** XW, YW, ZW (involve the 4th dimension)

Each rotation is a 90° turn in the specified plane.

---

## 📁 Repository Structure

```
4dtris/
├── src/                  # Original C++ source code
│   ├── 4dt_eng.c/h      # Game engine
│   ├── 4dt_m4d.c/h      # 4D math library
│   ├── 4dt_g3d.c/h      # 3D graphics
│   ├── 4dt_g4d.c/h      # 4D graphics projection
│   └── ...              # Other modules
├── docs/                # Web version (GitHub Pages)
│   ├── index.html       # Main entry point
│   ├── css/
│   │   └── style.css    # Styling
│   └── js/
│       ├── main.js      # Game controller
│       ├── engine.js    # Game logic
│       ├── renderer.js  # Canvas 2D renderer
│       └── math4d.js    # 4D math library
├── doc/                 # Documentation
│   └── concept/         # Design documents
├── README               # This file
└── LICENSE              # GPL v3 License
```

---

## 🛠️ Development

### Web Version Development

The web version uses modern ES6+ JavaScript with ES modules. To develop:

1. Clone the repository
2. Serve the `docs/` directory with any static server:
   ```bash
   # Using Python 3
   cd docs
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server docs
   ```
3. Open `http://localhost:8000` in your browser
4. Make changes and refresh to see updates

The code uses:
- **ES6 Modules** for clean code organization
- **Canvas 2D API** for 3D visualization (isometric projection)
- **No build step required** - runs directly in the browser

### GitHub Pages Setup

The web version is configured to be deployed via GitHub Pages from the `docs/` folder:

1. Go to repository Settings → Pages
2. Under "Source", select "Deploy from a branch"
3. Select the main branch and `/docs` folder
4. Save and wait for deployment (usually 1-2 minutes)
5. The game will be available at `https://polkadotsprite.github.io/4dtris/`

The `.nojekyll` file ensures GitHub Pages doesn't process the site with Jekyll.

### Desktop Version Development

See original README and build instructions above.

---

## 📜 License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

See the [LICENSE](LICENSE) file for full details.

---

## 👨‍💻 Authors

- **Original Desktop Version**: Simon Laszlo
- **Web Version**: Modernization for browser-based play

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

---

## 🎯 Future Ideas

Possible enhancements:
- [ ] Sound effects and background music
- [ ] Multiple difficulty levels
- [ ] Different visualization modes
- [ ] Touch controls for mobile
- [ ] Multiplayer mode
- [ ] Global leaderboard
- [ ] Custom color themes
- [ ] Replay system

---

## 🌟 Acknowledgments

- Thanks to the original author Simon Laszlo for creating this unique 4D puzzle game
- The mathematics community for 4D geometry research and projection algorithms

---

**Ready to challenge your spatial reasoning? [Play 4DTRIS now!](https://polkadotsprite.github.io/4dtris/)**
