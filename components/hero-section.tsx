'use client';

import { useRef, useEffect, useState } from 'react';
import { Scene3D } from './3d-scene';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
    // onScrollProgress: (progress: number) => void; // Removed as per new logic
}

import { QuoteModal } from './quote-modal';

export function HeroSection({ }: HeroSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        const trigger = ScrollTrigger.create({
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 2.5, // Ultra-smooth for slow 360 rotations
            snap: {
                snapTo: 1 / 6,
                duration: { min: 0.3, max: 0.8 },
                delay: 0.05,
                ease: 'power2.inOut'
            },
            onUpdate: (self) => {
                setScrollProgress(self.progress);

                // Strict section indexing for 7 exact snap points (0 to 6)
                const index = Math.round(self.progress * 6);
                setActiveIndex(index);
            },
        });

        return () => trigger.kill();
    }, []);

    return (
        <div ref={containerRef} className="relative h-[4900vh] w-full">
            <QuoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Fixed Background Image */}
            <div className="fixed inset-0 z-0 h-full w-full">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url("/background.png")' }}
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[10px]" />
            </div>

            {/* Fixed 3D Canvas Background */}
            <div className="fixed inset-0 z-10 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
                <Scene3D scrollProgress={scrollProgress} />

                {/* UI Overlay with Safe Zones */}
                <div className="absolute inset-0 w-full h-full max-w-7xl mx-auto px-10">
                    <Section
                        active={activeIndex === 0}
                        align="left"
                        title="Body Color"
                        subtitle="Our multi-stage painting process ensures a flawless, high-gloss Electric Blue finish that resists the harshest elements while maintaining a premium look."
                    />
                    <Section
                        active={activeIndex === 1}
                        align="right"
                        title="Precision Wheels"
                        subtitle="Heavy-duty reinforced alloy wheels paired with industrial-grade tires, designed for extreme load distribution and long-haul reliability."
                    />
                    <Section
                        active={activeIndex === 2}
                        align="left"
                        title="Heavy Axles"
                        subtitle="High-tensile steel axles engineered for superior torsion resistance. Built to handle the most demanding heavy-haul construction and logistics tasks."
                    />
                    <Section
                        active={activeIndex === 3}
                        align="right"
                        title="Hydraulic Ramps"
                        subtitle="Custom-fabricated rear ramp system featuring dual-stage hydraulics for effortless loading of heavy machinery and industrial equipment."
                    />
                    <Section
                        active={activeIndex === 4}
                        align="left"
                        title="Load Capacity"
                        subtitle="Engineered for a massive 40-ton payload. The reinforced structural beams and multi-point weight distribution system ensure stability under peak demand."
                    />
                    <Section
                        active={activeIndex === 5}
                        align="center"
                        title="Fabrication"
                        subtitle="Precision engineering meets master craftsmanship. Every trailer is a masterpiece of custom fabrication built right here in our facility."
                    />
                    <Section
                        active={activeIndex === 6}
                        align="center-bottom"
                        title="Ready to Build?"
                        subtitle="Let's start your custom fabrication journey today. Click below to get a specialized quote tailored to your exact specifications."
                        onBtnClick={() => setIsModalOpen(true)}
                    />
                </div>
            </div>

            {/* Scroll Proxy Sections */}
            <div className="relative z-20">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-screen pointer-events-none" />
                ))}
                <div className="h-screen flex items-end justify-center pb-24">
                </div>
            </div>
        </div>
    );
}

interface SectionProps {
    active: boolean;
    title: string;
    subtitle: string;
    align: 'left' | 'right' | 'center' | 'center-bottom';
    onBtnClick?: () => void;
}

function Section({ active, title, subtitle, align, onBtnClick }: SectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (active) {
            if (sectionRef.current) sectionRef.current.style.display = 'block';
            gsap.to(sectionRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power3.out',
            });
        } else {
            gsap.to(sectionRef.current, {
                opacity: 0,
                y: -10,
                duration: 0.3,
                ease: 'power3.in',
                onComplete: () => {
                    if (sectionRef.current) sectionRef.current.style.display = 'none';
                }
            });
        }
    }, [active]);

    const alignmentClasses = {
        'left': 'left-6 top-[20%] text-left max-w-lg',
        'right': 'right-6 top-[20%] text-right max-w-lg items-end',
        'center': 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-2xl',
        'center-bottom': 'left-1/2 bottom-24 -translate-x-1/2 text-center max-w-3xl'
    };

    return (
        <div
            ref={sectionRef}
            className={`absolute flex flex-col transition-all duration-500 pointer-events-none hidden ${alignmentClasses[align]}`}
            style={{ opacity: 0, transform: 'translateY(10px)' }}
        >
            <div className="bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/20 shadow-2xl flex flex-col items-center">
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase leading-[0.85] mb-6 drop-shadow-2xl">
                    {title}
                </h2>
                <div className={`w-20 h-2 bg-red-600 mb-8 rounded-full ${align === 'right' ? 'ml-auto' : 'mx-auto'}`} />
                <p className="text-xl md:text-2xl text-white font-medium leading-relaxed opacity-95 mb-10 drop-shadow-lg">
                    {subtitle}
                </p>

                {onBtnClick && (
                    <button
                        onClick={onBtnClick}
                        className="pointer-events-auto bg-white hover:bg-neutral-200 text-black font-black py-6 px-16 rounded-full text-2xl transition-all shadow-2xl transform hover:scale-105 active:scale-95"
                    >
                        GET CUSTOM QUOTE
                    </button>
                )}
            </div>
        </div>
    );
}
