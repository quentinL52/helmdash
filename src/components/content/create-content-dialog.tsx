
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFounderStore, ContentIdea, ContentChannel, ContentStatus } from '@/store/founder-store';
import { Plus, Edit2 } from 'lucide-react';

const COLORS = {
    background: "#0F1117",
    surface: "#181a24",
    border: "#282c3a",
    text: "#e8e9ed",
    textMuted: "#8b8fa3",
    primary: "#6c5ce7",
    primaryHover: "#5b4cc4",
};

const formSchema = z.object({
    title: z.string().min(2, {
        message: 'Title must be at least 2 characters.',
    }),
    description: z.string().optional(),
    channel: z.enum(['LinkedIn', 'Article', 'Newsletter', 'Thread']),
    status: z.enum(['idea', 'draft', 'scheduled', 'published']),
    tags: z.string().optional(),
    date: z.string().optional(), // ISO date string
    draftUrl: z.string().optional(),
    imageUrl: z.string().optional(),
    contentBody: z.string().optional(),
});

interface CreateContentDialogProps {
    trigger?: React.ReactNode;
    idea?: ContentIdea;
}

export function CreateContentDialog({ trigger, idea }: CreateContentDialogProps) {
    const addContentIdea = useFounderStore(s => s.addContentIdea);
    const updateContentIdea = useFounderStore(s => s.updateContentIdea);
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: idea?.title || '',
            description: idea?.description || '',
            channel: idea?.channel || 'LinkedIn',
            status: idea?.status || 'idea',
            tags: idea?.tags?.join(', ') || '',
            date: idea?.date ? new Date(idea.date).toISOString().split('T')[0] : '',
            draftUrl: idea?.draftUrl || '',
            imageUrl: idea?.imageUrl || '',
            contentBody: idea?.contentBody || '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const payload = {
            title: values.title,
            description: values.description,
            channel: values.channel as ContentChannel,
            status: values.status as ContentStatus,
            tags: values.tags ? values.tags.split(',').map((t) => t.trim()) : [],
            date: values.date || undefined,
            draftUrl: values.draftUrl,
            imageUrl: values.imageUrl,
            contentBody: values.contentBody,
        };
        
        if (idea) {
            updateContentIdea(idea.id, payload);
        } else {
            addContentIdea(payload);
        }
        
        setOpen(false);
        if (!idea) form.reset();
    }

    const inputStyle = {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        color: COLORS.text,
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-primary hover:bg-primary/90 text-foreground">
                        <Plus className="mr-2 h-4 w-4" /> Add Idea
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-border bg-background text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        {idea ? 'Edit Content Idea' : 'New Content Idea'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {idea ? 'Update details for this content piece.' : 'Capture a new thought or content piece for your pipeline.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground">Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. 5 Lessons from YC"
                                            {...field}
                                            style={inputStyle}
                                            className="focus-visible:ring-[#6c5ce7]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="channel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground">Channel</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    style={inputStyle}
                                                    className="focus:ring-primary"
                                                >
                                                    <SelectValue placeholder="Select channel" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent
                                                className="bg-card border-border text-foreground"
                                            >
                                                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                                <SelectItem value="Article">Article</SelectItem>
                                                <SelectItem value="Newsletter">Newsletter</SelectItem>
                                                <SelectItem value="Thread">Thread</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground">Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    style={inputStyle}
                                                    className="focus:ring-primary"
                                                >
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent
                                                className="bg-card border-border text-foreground"
                                            >
                                                <SelectItem value="idea">Idea</SelectItem>
                                                <SelectItem value="draft">Drafting</SelectItem>
                                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground">Description / Rough Draft</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Key points, hooks, or full draft..."
                                            className="min-h-[100px] focus-visible:ring-[#6c5ce7]"
                                            style={inputStyle}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="draftUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground">Draft URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://..."
                                                {...field}
                                                style={inputStyle}
                                                className="focus-visible:ring-[#6c5ce7]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-muted-foreground">Image URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://..."
                                                {...field}
                                                style={inputStyle}
                                                className="focus-visible:ring-[#6c5ce7]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground">Publication Date</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            style={inputStyle}
                                            className="focus-visible:ring-[#6c5ce7]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground">Tags (comma separated)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="growth, engineering, life"
                                            {...field}
                                            style={inputStyle}
                                            className="focus-visible:ring-[#6c5ce7]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contentBody"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground">Content Body</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write the full content here..."
                                            className="min-h-[200px] focus-visible:ring-[#6c5ce7]"
                                            style={inputStyle}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary/90 text-foreground"
                            >
                                {idea ? 'Save Changes' : 'Create Content'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
