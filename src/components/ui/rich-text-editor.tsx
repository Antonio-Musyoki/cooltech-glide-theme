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
 } from "lucide-react";
 import { useState, useCallback, useEffect } from "react";
 
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