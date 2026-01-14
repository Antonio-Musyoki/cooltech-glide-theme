import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Trash2, Mail, Phone, Building, Loader2 } from 'lucide-react';
import { quotesApi, QuoteRecord } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type QuoteStatus = 'pending' | 'contacted' | 'quoted' | 'closed';

const statusColors: Record<QuoteStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  contacted: 'bg-blue-100 text-blue-800',
  quoted: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setIsLoading(true);
    const result = await quotesApi.getAll();
    if (result.success && result.data) {
      setQuotes(result.data);
    }
    setIsLoading(false);
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch = 
      quote.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (quoteId: string, newStatus: string) => {
    const result = await quotesApi.updateStatus(quoteId, newStatus);
    if (result.success) {
      toast({ title: 'Status updated' });
      loadQuotes();
    } else {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
    setSelectedQuote(null);
  };

  const handleDelete = async (quoteId: string) => {
    if (!confirm('Delete this quote request?')) return;
    
    const result = await quotesApi.delete(quoteId);
    if (result.success) {
      toast({ title: 'Quote deleted' });
      loadQuotes();
    } else {
      toast({ title: 'Failed to delete quote', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quote Requests</h1>
            <p className="text-muted-foreground">Manage customer quotation requests</p>
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
                  placeholder="Search by name, email, or company..."
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
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quotes List */}
        <div className="space-y-3">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{quote.name}</h3>
                      <Badge className={statusColors[quote.status as QuoteStatus] || 'bg-gray-100 text-gray-800'}>
                        {quote.status}
                      </Badge>
                      {quote.service_type && (
                        <Badge variant="outline">{quote.service_type}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {quote.email}
                      </span>
                      {quote.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {quote.phone}
                        </span>
                      )}
                      {quote.company && (
                        <span className="flex items-center gap-1">
                          <Building className="h-3.5 w-3.5" />
                          {quote.company}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(quote.created_at), 'PPp')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuote(quote)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(quote.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredQuotes.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No quotes found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quote Detail Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quote Request Details</DialogTitle>
          </DialogHeader>

          {selectedQuote && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedQuote.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{selectedQuote.company || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedQuote.email}`} className="font-medium text-primary">
                    {selectedQuote.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  {selectedQuote.phone ? (
                    <a href={`tel:${selectedQuote.phone}`} className="font-medium text-primary">
                      {selectedQuote.phone}
                    </a>
                  ) : (
                    <p className="font-medium">N/A</p>
                  )}
                </div>
              </div>

              {/* Service Type */}
              {selectedQuote.service_type && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Service Type</p>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {selectedQuote.service_type}
                  </Badge>
                </div>
              )}

              {/* Message */}
              {selectedQuote.message && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message</p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedQuote.message}</p>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Update Status</p>
                </div>
                <Select
                  value={selectedQuote.status || 'pending'}
                  onValueChange={(value) => handleStatusChange(selectedQuote.id, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
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