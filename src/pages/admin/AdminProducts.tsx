import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Search, Upload, Loader2, X } from 'lucide-react';
import { products as staticProducts, categories, formatPrice, Product } from '@/data/products';
import { adminProductsApi, ProductRecord } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    price: '',
    description: '',
    image: '',
    isQuoteOnly: false,
    tags: '',
  });

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openNewProductDialog();
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const result = await adminProductsApi.getAll();
    if (result.success && result.data) {
      setProducts(result.data.map(p => ({
        ...p,
        isQuoteOnly: p.isQuoteOnly,
        price: p.price ?? undefined,
      })));
    }
    // Fallback to static products if API fails
    setIsLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openNewProductDialog = () => {
    setEditingProduct(null);
    setFormData({
      id: '',
      name: '',
      category: '',
      price: '',
      description: '',
      image: '',
      isQuoteOnly: false,
      tags: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price?.toString() || '',
      description: product.description,
      image: product.image,
      isQuoteOnly: product.isQuoteOnly || false,
      tags: product.tags.join(', '),
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    const productData: Partial<ProductRecord> = {
      id: formData.id || formData.name.toLowerCase().replace(/\s+/g, '-'),
      name: formData.name,
      category: formData.category,
      price: formData.isQuoteOnly ? null : parseFloat(formData.price) || null,
      description: formData.description,
      image: formData.image,
      isQuoteOnly: formData.isQuoteOnly,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (editingProduct) {
      const result = await adminProductsApi.update(editingProduct.id, productData);
      if (result.success) {
        toast({ title: 'Success', description: 'Product updated successfully' });
        loadProducts();
      } else {
        // Update local state for demo
        setProducts(prev => prev.map(p => 
          p.id === editingProduct.id 
            ? { ...productData, price: productData.price ?? undefined } as Product 
            : p
        ));
        toast({ title: 'Success', description: 'Product updated (demo mode)' });
      }
    } else {
      const result = await adminProductsApi.create(productData);
      if (result.success) {
        toast({ title: 'Success', description: 'Product created successfully' });
        loadProducts();
      } else {
        // Add to local state for demo
        setProducts(prev => [...prev, { ...productData, price: productData.price ?? undefined } as Product]);
        toast({ title: 'Success', description: 'Product created (demo mode)' });
      }
    }

    setIsSaving(false);
    setIsDialogOpen(false);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const result = await adminProductsApi.delete(productId);
    if (result.success) {
      toast({ title: 'Success', description: 'Product deleted' });
      loadProducts();
    } else {
      // Remove from local state for demo
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({ title: 'Success', description: 'Product deleted (demo mode)' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For demo, create object URL
    const imageUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, image: imageUrl }));

    // Try actual upload
    const result = await adminProductsApi.uploadImage(file);
    if (result.success && result.data?.url) {
      setFormData(prev => ({ ...prev, image: result.data.url }));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button onClick={openNewProductDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video relative bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
                {product.isQuoteOnly && (
                  <Badge className="absolute top-2 right-2">Quote Only</Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                <p className="text-lg font-bold text-primary mb-3">
                  {product.price ? formatPrice(product.price) : 'Request Quote'}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(product)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No products found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Image</label>
              <div className="flex items-center gap-4">
                {formData.image ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={formData.image}
                      alt="Product"
                      className="object-cover w-full h-full"
                    />
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
                <div className="flex-1">
                  <Input
                    placeholder="Or paste image URL..."
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Ice Block Machine 500kg"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quote Only Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Quote Only</p>
                <p className="text-sm text-muted-foreground">Product requires a quote instead of fixed price</p>
              </div>
              <Switch
                checked={formData.isQuoteOnly}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isQuoteOnly: checked }))}
              />
            </div>

            {/* Price */}
            {!formData.isQuoteOnly && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (KES)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g. 285000"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Product description..."
                rows={4}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">SEO Tags</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g. Ice Makers Kenya, Cold Storage"
              />
              <p className="text-xs text-muted-foreground">Comma-separated tags for SEO</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
