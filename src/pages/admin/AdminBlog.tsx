import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, Search, X, Calendar } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
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
  view_count: number | null;
  created_at: string;
  updated_at: string;
}

const emptyPost: Partial<BlogPost> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image: "",
  author: "CoolTech Team",
  meta_title: "",
  meta_description: "",
  meta_keywords: [],
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image: "",
  category: "",
  tags: [],
  status: "draft",
  published_at: null,
  schema_type: "Article",
  read_time_minutes: null,
};

const categories = [
  "Maintenance Tips",
  "Industry News",
  "Product Guides",
  "Energy Efficiency",
  "Case Studies",
  "How-To Guides",
];

const AdminBlog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (post: Partial<BlogPost>) => {
      const insertData = {
        title: post.title!,
        slug: post.slug!,
        content: post.content!,
        author: post.author || "CoolTech Team",
        excerpt: post.excerpt,
        featured_image: post.featured_image,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        meta_keywords: post.meta_keywords,
        canonical_url: post.canonical_url,
        og_title: post.og_title,
        og_description: post.og_description,
        og_image: post.og_image,
        category: post.category,
        tags: post.tags,
        status: post.status || "draft",
        published_at: post.published_at,
        schema_type: post.schema_type,
        read_time_minutes: post.read_time_minutes,
      };
      const { data, error } = await supabase
        .from("blog_posts")
        .insert([insertData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({ title: "Blog post created successfully" });
      setIsDialogOpen(false);
      setEditingPost(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error creating post", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (post: Partial<BlogPost>) => {
      const { id, created_at, updated_at, view_count, ...updateData } = post;
      const { data, error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("id", id!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({ title: "Blog post updated successfully" });
      setIsDialogOpen(false);
      setEditingPost(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error updating post", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({ title: "Blog post deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting post", description: error.message, variant: "destructive" });
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const postData = {
      ...editingPost,
      slug: editingPost.slug || generateSlug(editingPost.title || ""),
      read_time_minutes: calculateReadTime(editingPost.content || ""),
      meta_title: editingPost.meta_title || editingPost.title,
      og_title: editingPost.og_title || editingPost.title,
      meta_description: editingPost.meta_description || editingPost.excerpt,
      og_description: editingPost.og_description || editingPost.excerpt,
      og_image: editingPost.og_image || editingPost.featured_image,
    };

    if (editingPost.id) {
      updateMutation.mutate(postData);
    } else {
      createMutation.mutate(postData);
    }
  };

  const openCreateDialog = () => {
    setEditingPost({ ...emptyPost });
    setTagsInput("");
    setKeywordsInput("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setTagsInput(post.tags?.join(", ") || "");
    setKeywordsInput(post.meta_keywords?.join(", ") || "");
    setIsDialogOpen(true);
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    setEditingPost((prev) =>
      prev ? { ...prev, tags: value.split(",").map((t) => t.trim()).filter(Boolean) } : null
    );
  };

  const handleKeywordsChange = (value: string) => {
    setKeywordsInput(value);
    setEditingPost((prev) =>
      prev ? { ...prev, meta_keywords: value.split(",").map((k) => k.trim()).filter(Boolean) } : null
    );
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Blog Posts</h1>
            <p className="text-muted-foreground">Manage your blog content and SEO</p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{posts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{posts.filter((p) => p.status === "published").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{posts.filter((p) => p.status === "draft").length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Posts Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Views</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No blog posts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium line-clamp-1">{post.title}</p>
                          <p className="text-xs text-muted-foreground">{post.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{post.category || "-"}</TableCell>
                      <TableCell className="hidden sm:table-cell">{getStatusBadge(post.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{post.view_count || 0}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(post.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Delete this post?")) {
                                deleteMutation.mutate(post.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost?.id ? "Edit Post" : "Create New Post"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={editingPost?.title || ""}
                      onChange={(e) => {
                        setEditingPost((prev) =>
                          prev
                            ? {
                                ...prev,
                                title: e.target.value,
                                slug: prev.id ? prev.slug : generateSlug(e.target.value),
                              }
                            : null
                        );
                      }}
                      placeholder="Enter post title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={editingPost?.slug || ""}
                      onChange={(e) =>
                        setEditingPost((prev) => (prev ? { ...prev, slug: e.target.value } : null))
                      }
                      placeholder="url-friendly-slug"
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={editingPost?.excerpt || ""}
                      onChange={(e) =>
                        setEditingPost((prev) => (prev ? { ...prev, excerpt: e.target.value } : null))
                      }
                      placeholder="Brief summary of the post (160 chars recommended)"
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(editingPost?.excerpt?.length || 0)}/160 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <RichTextEditor
                      value={editingPost?.content || ""}
                      onChange={(value) =>
                        setEditingPost((prev) => (prev ? { ...prev, content: value } : null))
                      }
                      placeholder="Write your blog post content here..."
                      className="min-h-[400px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="featured_image">Featured Image URL</Label>
                    <Input
                      id="featured_image"
                      value={editingPost?.featured_image || ""}
                      onChange={(e) =>
                        setEditingPost((prev) =>
                          prev ? { ...prev, featured_image: e.target.value } : null
                        )
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Meta Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="meta_title">Meta Title</Label>
                      <Input
                        id="meta_title"
                        value={editingPost?.meta_title || ""}
                        onChange={(e) =>
                          setEditingPost((prev) =>
                            prev ? { ...prev, meta_title: e.target.value } : null
                          )
                        }
                        placeholder="SEO title (60 chars max)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {(editingPost?.meta_title?.length || 0)}/60 characters
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="meta_description">Meta Description</Label>
                      <Textarea
                        id="meta_description"
                        value={editingPost?.meta_description || ""}
                        onChange={(e) =>
                          setEditingPost((prev) =>
                            prev ? { ...prev, meta_description: e.target.value } : null
                          )
                        }
                        placeholder="SEO description (160 chars max)"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {(editingPost?.meta_description?.length || 0)}/160 characters
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="meta_keywords">Meta Keywords</Label>
                      <Input
                        id="meta_keywords"
                        value={keywordsInput}
                        onChange={(e) => handleKeywordsChange(e.target.value)}
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>

                    <div>
                      <Label htmlFor="canonical_url">Canonical URL</Label>
                      <Input
                        id="canonical_url"
                        value={editingPost?.canonical_url || ""}
                        onChange={(e) =>
                          setEditingPost((prev) =>
                            prev ? { ...prev, canonical_url: e.target.value } : null
                          )
                        }
                        placeholder="https://yoursite.com/blog/post-slug"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Open Graph (Social Sharing)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="og_title">OG Title</Label>
                      <Input
                        id="og_title"
                        value={editingPost?.og_title || ""}
                        onChange={(e) =>
                          setEditingPost((prev) =>
                            prev ? { ...prev, og_title: e.target.value } : null
                          )
                        }
                        placeholder="Title for social sharing"
                      />
                    </div>

                    <div>
                      <Label htmlFor="og_description">OG Description</Label>
                      <Textarea
                        id="og_description"
                        value={editingPost?.og_description || ""}
                        onChange={(e) =>
                          setEditingPost((prev) =>
                            prev ? { ...prev, og_description: e.target.value } : null
                          )
                        }
                        placeholder="Description for social sharing"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="og_image">OG Image URL</Label>
                      <Input
                        id="og_image"
                        value={editingPost?.og_image || ""}
                        onChange={(e) =>
                          setEditingPost((prev) =>
                            prev ? { ...prev, og_image: e.target.value } : null
                          )
                        }
                        placeholder="https://example.com/og-image.jpg (1200x630 recommended)"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Structured Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="schema_type">Schema Type</Label>
                      <Select
                        value={editingPost?.schema_type || "Article"}
                        onValueChange={(value) =>
                          setEditingPost((prev) => (prev ? { ...prev, schema_type: value } : null))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Article">Article</SelectItem>
                          <SelectItem value="BlogPosting">BlogPosting</SelectItem>
                          <SelectItem value="NewsArticle">NewsArticle</SelectItem>
                          <SelectItem value="TechArticle">TechArticle</SelectItem>
                          <SelectItem value="HowTo">HowTo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={editingPost?.author || ""}
                      onChange={(e) =>
                        setEditingPost((prev) => (prev ? { ...prev, author: e.target.value } : null))
                      }
                      placeholder="Author name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={editingPost?.category || ""}
                      onValueChange={(value) =>
                        setEditingPost((prev) => (prev ? { ...prev, category: value } : null))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={tagsInput}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editingPost?.status || "draft"}
                      onValueChange={(value) =>
                        setEditingPost((prev) => (prev ? { ...prev, status: value } : null))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {editingPost?.status === "scheduled" && (
                    <div className="sm:col-span-2">
                      <Label htmlFor="published_at">Publish Date</Label>
                      <Input
                        id="published_at"
                        type="datetime-local"
                        value={
                          editingPost?.published_at
                            ? new Date(editingPost.published_at).toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          setEditingPost((prev) =>
                            prev
                              ? { ...prev, published_at: new Date(e.target.value).toISOString() }
                              : null
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingPost?.id ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBlog;
