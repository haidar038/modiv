import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./formatCurrency";
import { format } from "date-fns";

interface InquiryItem {
    item_name: string;
    quantity: number;
    price_at_time: number;
}

interface InquiryData {
    id: string;
    customer_name: string;
    email?: string | null;
    phone?: string | null;
    event_date?: string | null;
    event_type?: string | null;
    notes?: string | null;
    total: number;
    created_at: string;
    items: InquiryItem[];
}

export const generateQuotationPdf = (inquiry: InquiryData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(234, 88, 51); // Primary color #EA5833
    doc.text("Modiv EventCraft", pageWidth / 2, 25, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Event Services Quotation", pageWidth / 2, 33, { align: "center" });

    // Quotation Info Box
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(`Quotation ID: ${inquiry.id.slice(0, 8).toUpperCase()}`, 14, 50);
    doc.text(`Generated: ${format(new Date(), "dd MMM yyyy, HH:mm")}`, 14, 56);

    // Customer Details Section
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Customer Information", 14, 70);

    doc.setFontSize(10);
    doc.setTextColor(60);
    let yPos = 78;

    doc.text(`Name: ${inquiry.customer_name}`, 14, yPos);
    yPos += 6;

    if (inquiry.email) {
        doc.text(`Email: ${inquiry.email}`, 14, yPos);
        yPos += 6;
    }

    if (inquiry.phone) {
        doc.text(`Phone: ${inquiry.phone}`, 14, yPos);
        yPos += 6;
    }

    if (inquiry.event_date) {
        doc.text(`Event Date: ${format(new Date(inquiry.event_date), "dd MMM yyyy")}`, 14, yPos);
        yPos += 6;
    }

    if (inquiry.event_type) {
        doc.text(`Event Type: ${inquiry.event_type}`, 14, yPos);
        yPos += 6;
    }

    yPos += 8;

    // Items Table
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Quotation Items", 14, yPos);
    yPos += 8;

    const tableData = inquiry.items.map((item, index) => [index + 1, item.item_name, item.quantity, formatCurrency(item.price_at_time), formatCurrency(item.price_at_time * item.quantity)]);

    autoTable(doc, {
        startY: yPos,
        head: [["#", "Item", "Qty", "Unit Price", "Subtotal"]],
        body: tableData,
        theme: "striped",
        headStyles: {
            fillColor: [234, 88, 51],
            textColor: [255, 255, 255],
            fontStyle: "bold",
        },
        columnStyles: {
            0: { halign: "center", cellWidth: 15 },
            1: { cellWidth: 70 },
            2: { halign: "center", cellWidth: 20 },
            3: { halign: "right", cellWidth: 35 },
            4: { halign: "right", cellWidth: 40 },
        },
        styles: {
            fontSize: 9,
            cellPadding: 4,
        },
    });

    // Grand Total
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    doc.setFillColor(245, 245, 245);
    doc.rect(pageWidth - 80, finalY, 66, 12, "F");

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("Grand Total:", pageWidth - 78, finalY + 8);

    doc.setFontSize(12);
    doc.setTextColor(234, 88, 51);
    doc.text(formatCurrency(inquiry.total), pageWidth - 14, finalY + 8, { align: "right" });

    // Notes Section
    if (inquiry.notes) {
        const notesY = finalY + 25;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Notes:", 14, notesY);
        doc.setFontSize(9);
        doc.text(inquiry.notes, 14, notesY + 6, { maxWidth: pageWidth - 28 });
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("This is a quotation estimate. Final prices may vary based on actual event requirements.", pageWidth / 2, footerY, { align: "center" });
    doc.text("© Modiv EventCraft - Event Services Marketplace", pageWidth / 2, footerY + 5, { align: "center" });

    // Download the PDF
    const fileName = `quotation-${inquiry.id.slice(0, 8)}-${format(new Date(), "yyyyMMdd")}.pdf`;
    doc.save(fileName);
};
