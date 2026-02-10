import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Pilcrow,
  RemoveFormatting,
  Upload,
  Loader2,
} from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
 
 interface RichTextEditorProps {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   className?: string;
 }
 
 const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `content/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error } = await supabase.storage.from("blog-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("blog-images").getPublicUrl(fileName);
      editor.chain().focus().setImage({ src: data.publicUrl }).run();
      setImagePopoverOpen(false);
      toast({ title: "Image inserted" });
    } catch (err: unknown) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : "Failed to upload", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }, [editor, toast]);
 
   const setLink = useCallback(() => {
    if (!editor) return;
     if (linkUrl === "") {
       editor.chain().focus().extendMarkRange("link").unsetLink().run();
     } else {
       editor
         .chain()
         .focus()
         .extendMarkRange("link")
         .setLink({ href: linkUrl })
         .run();
     }
     setLinkUrl("");
     setLinkPopoverOpen(false);
   }, [editor, linkUrl]);
 
   const addImage = useCallback(() => {
    if (!editor) return;
     if (imageUrl) {
       editor.chain().focus().setImage({ src: imageUrl }).run();
     }
     setImageUrl("");
     setImagePopoverOpen(false);
   }, [editor, imageUrl]);
 
   const ToolbarButton = ({
     onClick,
     isActive,
     disabled,
     children,
     title,
   }: {
     onClick: () => void;
     isActive?: boolean;
     disabled?: boolean;
     children: React.ReactNode;
     title?: string;
   }) => (
     <Button
       type="button"
       variant="ghost"
       size="sm"
       className={cn(
         "h-8 w-8 p-0",
         isActive && "bg-muted text-foreground"
       )}
       onClick={onClick}
       disabled={disabled}
       title={title}
     >
       {children}
     </Button>
   );
 
  if (!editor) {
    return null;
  }

   return (
     <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-1">
       {/* Text formatting */}
       <ToolbarButton
         onClick={() => editor.chain().focus().toggleBold().run()}
         isActive={editor.isActive("bold")}
         title="Bold (Ctrl+B)"
       >
         <Bold className="h-4 w-4" />
       </ToolbarButton>
       <ToolbarButton
         onClick={() => editor.chain().focus().toggleItalic().run()}
         isActive={editor.isActive("italic")}
         title="Italic (Ctrl+I)"
       >
         <Italic className="h-4 w-4" />
       </ToolbarButton>
       <ToolbarButton
         onClick={() => editor.chain().focus().toggleStrike().run()}
         isActive={editor.isActive("strike")}
         title="Strikethrough"
       >
         <Strikethrough className="h-4 w-4" />
       </ToolbarButton>
       <ToolbarButton
         onClick={() => editor.chain().focus().toggleCode().run()}
         isActive={editor.isActive("code")}
         title="Inline Code"
       >
         <Code className="h-4 w-4" />
       </ToolbarButton>
 
       <div className="mx-1 h-6 w-px bg-border" />
 
       {/* Headings */}
       <ToolbarButton
         onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
         isActive={editor.isActive("heading", { level: 1 })}
         title="Heading 1"
       >
         <Heading1 className="h-4 w-4" />
       </ToolbarButton>
       <ToolbarButton
         onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
         isActive={editor.isActive("heading", { level: 2 })}
         title="Heading 2"
       >
         <Heading2 className="h-4 w-4" />
       </ToolbarButton>
       <ToolbarButton
         onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
         isActive={editor.isActive("heading", { level: 3 })}
         title="Heading 3"
       >
         <Heading3 className="h-4 w-4" />
       </ToolbarButton>
       <ToolbarButton
         onClick={() => editor.chain().focus().setParagraph().run()}
         isActive={editor.isActive("paragraph")}
         title="Paragraph"
       >
         <Pilcrow className="h-4 w-4" />
       </ToolbarButton>
 
       <div className="mx-1 h-6 w-px bg-border" />
 
       {/* Lists */}
       <ToolbarButton
         onClick={() => editor.chain().focus().toggleBulletList().run()}
         isActive={editor.isActive("bulletList")}
         title="Bullet List"
       >
         <List className="h-4 w-4" />
       </ToolbarButton>
       <ToolbarButton
         onClick={() => editor.chain().focus().toggleOrderedList().run()}
         isActive={editor.isActive("orderedList")}
         title="Numbered List"
       >
         <ListOrdered className="h-4 w-4" />
       </ToolbarButton>
       <ToolbarButton
         onClick={() => editor.chain().focus().toggleBlockquote().run()}
         isActive={editor.isActive("blockquote")}
         title="Blockquote"
       >
         <Quote className="h-4 w-4" />
       </ToolbarButton>
       <ToolbarButton
         onClick={() => editor.chain().focus().setHorizontalRule().run()}
         title="Horizontal Rule"
       >
         <Minus className="h-4 w-4" />
       </ToolbarButton>
 
       <div className="mx-1 h-6 w-px bg-border" />
 
       {/* Link */}
       <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
         <PopoverTrigger asChild>
           <Button
             type="button"
             variant="ghost"
             size="sm"
             className={cn(
               "h-8 w-8 p-0",
               editor.isActive("link") && "bg-muted text-foreground"
             )}
             title="Add Link"
           >
             <LinkIcon className="h-4 w-4" />
           </Button>
         </PopoverTrigger>
         <PopoverContent className="w-80" align="start">
           <div className="flex gap-2">
             <Input
               placeholder="Enter URL..."
               value={linkUrl}
               onChange={(e) => setLinkUrl(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && setLink()}
             />
             <Button type="button" size="sm" onClick={setLink}>
               Add
             </Button>
           </div>
         </PopoverContent>
       </Popover>
 
       {/* Image */}
       <Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
         <PopoverTrigger asChild>
           <Button
             type="button"
             variant="ghost"
             size="sm"
             className="h-8 w-8 p-0"
             title="Add Image"
           >
             <ImageIcon className="h-4 w-4" />
           </Button>
         </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter image URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addImage()}
                />
                <Button type="button" size="sm" onClick={addImage}>
                  Add
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-popover px-2 text-muted-foreground">or</span></div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }}
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
 
       <div className="mx-1 h-6 w-px bg-border" />
 
       {/* Clear formatting */}
       <ToolbarButton
         onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
         title="Clear Formatting"
       >
         <RemoveFormatting className="h-4 w-4" />
       </ToolbarButton>
 
       <div className="flex-1" />
 
       {/* Undo/Redo */}
       <ToolbarButton
         onClick={() => editor.chain().focus().undo().run()}
         disabled={!editor.can().undo()}
         title="Undo (Ctrl+Z)"
       >
         <Undo className="h-4 w-4" />
       </ToolbarButton>
       <ToolbarButton
         onClick={() => editor.chain().focus().redo().run()}
         disabled={!editor.can().redo()}
         title="Redo (Ctrl+Shift+Z)"
       >
         <Redo className="h-4 w-4" />
       </ToolbarButton>
     </div>
   );
 };
 
 export const RichTextEditor = ({
   value,
   onChange,
   placeholder = "Start writing...",
   className,
 }: RichTextEditorProps) => {
   const editor = useEditor({
     extensions: [
       StarterKit.configure({
         heading: {
           levels: [1, 2, 3],
         },
       }),
       Link.configure({
         openOnClick: false,
         HTMLAttributes: {
           class: "text-primary underline",
         },
       }),
       Image.configure({
         HTMLAttributes: {
           class: "max-w-full h-auto rounded-lg my-4",
         },
       }),
       Placeholder.configure({
         placeholder,
       }),
     ],
     content: value,
     editorProps: {
       attributes: {
         class:
           "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3",
       },
     },
     onUpdate: ({ editor }) => {
       onChange(editor.getHTML());
     },
   });
 
   // Sync external value changes
   useEffect(() => {
     if (editor && value !== editor.getHTML()) {
       editor.commands.setContent(value);
     }
   }, [value, editor]);
 
   return (
     <div
       className={cn(
         "rounded-md border border-input bg-background overflow-hidden",
         className
       )}
     >
       <MenuBar editor={editor} />
       <EditorContent editor={editor} />
     </div>
   );
 };