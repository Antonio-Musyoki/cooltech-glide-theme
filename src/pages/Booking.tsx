import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { services } from "@/data/products";
import { Calendar, Clock, Send, Loader2, CheckCircle2, MapPin, Mail, Phone, User, CalendarPlus } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { bookingsApi, BookingRequest } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Link } from "react-router-dom";

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

interface Confirmation {
  reference: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceName: string;
  date: Date;
  time: string;
  notes: string;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  service: "",
  time: "",
  notes: "",
};

const Booking = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [date, setDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const { toast } = useToast();

  // Earliest bookable day is tomorrow
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const serviceName =
    services.find((s) => s.id === formData.service)?.name ||
    (formData.service === "other" ? "Other / Not Sure" : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.service || !date || !formData.time) {
      toast({
        title: "Missing details",
        description: "Please select a service, a date and a time slot.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const payload: BookingRequest = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      service_type: serviceName || undefined,
      preferred_date: format(date, "yyyy-MM-dd"),
      preferred_time: formData.time,
      message: formData.notes || undefined,
    };

    const result = await bookingsApi.submit(payload);

    if (result.success) {
      setConfirmation({
        reference: `CT-${format(date, "yyyyMMdd")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        serviceName,
        date,
        time: formData.time,
        notes: formData.notes,
      });
      setFormData(emptyForm);
      setDate(undefined);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again or call us directly.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

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
            {confirmation ? (
              /* ---------- On-screen confirmation ---------- */
              <Card className="border-border animate-fade-up">
                <CardHeader className="items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mb-3">
                    <CheckCircle2 className="h-9 w-9 text-accent" />
                  </div>
                  <CardTitle className="text-2xl">Appointment Request Confirmed</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Thank you, {confirmation.name.split(" ")[0]}. We've received your booking and will call or email
                    you to confirm within 2 hours during business hours.
                  </p>
                  <p className="text-sm font-medium mt-3">
                    Reference: <span className="text-primary">{confirmation.reference}</span>
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-xl border border-border bg-muted/40 p-5">
                    <div className="flex items-start gap-3 pb-4 border-b border-border">
                      <CalendarPlus className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">When</p>
                        <p className="font-semibold">
                          {format(confirmation.date, "EEEE, d MMMM yyyy")} at {confirmation.time}
                        </p>
                      </div>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-sm">
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <dt className="text-muted-foreground">Service</dt>
                          <dd className="font-medium">{confirmation.serviceName}</dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <dt className="text-muted-foreground">Name</dt>
                          <dd className="font-medium">{confirmation.name}</dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <dt className="text-muted-foreground">Email</dt>
                          <dd className="font-medium break-all">{confirmation.email}</dd>
                        </div>
                      </div>
                      {confirmation.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <dt className="text-muted-foreground">Phone</dt>
                            <dd className="font-medium">{confirmation.phone}</dd>
                          </div>
                        </div>
                      )}
                      {confirmation.address && (
                        <div className="flex items-start gap-3 sm:col-span-2">
                          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <dt className="text-muted-foreground">Service address</dt>
                            <dd className="font-medium">{confirmation.address}</dd>
                          </div>
                        </div>
                      )}
                    </dl>

                    {confirmation.notes && (
                      <div className="pt-4 mt-4 border-t border-border text-sm">
                        <p className="text-muted-foreground">Notes</p>
                        <p className="font-medium whitespace-pre-line">{confirmation.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="hero"
                      size="lg"
                      className="flex-1"
                      onClick={() => setConfirmation(null)}
                    >
                      Book Another Appointment
                    </Button>
                    <Link to="/services" className="flex-1">
                      <Button variant="outline" size="lg" className="w-full">
                        Browse Our Services
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* ---------- Booking form ---------- */
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
                        <label className="text-sm font-medium">Service Address</label>
                        <Input
                          maxLength={500}
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={isLoading}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              {date ? format(date, "EEE, d MMM yyyy") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarPicker
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(d) => d < tomorrow || d.getDay() === 0}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">
                          Bookings start from tomorrow. We are closed on Sundays.
                        </p>
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
                        maxLength={10000}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Describe your issue or what service you need..."
                        rows={4}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Summary of selection */}
                    {(serviceName || date || formData.time) && (
                      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                        <p className="font-medium mb-1">Your selection</p>
                        <p className="text-muted-foreground">
                          {serviceName || "Service not selected"}
                          {" · "}
                          {date ? format(date, "EEE, d MMM yyyy") : "Date not selected"}
                          {" · "}
                          {formData.time || "Time not selected"}
                        </p>
                      </div>
                    )}

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
            )}
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Booking;
