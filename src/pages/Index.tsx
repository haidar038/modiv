import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Calculator, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import TemplateCard from "@/components/TemplateCard";
import { eventTemplates } from "@/lib/mockData";
import { useCalculator } from "@/contexts/CalculatorContext";

const features = [
  {
    icon: Calculator,
    title: "Instant Budget Calculation",
    description: "Get real-time cost estimates as you customize your event requirements",
  },
  {
    icon: Clock,
    title: "Quick & Easy",
    description: "No registration needed. Plan your event budget in just minutes",
  },
  {
    icon: Shield,
    title: "Transparent Pricing",
    description: "Clear itemized pricing with no hidden fees or surprises",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { loadTemplate } = useCalculator();

  const handleSelectTemplate = (templateId: string) => {
    loadTemplate(templateId);
    navigate("/calculator");
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
              Event Production Made Simple
            </div>

            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Plan Your Event Budget{" "}
              <span className="text-primary">in Minutes</span>
            </h1>

            <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
              Select equipment, customize quantities, and get instant pricing for your
              next seminar, wedding, or concert. No registration required.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="w-full shadow-button sm:w-auto"
                onClick={handleStartFromScratch}
              >
                Start Calculating
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}
              >
                Browse Templates
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
              <div
                key={feature.title}
                className="flex flex-col items-center text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-16 lg:py-20 bg-muted/30">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-foreground sm:text-4xl">
              Choose Your Event Scale
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Start with a pre-configured template and customize it to match your exact
              needs, or build from scratch.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventTemplates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleSelectTemplate}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-br from-primary to-orange-glow p-8 text-center text-primary-foreground shadow-xl sm:p-12">
            <h2 className="mb-4 text-2xl font-extrabold sm:text-3xl">
              Ready to Plan Your Event?
            </h2>
            <p className="mb-8 opacity-90">
              Get started now and receive a detailed quote within 24 hours.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              onClick={handleStartFromScratch}
            >
              Start Your Budget Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Modiv EventCraft. Professional Event Production Services.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
