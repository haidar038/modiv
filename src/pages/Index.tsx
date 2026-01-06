import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Calculator, Clock, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import TemplateCard from "@/components/TemplateCard";
import { useTemplates, useTemplateItems } from "@/hooks/use-templates";
import { useItems } from "@/hooks/use-items";
import { useCalculator } from "@/hooks/use-calculator";

const features = [
    {
        icon: Calculator,
        title: "Kalkulasi Anggaran Instan",
        description: "Dapatkan estimasi biaya secara real-time saat Anda menyesuaikan kebutuhan acara",
    },
    {
        icon: Clock,
        title: "Cepat & Mudah",
        description: "Tidak perlu registrasi. Rencanakan anggaran acara Anda dalam hitungan menit",
    },
    {
        icon: Shield,
        title: "Harga Transparan",
        description: "Rincian harga yang jelas tanpa biaya tersembunyi atau kejutan",
    },
];

const Index = () => {
    const navigate = useNavigate();
    const { loadTemplate, setItems } = useCalculator();
    const { templates, isLoading: templatesLoading } = useTemplates();
    const { items, isLoading: itemsLoading } = useItems();
    const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
    const { templateItems } = useTemplateItems(pendingTemplateId);

    // Set items in calculator context when loaded
    useEffect(() => {
        if (items.length > 0) {
            setItems(items);
        }
    }, [items, setItems]);

    // Handle template loading when template items are fetched
    useEffect(() => {
        if (pendingTemplateId && templateItems.length > 0 && items.length > 0) {
            loadTemplate(pendingTemplateId, templateItems);
            setPendingTemplateId(null);
            navigate("/calculator");
        }
    }, [pendingTemplateId, templateItems, items, loadTemplate, navigate]);

    const handleSelectTemplate = (templateId: string) => {
        setPendingTemplateId(templateId);
    };

    const handleStartFromScratch = () => {
        navigate("/calculator");
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="relative overflow-hidden gradient-hero">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                </div>

                <div className="container relative py-20 lg:py-32">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                            <Sparkles className="h-4 w-4" />
                            Produksi Acara Jadi Mudah
                        </div>

                        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            Rencanakan Anggaran Acara Anda <span className="text-primary">dalam Hitungan Menit</span>
                        </h1>

                        <p className="mb-10 text-lg text-muted-foreground sm:text-xl">Pilih peralatan, sesuaikan jumlah, dan dapatkan harga instan untuk seminar, pernikahan, atau konser Anda. Tidak perlu registrasi.</p>

                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            <Button size="lg" className="w-full shadow-button sm:w-auto" onClick={handleStartFromScratch}>
                                Mulai Hitung
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}>
                                Lihat Template
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 lg:py-20">
                <div className="container">
                    <div className="grid gap-8 md:grid-cols-3">
                        {features.map((feature, index) => (
                            <div key={feature.title} className="flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-foreground">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Templates Section */}
            <section id="templates" className="py-16 lg:py-20 bg-muted/30">
                <div className="container">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-extrabold text-foreground sm:text-4xl">Pilih Skala Acara Anda</h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground">Mulai dengan template yang sudah dikonfigurasi dan sesuaikan dengan kebutuhan Anda, atau buat dari awal.</p>
                    </div>

                    {templatesLoading || itemsLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">Belum ada template tersedia.</p>
                            <Button onClick={handleStartFromScratch}>
                                Mulai dari Awal
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {templates.map((template, index) => (
                                <TemplateCard
                                    key={template.id}
                                    template={{
                                        id: template.id,
                                        name: template.name,
                                        description: template.description || "",
                                        imageUrl: template.image_url || "",
                                        capacityLabel: "",
                                    }}
                                    onSelect={handleSelectTemplate}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-28">
                <div className="container">
                    <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-br from-primary to-orange-glow p-8 text-center text-primary-foreground shadow-xl sm:p-12">
                        <h2 className="mb-4 text-2xl font-extrabold sm:text-3xl">Siap Merencanakan Acara Anda?</h2>
                        <p className="mb-8 opacity-90">Mulai sekarang dan dapatkan penawaran detail dalam 24 jam.</p>
                        <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" onClick={handleStartFromScratch}>
                            Mulai Hitung Anggaran
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-card py-8">
                <div className="container text-center">
                    <p className="text-sm text-muted-foreground">© 2025 Modiv EventCraft. Layanan Produksi Acara Profesional.</p>
                </div>
            </footer>
        </div>
    );
};

export default Index;
