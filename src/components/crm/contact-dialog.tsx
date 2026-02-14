import { useState, useEffect } from "react";
import { useFounderStore, Contact, ContactStatus } from "@/store/founder-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface ContactDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contactToEdit?: Contact | null;
}

const COLORS = {
    accent: '#6c5ce7',
    surface: '#181a24',
    border: '#282c3a',
    text: '#e8e9ed',
    muted: '#8b8fa3'
};

export function ContactDialog({ open, onOpenChange, contactToEdit }: ContactDialogProps) {
    const { addContact, updateContact } = useFounderStore();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Contact>>({
        name: '',
        company: '',
        role: '',
        email: '',
        linkedin: '',
        status: 'lead',
        notes: '',
        lastContactDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (contactToEdit) {
            setFormData({
                ...contactToEdit,
                lastContactDate: contactToEdit.lastContactDate.split('T')[0]
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
                lastContactDate: new Date().toISOString().split('T')[0]
            });
        }
    }, [contactToEdit, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));

        if (contactToEdit) {
            updateContact(contactToEdit.id, formData);
        } else {
            addContact(formData as Omit<Contact, 'id'>);
        }

        setIsLoading(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-[#1a1d2d] border-[#282c3a] text-[#e8e9ed]">
                <DialogHeader>
                    <DialogTitle>{contactToEdit ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
                    <DialogDescription className="text-[#8b8fa3]">
                        {contactToEdit ? 'Update contact details and status.' : 'Add a new person to your network.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
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
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="SpaceX"
                                className="bg-[#13151f] border-[#282c3a] focus:border-[#6c5ce7]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                placeholder="CEO"
                                className="bg-[#13151f] border-[#282c3a] focus:border-[#6c5ce7]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: ContactStatus) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger className="bg-[#13151f] border-[#282c3a]">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1d2d] border-[#282c3a] text-[#e8e9ed]">
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="negotiation">Negotiation</SelectItem>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="partner">Partner</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Met at TechCrunch Disrupt..."
                            className="bg-[#13151f] border-[#282c3a] focus:border-[#6c5ce7] min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-[#282c3a] hover:text-white">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#6c5ce7] hover:bg-[#5a4bd6] text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {contactToEdit ? 'Save Changes' : 'Add Contact'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
