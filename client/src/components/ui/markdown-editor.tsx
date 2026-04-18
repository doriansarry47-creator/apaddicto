import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Link, 
  Image,
  Eye,
  Edit,
  Code,
  Quote
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export default function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "Rédigez votre contenu en Markdown...", 
  className = "",
  minHeight = "min-h-[300px]"
}: MarkdownEditorProps) {
  
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const replacement = before + selectedText + after;
      
      const newValue = value.substring(0, start) + replacement + value.substring(end);
      onChange(newValue);
      
      // Reposition cursor
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + before.length + selectedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const renderMarkdownPreview = (text: string) => {
    if (!text) return <p className="text-gray-500 italic">Prévisualisation vide...</p>;
    
    // Simple Markdown parsing for preview
    let html = text;
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3 text-gray-800">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h1>');
    
    // Bold and Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Lists
    html = html.replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>');
    html = html.replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-4">');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    if (html && !html.startsWith('<h') && !html.startsWith('<li')) {
      html = '<p class="mb-4">' + html + '</p>';
    }
    
    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const markdownButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**'), tooltip: 'Gras' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), tooltip: 'Italique' },
    { icon: Heading1, action: () => insertMarkdown('# '), tooltip: 'Titre 1' },
    { icon: Heading2, action: () => insertMarkdown('## '), tooltip: 'Titre 2' },
    { icon: Heading3, action: () => insertMarkdown('### '), tooltip: 'Titre 3' },
    { icon: List, action: () => insertMarkdown('- '), tooltip: 'Liste' },
    { icon: ListOrdered, action: () => insertMarkdown('1. '), tooltip: 'Liste numérotée' },
    { icon: Link, action: () => insertMarkdown('[texte](', ')'), tooltip: 'Lien' },
    { icon: Quote, action: () => insertMarkdown('> '), tooltip: 'Citation' },
    { icon: Code, action: () => insertMarkdown('`', '`'), tooltip: 'Code inline' },
  ];

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="w-full bg-gray-50 border-b rounded-none h-12">
          <TabsTrigger value="edit" className="flex items-center gap-2 flex-1">
            <Edit className="h-4 w-4" />
            Édition
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2 flex-1">
            <Eye className="h-4 w-4" />
            Aperçu
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="m-0 border-0">
          {/* Toolbar */}
          <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
            {markdownButtons.map((btn, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={btn.action}
                className="h-8 w-8 p-0 hover:bg-gray-200"
                title={btn.tooltip}
              >
                <btn.icon className="h-3.5 w-3.5" />
              </Button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Markdown
              </Badge>
              <span className="text-xs text-gray-500">
                {value.length} caractères
              </span>
            </div>
          </div>
          
          {/* Editor */}
          <Textarea
            id="markdown-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`border-0 rounded-none resize-none focus:ring-0 focus:ring-offset-0 ${minHeight}`}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="m-0 border-0">
          <div className={`p-6 bg-white ${minHeight} overflow-y-auto`}>
            {renderMarkdownPreview(value)}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Aide Markdown */}
      <div className="bg-gray-50 border-t p-3">
        <details>
          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
            📝 Aide Markdown (cliquer pour voir)
          </summary>
          <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 md:grid-cols-4 gap-2">
            <div><code>**gras**</code> → <strong>gras</strong></div>
            <div><code>*italique*</code> → <em>italique</em></div>
            <div><code># Titre 1</code> → Titre principal</div>
            <div><code>## Titre 2</code> → Sous-titre</div>
            <div><code>- Liste</code> → Puces</div>
            <div><code>1. Liste</code> → Numérotée</div>
            <div><code>[lien](url)</code> → Lien cliquable</div>
            <div><code>&gt; Citation</code> → Citation</div>
          </div>
        </details>
      </div>
    </div>
  );
}