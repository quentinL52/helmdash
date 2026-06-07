import { useState, useEffect } from "react";
import { useFounderStore, Contact, ContactStatus } from "@/store/founder-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ContactDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contactToEdit?: Contact | null;
}

const DATE_INPUT_STYLE: React.CSSProperties = {
    colorScheme: 'dark',
    width: '100%',
    background: '#13151f',
    border: '1px solid #282c3a',
    borderRadius: '6px',
    padding: '8px 12px',
    color: '#e8e9ed',
    fontSize: '14px',
};

export function ContactDialog({ open, onOpenChange, contactToEdit }: ContactDialogProps) {
    const addContact = useFounderStore(s => s.addContact);
    const updateContact = useFounderStore(s => s.updateContact);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Contact>>({
        name: '',
        company: '',
        role: '',
        email: '',
        linkedin: '',
        status: 'À contacter',
        type: undefined,
        notes: '',
        lastContactDate: new Date().toISOString().split('T')[0],
        nextActionDate: '',
        nextActionLabel: '',
        tags: [],
    });

    useEffect(() => {
        if (contactToEdit) {
            setFormData({
                ...contactToEdit,
                lastContactDate: contactToEdit.lastContactDate ? contactToEdit.lastContactDate.split('T')[0] : '',
                nextActionDate: contactToEdit.nextActionDate
                    ? contactToEdit.nextActionDate.split('T')[0]
                    : '',
                tags: contactToEdit.tags || [],
            });
        } else {
            setFormData({
                name: '',
                company: '',
                role: '',
                email: '',
                linkedin: '',
                status: 'À contacter',
                type: undefined,
                notes: '',
                lastContactDate: new Date().toISOString().split('T')[0],
                nextActionDate: '',
                nextActionLabel: '',
                tags: [],
            });
        }
    }, [contactToEdit, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 500));

        // Nettoyer nextActionDate si vide
        const dataToSave = {
            ...formData,
            nextActionDate: formData.nextActionDate || undefined,
            lastContactDate: formData.lastContactDate || new Date().toISOString().split('T')[0],
        };

        if (contactToEdit) {
            updateContact(contactToEdit.id, dataToSave);
        } else {
            addContact(dataToSave as Omit<Contact, 'id'>);
        }

        setIsLoading(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle>{contactToEdit ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {contactToEdit ? 'Update contact details and status.' : 'Add a new person to your network.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Nom + Entreprise */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Elon Musk"
                                className="bg-background border-border focus:border-primary"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Entreprise</Label>
                            <Input
                                id="company"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="SpaceX"
                                className="bg-background border-border focus:border-primary"
                            />
                        </div>
                    </div>

                    {/* Rôle + Statut */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Rôle</Label>
                            <Input
                                id="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                placeholder="CEO"
                                className="bg-background border-border focus:border-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Statut</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: ContactStatus) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="À contacter">À contacter</SelectItem>
                                    <SelectItem value="En discussion">En discussion</SelectItem>
                                    <SelectItem value="Qualifié">Qualifié</SelectItem>
                                    <SelectItem value="Client">Client</SelectItem>
                                    <SelectItem value="Perdu">Perdu</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Email + LinkedIn */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="contact@example.com"
                                className="bg-background border-border focus:border-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn URL</Label>
                            <Input
                                id="linkedin"
                                value={formData.linkedin}
                                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                placeholder="https://linkedin.com/in/..."
                                className="bg-background border-border focus:border-primary"
                            />
                        </div>
                    </div>

                    {/* Dernier contact + Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="lastContactDate">Dernier contact</Label>
                            <input
                                type="date"
                                id="lastContactDate"
                                value={formData.lastContactDate || ''}
                                onChange={(e) => setFormData({ ...formData, lastContactDate: e.target.value })}
                                style={DATE_INPUT_STYLE}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select
                                value={formData.type || ''}
                                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="Sélectionner le type" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="candidat">Candidat</SelectItem>
                                    <SelectItem value="entreprise">Entreprise</SelectItem>
                                    <SelectItem value="investisseur">Investisseur</SelectItem>
                                    <SelectItem value="école">École</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Prochaine Action */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nextActionDate">Prochaine action (Date)</Label>
                            <input
                                type="date"
                                id="nextActionDate"
                                value={formData.nextActionDate || ''}
                                onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value || undefined })}
                                style={DATE_INPUT_STYLE}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nextActionLabel">Label Prochaine Action</Label>
                            <Input
                                id="nextActionLabel"
                                value={formData.nextActionLabel || ''}
                                onChange={(e) => setFormData({ ...formData, nextActionLabel: e.target.value })}
                                placeholder="Relancer, Devis à envoyer..."
                                className="bg-background border-border focus:border-primary"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                        <Input
                            id="tags"
                            value={(formData.tags || []).join(', ')}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                            placeholder="SaaS, VIP, Tech..."
                            className="bg-background border-border focus:border-primary"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Met at TechCrunch Disrupt..."
                            className="bg-background border-border focus:border-primary min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-muted hover:text-foreground">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-foreground">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {contactToEdit ? 'Enregistrer' : 'Ajouter'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
