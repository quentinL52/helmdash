'use client';

import { useState } from 'react';
import { useFounderStore, Hypothesis, HypothesisStatus } from '@/store/founder-store';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HypothesisDialog } from './create-hypothesis-dialog';
import { Edit, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const STATUS_COLORS: Record<HypothesisStatus, string> = {
    draft: "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20",
    testing: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    validated: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
    invalidated: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    pivoted: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
};

const RISK_COLORS: Record<string, string> = {
    critical: "text-red-500",
    high: "text-orange-500",
    medium: "text-yellow-500",
    low: "text-emerald-500",
};

export function HypothesesList() {
    const { hypotheses, deleteHypothesis } = useFounderStore();
    const [editingHypothesis, setEditingHypothesis] = useState<Hypothesis | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleEdit = (hypothesis: Hypothesis) => {
        setEditingHypothesis(hypothesis);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this hypothesis?')) {
            deleteHypothesis(id);
        }
    };

    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setTimeout(() => setEditingHypothesis(null), 300);
        }
    };

    return (
        <div className="rounded-md border border-[#282c3a] bg-[#181a24] overflow-hidden">
            <Table>
                <TableHeader className="bg-[#1e2130]">
                    <TableRow className="border-b border-[#282c3a] hover:bg-[#1e2130]">
                        <TableHead className="w-[100px] text-[#8b8fa3]">Status</TableHead>
                        <TableHead className="text-[#8b8fa3]">Statement</TableHead>
                        <TableHead className="w-[120px] text-[#8b8fa3]">Category</TableHead>
                        <TableHead className="w-[100px] text-[#8b8fa3]">Risk</TableHead>
                        <TableHead className="text-[#8b8fa3] hidden md:table-cell">Test Method</TableHead>
                        <TableHead className="text-right text-[#8b8fa3]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {hypotheses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-[#8b8fa3]">
                                No hypotheses found. Add one from the board view or create button.
                            </TableCell>
                        </TableRow>
                    ) : (
                        hypotheses.map((hypothesis) => (
                            <TableRow key={hypothesis.id} className="border-b border-[#282c3a] hover:bg-[#1e2130]/50 transition-colors">
                                <TableCell>
                                    <Badge variant="outline" className={`border-0 capitalize ${STATUS_COLORS[hypothesis.status]}`}>
                                        {hypothesis.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-[#e8e9ed]">
                                    {hypothesis.statement}
                                </TableCell>
                                <TableCell className="capitalize text-[#8b8fa3]">
                                    {hypothesis.category}
                                </TableCell>
                                <TableCell className={`capitalize font-medium ${RISK_COLORS[hypothesis.riskLevel]}`}>
                                    {hypothesis.riskLevel}
                                </TableCell>
                                <TableCell className="text-[#8b8fa3] hidden md:table-cell">
                                    {hypothesis.testMethod || '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(hypothesis)}
                                            className="h-8 w-8 text-[#8b8fa3] hover:text-[#e8e9ed] hover:bg-[#282c3a]"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(hypothesis.id)}
                                            className="h-8 w-8 text-[#8b8fa3] hover:text-red-400 hover:bg-[#282c3a]"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <HypothesisDialog
                key={editingHypothesis?.id || 'edit'}
                open={isDialogOpen}
                onOpenChange={handleDialogOpenChange}
                hypothesisToEdit={editingHypothesis}
            />
        </div>
    );
}
