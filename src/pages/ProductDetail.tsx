import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/data/products";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Check, 
  ArrowLeft,
  Truck,
  Shield,
  Phone,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { productsApi, Product } from "@/services/supabaseService";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setLoading(true);
      
      const response = await productsApi.getById(id);
      if (response.data) {
        setProduct(response.data);
        
        // Load related products
        const allProducts = await productsApi.getAll();
        if (allProducts.data) {
          const related = allProducts.data
            .filter(p => p.id !== id && p.category === response.data?.category)
            .slice(0, 4);
          setRelatedProducts(related.length > 0 ? related : allProducts.data.filter(p => p.id !== id).slice(0, 4));
        }
      }
      setLoading(false);
    };
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading product...</span>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const images = product.images && product.images.length > 0 
    ? [product.image_url, ...product.images].filter(Boolean) as string[]
    : product.image_url 
      ? [product.image_url] 
      : ["/placeholder.svg"];
  const specifications = product.specifications as Array<{ label: string; value: string }> | null;
  const features = product.features || [];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | CoolTech Kenya</title>
        <meta
          name="description"
          content={product.description || "Quality refrigeration product from CoolTech Kenya"}
        />
      </Helmet>
      <Layout>
        {/* Breadcrumb */}
        <div className="bg-secondary/30 border-b border-border">
          <div className="container py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
                Shop
              </Link>
              {product.category && (
                <>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Link 
                    to={`/shop?category=${product.category.toLowerCase().replace(/ /g, "-")}`} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {product.category}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="container pt-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Product Details */}
        <section className="py-8 md:py-12">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Image Gallery */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-[4/3] bg-secondary/30 rounded-2xl overflow-hidden group">
                  <img
                    src={images[selectedImageIndex]}
                    alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                        {selectedImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-transparent hover:border-border"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  {product.category && (
                    <Badge variant="secondary" className="mb-3">
                      {product.category}
                    </Badge>
                  )}
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {product.name}
                  </h1>
                  
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-muted-foreground">VAT Inclusive</span>
                  </div>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed">
                  {product.full_description || product.description}
                </p>

                {/* Features */}
                {features.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Key Features</h3>
                    <ul className="grid gap-2">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={product.in_stock ? 'text-green-600' : 'text-red-600'}>
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link to={`/quote?product=${product.id}`} className="flex-1">
                    <Button size="lg" className="w-full gap-2">
                      <FileText className="h-5 w-5" />
                      Request Quote
                    </Button>
                  </Link>
                  <Link to="/contact" className="flex-1">
                    <Button size="lg" variant="outline" className="w-full gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Us
                    </Button>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                  <div className="text-center">
                    <Truck className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Nationwide Delivery</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Warranty Included</p>
                  </div>
                  <div className="text-center">
                    <Phone className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Expert Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specifications */}
        {specifications && specifications.length > 0 && (
          <section className="py-8 md:py-12 bg-secondary/30">
            <div className="container">
              <h2 className="text-2xl font-bold text-foreground mb-6">Specifications</h2>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="grid md:grid-cols-2">
                  {specifications.map((spec, index) => (
                    <div
                      key={index}
                      className={`flex justify-between px-6 py-4 ${
                        index % 2 === 0 ? "bg-card" : "bg-secondary/20"
                      } ${index < specifications.length - 2 ? "border-b border-border" : ""}`}
                    >
                      <span className="font-medium text-foreground">{spec.label}</span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="container">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
                <Link to="/shop">
                  <Button variant="ghost" className="gap-2">
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Card key={relatedProduct.id} variant="product" className="group overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={relatedProduct.image_url || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <p className="text-xs text-primary font-medium uppercase tracking-wide">
                        {relatedProduct.category}
                      </p>
                      <CardTitle className="text-lg line-clamp-2">{relatedProduct.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <span className="text-xl font-bold text-foreground">
                        {formatPrice(relatedProduct.price)}
                      </span>
                    </CardContent>
                    <CardFooter>
                      <Link to={`/product/${relatedProduct.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-primary">
          <div className="container text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Need Help Choosing?
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
              Our experts are ready to help you find the perfect refrigeration solution for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Phone className="h-5 w-5" />
                  Talk to an Expert
                </Button>
              </Link>
              <Link to="/booking">
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Book a Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default ProductDetail;