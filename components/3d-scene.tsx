'use client';

import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
import { CustomTruckModel } from './custom-truck-model';
import gsap from 'gsap';

interface Scene3DProps {
    scrollProgress: number;
}

export function Scene3D({ scrollProgress }: Scene3DProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    return (
        <Canvas
            shadows
            dpr={[1, 2]}
            gl={{
                antialias: true,
                powerPreference: 'high-performance',
                alpha: true
            }}
            camera={{ position: [0, 5, 25], fov: 32 }}
            style={{ pointerEvents: 'none' }}
        >
            {/* Transparent background to reveal fixed image */}

            {/* Professional Studio Lighting */}
            <ambientLight intensity={0.7} />
            <spotLight
                position={[20, 30, 20]}
                angle={0.2}
                penumbra={1}
                intensity={4}
                castShadow
                shadow-mapSize={1024}
            />
            <spotLight
                position={[-20, 20, -10]}
                angle={0.3}
                penumbra={1}
                intensity={1.5}
                color="#ffffff"
            />

            {/* Rim Lighting for depth */}
            <pointLight position={[0, 10, -15]} intensity={3} color="#ffffff" />
            <pointLight position={[10, 5, 10]} intensity={1} color="#0066ff" />

            <Environment preset="city" />

            <CustomTruckModel scrollProgress={scrollProgress} />

            {/* Physical invisible ground to receive inter-object shadows */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <shadowMaterial transparent opacity={0.4} />
            </mesh>

            {/* Ground with high-end soft shadows */}
            <ContactShadows
                position={[0, -0.6, 0]}
                opacity={0.8}
                scale={40}
                blur={2.5}
                far={10}
                resolution={512}
                color="#000000"
            />
        </Canvas>
    );
}
