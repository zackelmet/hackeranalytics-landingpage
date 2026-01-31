

import { useRef, useEffect } from 'react';
// Minimal prop type for the block
type SpinningSphereBlockProps = {
    elementId?: string;
    className?: string;
};
import * as THREE from 'three';
import classNames from 'classnames';

// Simple Perlin noise implementation
function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}
function lerp(a: number, b: number, t: number) {
    return a + t * (b - a);
}
function grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}
function perlin(x: number, y: number, z: number, p: number[]) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
    const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
    return lerp(
        lerp(
            lerp(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u),
            lerp(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u),
            v
        ),
        lerp(
            lerp(grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1), u),
            lerp(grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1), u),
            v
        ),
        w
    );
}


export default function SpinningSphereBlock(props: SpinningSphereBlockProps) {
    const { elementId, className } = props;
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // Scene
        const scene = new THREE.Scene();
        scene.background = null;

        // Camera
        const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
        camera.position.z = 3.5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setClearColor(0x000000, 0);
        mount.innerHTML = '';
        mount.appendChild(renderer.domElement);
        renderer.domElement.style.background = 'transparent';
        renderer.domElement.style.borderRadius = '0';
        renderer.domElement.style.boxShadow = 'none';
        renderer.domElement.style.border = 'none';

        // Sphere geometry
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        // Cyberpunk grid skin texture
        const skinCanvas = document.createElement('canvas');
        skinCanvas.width = 512;
        skinCanvas.height = 512;
        const skinCtx = skinCanvas.getContext('2d');
        if (skinCtx) {
            // Darker base for more contrast
            skinCtx.fillStyle = '#10131a';
            skinCtx.fillRect(0, 0, 512, 512);
            // Draw grid with glow
            skinCtx.save();
            skinCtx.shadowColor = '#00fed9';
            skinCtx.shadowBlur = 12;
            skinCtx.strokeStyle = '#00fed9';
            skinCtx.lineWidth = 2.5;
            for (let i = 0; i < 512; i += 32) {
                skinCtx.beginPath();
                skinCtx.moveTo(i, 0);
                skinCtx.lineTo(i, 512);
                skinCtx.stroke();
                skinCtx.beginPath();
                skinCtx.moveTo(0, i);
                skinCtx.lineTo(512, i);
                skinCtx.stroke();
            }
            skinCtx.restore();
            // Neon dots with stronger glow
            for (let i = 0; i < 30; i++) {
                skinCtx.save();
                skinCtx.beginPath();
                skinCtx.arc(Math.random() * 512, Math.random() * 512, 8, 0, 2 * Math.PI);
                skinCtx.fillStyle = ['#00fed9', '#ff00ea', '#39ff14', '#fff'][Math.floor(Math.random() * 4)];
                skinCtx.shadowColor = skinCtx.fillStyle;
                skinCtx.shadowBlur = 22;
                skinCtx.globalAlpha = 0.85;
                skinCtx.fill();
                skinCtx.restore();
            }
        }
        const skinTexture = new THREE.CanvasTexture(skinCanvas);
        const material = new THREE.MeshStandardMaterial({
            map: skinTexture,
            metalness: 0.7,
            roughness: 0.3,
            emissive: new THREE.Color('#00fed9'),
            emissiveIntensity: 0.35,
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Moving particles
        const particles: THREE.Mesh[] = [];
        const trails: THREE.Mesh[][] = [];
        const trailLength = 10;
        for (let i = 0; i < 16; i++) {
            const pointGeo = new THREE.SphereGeometry(0.06, 16, 16);
            const pointMat = new THREE.MeshBasicMaterial({ color: '#fff' });
            const point = new THREE.Mesh(pointGeo, pointMat);
            scene.add(point);
            particles.push(point);
            // Create trail spheres for each particle
            const trail: THREE.Mesh[] = [];
            for (let j = 0; j < trailLength; j++) {
                const trailGeo = new THREE.SphereGeometry(0.04, 12, 12);
                const trailMat = new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: 0.5 - j * 0.04 });
                const trailSphere = new THREE.Mesh(trailGeo, trailMat);
                scene.add(trailSphere);
                trail.push(trailSphere);
            }
            trails.push(trail);
        }

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambient);
        const spot = new THREE.SpotLight('#00fed9', 1.2, 10, Math.PI / 4, 0.5, 2);
        spot.position.set(2, 4, 4);
        scene.add(spot);

        // Animation
        let frame = 0;
        function animate() {
            frame += 0.008; // slow spin
            sphere.rotation.y += 0.008;
            sphere.rotation.x = Math.sin(frame / 2) * 0.1;
            // Animate particles moving around sphere with trail
            for (let i = 0; i < particles.length; i++) {
                const phi = (i / particles.length) * Math.PI * 2 + frame * 0.7;
                const theta = Math.abs(Math.sin(frame + i)) * Math.PI;
                const r = 1.05 + Math.sin(frame * 2 + i) * 0.08;
                // Current position
                const x = r * Math.sin(theta) * Math.cos(phi);
                const y = r * Math.cos(theta);
                const z = r * Math.sin(theta) * Math.sin(phi);
                particles[i].position.set(x, y, z);
                // Animate trail
                let prevX = x, prevY = y, prevZ = z;
                for (let j = 0; j < trails[i].length; j++) {
                    // Fade trail by stepping back in time
                    const t = frame - j * 0.06;
                    const trailPhi = (i / particles.length) * Math.PI * 2 + t * 0.7;
                    const trailTheta = Math.abs(Math.sin(t + i)) * Math.PI;
                    const trailR = 1.05 + Math.sin(t * 2 + i) * 0.08;
                    prevX = trailR * Math.sin(trailTheta) * Math.cos(trailPhi);
                    prevY = trailR * Math.cos(trailTheta);
                    prevZ = trailR * Math.sin(trailTheta) * Math.sin(trailPhi);
                    trails[i][j].position.set(prevX, prevY, prevZ);
                }
            }
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        animate();

        // Responsive resize
        function handleResize() {
            if (!mount) return;
            const width = mount.clientWidth;
            const height = mount.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            mount.removeChild(renderer.domElement);
            geometry.dispose();
            material.dispose();
            particles.forEach((p) => p.geometry.dispose());
        };
    }, []);

    return (
            <div
                id={elementId}
                ref={mountRef}
                className={classNames(
                    'flex',
                    'justify-center',
                    'items-center',
                    'relative',
                    className
                )}
                style={{
                    width: '100%',
                    maxWidth: '320px',
                    aspectRatio: '1/1',
                    background: 'none',
                    boxShadow: 'none',
                    overflow: 'visible',
                    margin: '0 auto',
                    padding: 0,
                    border: 'none',
                }}
            />
    );
}
