'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useFounderStore, HypothesisCategory, HypothesisRisk, Hypothesis } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { useGamification } from '@/hooks/use-gamification';

const COLORS = {
    bg: "#0f1117",
    surface: "#181a24",
    border: "#282c3a",
    text: "#e8e9ed",
    textMuted: "#8b8fa3",
    inputBg: "#181a24", // Match surface
    inputBorder: "#282c3a",
    accent: "hsl(var(--primary))",
    success: "#00cec9",
    warning: "#fdcb6e",
    danger: "#ff6b6b",
    teal: "#00b894",
};

const formSchema = z.object({
    statement: z.string().min(5, 'Statement must be at least 5 characters.'),
    category: z.enum(['problem', 'solution', 'channel', 'revenue', 'segment'] as [string, ...string[]]),
    riskLevel: z.enum(['critical', 'high', 'medium', 'low'] as [string, ...string[]]),
    testMethod: z.string().min(5, 'Test method is required.'),
    successCriteria: z.string().min(5, 'Success criteria is required.'),
});

interface HypothesisDialogProps {
    hypothesisToEdit?: Hypothesis | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function HypothesisDialog({
    hypothesisToEdit,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    trigger
}: HypothesisDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const addHypothesis = useFounderStore(s => s.addHypothesis);
    const updateHypothesis = useFounderStore(s => s.updateHypothesis);
    const language = useFounderStore(s => s.language);
    const t = translations[language].hypotheses;

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

    const isEditing = !!hypothesisToEdit;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            statement: '',
            category: 'problem',
            riskLevel: 'medium',
            testMethod: '',
            successCriteria: '',
        },
    });

    const { awardXP } = useGamification();

    // Update form values when hypothesisToEdit changes
    useEffect(() => {
        if (hypothesisToEdit) {
            form.reset({
                statement: hypothesisToEdit.statement,
                category: hypothesisToEdit.category,
                riskLevel: hypothesisToEdit.riskLevel,
                testMethod: hypothesisToEdit.testMethod,
                successCriteria: hypothesisToEdit.successCriteria,
            });
        } else {
            form.reset({
                statement: '',
                category: 'problem',
                riskLevel: 'medium',
                testMethod: '',
                successCriteria: '',
            });
        }
    }, [hypothesisToEdit, form, open]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEditing && hypothesisToEdit) {
            updateHypothesis(hypothesisToEdit.id, {
                statement: values.statement,
                category: values.category as HypothesisCategory,
                riskLevel: values.riskLevel as HypothesisRisk,
                testMethod: values.testMethod,
                successCriteria: values.successCriteria,
            });
        } else {
            addHypothesis({
                statement: values.statement,
                category: values.category as HypothesisCategory,
                riskLevel: values.riskLevel as HypothesisRisk,
                testMethod: values.testMethod,
                successCriteria: values.successCriteria,
                status: 'draft',
            });
            awardXP('hypothesis_created');
        }
        setOpen(false);
        form.reset();
    }

    const inputStyle = {
        backgroundColor: COLORS.inputBg,
        borderColor: COLORS.inputBorder,
        color: COLORS.text,
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '13px',
        fontFamily: "'DM Sans', sans-serif"
    };

    const labelStyle = {
        color: COLORS.text,
        fontSize: '13px',
        fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif"
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent
                className="sm:max-w-[525px] border-border"
                style={{
                    backgroundColor: COLORS.bg,
                    color: COLORS.text
                }}
            >
                <DialogHeader>
                    <DialogTitle style={{ color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>{isEditing ? t.form.editTitle : t.form.newTitle}</DialogTitle>
                    <DialogDescription style={{ color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
                        {isEditing ? t.form.editDesc : t.form.newDesc}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="statement"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel style={labelStyle}>{t.form.statement}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="We believe that..."
                                            className="resize-none focus-visible:ring-0 focus-visible:border-primary"
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
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel style={labelStyle}>{t.form.category}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger style={inputStyle} className="focus:ring-0 focus:border-primary">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }}>
                                                <SelectItem value="problem">{t.categories.problem}</SelectItem>
                                                <SelectItem value="solution">{t.categories.solution}</SelectItem>
                                                <SelectItem value="channel">{t.categories.channel}</SelectItem>
                                                <SelectItem value="revenue">{t.categories.revenue}</SelectItem>
                                                <SelectItem value="segment">{t.categories.segment}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="riskLevel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel style={labelStyle}>{t.form.risk}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger style={inputStyle} className="focus:ring-0 focus:border-primary">
                                                    <SelectValue placeholder="Select risk" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }}>
                                                <SelectItem value="critical">{t.risks.critical}</SelectItem>
                                                <SelectItem value="high">{t.risks.high}</SelectItem>
                                                <SelectItem value="medium">{t.risks.medium}</SelectItem>
                                                <SelectItem value="low">{t.risks.low}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="testMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel style={labelStyle}>{t.form.method}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Landing page, Interview..."
                                            className="focus-visible:ring-0 focus-visible:border-primary"
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
                            name="successCriteria"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel style={labelStyle}>{t.form.criteria}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Conversion rate > 5%"
                                            className="focus-visible:ring-0 focus-visible:border-primary"
                                            style={inputStyle}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="submit"
                                style={{
                                    backgroundColor: COLORS.accent,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                    fontFamily: "'DM Sans', sans-serif"
                                }}
                                className="hover:opacity-85"
                            >
                                {isEditing ? t.form.save : t.form.submit}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}


