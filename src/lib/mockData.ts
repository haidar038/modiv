import { Category, Item, EventTemplate, TemplateItem } from "./types";

export const categories: Category[] = [
  { id: "cat-1", name: "Sound System", iconSlug: "volume-2", sortOrder: 1 },
  { id: "cat-2", name: "Lighting & Effects", iconSlug: "lightbulb", sortOrder: 2 },
  { id: "cat-3", name: "Stage & Rigging", iconSlug: "layout", sortOrder: 3 },
  { id: "cat-4", name: "Visual Multimedia", iconSlug: "monitor", sortOrder: 4 },
  { id: "cat-5", name: "Manpower & Team", iconSlug: "users", sortOrder: 5 },
];

export const items: Item[] = [
  // Sound System
  { id: "item-1", categoryId: "cat-1", name: "Portable Sound System", description: "Compact 500W system for small events", price: 1500000, unit: "per day" },
  { id: "item-2", categoryId: "cat-1", name: "Sound System 5000 Watt", description: "Professional mid-range PA system", price: 5000000, unit: "per day" },
  { id: "item-3", categoryId: "cat-1", name: "Line Array Speaker System", description: "Premium concert-grade line array setup", price: 15000000, unit: "per day" },
  { id: "item-4", categoryId: "cat-1", name: "Wireless Microphone", description: "Shure-style handheld wireless mic", price: 350000, unit: "per unit" },
  { id: "item-5", categoryId: "cat-1", name: "Band Gear Set", description: "Complete backline for live bands", price: 3500000, unit: "per day" },
  { id: "item-6", categoryId: "cat-1", name: "Digital Mixer Console", description: "32-channel digital mixing board", price: 2500000, unit: "per day" },
  
  // Lighting & Effects
  { id: "item-7", categoryId: "cat-2", name: "PAR LED Set (8 units)", description: "RGBW LED wash lights", price: 2000000, unit: "per set" },
  { id: "item-8", categoryId: "cat-2", name: "Moving Head Beam", description: "Sharpy-style beam effects", price: 1500000, unit: "per unit" },
  { id: "item-9", categoryId: "cat-2", name: "LED Wall Washer", description: "Linear LED for stage backdrop", price: 800000, unit: "per unit" },
  { id: "item-10", categoryId: "cat-2", name: "Smoke Machine", description: "1500W haze/fog machine", price: 500000, unit: "per unit" },
  { id: "item-11", categoryId: "cat-2", name: "Lighting Controller", description: "DMX console with programmer", price: 1500000, unit: "per day" },
  { id: "item-12", categoryId: "cat-2", name: "Follow Spot", description: "Professional follow spotlight", price: 1200000, unit: "per unit" },
  
  // Stage & Rigging
  { id: "item-13", categoryId: "cat-3", name: "Stage 4x3m", description: "Modular stage platform - compact", price: 3000000, unit: "per day" },
  { id: "item-14", categoryId: "cat-3", name: "Stage 6x4m", description: "Modular stage platform - medium", price: 5000000, unit: "per day" },
  { id: "item-15", categoryId: "cat-3", name: "Stage 12x10m", description: "Full concert stage with rigging", price: 25000000, unit: "per day" },
  { id: "item-16", categoryId: "cat-3", name: "Stage Roofing", description: "Weather-proof canopy system", price: 8000000, unit: "per day" },
  { id: "item-17", categoryId: "cat-3", name: "Crowd Barricade", description: "Heavy-duty safety barriers (per 10m)", price: 1500000, unit: "per 10m" },
  { id: "item-18", categoryId: "cat-3", name: "Backdrop Truss", description: "Aluminum truss for backdrops", price: 2000000, unit: "per set" },
  
  // Visual Multimedia
  { id: "item-19", categoryId: "cat-4", name: "Projector 3000 Lumens", description: "Standard presentation projector", price: 750000, unit: "per day" },
  { id: "item-20", categoryId: "cat-4", name: "Projector 5000 Lumens", description: "High-brightness venue projector", price: 1500000, unit: "per day" },
  { id: "item-21", categoryId: "cat-4", name: "LED Videotron 4x6m", description: "Outdoor LED video wall P4", price: 18000000, unit: "per day" },
  { id: "item-22", categoryId: "cat-4", name: "TV Plasma 55\"", description: "Display screen for signage", price: 800000, unit: "per unit" },
  { id: "item-23", categoryId: "cat-4", name: "Projection Screen 4x3m", description: "Fast-fold projection screen", price: 1000000, unit: "per day" },
  
  // Manpower & Team
  { id: "item-24", categoryId: "cat-5", name: "Sound Engineer", description: "Professional audio operator", price: 1500000, unit: "per day" },
  { id: "item-25", categoryId: "cat-5", name: "Lighting Designer", description: "Lighting programming & operation", price: 1500000, unit: "per day" },
  { id: "item-26", categoryId: "cat-5", name: "VJ / Visual Jockey", description: "Live visual content operator", price: 1200000, unit: "per day" },
  { id: "item-27", categoryId: "cat-5", name: "Show Director", description: "Overall production management", price: 2500000, unit: "per day" },
  { id: "item-28", categoryId: "cat-5", name: "Stage Manager", description: "On-stage coordination", price: 1200000, unit: "per day" },
  { id: "item-29", categoryId: "cat-5", name: "Liaison Officer (LO)", description: "Artist/talent coordination", price: 800000, unit: "per person" },
  { id: "item-30", categoryId: "cat-5", name: "Runner / Crew", description: "General event crew support", price: 400000, unit: "per person" },
  { id: "item-31", categoryId: "cat-5", name: "Security / Bouncer", description: "Event security personnel", price: 500000, unit: "per person" },
];

