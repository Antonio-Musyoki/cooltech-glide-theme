import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Save, Loader2 } from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    siteName: 'CoolTech Refrigeration',
    email: 'info@cooltechrefrigeration.co.ke',
    phone1: '+254 707 154 948',
    phone2: '+254 719 110 722',
    address: 'PO BOX 317 – 00610, Nairobi, Kenya',
    whatsapp: '+254707154948',
    businessHours: 'Mon - Fri: 8:00 AM - 6:00 PM\nSat: 9:00 AM - 2:00 PM',
    metaDescription: 'Leading supplier of refrigeration equipment, cold rooms, and HVAC systems in Kenya. Quality products and professional services.',
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: 'Settings saved', description: 'Your changes have been saved successfully.' });
    setIsSaving(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your site settings</p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic site information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Site Name</label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Description (SEO)</label>
              <Textarea
                value={settings.metaDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Business contact details shown on the website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">WhatsApp Number</label>
                <Input
                  value={settings.whatsapp}
                  onChange={(e) => setSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="+254XXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number 1</label>
                <Input
                  value={settings.phone1}
                  onChange={(e) => setSettings(prev => ({ ...prev, phone1: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number 2</label>
                <Input
                  value={settings.phone2}
                  onChange={(e) => setSettings(prev => ({ ...prev, phone2: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Address</label>
              <Input
                value={settings.address}
                onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Hours</label>
              <Textarea
                value={settings.businessHours}
                onChange={(e) => setSettings(prev => ({ ...prev, businessHours: e.target.value }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Useful resources and links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/"
              target="_blank"
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="font-medium">View Website</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href="/admin/products"
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="font-medium">Manage Products</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
