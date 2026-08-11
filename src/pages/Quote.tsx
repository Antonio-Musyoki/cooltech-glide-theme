import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { services } from "@/data/products";
import { FileText, Send, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { quotesApi, productsApi, QuoteRequest } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";

const Quote = () => {
  const [searchParams] = useSearchParams();
  const preselectedProduct = searchParams.get("product") || "";
  const preselectedService = searchParams.get("service") || "";
  const [subject, setSubject] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service_type: "",
    details: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (preselectedService) {
      const service = services.find((s) => s.id === preselectedService);
      if (service) {
        setSubject(service.name);
        setFormData((prev) => ({
          ...prev,
          service_type: "service",
          details: prev.details || `I would like a quote for: ${service.name}.\n\n`,
        }));
      }
      return;
    }

    if (preselectedProduct) {
      productsApi.getById(preselectedProduct).then((res) => {
        if (res.data) {
          setSubject(res.data.name);
          setFormData((prev) => ({
            ...prev,
            service_type: "product",
            details: prev.details || `I would like a quote for: ${res.data!.name}.\n\nQuantity: `,
          }));
        }
      });
    }
  }, [preselectedProduct, preselectedService]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const payload: QuoteRequest = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      service_type: formData.service_type || undefined,
      message: formData.details || undefined,
    };

    const result = await quotesApi.submit(payload);
    
    if (result.success) {
      toast({
        title: "Quote Request Submitted!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        service_type: "",
        details: "",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again or contact us directly.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Request a Quotation | CoolTech Refrigeration Kenya</title>
        <meta
          name="description"
          content="Get a free quote for refrigeration equipment, cold room installation, HVAC systems, and maintenance services in Kenya."
        />
      </Helmet>
      <Layout>
        {/* Hero Banner */}
        <section className="bg-hero-gradient py-12 md:py-16">
          <div className="container">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
                <FileText className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Request a Quotation
              </h1>
            </div>
            <p className="text-primary-foreground/80 max-w-2xl">
              Fill out the form below and our team will provide you with a detailed quote within 24 hours.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-background">
          <div className="container max-w-3xl">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl">Quote Request Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
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
                      <label className="text-sm font-medium">Company Name</label>
                      <Input
                        maxLength={300}
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Your Company"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Service Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Service Type</label>
                    <Select
                      value={formData.service_type}
                      onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product Quote</SelectItem>
                        <SelectItem value="service">Service Quote</SelectItem>
                        <SelectItem value="installation">Installation</SelectItem>
                        <SelectItem value="maintenance">Maintenance Contract</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Details</label>
                    <Textarea
                      maxLength={10000}
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      placeholder="Please provide any specific requirements, dimensions, or questions you have..."
                      rows={5}
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Submit Quote Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Quote;