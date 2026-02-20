'use client';

import { useEffect, useState } from 'react';
import { getHealthScoreColor } from '@/lib/competitive-intelligence';

interface HealthScoreGaugeProps {
    score: number; // 0-100
    size?: number; // Default 120
    label?: string;
}

export function HealthScoreGauge({ score, size = 120, label }: HealthScoreGaugeProps) {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    // Clamp score to 0-100. Handle NaN/undefined.
    const safeScore = Number.isFinite(score) ? score : 0;
    const clampedScore = Math.min(100, Math.max(0, safeScore));
    const color = getHealthScoreColor(clampedScore);

    // SVG geometry
    const strokeWidth = size * 0.08; // Proportional stroke
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    // Arc spans 270 degrees (from 135deg to 405deg / -225deg to 45deg)
    // Start angle: 135 degrees (bottom-left)
    // End angle: 405 degrees (bottom-right, going clockwise)
    const startAngle = 135;
    const totalArcDegrees = 270;
    const circumference = 2 * Math.PI * radius;
    const arcLength = (totalArcDegrees / 360) * circumference;
    const dashOffset = arcLength - (animatedProgress / 100) * arcLength;

    // Convert polar to cartesian for SVG arc
    const polarToCartesian = (angleDeg: number) => {
        const angleRad = ((angleDeg - 90) * Math.PI) / 180;
        return {
            x: center + radius * Math.cos(angleRad),
            y: center + radius * Math.sin(angleRad),
        };
    };

    const startPoint = polarToCartesian(startAngle);

    // Font sizes proportional to component size
    const scoreFontSize = size * 0.3;
    const labelFontSize = size * 0.1;

    // Trigger animation on mount / score change
    useEffect(() => {
        // Small delay so the transition is visible
        const timer = setTimeout(() => {
            setAnimatedProgress(clampedScore);
        }, 50);
        return () => clearTimeout(timer);
    }, [clampedScore]);

    return (
        <div className="flex flex-col items-center gap-1">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible"
            >
                {/* Background track */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#2b2d36"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${arcLength} ${circumference}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    transform={`rotate(${startAngle - 90 + 180}, ${center}, ${center})`}
                    style={{
                        transform: `rotate(${startAngle}deg)`,
                        transformOrigin: `${center}px ${center}px`,
                    }}
                />

                {/* Colored progress arc */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${arcLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    style={{
                        transform: `rotate(${startAngle}deg)`,
                        transformOrigin: `${center}px ${center}px`,
                        transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.4s ease',
                    }}
                />

                {/* Score number */}
                <text
                    x={center}
                    y={center + scoreFontSize * 0.1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#e8e9ed"
                    fontSize={scoreFontSize}
                    fontWeight="bold"
                    fontFamily="inherit"
                >
                    {clampedScore}
                </text>
            </svg>

            {label && (
                <span
                    className="text-muted-foreground text-center leading-tight"
                    style={{ fontSize: `${Math.max(labelFontSize, 11)}px` }}
                >
                    {label}
                </span>
            )}
        </div>
    );
}
