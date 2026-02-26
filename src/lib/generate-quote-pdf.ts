import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface QuoteLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuoteFormData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCompany?: string;
  quoteNumber: string;
  validityDays: number;
  items: QuoteLineItem[];
  notes?: string;
  terms?: string;
}

const DEFAULT_TERMS = `1. This quotation is valid for the period specified above.
2. Prices are in Kenya Shillings (KES) and inclusive of VAT unless stated otherwise.
3. Payment terms: 50% deposit upon acceptance, balance on completion.
4. Delivery/installation timelines will be confirmed upon order placement.
5. Warranty terms apply as per manufacturer specifications.`;

export function generateQuotePDF(data: QuoteFormData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Header - Company branding
  doc.setFillColor(0, 119, 182); // CoolTech primary blue
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CoolTech Kenya', margin, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Refrigeration & HVAC Solutions', margin, 30);
  doc.text('Tel: +254 707 154 948  |  Email: info@cooltechrefrigeration.co.ke', margin, 37);

  // Quote title
  doc.setTextColor(0, 119, 182);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', pageWidth - margin, 60, { align: 'right' });

  // Quote info box
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  
  const infoY = 55;
  doc.setFont('helvetica', 'bold');
  doc.text('Quote #:', margin, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.quoteNumber, margin + 30, infoY);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', margin, infoY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }), margin + 30, infoY + 7);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Valid Until:', margin, infoY + 14);
  doc.setFont('helvetica', 'normal');
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + data.validityDays);
  doc.text(validUntil.toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }), margin + 30, infoY + 14);

  // Customer details
  const custY = 85;
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(margin, custY - 5, pageWidth - margin * 2, 30, 3, 3, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 119, 182);
  doc.text('Bill To:', margin + 5, custY + 3);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(data.customerName, margin + 5, custY + 10);
  const custDetails = [data.customerCompany, data.customerEmail, data.customerPhone].filter(Boolean).join('  |  ');
  doc.text(custDetails, margin + 5, custY + 17);

  // Line items table
  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vat = subtotal * 0.16;
  const total = subtotal + vat;

  autoTable(doc, {
    startY: custY + 35,
    head: [['#', 'Description', 'Qty', 'Unit Price (KES)', 'Total (KES)']],
    body: data.items.map((item, i) => [
      (i + 1).toString(),
      item.description,
      item.quantity.toString(),
      item.unitPrice.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
      (item.quantity * item.unitPrice).toLocaleString('en-KE', { minimumFractionDigits: 2 }),
    ]),
    foot: [
      ['', '', '', 'Subtotal:', subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })],
      ['', '', '', 'VAT (16%):', vat.toLocaleString('en-KE', { minimumFractionDigits: 2 })],
      ['', '', '', 'TOTAL:', total.toLocaleString('en-KE', { minimumFractionDigits: 2 })],
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 119, 182], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [245, 245, 245], textColor: [30, 30, 30], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 40, halign: 'right' },
      4: { cellWidth: 40, halign: 'right' },
    },
  });

  // Notes
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  if (data.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 119, 182);
    doc.text('Notes:', margin, finalY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(data.notes, pageWidth - margin * 2);
    doc.text(noteLines, margin, finalY + 7);
  }

  // Terms
  const termsY = data.notes 
    ? finalY + 7 + doc.splitTextToSize(data.notes, pageWidth - margin * 2).length * 5 + 10
    : finalY;
    
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 119, 182);
  doc.text('Terms & Conditions:', margin, termsY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  const terms = data.terms || DEFAULT_TERMS;
  const termLines = doc.splitTextToSize(terms, pageWidth - margin * 2);
  doc.text(termLines, margin, termsY + 7);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(0, 119, 182);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('CoolTech Kenya  |  www.cooltechrefrigeration.co.ke  |  +254 707 154 948', pageWidth / 2, footerY, { align: 'center' });

  return doc;
}

export function getQuotePDFBase64(data: QuoteFormData): string {
  const doc = generateQuotePDF(data);
  return doc.output('datauristring').split(',')[1];
}
