'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useFounderStore } from '@/store/founder-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Save, MonitorSmartphone, Palette, Calendar, User, Linkedin, PenLine } from 'lucide-react';
import { AISettingsPanel } from '@/components/dashboard/ai-settings-panel';
import { BillingPanel } from '@/components/dashboard/billing-panel';
import { IntegrationsPanel } from '@/components/dashboard/integrations-panel';
import { DataPrivacyPanel } from '@/components/dashboard/data-privacy-panel';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { mvpTargetDate, setMvpTargetDate, founderProfile, setFounderProfile } = useFounderStore();
    const t = useTranslations('settings');

    const [localMvpDate, setLocalMvpDate] = useState(mvpTargetDate || '');
    const [localProfile, setLocalProfile] = useState(founderProfile);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setLocalMvpDate(mvpTargetDate || '');
        setLocalProfile(founderProfile);
    }, [mvpTargetDate, founderProfile]);

    const handleSave = () => {
        setMvpTargetDate(localMvpDate);
        setFounderProfile(localProfile);
        toast({
            title: t('savedTitle'),
            description: t('savedDescription'),
        });
    };

    if (!mounted) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-pixel text-primary flex items-center gap-3">
                        <MonitorSmartphone className="w-8 h-8" />
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t('subtitle')}
                    </p>
                </div>
                <Button onClick={handleSave} className="flex items-center gap-2 font-pixel tracking-wide">
                    <Save className="w-4 h-4" />
                    {t('saveButton')}
                </Button>
            </div>

            <div className="grid gap-6">

                {/* Profile & Identity */}
                <Card className="border-t-4 border-t-cyan-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-pixel text-cyan-500">
                            <User className="w-5 h-5" />
                            {t('profileIdentity')}
                        </CardTitle>
                        <CardDescription>
                            {t('profileIdentityDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    {t('displayName')}
                                </Label>
                                <Input
                                    placeholder={t('displayNamePlaceholder')}
                                    value={localProfile.displayName}
                                    onChange={(e) => setLocalProfile({ ...localProfile, displayName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">
                                    <Linkedin className="w-3.5 h-3.5" />
                                    {t('linkedinUrl')}
                                </Label>
                                <Input
                                    type="url"
                                    placeholder={t('linkedinPlaceholder')}
                                    value={localProfile.linkedinUrl}
                                    onChange={(e) => setLocalProfile({ ...localProfile, linkedinUrl: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('niche')}</Label>
                            <Input
                                placeholder={t('nichePlaceholder')}
                                value={localProfile.niche}
                                onChange={(e) => setLocalProfile({ ...localProfile, niche: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1.5">
                                <PenLine className="w-3.5 h-3.5" />
                                {t('writingStyle')}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {t('writingStyleDesc')}
                            </p>
                            <Textarea
                                className="min-h-[160px] font-mono text-sm"
                                value={localProfile.writingStyleContext}
                                onChange={(e) => setLocalProfile({ ...localProfile, writingStyleContext: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* MVP Date */}
                <Card className="border-t-4 border-t-indigo-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-pixel text-indigo-500">
                            <Calendar className="w-5 h-5" />
                            {t('mvpDateTitle')}
                        </CardTitle>
                        <CardDescription>
                            {t('mvpDateDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-w-sm">
                            <Label>{t('mvpDateLabel')}</Label>
                            <Input
                                type="date"
                                value={localMvpDate}
                                onChange={(e) => setLocalMvpDate(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Theme */}
                <Card className="border-t-4 border-t-amber-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-pixel text-amber-500">
                            <Palette className="w-5 h-5" />
                            {t('appearance')}
                        </CardTitle>
                        <CardDescription>
                            {t('appearanceDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <Label>{t('currentTheme')}</Label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectTheme')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">{t('lightMode')}</SelectItem>
                                    <SelectItem value="dark">{t('darkMode')}</SelectItem>
                                    <SelectItem value="system">
                                        <div className="flex items-center gap-2">
                                            <MonitorSmartphone className="w-4 h-4" />
                                            {t('system')}
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <DataPrivacyPanel />
                <BillingPanel />
                <IntegrationsPanel />
                <AISettingsPanel />
            </div>

            <div className="flex justify-end mt-8">
                <Button onClick={handleSave} className="font-pixel">
                    <Save className="w-4 h-4 mr-2" />
                    {t('saveSettings')}
                </Button>
            </div>
        </div>
    );
}
