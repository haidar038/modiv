export interface Category {
    id: string;
    name: string;
    iconSlug: string;
    sortOrder: number;
}

export interface Item {
    id: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    unit: string;
}

export interface EventTemplate {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    capacityLabel: string;
}

export interface TemplateItem {
    id: string;
    templateId: string;
    itemId: string;
    defaultQuantity: number;
}

export interface SelectedItem extends Item {
    quantity: number;
    isSelected: boolean;
    imageUrl?: string | null;
}

export interface Inquiry {
    id: string;
    createdAt: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    eventDate: string;
    eventLocation: string;
    totalBudgetEstimated: number;
    detailsJson: SelectedItem[];
    status: string;
}
