import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { products, services } from "@/data/products";
import { FileText, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Quote = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectedProduct = searchParams.get("product") || "";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    requestType: "",
    product: preselectedProduct,
    service: "",
    quantity: "",
    details: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Quotation Request Submitted!",
      description: "We'll get back to you within 24 hours with a detailed quote.",
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      requestType: "",
      product: "",
      service: "",
      quantity: "",
      details: "",
    });
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
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address *</label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number *</label>
                      <Input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+254 7XX XXX XXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company Name</label>
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Your Company"
                      />
                    </div>
                  </div>

                  {/* Request Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Request Type *</label>
                    <Select
                      value={formData.requestType}
                      onValueChange={(value) => setFormData({ ...formData, requestType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product Quote</SelectItem>
                        <SelectItem value="service">Service Quote</SelectItem>
                        <SelectItem value="both">Both Product & Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Product Selection */}
                  {(formData.requestType === "product" || formData.requestType === "both") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Product</label>
                        <Select
                          value={formData.product}
                          onValueChange={(value) => setFormData({ ...formData, product: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Quantity</label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          placeholder="1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Service Selection */}
                  {(formData.requestType === "service" || formData.requestType === "both") && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Service</label>
                      <Select
                        value={formData.service}
                        onValueChange={(value) => setFormData({ ...formData, service: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Additional Details */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Details</label>
                    <Textarea
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      placeholder="Please provide any specific requirements, dimensions, or questions you have..."
                      rows={5}
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    <Send className="h-5 w-5 mr-2" />
                    Submit Quote Request
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
