"use client";

import { useState } from 'react';
import { Sparkles, Copy, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { LeanCanvasSectionId } from '@/lib/constants';
import { generateLeanCanvasSectionIdeas } from '@/ai/flows/generate-lean-canvas-section-ideas-flow';

type AISuggestionModalProps = {
  sectionId: LeanCanvasSectionId;
  businessConcept: string;
  onSelectSuggestion: (suggestion: string) => void;
};

export function AISuggestionModal({
  sectionId,
  businessConcept,
  onSelectSuggestion,
}: AISuggestionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!businessConcept) {
      toast({
        variant: 'destructive',
        title: 'Business Concept Required',
        description: 'Please enter your business concept before generating ideas.',
      });
      return;
    }
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await generateLeanCanvasSectionIdeas({
        businessConcept,
        leanCanvasSection: sectionId,
      });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Ideas',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="h-4 w-4" />
        <span className="sr-only">Generate AI Suggestions</span>
      </Button>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Suggestions for {sectionId}</DialogTitle>
          <DialogDescription>
            Based on your concept: "{businessConcept || '...'}"
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div
                    className="flex-grow p-3 bg-muted/50 rounded-md text-sm cursor-pointer hover:bg-muted"
                    onClick={() => onSelectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 flex-shrink-0"
                    onClick={() => handleCopy(suggestion)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              Click "Generate" to get AI-powered ideas for this section.
            </div>
          )}
        </div>
        <Button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Ideas'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
