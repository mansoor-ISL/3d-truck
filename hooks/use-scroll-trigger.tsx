'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollTrigger() {
    const [scrollProgress, setScrollProgress] = useState(0);
    const triggerRef = useRef<any>(null);

    useEffect(() => {
        // Create a scroll trigger that tracks progress
        const trigger = ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                setScrollProgress(self.progress);
            },
        });

        triggerRef.current = trigger;

        return () => {
            if (triggerRef.current) {
                triggerRef.current.kill();
            }
        };
    }, []);

    return scrollProgress;
}
