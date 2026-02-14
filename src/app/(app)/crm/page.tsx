'use client';

import { useState } from 'react';
import { useFounderStore, Contact } from '@/store/founder-store';
import { ContactDialog } from '@/components/crm/contact-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Mail, Linkedin, ExternalLink, RefreshCw } from 'lucide-react';
import { generateFollowUp } from '@/lib/ai-service';

const COLORS = {
    accent: '#6c5ce7',
    surface: '#181a24',
    border: '#282c3a',
    text: '#e8e9ed',
    muted: '#8b8fa3'
};

const STATUS_COLORS: Record<string, string> = {
    lead: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    contacted: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    negotiation: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    customer: 'bg-green-500/10 text-green-500 border-green-500/20',
    partner: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    lost: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function CRMPage() {
    const { contacts, deleteContact } = useFounderStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestedAction, setAiSuggestedAction] = useState<string | null>(null);

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (contact: Contact) => {
        setSelectedContact(contact);
        setIsDialogOpen(true);
    };

    const handleNew = () => {
        setSelectedContact(null);
        setIsDialogOpen(true);
    };

    // AI Follow-up Logic
    const handleGenerateFollowUp = async (contact: Contact) => {
        setAiLoading(true);
        try {
            const response = await generateFollowUp(contact);
            alert(response);
        } catch (e) {
            console.error(e);
            alert("Failed to generate AI draft.");
        } finally {
            setAiLoading(false);
        }
    };


    return (
        <div className="h-full flex flex-col p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#e8e9ed]">CRM Lite</h1>
                    <p className="text-[#8b8fa3]">
                        Manage your network and relationships.
                    </p>
                </div>
                <Button
                    onClick={handleNew}
                    className="bg-[#6c5ce7] hover:bg-[#5a4bd6] text-white"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Contact
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b8fa3]" />
                    <Input
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-[#181a24] border-[#282c3a] text-[#e8e9ed] focus:ring-[#6c5ce7]"
                    />
                </div>
                {/* Additional filters can go here */}
            </div>

            {/* Content */}
            <div className="rounded-xl border border-[#282c3a] bg-[#181a24]/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#181a24]">
                        <TableRow className="border-[#282c3a] hover:bg-[#181a24]">
                            <TableHead className="text-[#8b8fa3]">Name</TableHead>
                            <TableHead className="text-[#8b8fa3]">Role & Company</TableHead>
                            <TableHead className="text-[#8b8fa3]">Status</TableHead>
                            <TableHead className="text-[#8b8fa3]">Last Contact</TableHead>
                            <TableHead className="text-right text-[#8b8fa3]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredContacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-[#8b8fa3]">
                                    No contacts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredContacts.map((contact) => (
                                <TableRow key={contact.id} className="border-[#282c3a] hover:bg-[#282c3a]/50 group">
                                    <TableCell className="font-medium text-[#e8e9ed]">
                                        <div className="flex flex-col">
                                            <span>{contact.name}</span>
                                            {contact.email && (
                                                <span className="text-xs text-[#8b8fa3] flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {contact.email}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[#dfe1e6]">
                                        <div className="flex flex-col">
                                            <span>{contact.role || '-'}</span>
                                            {contact.company && <span className="text-xs text-[#8b8fa3]">{contact.company}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize font-medium border ${STATUS_COLORS[contact.status] || 'border-[#282c3a]'}`}>
                                            {contact.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-[#8b8fa3] text-sm">
                                        {new Date(contact.lastContactDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {contact.linkedin && (
                                                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8b8fa3] hover:text-[#0077b5]">
                                                        <Linkedin className="h-4 w-4" />
                                                    </Button>
                                                </a>
                                            )}

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-[#8b8fa3] hover:text-[#6c5ce7]"
                                                onClick={() => handleGenerateFollowUp(contact)}
                                                disabled={aiLoading}
                                                title="Generate AI Follow-up"
                                            >
                                                <RefreshCw className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8b8fa3]">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#1a1d2d] border-[#282c3a] text-[#e8e9ed]">
                                                    <DropdownMenuItem onClick={() => handleEdit(contact)} className="hover:bg-[#282c3a]">Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => deleteContact(contact.id)} className="text-red-400 hover:bg-red-500/10 hover:text-red-400">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ContactDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                contactToEdit={selectedContact}
            />
        </div>
    );
}