export const eventTemplates: EventTemplate[] = [
  {
    id: "template-1",
    name: "Intimate Gathering",
    description: "Perfect for seminars, workshops, and small corporate meetings",
    imageUrl: "",
    capacityLabel: "< 100 Pax",
  },
  {
    id: "template-2",
    name: "Medium Event",
    description: "Ideal for weddings, product launches, and community gatherings",
    imageUrl: "",
    capacityLabel: "100-500 Pax",
  },
  {
    id: "template-3",
    name: "Grand Production",
    description: "Full-scale concerts, festivals, and major corporate events",
    imageUrl: "",
    capacityLabel: "500+ Pax",
  },
];

export const templateItems: TemplateItem[] = [
  // Intimate Gathering (Small)
  { id: "ti-1", templateId: "template-1", itemId: "item-1", defaultQuantity: 1 },
  { id: "ti-2", templateId: "template-1", itemId: "item-4", defaultQuantity: 2 },
  { id: "ti-3", templateId: "template-1", itemId: "item-19", defaultQuantity: 1 },
  { id: "ti-4", templateId: "template-1", itemId: "item-23", defaultQuantity: 1 },
  { id: "ti-5", templateId: "template-1", itemId: "item-24", defaultQuantity: 1 },
  
  // Medium Event
  { id: "ti-6", templateId: "template-2", itemId: "item-2", defaultQuantity: 1 },
  { id: "ti-7", templateId: "template-2", itemId: "item-5", defaultQuantity: 1 },
  { id: "ti-8", templateId: "template-2", itemId: "item-6", defaultQuantity: 1 },
  { id: "ti-9", templateId: "template-2", itemId: "item-7", defaultQuantity: 1 },
  { id: "ti-10", templateId: "template-2", itemId: "item-14", defaultQuantity: 1 },
  { id: "ti-11", templateId: "template-2", itemId: "item-24", defaultQuantity: 1 },
  { id: "ti-12", templateId: "template-2", itemId: "item-28", defaultQuantity: 1 },
  
  // Grand Production (Large)
  { id: "ti-13", templateId: "template-3", itemId: "item-3", defaultQuantity: 1 },
  { id: "ti-14", templateId: "template-3", itemId: "item-6", defaultQuantity: 1 },
  { id: "ti-15", templateId: "template-3", itemId: "item-8", defaultQuantity: 4 },
  { id: "ti-16", templateId: "template-3", itemId: "item-11", defaultQuantity: 1 },
  { id: "ti-17", templateId: "template-3", itemId: "item-15", defaultQuantity: 1 },
  { id: "ti-18", templateId: "template-3", itemId: "item-16", defaultQuantity: 1 },
  { id: "ti-19", templateId: "template-3", itemId: "item-17", defaultQuantity: 3 },
  { id: "ti-20", templateId: "template-3", itemId: "item-21", defaultQuantity: 1 },
  { id: "ti-21", templateId: "template-3", itemId: "item-24", defaultQuantity: 1 },
  { id: "ti-22", templateId: "template-3", itemId: "item-25", defaultQuantity: 1 },
  { id: "ti-23", templateId: "template-3", itemId: "item-27", defaultQuantity: 1 },
  { id: "ti-24", templateId: "template-3", itemId: "item-28", defaultQuantity: 1 },
  { id: "ti-25", templateId: "template-3", itemId: "item-30", defaultQuantity: 10 },
  { id: "ti-26", templateId: "template-3", itemId: "item-31", defaultQuantity: 5 },
];
