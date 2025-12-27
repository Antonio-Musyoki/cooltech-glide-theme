import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { services } from "@/data/products";
import { Calendar, Clock, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { bookingsApi, BookingRequest } from "@/services/apiService";
import { useApiMutation } from "@/hooks/useApi";

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const Booking = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceLocation: "" as "residential" | "commercial" | "industrial" | "",
    address: "",
    service: "",
    date: "",
    time: "",
    notes: "",
  });

  const { mutate, isLoading } = useApiMutation<BookingRequest, { id: string }>(
    bookingsApi.submit,
    {
      successMessage: "Appointment booked! We'll contact you to confirm within 2 hours.",
      errorMessage: "Failed to book appointment. Please try again or call us directly.",
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: BookingRequest = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || undefined,
      serviceLocation: formData.serviceLocation as "residential" | "commercial" | "industrial",
      address: formData.address,
      service: formData.service,
      preferredDate: formData.date,
      preferredTime: formData.time,
      description: formData.notes,
    };

    const result = await mutate(payload);
    
    if (result.success) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        serviceLocation: "",
        address: "",
        service: "",
        date: "",
        time: "",
        notes: "",
      });
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <>
      <Helmet>
        <title>Book a Service Appointment | CoolTech Kenya</title>
        <meta
          name="description"
          content="Schedule a service appointment for refrigeration repairs, cold room maintenance, or HVAC installation in Nairobi, Kenya."
        />
      </Helmet>
      <Layout>
        {/* Hero Banner */}
        <section className="bg-hero-gradient py-12 md:py-16">
          <div className="container">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
                <Calendar className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Book an Appointment
              </h1>
            </div>
            <p className="text-primary-foreground/80 max-w-2xl">
              Schedule a service visit with our certified technicians. Select your preferred date and time.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-background">
          <div className="container max-w-3xl">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl">Service Appointment Form</CardTitle>
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number *</label>
                      <Input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+254 7XX XXX XXX"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company Name</label>
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Your Company (optional)"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Location Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location Type *</label>
                      <Select
                        value={formData.serviceLocation}
                        onValueChange={(value) => setFormData({ ...formData, serviceLocation: value as any })}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Service Address *</label>
                      <Input
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Your address in Nairobi"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Service Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Service *</label>
                    <Select
                      value={formData.service}
                      onValueChange={(value) => setFormData({ ...formData, service: value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose the service you need" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">Other / Not Sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Preferred Date *
                      </label>
                      <Input
                        type="date"
                        required
                        min={minDate}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Preferred Time *
                      </label>
                      <Select
                        value={formData.time}
                        onValueChange={(value) => setFormData({ ...formData, time: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Notes</label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Describe your issue or what service you need..."
                      rows={4}
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Book Appointment
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    Our team will contact you to confirm the appointment within 2 hours during business hours.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Booking;
