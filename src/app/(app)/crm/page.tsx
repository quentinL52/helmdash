'use client';

import { useState, useMemo, useCallback } from 'react';
import { useFounderStore, Contact, ContactStatus } from '@/store/founder-store';
import { ContactDialog } from '@/components/crm/contact-dialog';
import { generateFollowUp } from '@/lib/ai-service';
import { getGoogleProviderToken, fetchGoogleContacts } from '@/lib/google-api';
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
import { Plus, Search, Mail, Linkedin, RefreshCw, Pencil, Trash2, DownloadCloud } from 'lucide-react';
import { translations } from '@/lib/translations';

const STATUS_COLORS: Record<ContactStatus, string> = {
    'À contacter': 'border-blue-500/50 text-blue-400',
    'En discussion': 'border-yellow-500/50 text-yellow-400',
    'Qualifié': 'border-orange-500/50 text-orange-400',
    'Client': 'border-green-500/50 text-green-400',
    'Perdu': 'border-red-500/50 text-red-400',
};

export default function CRMPage() {
    const contacts = useFounderStore(s => s.contacts);
    const addContact = useFounderStore(s => s.addContact);
    const deleteContact = useFounderStore(s => s.deleteContact);
    const language = useFounderStore(s => s.language);
    const t = (translations[language] as any).crm || {};
    const common = translations[language].common;

    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

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

    const handleGoogleImport = async () => {
        setImportLoading(true);
        try {
            const token = await getGoogleProviderToken();
            if (!token) {
                alert("Vous devez être connecté avec Google pour importer vos contacts.");
                return;
            }
            const googleContacts = await fetchGoogleContacts(token);
            if (googleContacts.length === 0) {
                alert("Aucun contact trouvé.");
                return;
            }
            
            let importedCount = 0;
            for (const gc of googleContacts) {
                const name = gc.names?.[0]?.displayName;
                if (!name) continue;
                
                const email = gc.emailAddresses?.[0]?.value || '';
                const company = gc.organizations?.[0]?.name || '';
                const role = gc.organizations?.[0]?.title || '';
                
                // Avoid simple duplicates
                if (!contacts.some(c => c.name === name)) {
                    addContact({
                        name,
                        email,
                        company,
                        role,
                        status: 'À contacter',
                        notes: 'Importé depuis Google Contacts',
                    });
                    importedCount++;
                }
            }
            alert(`${importedCount} contact(s) importé(s) avec succès !`);
        } catch (error) {
            console.error("Erreur d'import", error);
            alert("Erreur lors de l'importation. Avez-vous accepté les permissions Google Contacts ?");
        } finally {
            setImportLoading(false);
        }
    };

    const locale = language === 'fr' ? 'fr-FR' : 'en-US';

    return (
        <div className="h-full flex flex-col p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{t.title || 'CRM Lite'}</h1>
                    <p className="text-muted-foreground">
                        {t.subtitle || 'Gérez votre réseau et vos relations.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleGoogleImport}
                        disabled={importLoading}
                        className="border-border text-foreground hover:bg-muted"
                    >
                        <DownloadCloud className={`mr-2 h-4 w-4 ${importLoading ? 'animate-pulse text-primary' : ''}`} />
                        {importLoading ? 'Import en cours...' : 'Import Google'}
                    </Button>
                    <Button
                        onClick={handleNew}
                        className="bg-accent text-white hover:opacity-85 hover:bg-accent rounded-lg px-4 py-2 text-[13px] font-medium transition-all duration-200 border-none"
                    >
                        <Plus className="mr-2 h-4 w-4" /> {t.addContact || 'Ajouter un contact'}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t.searchPlaceholder || "Rechercher un contact..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-card border-border text-foreground focus:ring-primary"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-card">
                        <TableRow className="border-border hover:bg-card">
                            <TableHead className="text-muted-foreground">{t.columns?.name || 'Nom'}</TableHead>
                            <TableHead className="text-muted-foreground">{t.columns?.roleCompany || 'Rôle & Entreprise'}</TableHead>
                            <TableHead className="text-muted-foreground">{t.columns?.status || common.status}</TableHead>
                            <TableHead className="text-muted-foreground">{t.columns?.lastContact || 'Dernier contact'}</TableHead>
                            <TableHead className="text-muted-foreground">Contact prévu</TableHead>
                            <TableHead className="text-right text-muted-foreground">{t.columns?.actions || 'Actions'}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredContacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {t.noContacts || 'Aucun contact trouvé.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredContacts.map((contact) => (
                                <TableRow key={contact.id} className="border-border hover:bg-muted/50 group">

                                    {/* Nom + icônes mail/linkedin dynamiques */}
                                    <TableCell className="font-medium text-foreground">
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
                                                            <Mail className="w-3.5 h-3.5 text-muted-foreground hover:text-cyan-400 transition-colors" />
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
                                                            <Linkedin className="w-3.5 h-3.5 text-muted-foreground hover:text-blue-500 transition-colors" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Rôle & Entreprise */}
                                    <TableCell className="text-foreground">
                                        <div className="flex flex-col">
                                            {contact.type && (
                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-1">
                                                    {contact.type}
                                                </span>
                                            )}
                                            <span>{contact.role || '-'}</span>
                                            {contact.company && <span className="text-xs text-muted-foreground">{contact.company}</span>}
                                        </div>
                                    </TableCell>

                                    {/* Statut */}
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize font-medium border ${STATUS_COLORS[contact.status] || 'border-border'}`}>
                                            {t.statuses?.[contact.status] || contact.status}
                                        </Badge>
                                    </TableCell>
                                    {/* Dernier contact */}
                                    <TableCell className="text-muted-foreground text-sm">
                                        {contact.lastContactDate ? new Date(contact.lastContactDate).toLocaleDateString(locale) : '—'}
                                    </TableCell>

                                    {/* Contact prévu */}
                                    <TableCell className="text-sm">
                                        {contact.nextActionDate ? (
                                            <div className="flex flex-col">
                                                <span className="text-[#a29bfe]">
                                                    {new Date(contact.nextActionDate).toLocaleDateString(locale)}
                                                </span>
                                                {contact.nextActionLabel && (
                                                    <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={contact.nextActionLabel}>
                                                        {contact.nextActionLabel}
                                                    </span>
                                                )}
                                            </div>
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
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                onClick={() => handleGenerateFollowUp(contact)}
                                                disabled={aiLoading}
                                                title={t.generateFollowUp || "Générer un suivi IA"}
                                            >
                                                <RefreshCw className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                onClick={() => handleEdit(contact)}
                                                title={common.edit}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-400"
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
