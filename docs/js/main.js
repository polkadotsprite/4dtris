/**
 * 4D Tetris Main Game Controller
 */

import { GameEngine } from './engine.js';
import { GameRenderer } from './renderer.js';
import { Matrix4D, Vector4D } from './math4d.js';

class Game {
    constructor() {
        this.engine = new GameEngine();
        this.renderer = null;
        this.canvas = null;
        this.nextPieceCanvas = null;
        
        this.isPlaying = false;
        this.isPaused = false;
        this.dropTimer = null;
        this.animationFrameId = null;

        this.setupUI();
        this.setupControls();
    }

    setupUI() {
        // Get DOM elements
        this.canvas = document.getElementById('game-canvas');
        this.nextPieceCanvas = document.getElementById('next-piece-canvas');
        
        // Initialize renderer
        this.renderer = new GameRenderer(this.canvas);

        // UI elements
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.linesElement = document.getElementById('lines');
        
        // Overlays
        this.gameOverlay = document.getElementById('game-overlay');
        this.startScreen = document.getElementById('start-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');
        this.helpModal = document.getElementById('help-modal');

        // Buttons
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('help-button').addEventListener('click', () => this.showHelp());
        document.getElementById('resume-button').addEventListener('click', () => this.resume());
        document.getElementById('restart-button').addEventListener('click', () => this.restart());
        document.getElementById('play-again-button').addEventListener('click', () => this.restart());
        document.getElementById('close-help').addEventListener('click', () => this.hideHelp());
        
        // Close modal on X
        document.querySelector('.close').addEventListener('click', () => this.hideHelp());

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isPlaying || this.isPaused) return;

            const rotationAmount = Math.PI / 2; // 90 degrees

            switch(e.key.toLowerCase()) {
                // Movement controls
                case 'arrowleft':
                    this.engine.movePiece(new Vector4D(-1, 0, 0, 0));
                    e.preventDefault();
                    break;
                case 'arrowright':
                    this.engine.movePiece(new Vector4D(1, 0, 0, 0));
                    e.preventDefault();
                    break;
                case 'arrowup':
                    this.engine.movePiece(new Vector4D(0, 1, 0, 0));
                    e.preventDefault();
                    break;
                case 'arrowdown':
                    this.engine.movePiece(new Vector4D(0, -1, 0, 0));
                    e.preventDefault();
                    break;
                
                // Z-axis movement
                case 'w':
                    this.engine.movePiece(new Vector4D(0, 0, 1, 0));
                    break;
                case 's':
                    this.engine.movePiece(new Vector4D(0, 0, -1, 0));
                    break;
                
                // W-axis movement (4th dimension)
                case 'a':
                    this.engine.movePiece(new Vector4D(0, 0, 0, -1));
                    break;
                case 'd':
                    this.engine.movePiece(new Vector4D(0, 0, 0, 1));
                    break;

                // Rotation controls (all 6 planes)
                case 'q':
                    this.engine.rotatePiece(Matrix4D.rotationXY(rotationAmount));
                    break;
                case 'e':
                    this.engine.rotatePiece(Matrix4D.rotationXY(-rotationAmount));
                    break;
                case 'z':
                    this.engine.rotatePiece(Matrix4D.rotationXZ(rotationAmount));
                    break;
                case 'x':
                    this.engine.rotatePiece(Matrix4D.rotationXZ(-rotationAmount));
                    break;
                case 'c':
                    this.engine.rotatePiece(Matrix4D.rotationXW(rotationAmount));
                    break;
                case 'v':
                    this.engine.rotatePiece(Matrix4D.rotationXW(-rotationAmount));
                    break;
                case 'r':
                    this.engine.rotatePiece(Matrix4D.rotationYZ(rotationAmount));
                    break;
                case 'f':
                    this.engine.rotatePiece(Matrix4D.rotationYZ(-rotationAmount));
                    break;
                case 't':
                    this.engine.rotatePiece(Matrix4D.rotationYW(rotationAmount));
                    break;
                case 'g':
                    this.engine.rotatePiece(Matrix4D.rotationYW(-rotationAmount));
                    break;
                case 'y':
                    this.engine.rotatePiece(Matrix4D.rotationZW(rotationAmount));
                    break;
                case 'h':
                    this.engine.rotatePiece(Matrix4D.rotationZW(-rotationAmount));
                    break;

                // Drop piece
                case ' ':
                    this.engine.dropPiece();
                    this.updateUI();
                    this.resetDropTimer();
                    e.preventDefault();
                    break;

                // Pause
                case 'p':
                    this.togglePause();
                    break;
            }

