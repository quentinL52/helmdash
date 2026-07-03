'use client';

import { useMemo } from 'react';
import { AlertTriangle, TrendingUp, Zap, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { translations } from '@/lib/translations';
import { getAlertSeverityColor } from '@/lib/competitive-intelligence';
import type { CompetitiveAlert } from '@/store/founder-store';

interface AlertFeedProps {
    alerts: CompetitiveAlert[];
    onAcknowledge: (alertId: string) => void;
    language: 'fr' | 'en';
}

const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
};

function getAlertIcon(type: string) {
    switch (type) {
        case 'threat':
            return <AlertTriangle className="h-4 w-4 shrink-0" />;
        case 'opportunity':
            return <TrendingUp className="h-4 w-4 shrink-0" />;
        case 'action_required':
            return <Zap className="h-4 w-4 shrink-0" />;
        case 'info':
        default:
            return <Info className="h-4 w-4 shrink-0" />;
    }
}

export function AlertFeed({ alerts, onAcknowledge, language }: AlertFeedProps) {
    const t = translations[language].competitiveWatch.alerts;

    // Sort: unacknowledged first, then by severity (critical > high > medium > low)
    const sortedAlerts = useMemo(() => {
        return [...alerts].sort((a, b) => {
            // Unacknowledged before acknowledged
            const aAcked = a.acknowledgedAt ? 1 : 0;
            const bAcked = b.acknowledgedAt ? 1 : 0;
            if (aAcked !== bAcked) return aAcked - bAcked;

            // Then by severity
            const aSev = severityOrder[a.severity] ?? 4;
            const bSev = severityOrder[b.severity] ?? 4;
            return aSev - bSev;
        });
    }, [alerts]);

    if (alerts.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                {t.noAlerts}
            </div>
        );
    }

    return (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {sortedAlerts.map((alert) => {
                const isAcknowledged = !!alert.acknowledgedAt;
                const severityColor = getAlertSeverityColor(alert.severity);
                const typeLabel = t.types[alert.type] || alert.type;
                const severityLabel = t.severities[alert.severity] || alert.severity;

                return (
                    <div
                        key={alert.id}
                        className={`relative flex items-start gap-3 p-3 rounded-lg bg-card border border-border transition-opacity ${
                            isAcknowledged ? 'opacity-50' : ''
                        }`}
                        style={{ borderLeftWidth: '4px', borderLeftColor: severityColor }}
                    >
                        {/* Icon */}
                        <div
                            className="mt-0.5"
                            style={{ color: severityColor }}
                        >
                            {getAlertIcon(alert.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                            {/* Header: badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                    className="text-[10px] px-1.5 py-0 border-0 font-medium"
                                    style={{
                                        backgroundColor: `${severityColor}20`,
                                        color: severityColor,
                                    }}
                                >
                                    {severityLabel}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">{typeLabel}</span>
                            </div>

                            {/* Title */}
                            <h4 className="text-sm font-semibold text-foreground leading-tight">
                                {alert.title}
                            </h4>

                            {/* Description */}
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {alert.description}
                            </p>

                            {/* Suggested action */}
                            {alert.suggestedAction && (
                                <div className="mt-1.5 flex items-start gap-1.5">
                                    <Zap className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                                    <span className="text-xs text-accent-foreground leading-relaxed">
                                        {alert.suggestedAction}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Acknowledge button / check */}
                        <div className="shrink-0 mt-0.5">
                            {isAcknowledged ? (
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-success/15">
                                    <Check className="h-3.5 w-3.5 text-success" />
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onAcknowledge(alert.id)}
                                    className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                    {t.acknowledge}
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
