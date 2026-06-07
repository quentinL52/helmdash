"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { LeanCanvasSectionId } from '@/lib/constants';

interface CanvasSectionProps {
  id: LeanCanvasSectionId;
  title: string;
  description: string;
  content: string;
  onContentChange: (content: string) => void;
  businessConcept: string;
  placeholder?: string;
  isExporting?: boolean;
}

export function CanvasSection({
  id,
  title,
  description,
  content,
  onContentChange,
  businessConcept,
  placeholder,
  isExporting,
}: CanvasSectionProps) {
  return (
    <Card className={`h-full flex flex-col relative ${isExporting ? 'border-primary/20 shadow-none' : ''}`}>
      <CardHeader className={isExporting ? "p-3 pb-0" : ""}>
        <CardTitle className={isExporting ? "text-sm" : ""}>{title}</CardTitle>
        <CardDescription className={isExporting ? "text-[10px] leading-tight" : ""}>{description}</CardDescription>
      </CardHeader>
      <CardContent className={`flex-grow ${isExporting ? "p-3 pt-2" : ""}`}>
        {isExporting ? (
          <div className="text-xs whitespace-pre-wrap break-words min-h-[100px]">
            {content || <span className="text-muted-foreground italic">Vide</span>}
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="h-full min-h-[150px] resize-none"
            placeholder={placeholder || `Ideas for ${title}...`}
          />
        )}
      </CardContent>
    </Card>
  );
}
