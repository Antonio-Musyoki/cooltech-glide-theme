-- Create blog_posts table with comprehensive SEO fields
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author TEXT NOT NULL DEFAULT 'CoolTech Team',
  
  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  
  -- Organization
  category TEXT,
  tags TEXT[],
  
  -- Status & Scheduling
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Schema.org structured data
  schema_type TEXT DEFAULT 'Article',
  read_time_minutes INTEGER,
  
  -- Tracking
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Published posts are publicly readable"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));

-- Admins can manage all posts
CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts
FOR ALL
USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for slug lookups and published posts
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status_published ON public.blog_posts(status, published_at);