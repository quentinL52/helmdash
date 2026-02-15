
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
import { useFounderStore, ContentIdea, ContentPlatform, ContentStatus } from '@/store/founder-store';
import { Plus } from 'lucide-react';

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
    platform: z.enum(['linkedin', 'twitter', 'blog', 'newsletter', 'youtube', 'instagram']),
    status: z.enum(['idea', 'draft', 'scheduled', 'published']),
    tags: z.string().optional(),
    date: z.string().optional(), // ISO date string
});

interface CreateContentDialogProps {
    trigger?: React.ReactNode;
}

export function CreateContentDialog({ trigger }: CreateContentDialogProps) {
    const addContentIdea = useFounderStore(s => s.addContentIdea);
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            platform: 'linkedin',
            status: 'idea',
            tags: '',
            date: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        addContentIdea({
            title: values.title,
            description: values.description,
            platform: values.platform as ContentPlatform,
            status: values.status as ContentStatus,
            tags: values.tags ? values.tags.split(',').map((t) => t.trim()) : [],
            date: values.date || undefined,
        });
        setOpen(false);
        form.reset();
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
                    <Button className="bg-[#6c5ce7] hover:bg-[#5b4cc4] text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Idea
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-[#282c3a] bg-[#0F1117] text-[#e8e9ed]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">New Content Idea</DialogTitle>
                    <DialogDescription className="text-[#8b8fa3]">
                        Capture a new thought or content piece for your pipeline.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#8b8fa3]">Title</FormLabel>
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
                                name="platform"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#8b8fa3]">Platform</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    style={inputStyle}
                                                    className="focus:ring-[#6c5ce7]"
                                                >
                                                    <SelectValue placeholder="Select platform" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent
                                                className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed]"
                                            >
                                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                                <SelectItem value="twitter">X (Twitter)</SelectItem>
                                                <SelectItem value="blog">Blog</SelectItem>
                                                <SelectItem value="newsletter">Newsletter</SelectItem>
                                                <SelectItem value="youtube">YouTube</SelectItem>
                                                <SelectItem value="instagram">Instagram</SelectItem>
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
                                        <FormLabel className="text-[#8b8fa3]">Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    style={inputStyle}
                                                    className="focus:ring-[#6c5ce7]"
                                                >
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent
                                                className="bg-[#181a24] border-[#282c3a] text-[#e8e9ed]"
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
                                    <FormLabel className="text-[#8b8fa3]">Description / Rough Draft</FormLabel>
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

                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#8b8fa3]">Tags (comma separated)</FormLabel>
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

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="text-[#8b8fa3] hover:text-[#e8e9ed] hover:bg-[#282c3a]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#6c5ce7] hover:bg-[#5b4cc4] text-white"
                            >
                                Create Content
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
