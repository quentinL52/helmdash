'use client';

import { useState } from 'react';
import { useFounderStore, ContentIdea, ContentStatus, ContentChannel } from '@/store/founder-store';
import { Plus, Calendar, FileText, CheckCircle2, MoreHorizontal, PenSquare } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateContentDialog } from './create-content-dialog';
import { useGamification } from '@/hooks/use-gamification';

const COLUMNS: { id: ContentStatus; label: string; icon: any; colorClass: string }[] = [
    { id: 'idea', label: 'Ideas', icon: PenSquare, colorClass: 'text-muted-foreground border-muted-foreground bg-muted-foreground' },
    { id: 'draft', label: 'Drafting', icon: FileText, colorClass: 'text-warning border-warning bg-warning' },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar, colorClass: 'text-primary border-primary bg-primary' },
    { id: 'published', label: 'Published', icon: CheckCircle2, colorClass: 'text-success border-success bg-success' },
];

export function ContentBoard() {
    const contentIdeas = useFounderStore(s => s.contentIdeas);
    const addContentIdea = useFounderStore(s => s.addContentIdea);
    const deleteContentIdea = useFounderStore(s => s.deleteContentIdea);
    const updateContentIdea = useFounderStore(s => s.updateContentIdea);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        channel: 'LinkedIn' as ContentChannel,
        tags: '',
    });

    const handleCreate = () => {
        if (!formData.title.trim()) return;

        addContentIdea({
            title: formData.title,
            description: formData.description,
            channel: formData.channel,
            status: 'idea',
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        });

        setFormData({
            title: '',
            description: '',
            channel: 'LinkedIn',
            tags: '',
        });
        setShowForm(false);
    };

    const { awardXP } = useGamification();

    const handleStatusChange = (id: string, newStatus: ContentStatus) => {
        updateContentIdea(id, { status: newStatus });
        if (newStatus === 'published') {
            awardXP('content_published');
        }
    };

    return (
        <div className="flex flex-col h-full font-sans">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Content Pipeline</h2>
                    <p className="text-muted-foreground">
                        Manage your ideas, drafts, and publishing schedule.
                    </p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="gap-2">
                    <Plus className="h-4 w-4" /> New Idea
                </Button>
            </div>

            {showForm && (
                <div className="mb-6 p-4 rounded-xl border bg-card border-border animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2">
                            <Input
                                placeholder="Content Title / Hook *"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                autoFocus
                                className="border-primary/50 focus-visible:ring-primary"
                            />
                        </div>
                        <div className="col-span-2">
                            <Input
                                placeholder="Description or quick notes..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:[color-scheme:dark]"
                            value={formData.channel}
                            onChange={(e) => setFormData({ ...formData, channel: e.target.value as ContentChannel })}
                        >
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Article">Article</option>
                            <option value="Newsletter">Newsletter</option>
                            <option value="Thread">Thread</option>
                        </select>
                        <Input
                            placeholder="Tags (comma separated)..."
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setShowForm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate}>
                            Add Content
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex gap-4 flex-1 min-h-0 overflow-x-auto pb-2">
                {COLUMNS.map((col) => {
                    const ideas = contentIdeas.filter((idea) => idea.status === col.id);
                    return (
                        <div key={col.id} className="flex-1 flex flex-col min-w-[280px]">
                            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg border bg-card/50 backdrop-blur-sm border-border">
                                <div className={`w-2 h-2 rounded-full ${col.colorClass.split(' ')[2]}`} />
                                <span className={`text-[13px] font-semibold tracking-tight font-mono ${col.colorClass.split(' ')[0]}`}>
                                    {col.label}
                                </span>
                                <span className="ml-auto text-[11px] text-muted-foreground">
                                    {ideas.length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {ideas.map((idea) => (
                                    <ContentCard
                                        key={idea.id}
                                        idea={idea}
                                        onDelete={() => deleteContentIdea(idea.id)}
                                        onStatusChange={(status) => handleStatusChange(idea.id, status)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ContentCard({ idea, onDelete, onStatusChange }: { idea: ContentIdea, onDelete: () => void, onStatusChange: (s: ContentStatus) => void }) {
    const channelColors: Record<string, string> = {
        LinkedIn: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        Article: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        Newsletter: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        Thread: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    };

    const defaultChannelClass = 'text-muted-foreground bg-muted border-border';
    const channelClass = channelColors[idea.channel] || defaultChannelClass;

    return (
        <div className="group relative p-3 rounded-xl border bg-card border-border hover:border-border/80 transition-all duration-200 shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start gap-2 mb-2">
                <h4 className="font-medium text-foreground leading-snug text-[13px]">
                    {idea.title}
                </h4>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                        <CreateContentDialog 
                            idea={idea} 
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    Edit Details
                                </DropdownMenuItem>
                            } 
                        />
                        <DropdownMenuItem onClick={() => onStatusChange('idea')}>Move to Idea</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange('draft')}>Move to Draft</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange('scheduled')}>Move to Scheduled</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange('published')}>Move to Published</DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {idea.imageUrl && (
                <div className="mb-3 rounded overflow-hidden border border-border/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={idea.imageUrl} alt="Cover" className="w-full h-auto object-cover max-h-32" />
                </div>
            )}

            {idea.description && (
                <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                    {idea.description}
                </p>
            )}

            {idea.contentBody && (
                <div className="text-[12px] text-foreground mb-3 whitespace-pre-wrap leading-relaxed break-words bg-background/50 p-2 rounded">
                    {idea.contentBody}
                </div>
            )}

            <div className="flex flex-wrap gap-1.5 items-center">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${channelClass}`}>
                    {idea.channel}
                </span>

                {idea.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                        #{tag}
                    </span>
                ))}
            </div>

            {idea.date && (
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-border text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(idea.date).toLocaleDateString()}</span>
                </div>
            )}
        </div>
    );
}
