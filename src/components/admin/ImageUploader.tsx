 import { useState, useRef } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Loader2, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
 
 interface ImageUploaderProps {
   value: string;
   onChange: (url: string) => void;
   bucket?: string;
   folder?: string;
   className?: string;
 }
 
 export const ImageUploader = ({
   value,
   onChange,
   bucket = "blog-images",
   folder = "featured",
   className,
 }: ImageUploaderProps) => {
   const [isUploading, setIsUploading] = useState(false);
   const [dragActive, setDragActive] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const { toast } = useToast();
 
   const handleUpload = async (file: File) => {
     if (!file.type.startsWith("image/")) {
       toast({
         title: "Invalid file type",
         description: "Please upload an image file (JPG, PNG, GIF, WebP)",
         variant: "destructive",
       });
       return;
     }
 
     if (file.size > 5 * 1024 * 1024) {
       toast({
         title: "File too large",
         description: "Please upload an image smaller than 5MB",
         variant: "destructive",
       });
       return;
     }
 
     setIsUploading(true);
 
     try {
       const fileExt = file.name.split(".").pop();
       const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
 
       const { error: uploadError } = await supabase.storage
         .from(bucket)
         .upload(fileName, file, {
           cacheControl: "3600",
           upsert: false,
         });
 
       if (uploadError) throw uploadError;
 
       const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
 
       onChange(data.publicUrl);
       toast({ title: "Image uploaded successfully" });
     } catch (error: unknown) {
       console.error("Upload error:", error);
       toast({
         title: "Upload failed",
         description: error instanceof Error ? error.message : "Failed to upload image",
         variant: "destructive",
       });
     } finally {
       setIsUploading(false);
     }
   };
 
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) handleUpload(file);
   };
 
   const handleDrag = (e: React.DragEvent) => {
     e.preventDefault();
     e.stopPropagation();
     if (e.type === "dragenter" || e.type === "dragover") {
       setDragActive(true);
     } else if (e.type === "dragleave") {
       setDragActive(false);
     }
   };
 
   const handleDrop = (e: React.DragEvent) => {
     e.preventDefault();
     e.stopPropagation();
     setDragActive(false);
 
     const file = e.dataTransfer.files?.[0];
     if (file) handleUpload(file);
   };
 
   const handleRemove = () => {
     onChange("");
   };
 
   return (
     <div className={cn("space-y-3", className)}>
       {value ? (
         <div className="relative group">
           <img
             src={value}
             alt="Featured image preview"
             className="w-full h-48 object-cover rounded-lg border"
           />
           <Button
             type="button"
             variant="destructive"
             size="icon"
             className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
             onClick={handleRemove}
           >
             <X className="h-4 w-4" />
           </Button>
         </div>
       ) : (
         <div
           className={cn(
             "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
             dragActive
               ? "border-primary bg-primary/5"
               : "border-muted-foreground/25 hover:border-primary/50",
             isUploading && "pointer-events-none opacity-50"
           )}
           onDragEnter={handleDrag}
           onDragLeave={handleDrag}
           onDragOver={handleDrag}
           onDrop={handleDrop}
           onClick={() => fileInputRef.current?.click()}
         >
           <input
             ref={fileInputRef}
             type="file"
             accept="image/*"
             className="hidden"
             onChange={handleFileChange}
             disabled={isUploading}
           />
           <div className="flex flex-col items-center gap-2">
             {isUploading ? (
               <>
                 <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                 <p className="text-sm text-muted-foreground">Uploading...</p>
               </>
             ) : (
               <>
                 <Upload className="h-10 w-10 text-muted-foreground" />
                 <p className="text-sm font-medium">
                   Drop an image here or click to upload
                 </p>
                 <p className="text-xs text-muted-foreground">
                   JPG, PNG, GIF, WebP up to 5MB
                 </p>
               </>
             )}
           </div>
         </div>
       )}
 
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              placeholder="Or paste image URL..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          <MediaLibrary
            onSelect={onChange}
            bucket={bucket}
            trigger={
              <Button type="button" variant="outline" size="icon" title="Media Library">
                <FolderOpen className="h-4 w-4" />
              </Button>
            }
          />
          {!value && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
     </div>
   );
 };