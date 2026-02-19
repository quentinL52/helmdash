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
        status: 'lead',
        notes: '',
        lastContactDate: new Date().toISOString().split('T')[0],
        nextFollowUpDate: '',
    });

    useEffect(() => {
        if (contactToEdit) {
            setFormData({
                ...contactToEdit,
                lastContactDate: contactToEdit.lastContactDate.split('T')[0],
                nextFollowUpDate: contactToEdit.nextFollowUpDate
                    ? contactToEdit.nextFollowUpDate.split('T')[0]
                    : '',
            });
        } else {
            setFormData({
                name: '',
                company: '',
                role: '',
                email: '',
                linkedin: '',
                status: 'lead',
                notes: '',
                lastContactDate: new Date().toISOString().split('T')[0],
                nextFollowUpDate: '',
            });
        }
    }, [contactToEdit, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 500));

        // Nettoyer nextFollowUpDate si vide
        const dataToSave = {
            ...formData,
            nextFollowUpDate: formData.nextFollowUpDate || undefined,
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
            <DialogContent className="sm:max-w-[600px] bg-[#1a1d2d] border-[#282c3a] text-[#e8e9ed]">
                <DialogHeader>
                    <DialogTitle>{contactToEdit ? 'Modifier le contact' : 'Ajouter un contact'}</DialogTitle>
                    <DialogDescription className="text-[#8b8fa3]">
                        {contactToEdit ? 'Mettre à jour les informations du contact.' : 'Ajouter une nouvelle personne à votre réseau.'}
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
                                className="bg-[#13151f] border-[#282c3a] focus:border-[#6c5ce7]"
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
                                className="bg-[#13151f] border-[#282c3a] focus:border-[#6c5ce7]"
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
                                className="bg-[#13151f] border-[#282c3a] focus:border-[#6c5ce7]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Statut</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: ContactStatus) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger className="bg-[#13151f] border-[#282c3a]">
                                    <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1d2d] border-[#282c3a] text-[#e8e9ed]">
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="contacted">Contacté</SelectItem>
                                    <SelectItem value="negotiation">Négociation</SelectItem>
                                    <SelectItem value="customer">Client</SelectItem>
                                    <SelectItem value="partner">Partenaire</SelectItem>
                                    <SelectItem value="lost">Perdu</SelectItem>
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
                                className="bg-[#13151f] border-[#282c3a] focus:border-[#6c5ce7]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn URL</Label>
                            <Input
                                id="linkedin"
                                value={formData.linkedin}
                                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                placeholder="https://linkedin.com/in/..."
                                className="bg-[#13151f] border-[#282c3a] focus:border-[#6c5ce7]"
                            />
                        </div>
                    </div>

                    {/* Dernier contact + Contact prévu */}
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
                            <Label htmlFor="nextFollowUpDate">Contact prévu (optionnel)</Label>
                            <input
                                type="date"
                                id="nextFollowUpDate"
                                value={formData.nextFollowUpDate || ''}
                                onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value || undefined })}
                                style={DATE_INPUT_STYLE}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Rencontré à TechCrunch Disrupt..."
                            className="bg-[#13151f] border-[#282c3a] focus:border-[#6c5ce7] min-h-[80px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-[#282c3a] hover:text-white">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#6c5ce7] hover:bg-[#5a4bd6] text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {contactToEdit ? 'Enregistrer' : 'Ajouter'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
