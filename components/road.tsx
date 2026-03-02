'use client';

import { useRef } from 'react';
import { Mesh } from 'three';

interface RoadProps {
    scrollProgress: number;
}

export function Road({ scrollProgress }: RoadProps) {
    const roadRef = useRef<Mesh>(null);

    return (
        <>
            {/* Main road surface */}
            <mesh ref={roadRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, 0]}>
                <planeGeometry args={[6, 200]} />
                <meshStandardMaterial
                    color="#333333"
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>

            {/* Road center line */}
            <mesh position={[0, -1.99, 0]} rotation={[-Math.PI / 2.5, 0, 0]}>
                <planeGeometry args={[0.3, 200]} />
                <meshStandardMaterial color="#ffff00" emissive="#ffff00" />
            </mesh>

            {/* Left lane marker */}
            <mesh position={[-1.5, -1.98, 0]} rotation={[-Math.PI / 2.5, 0, 0]}>
                <planeGeometry args={[0.1, 200]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* Right lane marker */}
            <mesh position={[1.5, -1.98, 0]} rotation={[-Math.PI / 2.5, 0, 0]}>
                <planeGeometry args={[0.1, 200]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
        </>
    );
}
