import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, Send, Loader2, Save, BookTemplate, Pencil } from 'lucide-react';
import { QuoteRecord, quoteTemplatesApi, QuoteTemplate } from '@/services/supabaseService';
import { generateQuotePDF, getQuotePDFBase64, QuoteFormData, QuoteLineItem } from '@/lib/generate-quote-pdf';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuoteGeneratorProps {
  quote: QuoteRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuoteGenerator({ quote, open, onOpenChange }: QuoteGeneratorProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(null);

  const [items, setItems] = useState<QuoteLineItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [validityDays, setValidityDays] = useState(30);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  const quoteNumber = `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

  useEffect(() => {
    if (open) loadTemplates();
  }, [open]);

  const loadTemplates = async () => {
    const result = await quoteTemplatesApi.getAll();
    if (result.success && result.data) setTemplates(result.data);
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    setItems(template.items.map(i => ({ ...i })));
    setValidityDays(template.validity_days);
    if (template.notes) setNotes(template.notes);
    if (template.terms) setTerms(template.terms);
    toast({ title: `Template "${template.name}" loaded` });
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({ title: 'Enter a template name', variant: 'destructive' });
      return;
    }
    const validItems = items.filter(i => i.description.trim());
    if (validItems.length === 0) {
      toast({ title: 'Add at least one line item', variant: 'destructive' });
      return;
    }

    if (editingTemplate) {
      const result = await quoteTemplatesApi.update(editingTemplate.id, {
        name: templateName.trim(),
        items: validItems,
        notes: notes || null,
        terms: terms || null,
        validity_days: validityDays,
      });
      if (result.success) {
        toast({ title: 'Template updated' });
        setEditingTemplate(null);
        setTemplateName('');
        setShowSaveTemplate(false);
        loadTemplates();
      } else {
        toast({ title: 'Failed to update template', variant: 'destructive' });
      }
    } else {
      const result = await quoteTemplatesApi.save({
        name: templateName.trim(),
        items: validItems,
        notes: notes || null,
        terms: terms || null,
        validity_days: validityDays,
      });
      if (result.success) {
        toast({ title: 'Template saved' });
        setTemplateName('');
        setShowSaveTemplate(false);
        loadTemplates();
      } else {
        toast({ title: 'Failed to save template', variant: 'destructive' });
      }
    }
  };

  const handleEditTemplate = (template: QuoteTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setItems(template.items.map(i => ({ ...i })));
    setValidityDays(template.validity_days);
    setNotes(template.notes || '');
    setTerms(template.terms || '');
    setShowSaveTemplate(true);
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"?`)) return;
    const result = await quoteTemplatesApi.delete(id);
    if (result.success) {
      toast({ title: 'Template deleted' });
      loadTemplates();
    }
  };

  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteLineItem, value: string | number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vat = subtotal * 0.16;
  const total = subtotal + vat;

  const getFormData = (): QuoteFormData => ({
    customerName: quote.name,
    customerEmail: quote.email,
    customerPhone: quote.phone || undefined,
    customerCompany: quote.company || undefined,
    quoteNumber,
    validityDays,
    items: items.filter(i => i.description.trim()),
    notes: notes || undefined,
    terms: terms || undefined,
  });

  const handleDownload = () => {
    const data = getFormData();
    if (data.items.length === 0) {
      toast({ title: 'Add at least one line item', variant: 'destructive' });
      return;
    }
    const doc = generateQuotePDF(data);
    doc.save(`Quote-${quoteNumber}-${quote.name.replace(/\s+/g, '-')}.pdf`);
    toast({ title: 'PDF downloaded' });
  };

  const handleSendEmail = async () => {
    const data = getFormData();
    if (data.items.length === 0) {
      toast({ title: 'Add at least one line item', variant: 'destructive' });
      return;
    }
    setIsSending(true);
    try {
      const pdfBase64 = getQuotePDFBase64(data);
      const response = await supabase.functions.invoke('send-quote-pdf', {
        body: {
          to: quote.email,
          customerName: quote.name,
          quoteNumber,
          pdfBase64,
          fileName: `Quote-${quoteNumber}.pdf`,
        },
      });
      if (response.error) throw response.error;
      toast({ title: 'Quote sent to ' + quote.email });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to send quote:', error);
      toast({ title: 'Failed to send email', description: error.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Quote for {quote.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Controls */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <BookTemplate className="h-4 w-4" /> Templates
              </Label>
              <div className="flex flex-wrap gap-2">
                {templates.length > 0 ? (
                  <Select onValueChange={handleLoadTemplate}>
                    <SelectTrigger className="w-full sm:w-60">
                      <SelectValue placeholder="Load a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} ({t.items.length} items)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">No saved templates yet</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowSaveTemplate(!showSaveTemplate); setEditingTemplate(null); setTemplateName(''); }}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save as Template
                </Button>
                {templates.length > 0 && (
                  <Select onValueChange={(id) => {
                    const t = templates.find(t => t.id === id);
                    if (t) handleEditTemplate(t);
                  }}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Edit template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}><Pencil className="h-3 w-3 inline mr-1" />{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {templates.length > 0 && (
                  <Select onValueChange={(id) => {
                    const t = templates.find(t => t.id === id);
                    if (t) handleDeleteTemplate(id, t.name);
                  }}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Delete template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {showSaveTemplate && (
                <div className="flex gap-2 items-center pt-2">
                  <Input
                    placeholder="Template name..."
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleSaveTemplate}>{editingTemplate ? 'Update' : 'Save'}</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowSaveTemplate(false); setEditingTemplate(null); setTemplateName(''); }}>Cancel</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer info summary */}
          <Card>
            <CardContent className="p-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span>{' '}
                <span className="font-medium">{quote.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{' '}
                <span className="font-medium">{quote.email}</span>
              </div>
              {quote.company && (
                <div>
                  <span className="text-muted-foreground">Company:</span>{' '}
                  <span className="font-medium">{quote.company}</span>
                </div>
              )}
              {quote.service_type && (
                <div>
                  <span className="text-muted-foreground">Service:</span>{' '}
                  <span className="font-medium">{quote.service_type}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validity */}
          <div className="flex items-center gap-3">
            <Label>Valid for</Label>
            <Input
              type="number"
              value={validityDays}
              onChange={(e) => setValidityDays(Number(e.target.value))}
              className="w-20"
              min={1}
            />
            <span className="text-sm text-muted-foreground">days</span>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Line Items</Label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  className="w-20"
                  min={1}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={item.unitPrice || ''}
                  onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                  className="w-28"
                  min={0}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

          {/* Totals */}
          <Card>
            <CardContent className="p-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>KES {subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (16%):</span>
                <span>KES {vat.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total:</span>
                <span>KES {total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any additional notes for the customer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Terms */}
          <div>
            <Label>Terms & Conditions (leave blank for default)</Label>
            <Textarea
              placeholder="Custom terms or leave empty for standard terms..."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
            <Button onClick={handleSendEmail} disabled={isSending}>
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send to Customer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
