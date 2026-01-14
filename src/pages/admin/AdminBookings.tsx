import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Trash2, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { bookingsApi, BookingRecord } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { services } from '@/data/products';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    const result = await bookingsApi.getAll();
    if (result.success && result.data) {
      setBookings(result.data);
    }
    setIsLoading(false);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const result = await bookingsApi.updateStatus(bookingId, newStatus);
    if (result.success) {
      toast({ title: 'Status updated' });
      loadBookings();
    } else {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
    setSelectedBooking(null);
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Delete this booking?')) return;
    
    const result = await bookingsApi.delete(bookingId);
    if (result.success) {
      toast({ title: 'Booking deleted' });
      loadBookings();
    } else {
      toast({ title: 'Failed to delete booking', variant: 'destructive' });
    }
  };

  const getServiceName = (id: string | null | undefined) => {
    if (!id) return 'Not specified';
    return services.find(s => s.id === id)?.name || id;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
            <p className="text-muted-foreground">Manage service appointments</p>
          </div>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{booking.name}</h3>
                      <Badge className={statusColors[booking.status as BookingStatus] || 'bg-gray-100 text-gray-800'}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {booking.preferred_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {booking.preferred_date}
                        </span>
                      )}
                      {booking.preferred_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {booking.preferred_time}
                        </span>
                      )}
                      {booking.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {booking.address}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-primary">
                      {getServiceName(booking.service_type)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(booking.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredBookings.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No bookings found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedBooking.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedBooking.email}`} className="font-medium text-primary">
                    {selectedBooking.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  {selectedBooking.phone ? (
                    <a href={`tel:${selectedBooking.phone}`} className="font-medium text-primary">
                      {selectedBooking.phone}
                    </a>
                  ) : (
                    <p className="font-medium">N/A</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date Submitted</p>
                  <p className="font-medium">{format(new Date(selectedBooking.created_at), 'PPp')}</p>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Preferred Date & Time</p>
                    <p className="font-medium">
                      {selectedBooking.preferred_date || 'Not specified'} 
                      {selectedBooking.preferred_time && ` at ${selectedBooking.preferred_time}`}
                    </p>
                  </div>
                </div>
                {selectedBooking.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedBooking.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Service */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Requested Service</p>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {getServiceName(selectedBooking.service_type)}
                </Badge>
              </div>

              {/* Message */}
              {selectedBooking.message && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message</p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedBooking.message}</p>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Update Status</p>
                </div>
                <Select
                  value={selectedBooking.status || 'pending'}
                  onValueChange={(value) => handleStatusChange(selectedBooking.id, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}