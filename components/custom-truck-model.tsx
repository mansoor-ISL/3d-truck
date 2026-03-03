'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Group, Color } from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';

interface CustomTruckModelProps {
    scrollProgress: number;
}

export function CustomTruckModel({ scrollProgress }: CustomTruckModelProps) {
    const group = useRef<Group>(null);
    const continuousGroup = useRef<Group>(null);

    // Load the GLB model
    const { scene } = useGLTF('/EZ440P02PUGWUFNYZTQ7XRY1X_glb/EZ440P02PUGWUFNYZTQ7XRY1X.glb');

    // Capture original material colors immediately once scene loads
    // This is more robust than mesh-name-based tracking
    const originalColors = useMemo(() => {
        const map = new Map<any, Color>();
        if (scene) {
            scene.traverse((node: any) => {
                if (node.isMesh && node.material) {
                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                    materials.forEach((mat: any) => {
                        if (mat.color && !map.has(mat)) {
                            map.set(mat, mat.color.clone());
                        }
                    });
                }
            });
        }
        return map;
    }, [scene]);

    useFrame((state) => {
        const step = 1 / 7;

        // Continuous Rotation / Floating in Phase 7
        if (continuousGroup.current) {
            if (scrollProgress >= step * 6) {
                const p = (scrollProgress - step * 6) / step; // 0 to 1
                continuousGroup.current.rotation.y += 0.005 * p;
                continuousGroup.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05 * p;
            } else {
                continuousGroup.current.rotation.y += (0 - continuousGroup.current.rotation.y) * 0.1;
                continuousGroup.current.position.y += (0 - continuousGroup.current.position.y) * 0.1;
            }
        }
    });

    // Master Animation Loop
    useEffect(() => {
        if (!group.current || !scene || originalColors.size === 0) return;

        // Find specific meshes for targeted animation
        const meshes: Record<string, any> = {};
        scene.traverse((node) => {
            if (node.type === 'Mesh') {
                meshes[node.name] = node;
            }
        });

        // --- Global Positioning Logic ---
        const step = 1 / 6;
        const pCurrent = scrollProgress;

        // Cumulative rotation: 1 full round (2*PI) per section
        let targetRotationY = Math.PI + (pCurrent * 6 * Math.PI * 2);
        let targetX = 0;
        let targetY = 0;
        let targetZ = 4;
        let targetScale = 5.0;

        // Split section into Action (0.7) and Plateau (0.3)
        const sectionIdx = Math.floor(pCurrent / step);
        const sectionLocalP = (pCurrent % step) / step;
        const actionP = Math.min(1, sectionLocalP / 0.7);

        // 1. COLORS - Strictly controlled by section
        if (pCurrent < step) {
            // Section 1: Body Color - Black -> Real Color
            originalColors.forEach((origColor, mat) => {
                mat.color.set('#000000').lerp(origColor, actionP);
            });
        } else {
            // Sections 2-6: Always use original colors
            originalColors.forEach((origColor, mat) => {
                mat.color.copy(origColor);
            });
        }

        // 2. TRANSFORMATIONS
        if (pCurrent < step) {
            // T1: Body Color Reveal
            targetX = 6 - 12 * actionP;
            targetZ = 2 - 1 * actionP;
            targetScale = 5.0;
            if (meshes.mesh_1) meshes.mesh_1.position.x = -0.1;
            if (meshes.mesh_4) meshes.mesh_4.position.x = 0;
        }
        else if (pCurrent < step * 2) {
            // T2: Wheel Explosion
            targetX = -6 + 12 * actionP;
            targetZ = 1 + 2 * actionP;
            targetScale = 5.0;

            const explodeDist = Math.sin(actionP * Math.PI) * 0.5;
            if (meshes.mesh_1) meshes.mesh_1.position.x = -0.1 - explodeDist;
            if (meshes.mesh_4) meshes.mesh_4.position.x = explodeDist;
        }
        else if (pCurrent < step * 3) {
            // T3: Heavy Axles
            targetX = 6 - 12 * actionP;
            targetZ = 3 + 2 * actionP;
            targetScale = 5.5 + 1.5 * actionP;

            if (meshes.mesh_1) meshes.mesh_1.position.x = -0.1;
            if (meshes.mesh_4) meshes.mesh_4.position.x = 0;
            if (meshes.mesh_2) meshes.mesh_2.position.y = -0.11 - 0.1 * (1 - actionP);
        }
        else if (pCurrent < step * 4) {
            // T4: Hydraulic Ramps
            targetX = -6 + 12 * actionP;
            targetZ = 5 + 3 * actionP;
            targetScale = 5.0 + 2.0 * actionP;
            if (meshes.mesh_2) meshes.mesh_2.position.y = -0.11;
        }
        else if (pCurrent < step * 5) {
            // T5: Load Capacity - Subtle Compression Animation
            targetX = 4 - 4 * actionP;
            targetZ = 5 + 3 * actionP;
            targetY = -0.05 * actionP; // Subtle sink under "load"
            targetScale = 5.0;
        }
        else if (pCurrent < step * 6) {
            // T6: Fabrication Final
            targetX = 0;
            targetY = (0.5 * actionP) - (0.05 * (1 - actionP)); // Settle from load to final height
            targetZ = 4;
            targetScale = 5.0;
        }
        else {
            // T7: Final Stop
            targetX = 0;
            targetY = 0.5;
            targetZ = 4;
            targetScale = 5.0;
        }

        // Apply animations with smooth easing
        gsap.to(group.current.position, { x: targetX, y: targetY, z: targetZ, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(group.current.rotation, { y: targetRotationY, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(group.current.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });

    }, [scrollProgress, scene, originalColors]);

    return (
        <group ref={group}>
            <group ref={continuousGroup}>
                <primitive object={scene} />
            </group>
        </group>
    );
}

// Preload the model
useGLTF.preload('/EZ440P02PUGWUFNYZTQ7XRY1X_glb/EZ440P02PUGWUFNYZTQ7XRY1X.glb');
