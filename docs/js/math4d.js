/**
 * 4D Math Library
 * Provides vector and matrix operations for 4D space
 */

export class Vector4D {
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    add(v) {
        return new Vector4D(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z,
            this.w + v.w
        );
    }

    subtract(v) {
        return new Vector4D(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z,
            this.w - v.w
        );
    }

    multiply(scalar) {
        return new Vector4D(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar,
            this.w * scalar
        );
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }

    length() {
        return Math.sqrt(this.dot(this));
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vector4D();
        return this.multiply(1 / len);
    }

    clone() {
        return new Vector4D(this.x, this.y, this.z, this.w);
    }

    floor() {
        return new Vector4D(
            Math.floor(this.x),
            Math.floor(this.y),
            Math.floor(this.z),
            Math.floor(this.w)
        );
    }

    round() {
        return new Vector4D(
            Math.round(this.x),
            Math.round(this.y),
            Math.round(this.z),
            Math.round(this.w)
        );
    }

    toArray() {
        return [this.x, this.y, this.z, this.w];
    }

    static fromArray(arr) {
        return new Vector4D(arr[0], arr[1], arr[2], arr[3]);
    }
}

export class Matrix4D {
    constructor() {
        // Initialize as identity matrix
        this.m = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }

    static identity() {
        return new Matrix4D();
    }

    static rotationXY(angle) {
        const m = new Matrix4D();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        m.m = [
            [c, -s, 0, 0],
            [s,  c, 0, 0],
            [0,  0, 1, 0],
            [0,  0, 0, 1]
        ];
        return m;
    }

    static rotationXZ(angle) {
        const m = new Matrix4D();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        m.m = [
            [c,  0, -s, 0],
            [0,  1,  0, 0],
            [s,  0,  c, 0],
            [0,  0,  0, 1]
        ];
        return m;
    }

    static rotationXW(angle) {
        const m = new Matrix4D();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        m.m = [
            [c,  0, 0, -s],
            [0,  1, 0,  0],
            [0,  0, 1,  0],
            [s,  0, 0,  c]
        ];
        return m;
    }

    static rotationYZ(angle) {
        const m = new Matrix4D();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        m.m = [
            [1,  0,  0, 0],
            [0,  c, -s, 0],
            [0,  s,  c, 0],
            [0,  0,  0, 1]
        ];
        return m;
    }

    static rotationYW(angle) {
        const m = new Matrix4D();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        m.m = [
            [1,  0, 0,  0],
            [0,  c, 0, -s],
            [0,  0, 1,  0],
            [0,  s, 0,  c]
        ];
        return m;
    }

    static rotationZW(angle) {
        const m = new Matrix4D();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        m.m = [
            [1, 0,  0,  0],
            [0, 1,  0,  0],
            [0, 0,  c, -s],
            [0, 0,  s,  c]
        ];
        return m;
    }

    multiplyVector(v) {
        return new Vector4D(
            this.m[0][0] * v.x + this.m[0][1] * v.y + this.m[0][2] * v.z + this.m[0][3] * v.w,
            this.m[1][0] * v.x + this.m[1][1] * v.y + this.m[1][2] * v.z + this.m[1][3] * v.w,
            this.m[2][0] * v.x + this.m[2][1] * v.y + this.m[2][2] * v.z + this.m[2][3] * v.w,
            this.m[3][0] * v.x + this.m[3][1] * v.y + this.m[3][2] * v.z + this.m[3][3] * v.w
        );
    }

    multiply(other) {
        const result = new Matrix4D();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result.m[i][j] = 0;
                for (let k = 0; k < 4; k++) {
                    result.m[i][j] += this.m[i][k] * other.m[k][j];
                }
            }
        }
        return result;
    }

    clone() {
        const m = new Matrix4D();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                m.m[i][j] = this.m[i][j];
            }
        }
        return m;
    }
}

/**
 * Project a 4D point to 3D space
 * Uses perspective projection based on W coordinate
 */
export function project4Dto3D(point4D, wDistance = 2) {
    // Perspective projection formula:
    // scale = wDistance / (wDistance + point.w)
    // For visualization, we map W to depth
    const scale = wDistance / (wDistance + point4D.w + 0.1);
    
    return {
        x: point4D.x * scale,
        y: point4D.y * scale,
        z: point4D.z * scale,
        w: point4D.w // Keep W for color/transparency mapping
    };
}

/**
 * Get color based on W position for visualization
 */
export function getColorFromW(w, maxW = 12) {
    const t = (w + maxW / 2) / maxW;
    const hue = t * 280; // Blue to purple range
    return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Get opacity based on W position
 */
export function getOpacityFromW(w, maxW = 12) {
    const t = (w + maxW / 2) / maxW;
    return 0.3 + t * 0.7; // Range from 0.3 to 1.0
}
