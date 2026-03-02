'use client';

import { Environment as DreiEnvironment, ContactShadows } from '@react-three/drei';

interface EnvironmentProps {
    scrollProgress: number;
}

export function Environment({ scrollProgress }: EnvironmentProps) {
    return (
        <>
            {/* High-end bright Studio Environment Map */}
            <DreiEnvironment preset="city" />

            {/* Main Key Light - Bright & Crisp */}
            <spotLight
                position={[20, 40, 20]}
                angle={0.2}
                penumbra={1}
                intensity={4000}
                castShadow
                color="#ffffff"
            />

            {/* Fill Light for shadows */}
            <spotLight
                position={[-20, 20, 20]}
                angle={0.3}
                penumbra={1}
                intensity={2000}
                color="#ffffff"
            />

            {/* Soft Overarching Ambient */}
            <ambientLight intensity={1.2} />

            {/* Light Showroom Floor */}
            <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial
                    color="#ffffff"
                    roughness={0.1}
                    metalness={0.05}
                    transparent
                    opacity={0.1}
                />
            </mesh>

            <ContactShadows
                opacity={0.12} // Subtle shadows for light background
                scale={100}
                blur={2.5}
                far={10}
                resolution={512}
                color="#333333"
            />
        </>
    );
}
