/**
 * 4D Tetris Game Engine
 * Handles game logic, piece management, collision detection, and line clearing
 */

import { Vector4D, Matrix4D } from './math4d.js';

// Game space dimensions
const XSIZE = 2;
const YSIZE = 2;
const ZSIZE = 2;
const WSIZE = 12; // 12 levels in W direction

// Piece definitions (matching original C++ code)
// Each piece is defined by block positions relative to center
export const PIECE_TYPES = [
    {
        name: 'Dot',
        blocks: [
            new Vector4D(0.5, 0.5, 0.5, -0.5)
        ],
        color: 0xff0000
    },
    {
        name: 'Line',
        blocks: [
            new Vector4D(0.5, 0.5, 0.5, -0.5),
            new Vector4D(0.5, 0.5, -0.5, -0.5)
        ],
        color: 0x00ff00
    },
    {
        name: 'Corner',
        blocks: [
            new Vector4D(0.5, 0.5, 0.5, -0.5),
            new Vector4D(0.5, 0.5, -0.5, -0.5),
            new Vector4D(0.5, -0.5, 0.5, -0.5)
        ],
        color: 0x0000ff
    },
    {
        name: 'Tetracube-1',
        blocks: [
            new Vector4D(0.5, 0.5, 0.5, -0.5),
            new Vector4D(0.5, 0.5, -0.5, -0.5),
            new Vector4D(0.5, -0.5, 0.5, -0.5),
            new Vector4D(0.5, -0.5, -0.5, -0.5)
        ],
        color: 0xffff00
    },
    {
        name: 'Tetracube-2',
        blocks: [
            new Vector4D(0.5, 0.5, 0.5, -0.5),
            new Vector4D(0.5, 0.5, -0.5, -0.5),
            new Vector4D(0.5, -0.5, 0.5, -0.5),
            new Vector4D(-0.5, 0.5, -0.5, -0.5)
        ],
        color: 0xff00ff
    },
    {
        name: 'Tetracube-3',
        blocks: [
            new Vector4D(0.5, 0.5, 0.5, -0.5),
            new Vector4D(0.5, 0.5, -0.5, -0.5),
            new Vector4D(0.5, -0.5, 0.5, -0.5),
            new Vector4D(-0.5, 0.5, 0.5, -0.5)
        ],
        color: 0x00ffff
    }
];

export class GamePiece {
    constructor(type) {
        this.type = type;
        this.position = new Vector4D(0, 0, 0, WSIZE - 2); // Start at top
        this.orientation = Matrix4D.identity();
        this.blocks = type.blocks.map(b => b.clone());
    }

    getWorldBlocks() {
        // Get block positions in world space
        return this.blocks.map(block => {
            const rotated = this.orientation.multiplyVector(block);
            return rotated.add(this.position);
        });
    }

    move(direction) {
        this.position = this.position.add(direction);
    }

    rotate(rotationMatrix) {
        this.orientation = this.orientation.multiply(rotationMatrix);
    }

    clone() {
        const piece = new GamePiece(this.type);
        piece.position = this.position.clone();
        piece.orientation = this.orientation.clone();
        piece.blocks = this.blocks.map(b => b.clone());
        return piece;
    }
}

export class GameEngine {
    constructor() {
        this.reset();
    }

    reset() {
        // Initialize empty 4D game space
        this.space = [];
        for (let w = 0; w < WSIZE; w++) {
            this.space[w] = [];
            for (let x = 0; x < XSIZE; x++) {
                this.space[w][x] = [];
                for (let y = 0; y < YSIZE; y++) {
                    this.space[w][x][y] = [];
                    for (let z = 0; z < ZSIZE; z++) {
                        this.space[w][x][y][z] = 0;
                    }
                }
            }
        }

        this.currentPiece = null;
        this.nextPiece = this.generateRandomPiece();
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.gameOver = false;
        
        this.spawnNewPiece();
    }

