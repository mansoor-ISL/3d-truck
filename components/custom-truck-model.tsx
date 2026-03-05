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
    const frameColorBySection = ['#0a0a0a', '#111827', '#10151f', '#0f172a', '#0a0a0a', '#121826', '#0a0a0a'];
    const deckColorBySection = ['#8b95a3', '#8a96aa', '#788395', '#7f8b9f', '#657285', '#8b95a3', '#8b95a3'];

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

            <RoundedBox args={[2.8, 0.16, 7.8]} radius={0.02} smoothness={2} position={[0, -0.09 + deckDrop * 0.5, 0]} castShadow receiveShadow>
                <meshStandardMaterial color={deckColor} roughness={0.78} metalness={0.06} />
            </RoundedBox>

            {[-3.4, -2.4, -1.4, -0.4, 0.6, 1.6, 2.6, 3.5].map((z) => (
                <mesh key={z} position={[0, 0.0 + (z < -2.5 ? deckDrop : 0), z]} castShadow receiveShadow>
                    <boxGeometry args={[2.7, 0.05, 0.8]} />
                    <meshStandardMaterial color={deckColor} roughness={0.88} metalness={0.04} />
                </mesh>
            ))}

            <mesh position={[1.48, railY, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.1, railHeight, 8.4]} />
                <meshStandardMaterial color={frameColor} roughness={0.52} metalness={0.48} />
            </mesh>
            <mesh position={[-1.48, railY, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.1, railHeight, 8.4]} />
                <meshStandardMaterial color={frameColor} roughness={0.52} metalness={0.48} />
            </mesh>

            {[-3.9, -2.4, -0.9, 0.6, 2.1, 3.6].flatMap((z) => [
                <mesh key={`post-r-${z}`} position={[1.48, railHeight / 2 + 0.14, z]} castShadow receiveShadow>
                    <boxGeometry args={[0.1, railHeight, 0.1]} />
                    <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.5} />
                </mesh>,
                <mesh key={`post-l-${z}`} position={[-1.48, railHeight / 2 + 0.14, z]} castShadow receiveShadow>
                    <boxGeometry args={[0.1, railHeight, 0.1]} />
                    <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.5} />
                </mesh>,
            ])}

            <mesh position={[0.52, -0.43, 5.05]} rotation={[0, 0.14, -0.02]} castShadow receiveShadow>
                <boxGeometry args={[0.16, 0.18, 3.4]} />
                <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.56} />
            </mesh>
            <mesh position={[-0.52, -0.43, 5.05]} rotation={[0, -0.14, 0.02]} castShadow receiveShadow>
                <boxGeometry args={[0.16, 0.18, 3.4]} />
                <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.56} />
            </mesh>

            <mesh position={[0, -0.85, 6.15]} castShadow receiveShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.9, 18]} />
                <meshStandardMaterial color={frameColor} roughness={0.48} metalness={0.58} />
            </mesh>

            <mesh position={[0, 0.58, -4.25]} castShadow receiveShadow>
                <boxGeometry args={[2.95, 0.1, 0.1]} />
                <meshStandardMaterial color={frameColor} roughness={0.52} metalness={0.46} />
            </mesh>

            <mesh position={[0.7, -0.2 + deckDrop, -4.7]} rotation={[rampAngle, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.55, 0.08, 1.55]} />
                <meshStandardMaterial color={frameColor} roughness={0.58} metalness={0.44} />
            </mesh>
            <mesh position={[-0.7, -0.2 + deckDrop, -4.7]} rotation={[rampAngle, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.55, 0.08, 1.55]} />
                <meshStandardMaterial color={frameColor} roughness={0.58} metalness={0.44} />
            </mesh>

            {axleZ.map((z, i) => (
                <mesh key={`ax-${i}`} position={[0, -0.8, z]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.08, 0.08, 3.28, 18]} />
                    <meshStandardMaterial color={frameColor} roughness={0.56} metalness={0.46} />
                </mesh>
            ))}

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
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                <cylinderGeometry args={[0.44, 0.44, 0.3, 32]} />
                <meshStandardMaterial color={tireColor} roughness={0.82} metalness={0.08} />
            </mesh>

            <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                <cylinderGeometry args={[0.26, 0.26, 0.33, 28]} />
                <meshPhysicalMaterial color="#c6d0df" roughness={0.2} metalness={0.82} clearcoat={1} clearcoatRoughness={0.1} />
            </mesh>
        </group>
    );
}
