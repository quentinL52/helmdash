'use client';

import { useState, useMemo, useCallback } from 'react';
import { useFounderStore, Contact, ContactStatus } from '@/store/founder-store';
import { ContactDialog } from '@/components/crm/contact-dialog';
import { generateFollowUp } from '@/lib/ai-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Search, Mail, Linkedin, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { translations } from '@/lib/translations';

const STATUS_COLORS: Record<ContactStatus, string> = {
    lead: 'border-blue-500/50 text-blue-400',
    contacted: 'border-yellow-500/50 text-yellow-400',
    negotiation: 'border-orange-500/50 text-orange-400',
    customer: 'border-green-500/50 text-green-400',
    partner: 'border-purple-500/50 text-purple-400',
    lost: 'border-red-500/50 text-red-400',
};

export default function CRMPage() {
    const contacts = useFounderStore(s => s.contacts);
    const deleteContact = useFounderStore(s => s.deleteContact);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).crm || {};
    const common = translations[language].common;

    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const filteredContacts = useMemo(() => contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.role?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [contacts, searchTerm]);

    const handleEdit = useCallback((contact: Contact) => {
        setSelectedContact(contact);
        setIsDialogOpen(true);
    }, []);

    const handleNew = useCallback(() => {
        setSelectedContact(null);
        setIsDialogOpen(true);
    }, []);

    const handleGenerateFollowUp = useCallback(async (contact: Contact) => {
        setAiLoading(true);
        try {
            const response = await generateFollowUp(contact);
            alert(response);
        } catch (e) {
            console.error(e);
            alert(language === 'fr' ? "Échec de la génération IA." : "Failed to generate AI draft.");
        } finally {
            setAiLoading(false);
        }
    }, [language]);

    const locale = language === 'fr' ? 'fr-FR' : 'en-US';

    return (
        <div className="h-full flex flex-col p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#e8e9ed]">{t.title || 'CRM Lite'}</h1>
                    <p className="text-[#8b8fa3]">
                        {t.subtitle || 'Gérez votre réseau et vos relations.'}
                    </p>
                </div>
                <Button
                    onClick={handleNew}
                    className="bg-[#6c5ce7] hover:bg-[#5a4bd6] text-white"
                >
                    <Plus className="mr-2 h-4 w-4" /> {t.addContact || 'Ajouter un contact'}
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b8fa3]" />
                    <Input
                        placeholder={t.searchPlaceholder || "Rechercher un contact..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-[#181a24] border-[#282c3a] text-[#e8e9ed] focus:ring-[#6c5ce7]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-[#282c3a] bg-[#181a24]/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#181a24]">
                        <TableRow className="border-[#282c3a] hover:bg-[#181a24]">
                            <TableHead className="text-[#8b8fa3]">{t.columns?.name || 'Nom'}</TableHead>
                            <TableHead className="text-[#8b8fa3]">{t.columns?.roleCompany || 'Rôle & Entreprise'}</TableHead>
                            <TableHead className="text-[#8b8fa3]">{t.columns?.status || common.status}</TableHead>
                            <TableHead className="text-[#8b8fa3]">{t.columns?.lastContact || 'Dernier contact'}</TableHead>
                            <TableHead className="text-[#8b8fa3]">Contact prévu</TableHead>
                            <TableHead className="text-right text-[#8b8fa3]">{t.columns?.actions || 'Actions'}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredContacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-[#8b8fa3]">
                                    {t.noContacts || 'Aucun contact trouvé.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredContacts.map((contact) => (
                                <TableRow key={contact.id} className="border-[#282c3a] hover:bg-[#282c3a]/50 group">

                                    {/* Nom + icônes mail/linkedin dynamiques */}
                                    <TableCell className="font-medium text-[#e8e9ed]">
                                        <div className="flex flex-col gap-1">
                                            <span>{contact.name}</span>
                                            {(contact.email || contact.linkedin) && (
                                                <div className="flex items-center gap-2">
                                                    {contact.email && (
                                                        <a
                                                            href={`mailto:${contact.email}`}
                                                            title={contact.email}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Mail className="w-3.5 h-3.5 text-[#5c6078] hover:text-[#00cec9] transition-colors" />
                                                        </a>
                                                    )}
                                                    {contact.linkedin && (
                                                        <a
                                                            href={contact.linkedin}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="LinkedIn"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Linkedin className="w-3.5 h-3.5 text-[#5c6078] hover:text-[#0077b5] transition-colors" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Rôle & Entreprise */}
                                    <TableCell className="text-[#dfe1e6]">
                                        <div className="flex flex-col">
                                            <span>{contact.role || '-'}</span>
                                            {contact.company && <span className="text-xs text-[#8b8fa3]">{contact.company}</span>}
                                        </div>
                                    </TableCell>

                                    {/* Statut */}
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize font-medium border ${STATUS_COLORS[contact.status] || 'border-[#282c3a]'}`}>
                                            {t.statuses?.[contact.status] || contact.status}
                                        </Badge>
                                    </TableCell>

                                    {/* Dernier contact */}
                                    <TableCell className="text-[#8b8fa3] text-sm">
                                        {new Date(contact.lastContactDate).toLocaleDateString(locale)}
                                    </TableCell>

                                    {/* Contact prévu */}
                                    <TableCell className="text-sm">
                                        {contact.nextFollowUpDate ? (
                                            <span className="text-[#a29bfe]">
                                                {new Date(contact.nextFollowUpDate).toLocaleDateString(locale)}
                                            </span>
                                        ) : (
                                            <span className="text-[#5c6078]">—</span>
                                        )}
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-[#8b8fa3] hover:text-[#6c5ce7]"
                                                onClick={() => handleGenerateFollowUp(contact)}
                                                disabled={aiLoading}
                                                title={t.generateFollowUp || "Générer un suivi IA"}
                                            >
                                                <RefreshCw className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
                                            </Button>

                                                <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-[#8b8fa3] hover:text-[#6c5ce7]"
                                                onClick={() => handleEdit(contact)}
                                                title={common.edit}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-[#8b8fa3] hover:text-red-400"
                                                onClick={() => deleteContact(contact.id)}
                                                title={common.delete}
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
            </div>

            <ContactDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                contactToEdit={selectedContact}
            />
        </div>
    );
}
