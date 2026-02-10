import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Image as ImageIcon,
  Search,
  Loader2,
  Trash2,
  FolderOpen,
  Check,
} from "lucide-react";

interface StorageFile {
  name: string;
  url: string;
  created_at: string;
  size: number;
}

interface MediaLibraryProps {
  onSelect: (url: string) => void;
  bucket?: string;
  trigger?: React.ReactNode;
}

export const MediaLibrary = ({
  onSelect,
  bucket = "blog-images",
  trigger,
}: MediaLibraryProps) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const folders = ["featured", "content"];
      const allFiles: StorageFile[] = [];

      for (const folder of folders) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } });

        if (error) {
          console.error(`Error listing ${folder}:`, error);
          continue;
        }

        if (data) {
          for (const file of data) {
            if (file.name === ".emptyFolderPlaceholder") continue;
            const { data: urlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(`${folder}/${file.name}`);
            allFiles.push({
              name: file.name,
              url: urlData.publicUrl,
              created_at: file.created_at || "",
              size: (file.metadata as { size?: number })?.size || 0,
            });
          }
        }
      }

      // Sort newest first
      allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setFiles(allFiles);
    } catch (err) {
      console.error("Error fetching files:", err);
      toast({ title: "Failed to load media library", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchFiles();
      setSelectedUrl(null);
    }
  }, [open]);

  const handleDelete = async (file: StorageFile) => {
    if (!confirm(`Delete "${file.name}"?`)) return;

    // Extract the path from the URL
    const urlParts = file.url.split(`${bucket}/`);
    const filePath = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Image deleted" });
      setFiles((prev) => prev.filter((f) => f.url !== file.url));
      if (selectedUrl === file.url) setSelectedUrl(null);
    }
  };

  const handleInsert = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      setOpen(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="sm" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Media Library
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Media Library
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Grid */}
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <ImageIcon className="h-12 w-12" />
                <p>{search ? "No images match your search" : "No images uploaded yet"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
                {filteredFiles.map((file) => (
                  <div
                    key={file.url}
                    className={cn(
                      "group relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md",
                      selectedUrl === file.url
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/20"
                    )}
                    onClick={() => setSelectedUrl(file.url)}
                  >
                    <div className="aspect-square">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Selected overlay */}
                    {selectedUrl === file.url && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    {/* Delete button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 left-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>

                    {/* File info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{file.name}</p>
                      {file.size > 0 && (
                        <p className="text-white/70 text-[10px]">{formatSize(file.size)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {filteredFiles.length} image{filteredFiles.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleInsert} disabled={!selectedUrl}>
                Insert Selected
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
