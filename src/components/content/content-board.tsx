'use client';

import { useState } from 'react';
import { useFounderStore, ContentIdea, ContentStatus, ContentPlatform } from '@/store/founder-store';
import { Plus, Calendar, FileText, CheckCircle2, MoreHorizontal, PenSquare, Trash } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const COLORS = {
    bg: "#0f1117",
    surface: "#181a24",
    surfaceHover: "#1e2130",
    border: "#282c3a",
    text: "#e8e9ed",
    textMuted: "#8b8fa3",
    textDim: "#5c6078",
    accent: "#6c5ce7",
    success: "#00cec9",
    warning: "#fdcb6e",
    danger: "#ff6b6b",
    teal: "#00b894",
};

const COLUMN_COLORS: Record<ContentStatus, string> = {
    idea: COLORS.textMuted,
    draft: COLORS.warning,
    scheduled: COLORS.accent,
    published: COLORS.success,
};

const COLUMNS: { id: ContentStatus; label: string; icon: any }[] = [
    { id: 'idea', label: 'Ideas', icon: PenSquare },
    { id: 'draft', label: 'Drafting', icon: FileText },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar },
    { id: 'published', label: 'Published', icon: CheckCircle2 },
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
        platform: 'twitter' as ContentPlatform,
        tags: '',
    });

    const handleCreate = () => {
        if (!formData.title.trim()) return;

        addContentIdea({
            title: formData.title,
            description: formData.description,
            platform: formData.platform,
            status: 'idea',
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        });

        setFormData({
            title: '',
            description: '',
            platform: 'twitter',
            tags: '',
        });
        setShowForm(false);
    };

    const handleStatusChange = (id: string, newStatus: ContentStatus) => {
        updateContentIdea(id, { status: newStatus });
    };

    const inputStyle = {
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "8px",
        padding: "8px 12px",
        color: COLORS.text,
        fontSize: "13px",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        width: "100%",
    };

    return (
        <div className="flex flex-col h-full font-sans">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#e8e9ed]">Content Pipeline</h2>
                    <p className="text-[#8b8fa3]">
                        Manage your ideas, drafts, and publishing schedule.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-[6px] border-none rounded-[8px] cursor-pointer font-medium transition-all duration-200 text-[13px] px-[16px] py-[8px] bg-[#6c5ce7] text-white hover:opacity-85"
                >
                    <Plus className="h-4 w-4" /> New Idea
                </button>
            </div>

            {showForm && (
                <div
                    className="mb-6 p-4 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-300"
                    style={{
                        backgroundColor: COLORS.surface,
                        borderColor: `${COLORS.accent}33`,
                    }}
                >
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2">
                            <input
                                style={{ ...inputStyle, borderColor: COLORS.accent }}
                                placeholder="Content Title / Hook *"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div className="col-span-2">
                            <input
                                style={inputStyle}
                                placeholder="Description or quick notes..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <select
                            style={inputStyle}
                            value={formData.platform}
                            onChange={(e) => setFormData({ ...formData, platform: e.target.value as ContentPlatform })}
                        >
                            <option value="twitter">Twitter / X</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="blog">Blog / SEO</option>
                            <option value="newsletter">Newsletter</option>
                            <option value="youtube">YouTube</option>
                            <option value="instagram">Instagram</option>
                            <option value="tiktok">TikTok</option>
                        </select>
                        <input
                            style={inputStyle}
                            placeholder="Tags (comma separated)..."
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-[13px] font-medium rounded-lg hover:bg-[#282c3a] text-[#8b8fa3] hover:text-[#e8e9ed] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            className="px-4 py-2 text-[13px] font-medium rounded-lg bg-[#6c5ce7] text-white hover:bg-[#5b4cc4] transition-colors"
                        >
                            Add Content
                        </button>
                    </div>
                </div>
            )}

            <div className="flex gap-4 flex-1 min-h-0 overflow-x-auto pb-2">
                {COLUMNS.map((col) => {
                    const ideas = contentIdeas.filter((idea) => idea.status === col.id);
                    return (
                        <div key={col.id} className="flex-1 flex flex-col min-w-[280px]">
                            <div
                                className="flex items-center gap-2 mb-3 px-3 py-2 border backdrop-blur-sm"
                                style={{
                                    borderRadius: '8px',
                                    backgroundColor: `${COLUMN_COLORS[col.id]}11`,
                                    borderColor: `${COLUMN_COLORS[col.id]}22`,
                                }}
                            >
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLUMN_COLORS[col.id] }} />
                                <span className="text-[13px] font-semibold tracking-tight" style={{ color: COLUMN_COLORS[col.id], fontFamily: 'monospace' }}>
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
    const platformColors: Record<string, string> = {
        twitter: '#1DA1F2',
        linkedin: '#0A66C2',
        blog: '#FF9F43',
        newsletter: '#F8C291',
        youtube: '#FF0000',
        instagram: '#E1306C',
        tiktok: '#000000',
    };

    return (
        <div
            className="group relative p-3 rounded-xl border transition-all duration-200"
            style={{
                backgroundColor: COLORS.surface,
                borderColor: COLORS.border,
            }}
        >
            <div className="flex justify-between items-start gap-2 mb-2">
                <h4 className="font-medium text-[#e8e9ed] leading-snug text-[13px]">
                    {idea.title}
                </h4>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-[#282c3a] text-[#8b8fa3] hover:text-[#e8e9ed] opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed]">
                        <DropdownMenuItem onClick={() => onStatusChange('idea')}>Move to Idea</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange('draft')}>Move to Draft</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange('scheduled')}>Move to Scheduled</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange('published')}>Move to Published</DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {idea.description && (
                <p className="text-[11px] text-[#8b8fa3] mb-3 line-clamp-2 leading-relaxed">
                    {idea.description}
                </p>
            )}

            <div className="flex flex-wrap gap-1.5 items-center">
                <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium border"
                    style={{
                        borderColor: `${platformColors[idea.platform] || COLORS.border}44`,
                        color: platformColors[idea.platform] || COLORS.textMuted,
                        backgroundColor: `${platformColors[idea.platform] || COLORS.border}11`,
                    }}
                >
                    {idea.platform}
                </span>

                {idea.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-[#282c3a] text-[#8b8fa3]">
                        #{tag}
                    </span>
                ))}
            </div>

            {idea.date && (
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#282c3a] text-[10px] text-[#8b8fa3]">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(idea.date).toLocaleDateString()}</span>
                </div>
            )}
        </div>
    );
}
