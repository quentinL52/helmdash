
import { useFounderStore, ContentIdea, ContentStatus } from '@/store/founder-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Send, CheckCircle2, MoreHorizontal, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const COLORS = {
    idea: '#a29bfe', // purple-ish
    draft: '#74b9ff', // blue-ish
    scheduled: '#ffeaa7', // yellow-ish
    published: '#55efc4', // green-ish
};

const COLUMNS: { id: ContentStatus; label: string; icon: any }[] = [
    { id: 'idea', label: 'Ideas', icon: PenSquare },
    { id: 'draft', label: 'Drafting', icon: FileText },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar },
    { id: 'published', label: 'Published', icon: CheckCircle2 },
];

export function ContentBoard() {
    const { contentIdeas, deleteContentIdea, updateContentIdea } = useFounderStore();

    const getColumnContent = (status: ContentStatus) => {
        return contentIdeas.filter((idea) => idea.status === status);
    };

    const handleStatusChange = (id: string, newStatus: ContentStatus) => {
        updateContentIdea(id, { status: newStatus });
    };

    return (
        <div className="flex h-full gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
                <div key={col.id} className="flex-1 min-w-[280px] flex flex-col">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md bg-[#181a24] text-[#8b8fa3]`}>
                                <col.icon className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-[#e8e9ed] text-sm">
                                {col.label}
                            </h3>
                            <span className="text-xs text-[#8b8fa3] bg-[#181a24] px-2 py-0.5 rounded-full">
                                {getColumnContent(col.id).length}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 bg-[#181a24]/50 rounded-xl border border-[#282c3a] p-2 space-y-3 overflow-y-auto">
                        {getColumnContent(col.id).map((idea) => (
                            <ContentCard
                                key={idea.id}
                                idea={idea}
                                onDelete={() => deleteContentIdea(idea.id)}
                                onStatusChange={(status) => handleStatusChange(idea.id, status)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ContentCard({ idea, onDelete, onStatusChange }: { idea: ContentIdea, onDelete: () => void, onStatusChange: (s: ContentStatus) => void }) {
    return (
        <Card className="bg-[#181a24] border-[#282c3a] hover:border-[#6c5ce7]/50 transition-all group">
            <CardContent className="p-3 space-y-3">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="font-medium text-[#e8e9ed] leading-snug text-sm">
                        {idea.title}
                    </h4>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-[#8b8fa3] hover:text-[#e8e9ed] opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
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
                    <p className="text-xs text-[#8b8fa3] line-clamp-2">
                        {idea.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge variant="outline" className="text-[10px] py-0 h-5 border-[#282c3a] text-[#8b8fa3] hover:bg-transparent">
                        {idea.platform}
                    </Badge>
                    {idea.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] py-0 h-5 bg-[#282c3a] text-[#8b8fa3] hover:bg-[#282c3a]">
                            #{tag}
                        </Badge>
                    ))}
                </div>

                {idea.date && (
                    <div className="flex items-center gap-1 text-[10px] text-[#8b8fa3] pt-1 border-t border-[#282c3a]/50">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(idea.date).toLocaleDateString()}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
