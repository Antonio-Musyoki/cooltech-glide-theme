import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Trash2, Mail, Phone, MessageSquare } from 'lucide-react';
import { adminContactsApi, ContactRecord } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const statusColors: Record<ContactRecord['status'], string> = {
  unread: 'bg-red-100 text-red-800',
  read: 'bg-blue-100 text-blue-800',
  replied: 'bg-green-100 text-green-800',
};

// Mock data for demo
const mockContacts: ContactRecord[] = [
  {
    id: 1,
    name: 'Michael Kamau',
    email: 'michael@gmail.com',
    phone: '+254756789012',
    subject: 'Product Inquiry',
    message: 'Hi, I would like to know more about your ice cream trolleys. Do you have different sizes available?',
    status: 'unread',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Jane Achieng',
    email: 'jane@company.co.ke',
    phone: '+254767890123',
    subject: 'Service Availability',
    message: 'Do you offer services in Mombasa? We have a cold room that needs maintenance.',
    status: 'read',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function AdminContacts() {
  const [contacts, setContacts] = useState<ContactRecord[]>(mockContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoading(true);
    const result = await adminContactsApi.getAll();
    if (result.success && result.data) {
      setContacts(result.data);
    }
    setIsLoading(false);
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (contactId: number, newStatus: ContactRecord['status']) => {
    const result = await adminContactsApi.updateStatus(contactId.toString(), newStatus);
    if (result.success) {
      toast({ title: 'Status updated' });
      loadContacts();
    } else {
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, status: newStatus } : c));
      toast({ title: 'Status updated (demo mode)' });
    }
  };

  const handleDelete = async (contactId: number) => {
    if (!confirm('Delete this message?')) return;
    
    const result = await adminContactsApi.delete(contactId.toString());
    if (result.success) {
      toast({ title: 'Message deleted' });
      loadContacts();
    } else {
      setContacts(prev => prev.filter(c => c.id !== contactId));
      toast({ title: 'Message deleted (demo mode)' });
    }
  };

  const handleView = (contact: ContactRecord) => {
    setSelectedContact(contact);
    if (contact.status === 'unread') {
      handleStatusChange(contact.id, 'read');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contact Messages</h1>
          <p className="text-muted-foreground">Manage customer inquiries</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or subject..."
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
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <div className="space-y-3">
          {filteredContacts.map((contact) => (
            <Card 
              key={contact.id} 
              className={`overflow-hidden ${contact.status === 'unread' ? 'border-l-4 border-l-primary' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{contact.name}</h3>
                      <Badge className={statusColors[contact.status]}>{contact.status}</Badge>
                    </div>
                    <p className="font-medium text-foreground">{contact.subject}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {contact.email}
                      </span>
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {contact.message}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(contact)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredContacts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No messages found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Contact Detail Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message from {selectedContact?.name}</DialogTitle>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-6">
              {/* Sender Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(selectedContact.createdAt), 'PPp')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedContact.email}`} className="font-medium text-primary">
                    {selectedContact.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  {selectedContact.phone ? (
                    <a href={`tel:${selectedContact.phone}`} className="font-medium text-primary">
                      {selectedContact.phone}
                    </a>
                  ) : (
                    <p className="font-medium">N/A</p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <p className="font-semibold text-lg">{selectedContact.subject}</p>
              </div>

              {/* Message */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = `mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </Button>
                  {selectedContact.phone && (
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = `tel:${selectedContact.phone}`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  )}
                </div>
                <Select
                  value={selectedContact.status}
                  onValueChange={(value) => {
                    handleStatusChange(selectedContact.id, value as ContactRecord['status']);
                    setSelectedContact(prev => prev ? { ...prev, status: value as ContactRecord['status'] } : null);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
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