            this.updateUI();
        });
    }

    startGame() {
        this.engine.reset();
        this.isPlaying = true;
        this.isPaused = false;
        
        this.hideOverlay();
        this.updateUI();
        this.startDropTimer();
        this.startGameLoop();
    }

    restart() {
        this.stopGame();
        this.startGame();
    }

    togglePause() {
        if (!this.isPlaying) return;

        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.showPauseScreen();
            this.stopDropTimer();
        } else {
            this.hideOverlay();
            this.startDropTimer();
        }
    }

    resume() {
        this.isPaused = false;
        this.hideOverlay();
        this.startDropTimer();
    }

    stopGame() {
        this.isPlaying = false;
        this.stopDropTimer();
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    startDropTimer() {
        this.stopDropTimer();
        const speed = this.engine.getDropSpeed();
        
        this.dropTimer = setInterval(() => {
            if (!this.isPaused && this.isPlaying) {
                const success = this.engine.lowerPiece();
                
                if (!success && this.engine.gameOver) {
                    this.handleGameOver();
                }
                
                this.updateUI();
                
                // Check if speed changed (level up)
                const newSpeed = this.engine.getDropSpeed();
                if (newSpeed !== speed) {
                    this.resetDropTimer();
                }
            }
        }, speed);
    }

    stopDropTimer() {
        if (this.dropTimer) {
            clearInterval(this.dropTimer);
            this.dropTimer = null;
        }
    }

    resetDropTimer() {
        this.startDropTimer();
    }

    startGameLoop() {
        const loop = () => {
            if (this.isPlaying && !this.isPaused) {
                this.renderer.render(this.engine);
                
                // Render next piece
                if (this.engine.nextPiece) {
                    this.renderer.renderNextPiece(
                        this.engine.nextPiece,
                        this.nextPieceCanvas
                    );
                }
            }
            
            this.animationFrameId = requestAnimationFrame(loop);
        };
        
        loop();
    }

    updateUI() {
        this.scoreElement.textContent = this.engine.score;
        this.levelElement.textContent = this.engine.level;
        this.linesElement.textContent = this.engine.linesCleared;
    }

    handleGameOver() {
        this.stopGame();
        document.getElementById('final-score').textContent = `Score: ${this.engine.score}`;
        this.showGameOverScreen();
        
        // Save high score to localStorage
        const highScore = localStorage.getItem('4dtris-highscore') || 0;
        if (this.engine.score > highScore) {
            localStorage.setItem('4dtris-highscore', this.engine.score);
        }
    }

    showHelp() {
        this.helpModal.classList.remove('hidden');
    }

    hideHelp() {
        this.helpModal.classList.add('hidden');
    }

    showPauseScreen() {
        this.pauseScreen.classList.remove('hidden');
        this.startScreen.classList.add('hidden');
        this.gameoverScreen.classList.add('hidden');
        this.gameOverlay.classList.remove('hidden');
    }

    showGameOverScreen() {
        this.gameoverScreen.classList.remove('hidden');
        this.startScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.gameOverlay.classList.remove('hidden');
    }

    hideOverlay() {
        this.gameOverlay.classList.add('hidden');
        this.startScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.gameoverScreen.classList.add('hidden');
    }

    handleResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.renderer.resize(width, height);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Show start screen
    game.startScreen.classList.remove('hidden');
    game.gameOverlay.classList.remove('hidden');
});
