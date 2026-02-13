"use client";

import { useLocalStorage } from '@/hooks/use-local-storage';
import { LEAN_CANVAS_SECTIONS, type LeanCanvasSectionId } from '@/lib/constants';
import { CanvasSection } from './components/canvas-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type CanvasData = Record<LeanCanvasSectionId, string>;
const initialCanvasData: CanvasData = LEAN_CANVAS_SECTIONS.reduce(
  (acc, section) => {
    acc[section.id] = '';
    return acc;
  },
  {} as CanvasData
);

export default function LeanCanvasPage() {
  const [canvasData, setCanvasData] = useLocalStorage<CanvasData>(
    'ignitehq-lean-canvas',
    initialCanvasData
  );

  const [businessConcept, setBusinessConcept] = useLocalStorage<string>(
    'ignitehq-business-concept',
    ''
  );

  const handleContentChange = (id: LeanCanvasSectionId, content: string) => {
    setCanvasData((prev) => ({ ...prev, [id]: content }));
  };

  const sections = LEAN_CANVAS_SECTIONS;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lean Canvas</h1>
        <p className="text-muted-foreground">
          A 1-page business plan that helps you deconstruct your idea into its
          key assumptions.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-concept">
          Core Business Concept
        </Label>
        <Input
          id="business-concept"
          placeholder="e.g., An AI-powered platform for personal finance management"
          value={businessConcept}
          onChange={(e) => setBusinessConcept(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-4 md:col-span-1 h-full">
          <CanvasSection
            {...sections[0]}
            content={canvasData[sections[0].id]}
            onContentChange={(content) =>
              handleContentChange(sections[0].id, content)
            }
            businessConcept={businessConcept}
          />
        </div>
        <div className="lg:col-span-6 md:col-span-1 h-full">
          <CanvasSection
            {...sections[6]}
            content={canvasData[sections[6].id]}
            onContentChange={(content) =>
              handleContentChange(sections[6].id, content)
            }
            businessConcept={businessConcept}
          />
        </div>

        <div className="lg:col-span-4 md:col-span-1 h-full">
          <CanvasSection
            {...sections[1]}
            content={canvasData[sections[1].id]}
            onContentChange={(content) =>
              handleContentChange(sections[1].id, content)
            }
            businessConcept={businessConcept}
          />
        </div>
        <div className="lg:col-span-6 md:col-span-1 h-full">
           <CanvasSection
            {...sections[3]}
            content={canvasData[sections[3].id]}
            onContentChange={(content) =>
              handleContentChange(sections[3].id, content)
            }
            businessConcept={businessConcept}
          />
        </div>

        <div className="lg:col-span-4 md:col-span-1 h-full">
          <CanvasSection
            {...sections[5]}
            content={canvasData[sections[5].id]}
            onContentChange={(content) =>
              handleContentChange(sections[5].id, content)
            }
            businessConcept={businessConcept}
          />
        </div>
        <div className="lg:col-span-3 md:col-span-1 h-full">
          <CanvasSection
            {...sections[2]}
            content={canvasData[sections[2].id]}
            onContentChange={(content) =>
              handleContentChange(sections[2].id, content)
            }
            businessConcept={businessConcept}
          />
        </div>
        <div className="lg:col-span-3 md:col-span-2 h-full">
          <CanvasSection
            {...sections[4]}
            content={canvasData[sections[4].id]}
            onContentChange={(content) =>
              handleContentChange(sections[4].id, content)
            }
            businessConcept={businessConcept}
          />
        </div>

        <div className="lg:col-span-5 md:col-span-1 h-full">
          <CanvasSection
            {...sections[7]}
            content={canvasData[sections[7].id]}
            onContentChange={(content) =>
              handleContentChange(sections[7].id, content)
            }
            businessConcept={businessConcept}
          />
        </div>
        <div className="lg:col-span-5 md:col-span-1 h-full">
          <CanvasSection
            {...sections[8]}
            content={canvasData[sections[8].id]}
            onContentChange={(content) =>
              handleContentChange(sections[8].id, content)
            }
            businessConcept={businessConcept}
          />
        </div>
      </div>
    </div>
  );
}
