'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { LEAN_CANVAS_SECTIONS, type LeanCanvasSectionId, COLORS } from '@/lib/constants';
import { useGamification } from '@/hooks/use-gamification';
import { CanvasSection } from './components/canvas-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageAgent } from '@/components/agent/PageAgent';
import { createClient } from '@/utils/supabase/client';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Download, Save, Trash2, Eye, LayoutDashboard, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
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
  const [userId, setUserId] = useState<string | null>(null);
  const canvasData = useFounderStore(s => s.leanCanvas || {});
  const updateCanvasSection = useFounderStore(s => s.updateCanvasSection);
  const leanCanvasSnapshots = useFounderStore(s => s.leanCanvasSnapshots || []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);
  const saveLeanCanvasSnapshot = useFounderStore(s => s.saveLeanCanvasSnapshot);
  const deleteLeanCanvasSnapshot = useFounderStore(s => s.deleteLeanCanvasSnapshot);

  const [businessConcept, setBusinessConcept] = useLocalStorage<string>(
    'helmdash-business-concept',
    ''
  );
  const [isExporting, setIsExporting] = useState(false);

  const language = useFounderStore(s => s.language);
  const t = translations[language].leanCanvas;

  const { awardXP } = useGamification();

  const handleContentChange = (id: LeanCanvasSectionId, content: string) => {
    updateCanvasSection(id, content);
    awardXP('lean_canvas_updated');
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

  const renderSection = (sectionIndex: number, className: string, content?: string, isReadOnly?: boolean) => {
    const section = sections[sectionIndex];
    const tr = getSectionTranslation(section.id);
    return (
      <div className={className}>
        <CanvasSection
          {...section}
          title={tr.title}
          description={tr.desc}
          placeholder={`${language === 'fr' ? 'Idées pour' : 'Ideas for'} ${tr.title}...`}
          content={content !== undefined ? content : (canvasData[section.id] || '')}
          onContentChange={(newContent) => {
            if (isReadOnly) return;
            handleContentChange(section.id, newContent);
          }}
          businessConcept={businessConcept}
          isReadOnly={isReadOnly}
        />
      </div>
    );
  };

  const escapeHtml = (unsafe: string) => {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  };

  const buildPdfElement = (data: CanvasData, currentLanguage: string, currentT: any) => {
    const getTitle = (id: LeanCanvasSectionId) => {
      switch (id) {
        case 'Problem': return currentT.sections.problem.title;
        case 'Solution': return currentT.sections.solution.title;
        case 'Key Metrics': return currentT.sections.keyMetrics.title;
        case 'Unique Value Proposition': return currentT.sections.uvp.title;
        case 'Unfair Advantage': return currentT.sections.unfairAdvantage.title;
        case 'Channels': return currentT.sections.channels.title;
        case 'Customer Segments': return currentT.sections.customerSegments.title;
        case 'Cost Structure': return currentT.sections.costStructure.title;
        case 'Revenue Streams': return currentT.sections.revenueStreams.title;
        default: return id;
      }
    };

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    
    container.innerHTML = `
      <style>
        .lean-canvas-pdf {
          width: 1122px;
          height: 794px;
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 4px;
          background: #000;
          border: 1px solid #000;
          font-family: Arial, sans-serif;
          box-sizing: border-box;
        }
        .pdf-cell {
          background: #f8f9fa;
          color: #1a1a1a;
          padding: 8px 10px;
          overflow: hidden;
          font-size: 10px;
          line-height: 1.4;
          box-sizing: border-box;
        }
        .pdf-cell h3 {
          font-size: 11px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #6c5ce7;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cell-probleme          { grid-column: 1 / 3; grid-row: 1 / 3; }
        .cell-solution          { grid-column: 3 / 5; grid-row: 1 / 2; }
        .cell-indicateurs       { grid-column: 3 / 5; grid-row: 2 / 3; }
        .cell-pvp               { grid-column: 5 / 7; grid-row: 1 / 3; }
        .cell-avantage          { grid-column: 7 / 9; grid-row: 1 / 2; }
        .cell-canaux            { grid-column: 7 / 9; grid-row: 2 / 3; }
        .cell-segments          { grid-column: 9 / 11; grid-row: 1 / 3; }
        .cell-couts             { grid-column: 1 / 6; grid-row: 3 / 4; }
        .cell-revenus           { grid-column: 6 / 11; grid-row: 3 / 4; }
      </style>
      <div class="lean-canvas-pdf">
        <div class="pdf-cell cell-probleme">
          <h3>${getTitle('Problem')}</h3>
          <div style="white-space: pre-wrap;">${escapeHtml(data['Problem'])}</div>
        </div>
        <div class="pdf-cell cell-solution">
          <h3>${getTitle('Solution')}</h3>
          <div style="white-space: pre-wrap;">${escapeHtml(data['Solution'])}</div>
        </div>
        <div class="pdf-cell cell-indicateurs">
          <h3>${getTitle('Key Metrics')}</h3>
          <div style="white-space: pre-wrap;">${escapeHtml(data['Key Metrics'])}</div>
        </div>
        <div class="pdf-cell cell-pvp">
          <h3>${getTitle('Unique Value Proposition')}</h3>
          <div style="white-space: pre-wrap;">${escapeHtml(data['Unique Value Proposition'])}</div>
        </div>
        <div class="pdf-cell cell-avantage">
          <h3>${getTitle('Unfair Advantage')}</h3>
          <div style="white-space: pre-wrap;">${escapeHtml(data['Unfair Advantage'])}</div>
        </div>
        <div class="pdf-cell cell-canaux">
          <h3>${getTitle('Channels')}</h3>
          <div style="white-space: pre-wrap;">${escapeHtml(data['Channels'])}</div>
        </div>
        <div class="pdf-cell cell-segments">
          <h3>${getTitle('Customer Segments')}</h3>
          <div style="white-space: pre-wrap;">${escapeHtml(data['Customer Segments'])}</div>
        </div>
        <div class="pdf-cell cell-couts">
          <h3>${getTitle('Cost Structure')}</h3>
          <div style="white-space: pre-wrap;">${escapeHtml(data['Cost Structure'])}</div>
        </div>
        <div class="pdf-cell cell-revenus">
          <h3>${getTitle('Revenue Streams')}</h3>
          <div style="white-space: pre-wrap;">${escapeHtml(data['Revenue Streams'])}</div>
        </div>
      </div>
    `;
    return container;
  };

  const exportPDF = async (dataToExport?: CanvasData, timestamp?: number) => {
    setIsExporting(true);
    
    try {
      const isEvent = dataToExport && typeof dataToExport === 'object' && ('nativeEvent' in dataToExport || 'preventDefault' in dataToExport);
      const data = (dataToExport && !isEvent) ? dataToExport as CanvasData : canvasData;
      
      const exportElement = buildPdfElement(data as CanvasData, language, t);
      document.body.appendChild(exportElement);
      
      const filename = timestamp 
        ? `lean-canvas-${new Date(timestamp).toISOString().split('T')[0]}.pdf` 
        : 'lean-canvas.pdf';

      const opt = {
        margin:       0,
        filename,
        image:        { type: 'png' as const, quality: 1 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          windowWidth: 1122, 
          windowHeight: 794,
          width: 1122,
          height: 794,
          backgroundColor: '#ffffff',
          logging: false 
        },
        jsPDF:        { 
          unit: 'px', 
          format: [1122, 794] as [number, number], 
          orientation: 'landscape' as 'landscape' | 'portrait',
          hotfixes: ['px_scaling'] 
        }
      };
      
      await html2pdf()
        .set(opt)
        .from(exportElement as HTMLElement)
        .save();
      document.body.removeChild(exportElement);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className='space-y-4'>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-pixel text-secondary flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8" />
              {t.title}
            </h1>
            <p className="text-muted-foreground">
              {t.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                saveLeanCanvasSnapshot();
                toast({ title: language === 'fr' ? 'Snapshot enregistré' : 'Snapshot saved' });
              }}
              disabled={isExporting}
            >
              <Save className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Enregistrer version' : 'Save version'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportPDF(canvasData as CanvasData)}
              disabled={isExporting}
              className="font-pixel text-[10px]"
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

      <div
        id="lean-canvas-export-area"
        className="mt-8 grid flex-1 gap-6 grid-cols-1 grid-rows-9 md:grid-cols-2 md:grid-rows-5 lg:grid-cols-10 lg:grid-rows-4"
      >
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

      <div className="mt-12 border-t pt-8">
        <h2 className="text-xl font-pixel text-secondary flex items-center gap-2 mb-4">
          <History className="w-5 h-5" />
          {language === 'fr' ? 'Historique des versions' : 'Version History'}
        </h2>
        {leanCanvasSnapshots.length === 0 ? (
          <p className="text-muted-foreground text-sm">{language === 'fr' ? 'Aucune version sauvegardée pour le moment.' : 'No saved versions yet.'}</p>
        ) : (
          <div className="space-y-3">
            {leanCanvasSnapshots.map((snapshot) => (
              <Card key={snapshot.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">
                    {new Date(snapshot.date).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={() => exportPDF(snapshot.data as unknown as CanvasData, snapshot.date as unknown as number)}
                    disabled={isExporting}
                  >
                    <Download className="w-3 h-3 mr-2" />
                    {language === 'fr' ? 'Exporter' : 'Export'}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Eye className="w-3 h-3 mr-2" />
                        {language === 'fr' ? 'Consulter' : 'View'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[1200px] w-full h-[85vh] flex flex-col p-6">
                      <DialogHeader>
                        <DialogTitle>
                          {language === 'fr' ? 'Aperçu du Lean Canvas' : 'Lean Canvas Preview'} - {new Date(snapshot.date).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-10 grid-rows-4 gap-3 flex-1 mt-4" style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gridTemplateRows: 'repeat(4, minmax(0, 1fr))' }}>
                        {renderSection(0, "col-span-4 row-span-1", snapshot.data[sections[0].id], true)}
                        {renderSection(6, "col-span-6 row-span-1", snapshot.data[sections[6].id], true)}
                        {renderSection(1, "col-span-4 row-span-1", snapshot.data[sections[1].id], true)}
                        {renderSection(3, "col-span-6 row-span-1", snapshot.data[sections[3].id], true)}
                        {renderSection(5, "col-span-4 row-span-1", snapshot.data[sections[5].id], true)}
                        {renderSection(2, "col-span-3 row-span-1", snapshot.data[sections[2].id], true)}
                        {renderSection(4, "col-span-3 row-span-2", snapshot.data[sections[4].id], true)}
                        {renderSection(7, "col-span-5 row-span-1", snapshot.data[sections[7].id], true)}
                        {renderSection(8, "col-span-5 row-span-1", snapshot.data[sections[8].id], true)}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-danger hover:text-danger hover:bg-danger/10"
                    onClick={() => deleteLeanCanvasSnapshot(snapshot.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {userId && (
        <PageAgent userId={userId} pageLabel="Lean Canvas" pageContext="Canvas de business model Lean." />
      )}
    </div>
  );
}
