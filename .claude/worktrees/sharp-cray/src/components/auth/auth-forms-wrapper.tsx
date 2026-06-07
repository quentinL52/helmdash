'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function AuthFormsWrapper() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    }
                });
                if (error) throw error;
                toast({
                    title: "Vérifiez vos emails",
                    description: "Un lien de confirmation vous a été envoyé.",
                });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Une erreur est survenue",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full bg-card border-border text-foreground">
            <CardHeader>
                <CardTitle>{isSignUp ? "Créer un compte" : "Se connecter"}</CardTitle>
                <CardDescription className="text-muted-foreground">
                    {isSignUp ? "Entrez vos informations pour commencer." : "Bienvenue sur FounderOS."}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleAuth}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="fondateur@startup.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-card border-border text-foreground placeholder:text-gray-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-card border-border text-foreground"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        type="submit"
                        className="w-full bg-[#6c5ce7] hover:bg-[#6c5ce7]/90 text-white"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSignUp ? "S'inscrire" : "Se connecter"}
                    </Button>
                    <div className="text-sm text-center text-muted-foreground">
                        {isSignUp ? "Déjà un compte ?" : "Pas encore de compte ?"}
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="ml-2 text-[#6c5ce7] hover:underline"
                        >
                            {isSignUp ? "Se connecter" : "S'inscrire"}
                        </button>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
