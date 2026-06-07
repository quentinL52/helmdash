"use client";

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  brainstormBusinessOpportunities,
  type BrainstormBusinessOpportunitiesOutput,
} from '@/ai/flows/brainstorm-business-opportunities-flow';
import { Label } from '@/components/ui/label';

export default function BrainstormPage() {
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] =
    useState<BrainstormBusinessOpportunitiesOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry.trim()) {
      toast({
        variant: 'destructive',
        title: 'Industry/Area Required',
        description:
          'Please describe an industry or area of interest to brainstorm.',
      });
      return;
    }
    setIsLoading(true);
    setResults(null);
    try {
      const response = await brainstormBusinessOpportunities({
        industryOrArea: industry,
      });
      setResults(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Brainstorming Failed',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Brainstorm</h1>
        <p className="text-muted-foreground">
          Generate novel business ideas, market segments, and solutions with AI.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="industry-input">Industry or Area of Interest</Label>
          <Textarea
            id="industry-input"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g., Sustainable urban farming, personalized education technology, remote team collaboration tools..."
            className="min-h-[100px]"
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Brainstorming...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Ideas
            </>
          )}
        </Button>
      </form>

      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {results.businessIdeas.map((idea, i) => (
                  <li key={i}>{idea}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Market Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {results.marketSegments.map((segment, i) => (
                  <li key={i}>{segment}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Innovative Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {results.solutions.map((solution, i) => (
                  <li key={i}>{solution}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
