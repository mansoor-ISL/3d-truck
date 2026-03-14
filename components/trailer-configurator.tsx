'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, RoundedBox } from '@react-three/drei';
import { Group } from 'three';
import { Button } from '@/components/ui/button';

export type TireStyle = 'highway' | 'offroad' | 'sport';
export type AxleSetup = 'dual' | 'triple';
export type DeckStyle = 'flat' | 'beavertail';
export type RailHeight = 'low' | 'medium' | 'high';

export interface TrailerConfig {
    bodyColor: string;
    accentColor: string;
    tireColor: string;
    tireStyle: TireStyle;
    trailerLength: number;
    liftHeight: number;
    spinSpeed: number;
    axleSetup: AxleSetup;
    deckStyle: DeckStyle;
    railHeight: RailHeight;
}

interface TrailerConfiguratorProps {
    config: TrailerConfig;
    onConfigChange: (next: TrailerConfig) => void;
    onReset: () => void;
    onBack: () => void;
}

const BODY_SWATCHES = [
    '#e3c5a8', '#8d9aa5', '#6b7280', '#9ca3af', '#b45309', '#14532d', '#334155',
    '#d7262b', '#0e1a2b', '#f7f7f7', '#1f6feb', '#7c2d12', '#0f766e',
];

const ACCENT_SWATCHES = [
    '#0a0a0a', '#111827', '#1f2937', '#334155', '#4b5563', '#3f3f46',
    '#7f1d1d', '#14532d', '#1d4ed8', '#78350f', '#9ca3af', '#f8fafc',
];

const TIRE_SWATCHES = ['#0b0b0d', '#1f2937', '#374151', '#4b5563', '#6b7280'];

const TIRE_STYLE_OPTIONS: Array<{ key: TireStyle; label: string; image: string; desc: string }> = [
    { key: 'highway', label: 'Highway', image: '/tyres/highway.svg', desc: 'Balanced road comfort' },
    { key: 'offroad', label: 'Offroad', image: '/tyres/offroad.svg', desc: 'Deep tread, heavy load' },
    { key: 'sport', label: 'Sport', image: '/tyres/sport.svg', desc: 'Low profile + sharp look' },
];

