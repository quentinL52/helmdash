'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Download, Trash2, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';

export function DataPrivacyPanel() {
  const t = useTranslations('settings');
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importType, setImportType] = useState('finances');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/account/export', {
        method: 'GET',
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `helmdash-export-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast({
        title: t('exportSuccess'),
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible d'exporter les données.",
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Deletion failed');
      
      toast({
        title: t('deleteSuccess'),
        variant: 'default',
      });
      
      // Redirect to login or home
      router.push('/auth');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer le compte.",
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', importType);

    try {
      const response = await fetch('/api/account/import/csv', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Import failed');
      }
      
      const data = await response.json();
      toast({
        title: 'Import réussi',
        description: `${data.count} enregistrements ont été importés avec succès.`,
        variant: 'default',
      });
      
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || "Impossible d'importer les données.",
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = ''; // Reset file input
    }
  };

  return (
    <Card className="border-t-4 border-t-red-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-pixel text-red-500">
          <ShieldAlert className="w-5 h-5" />
          {t('dataPrivacy')}
        </CardTitle>
        <CardDescription>
          {t('dataPrivacyDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Export complet</h4>
            <p className="text-xs text-muted-foreground">Téléchargez une copie de toutes vos données au format ZIP (fichiers JSON).</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleExport} 
            disabled={isExporting}
            className="shrink-0 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exportation...' : t('exportData')}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Import CSV</h4>
            <p className="text-xs text-muted-foreground">Importez vos finances, contacts ou décisions depuis un fichier CSV.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select 
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="finances">Finances</option>
              <option value="contacts">Contacts</option>
              <option value="decisions">Décisions</option>
            </select>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button 
                variant="outline" 
                disabled={isImporting}
                className="shrink-0 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {isImporting ? 'Import...' : 'Importer'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="space-y-1">
            <h4 className="font-medium text-sm text-red-600 dark:text-red-400">Zone dangereuse</h4>
            <p className="text-xs text-red-600/80 dark:text-red-400/80">Supprimez définitivement votre compte et vos données.</p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="shrink-0 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                {t('deleteAccount')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('deleteAccountConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('deleteAccountConfirmDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Suppression...' : 'Oui, supprimer mon compte'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
