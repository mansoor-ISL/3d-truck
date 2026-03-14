'use client';

import { useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

interface CustomTruckModelProps {
    scrollProgress: number;
}

type AxleMode = 'dual' | 'triple';

export function CustomTruckModel({ scrollProgress }: CustomTruckModelProps) {
    const group = useRef<Group>(null);

    const sectionValue = Math.min(6.999, scrollProgress * 7);
    const sectionIndex = Math.floor(sectionValue);
    const sectionLocal = sectionValue - sectionIndex;

    // Match each text section with visible object changes
    const frameColorBySection = ['#0a0a0a', '#0a0a0a', '#0a0a0a', '#0a0a0a', '#0a0a0a', '#0a0a0a', '#0a0a0a'];
    const deckColorBySection = ['#e3c5a8', '#d2b48c', '#c4a484', '#e3c5a8', '#d2b48c', '#c4a484', '#e3c5a8'];

    const frameColor = frameColorBySection[sectionIndex] || frameColorBySection[0];
    const deckColor = deckColorBySection[sectionIndex] || deckColorBySection[0];

    const tireScale = sectionIndex === 1 ? 1.2 : sectionIndex === 4 ? 0.92 : 1;
    const axleMode: AxleMode = sectionIndex >= 2 ? 'triple' : 'dual';
    const railHeight = sectionIndex >= 5 ? 0.66 : sectionIndex >= 3 ? 0.46 : 0.28;
    const deckDrop = sectionIndex >= 3 ? -0.24 : 0;
    const rampAngle = sectionIndex >= 3 ? -0.58 : -0.34;
    const loadCompress = sectionIndex === 4 ? -0.08 : 0;

    useFrame(() => {
        if (!group.current) return;

        const targetX = (sectionIndex % 2 === 0 ? 1 : -1) * (1.05 - sectionLocal * 1.6);
        const targetY = 0.18 + loadCompress + Math.max(0, (scrollProgress - 0.85) * 0.35);
        const targetZ = 2.45 + sectionIndex * 0.3 + sectionLocal * 0.25;

        // 2 rotations per section
        const targetRotY = (sectionIndex + sectionLocal) * Math.PI * 4 + Math.PI * 0.15;

        // Smaller overall size than before
        const targetScale = 1.55 + sectionLocal * 0.06;

        group.current.position.x += (targetX - group.current.position.x) * 0.08;
        group.current.position.y += (targetY - group.current.position.y) * 0.08;
        group.current.position.z += (targetZ - group.current.position.z) * 0.08;

        group.current.rotation.y += (targetRotY - group.current.rotation.y) * 0.08;

        group.current.scale.x += (targetScale - group.current.scale.x) * 0.08;
        group.current.scale.y += (targetScale - group.current.scale.y) * 0.08;
        group.current.scale.z += (targetScale - group.current.scale.z) * 0.08;
    });

    return (
        <group ref={group}>
            <UtilityTrailerShowcase
                frameColor={frameColor}
                deckColor={deckColor}
                axleMode={axleMode}
                railHeight={railHeight}
                deckDrop={deckDrop}
                rampAngle={rampAngle}
                tireScale={tireScale}
            />
        </group>
    );
}

function UtilityTrailerShowcase({
    frameColor,
    deckColor,
    axleMode,
    railHeight,
    deckDrop,
    rampAngle,
    tireScale,
}: {
    frameColor: string;
    deckColor: string;
    axleMode: AxleMode;
    railHeight: number;
    deckDrop: number;
    rampAngle: number;
    tireScale: number;
}) {
    const axleZ = axleMode === 'triple' ? [1.8, 0.45, -1.0] : [1.2, -0.6];
    const railY = 0.28 + railHeight / 2;

    return (
        <group rotation={[0, -Math.PI / 7.2, 0]}>
            <RoundedBox args={[3.2, 0.22, 8.6]} radius={0.03} smoothness={3} position={[0, -0.28, 0]} castShadow receiveShadow>
                <meshStandardMaterial color={frameColor} roughness={0.48} metalness={0.55} />
            </RoundedBox>

            {/* Main Deck Surface (Plane Style) */}
            <RoundedBox args={[2.8, 0.20, 7.8]} radius={0.02} smoothness={2} position={[0, -0.05 + deckDrop * 0.5, 0]} castShadow receiveShadow>
                <meshStandardMaterial color={deckColor} roughness={0.78} metalness={0.06} />
            </RoundedBox>

            {/* Side Rails - Dense Vertical Spindles */}
            {[-3.9, -3.4, -2.9, -2.4, -1.9, -1.4, -0.9, -0.4, 0.1, 0.6, 1.1, 1.6, 2.1, 2.6, 3.1, 3.6].flatMap((z) => [
                <mesh key={`post-r-${z}`} position={[1.48, railHeight / 2 + 0.14, z]} castShadow receiveShadow>
                    <boxGeometry args={[0.04, railHeight, 0.04]} />
                    <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.5} />
                </mesh>,
                <mesh key={`post-l-${z}`} position={[-1.48, railHeight / 2 + 0.14, z]} castShadow receiveShadow>
                    <boxGeometry args={[0.04, railHeight, 0.04]} />
                    <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.5} />
                </mesh>,
            ])}

            {/* Top Rails */}
            <mesh position={[1.48, railHeight + 0.14, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.04, 0.04, 8.4, 4]} />
                <meshStandardMaterial color={frameColor} roughness={0.52} metalness={0.48} />
            </mesh>
            <mesh position={[-1.48, railHeight + 0.14, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.04, 0.04, 8.4, 4]} />
                <meshStandardMaterial color={frameColor} roughness={0.52} metalness={0.48} />
            </mesh>
            <mesh position={[0, railHeight + 0.14, 4.18]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                <cylinderGeometry args={[0.04, 0.04, 3.0, 4]} />
                <meshStandardMaterial color={frameColor} roughness={0.52} metalness={0.48} />
            </mesh>

            {/* Fenders - Smoother Profile */}
            {[1.7, -1.7].map((x) => (
                <group key={`fender-${x}`} position={[x, -0.3, axleMode === 'triple' ? 0.3 : 0.2]}>
                    {/* Main Curved Top */}
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[0.38, 0.04, axleMode === 'triple' ? 3.8 : 3.0]} />
                        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.6} />
                    </mesh>
                    {/* Slopes */}
                    <mesh position={[0, -0.22, (axleMode === 'triple' ? 3.8 : 3.0) / 2 + 0.3]} rotation={[0.6, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.38, 0.04, 0.8]} />
                        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.6} />
                    </mesh>
                    <mesh position={[0, -0.22, -(axleMode === 'triple' ? 3.8 : 3.0) / 2 - 0.3]} rotation={[-0.6, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.38, 0.04, 0.8]} />
                        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.6} />
                    </mesh>
                    {/* Inner Guard Plate */}
                    <mesh position={[x > 0 ? -0.18 : 0.18, -0.2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.02, 0.4, axleMode === 'triple' ? 3.8 : 3.0]} />
                        <meshStandardMaterial color={frameColor} roughness={0.5} />
                    </mesh>
                </group>
            ))}

            {/* Front Tongue Extended (A-Frame) */}
            <mesh position={[0.55, -0.4, 6.0]} rotation={[0, 0.18, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.15, 0.15, 4.8]} />
                <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[-0.55, -0.4, 6.0]} rotation={[0, -0.18, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.15, 0.15, 4.8]} />
                <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.6} />
            </mesh>

            {/* Jack Structure moved forward */}
            <mesh position={[0, -0.6, 7.8]} castShadow receiveShadow>
                <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
                <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
            </mesh>
            <mesh position={[0, -1.2, 7.8]} castShadow receiveShadow>
                <boxGeometry args={[0.3, 0.05, 0.3]} />
                <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
            </mesh>

            {/* 4-Panel Mesh Rear Gate (A2Z Detail) */}
            <group position={[0, 0.2, -4.3]} rotation={[rampAngle + 0.2, 0, 0]}>
                {/* Gate Outer Frame */}
                <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
                    <boxGeometry args={[3.2, 0.1, 0.1]} />
                    <meshStandardMaterial color={frameColor} />
                </mesh>
                <mesh position={[1.55, 0.7, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.1, 1.5, 0.1]} />
                    <meshStandardMaterial color={frameColor} />
                </mesh>
                <mesh position={[-1.55, 0.7, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.1, 1.5, 0.1]} />
                    <meshStandardMaterial color={frameColor} />
                </mesh>
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[3.2, 0.1, 0.1]} />
                    <meshStandardMaterial color={frameColor} />
                </mesh>

                {/* Vertical Panel Dividers (making 4 panels) */}
                {[-0.8, 0, 0.8].map((x) => (
                    <mesh key={`divider-${x}`} position={[x, 0.7, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.08, 1.4, 0.08]} />
                        <meshStandardMaterial color={frameColor} />
                    </mesh>
                ))}

                {/* Mesh Pattern per panel */}
                {[-1.2, -0.4, 0.4, 1.2].map((panelX) => (
                    <group key={`panel-${panelX}`}>
                        {[0.28, 0.56, 0.84, 1.12].map((y) => (
                            <mesh key={`ph-${y}`} position={[panelX, y, 0]} castShadow receiveShadow>
                                <boxGeometry args={[0.7, 0.02, 0.02]} />
                                <meshStandardMaterial color={frameColor} opacity={0.6} transparent />
                            </mesh>
                        ))}
                        {[panelX - 0.2, panelX, panelX + 0.2].map((vx) => (
                            <mesh key={`pv-${vx}`} position={[vx, 0.7, 0]} castShadow receiveShadow>
                                <boxGeometry args={[0.02, 1.4, 0.02]} />
                                <meshStandardMaterial color={frameColor} opacity={0.6} transparent />
                            </mesh>
                        ))}
                    </group>
                ))}
            </group>

            {/* Axles */}
            {axleZ.map((z, i) => (
                <mesh key={`ax-${i}`} position={[0, -0.8, z]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.08, 0.08, 3.28, 18]} />
                    <meshStandardMaterial color={frameColor} roughness={0.56} metalness={0.46} />
                </mesh>
            ))}

            {/* Wheels */}
            {axleZ.flatMap((z, i) => [
                <ShowcaseWheel key={`wr-${i}`} position={[1.76, -0.96, z]} tireColor="#14181f" scale={tireScale} />,
                <ShowcaseWheel key={`wl-${i}`} position={[-1.76, -0.96, z]} tireColor="#14181f" scale={tireScale} />,
            ])}
        </group>
    );
}

