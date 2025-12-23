import { Layout } from "@/components/layout/Layout";
import { Award, Target, Users, CheckCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About CoolTech Refrigeration | Kenya's Trusted Cooling Partner</title>
        <meta
          name="description"
          content="Learn about CoolTech Refrigeration, Kenya's leading provider of refrigeration equipment and HVAC services since 2008."
        />
      </Helmet>
      <Layout>
        {/* Hero Banner */}
        <section className="bg-hero-gradient py-16 md:py-24">
          <div className="container">
            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6 max-w-3xl">
              Kenya's Premier Refrigeration & HVAC Solutions Provider
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl text-lg leading-relaxed">
              For over 15 years, CoolTech Refrigeration has been delivering exceptional cooling solutions to businesses across Kenya. Our commitment to quality and customer satisfaction drives everything we do.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-12 md:py-20 bg-background">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Story</span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                  Building Trust Through Excellence
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    CoolTech Refrigeration was founded with a simple mission: to provide reliable, high-quality refrigeration and HVAC solutions to businesses in Kenya. What started as a small family operation has grown into one of the most trusted names in the industry.
                  </p>
                  <p>
                    Today, we serve hundreds of clients across Nairobi and beyond, from small restaurants to large industrial facilities. Our team of certified technicians brings decades of combined experience to every project.
                  </p>
                  <p>
                    We pride ourselves on offering not just products, but complete solutions. From initial consultation to installation, maintenance, and repairs, we're with our clients every step of the way.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Award, value: "15+", label: "Years of Excellence" },
                  { icon: Users, value: "500+", label: "Satisfied Clients" },
                  { icon: Target, value: "1000+", label: "Projects Completed" },
                  { icon: CheckCircle, value: "24/7", label: "Support Available" },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="bg-cooltech-frost rounded-2xl p-6 text-center border border-primary/5"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-12 md:py-20 bg-cooltech-frost">
          <div className="container">
            <div className="text-center mb-12">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Values</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
                What Drives Us Forward
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Quality First",
                  description: "We never compromise on quality. Every product we sell and every service we provide meets the highest industry standards.",
                },
                {
                  title: "Customer Focus",
                  description: "Your satisfaction is our priority. We listen to your needs and deliver solutions that exceed expectations.",
                },
                {
                  title: "Reliability",
                  description: "When you work with CoolTech, you can count on us. We show up on time, every time, and stand behind our work.",
                },
              ].map((value, index) => (
                <div key={index} className="bg-card rounded-2xl p-8 shadow-md border border-border/50">
                  <h3 className="text-xl font-bold text-foreground mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default About;
