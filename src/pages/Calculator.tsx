import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import CategorySection from "@/components/CategorySection";
import SummaryPanel from "@/components/SummaryPanel";
import MobileSummaryBar from "@/components/MobileSummaryBar";
import CheckoutModal from "@/components/CheckoutModal";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCalculator } from "@/hooks/use-calculator";
import { useCategories } from "@/hooks/use-categories";
import { useItems } from "@/hooks/use-items";
import { useTemplates } from "@/hooks/use-templates";
import { useState } from "react";

const Calculator = () => {
    const { selectedItems, selectedTemplateId, toggleItem, updateQuantity, resetCalculator, getTotal, getSelectedItemsList, setItems } = useCalculator();

    const { categories, isLoading: categoriesLoading } = useCategories();
    const { items, isLoading: itemsLoading, getItemsByCategory } = useItems();
    const { templates } = useTemplates();

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
    const selectedItemsList = getSelectedItemsList();
    const total = getTotal();

    // Set items in calculator context when loaded
    useEffect(() => {
        if (items.length > 0) {
            setItems(items);
        }
    }, [items, setItems]);

    const isLoading = categoriesLoading || itemsLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-8">
            <Header />

            <main className="container py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">Event Calculator</h1>
                    <p className="mt-2 text-muted-foreground">{selectedTemplate ? `Starting from "${selectedTemplate.name}" template` : "Select items and quantities to build your event budget"}</p>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Left Panel - Inventory */}
                    <div className="flex-1 space-y-6">
                        {categories.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No categories available.</p>
                            </div>
                        ) : (
                            categories
                                .sort((a, b) => a.display_order - b.display_order)
                                .map((category) => (
                                    <CategorySection
                                        key={category.id}
                                        category={{
                                            id: category.id,
                                            name: category.name,
                                            iconSlug: "package",
                                            sortOrder: category.display_order,
                                        }}
                                        items={getItemsByCategory(category.id).map((item) => ({
                                            id: item.id,
                                            categoryId: item.category_id,
                                            name: item.name,
                                            description: "",
                                            price: item.price,
                                            unit: item.unit,
                                        }))}
                                        selectedItems={selectedItems}
                                        onToggle={toggleItem}
                                        onUpdateQuantity={updateQuantity}
                                    />
                                ))
                        )}
                    </div>

                    {/* Right Panel - Summary (Desktop) */}
                    <div className="hidden lg:block lg:w-96">
                        <div className="sticky top-24">
                            <SummaryPanel selectedItems={selectedItemsList} total={total} onRequestQuote={() => setIsCheckoutOpen(true)} onReset={resetCalculator} />
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Summary Bar */}
            <MobileSummaryBar total={total} itemCount={selectedItemsList.length} onOpenDetails={() => setIsMobileSheetOpen(true)} />

            {/* Mobile Summary Sheet */}
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
                    <SheetHeader className="mb-4">
                        <SheetTitle>Your Selection</SheetTitle>
                    </SheetHeader>
                    <SummaryPanel
                        selectedItems={selectedItemsList}
                        total={total}
                        onRequestQuote={() => {
                            setIsMobileSheetOpen(false);
                            setIsCheckoutOpen(true);
                        }}
                        onReset={() => {
                            resetCalculator();
                            setIsMobileSheetOpen(false);
                        }}
                    />
                </SheetContent>
            </Sheet>

            {/* Checkout Modal */}
            <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} selectedItems={selectedItemsList} total={total} />
        </div>
    );
};

export default Calculator;