function ShowcaseWheel({ position, tireColor, scale }: { position: [number, number, number]; tireColor: string; scale: number }) {
    return (
        <group position={position} scale={[scale, scale, scale]}>
            {/* Main Tire Body (Smooth/Plain) */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                <cylinderGeometry args={[0.44, 0.44, 0.3, 32]} />
                <meshStandardMaterial color={tireColor} roughness={0.85} metalness={0.1} />
            </mesh>

            {/* Outer Rim Lip */}
            <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.265, 0.265, 0.34, 32]} />
                <meshStandardMaterial color="#9ca3af" roughness={0.4} metalness={0.7} />
            </mesh>

            {/* Recessed Rim Face (Stamped Steel Look) */}
            <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.22, 0.04, 32]} />
                <meshPhysicalMaterial color="#d1d5db" roughness={0.3} metalness={0.8} clearcoat={0.3} />
            </mesh>

            {/* Star-Shaped 8-Hole Pattern */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const angle = (i * Math.PI * 2) / 8;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * 0.155,
                            Math.sin(angle) * 0.155,
                            0.13
                        ]}
                        rotation={[Math.PI / 2, 0, -angle]}
                        castShadow
                    >
                        {/* Triangular/Star-ish hole shape */}
                        <cylinderGeometry args={[0.035, 0.02, 0.04, 3]} />
                        <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
                    </mesh>
                );
            })}

            {/* Central Hub Cap (Smooth Dome) */}
            <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <sphereGeometry args={[0.07, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshPhysicalMaterial color="#f3f4f6" metalness={0.98} roughness={0.02} clearcoat={1} />
            </mesh>
            {/* Lug Nuts */}
            {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i * Math.PI * 2) / 5;
                return (
                    <mesh
                        key={`lug-${i}`}
                        position={[Math.cos(angle) * 0.09, Math.sin(angle) * 0.09, 0.15]}
                        rotation={[Math.PI / 2, 0, 0]}
                    >
                        <cylinderGeometry args={[0.015, 0.015, 0.02, 6]} />
                        <meshStandardMaterial color="#d1d5db" metalness={0.9} />
                    </mesh>
                );
            })}
        </group>
    );
}
