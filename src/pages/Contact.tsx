import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { contactsApi, ContactRequest } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const payload: ContactRequest = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      subject: formData.subject || undefined,
      message: formData.message,
    };

    const result = await contactsApi.submit(payload);
    
    if (result.success) {
      toast({
        title: "Message Sent!",
        description: "We'll respond within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or contact us directly.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+254 707 154 948", "+254 719 110 722"],
      action: "tel:+254707154948",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@cooltechrefrigeration.co.ke"],
      action: "mailto:info@cooltechrefrigeration.co.ke",
    },
    {
      icon: MapPin,
      title: "Address",
      details: ["PO BOX 317 – 00610", "Nairobi, Kenya"],
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Fri: 8:00 AM - 6:00 PM", "Sat: 9:00 AM - 2:00 PM"],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us | CoolTech Refrigeration Kenya</title>
        <meta
          name="description"
          content="Get in touch with CoolTech Refrigeration in Nairobi. Contact us for refrigeration equipment, cold room services, and HVAC solutions."
        />
      </Helmet>
      <Layout>
        {/* Hero Banner */}
        <section className="bg-hero-gradient py-12 md:py-16">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl">
              Have questions about our products or services? We're here to help. Reach out to our team today.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-background">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Info Cards */}
              <div className="lg:col-span-1 space-y-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <Card key={index} variant="frost" className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-muted-foreground text-sm">
                              {info.action ? (
                                <a href={info.action} className="hover:text-primary transition-colors">
                                  {detail}
                                </a>
                              ) : (
                                detail
                              )}
                            </p>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Full Name *</label>
                          <Input
                            required
                            maxLength={200}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email Address *</label>
                          <Input
                            type="email"
                            required
                            maxLength={254}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Phone Number</label>
                          <Input
                            type="tel"
                            maxLength={50}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+254 7XX XXX XXX"
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Subject *</label>
                          <Input
                            required
                            maxLength={300}
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="How can we help?"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Message *</label>
                        <Textarea
                          required
                          maxLength={10000}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Tell us more about your inquiry..."
                          rows={5}
                          disabled={isLoading}
                        />
                      </div>

                      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Contact;