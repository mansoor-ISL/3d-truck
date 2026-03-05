'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TrailerConfigurator, TrailerConfig } from '@/components/trailer-configurator';

const DEFAULT_CONFIG: TrailerConfig = {
    bodyColor: '#d7262b',
    accentColor: '#0a0a0a',
    tireColor: '#0b0b0d',
    tireStyle: 'highway',
    trailerLength: 1,
    liftHeight: 0.12,
    spinSpeed: 0.01,
    axleSetup: 'dual',
    deckStyle: 'flat',
    railHeight: 'medium',
};

export default function TrailerHomePage() {
    const router = useRouter();
    const [config, setConfig] = useState<TrailerConfig>(DEFAULT_CONFIG);

    return (
        <TrailerConfigurator
            config={config}
            onConfigChange={setConfig}
            onReset={() => setConfig(DEFAULT_CONFIG)}
            onBack={() => router.push('/')}
        />
    );
}
