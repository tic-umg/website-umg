"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@/components/ui/tiptap/TextAlign";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
} from "lucide-react";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function ToolbarButton({
  onClick,
  isActive = false,
  icon: Icon,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Commencez à écrire...",
  minHeight = "min-h-[200px]",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 hover:text-indigo-800 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg my-4",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `prose prose-slate dark:prose-invert max-w-none focus:outline-none ${minHeight} p-4`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Handle external value updates (if any)
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      // Basic check to prevent cursor jumping loops, typical in Tiptap
      if (editor.getText() === "") {
         editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={Bold}
          title="Gras"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={Italic}
          title="Italique"
        />
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon={List}
          title="Liste à puces"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon={ListOrdered}
          title="Liste numérotée"
        />
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
        <ToolbarButton
          onClick={() => (editor.chain() as any).focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          icon={AlignLeft}
          title="Aligner à gauche"
        />
        <ToolbarButton
          onClick={() => (editor.chain() as any).focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          icon={AlignCenter}
          title="Centrer"
        />
        <ToolbarButton
          onClick={() => (editor.chain() as any).focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          icon={AlignRight}
          title="Aligner à droite"
        />
        <ToolbarButton
          onClick={() => (editor.chain() as any).focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          icon={AlignJustify}
          title="Justifier"
        />
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          icon={Quote}
          title="Citation"
        />
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("URL du lien:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          isActive={editor.isActive("link")}
          icon={LinkIcon}
          title="Lien"
        />
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("URL de l'image:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          isActive={false}
          icon={ImageIcon}
          title="Image"
        />
        <div className="flex-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          isActive={false}
          icon={Undo}
          title="Annuler"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          isActive={false}
          icon={Redo}
          title="Rétablir"
        />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