export function TrailerConfigurator({ config, onConfigChange, onReset, onBack }: TrailerConfiguratorProps) {
    return (
        <div className="min-h-screen w-full bg-[#070b14] text-white">
            <div className="mx-auto flex w-full max-w-[1680px] flex-col lg:h-screen lg:flex-row">
                <section className="relative h-[58vh] w-full overflow-hidden border-b border-white/10 lg:h-screen lg:flex-1 lg:border-b-0 lg:border-r">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(53,88,170,0.32),transparent_45%),radial-gradient(circle_at_80%_90%,rgba(215,38,43,0.18),transparent_45%)]" />

                    <Canvas camera={{ position: [0, 3.6, 13.2], fov: 35 }} gl={{ antialias: true, alpha: true }} shadows>
                        <color attach="background" args={['#070b14']} />
                        <fog attach="fog" args={['#070b14', 16, 36]} />

                        <hemisphereLight intensity={0.62} groundColor="#0a1224" />
                        <ambientLight intensity={0.32} />
                        <spotLight
                            position={[13, 17, 9]}
                            intensity={1.75}
                            angle={0.34}
                            penumbra={0.5}
                            castShadow
                            shadow-mapSize-width={1024}
                            shadow-mapSize-height={1024}
                        />
                        <pointLight position={[-10, 5, -8]} intensity={0.6} color="#9bb6ff" />
                        <pointLight position={[8, 3, 10]} intensity={0.45} color="#ffd8bf" />

                        <RoadStage />
                        <UtilityTrailerModel config={config} />

                        <ContactShadows position={[0, -1.05, 0]} opacity={0.78} blur={2.6} scale={24} far={10} />
                        <Environment preset="city" />

                        <OrbitControls
                            enablePan={false}
                            minDistance={8}
                            maxDistance={18}
                            minPolarAngle={Math.PI / 3.8}
                            maxPolarAngle={Math.PI / 1.8}
                        />
                    </Canvas>

                    <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/80">
                        Interactive Trailer Studio
                    </div>
                </section>

                <aside className="w-full bg-[#0f1728] px-5 py-6 sm:px-8 lg:h-screen lg:w-[460px] lg:overflow-y-auto">
                    <div className="mb-8">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/55">Custom Builder</p>
                        <h1 className="mt-2 text-3xl font-black leading-tight">Build Your Trailer</h1>
                        <p className="mt-3 text-sm text-white/70">
                            Realistic utility trailer with live options for paint, tires, axle setup, deck and rails.
                        </p>
                    </div>

                    <ConfigSection title="Body / Deck Tone">
                        <SwatchRow
                            colors={BODY_SWATCHES}
                            selected={config.bodyColor}
                            onPick={(bodyColor) => onConfigChange({ ...config, bodyColor })}
                        />
                    </ConfigSection>

                    <ConfigSection title="Frame Color">
                        <SwatchRow
                            colors={ACCENT_SWATCHES}
                            selected={config.accentColor}
                            onPick={(accentColor) => onConfigChange({ ...config, accentColor })}
                        />
                    </ConfigSection>

                    <ConfigSection title="Tire Color">
                        <SwatchRow
                            colors={TIRE_SWATCHES}
                            selected={config.tireColor}
                            onPick={(tireColor) => onConfigChange({ ...config, tireColor })}
                        />
                    </ConfigSection>

                    <ConfigSection title="Tire Type">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {TIRE_STYLE_OPTIONS.map((item) => {
                                const active = config.tireStyle === item.key;
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => onConfigChange({ ...config, tireStyle: item.key })}
                                        className={`rounded-xl border p-2 text-left transition ${active
                                            ? 'border-red-400 bg-red-500/15 shadow-[0_0_0_1px_rgba(248,113,113,0.4)]'
                                            : 'border-white/20 bg-transparent hover:border-white/45'
                                            }`}
                                    >
                                        <img src={item.image} alt={item.label} className="h-14 w-full rounded-md object-cover" />
                                        <p className="mt-2 text-sm font-semibold">{item.label}</p>
                                        <p className="text-xs text-white/65">{item.desc}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </ConfigSection>

                    <ConfigSection title="Axle Setup">
                        <div className="grid grid-cols-2 gap-2">
                            <StyleButton
                                label="Dual Axle"
                                active={config.axleSetup === 'dual'}
                                onClick={() => onConfigChange({ ...config, axleSetup: 'dual' })}
                            />
                            <StyleButton
                                label="Triple Axle"
                                active={config.axleSetup === 'triple'}
                                onClick={() => onConfigChange({ ...config, axleSetup: 'triple' })}
                            />
                        </div>
                    </ConfigSection>

                    <ConfigSection title="Deck Style">
                        <div className="grid grid-cols-2 gap-2">
                            <StyleButton
                                label="Flat Deck"
                                active={config.deckStyle === 'flat'}
                                onClick={() => onConfigChange({ ...config, deckStyle: 'flat' })}
                            />
                            <StyleButton
                                label="Beavertail"
                                active={config.deckStyle === 'beavertail'}
                                onClick={() => onConfigChange({ ...config, deckStyle: 'beavertail' })}
                            />
                        </div>
                    </ConfigSection>

                    <ConfigSection title="Rail Height">
                        <div className="grid grid-cols-3 gap-2">
                            <StyleButton
                                label="Low"
                                active={config.railHeight === 'low'}
                                onClick={() => onConfigChange({ ...config, railHeight: 'low' })}
                            />
                            <StyleButton
                                label="Medium"
                                active={config.railHeight === 'medium'}
                                onClick={() => onConfigChange({ ...config, railHeight: 'medium' })}
                            />
                            <StyleButton
                                label="High"
                                active={config.railHeight === 'high'}
                                onClick={() => onConfigChange({ ...config, railHeight: 'high' })}
                            />
                        </div>
                    </ConfigSection>

                    <ConfigSection title="Size & Motion">
                        <RangeInput
                            label="Trailer Length"
                            min={0.9}
                            max={1.35}
                            step={0.01}
                            value={config.trailerLength}
                            onChange={(trailerLength) => onConfigChange({ ...config, trailerLength })}
                        />
                        <RangeInput
                            label="Lift Height"
                            min={-0.2}
                            max={0.8}
                            step={0.01}
                            value={config.liftHeight}
                            onChange={(liftHeight) => onConfigChange({ ...config, liftHeight })}
                        />
                        <RangeInput
                            label="Auto Spin"
                            min={0}
                            max={0.04}
                            step={0.001}
                            value={config.spinSpeed}
                            onChange={(spinSpeed) => onConfigChange({ ...config, spinSpeed })}
                        />
                    </ConfigSection>

                    <div className="mt-10 flex flex-wrap gap-3">
                        <Button onClick={onReset} className="rounded-full bg-white px-6 text-black hover:bg-white/90">
                            Reset Config
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onBack}
                            className="rounded-full border-white/25 bg-transparent px-6 text-white hover:bg-white/10"
                        >
                            Back to Landing
                        </Button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function RoadStage() {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
                <planeGeometry args={[80, 120]} />
                <meshStandardMaterial color="#101826" roughness={0.95} metalness={0.03} />
            </mesh>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.095, 0]} receiveShadow>
                <planeGeometry args={[11, 120]} />
                <meshStandardMaterial color="#1a2434" roughness={0.85} metalness={0.05} />
            </mesh>

            {Array.from({ length: 14 }).map((_, i) => {
                const z = -56 + i * 8.5;
                return (
                    <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.091, z]}>
                        <planeGeometry args={[0.42, 4.2]} />
                        <meshStandardMaterial color="#f9fafb" roughness={0.3} metalness={0.1} />
                    </mesh>
                );
            })}

            <mesh position={[0, 10, -38]}>
                <planeGeometry args={[90, 40]} />
                <meshBasicMaterial color="#0a1324" />
            </mesh>
        </group>
    );
}

