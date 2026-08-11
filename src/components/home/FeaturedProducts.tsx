import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPriceOrQuote, isQuoteOnly } from "@/data/products";
import { ArrowRight, Eye, ShoppingCart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { productsApi, Product } from "@/services/supabaseService";

export const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const response = await productsApi.getAll();
      if (response.data) {
        // Get featured products or first 4
        const featured = response.data.filter(p => p.featured).slice(0, 4);
        setFeaturedProducts(featured.length > 0 ? featured : response.data.slice(0, 4));
      }
      setLoading(false);
    };
    loadProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Products</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Featured Equipment
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our range of premium refrigeration and ice production equipment, trusted by businesses across Kenya.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <Card
              key={product.id}
              variant="product"
              className="group animate-fade-up overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <button className="absolute top-3 right-3 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-primary-foreground">
                  <Eye className="h-5 w-5" />
                </button>
              </div>

              <CardHeader className="pb-2">
                <p className="text-xs text-primary font-medium uppercase tracking-wide">{product.category}</p>
                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
              </CardHeader>

              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <div className="w-full flex items-center justify-between">
                  <span className={isQuoteOnly(product.price) ? "text-base font-semibold text-primary" : "text-xl font-bold text-foreground"}>
                    {formatPriceOrQuote(product.price)}
                  </span>
                </div>
                <div className="w-full flex gap-2">
                  <Link to={`/product/${product.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Link to={`/quote?product=${product.id}`} className="flex-1">
                    <Button variant="default" size="sm" className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {isQuoteOnly(product.price) ? "Request Quote" : "Quote"}
                    </Button>
                  </Link>
                </div>
              </CardFooter>

            </Card>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link to="/shop">
            <Button variant="outline" size="lg" className="group">
              View All Products
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};