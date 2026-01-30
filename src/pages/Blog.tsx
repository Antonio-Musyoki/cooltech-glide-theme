import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, Clock, ChevronRight, Search, User } from "lucide-react";
import { format } from "date-fns";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  author: string;
  category: string | null;
  tags: string[] | null;
  status: string;
  published_at: string | null;
  read_time_minutes: number | null;
  created_at: string;
}

const blogCategories = [
  { id: "all", label: "All Posts" },
  { id: "Maintenance Tips", label: "Maintenance Tips" },
  { id: "Industry News", label: "Industry News" },
  { id: "Product Guides", label: "Product Guides" },
  { id: "Energy Efficiency", label: "Energy Efficiency" },
  { id: "Case Studies", label: "Case Studies" },
  { id: "How-To Guides", label: "How-To Guides" },
];

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPostData[];
    },
  });

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = posts[0];

  return (
    <Layout>
      <Helmet>
        <title>Blog & Knowledge Center | CoolTech Refrigeration Kenya</title>
        <meta
          name="description"
          content="Expert articles on cold room maintenance, refrigeration tips, ice machine guides, and industry updates for Kenyan businesses."
        />
        <meta
          name="keywords"
          content="Cold room tips Kenya, refrigeration maintenance, ice machine guide, Milk ATM Kenya, cold storage Kenya"
        />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Knowledge Center
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Refrigeration Insights & Tips
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Expert guides, maintenance tips, and industry updates to help your business thrive
              with optimal cold storage solutions.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {selectedCategory === "all" && searchQuery === "" && featuredPost && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Featured Article</h2>
            <Link to={`/blog/${featuredPost.slug}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-video md:aspect-auto overflow-hidden bg-muted">
                    {featuredPost.featured_image ? (
                      <img
                        src={featuredPost.featured_image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <span className="text-4xl font-bold text-primary/30">CT</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                    {featuredPost.category && (
                      <Badge variant="outline" className="w-fit mb-4 capitalize">
                        {featuredPost.category}
                      </Badge>
                    )}
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h3>
                    {featuredPost.excerpt && (
                      <p className="text-muted-foreground mb-6 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(featuredPost.created_at), "MMM d, yyyy")}
                      </span>
                      {featuredPost.read_time_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {featuredPost.read_time_minutes} min read
                        </span>
                      )}
                    </div>
                    <Button className="w-fit group/btn">
                      Read Article
                      <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </div>
        </section>
      )}

      {/* Category Filter & Articles */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {blogCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts
                .filter(
                  (post) =>
                    !(selectedCategory === "all" && searchQuery === "" && post.id === featuredPost?.id)
                )
                .map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No articles found matching your criteria.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-primary-foreground/80 mb-8">
              Get the latest refrigeration tips, industry news, and exclusive offers delivered to
              your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 max-w-sm"
              />
              <Button variant="secondary">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

const ArticleCard = ({ post }: { post: BlogPostData }) => (
  <Link to={`/blog/${post.slug}`}>
    <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 group">
      <div className="aspect-video overflow-hidden bg-muted">
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <span className="text-2xl font-bold text-primary/30">CT</span>
          </div>
        )}
      </div>
      <CardContent className="p-5">
        {post.category && (
          <Badge variant="outline" className="mb-3 capitalize">
            {post.category}
          </Badge>
        )}
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(post.created_at), "MMM d, yyyy")}
          </span>
          {post.read_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.read_time_minutes} min
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default Blog;
