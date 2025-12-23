/**
 * 4D Tetris Renderer - Canvas 2D Fallback
 * Renders the 4D game space projected to 3D using Canvas 2D API
 */

import { project4Dto3D, getOpacityFromW } from './math4d.js';

export class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.time = 0;
        this.rotation = 0;
    }

    render(engine) {
        // Update time for animations
        this.time += 0.016;
        this.rotation += 0.005;

        // Clear canvas
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set up coordinate system (center of canvas)
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = 60; // Scale factor for rendering

        // Draw grid
        this.drawGrid(centerX, centerY, scale);

        // Collect all blocks to render with depth sorting
        const allBlocks = [];

        // Add locked blocks
        const lockedBlocks = engine.getAllBlocks();
        lockedBlocks.forEach(block => {
            allBlocks.push({
                position: block.position,
                color: block.color,
                isActive: false
            });
        });

        // Add current piece blocks
        if (engine.currentPiece && !engine.gameOver) {
            const pieceBlocks = engine.currentPiece.getWorldBlocks();
            const color = engine.currentPiece.type.color;
            pieceBlocks.forEach(block => {
                allBlocks.push({
                    position: block,
                    color: color,
                    isActive: true
                });
            });
        }

        // Sort blocks by depth (Z + W) for proper rendering
        allBlocks.sort((a, b) => {
            const depthA = a.position.z + a.position.w * 0.5;
            const depthB = b.position.z + b.position.w * 0.5;
            return depthA - depthB;
        });

        // Render all blocks
        allBlocks.forEach(block => {
            this.drawBlock(
                block.position,
                block.color,
                block.isActive,
                centerX,
                centerY,
                scale
            );
        });

        // Draw UI indicators
        this.drawWAxisIndicator(centerX, centerY, scale);
    }

    drawGrid(centerX, centerY, scale) {
        this.ctx.strokeStyle = 'rgba(42, 42, 62, 0.3)';
        this.ctx.lineWidth = 1;

        // Draw XY grid
        for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
                const pos1 = this.rotateAndProject({ x: x, y: y, z: -2, w: 0 }, scale);
                const pos2 = this.rotateAndProject({ x: x, y: y, z: 2, w: 0 }, scale);
                
                this.ctx.beginPath();
                this.ctx.moveTo(centerX + pos1.x, centerY - pos1.y);
                this.ctx.lineTo(centerX + pos2.x, centerY - pos2.y);
                this.ctx.stroke();
            }
        }

        // Draw game area boundary
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
        this.ctx.lineWidth = 2;
        
        const corners = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];

        // Draw cube edges
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        edges.forEach(([i, j]) => {
            const p1 = this.rotateAndProject(
                { x: corners[i][0], y: corners[i][1], z: corners[i][2], w: 0 },
                scale
            );
            const p2 = this.rotateAndProject(
                { x: corners[j][0], y: corners[j][1], z: corners[j][2], w: 0 },
                scale
            );

            this.ctx.beginPath();
            this.ctx.moveTo(centerX + p1.x, centerY - p1.y);
            this.ctx.lineTo(centerX + p2.x, centerY - p2.y);
            this.ctx.stroke();
        });
    }

    drawBlock(position4D, color, isActive, centerX, centerY, scale) {
        // Project 4D to 3D
        const pos3D = project4Dto3D(position4D, 3);
        
        // Apply rotation
        const pos = this.rotateAndProject(pos3D, scale);
        
        // Calculate opacity based on W position
        const opacity = getOpacityFromW(position4D.w, 12);
        
        // Block size with perspective
        const size = scale * 0.8;
        const depth = pos.z;
        const perspectiveScale = 1 / (1 + depth * 0.1);
        const finalSize = size * perspectiveScale;

        // Convert hex color to RGB
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;

        // Add glow effect for active piece
        if (isActive) {
            const glowIntensity = 0.5 + Math.sin(this.time * 5) * 0.3;
            this.ctx.shadowBlur = 20 * glowIntensity;
            this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        } else {
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`;
        }

        // Draw block as cube with perspective
        const x = centerX + pos.x;
        const y = centerY - pos.y;

        // Main face
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        this.ctx.fillRect(
            x - finalSize / 2,
            y - finalSize / 2,
            finalSize,
            finalSize
        );

        // Top face (lighter)
        this.ctx.fillStyle = `rgba(${Math.min(r + 50, 255)}, ${Math.min(g + 50, 255)}, ${Math.min(b + 50, 255)}, ${opacity * 0.8})`;
        this.ctx.beginPath();
        this.ctx.moveTo(x - finalSize / 2, y - finalSize / 2);
        this.ctx.lineTo(x, y - finalSize / 2 - finalSize * 0.3);
        this.ctx.lineTo(x + finalSize / 2, y - finalSize / 2);
        this.ctx.closePath();
        this.ctx.fill();

        // Right face (darker)
        this.ctx.fillStyle = `rgba(${Math.max(r - 50, 0)}, ${Math.max(g - 50, 0)}, ${Math.max(b - 50, 0)}, ${opacity * 0.6})`;
        this.ctx.beginPath();
        this.ctx.moveTo(x + finalSize / 2, y - finalSize / 2);
        this.ctx.lineTo(x + finalSize / 2 + finalSize * 0.3, y);
        this.ctx.lineTo(x + finalSize / 2 + finalSize * 0.3, y + finalSize / 2);
        this.ctx.lineTo(x + finalSize / 2, y + finalSize / 2);
        this.ctx.closePath();
        this.ctx.fill();

        // Outline
        this.ctx.strokeStyle = `rgba(${Math.min(r + 80, 255)}, ${Math.min(g + 80, 255)}, ${Math.min(b + 80, 255)}, ${opacity})`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            x - finalSize / 2,
            y - finalSize / 2,
            finalSize,
            finalSize
        );

        // Reset shadow
        this.ctx.shadowBlur = 0;
    }

    rotateAndProject(pos3D, scale) {
        // Simple rotation around Y axis for visual effect
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        
        const x = pos3D.x * cos - pos3D.z * sin;
        const z = pos3D.x * sin + pos3D.z * cos;
        const y = pos3D.y;

        // Isometric-style projection
        const projX = (x - z) * scale;
        const projY = (y * 1.5 + (x + z) * 0.5) * scale;

        return { x: projX, y: projY, z: z };
    }

    drawWAxisIndicator(centerX, centerY, scale) {
        // Draw W-axis indicator in corner
        const x = 50;
        const y = this.canvas.height - 50;

        this.ctx.font = '14px monospace';
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fillText('W-Axis', x - 20, y - 30);

        // Draw gradient bar for W visualization
        const gradient = this.ctx.createLinearGradient(x, y, x + 100, y);
        gradient.addColorStop(0, 'rgba(0, 100, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0.9)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, 100, 15);

        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, 100, 15);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px monospace';
        this.ctx.fillText('W=0', x - 5, y + 30);
        this.ctx.fillText('W=12', x + 80, y + 30);
    }

    renderNextPiece(piece, canvas) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 25;

        // Clear canvas
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!piece) return;

        // Render piece blocks
        piece.blocks.forEach(block => {
            const pos3D = project4Dto3D(block, 2);
            const pos = this.rotateAndProject(pos3D, scale);
            
            const r = (piece.type.color >> 16) & 255;
            const g = (piece.type.color >> 8) & 255;
            const b = piece.type.color & 255;

            const size = scale * 0.7;
            const x = centerX + pos.x;
            const y = centerY - pos.y;

            // Draw block
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x - size / 2, y - size / 2, size, size);

            ctx.strokeStyle = `rgb(${Math.min(r + 80, 255)}, ${Math.min(g + 80, 255)}, ${Math.min(b + 80, 255)})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(x - size / 2, y - size / 2, size, size);
        });
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    dispose() {
        // Nothing to dispose for 2D canvas
    }
}
