'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { GripHorizontal, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WidgetSize, getSizeClasses } from './widget-registry';

interface WidgetWrapperProps {
  id: string;
  title: string;
  size: WidgetSize;
  children: React.ReactNode;
  onRemove?: (id: string) => void;
  onChangeSize?: (id: string, newSize: WidgetSize) => void;
  isEditMode?: boolean;
}

export function WidgetWrapper({
  id,
  title,
  size,
  children,
  onRemove,
  onChangeSize,
  isEditMode = false
}: WidgetWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleToggleSize = () => {
    if (!onChangeSize) return;
    if (size === 'medium') onChangeSize(id, 'large');
    else if (size === 'large') onChangeSize(id, 'full');
    else if (size === 'full') onChangeSize(id, 'medium');
    else onChangeSize(id, 'medium');
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative h-full flex flex-col ${getSizeClasses(size)} ${isDragging ? 'shadow-2xl scale-[1.02]' : ''} transition-shadow duration-200`}
    >
      {/* Edit Mode Overlay & Controls */}
      {isEditMode && (
        <div className="absolute -top-3 -right-3 z-50 flex gap-1 transition-opacity duration-200">
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] bg-background text-foreground"
            onClick={handleToggleSize}
          >
            {size === 'full' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-8 w-8 rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]"
            onClick={() => onRemove && onRemove(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Widget Container */}
      <div className={`h-full group ${isEditMode ? 'ring-2 ring-primary/50 ring-dashed rounded-xl overflow-hidden' : ''}`}>
        {isEditMode && (
          <div 
            {...attributes} 
            {...listeners}
            className="h-6 w-full bg-primary/20 hover:bg-primary/40 cursor-grab active:cursor-grabbing flex items-center justify-center border-b border-primary/20 backdrop-blur-sm transition-colors"
          >
            <GripHorizontal className="h-4 w-4 text-primary" />
          </div>
        )}
        <div className={`h-full ${isEditMode ? 'pointer-events-none opacity-80' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
