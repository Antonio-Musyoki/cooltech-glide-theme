import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Trash2, Mail, Phone, MapPin, Calendar, Clock } from 'lucide-react';
import { adminBookingsApi, BookingRecord } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { services } from '@/data/products';

const statusColors: Record<BookingRecord['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Mock data for demo
const mockBookings: BookingRecord[] = [
  {
    id: 1,
    name: 'Peter Otieno',
    email: 'peter@example.com',
    phone: '+254734567890',
    company: 'Westlands Mall',
    serviceLocation: 'commercial',
    address: 'Westlands Rd, Nairobi',
    service: 'cold-room',
    preferredDate: '2024-01-15',
    preferredTime: '10:00 AM',
    description: 'Cold room not maintaining temperature. Need urgent repair.',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Grace Njeri',
    email: 'grace@home.co.ke',
    phone: '+254745678901',
    company: '',
    serviceLocation: 'residential',
    address: 'Karen, Nairobi',
    service: 'ac',
    preferredDate: '2024-01-16',
    preferredTime: '02:00 PM',
    description: 'AC making noise and not cooling properly.',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingRecord[]>(mockBookings);
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
    const result = await adminBookingsApi.getAll();
    if (result.success && result.data) {
      setBookings(result.data);
    }
    setIsLoading(false);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (bookingId: number, newStatus: BookingRecord['status']) => {
    const result = await adminBookingsApi.updateStatus(bookingId.toString(), newStatus);
    if (result.success) {
      toast({ title: 'Status updated' });
      loadBookings();
    } else {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      toast({ title: 'Status updated (demo mode)' });
    }
    setSelectedBooking(null);
  };

  const handleDelete = async (bookingId: number) => {
    if (!confirm('Delete this booking?')) return;
    
    const result = await adminBookingsApi.delete(bookingId.toString());
    if (result.success) {
      toast({ title: 'Booking deleted' });
      loadBookings();
    } else {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      toast({ title: 'Booking deleted (demo mode)' });
    }
  };

  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || id;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground">Manage service appointments</p>
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
                      <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
                      <Badge variant="outline">{booking.serviceLocation}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {booking.preferredDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {booking.preferredTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {booking.address}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-primary">
                      {getServiceName(booking.service)}
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
            <DialogTitle>Booking #{selectedBooking?.id}</DialogTitle>
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
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{selectedBooking.company || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedBooking.email}`} className="font-medium text-primary">
                    {selectedBooking.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href={`tel:${selectedBooking.phone}`} className="font-medium text-primary">
                    {selectedBooking.phone}
                  </a>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Preferred Date & Time</p>
                    <p className="font-medium">{selectedBooking.preferredDate} at {selectedBooking.preferredTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location ({selectedBooking.serviceLocation})</p>
                    <p className="font-medium">{selectedBooking.address}</p>
                  </div>
                </div>
              </div>

              {/* Service */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Requested Service</p>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {getServiceName(selectedBooking.service)}
                </Badge>
              </div>

              {/* Description */}
              {selectedBooking.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedBooking.description}</p>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Update Status</p>
                </div>
                <Select
                  value={selectedBooking.status}
                  onValueChange={(value) => handleStatusChange(selectedBooking.id, value as BookingRecord['status'])}
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
