"use client";

import { useLocalStorage } from '@/hooks/use-local-storage';
import { LEAN_CANVAS_SECTIONS, type LeanCanvasSectionId, COLORS } from '@/lib/constants';
import { CanvasSection } from './components/canvas-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { RecommendationBanner } from '@/components/ui/recommendation-banner';
import { Sparkles, Download } from 'lucide-react';
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

  const recommendations = useFounderStore(s => s.strategicRecommendations?.leanCanvasRecommendations);
  const showRecommendations = useFounderStore(s => s.showStrategicRecommendations);
  const toggleRecommendations = useFounderStore(s => s.toggleStrategicRecommendations);

  const [businessConcept, setBusinessConcept] = useLocalStorage<string>(
    'ignitehq-business-concept',
    ''
  );

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
        />
      </div>
    );
  };

  const exportPDF = () => {
    const element = document.getElementById('lean-canvas-export-area');
    if (!element) return;
    
    const opt = {
      margin:       5,
      filename:     'lean-canvas-airh.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save();
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
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter PDF
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={toggleRecommendations}
              style={{ background: showRecommendations ? COLORS.accent + '22' : COLORS.surface, color: showRecommendations ? COLORS.accent : COLORS.textMuted }}
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showRecommendations && recommendations && recommendations.length > 0 && (
          <RecommendationBanner
            recommendations={recommendations}
            type="lean-canvas"
            onApply={(item) => {
              // Find logical section for the suggestion
              // simple mapping based on section name
              const sectionMap: Record<string, LeanCanvasSectionId> = {
                'Problem': 'Problem',
                'Solution': 'Solution',
                'Metrics': 'Key Metrics',
                'UVP': 'Unique Value Proposition',
                'Advantage': 'Unfair Advantage',
                'Channels': 'Channels',
                'Segments': 'Customer Segments',
                'Costs': 'Cost Structure',
                'Revenue': 'Revenue Streams'
              };
              const targetId = Object.keys(sectionMap).find(k => item.section.includes(k))
                ? sectionMap[Object.keys(sectionMap).find(k => item.section.includes(k))!]
                : item.section as LeanCanvasSectionId;

              if (targetId) {
                const current = canvasData[targetId] || '';
                updateCanvasSection(targetId, current + (current ? '\n\n' : '') + `> ${item.suggestion}`);
              }
            }}
            onDismiss={toggleRecommendations}
          />
        )}

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

      <div id="lean-canvas-export-area" className="mt-8 grid flex-1 grid-cols-1 grid-rows-9 gap-6 md:grid-cols-2 md:grid-rows-5 lg:grid-cols-10 lg:grid-rows-4">
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
