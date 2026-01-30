import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HelpCircle, Phone, Mail } from "lucide-react";

const faqCategories = [
  {
    title: "Products & Equipment",
    faqs: [
      {
        question: "What types of refrigeration equipment do you sell?",
        answer: "We offer a wide range of refrigeration equipment including ice block machines, popsicle machines, ice cream equipment, cold rooms, display coolers, milk ATMs, and industrial freezers. All our products are sourced from reputable manufacturers and come with warranties."
      },
      {
        question: "Do you provide warranties on your products?",
        answer: "Yes, all our products come with manufacturer warranties ranging from 1-3 years depending on the equipment type. We also offer extended warranty options for additional peace of mind."
      },
      {
        question: "Can I get a custom cold room built for my business?",
        answer: "Absolutely! We specialize in custom cold room design and assembly. Our team will assess your space, storage requirements, and budget to create a tailored solution that meets your specific needs."
      },
      {
        question: "Do you offer financing options for equipment purchases?",
        answer: "Yes, we work with several financing partners to offer flexible payment plans for larger equipment purchases. Contact our sales team to discuss available options for your specific purchase."
      }
    ]
  },
  {
    title: "Services & Maintenance",
    faqs: [
      {
        question: "What areas do you serve in Kenya?",
        answer: "We primarily serve Nairobi and its surrounding areas. However, we can arrange services for clients in other parts of Kenya for larger projects. Contact us to discuss your location and requirements."
      },
      {
        question: "How often should I service my AC unit?",
        answer: "We recommend servicing your AC unit at least twice a year – ideally before the hot and cold seasons. Regular maintenance helps maintain efficiency, extends equipment life, and prevents costly breakdowns."
      },
      {
        question: "Do you offer emergency repair services?",
        answer: "Yes, we offer 24/7 emergency repair services for critical refrigeration and HVAC equipment. For emergencies, call us directly at +254 707 154 948 and we'll dispatch a technician as soon as possible."
      },
      {
        question: "What is included in a routine maintenance service?",
        answer: "Our routine maintenance includes cleaning filters and coils, checking refrigerant levels, inspecting electrical connections, testing thermostat calibration, lubricating moving parts, and a comprehensive system performance check."
      }
    ]
  },
  {
    title: "Quotes & Booking",
    faqs: [
      {
        question: "How do I get a quote for my project?",
        answer: "You can request a quote through our online quote form, by calling us directly, or by visiting our office. For accurate quotes, please provide details about your requirements, including space dimensions for cold rooms or equipment specifications."
      },
      {
        question: "How long does it take to receive a quote?",
        answer: "For standard products and services, we typically provide quotes within 24-48 hours. Complex projects requiring site visits may take 3-5 business days for a comprehensive proposal."
      },
      {
        question: "Can I book a service appointment online?",
        answer: "Yes! You can book service appointments through our online booking system. Simply select your preferred date and time, and our team will confirm your appointment within 24 hours."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept cash, M-Pesa, bank transfers, and major credit/debit cards. For large projects, we can arrange milestone-based payments to suit your budget."
      }
    ]
  },
  {
    title: "Technical Support",
    faqs: [
      {
        question: "My refrigerator is not cooling properly. What could be wrong?",
        answer: "Several factors can affect cooling: dirty condenser coils, low refrigerant levels, faulty compressor, or thermostat issues. We recommend scheduling a diagnostic appointment so our technicians can identify and fix the exact problem."
      },
      {
        question: "How can I improve my AC's energy efficiency?",
        answer: "Regular maintenance, clean filters, proper insulation, sealing air leaks, using programmable thermostats, and ensuring correct unit sizing all contribute to better energy efficiency. Our team can conduct an energy audit to provide personalized recommendations."
      },
      {
        question: "What size cold room do I need for my business?",
        answer: "Cold room sizing depends on your storage volume, product types, door opening frequency, and ambient conditions. Our experts can help calculate the optimal size based on your specific requirements during a consultation."
      },
      {
        question: "Do you provide training on equipment operation?",
        answer: "Yes, we provide comprehensive training for all major equipment purchases. This includes proper operation, basic troubleshooting, and maintenance tips to help you get the most out of your investment."
      }
    ]
  }
];

const FAQ = () => {
  return (
    <Layout>
      <Helmet>
        <title>FAQ - CoolTech Refrigeration & AC | Common Questions</title>
        <meta name="description" content="Find answers to frequently asked questions about refrigeration equipment, HVAC services, cold room installation, and maintenance in Kenya." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-16 md:py-24">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <HelpCircle className="h-5 w-5" />
            <span className="font-medium">Help Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our products, services, and support. 
            Can't find what you're looking for? Contact us directly.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12 last:mb-0">
              <h2 className="text-2xl font-bold mb-6 text-primary">
                {category.title}
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    value={`${categoryIndex}-${faqIndex}`}
                    className="border border-border/50 rounded-xl px-6 bg-card shadow-sm"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <Card className="max-w-3xl mx-auto border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Still Have Questions?</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground">
                Our team is here to help. Reach out to us for personalized assistance with your refrigeration and HVAC needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Us
                  </Button>
                </Link>
                <a href="tel:+254707154948">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Phone className="h-5 w-5" />
                    Call Now
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