    generateRandomPiece() {
        // Weighted random selection (easier pieces more common)
        const weights = [10, 5, 5, 1, 1, 1];
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < PIECE_TYPES.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return new GamePiece(PIECE_TYPES[i]);
            }
        }
        
        return new GamePiece(PIECE_TYPES[0]);
    }

    spawnNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.generateRandomPiece();

        // Check if spawn position is valid
        if (this.checkCollision(this.currentPiece)) {
            this.gameOver = true;
            return false;
        }
        return true;
    }

    checkCollision(piece) {
        const blocks = piece.getWorldBlocks();
        
        for (const block of blocks) {
            const x = Math.round(block.x);
            const y = Math.round(block.y);
            const z = Math.round(block.z);
            const w = Math.round(block.w);

            // Check boundaries - game space is 2x2x2, positions 0 to 1 in X,Y,Z
            // Valid rounded positions are 0 and 1
            if (x < 0 || x > 1 || 
                y < 0 || y > 1 || 
                z < 0 || z > 1 || 
                w < 0 || w >= WSIZE) {
                return true;
            }

            // Array indices are directly the rounded positions (0 or 1)
            const xi = x;
            const yi = y;
            const zi = z;

            if (xi < 0 || xi >= XSIZE ||
                yi < 0 || yi >= YSIZE ||
                zi < 0 || zi >= ZSIZE) {
                return true;
            }

            // Check if space is occupied
            if (this.space[w][xi][yi][zi] !== 0) {
                return true;
            }
        }
        
        return false;
    }

    movePiece(direction) {
        if (this.gameOver || !this.currentPiece) return false;

        const testPiece = this.currentPiece.clone();
        testPiece.move(direction);

        if (!this.checkCollision(testPiece)) {
            this.currentPiece = testPiece;
            return true;
        }
        return false;
    }

    rotatePiece(rotationMatrix) {
        if (this.gameOver || !this.currentPiece) return false;

        const testPiece = this.currentPiece.clone();
        testPiece.rotate(rotationMatrix);

        if (!this.checkCollision(testPiece)) {
            this.currentPiece = testPiece;
            return true;
        }
        return false;
    }

    lowerPiece() {
        // Move piece down in W direction
        const moved = this.movePiece(new Vector4D(0, 0, 0, -1));
        
        if (!moved) {
            // Piece can't move down, lock it in place
            this.lockPiece();
            this.clearLines();
            return this.spawnNewPiece();
        }
        
        return true;
    }

    dropPiece() {
        // Drop piece instantly
        while (this.movePiece(new Vector4D(0, 0, 0, -1))) {
            // Keep moving down
        }
        this.lockPiece();
        this.clearLines();
        return this.spawnNewPiece();
    }

    lockPiece() {
        if (!this.currentPiece) return;

        const blocks = this.currentPiece.getWorldBlocks();
        const color = this.currentPiece.type.color;

        for (const block of blocks) {
            const x = Math.round(block.x);
            const y = Math.round(block.y);
            const z = Math.round(block.z);
            const w = Math.round(block.w);

            if (w >= 0 && w < WSIZE &&
                x >= 0 && x < XSIZE &&
                y >= 0 && y < YSIZE &&
                z >= 0 && z < ZSIZE) {
                this.space[w][x][y][z] = color;
            }
        }
    }

    clearLines() {
        let linesCleared = 0;

        // Check each W level for complete hyperplanes
        for (let w = 0; w < WSIZE; w++) {
            if (this.isLevelComplete(w)) {
                this.clearLevel(w);
                linesCleared++;
            }
        }

        if (linesCleared > 0) {
            this.linesCleared += linesCleared;
            
            // Score increases exponentially with multiple lines
            const points = [0, 100, 300, 600, 1000];
            this.score += points[Math.min(linesCleared, points.length - 1)] * this.level;
            
            // Level up every 10 lines
            this.level = Math.floor(this.linesCleared / 10) + 1;
        }

        return linesCleared;
    }

    isLevelComplete(w) {
        for (let x = 0; x < XSIZE; x++) {
            for (let y = 0; y < YSIZE; y++) {
                for (let z = 0; z < ZSIZE; z++) {
                    if (this.space[w][x][y][z] === 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    clearLevel(w) {
        // Clear the level and shift everything above down
        for (let ww = w; ww < WSIZE - 1; ww++) {
            for (let x = 0; x < XSIZE; x++) {
                for (let y = 0; y < YSIZE; y++) {
                    for (let z = 0; z < ZSIZE; z++) {
                        this.space[ww][x][y][z] = this.space[ww + 1][x][y][z];
                    }
                }
            }
        }

        // Clear the top level
        for (let x = 0; x < XSIZE; x++) {
            for (let y = 0; y < YSIZE; y++) {
                for (let z = 0; z < ZSIZE; z++) {
                    this.space[WSIZE - 1][x][y][z] = 0;
                }
            }
        }
    }

    getDropSpeed() {
        // Speed increases with level
        return Math.max(100, 1000 - (this.level - 1) * 50);
    }

    getAllBlocks() {
        // Return all blocks in the game space for rendering
        const blocks = [];
        
        for (let w = 0; w < WSIZE; w++) {
            for (let x = 0; x < XSIZE; x++) {
                for (let y = 0; y < YSIZE; y++) {
                    for (let z = 0; z < ZSIZE; z++) {
                        if (this.space[w][x][y][z] !== 0) {
                            blocks.push({
                                position: new Vector4D(x, y, z, w),
                                color: this.space[w][x][y][z]
                            });
                        }
                    }
                }
            }
        }

        return blocks;
    }
}