function UtilityTrailerModel({ config }: { config: TrailerConfig }) {
    const root = useRef<Group>(null);

    const tireSpec = useMemo(() => {
        if (config.tireStyle === 'offroad') {
            return { scale: 1.16, width: 0.36, roughness: 1, metalness: 0.03, rimMetalness: 0.65 };
        }
        if (config.tireStyle === 'sport') {
            return { scale: 0.9, width: 0.24, roughness: 0.42, metalness: 0.35, rimMetalness: 0.95 };
        }
        return { scale: 1, width: 0.3, roughness: 0.82, metalness: 0.08, rimMetalness: 0.82 };
    }, [config.tireStyle]);

    const axleZ = config.axleSetup === 'triple' ? [1.8, 0.4, -1.1] : [1.2, -0.6];
    const railH = config.railHeight === 'high' ? 0.62 : config.railHeight === 'medium' ? 0.42 : 0.24;
    const railY = 0.28 + railH / 2;
    const rampAngle = config.deckStyle === 'beavertail' ? -0.54 : -0.34;
    const rearDeckDrop = config.deckStyle === 'beavertail' ? -0.22 : -0.02;

    useFrame(() => {
        if (!root.current) return;
        root.current.rotation.y += config.spinSpeed;
        root.current.position.y = 0.24 + config.liftHeight;
    });

    return (
        <group ref={root} rotation={[0, -Math.PI / 7.5, 0]} scale={[1, 1, config.trailerLength]}>
            {/* Main outer frame */}
            <RoundedBox args={[3.2, 0.22, 8.6]} radius={0.03} smoothness={3} position={[0, -0.28, 0]} castShadow receiveShadow>
                <meshStandardMaterial color={config.accentColor} roughness={0.48} metalness={0.55} />
            </RoundedBox>

            {/* Main Deck (Wood finish by default, Plane style) */}
            <RoundedBox args={[2.8, 0.20, 7.8]} radius={0.02} smoothness={2} position={[0, -0.05, 0]} castShadow receiveShadow>
                <meshStandardMaterial color={config.bodyColor} roughness={0.78} metalness={0.06} />
            </RoundedBox>

            {/* Side Rails - Dense Vertical Spindles */}
            {[-3.9, -3.4, -2.9, -2.4, -1.9, -1.4, -0.9, -0.4, 0.1, 0.6, 1.1, 1.6, 2.1, 2.6, 3.1, 3.6].flatMap((z) => [
                <mesh key={`post-r-${z}`} position={[1.48, railH / 2 + 0.14, z]} castShadow receiveShadow>
                    <boxGeometry args={[0.04, railH, 0.04]} />
                    <meshStandardMaterial color={config.accentColor} roughness={0.5} metalness={0.5} />
                </mesh>,
                <mesh key={`post-l-${z}`} position={[-1.48, railH / 2 + 0.14, z]} castShadow receiveShadow>
                    <boxGeometry args={[0.04, railH, 0.04]} />
                    <meshStandardMaterial color={config.accentColor} roughness={0.5} metalness={0.5} />
                </mesh>,
            ])}

            {/* Top Rails */}
            <mesh position={[1.48, railH + 0.14, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.04, 0.04, 8.4, 4]} />
                <meshStandardMaterial color={config.accentColor} roughness={0.52} metalness={0.48} />
            </mesh>
            <mesh position={[-1.48, railH + 0.14, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.04, 0.04, 8.4, 4]} />
                <meshStandardMaterial color={config.accentColor} roughness={0.52} metalness={0.48} />
            </mesh>
            <mesh position={[0, railH + 0.14, 4.18]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                <cylinderGeometry args={[0.04, 0.04, 3.0, 4]} />
                <meshStandardMaterial color={config.accentColor} roughness={0.52} metalness={0.48} />
            </mesh>

            {/* Fenders - Smoother Profile */}
            {[1.7, -1.7].map((x) => (
                <group key={`fender-${x}`} position={[x, -0.3, config.axleSetup === 'triple' ? 0.3 : 0.2]}>
                    {/* Main Curved Top */}
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[0.38, 0.04, config.axleSetup === 'triple' ? 3.8 : 3.0]} />
                        <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.6} />
                    </mesh>
                    {/* Slopes */}
                    <mesh position={[0, -0.22, (config.axleSetup === 'triple' ? 3.8 : 3.0) / 2 + 0.3]} rotation={[0.6, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.38, 0.04, 0.8]} />
                        <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.6} />
                    </mesh>
                    <mesh position={[0, -0.22, -(config.axleSetup === 'triple' ? 3.8 : 3.0) / 2 - 0.3]} rotation={[-0.6, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.38, 0.04, 0.8]} />
                        <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.6} />
                    </mesh>
                    {/* Inner Guard Plate */}
                    <mesh position={[x > 0 ? -0.18 : 0.18, -0.2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.02, 0.4, config.axleSetup === 'triple' ? 3.8 : 3.0]} />
                        <meshStandardMaterial color={config.accentColor} roughness={0.5} />
                    </mesh>
                </group>
            ))}

            {/* Front Tongue Refined */}
            <mesh position={[0.55, -0.4, 5.5]} rotation={[0, 0.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.15, 0.15, 3.8]} />
                <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[-0.55, -0.4, 5.5]} rotation={[0, -0.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.15, 0.15, 3.8]} />
                <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.6} />
            </mesh>

            {/* Jack */}
            <mesh position={[0, -0.6, 6.8]} castShadow receiveShadow>
                <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
                <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.7} />
            </mesh>
            <mesh position={[0, -1.2, 6.8]} castShadow receiveShadow>
                <boxGeometry args={[0.3, 0.05, 0.3]} />
                <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.7} />
            </mesh>

            {/* 4-Panel Mesh Rear Gate (A2Z Detail) */}
            <group position={[0, 0.2, -4.3]} rotation={[rampAngle + 0.2, 0, 0]}>
                {/* Gate Outer Frame */}
                <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
                    <boxGeometry args={[3.2, 0.1, 0.1]} />
                    <meshStandardMaterial color={config.accentColor} />
                </mesh>
                <mesh position={[1.55, 0.7, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.1, 1.5, 0.1]} />
                    <meshStandardMaterial color={config.accentColor} />
                </mesh>
                <mesh position={[-1.55, 0.7, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.1, 1.5, 0.1]} />
                    <meshStandardMaterial color={config.accentColor} />
                </mesh>
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[3.2, 0.1, 0.1]} />
                    <meshStandardMaterial color={config.accentColor} />
                </mesh>

                {/* Vertical Panel Dividers (making 4 panels) */}
                {[-0.8, 0, 0.8].map((x) => (
                    <mesh key={`divider-${x}`} position={[x, 0.7, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.08, 1.4, 0.08]} />
                        <meshStandardMaterial color={config.accentColor} />
                    </mesh>
                ))}

                {/* Mesh Pattern per panel */}
                {[-1.2, -0.4, 0.4, 1.2].map((panelX) => (
                    <group key={`panel-${panelX}`}>
                        {[0.28, 0.56, 0.84, 1.12].map((y) => (
                            <mesh key={`ph-${y}`} position={[panelX, y, 0]} castShadow receiveShadow>
                                <boxGeometry args={[0.7, 0.02, 0.02]} />
                                <meshStandardMaterial color={config.accentColor} opacity={0.6} transparent />
                            </mesh>
                        ))}
                        {[panelX - 0.2, panelX, panelX + 0.2].map((vx) => (
                            <mesh key={`pv-${vx}`} position={[vx, 0.7, 0]} castShadow receiveShadow>
                                <boxGeometry args={[0.02, 1.4, 0.02]} />
                                <meshStandardMaterial color={config.accentColor} opacity={0.6} transparent />
                            </mesh>
                        ))}
                    </group>
                ))}
            </group>

            {/* Axles */}
            {axleZ.map((z, i) => (
                <mesh key={`ax-${i}`} position={[0, -0.8, z]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.08, 0.08, 3.28, 18]} />
                    <meshStandardMaterial color={config.accentColor} roughness={0.56} metalness={0.46} />
                </mesh>
            ))}

            {/* Wheels */}
            {axleZ.flatMap((z, i) => [
                <Wheel
                    key={`wr-${i}`}
                    position={[1.76, -0.96, z]}
                    tireColor={config.tireColor}
                    scale={tireSpec.scale}
                    width={tireSpec.width}
                    tireRoughness={tireSpec.roughness}
                    tireMetalness={tireSpec.metalness}
                    rimMetalness={tireSpec.rimMetalness}
                />,
                <Wheel
                    key={`wl-${i}`}
                    position={[-1.76, -0.96, z]}
                    tireColor={config.tireColor}
                    scale={tireSpec.scale}
                    width={tireSpec.width}
                    tireRoughness={tireSpec.roughness}
                    tireMetalness={tireSpec.metalness}
                    rimMetalness={tireSpec.rimMetalness}
                />,
            ])}

            {/* Reflective strips */}
            {[-3.6, -2.4, -1.2, 0.0, 1.2, 2.4, 3.2].map((z, i) => (
                <mesh key={`strip-r-${z}`} position={[1.53, -0.33, z]}>
                    <boxGeometry args={[0.02, 0.09, 0.45]} />
                    <meshStandardMaterial color={i % 2 === 0 ? '#ef4444' : '#f8fafc'} emissive={i % 2 === 0 ? '#7f1d1d' : '#64748b'} emissiveIntensity={0.6} />
                </mesh>
            ))}
            {[-3.6, -2.4, -1.2, 0.0, 1.2, 2.4, 3.2].map((z, i) => (
                <mesh key={`strip-l-${z}`} position={[-1.53, -0.33, z]}>
                    <boxGeometry args={[0.02, 0.09, 0.45]} />
                    <meshStandardMaterial color={i % 2 === 0 ? '#ef4444' : '#f8fafc'} emissive={i % 2 === 0 ? '#7f1d1d' : '#64748b'} emissiveIntensity={0.6} />
                </mesh>
            ))}

            {/* Rear lights */}
            <mesh position={[1.2, -0.25, -4.27]}>
                <boxGeometry args={[0.18, 0.08, 0.06]} />
                <meshPhysicalMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} roughness={0.2} metalness={0.25} />
            </mesh>
            <mesh position={[-1.2, -0.25, -4.27]}>
                <boxGeometry args={[0.18, 0.08, 0.06]} />
                <meshPhysicalMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} roughness={0.2} metalness={0.25} />
            </mesh>
        </group>
    );
}

