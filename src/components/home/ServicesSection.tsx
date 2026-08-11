import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { services } from "@/data/products";
import { Snowflake, Thermometer, Wind, Fan, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Snowflake,
  Thermometer,
  Wind,
  Fan,
};

export const ServicesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-cooltech-frost">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Services</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Expert Refrigeration & HVAC Services
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From installation to maintenance, our certified technicians deliver reliable solutions for all your cooling needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Snowflake;
            
            return (
              <Card
                key={service.id}
                variant="service"
                className="group animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <IconComponent className="h-7 w-7 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">{service.name}</CardTitle>
                    <p className="text-muted-foreground text-sm">{service.description}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3">
                    <Link to="/booking" className="flex-1">
                      <Button variant="default" className="w-full">
                        Book Service
                      </Button>
                    </Link>
                    <Link to={`/quote?service=${service.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Request Quote
                      </Button>
                    </Link>
                    <Link to={`/services#${service.id}`}>
                      <Button variant="ghost" size="icon">
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Need a custom solution? Get in touch with our team.</p>
          <Link to="/quote">
            <Button variant="quote" size="lg">
              Request a Free Quotation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
