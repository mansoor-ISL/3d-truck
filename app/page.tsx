'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/hero-section';

export default function Home() {
    const [scrollProgress, setScrollProgress] = useState(0);

    return (
        <main className="w-full bg-white">
            <HeroSection onScrollProgress={setScrollProgress} />
        </main>
    );
}
