"use client";

import { useState } from 'react';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { LEAN_CANVAS_SECTIONS, type LeanCanvasSectionId, COLORS } from '@/lib/constants';
import { CanvasSection } from './components/canvas-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2pdf from 'html2pdf.js';

type CanvasData = Record<LeanCanvasSectionId, string>;
const initialCanvasData: CanvasData = LEAN_CANVAS_SECTIONS.reduce(
  (acc, section) => {
    acc[section.id] = '';
    return acc;
  },
  {} as CanvasData
);

export default function LeanCanvasPage() {
  const canvasData = useFounderStore(s => s.leanCanvas || {});
  const updateCanvasSection = useFounderStore(s => s.updateCanvasSection);

  const [businessConcept, setBusinessConcept] = useLocalStorage<string>(
    'ignitehq-business-concept',
    ''
  );
  const [isExporting, setIsExporting] = useState(false);

  const language = useFounderStore(s => s.language);
  const t = translations[language].leanCanvas;

  const handleContentChange = (id: LeanCanvasSectionId, content: string) => {
    updateCanvasSection(id, content);
  };

  const sections = LEAN_CANVAS_SECTIONS;

  const getSectionTranslation = (id: LeanCanvasSectionId) => {
    switch (id) {
      case 'Problem': return t.sections.problem;
      case 'Solution': return t.sections.solution;
      case 'Key Metrics': return t.sections.keyMetrics;
      case 'Unique Value Proposition': return t.sections.uvp;
      case 'Unfair Advantage': return t.sections.unfairAdvantage;
      case 'Channels': return t.sections.channels;
      case 'Customer Segments': return t.sections.customerSegments;
      case 'Cost Structure': return t.sections.costStructure;
      case 'Revenue Streams': return t.sections.revenueStreams;
      default: return { title: id, desc: '' };
    }
  };

  const renderSection = (sectionIndex: number, className: string) => {
    const section = sections[sectionIndex];
    const tr = getSectionTranslation(section.id);
    return (
      <div className={className}>
        <CanvasSection
          {...section}
          title={tr.title}
          description={tr.desc}
          placeholder={`${language === 'fr' ? 'Idées pour' : 'Ideas for'} ${tr.title}...`}
          content={canvasData[section.id] || ''}
          onContentChange={(content) =>
            handleContentChange(section.id, content)
          }
          businessConcept={businessConcept}
          isExporting={isExporting}
        />
      </div>
    );
  };

  const exportPDF = async () => {
    setIsExporting(true);
    
    // Give React a tick to re-render as divs
    setTimeout(async () => {
      const element = document.getElementById('lean-canvas-export-area');
      if (!element) {
        setIsExporting(false);
        return;
      }
      
      const opt = {
        margin:       5,
        filename:     'lean-canvas-airh.pdf',
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, useCORS: true, windowWidth: 1280 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      
      await html2pdf().set(opt).from(element).save();
      setIsExporting(false);
    }, 100);
  };

  return (
    <div className="flex h-full flex-col">
      <div className='space-y-4'>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground">
              {t.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportPDF}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exportation...' : 'Exporter PDF'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-concept">
            {t.concept}
          </Label>
          <Input
            id="business-concept"
            placeholder={t.conceptPlaceholder}
            value={businessConcept}
            onChange={(e) => setBusinessConcept(e.target.value)}
          />
        </div>
      </div>

      <div id="lean-canvas-export-area" className={`mt-8 grid flex-1 grid-cols-1 grid-rows-9 gap-6 md:grid-cols-2 md:grid-rows-5 lg:grid-cols-10 lg:grid-rows-4 ${isExporting ? 'bg-background p-4' : ''}`}>
        {renderSection(0, "lg:col-span-4 md:col-span-1 h-full")}
        {renderSection(6, "lg:col-span-6 md:col-span-1 h-full")}
        {renderSection(1, "lg:col-span-4 md:col-span-1 h-full")}
        {renderSection(3, "lg:col-span-6 md:col-span-1 h-full")}
        {renderSection(5, "lg:col-span-4 md:col-span-1 h-full")}
        {renderSection(2, "lg:col-span-3 md:col-span-1 h-full")}
        {renderSection(4, "lg:col-span-3 md:col-span-2 h-full")}
        {renderSection(7, "lg:col-span-5 md:col-span-1 h-full")}
        {renderSection(8, "lg:col-span-5 md:col-span-1 h-full")}
      </div>
    </div>
  );
}
