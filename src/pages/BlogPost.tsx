import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, Clock, ChevronLeft, Share2, Facebook, Twitter, Linkedin, User } from "lucide-react";
import { format } from "date-fns";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  category: string | null;
  tags: string[] | null;
  status: string;
  published_at: string | null;
  schema_type: string | null;
  read_time_minutes: number | null;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data as BlogPostData | null;
    },
    enabled: !!slug,
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ["related-posts", post?.category, post?.id],
    queryFn: async () => {
      if (!post?.category) return [];
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, featured_image, created_at")
        .eq("status", "published")
        .eq("category", post.category)
        .neq("id", post.id)
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!post?.category,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/blog")}>Back to Blog</Button>
        </div>
      </Layout>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = post.title;
  const publishedDate = post.published_at || post.created_at;

  // Generate JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": post.schema_type || "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.og_image || post.featured_image,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "CoolTech Refrigeration",
      logo: {
        "@type": "ImageObject",
        url: "https://cooltechrefrigeration.co.ke/favicon.ico",
      },
    },
    datePublished: publishedDate,
    dateModified: post.created_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": shareUrl,
    },
  };

  return (
    <Layout>
      <Helmet>
        <title>{post.meta_title || post.title} | CoolTech Refrigeration Kenya</title>
        <meta name="description" content={post.meta_description || post.excerpt || ""} />
        {post.meta_keywords && <meta name="keywords" content={post.meta_keywords.join(", ")} />}
        {post.canonical_url && <link rel="canonical" href={post.canonical_url} />}
        
        {/* Open Graph */}
        <meta property="og:title" content={post.og_title || post.title} />
        <meta property="og:description" content={post.og_description || post.excerpt || ""} />
        {(post.og_image || post.featured_image) && (
          <meta property="og:image" content={post.og_image || post.featured_image || ""} />
        )}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.og_title || post.title} />
        <meta name="twitter:description" content={post.og_description || post.excerpt || ""} />
        {(post.og_image || post.featured_image) && (
          <meta name="twitter:image" content={post.og_image || post.featured_image || ""} />
        )}
        
        {/* Article meta */}
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:author" content={post.author} />
        {post.category && <meta property="article:section" content={post.category} />}
        {post.tags?.map((tag, i) => (
          <meta key={i} property="article:tag" content={tag} />
        ))}
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero Image */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        {post.featured_image ? (
          <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-6xl font-bold text-primary/20">CT</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-foreground/80 hover:text-foreground"
              onClick={() => navigate("/blog")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Blog
            </Button>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              {post.category && (
                <Badge variant="outline" className="mb-4 capitalize">
                  {post.category}
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(publishedDate), "MMMM d, yyyy")}
                </span>
                {post.read_time_minutes && (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {post.read_time_minutes} min read
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  By {post.author}
                </span>
              </div>
            </header>

            <Separator className="mb-8" />

            {/* Content */}
            <div
              className="prose prose-lg max-w-none dark:prose-invert 
                prose-headings:font-bold prose-headings:text-foreground
                prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
                prose-li:text-muted-foreground prose-li:my-1
                prose-strong:text-foreground
                prose-ul:my-4 prose-ol:my-4
                prose-blockquote:border-primary prose-blockquote:text-muted-foreground"
            >
              {post.content.split("\n").map((line, index) => {
                if (line.startsWith("# ")) {
                  return <h1 key={index}>{line.replace("# ", "")}</h1>;
                } else if (line.startsWith("## ")) {
                  return <h2 key={index}>{line.replace("## ", "")}</h2>;
                } else if (line.startsWith("### ")) {
                  return <h3 key={index}>{line.replace("### ", "")}</h3>;
                } else if (line.startsWith("- ")) {
                  return <li key={index}>{line.replace("- ", "")}</li>;
                } else if (line.match(/^\d+\. /)) {
                  return <li key={index}>{line.replace(/^\d+\. /, "")}</li>;
                } else if (line.trim()) {
                  return <p key={index}>{line}</p>;
                }
                return null;
              })}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h4 className="text-sm font-semibold mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-6 border-t">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share this article
              </h4>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                      "_blank"
                    )
                  }
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    window.open(
                      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
                      "_blank"
                    )
                  }
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    window.open(
                      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
                      "_blank"
                    )
                  }
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 group">
                    <div className="aspect-video overflow-hidden bg-muted">
                      {relatedPost.featured_image ? (
                        <img
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                          <span className="text-xl font-bold text-primary/30">CT</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {format(new Date(relatedPost.created_at), "MMM d, yyyy")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Expert Refrigeration Solutions?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Contact CoolTech Refrigeration for professional cold room installation, maintenance,
            and equipment supply.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/quote">Get a Quote</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPost;
