'use client';

import { useState } from 'react';

export function QuickNoteForm({ userId }: { userId: string }) {
  const [content, setContent] = useState('');
  const [type, setType] = useState('insight');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || saving) return;

    setSaving(true);
    try {
      const res = await fetch('/api/memory/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type, tags: [], links: [] }),
      });

      if (res.ok) {
        setContent('');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <h3 className="font-medium mb-3">Nouvelle note</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écris une idée, une décision, un apprentissage..."
          rows={4}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="insight">💡 Insight</option>
          <option value="decision">⚡ Décision</option>
          <option value="journal">📝 Journal</option>
          <option value="research">🔬 Recherche</option>
          <option value="meeting">🤝 Réunion</option>
          <option value="template">📋 Template</option>
        </select>
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : saved ? '✓ Sauvegardée' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
}