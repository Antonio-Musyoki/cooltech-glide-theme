import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Search, Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { categories, formatPrice } from '@/data/products';
import { optimizeImage, formatBytes } from '@/lib/image-optimization';
import { productsApi, Product } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    full_description: '',
    image_url: '',
    images: [] as string[],
    features: [] as string[],
    in_stock: true,
    featured: false,
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newFeature, setNewFeature] = useState('');

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
    const result = await productsApi.getAll();
    if (result.success && result.data) {
      setProducts(result.data);
    }
    setIsLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openNewProductDialog = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      full_description: '',
      image_url: '',
      images: [],
      features: [],
      in_stock: true,
      featured: false,
    });
    setNewImageUrl('');
    setNewFeature('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category || '',
      price: product.price?.toString() || '',
      description: product.description || '',
      full_description: product.full_description || '',
      image_url: product.image_url || '',
      images: product.images || [],
      features: product.features || [],
      in_stock: product.in_stock ?? true,
      featured: product.featured ?? false,
    });
    setNewImageUrl('');
    setNewFeature('');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    const productData: Partial<Product> = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      description: formData.description || null,
      full_description: formData.full_description || null,
      image_url: formData.image_url || null,
      images: formData.images.length > 0 ? formData.images : null,
      features: formData.features.length > 0 ? formData.features : null,
      in_stock: formData.in_stock,
      featured: formData.featured,
    };

    if (editingProduct) {
      const result = await productsApi.update(editingProduct.id, productData);
      if (result.success) {
        toast({ title: 'Success', description: 'Product updated successfully' });
        loadProducts();
      } else {
        toast({ title: 'Error', description: 'Failed to update product', variant: 'destructive' });
      }
    } else {
      const result = await productsApi.create(productData);
      if (result.success) {
        toast({ title: 'Success', description: 'Product created successfully' });
        loadProducts();
      } else {
        toast({ title: 'Error', description: 'Failed to create product', variant: 'destructive' });
      }
    }

    setIsSaving(false);
    setIsDialogOpen(false);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const result = await productsApi.delete(productId);
    if (result.success) {
      toast({ title: 'Success', description: 'Product deleted' });
      loadProducts();
    } else {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please choose an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum size is 10MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const { optimized, originalSize, optimizedSize } = await optimizeImage(file);
      const result = await productsApi.uploadImage(optimized);
      if (result.success && result.data?.url) {
        if (isGallery) {
          setFormData(prev => ({ ...prev, images: [...prev.images, result.data!.url] }));
        } else {
          setFormData(prev => ({ ...prev, image_url: result.data!.url }));
        }
        toast({
          title: 'Image uploaded',
          description: `${formatBytes(originalSize)} → ${formatBytes(optimizedSize)}`,
        });
      } else {
        toast({ title: 'Failed to upload image', description: result.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({
        title: 'Failed to upload image',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };


  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                  {product.featured && (
                    <Badge className="absolute top-2 right-2">Featured</Badge>
                  )}
                  {!product.in_stock && (
                    <Badge variant="destructive" className="absolute top-2 left-2">Out of Stock</Badge>
                  )}
                  {product.images && product.images.length > 0 && (
                    <Badge variant="secondary" className="absolute bottom-2 right-2">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      {product.images.length + 1}
                    </Badge>
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
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No products found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 py-4">
              {/* Main Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Main Product Image</label>
                <div className="flex items-center gap-4">
                  {formData.image_url ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={formData.image_url}
                        alt="Product"
                        className="object-cover w-full h-full"
                      />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary">
                      {isUploading ? (
                        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                      ) : (
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground mt-1">
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => handleImageUpload(e, false)}
                      />

                    </label>
                  )}
                  <div className="flex-1">
                    <Input
                      placeholder="Or paste image URL..."
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
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

              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (KES)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g. 285000"
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, in_stock: checked }))}
                  />
                  <label className="text-sm font-medium">In Stock</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <label className="text-sm font-medium">Featured</label>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief product description for listings..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Image Gallery</label>
                <p className="text-xs text-muted-foreground">Add additional images for the product gallery</p>
                
                {/* Gallery Images Grid */}
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={img} alt={`Gallery ${index + 1}`} className="object-cover w-full h-full" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Upload Button */}
                  <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary">
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground mt-1">
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => handleImageUpload(e, true)}
                    />

                  </label>
                </div>

                {/* Add by URL */}
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Or paste image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                  />
                  <Button type="button" variant="outline" onClick={addImageUrl}>
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 py-4">
              {/* Full Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Description</label>
                <Textarea
                  value={formData.full_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_description: e.target.value }))}
                  placeholder="Detailed product description for the product page..."
                  rows={6}
                />
              </div>

              {/* Features */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Features</label>
                <p className="text-xs text-muted-foreground">Add key features or selling points</p>
                
                {/* Features List */}
                <div className="space-y-2 mt-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                      <span className="flex-1 text-sm">{feature}</span>
                      <button
                        onClick={() => removeFeature(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Feature */}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a feature..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" variant="outline" onClick={addFeature}>
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

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