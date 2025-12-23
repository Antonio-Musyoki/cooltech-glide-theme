import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-16 md:py-24 bg-hero-gradient relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border-2 border-primary-foreground rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-primary-foreground rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-primary-foreground rounded-full" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Cool Your Business?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 leading-relaxed">
            Get expert advice on the best refrigeration solution for your needs. Our team is ready to help you find the perfect equipment or service.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/quote">
              <Button
                size="xl"
                className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90 group"
              >
                <FileText className="h-5 w-5 mr-2" />
                Get Free Quotation
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="tel:+254707154948">
              <Button
                variant="outline"
                size="xl"
                className="w-full sm:w-auto border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call +254 707 154 948
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
