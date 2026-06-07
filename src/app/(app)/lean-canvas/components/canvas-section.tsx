"use client";

import React, { useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { LeanCanvasSectionId } from '@/lib/constants';

interface CanvasSectionProps {
  id: LeanCanvasSectionId;
  title: string;
  description: string;
  content: string;
  onContentChange: (content: string) => void;
  businessConcept: string;
  placeholder?: string;
  isReadOnly?: boolean;
}

export function CanvasSection({
  title,
  description,
  content,
  onContentChange,
  placeholder,
  isReadOnly,
}: CanvasSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== content) {
      if (document.activeElement !== contentRef.current) {
        contentRef.current.innerText = content || '';
      }
    }
  }, [content]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onContentChange(e.currentTarget.innerText);
  };

  return (
    <Card className={`h-full flex flex-col relative ${isReadOnly ? 'border-primary/20 shadow-none' : ''}`}>
      <CardHeader className={isReadOnly ? "p-3 pb-0" : ""}>
        <CardTitle className={isReadOnly ? "text-sm" : ""}>{title}</CardTitle>
        <CardDescription className={isReadOnly ? "text-[10px] leading-tight" : ""}>{description}</CardDescription>
      </CardHeader>
      <CardContent className={`flex-grow ${isReadOnly ? "p-3 pt-2" : ""}`}>
        <div
          ref={contentRef}
          contentEditable={!isReadOnly}
          suppressContentEditableWarning={true}
          onInput={handleInput}
          className={`h-full min-h-[150px] outline-none whitespace-pre-wrap overflow-visible rounded-md text-sm empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground ${
            isReadOnly 
              ? 'bg-transparent text-xs break-words' 
              : 'p-3 border focus:ring-2 focus:ring-ring focus:border-input bg-transparent cursor-text'
          }`}
          data-placeholder={placeholder}
        />
      </CardContent>
    </Card>
  );
}
