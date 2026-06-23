import { useState } from 'react';
import { useFounderStore, Objective, KeyResult } from '@/store/founder-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useGamification } from '@/hooks/use-gamification';

interface OkrCardProps {
    objective: Objective;
}

export function OkrCard({ objective }: OkrCardProps) {
    const updateObjective = useFounderStore(s => s.updateObjective);
    const deleteObjective = useFounderStore(s => s.deleteObjective);
    const addKeyResult = useFounderStore(s => s.addKeyResult);
    const updateKeyResult = useFounderStore(s => s.updateKeyResult);
    const deleteKeyResult = useFounderStore(s => s.deleteKeyResult);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showAddKr, setShowAddKr] = useState(false);

    // Edit Objective State
    const [editTitle, setEditTitle] = useState(objective.title);

    // New KR State
    const [newKrTitle, setNewKrTitle] = useState('');
    const [newKrTarget, setNewKrTarget] = useState(100);
    const [newKrUnit, setNewKrUnit] = useState('%');

    const handleUpdateObjective = () => {
        updateObjective(objective.id, { title: editTitle });
        setIsEditing(false);
    };

    const handleAddKeyResult = () => {
        if (!newKrTitle.trim()) return;
        addKeyResult(objective.id, {
            title: newKrTitle,
            target: newKrTarget,
            current: 0,
            unit: newKrUnit,
        });
        setNewKrTitle('');
        setNewKrTarget(100);
        setNewKrUnit('%');
        setShowAddKr(false);
    };

    const getStatusColor = (progress: number) => {
        if (progress >= 70) return 'bg-success';
        if (progress >= 40) return 'bg-warning';
        return 'bg-danger';
    };

    return (
        <Card className="mb-4 overflow-hidden border-l-4" style={{ borderLeftColor: objective.progress >= 70 ? 'hsl(var(--success))' : objective.progress >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--danger))' }}>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="opacity-50 text-[10px] uppercase">
                                {objective.quarter}
                            </Badge>
                            <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded",
                                objective.progress >= 70 ? "bg-success/20 text-success" :
                                    objective.progress >= 40 ? "bg-warning/20 text-warning" :
                                        "bg-danger/20 text-danger"
                            )}>
                                {objective.progress}%
                            </span>
                        </div>

                        {isEditing ? (
                            <div className="flex gap-2 items-center mt-1">
                                <Input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="font-bold text-lg h-8"
                                />
                                <Button size="sm" onClick={handleUpdateObjective} className="h-8"><Save className="w-4 h-4" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-8"><X className="w-4 h-4" /></Button>
                            </div>
                        ) : (
                            <CardTitle className="text-xl flex items-center gap-2 cursor-pointer hover:underline decoration-dashed underline-offset-4" onClick={() => setIsExpanded(!isExpanded)}>
                                {objective.title}
                                {isExpanded ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                            </CardTitle>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteObjective(objective.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                </div>
                <Progress value={objective.progress} className="h-2 mt-2" indicatorClassName={getStatusColor(objective.progress)} />
            </CardHeader>

            {isExpanded && (
                <CardContent className="pt-0 bg-muted/10">
                    <div className="space-y-4 mt-4">
                        {objective.keyResults.map((kr) => (
                            <KeyResultItem
                                key={kr.id}
                                kr={kr}
                                onUpdate={(updates) => updateKeyResult(objective.id, kr.id, updates)}
                                onDelete={() => deleteKeyResult(objective.id, kr.id)}
                            />
                        ))}

                        {showAddKr ? (
                            <div className="bg-background p-4 rounded-lg border border-dashed border-primary/20 animate-in fade-in zoom-in-95 duration-200">
                                <h4 className="text-sm font-semibold mb-3">New Key Result</h4>
                                <div className="grid gap-3">
                                    <div className="grid gap-1">
                                        <Label htmlFor="kr-title" className="text-xs">Result Title</Label>
                                        <Input
                                            id="kr-title"
                                            placeholder="e.g. Get 1000 users"
                                            value={newKrTitle}
                                            onChange={(e) => setNewKrTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="grid gap-1 flex-1">
                                            <Label htmlFor="kr-target" className="text-xs">Target</Label>
                                            <Input
                                                id="kr-target"
                                                type="number"
                                                value={newKrTarget}
                                                onChange={(e) => setNewKrTarget(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="grid gap-1 w-24">
                                            <Label htmlFor="kr-unit" className="text-xs">Unit</Label>
                                            <Input
                                                id="kr-unit"
                                                placeholder="%, users"
                                                value={newKrUnit}
                                                onChange={(e) => setNewKrUnit(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button variant="ghost" size="sm" onClick={() => setShowAddKr(false)}>Cancel</Button>
                                        <Button size="sm" onClick={handleAddKeyResult}>Add Result</Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Button variant="outline" size="sm" className="w-full border-dashed text-muted-foreground" onClick={() => setShowAddKr(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Key Result
                            </Button>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

function KeyResultItem({ kr, onUpdate, onDelete }: { kr: KeyResult, onUpdate: (updates: Partial<KeyResult>) => void, onDelete: () => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [localCurrent, setLocalCurrent] = useState(kr.current);
    const { awardXP } = useGamification();

    const progress = Math.min(100, Math.max(0, (kr.current / kr.target) * 100));

    const handleSave = () => {
        onUpdate({ current: localCurrent });
        
        // Gamification: Key result achieved
        if (localCurrent >= kr.target && kr.current < kr.target) {
            awardXP('okr_key_result_achieved');
        }
        
        setIsEditing(false);
    };

    return (
        <div className="group flex items-center justify-between gap-4 p-2 rounded hover:bg-background transition-colors">
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{kr.title}</span>
                    <span className="text-xs text-muted-foreground">
                        {kr.current} / {kr.target} {kr.unit}
                    </span>
                </div>
                <div className="relative h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                    <Input
                        type="number"
                        className="h-8 w-20 text-right"
                        value={localCurrent}
                        onChange={(e) => {
                            setLocalCurrent(Number(e.target.value));
                        }}
                        onBlur={handleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                    <span className="text-xs text-muted-foreground">{kr.unit}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/50 hover:text-destructive" onClick={onDelete}>
                    <Trash2 className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
}
