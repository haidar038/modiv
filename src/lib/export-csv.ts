/**
 * CSV Export Utility
 * Converts data arrays to CSV format and triggers download
 */

interface ExportColumn<T> {
    key: keyof T | string;
    header: string;
    formatter?: (value: unknown, row: T) => string;
}

export function exportToCSV<T>(data: T[], columns: ExportColumn<T>[], filename: string): void {
    if (data.length === 0) {
        console.warn("No data to export");
        return;
    }

    // Generate header row
    const headers = columns.map((col) => `"${col.header}"`).join(",");

    // Generate data rows
    const rows = data.map((row) => {
        return columns
            .map((col) => {
                const value = getNestedValue(row as Record<string, unknown>, col.key as string);
                const formatted = col.formatter ? col.formatter(value, row) : String(value ?? "");
                // Escape quotes and wrap in quotes
                return `"${formatted.replace(/"/g, '""')}"`;
            })
            .join(",");
    });

    // Combine and create blob
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });

    // Create download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${formatDateForFilename(new Date())}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce((acc: unknown, part: string) => {
        if (acc && typeof acc === "object") {
            return (acc as Record<string, unknown>)[part];
        }
        return undefined;
    }, obj);
}

function formatDateForFilename(date: Date): string {
    return date.toISOString().split("T")[0].replace(/-/g, "");
}

/**
 * Export inquiries to CSV
 */
export interface InquiryExportData {
    id: string;
    customer_name: string;
    email: string | null;
    phone: string | null;
    event_date: string | null;
    total: number;
    status: string;
    created_at: string;
}

export function exportInquiriesToCSV(inquiries: InquiryExportData[]): void {
    const columns: ExportColumn<InquiryExportData>[] = [
        { key: "id", header: "Inquiry ID", formatter: (v) => String(v).slice(0, 8).toUpperCase() },
        { key: "customer_name", header: "Customer Name" },
        { key: "email", header: "Email" },
        { key: "phone", header: "Phone" },
        { key: "event_date", header: "Event Date" },
        { key: "total", header: "Total (IDR)", formatter: (v) => Number(v).toLocaleString("id-ID") },
        { key: "status", header: "Status" },
        { key: "created_at", header: "Created At", formatter: (v) => new Date(String(v)).toLocaleString("id-ID") },
    ];

    exportToCSV(inquiries, columns, "modiv_inquiries");
}
