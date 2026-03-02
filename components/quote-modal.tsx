'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';

interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const tl = gsap.timeline();

            tl.set(modalRef.current, { display: 'flex' })
                .to(overlayRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' })
                .to(contentRef.current, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: 'expo.out'
                }, '-=0.2');
        } else {
            document.body.style.overflow = 'unset';
            const tl = gsap.timeline();

            tl.to(contentRef.current, {
                y: 50,
                opacity: 0,
                scale: 0.95,
                duration: 0.4,
                ease: 'power2.in'
            })
                .to(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '-=0.2')
                .set(modalRef.current, { display: 'none' });
        }
    }, [isOpen]);

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-[100] hidden items-center justify-center p-4 md:p-10"
        >
            {/* Backdrop Blur Overlay */}
            <div
                ref={overlayRef}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-xl opacity-0 cursor-pointer"
            />

            {/* Modal Content */}
            <div
                ref={contentRef}
                className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden opacity-0 scale-95 translate-y-10"
            >
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
                >
                    <X className="w-6 h-6 text-gray-900" />
                </button>

                <div className="flex flex-col md:flex-row h-full">
                    {/* Left Panel - Branding */}
                    <div className="hidden md:flex md:w-1/3 bg-[#1d1d1f] p-12 flex-col justify-between text-white">
                        <div>
                            <h3 className="text-3xl font-bold tracking-tight mb-4">Get a Custom Quote</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Our engineers are ready to bring your vision to life. Fill out the form and we'll be in touch within 24 hours.
                            </p>
                        </div>
                        <div className="text-sm text-gray-500">
                            Custom Trailers & Fabrication ™
                        </div>
                    </div>

                    {/* Right Panel - Form */}
                    <div className="flex-1 p-10 md:p-16">
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Trailer Type</label>
                                <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-red-500 transition-all outline-none appearance-none">
                                    <option>Standard Semi-Trailer</option>
                                    <option>Custom Lowboy</option>
                                    <option>Flatbed Prototype</option>
                                    <option>Special Fabrication</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Message / Requirements</label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell us about your project..."
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-red-500 transition-all outline-none resize-none"
                                />
                            </div>

                            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg">
                                Send Request
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
