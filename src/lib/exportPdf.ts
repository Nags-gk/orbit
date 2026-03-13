/**
 * PDF Export Utility for Orbit Financial Reports.
 * 
 * Generates beautifully formatted PDF reports using jsPDF + jspdf-autotable.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReportData } from './exportCsv';

// Color palette
const COLORS = {
    primary: [99, 102, 241] as [number, number, number],      // Indigo
    dark: [15, 23, 42] as [number, number, number],            // Slate-900
    medium: [71, 85, 105] as [number, number, number],         // Slate-500
    light: [241, 245, 249] as [number, number, number],        // Slate-100
    green: [34, 197, 94] as [number, number, number],          // Green-500
    red: [239, 68, 68] as [number, number, number],            // Red-500
    white: [255, 255, 255] as [number, number, number],
};

function fmtCurrency(amount: number): string {
    return `$${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(dateStr: string): string {
    try {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

export function exportReportPDF(data: ReportData): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    const reportType = data.reportType || 'full';
    const typeLabels: Record<string, string> = {
        full: 'Full Financial Report',
        monthly: 'Monthly Spending Report',
        tax: 'Tax Summary Report',
        investment: 'Investment Portfolio Report'
    };

    // ── Header Bar ──
    doc.setFillColor(...COLORS.dark);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 35, pageWidth, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.white);
    doc.text('ORBIT', 15, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 200);
    doc.text(typeLabels[reportType] || 'Financial Report', 15, 26);
    doc.text(`${fmtDate(data.dateRange.from)} — ${fmtDate(data.dateRange.to)}`, 15, 32);

    doc.setFontSize(9);
    doc.text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, pageWidth - 15, 26, { align: 'right' });
    doc.text(data.userName || '', pageWidth - 15, 32, { align: 'right' });

    y = 48;

    // ── Summary Cards ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.dark);
    doc.text('Financial Summary', 15, y);
    y += 8;

    let cards = [];
    if (reportType === 'investment') {
        cards = [
            { label: 'Total Assets', value: fmtCurrency(data.summary.totalAssets), color: COLORS.green },
            { label: 'Liabilities', value: fmtCurrency(data.summary.totalLiabilities), color: COLORS.red },
            { label: 'Net Worth', value: fmtCurrency(data.summary.netWorth), color: COLORS.primary },
            { label: 'Accounts', value: data.accounts.length.toString(), color: COLORS.dark },
        ];
    } else if (reportType === 'tax') {
        cards = [
            { label: 'Total Expenses', value: fmtCurrency(data.summary.totalExpenses), color: COLORS.red },
            { label: 'Transactions', value: data.summary.totalTransactions.toString(), color: COLORS.dark },
            { label: 'Taxable Dist.', value: '$0.00', color: COLORS.medium },
            { label: 'Adj. Balance', value: fmtCurrency(data.summary.netBalance), color: COLORS.medium },
        ];
    } else {
        cards = [
            { label: 'Total Income', value: fmtCurrency(data.summary.totalIncome), color: COLORS.green },
            { label: 'Total Expenses', value: fmtCurrency(data.summary.totalExpenses), color: COLORS.red },
            { label: 'Net Balance', value: `${data.summary.netBalance >= 0 ? '+' : '-'}${fmtCurrency(data.summary.netBalance)}`, color: data.summary.netBalance >= 0 ? COLORS.green : COLORS.red },
            { label: 'Net Worth', value: fmtCurrency(data.summary.netWorth), color: COLORS.primary },
        ];
    }

    const cardWidth = (pageWidth - 40) / 4;
    cards.forEach((card, i) => {
        const x = 15 + i * (cardWidth + 3.33);
        doc.setFillColor(...COLORS.light);
        doc.roundedRect(x, y, cardWidth, 22, 3, 3, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.medium);
        doc.text(card.label, x + 4, y + 8);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...card.color);
        doc.text(card.value, x + 4, y + 17);
    });

    y += 30;

    // ── Category Breakdown ──
    if (data.categoryBreakdown.length > 0 && reportType !== 'investment') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...COLORS.dark);
        doc.text('Spending by Category', 15, y);
        y += 3;

        const catBody = data.categoryBreakdown.map(cat => [
            cat.category,
            fmtCurrency(cat.amount),
            `${cat.percent}%`,
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Category', 'Amount', '% of Total']],
            body: catBody,
            margin: { left: 15, right: 15 },
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            theme: 'grid',
        });

        y = (doc as any).lastAutoTable.finalY + 10;
    }

    // ── Transaction Table ──
    if (data.transactions.length > 0) {
        if (y > 220) { doc.addPage(); y = 20; }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...COLORS.dark);
        doc.text(reportType === 'tax' ? 'Expense Records' : 'Transactions List', 15, y);
        y += 3;

        const txBody = data.transactions.map(tx => [
            fmtDate(tx.date),
            tx.description.length > 40 ? tx.description.substring(0, 40) + '...' : tx.description,
            tx.type === 'income' ? `+${fmtCurrency(tx.amount)}` : `-${fmtCurrency(tx.amount)}`,
            tx.category,
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Date', 'Description', 'Amount', 'Category']],
            body: txBody,
            margin: { left: 15, right: 15 },
            styles: { fontSize: 8, cellPadding: 2.5 },
            headStyles: { fillColor: COLORS.dark, textColor: COLORS.white, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: { 0: { cellWidth: 28 }, 2: { cellWidth: 28, halign: 'right' }, 3: { cellWidth: 25 } },
            theme: 'grid',
            didParseCell: (hookData: any) => {
                if (hookData.section === 'body' && hookData.column.index === 2) {
                    const val = hookData.cell.raw as string;
                    hookData.cell.styles.textColor = val.startsWith('+') ? COLORS.green : COLORS.red;
                }
            },
        });

        y = (doc as any).lastAutoTable.finalY + 10;
    }

    // ── Account Summary ──
    if (data.accounts.length > 0 && reportType !== 'tax') {
        if (y > 230) { doc.addPage(); y = 20; }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...COLORS.dark);
        doc.text(reportType === 'investment' ? 'Portfolio Accounts' : 'Accounts Overview', 15, y);
        y += 3;

        const acctBody = data.accounts.map(acct => [
            acct.name,
            acct.type.charAt(0).toUpperCase() + acct.type.slice(1),
            acct.subtype || '—',
            fmtCurrency(acct.balance),
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Account', 'Type', 'Subtype', 'Balance']],
            body: acctBody,
            margin: { left: 15, right: 15 },
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            theme: 'grid',
        });
    }

    // ── Footer ──
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFillColor(...COLORS.dark);
        doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 170);
        doc.text('Orbit AI Financial Assistant — Confidential Report', 15, pageHeight - 5);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, pageHeight - 5, { align: 'right' });
    }

    doc.save(`orbit-${reportType}-report-${data.dateRange.from}.pdf`);
}
