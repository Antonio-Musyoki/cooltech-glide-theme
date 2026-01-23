import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, formatPrice } from "@/data/products";
import { Eye, ShoppingCart, Search, Filter, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { productsApi, Product } from "@/services/supabaseService";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const selectedCategory = searchParams.get("category") || "all";

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const response = await productsApi.getAll();
      if (response.data) {
        setProducts(response.data);
      }
      setLoading(false);
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === "all" || 
        (product.category?.toLowerCase().includes(selectedCategory.toLowerCase()));
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, products]);

  const handleCategoryChange = (category: string) => {
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category.toLowerCase().replace(/ /g, "-"));
    }
    setSearchParams(searchParams);
  };

  return (
    <>
      <Helmet>
        <title>Shop Refrigeration Equipment | CoolTech Kenya</title>
        <meta
          name="description"
          content="Browse our selection of ice machines, cold room equipment, cooler boxes, and more. Quality refrigeration products delivered across Kenya."
        />
      </Helmet>
      <Layout>
        {/* Hero Banner */}
        <section className="bg-hero-gradient py-12 md:py-16">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Our Products
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl">
              Explore our range of premium refrigeration equipment. From ice machines to cold room components, we have everything you need.
            </p>
          </div>
        </section>

        <section className="py-8 md:py-12 bg-background">
          <div className="container">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className={`lg:w-64 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
                <div className="bg-card rounded-xl p-5 border border-border sticky top-24">
                  <h3 className="font-bold text-lg mb-4">Categories</h3>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => handleCategoryChange("all")}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === "all"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-secondary"
                        }`}
                      >
                        All Products
                      </button>
                    </li>
                    {categories.map((category) => (
                      <li key={category}>
                        <button
                          onClick={() => handleCategoryChange(category)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                            selectedCategory === category.toLowerCase().replace(/ /g, "-")
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-secondary"
                          }`}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading products...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-6">
                      Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                    </p>
                    
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No products found matching your criteria.</p>
                        <Button variant="outline" className="mt-4" onClick={() => {
                          setSearchQuery("");
                          handleCategoryChange("all");
                        }}>
                          Clear Filters
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                          <Card key={product.id} variant="product" className="group overflow-hidden">
                            {/* Product Image */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <img
                                src={product.image_url || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
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
                                <span className="text-xl font-bold text-foreground">{formatPrice(product.price)}</span>
                              </div>
                              <div className="w-full flex gap-2">
                                <Link to={`/product/${product.id}`} className="flex-1">
                                  <Button variant="outline" size="sm" className="w-full">
                                    View Details
                                  </Button>
                                </Link>
                                <Link to={`/quote?product=${product.id}`}>
                                  <Button variant="default" size="sm">
                                    <ShoppingCart className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Shop;