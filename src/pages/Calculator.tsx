import { useState, useEffect } from "react";
import Header from "@/components/Header";
import CategorySection from "@/components/CategorySection";
import SummaryPanel from "@/components/SummaryPanel";
import MobileSummaryBar from "@/components/MobileSummaryBar";
import CheckoutModal from "@/components/CheckoutModal";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCalculator } from "@/contexts/CalculatorContext";
import { categories, items, eventTemplates } from "@/lib/mockData";

const Calculator = () => {
  const {
    selectedItems,
    selectedTemplateId,
    toggleItem,
    updateQuantity,
    resetCalculator,
    getTotal,
    getSelectedItemsList,
  } = useCalculator();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const selectedTemplate = eventTemplates.find((t) => t.id === selectedTemplateId);
  const selectedItemsList = getSelectedItemsList();
  const total = getTotal();

  // Initialize all items when no template is loaded
  useEffect(() => {
    if (selectedItems.size === 0) {
      items.forEach((item) => {
        // Just visiting the page initializes nothing - items stay unselected
      });
    }
  }, []);

  const getItemsByCategory = (categoryId: string) => {
    return items.filter((item) => item.categoryId === categoryId);
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <Header />

      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            Event Calculator
          </h1>
          <p className="mt-2 text-muted-foreground">
            {selectedTemplate
              ? `Starting from "${selectedTemplate.name}" template`
              : "Select items and quantities to build your event budget"}
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Panel - Inventory */}
          <div className="flex-1 space-y-6">
            {categories
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((category) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  items={getItemsByCategory(category.id)}
                  selectedItems={selectedItems}
                  onToggle={toggleItem}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
          </div>

          {/* Right Panel - Summary (Desktop) */}
          <div className="hidden lg:block lg:w-96">
            <div className="sticky top-24">
              <SummaryPanel
                selectedItems={selectedItemsList}
                total={total}
                onRequestQuote={() => setIsCheckoutOpen(true)}
                onReset={resetCalculator}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Summary Bar */}
      <MobileSummaryBar
        total={total}
        itemCount={selectedItemsList.length}
        onOpenDetails={() => setIsMobileSheetOpen(true)}
      />

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
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedItems={selectedItemsList}
        total={total}
      />
    </div>
  );
};

export default Calculator;
