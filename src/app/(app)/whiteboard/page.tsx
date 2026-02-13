"use client";

import { useState, useRef, MouseEvent, useEffect } from 'react';
import { Plus, Trash2, RectangleHorizontal, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

type PostItNote = {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
  rotation: number;
  zIndex: number;
};

type Shape = {
  id: string;
  type: 'rectangle' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  zIndex: number;
};

const ITEM_COLORS = [
  '#FFF9C4', // Light Yellow
  '#FFCDD2', // Light Pink
  '#C8E6C9', // Light Green
  '#BBDEFB', // Light Blue
  '#D1C4E9', // Light Purple
];

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export default function WhiteboardPage() {
  const [notes, setNotes] = useLocalStorage<PostItNote[]>('whiteboard-post-it-notes', []);
  const [shapes, setShapes] = useLocalStorage<Shape[]>('whiteboard-shapes', []);
  const [draggingItem, setDraggingItem] = useState<{ id: string; type: 'note' | 'shape' } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [zIndexCounter, setZIndexCounter] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    const maxNoteZ = notes.length > 0 ? Math.max(0, ...notes.map(n => n.zIndex || 0)) : 0;
    const maxShapeZ = shapes.length > 0 ? Math.max(0, ...shapes.map(s => s.zIndex || 0)) : 0;
    setZIndexCounter(Math.max(maxNoteZ, maxShapeZ));
  }, [notes, shapes]);

  const addNote = (e: MouseEvent) => {
    if (!whiteboardRef.current) return;
    const rect = whiteboardRef.current.getBoundingClientRect();
    const newZIndex = zIndexCounter + 1;
    setZIndexCounter(newZIndex);

    const newNote: PostItNote = {
      id: Date.now().toString(),
      content: '',
      x: e.clientX - rect.left - 100, // center note on cursor
      y: e.clientY - rect.top - 100,
      color: getRandomItem(ITEM_COLORS),
      rotation: Math.random() * 4 - 2, // between -2 and 2 deg
      zIndex: newZIndex,
    };
    setNotes([...notes, newNote]);
  };

  const addShape = (type: 'rectangle' | 'circle') => {
    if (!whiteboardRef.current) return;
    const rect = whiteboardRef.current.getBoundingClientRect();
    const newZIndex = zIndexCounter + 1;
    setZIndexCounter(newZIndex);

    const newShape: Shape = {
      id: Date.now().toString(),
      type,
      x: rect.width / 2 - 100,
      y: rect.height / 2 - 75,
      width: 200,
      height: 150,
      color: getRandomItem(ITEM_COLORS),
      rotation: 0,
      zIndex: newZIndex,
    };
    setShapes([...shapes, newShape]);
  };

  const updateNoteContent = (id: string, newContent: string) => {
    setNotes(notes.map(note => note.id === id ? { ...note, content: newContent } : note));
  };
  
  const bringToFront = (id: string, type: 'note' | 'shape') => {
    const newZIndex = zIndexCounter + 1;
    setZIndexCounter(newZIndex);
    if (type === 'note') {
      setNotes(notes.map(note => note.id === id ? { ...note, zIndex: newZIndex } : note));
    } else {
      setShapes(shapes.map(shape => shape.id === id ? { ...shape, zIndex: newZIndex } : shape));
    }
  }

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>, id: string, type: 'note' | 'shape') => {
    const item = type === 'note' ? notes.find(n => n.id === id) : shapes.find(s => s.id === id);
    if (!item) return;

    bringToFront(id, type);
    
    setDraggingItem({ id, type });
    const itemRect = e.currentTarget.getBoundingClientRect();
    setOffset({
      x: e.clientX - itemRect.left,
      y: e.clientY - itemRect.top,
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (draggingItem === null || !whiteboardRef.current) return;
    
    e.preventDefault();
    const whiteboardRect = whiteboardRef.current.getBoundingClientRect();
    
    let newX = e.clientX - whiteboardRect.left - offset.x;
    let newY = e.clientY - whiteboardRect.top - offset.y;
    
    const item = draggingItem.type === 'note'
      ? notes.find(n => n.id === draggingItem.id)
      : shapes.find(s => s.id === draggingItem.id);
    
    if (!item) return;

    const itemWidth = draggingItem.type === 'note' ? 200 : (item as Shape).width;
    const itemHeight = draggingItem.type === 'note' ? 200 : (item as Shape).height;

    // Boundary checks
    newX = Math.max(0, Math.min(newX, whiteboardRect.width - itemWidth));
    newY = Math.max(0, Math.min(newY, whiteboardRect.height - itemHeight));

    if (draggingItem.type === 'note') {
      setNotes(notes.map(note =>
        note.id === draggingItem.id ? { ...note, x: newX, y: newY } : note
      ));
    } else {
      setShapes(shapes.map(shape =>
          shape.id === draggingItem.id ? { ...shape, x: newX, y: newY } : shape
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggingItem(null);
  };
  
  const deleteItem = (id: string, type: 'note' | 'shape') => {
      if (type === 'note') {
        setNotes(notes.filter(note => note.id !== id));
      } else {
        setShapes(shapes.filter(shape => shape.id !== id));
      }
  }
  
  const clearBoard = () => {
    setNotes([]);
    setShapes([]);
  }

  if (!isMounted) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center rounded-lg border-2 border-dashed border-border bg-card/50 py-24">
            <div className="p-8 rounded-lg">
                <div className="w-16 h-16 mx-auto animate-spin rounded-full border-4 border-dashed border-primary"></div>
                <h1 className="mt-6 text-2xl font-bold">Loading Whiteboard...</h1>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full whiteboard-page">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Whiteboard</h1>
              <p className="text-muted-foreground">Right-click to add a note. Use the toolbar to add shapes.</p>
            </div>
            <Button variant="outline" size="sm" onClick={clearBoard}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Board
            </Button>
        </div>

        <div className="flex items-center gap-2 p-2 border-b">
          <Button variant="ghost" size="icon" onClick={() => addShape('rectangle')} title="Add Rectangle">
              <RectangleHorizontal className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => addShape('circle')} title="Add Circle">
              <Circle className="h-5 w-5" />
          </Button>
        </div>

        <ContextMenu>
            <ContextMenuTrigger
                ref={whiteboardRef}
                className="relative flex-grow overflow-hidden whiteboard-grid w-full"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {notes.map(note => (
                <div
                    key={note.id}
                    className={cn(
                        "absolute w-[200px] h-[200px] p-4 shadow-lg cursor-grab flex flex-col transition-shadow duration-200 group",
                        draggingItem?.id === note.id && 'cursor-grabbing shadow-2xl scale-105'
                    )}
                    style={{ 
                        left: note.x, 
                        top: note.y, 
                        transform: `rotate(${note.rotation}deg)`,
                        backgroundColor: note.color,
                        zIndex: note.zIndex
                    }}
                    onMouseDown={(e) => handleMouseDown(e, note.id, 'note')}
                >
                    <Textarea
                        value={note.content}
                        onChange={(e) => updateNoteContent(note.id, e.target.value)}
                        className="flex-grow bg-transparent border-0 resize-none focus-visible:ring-0 text-black placeholder:text-black/50 font-medium p-0"
                        placeholder="Write something..."
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            bringToFront(note.id, 'note');
                        }}
                    />
                     <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-7 w-7 text-black/40 hover:text-black rounded-full hover:bg-black/10 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(note.id, 'note');
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                ))}
                {shapes.map(shape => (
                <div
                    key={shape.id}
                    className={cn(
                        "absolute shadow-lg cursor-grab flex flex-col transition-shadow duration-200 group",
                        draggingItem?.id === shape.id && 'cursor-grabbing shadow-2xl scale-105'
                    )}
                    style={{ 
                        left: shape.x, 
                        top: shape.y,
                        width: shape.width,
                        height: shape.height,
                        transform: `rotate(${shape.rotation}deg)`,
                        backgroundColor: shape.color,
                        zIndex: shape.zIndex,
                        borderRadius: shape.type === 'circle' ? '50%' : '0.25rem',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, shape.id, 'shape')}
                >
                     <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-7 w-7 text-black/40 hover:text-black rounded-full hover:bg-black/10 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(shape.id, 'shape');
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                ))}
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={(e: any) => addNote(e)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Note
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    </div>
  );
}
