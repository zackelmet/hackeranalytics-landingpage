import * as React from 'react';
import * as THREE from 'three';
import classNames from 'classnames';

interface SpinningSphereBlockProps {
    elementId?: string;
    className?: string;
}

/**
 * Neon wireframe globe with orbiting pings and pulse trails.
 */
export default function SpinningSphereBlock(props: SpinningSphereBlockProps) {
    const { elementId, className } = props;
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth || 420;
        const height = container.clientHeight || 420;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 4.0;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        container.appendChild(renderer.domElement);

        // Lighting
        const hemiLight = new THREE.HemisphereLight(0x9ad7ff, 0x0a0a23, 0.8);
        scene.add(hemiLight);
        const pointLight = new THREE.PointLight(0x00fed9, 1.8, 10, 2);
        pointLight.position.set(3, 3, 4);
        scene.add(pointLight);

        // Globe group
        const globe = new THREE.Group();
        scene.add(globe);

        const globeRadius = 1.05;

        // Core wireframe using edges for crisp lines
        const baseGeo = new THREE.IcosahedronGeometry(globeRadius, 4);
        const edgeGeo = new THREE.EdgesGeometry(baseGeo);
        const wireMat = new THREE.LineBasicMaterial({ color: 0x00fed9, transparent: true, opacity: 0.32 });
        const wireframe = new THREE.LineSegments(edgeGeo, wireMat);
        globe.add(wireframe);

        // Latitude and longitude guide lines
        const gridMat = new THREE.LineBasicMaterial({ color: 0x7cf4ff, transparent: true, opacity: 0.18 });
        const latLines: THREE.LineLoop[] = [];
        const longLines: THREE.LineLoop[] = [];

        for (let i = -60; i <= 60; i += 30) {
            const phi = THREE.MathUtils.degToRad(i);
            const pts: THREE.Vector3[] = [];
            for (let t = 0; t <= 64; t++) {
                const theta = (t / 64) * Math.PI * 2;
                const r = globeRadius;
                const x = r * Math.cos(phi) * Math.cos(theta);
                const y = r * Math.sin(phi);
                const z = r * Math.cos(phi) * Math.sin(theta);
                pts.push(new THREE.Vector3(x, y, z));
            }
            const latGeom = new THREE.BufferGeometry().setFromPoints(pts);
            const latLoop = new THREE.LineLoop(latGeom, gridMat);
            globe.add(latLoop);
            latLines.push(latLoop);
        }

        for (let i = 0; i < 12; i++) {
            const theta = (i / 12) * Math.PI * 2;
            const pts: THREE.Vector3[] = [];
            for (let t = -64; t <= 64; t++) {
                const phi = (t / 64) * (Math.PI / 2);
                const r = globeRadius;
                const x = r * Math.cos(phi) * Math.cos(theta);
                const y = r * Math.sin(phi);
                const z = r * Math.cos(phi) * Math.sin(theta);
                pts.push(new THREE.Vector3(x, y, z));
            }
            const longGeom = new THREE.BufferGeometry().setFromPoints(pts);
            const longLoop = new THREE.LineLoop(longGeom, gridMat);
            globe.add(longLoop);
            longLines.push(longLoop);
        }

        // Orbiting pings
        type Orbiter = { mesh: THREE.Mesh; radius: number; speed: number; inc: number; phase: number };
        const orbiters: Orbiter[] = [];
        const orbiterGeo = new THREE.SphereGeometry(0.035, 12, 12);
        for (let i = 0; i < 14; i++) {
            const mat = new THREE.MeshBasicMaterial({ color: 0x8fffdc, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
            const mesh = new THREE.Mesh(orbiterGeo, mat);
            globe.add(mesh);
            orbiters.push({
                mesh,
                radius: globeRadius + 0.05 + Math.random() * 0.12,
                speed: 0.45 + Math.random() * 0.45,
                inc: THREE.MathUtils.degToRad(-45 + Math.random() * 90),
                phase: Math.random() * Math.PI * 2
            });
        }

        // Traveling pulses
        type Pulse = { mesh: THREE.Mesh; start: THREE.Vector3; end: THREE.Vector3; axis: THREE.Vector3; angle: number; progress: number; speed: number };
        const pulses: Pulse[] = [];
        const pulseGeo = new THREE.SphereGeometry(0.04, 10, 10);
        const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff, emissive: 0x00fed9, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending });

        // Ripple rings on pulse impact
        type Ripple = { mesh: THREE.Mesh; life: number; maxLife: number };
        const ripples: Ripple[] = [];
        const ringGeo = new THREE.RingGeometry(0.06, 0.09, 48);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00fed9, side: THREE.DoubleSide, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });

        const spawnPulse = () => {
            const startDir = new THREE.Vector3().randomDirection();
            const endDir = new THREE.Vector3().randomDirection();
            const start = startDir.clone().multiplyScalar(globeRadius * 1.01);
            const end = endDir.clone().multiplyScalar(globeRadius * 1.01);
            const axis = new THREE.Vector3().crossVectors(start, end).normalize();
            const angle = start.angleTo(end);
            if (axis.lengthSq() === 0 || angle === 0) return;
            const mesh = new THREE.Mesh(pulseGeo, pulseMat.clone());
            mesh.position.copy(start);
            globe.add(mesh);
            pulses.push({ mesh, start, end, axis, angle, progress: 0, speed: 0.5 + Math.random() * 0.6 });
        };

        const spawnRipple = (position: THREE.Vector3) => {
            const ring = new THREE.Mesh(ringGeo, ringMat.clone());
            ring.position.copy(position);
            ring.lookAt(new THREE.Vector3(0, 0, 0));
            globe.add(ring);
            ripples.push({ mesh: ring, life: 0, maxLife: 1.2 });
        };

        let pulseTimer = 0;
        const clock = new THREE.Clock();

        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsed = clock.elapsedTime;

            globe.rotation.y += delta * 0.45;
            globe.rotation.x = Math.sin(elapsed * 0.28) * 0.1;

            // Orbiters update
            orbiters.forEach(({ mesh, radius, speed, inc, phase }) => {
                const theta = elapsed * speed + phase;
                const x = radius * Math.cos(theta) * Math.cos(inc);
                const y = radius * Math.sin(inc);
                const z = radius * Math.sin(theta) * Math.cos(inc);
                mesh.position.set(x, y, z);
            });

            // Pulses update
            pulseTimer += delta;
            if (pulseTimer > 0.45) {
                spawnPulse();
                pulseTimer = 0;
            }

            for (let i = pulses.length - 1; i >= 0; i--) {
                const p = pulses[i];
                p.progress += delta * p.speed;
                const t = Math.min(p.progress, 1);
                const pos = p.start.clone().applyAxisAngle(p.axis, p.angle * t);
                p.mesh.position.copy(pos);
                const mat = p.mesh.material as THREE.MeshBasicMaterial;
                mat.opacity = 0.55 + 0.45 * (1 - t);
                if (p.progress >= 1) {
                    spawnRipple(pos);
                    globe.remove(p.mesh);
                    p.mesh.geometry.dispose();
                    (p.mesh.material as THREE.Material).dispose();
                    pulses.splice(i, 1);
                }
            }

            // Ripple update
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                r.life += delta;
                const t = r.life / r.maxLife;
                r.mesh.scale.setScalar(1 + t * 2.4);
                const mat = r.mesh.material as THREE.MeshBasicMaterial;
                mat.opacity = Math.max(0, 0.4 * (1 - t));
                if (r.life >= r.maxLife) {
                    globe.remove(r.mesh);
                    r.mesh.geometry.dispose();
                    (r.mesh.material as THREE.Material).dispose();
                    ripples.splice(i, 1);
                }
            }

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth || 420;
            const h = container.clientHeight || 420;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            orbiters.forEach(({ mesh }) => {
                mesh.geometry.dispose();
                (mesh.material as THREE.Material).dispose();
            });
            pulses.forEach((p) => {
                p.mesh.geometry.dispose();
                (p.mesh.material as THREE.Material).dispose();
            });
            ripples.forEach((r) => {
                r.mesh.geometry.dispose();
                (r.mesh.material as THREE.Material).dispose();
            });
            latLines.forEach((l) => l.geometry.dispose());
            longLines.forEach((l) => l.geometry.dispose());
            edgeGeo.dispose();
            baseGeo.dispose();
            wireMat.dispose();
            gridMat.dispose();
            orbiterGeo.dispose();
            pulseGeo.dispose();
            pulseMat.dispose();
            ringGeo.dispose();
            ringMat.dispose();
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);

    return <div id={elementId} ref={containerRef} className={classNames('w-full', 'aspect-square', 'max-w-[260px]', 'mx-auto', className)} />;
}
