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
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(234, 88, 51); // Primary color #EA5833
    doc.text("Modiv EventCraft", pageWidth / 2, 25, { align: "center" });

    doc.setFontSize(18); // Changed from 12
    doc.setTextColor(30, 30, 30); // Changed from 100
    doc.text("Penawaran Jasa Acara", pageWidth / 2, 33, { align: "center" }); // Translated and adjusted y-coordinate

    // Quotation Info Box
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(`ID Penawaran: ${inquiry.id.slice(0, 8).toUpperCase()}`, 14, 50); // Translated
    doc.text(`Dibuat: ${format(new Date(inquiry.created_at), "dd MMM yyyy, HH:mm")}`, 14, 56); // Translated and used inquiry.created_at

    // Customer Details Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Changed from 0
    doc.text("Informasi Pelanggan", 14, 70); // Translated

    const customerInfo = [
        ["Nama", inquiry.customer_name],
        ["Email", inquiry.email || "-"],
        ["Telepon", inquiry.phone || "-"],
        ["Tanggal Acara", inquiry.event_date ? format(new Date(inquiry.event_date), "dd MMM yyyy") : "-"],
        ["Jenis Acara", inquiry.event_type || "-"],
    ];

    autoTable(doc, {
        startY: 78,
        body: customerInfo,
        theme: "plain",
        styles: {
            fontSize: 10,
            cellPadding: 1,
            textColor: [60, 60, 60],
        },
        columnStyles: {
            0: { fontStyle: "bold", cellWidth: 30 },
            1: { cellWidth: 100 },
        },
        margin: { left: 14 },
    });

    const customerTableEndY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

    // Items Table
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Item Penawaran", 14, customerTableEndY + 10); // Translated and adjusted y-coordinate
    const itemsTableStartY = customerTableEndY + 18;

    const tableData = inquiry.items.map((item, index) => [index + 1, item.item_name, item.quantity, formatCurrency(item.price_at_time), formatCurrency(item.price_at_time * item.quantity)]);

    autoTable(doc, {
        startY: itemsTableStartY,
        head: [["#", "Item", "Jml", "Harga Satuan", "Subtotal"]], // Translated
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
    const totalTableEndY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

    doc.setFillColor(245, 245, 245);
    doc.rect(pageWidth - 80, totalTableEndY + 5, 66, 12, "F"); // Adjusted y-coordinate

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("Grand Total:", pageWidth - 78, totalTableEndY + 13); // Translated and adjusted y-coordinate

    doc.setFontSize(12);
    doc.setTextColor(234, 88, 51);
    doc.text(formatCurrency(inquiry.total), pageWidth - 14, totalTableEndY + 13, { align: "right" }); // Adjusted y-coordinate

    // Notes Section
    if (inquiry.notes) {
        const notesY = totalTableEndY + 25; // Adjusted y-coordinate
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100); // Changed from 100
        doc.text("Catatan:", 14, notesY); // Translated
        doc.setFontSize(9);
        const splitNotes = doc.splitTextToSize(inquiry.notes, pageWidth - 28); // Used pageWidth for maxWidth
        doc.text(splitNotes, 14, notesY + 6); // Adjusted y-coordinate
    }

    // Footer
    const footerY = pageHeight - 15; // Used pageHeight
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100); // Changed from 150
    const disclaimer = "Ini adalah estimasi penawaran. Harga akhir dapat berubah berdasarkan kebutuhan acara yang sebenarnya."; // Translated
    doc.text(disclaimer, pageWidth / 2, footerY, { align: "center" }); // Used pageWidth
    doc.text("© Modiv EventCraft - Layanan Produksi Acara", pageWidth / 2, footerY + 5, { align: "center" }); // Translated and used pageWidth

    // Download the PDF
    const fileName = `quotation-${inquiry.id.slice(0, 8)}-${format(new Date(), "yyyyMMdd")}.pdf`;
    doc.save(fileName);
};
