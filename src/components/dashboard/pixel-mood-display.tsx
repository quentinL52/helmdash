'use client';

import React from 'react';
import { useFounderStore } from '@/store/founder-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// 8x8 grid: 0=transparent, 1=body, 2=eye, 3=mouth, 4=detail
const SLIME_FRAMES = {
    great: {
        color: '#10b981', // emerald
        eye: '#ffffff',
        mouth: '#ffffff',
        matrix: [
            [0,0,0,0,0,0,0,0],
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,2,1,1,2,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,3,1,1,3,1,1],
            [1,1,1,3,3,1,1,1],
            [1,1,1,1,1,1,1,1],
        ],
        anim: 'animate-bounce'
    },
    good: {
        color: '#3b82f6', // blue
        eye: '#ffffff',
        mouth: '#ffffff',
        matrix: [
            [0,0,0,0,0,0,0,0],
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,2,1,1,2,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,3,3,3,3,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
        ],
        anim: 'animate-pulse'
    },
    neutral: {
        color: '#6b7280', // gray
        eye: '#ffffff',
        mouth: '#ffffff',
        matrix: [
            [0,0,0,0,0,0,0,0],
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,2,2,1,2,2,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,3,3,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
        ],
        anim: ''
    },
    bad: {
        color: '#f97316', // orange
        eye: '#ffffff',
        mouth: '#ffffff',
        matrix: [
            [0,0,0,0,0,0,0,0],
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,2,1,1,2,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,3,3,1,1,1],
            [1,1,3,1,1,3,1,1],
            [1,1,1,1,1,1,1,1],
        ],
        anim: 'hover:animate-shake'
    },
    terrible: {
        color: '#ef4444', // red
        eye: '#ffffff',
        mouth: '#000000',
        matrix: [
            [0,0,0,0,0,0,0,0],
            [0,0,1,1,1,1,0,0],
            [0,1,2,1,1,2,1,0],
            [1,1,1,2,2,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,3,3,3,3,1,1],
            [1,1,3,3,3,3,1,1],
            [1,1,1,1,1,1,1,1],
        ],
        anim: 'animate-pulse' // Or a ping
    },
    none: {
        color: '#3f3f46', // dark gray
        eye: '#9ca3af',
        mouth: '#9ca3af',
        matrix: [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,2,2,1,2,2,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,3,3,1,1,1],
            [1,1,1,1,1,1,1,1],
        ],
        anim: ''
    }
};

export function PixelMoodDisplay() {
    const journalEntries = useFounderStore(s => s.journalEntries);
    
    // Check for today's entry
    const today = new Date().toISOString().split('T')[0];
    const todaysEntry = journalEntries.find(e => e.date.split('T')[0] === today);
    
    const currentMood = todaysEntry ? todaysEntry.mood : 'none';
    const config = SLIME_FRAMES[currentMood as keyof typeof SLIME_FRAMES] || SLIME_FRAMES.none;

    const labels = {
        great: "On Fire ! 🔥",
        good: "Bien 🚀",
        neutral: "Focus 🧠",
        bad: "Fatigué 🔋",
        terrible: "Burnout 🧟",
        none: "En attente..."
    };

    return (
        <Card className="h-full flex flex-col justify-between overflow-hidden relative">
            <CardHeader className="pb-2 z-10">
                <CardTitle className="text-sm font-medium">Humeur du jour</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1 py-4 z-10">
                <div className={cn("w-20 h-20 relative mb-4", config.anim)}>
                    <svg viewBox="0 0 8 8" className="w-full h-full drop-shadow-md" style={{ shapeRendering: 'crispEdges' }}>
                        {config.matrix.map((row, y) => 
                            row.map((val, x) => {
                                if (val === 0) return null;
                                let fill = config.color;
                                if (val === 2) fill = config.eye;
                                if (val === 3) fill = config.mouth;
                                return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />
                            })
                        )}
                    </svg>
                    {currentMood === 'none' && (
                        <>
                            <div className="absolute -top-2 -right-2 text-xl font-mono animate-bounce delay-100 text-muted-foreground">Z</div>
                            <div className="absolute -top-6 -right-6 text-sm font-mono animate-bounce text-muted-foreground">z</div>
                        </>
                    )}
                </div>
                
                <div className="text-center bg-background/50 backdrop-blur-sm rounded-lg px-3 py-1">
                    <p className="font-bold text-lg">{labels[currentMood as keyof typeof labels]}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {currentMood === 'none' ? "Remplissez votre journal" : "Dernière entrée"}
                    </p>
                </div>
            </CardContent>

            {/* Decorative background blur */}
            <div 
                className="absolute inset-0 opacity-10 blur-3xl z-0 transition-colors duration-1000" 
                style={{ backgroundColor: config.color }} 
            />
        </Card>
    );
}
