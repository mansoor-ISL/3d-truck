'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scene3D } from './3d-scene';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
    // onScrollProgress: (progress: number) => void; // Removed as per new logic
}

import { QuoteModal } from './quote-modal';

export function HeroSection({ }: HeroSectionProps) {
    const router = useRouter();
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
                        title="Custom Finish"
                        subtitle="From premium high-gloss coatings to full custom branding, our multi-stage finishing process ensures your trailer looks elite and withstands the toughest environments."
                    />
                    <Section
                        active={activeIndex === 1}
                        align="right"
                        title="Elite Performance"
                        subtitle="Heavy-duty reinforced alloy wheels paired with premium industrial tires, engineered for maximum load distribution and long-haul reliability."
                    />
                    <Section
                        active={activeIndex === 2}
                        align="left"
                        title="Superior Strength"
                        subtitle="High-tensile steel chassis and axles engineered for extreme torsion resistance. Built to handle the most demanding heavy-haul construction tasks."
                    />
                    <Section
                        active={activeIndex === 3}
                        align="right"
                        title="Precision Loading"
                        subtitle="Advanced rear loading systems featuring dual-stage hydraulics for effortless operation with heavy machinery and industrial equipment."
                    />
                    <Section
                        active={activeIndex === 4}
                        align="left"
                        title="Limitless Capacity"
                        subtitle="Engineered for a massive 40-ton payload. Our reinforced structural design and precision weight distribution ensure stability under peak demand."
                    />
                    <Section
                        active={activeIndex === 5}
                        align="right"
                        title="Expert Craftsmanship"
                        subtitle="Precision engineering meets master fabrication. Every trailer is a bespoke masterpiece built to your exact specifications in our facility."
                    />
                    <Section
                        active={activeIndex === 6}
                        align="fullscreen-center"
                        title="Your Vision, Built"
                        subtitle="Let's start your custom fabrication journey today. Click below to get a specialized quote tailored to your business needs."
                        onBtnClick={() => router.push('/home')}
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
    align: 'left' | 'right' | 'center' | 'center-bottom' | 'fullscreen-center';
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
        'center-bottom': 'left-1/2 bottom-24 -translate-x-1/2 text-center max-w-3xl',
        'fullscreen-center': 'inset-0 flex items-center justify-center text-center px-6'
    };

    return (
        <div
            ref={sectionRef}
            className={`absolute flex flex-col transition-all duration-500 pointer-events-none hidden ${alignmentClasses[align]}`}
            style={{ opacity: 0, transform: 'translateY(10px)', marginTop: "10%" }}
        >
            <div className={`bg-white/10 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] border border-white/20 shadow-2xl flex flex-col items-center ${align === 'fullscreen-center' ? 'w-full max-w-2xl mx-auto' : ''}`}>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9] mb-4 drop-shadow-2xl">
                    {title}
                </h2>
                <div className={`w-16 h-1.5 bg-red-600 mb-6 rounded-full ${align === 'right' ? 'ml-auto' : 'mx-auto'}`} />
                <p className="text-lg md:text-xl text-white font-medium leading-relaxed opacity-95 mb-8 drop-shadow-lg">
                    {subtitle}
                </p>

                {onBtnClick && (
                    <button
                        onClick={onBtnClick}
                        className="pointer-events-auto bg-white hover:bg-neutral-200 text-black font-black py-6 px-16 rounded-full text-2xl transition-all shadow-2xl transform hover:scale-105 active:scale-95"
                    >
                        CUSTOMIZE YOUR TRAILER
                    </button>
                )}
            </div>
        </div>
    );
}
