'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Group, MeshStandardMaterial, MeshPhysicalMaterial, Color, PointLight } from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';

interface TruckModelProps {
    scrollProgress: number;
}

export function TruckModel({ scrollProgress }: TruckModelProps) {
    const group = useRef<Group>(null);
    const chassisRef = useRef<Group>(null);
    const cabinRef = useRef<Group>(null);
    const wheelsRef = useRef<Group>(null);
    const axlesRef = useRef<Group>(null);
    const rampRef = useRef<Group>(null);
    const continuousGroup = useRef<Group>(null);
    const leftLightRef = useRef<PointLight>(null);
    const rightLightRef = useRef<PointLight>(null);

    useFrame((state) => {
        const step = 1 / 7;

        // 1. Emissive Intensity & Color Logic
        if (scrollProgress < step * 4) {
            sharedLightMaterial.emissiveIntensity = 0;
            sharedLightMaterial.color.set('#222222'); // Off state (dark)
            if (leftLightRef.current) leftLightRef.current.intensity = 0;
            if (rightLightRef.current) rightLightRef.current.intensity = 0;
        } else if (scrollProgress < step * 5) {
            // Smoothly swell the lights up and down based strictly on the entire scroll section
            const p = (scrollProgress - step * 4) / step;
            // Perfect curve: 0 -> 1 -> 0 over the section
            const pFlare = Math.sin(p * Math.PI);

            sharedLightMaterial.emissiveIntensity = pFlare * 50;
            // Slowly turn from dark grey to pure white
            sharedLightMaterial.color.set(new Color('#222222').lerp(new Color('#ffffff'), Math.min(1, pFlare * 3)));

            // Powerful physical light burst to make the scene glow
            if (leftLightRef.current) leftLightRef.current.intensity = pFlare * 60;
            if (rightLightRef.current) rightLightRef.current.intensity = pFlare * 60;
        } else {
            sharedLightMaterial.emissiveIntensity = 10;
            sharedLightMaterial.color.set('#ffffff'); // Default on
            if (leftLightRef.current) leftLightRef.current.intensity = 5;
            if (rightLightRef.current) rightLightRef.current.intensity = 5;
        }

        // 2. Continuous Rotation / Floating in Phase 7
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


    // Shared Materials for High-End Look
    const sharedPaintMaterial = useMemo(() => new MeshPhysicalMaterial({
        color: '#111111',
        metalness: 0.6,
        roughness: 0.1,
        clearcoat: 1.0,           // Automotive clearcoat
        clearcoatRoughness: 0.05,
        envMapIntensity: 2.0      // Stronger reflections
    }), []);

    const sharedMetalMaterial = useMemo(() => new MeshPhysicalMaterial({
        color: '#333333',
        metalness: 1.0,
        roughness: 0.25,
        envMapIntensity: 1.5
    }), []);

    const sharedLightMaterial = useMemo(() => new MeshPhysicalMaterial({
        color: '#ffffff',
        emissive: '#ffffff',
        emissiveIntensity: 0,
        clearcoat: 1.0
    }), []);

    // Master Animation Loop
    useEffect(() => {
        if (!group.current || !chassisRef.current || !cabinRef.current) return;

        // --- Global Positioning Logic ---
        let targetX = 0;
        let targetY = 0;
        let targetZ = 0;
        let targetRotationY = Math.PI;
        let targetScale = 0.8;
        const step = 1 / 6;

        if (scrollProgress < step) {
            // T1: Body Color
            const p = scrollProgress / step;
            const pAction = Math.min(1, p / 0.5);
            const pDrive = Math.max(0, (p - 0.5) / 0.5);

            targetX = 6 - 12 * pDrive;
            targetZ = 2 - 1 * pDrive;
            targetScale = 0.8 + 0.1 * pDrive;

            // Slow rotation during paint, then drive angle
            targetRotationY = Math.PI - (Math.PI * 0.5 * pAction) + (Math.PI * 0.5 * pDrive);

            sharedPaintMaterial.color.set(new Color('#111111').lerp(new Color('#0066ff'), pAction));

            if (wheelsRef.current) wheelsRef.current.children.forEach(w => w.position.x = w.position.x > 0 ? 1.2 : -1.2);
        }
        else if (scrollProgress < step * 2) {
            // T2: Precision Wheels
            sharedPaintMaterial.color.set('#0066ff');

            const p = (scrollProgress - step) / step;
            const pAction = Math.min(1, p / 0.5);
            const pDrive = Math.max(0, (p - 0.5) / 0.5);

            targetX = -6 + 12 * pDrive;
            targetScale = 0.9;
            targetZ = 1 + 2 * pDrive;

            targetRotationY = Math.PI * 0.5 + (pAction * Math.PI * 2) - (pDrive * Math.PI * 0.4);

            if (wheelsRef.current) {
                wheelsRef.current.children.forEach((wheel, i) => {
                    const side = (i % 2 === 0 ? -1.2 : 1.2) > 0 ? 1 : -1;
                    const explodeDist = Math.sin(pAction * Math.PI) * 4;
                    wheel.position.x = (i % 2 === 0 ? -1.2 : 1.2) + (side * explodeDist);
                });
            }
        }
        else if (scrollProgress < step * 3) {
            // T3: Heavy Axles
            const p = (scrollProgress - step * 2) / step;
            const pAction = Math.min(1, p / 0.5);
            const pDrive = Math.max(0, (p - 0.5) / 0.5);

            targetX = 6 - 12 * pDrive;
            targetScale = 0.9 + 0.1 * pDrive;
            targetZ = 3 + 2 * pDrive;

            targetRotationY = Math.PI * 0.1 + (pAction * 0.2) + (pDrive * 0.9);

            if (axlesRef.current) {
                axlesRef.current.position.y = -2 * (1 - pAction);
                axlesRef.current.scale.setScalar(0.7 + 0.3 * pAction);
            }
        }
        else if (scrollProgress < step * 4) {
            // T4: Hydraulic Ramps
            const p = (scrollProgress - step * 3) / step;
            const pAction = Math.min(1, p / 0.5);
            const pDrive = Math.max(0, (p - 0.5) / 0.5);

            targetX = -6 + 12 * pDrive;
            targetScale = 1.0 + 0.2 * pDrive;
            targetZ = 5 + 3 * pDrive;

            targetRotationY = Math.PI * 1.2 + (pAction * 0.2) - (pDrive * 0.8);

            if (axlesRef.current) { axlesRef.current.position.y = 0; axlesRef.current.scale.setScalar(1.0); }

            if (rampRef.current) {
                rampRef.current.position.z = -5.3 - 3 * pAction;
                rampRef.current.rotation.x = -Math.PI * 0.2 * pAction;
            }
        }
        else if (scrollProgress < step * 5) {
            // T5: Modern LEDs
            const p = (scrollProgress - step * 4) / step;
            const pAction = Math.min(1, p / 0.5);
            const pDrive = Math.max(0, (p - 0.5) / 0.5);

            targetX = 4 - 4 * pDrive; // Standard right side, pulling center
            targetScale = 1.3 - 0.1 * pDrive; // Large, so headlights dominate the frame
            targetZ = 5 + 3 * pDrive;

            // 0 radians is exactly front-facing (+Z cabin -> +Z camera)
            targetRotationY = 0 - (pDrive * Math.PI * 0.2);

            if (axlesRef.current) { axlesRef.current.position.y = 0; axlesRef.current.scale.setScalar(1.0); }
            if (rampRef.current) { rampRef.current.position.z = -8.3; rampRef.current.rotation.x = -Math.PI * 0.2; }
        }
        else if (scrollProgress < step * 6) {
            // T6: Fabrication
            const p = (scrollProgress - step * 5) / step;
            const pDrive = Math.max(0, (p - 0.5) / 0.5); // Drives in second half

            targetX = 0;
            targetY = 0.5 * pDrive;
            targetZ = 4;

            targetRotationY = Math.PI * 1.5 - (p * Math.PI * 0.3);
            targetScale = 1.0;

            if (axlesRef.current) { axlesRef.current.position.y = 0; axlesRef.current.scale.setScalar(1.0); }
            if (rampRef.current) { rampRef.current.position.z = -8.3; rampRef.current.rotation.x = -Math.PI * 0.2; }
        }
        else {
            // T7: Final Stop at Custom Quote (Handled by continuousGroup useFrame)
            targetX = 0;
            targetY = 0.5;
            targetZ = 4;
            targetRotationY = Math.PI * 1.2;
            targetScale = 1.0;

            if (axlesRef.current) { axlesRef.current.position.y = 0; axlesRef.current.scale.setScalar(1.0); }
            if (rampRef.current) { rampRef.current.position.z = -8.3; rampRef.current.rotation.x = -Math.PI * 0.2; }
        }

        // Fast ease for tight syncing to scroll
        gsap.to(group.current.position, { x: targetX, y: targetY, z: targetZ, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(group.current.rotation, { y: targetRotationY, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(group.current.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });

    }, [scrollProgress, sharedPaintMaterial, sharedLightMaterial]);

    return (
        <group ref={group}>
            <group ref={continuousGroup}>
                {/* Chassis Rails */}
                <group ref={chassisRef} position={[0, -0.6, 0]}>
                    <mesh position={[0.8, 0, 0]} material={sharedMetalMaterial} castShadow receiveShadow>
                        <boxGeometry args={[0.3, 0.4, 15]} />
                    </mesh>
                    <mesh position={[-0.8, 0, 0]} material={sharedMetalMaterial} castShadow receiveShadow>
                        <boxGeometry args={[0.3, 0.4, 15]} />
                    </mesh>
                    {[...Array(6)].map((_, i) => (
                        <mesh key={i} position={[0, 0, -6 + i * 2.5]} material={sharedMetalMaterial} castShadow receiveShadow>
                            <boxGeometry args={[1.6, 0.2, 0.2]} />
                        </mesh>
                    ))}
                </group>

                {/* Cabin & Body */}
                <group ref={cabinRef} position={[0, 1.2, 5.5]}>
                    <mesh material={sharedPaintMaterial} castShadow receiveShadow>
                        <boxGeometry args={[2.5, 2.5, 3]} />
                    </mesh>
                    {/* Visual Detail: Windshield Visor */}
                    <mesh position={[0, 1.1, 1.4]} material={sharedMetalMaterial} castShadow receiveShadow>
                        <boxGeometry args={[2.2, 0.3, 0.4]} />
                    </mesh>
                    {/* Headlights */}
                    <mesh position={[1, -0.8, 1.51]} material={sharedLightMaterial}>
                        <boxGeometry args={[0.4, 0.2, 0.1]} />
                        <pointLight ref={leftLightRef} distance={15} decay={2} color="#ffffff" position={[0, 0, 0.2]} />
                    </mesh>
                    <mesh position={[-1, -0.8, 1.51]} material={sharedLightMaterial}>
                        <boxGeometry args={[0.4, 0.2, 0.1]} />
                        <pointLight ref={rightLightRef} distance={15} decay={2} color="#ffffff" position={[0, 0, 0.2]} />
                    </mesh>
                </group>

                {/* Wheels Group */}
                <group ref={wheelsRef}>
                    <Wheel position={[-1.2, -0.4, 5.5]} />
                    <Wheel position={[1.2, -0.4, 5.5]} />
                    <Wheel position={[-1.2, -0.4, 0]} isDual />
                    <Wheel position={[1.2, -0.4, 0]} isDual />
                    <Wheel position={[-1.2, -0.4, -4]} isDual />
                    <Wheel position={[1.2, -0.4, -4]} isDual />
                </group>

                {/* Fabrication Parts */}
                <group ref={axlesRef} position={[0, -0.3, -2]}>
                    <mesh material={sharedMetalMaterial} castShadow receiveShadow>
                        <boxGeometry args={[2.4, 0.2, 10]} />
                    </mesh>
                </group>

                <group ref={rampRef} position={[0, -0.6, -7.5]}>
                    <mesh material={sharedPaintMaterial} castShadow receiveShadow>
                        <boxGeometry args={[2.5, 0.15, 4]} />
                    </mesh>
                </group>
            </group>
        </group>
    );
}

function Wheel({ position, isDual }: { position: [number, number, number], isDual?: boolean }) {
    return (
        <group position={position}>
            {/* Tire */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                <cylinderGeometry args={[0.8, 0.8, isDual ? 0.8 : 0.5, 32]} />
                <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
            </mesh>
            {/* Rim */}
            <mesh position={[position[0] > 0 ? 0.3 : -0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} receiveShadow>
                <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
                <meshStandardMaterial color="#888888" metalness={1} roughness={0.1} />
            </mesh>
        </group>
    );
}
