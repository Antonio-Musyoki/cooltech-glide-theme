import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { services } from "@/data/products";
import { Snowflake, Thermometer, Wind, Fan, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Snowflake,
  Thermometer,
  Wind,
  Fan,
};

const Services = () => {
  return (
    <>
      <Helmet>
        <title>Refrigeration & HVAC Services | CoolTech Kenya</title>
        <meta
          name="description"
          content="Expert cold room installation, refrigeration repairs, HVAC maintenance, and air conditioning services in Nairobi, Kenya."
        />
      </Helmet>
      <Layout>
        {/* Hero Banner */}
        <section className="bg-hero-gradient py-12 md:py-20">
          <div className="container">
            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
              Our Services
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl text-lg">
              Professional refrigeration and HVAC solutions for residential and commercial clients across Kenya.
            </p>
          </div>
        </section>

        {/* Services List */}
        <section className="py-12 md:py-20 bg-background">
          <div className="container">
            <div className="space-y-12">
              {services.map((service, index) => {
                const IconComponent = iconMap[service.icon] || Snowflake;
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={service.id}
                    id={service.id}
                    className={`grid lg:grid-cols-2 gap-8 items-center ${!isEven ? "lg:flex-row-reverse" : ""}`}
                  >
                    <Card variant="frost" className={`p-8 ${!isEven ? "lg:order-2" : ""}`}>
                      <div className="flex items-start gap-5">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                            {service.name}
                          </h2>
                          <p className="text-muted-foreground mb-6 leading-relaxed">
                            {service.description}
                          </p>
                          <ul className="space-y-3 mb-8">
                            {service.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                                <span className="text-foreground/80">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                            <Link to="/booking">
                              <Button variant="default" size="lg" className="w-full sm:w-auto">
                                Book This Service
                              </Button>
                            </Link>
                            <Link to="/quote">
                              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                Get a Quote
                                <ArrowRight className="h-5 w-5 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <div className={`hidden lg:block ${!isEven ? "lg:order-1" : ""}`}>
                      <div className="aspect-square bg-cooltech-frost rounded-3xl flex items-center justify-center">
                        <IconComponent className="h-32 w-32 text-primary/30" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-cooltech-frost">
          <div className="container text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Need Emergency Repairs?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Our technicians are available 24/7 for urgent refrigeration and HVAC issues. Call us now!
            </p>
            <a href="tel:+254707154948">
              <Button variant="hero" size="xl">
                Call +254 707 154 948
              </Button>
            </a>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Services;
