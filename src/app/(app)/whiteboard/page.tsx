"use client";

import { useState, useRef, MouseEvent, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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

const NOTE_COLORS = [
  '#FFF9C4', // Light Yellow
  '#FFCDD2', // Light Pink
  '#C8E6C9', // Light Green
  '#BBDEFB', // Light Blue
  '#D1C4E9', // Light Purple
];

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export default function WhiteboardPage() {
  const [notes, setNotes] = useLocalStorage<PostItNote[]>('whiteboard-post-it-notes', []);
  const [draggingNote, setDraggingNote] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [zIndexCounter, setZIndexCounter] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    if (notes && notes.length > 0) {
      setZIndexCounter(Math.max(0, ...notes.map(n => n.zIndex || 0)));
    }
  }, []);

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
      color: getRandomItem(NOTE_COLORS),
      rotation: Math.random() * 4 - 2, // between -2 and 2 deg
      zIndex: newZIndex,
    };
    setNotes([...notes, newNote]);
  };

  const updateNoteContent = (id: string, newContent: string) => {
    setNotes(notes.map(note => note.id === id ? { ...note, content: newContent } : note));
  };
  
  const bringToFront = (id: string) => {
    const newZIndex = zIndexCounter + 1;
    setZIndexCounter(newZIndex);
     setNotes(notes.map(note => {
      if (note.id === id) {
        return { ...note, zIndex: newZIndex };
      }
      return note;
    }));
  }

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>, id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note || !whiteboardRef.current) return;

    bringToFront(id);
    
    setDraggingNote(id);
    const noteElement = e.currentTarget;
    const noteRect = noteElement.getBoundingClientRect();
    const whiteboardRect = whiteboardRef.current.getBoundingClientRect();
    
    setOffset({
      x: e.clientX - (noteRect.left - whiteboardRect.left),
      y: e.clientY - (noteRect.top - whiteboardRect.top),
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (draggingNote === null || !whiteboardRef.current) return;
    
    e.preventDefault();
    const whiteboardRect = whiteboardRef.current.getBoundingClientRect();
    let newX = e.clientX - offset.x - whiteboardRect.left;
    let newY = e.clientY - offset.y - whiteboardRect.top;
    
    // Boundary checks
    newX = Math.max(0, Math.min(newX, whiteboardRect.width - 200)); // 200 is note width
    newY = Math.max(0, Math.min(newY, whiteboardRect.height - 200)); // 200 is note height

    setNotes(notes.map(note =>
      note.id === draggingNote ? { ...note, x: newX, y: newY } : note
    ));
  };

  const handleMouseUp = () => {
    setDraggingNote(null);
  };
  
  const deleteNote = (id: string) => {
      setNotes(notes.filter(note => note.id !== id));
  }
  
  const clearBoard = () => {
    setNotes([]);
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
    <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex items-center justify-between mb-4">
            <div>
            <h1 className="text-3xl font-bold tracking-tight">Whiteboard</h1>
            <p className="text-muted-foreground">Right-click on the board to add a new note. Drag to move.</p>
            </div>
            <Button variant="outline" size="sm" onClick={clearBoard}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Board
            </Button>
        </div>

        <ContextMenu>
            <ContextMenuTrigger
                ref={whiteboardRef}
                className="relative flex-grow rounded-lg border-2 border-dashed border-border bg-card/50 overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {notes.map(note => (
                <div
                    key={note.id}
                    className={cn(
                        "absolute w-[200px] h-[200px] p-4 shadow-lg cursor-grab flex flex-col transition-shadow duration-200 group",
                        draggingNote === note.id && 'cursor-grabbing shadow-2xl scale-105'
                    )}
                    style={{ 
                        left: note.x, 
                        top: note.y, 
                        transform: `rotate(${note.rotation}deg)`,
                        backgroundColor: note.color,
                        zIndex: note.zIndex
                    }}
                    onMouseDown={(e) => handleMouseDown(e, note.id)}
                >
                    <Textarea
                        value={note.content}
                        onChange={(e) => updateNoteContent(note.id, e.target.value)}
                        className="flex-grow bg-transparent border-0 resize-none focus-visible:ring-0 text-black placeholder:text-black/50 font-medium p-0"
                        placeholder="Write something..."
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            bringToFront(note.id);
                        }}
                    />
                     <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-7 w-7 text-black/40 hover:text-black rounded-full hover:bg-black/10 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
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
