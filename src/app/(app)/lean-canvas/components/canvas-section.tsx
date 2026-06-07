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
}

export function CanvasSection({
  id,
  title,
  description,
  content,
  onContentChange,
  businessConcept,
  placeholder,
}: CanvasSectionProps) {
  return (
    <Card className="h-full flex flex-col relative">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="h-full min-h-[150px] resize-none"
          placeholder={placeholder || `Ideas for ${title}...`}
        />
      </CardContent>
    </Card>
  );
}
