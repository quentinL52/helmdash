import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

interface ProposalCardProps {
  proposalId: string;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function ProposalCard({ proposalId, onAccept, onReject }: ProposalCardProps) {
  return (
    <Card className="my-4 border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Proposition du Barreur
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground pb-2">
        <p>Le Barreur a identifié une action à réaliser pour vous (Ref: {proposalId}). Voulez-vous l'exécuter ?</p>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" onClick={() => onReject(proposalId)}>
          <X className="w-4 h-4 mr-1" /> Rejeter
        </Button>
        <Button size="sm" onClick={() => onAccept(proposalId)}>
          <Check className="w-4 h-4 mr-1" /> Accepter
        </Button>
      </CardFooter>
    </Card>
  );
}