function Wheel({
    position,
    tireColor,
    scale,
    width,
    tireRoughness,
    tireMetalness,
    rimMetalness,
}: {
    position: [number, number, number];
    tireColor: string;
    scale: number;
    width: number;
    tireRoughness: number;
    tireMetalness: number;
    rimMetalness: number;
}) {
    return (
        <group position={position} scale={[scale, scale, scale]}>
            {/* Main Tire Body (Smooth/Plain) */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                <cylinderGeometry args={[0.44, 0.44, width, 32]} />
                <meshStandardMaterial color={tireColor} roughness={tireRoughness} metalness={tireMetalness} />
            </mesh>

            {/* Outer Rim Lip */}
            <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.265, 0.265, width + 0.04, 32]} />
                <meshStandardMaterial color="#9ca3af" roughness={0.4} metalness={0.7} />
            </mesh>

            {/* Recessed Rim Face (Stamped Steel Look) */}
            <mesh position={[0, 0, width / 2 - 0.03]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.22, 0.04, 32]} />
                <meshPhysicalMaterial color="#d1d5db" roughness={0.3} metalness={rimMetalness} clearcoat={0.3} />
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
                            width / 2 - 0.02
                        ]}
                        rotation={[Math.PI / 2, 0, -angle]}
                        castShadow
                    >
                        <cylinderGeometry args={[0.035, 0.02, 0.04, 3]} />
                        <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
                    </mesh>
                );
            })}

            {/* Central Hub Cap (Smooth Dome) */}
            <mesh position={[0, 0, width / 2 - 0.01]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <sphereGeometry args={[0.07, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshPhysicalMaterial color="#f3f4f6" metalness={0.98} roughness={0.02} clearcoat={1} />
            </mesh>
            {/* Lug Nuts */}
            {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i * Math.PI * 2) / 5;
                return (
                    <mesh
                        key={`lug-${i}`}
                        position={[Math.cos(angle) * 0.09, Math.sin(angle) * 0.09, width / 2]}
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

function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-6 rounded-2xl border border-white/10 bg-[#111c31] p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-white/70">{title}</h2>
            {children}
        </section>
    );
}

function SwatchRow({
    colors,
    selected,
    onPick,
}: {
    colors: string[];
    selected: string;
    onPick: (color: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
                const active = selected.toLowerCase() === color.toLowerCase();
                return (
                    <button
                        key={color}
                        aria-label={`Select color ${color}`}
                        onClick={() => onPick(color)}
                        className={`h-9 w-9 rounded-full border-2 transition ${active
                            ? 'scale-110 border-white shadow-[0_0_0_4px_rgba(255,255,255,0.15)]'
                            : 'border-white/20 hover:border-white/60'
                            }`}
                        style={{ backgroundColor: color }}
                    />
                );
            })}
        </div>
    );
}

function StyleButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${active
                ? 'border-red-400 bg-red-500/20 text-white'
                : 'border-white/20 bg-transparent text-white/75 hover:border-white/50 hover:text-white'
                }`}
        >
            {label}
        </button>
    );
}

function RangeInput({
    label,
    min,
    max,
    step,
    value,
    onChange,
}: {
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <label className="mb-4 block last:mb-0">
            <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-white/80">{label}</span>
                <span className="rounded-md bg-black/25 px-2 py-0.5 font-mono text-xs text-white/90">{value.toFixed(2)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/20"
            />
        </label>
    );
}
