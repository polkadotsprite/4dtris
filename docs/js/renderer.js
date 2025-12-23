/**
 * 4D Tetris Renderer
 * Uses Three.js to render the 4D game space projected to 3D
 */

import * as THREE from 'three';
import { project4Dto3D, getOpacityFromW } from './math4d.js';

export class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            canvas.width / canvas.height,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(canvas.width, canvas.height);
        this.renderer.setClearColor(0x0a0a1a, 1);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        this.scene.add(directionalLight);

        // Add a subtle point light that moves
        this.pointLight = new THREE.PointLight(0x00d4ff, 1, 20);
        this.pointLight.position.set(0, 3, 3);
        this.scene.add(this.pointLight);

        // Create grid helper for reference
        this.createGrid();

        // Animation time for effects
        this.time = 0;

        // Particle system for line clears
        this.particles = [];
    }

    createGrid() {
        // Create a 3D grid to show the play area
        const gridHelper = new THREE.GridHelper(4, 4, 0x00d4ff, 0x1a1a2e);
        gridHelper.position.y = -2;
        this.scene.add(gridHelper);

        // Create wireframe box to show boundaries
        const boxGeometry = new THREE.BoxGeometry(4, 4, 4);
        const boxEdges = new THREE.EdgesGeometry(boxGeometry);
        const boxLines = new THREE.LineSegments(
            boxEdges,
            new THREE.LineBasicMaterial({ color: 0x2a2a3e, transparent: true, opacity: 0.3 })
        );
        this.scene.add(boxLines);
    }

    render(engine) {
        // Update time for animations
        this.time += 0.016;

        // Animate camera rotation slowly
        const cameraAngle = this.time * 0.1;
        const cameraRadius = 8;
        this.camera.position.x = Math.cos(cameraAngle) * cameraRadius;
        this.camera.position.z = Math.sin(cameraAngle) * cameraRadius;
        this.camera.position.y = 5 + Math.sin(this.time * 0.3) * 0.5;
        this.camera.lookAt(0, 0, 0);

        // Animate point light
        this.pointLight.position.x = Math.cos(this.time * 0.7) * 3;
        this.pointLight.position.z = Math.sin(this.time * 0.7) * 3;

        // Clear previous blocks
        this.clearBlocks();

        // Render locked blocks
        const blocks = engine.getAllBlocks();
        blocks.forEach(block => {
            this.renderBlock(block.position, block.color);
        });

        // Render current piece
        if (engine.currentPiece && !engine.gameOver) {
            const pieceBlocks = engine.currentPiece.getWorldBlocks();
            const color = engine.currentPiece.type.color;
            pieceBlocks.forEach(block => {
                this.renderBlock(block, color, true);
            });
        }

        // Update particles
        this.updateParticles();

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    clearBlocks() {
        // Remove all block meshes from scene
        const toRemove = [];
        this.scene.children.forEach(child => {
            if (child.userData.isBlock) {
                toRemove.push(child);
            }
        });
        toRemove.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
            this.scene.remove(obj);
        });
    }

    renderBlock(position4D, color, isActive = false) {
        // Project 4D position to 3D
        const pos3D = project4Dto3D(position4D, 3);
        
        // Create block mesh
        const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
        
        // Calculate opacity based on W position
        const opacity = getOpacityFromW(position4D.w, 12);
        
        // Add slight glow for active piece
        const emissive = isActive ? 0.3 : 0.1;
        
        const material = new THREE.MeshStandardMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            emissive: color,
            emissiveIntensity: emissive,
            metalness: 0.5,
            roughness: 0.5
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(pos3D.x * 2, pos3D.y * 2, pos3D.z * 2);
        mesh.userData.isBlock = true;
        
        // Add slight pulsing effect to active piece
        if (isActive) {
            const scale = 1 + Math.sin(this.time * 5) * 0.05;
            mesh.scale.set(scale, scale, scale);
        }

        this.scene.add(mesh);
    }

    createLineClearEffect(wLevel) {
        // Create particle explosion effect for line clear
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 4
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.2
                ),
                life: 1.0,
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6)
            };

            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: particle.color,
                transparent: true,
                opacity: 1
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(particle.position);
            
            particle.mesh = mesh;
            this.particles.push(particle);
            this.scene.add(mesh);
        }
    }

    updateParticles() {
        const toRemove = [];
        
        this.particles.forEach(particle => {
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                toRemove.push(particle);
                return;
            }

            particle.position.add(particle.velocity);
            particle.velocity.y -= 0.01; // Gravity
            particle.mesh.position.copy(particle.position);
            particle.mesh.material.opacity = particle.life;
        });

        // Remove dead particles
        toRemove.forEach(particle => {
            this.scene.remove(particle.mesh);
            particle.mesh.geometry.dispose();
            particle.mesh.material.dispose();
            const index = this.particles.indexOf(particle);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        });
    }

    renderNextPiece(piece, canvas) {
        // Create separate scene for next piece preview
        const previewScene = new THREE.Scene();
        const previewCamera = new THREE.PerspectiveCamera(
            50,
            canvas.width / canvas.height,
            0.1,
            100
        );
        previewCamera.position.set(3, 3, 3);
        previewCamera.lookAt(0, 0, 0);

        // Lighting for preview
        const light = new THREE.AmbientLight(0xffffff, 0.6);
        previewScene.add(light);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(2, 3, 2);
        previewScene.add(dirLight);

        // Create renderer for preview if needed
        if (!this.previewRenderer) {
            this.previewRenderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                antialias: true,
                alpha: true
            });
            this.previewRenderer.setSize(canvas.width, canvas.height);
            this.previewRenderer.setClearColor(0x0a0a1a, 1);
        }

        // Render piece blocks
        if (piece) {
            piece.blocks.forEach(block => {
                const pos3D = project4Dto3D(block, 2);
                const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
                const material = new THREE.MeshStandardMaterial({
                    color: piece.type.color,
                    emissive: piece.type.color,
                    emissiveIntensity: 0.3,
                    metalness: 0.5,
                    roughness: 0.5
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(pos3D.x, pos3D.y, pos3D.z);
                previewScene.add(mesh);
            });
        }

        this.previewRenderer.render(previewScene, previewCamera);

        // Clean up
        previewScene.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose() {
        this.renderer.dispose();
        if (this.previewRenderer) {
            this.previewRenderer.dispose();
        }
    }
}
