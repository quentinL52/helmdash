import { PenSquare } from 'lucide-react';

export default function WhiteboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center rounded-lg border-2 border-dashed border-border bg-card/50 py-24">
      <div className="p-8 rounded-lg">
        <PenSquare className="w-16 h-16 mx-auto text-primary animate-pulse" />
        <h1 className="mt-6 text-2xl font-bold">Collaborative Whiteboard</h1>
        <p className="mt-2 text-muted-foreground font-medium text-lg">Coming Soon!</p>
        <p className="mt-4 max-w-md text-sm text-muted-foreground/80">
          We're building an interactive whiteboard for you to sketch ideas, draw
          diagrams, and add virtual sticky notes. This is a complex feature, and
          we want to get it right for you. Stay tuned!
        </p>
      </div>
    </div>
  );
}
