"use client";

import { useState } from 'react';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { LEAN_CANVAS_SECTIONS, type LeanCanvasSectionId, COLORS } from '@/lib/constants';
import { CanvasSection } from './components/canvas-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFounderStore } from '@/store/founder-store';
import { translations } from '@/lib/translations';
import { Download, Save, Trash2, Eye } from 'lucide-react';
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
  const canvasData = useFounderStore(s => s.leanCanvas || {});
  const updateCanvasSection = useFounderStore(s => s.updateCanvasSection);
  const leanCanvasSnapshots = useFounderStore(s => s.leanCanvasSnapshots || []);
  const saveLeanCanvasSnapshot = useFounderStore(s => s.saveLeanCanvasSnapshot);
  const deleteLeanCanvasSnapshot = useFounderStore(s => s.deleteLeanCanvasSnapshot);

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
        html2canvas:  { scale: 2, useCORS: true, windowWidth: 1200 },
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

      <div
        id="lean-canvas-export-area"
        className={`mt-8 grid flex-1 gap-6 ${isExporting ? 'bg-background p-4' : 'grid-cols-1 grid-rows-9 md:grid-cols-2 md:grid-rows-5 lg:grid-cols-10 lg:grid-rows-4'}`}
        style={isExporting ? { width: '1122px', height: '750px', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gridTemplateRows: 'repeat(4, minmax(0, 1fr))', gap: '8px' } : undefined}
      >
        {renderSection(0, isExporting ? "col-span-4 row-span-1" : "lg:col-span-4 md:col-span-1 h-full")}
        {renderSection(6, isExporting ? "col-span-6 row-span-1" : "lg:col-span-6 md:col-span-1 h-full")}
        {renderSection(1, isExporting ? "col-span-4 row-span-1" : "lg:col-span-4 md:col-span-1 h-full")}
        {renderSection(3, isExporting ? "col-span-6 row-span-1" : "lg:col-span-6 md:col-span-1 h-full")}
        {renderSection(5, isExporting ? "col-span-4 row-span-1" : "lg:col-span-4 md:col-span-1 h-full")}
        {renderSection(2, isExporting ? "col-span-3 row-span-1" : "lg:col-span-3 md:col-span-1 h-full")}
        {renderSection(4, isExporting ? "col-span-3 row-span-2" : "lg:col-span-3 md:col-span-2 h-full")}
        {renderSection(7, isExporting ? "col-span-5 row-span-1" : "lg:col-span-5 md:col-span-1 h-full")}
        {renderSection(8, isExporting ? "col-span-5 row-span-1" : "lg:col-span-5 md:col-span-1 h-full")}
      </div>

      <div className="mt-12 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">{language === 'fr' ? 'Historique des versions' : 'Version History'}</h2>
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
                    className="h-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
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
    </div>
  );
}
