import { useState, KeyboardEvent, ChangeEvent, useRef, FormEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bold, Italic, Underline, List, ListOrdered, Quote, Code, Heading1, Heading2, Link, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export default function NewRichTextEditor({ value, onChange }) {
  const [text, setText] = useState(value || "");
  const [htmlOutput, setHtmlOutput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    // Handle Shift+Enter to create a line break
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();

      // Get cursor position
      const cursorPosition = e.currentTarget.selectionStart;
      const textBeforeCursor = text.substring(0, cursorPosition);
      const textAfterCursor = text.substring(cursorPosition);

      // Insert a line break at cursor position
      const newText = textBeforeCursor + "\n" + textAfterCursor;
      setText(newText);

      // Set cursor position after the inserted line break
      setTimeout(() => {
        const textarea = e.currentTarget;
        textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1;
      }, 0);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    const html = convertToHtml(text)
    onChange(html);
  };

  const insertFormatting = (startTag, endTag = "") => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selectedText = text.substring(selectionStart, selectionEnd);

    const beforeText = text.substring(0, selectionStart);
    const afterText = text.substring(selectionEnd);

    const newText = beforeText + startTag + selectedText + (endTag || startTag) + afterText;
    setText(newText);

    // Set focus back to textarea and position cursor after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectionStart + startTag.length + selectedText.length + endTag.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
    }, 0);
  };

  // Convert markdown-like syntax to HTML
  const convertToHtml = (inputText) => {
    if (!inputText) return "";

    let formattedText = inputText
      // Convert markdown-like syntax to HTML
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
      .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^> (.*?)$/gm, "<blockquote>$1</blockquote>")
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2">$1</a>');

    // Handle lists
    const lines = formattedText.split("\n");
    let inOrderedList = false;
    let inUnorderedList = false;

    formattedText = lines
      .map((line) => {
        if (line.match(/^- /)) {
          if (!inUnorderedList) {
            inUnorderedList = true;
            return "<ul><li>" + line.substring(2) + "</li>";
          }
          return "<li>" + line.substring(2) + "</li>";
        } else if (line.match(/^\d+\. /)) {
          if (!inOrderedList) {
            inOrderedList = true;
            return "<ol><li>" + line.replace(/^\d+\. /, "") + "</li>";
          }
          return "<li>" + line.replace(/^\d+\. /, "") + "</li>";
        } else {
          let result = line;
          if (inUnorderedList) {
            inUnorderedList = false;
            result = "</ul>" + result;
          }
          if (inOrderedList) {
            inOrderedList = false;
            result = "</ol>" + result;
          }
          return result;
        }
      })
      .join("\n");

    // Close any open lists
    if (inUnorderedList) formattedText += "</ul>";
    if (inOrderedList) formattedText += "</ol>";

    // Replace newlines with <br /> tags
    return formattedText.replace(/\n/g, "<br />");
  };

  // Format text for preview
  const formatTextForPreview = () => {
    if (!text) return <p className="text-muted-foreground italic">Preview will appear here...</p>;
    return <div dangerouslySetInnerHTML={{ __html: convertToHtml(text) }} />;
  };

  // Get HTML format for display
  const getHtmlFormat = () => {
    if (!text) return "<p>Your HTML will appear here...</p>";

    // Escape HTML characters for display purposes only
    return convertToHtml(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Convert markdown to HTML
    const html = convertToHtml(text);
    setHtmlOutput(html);
    setIsDialogOpen(true);
  };

  // Copy HTML to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlOutput);
    setCopied(true);

    toast({
      title: "Copied!",
      description: "HTML has been copied to clipboard",
    });

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Rich Text Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-1 p-2 mb-2 border rounded-md">
            <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting("**", "**")} className="w-8 h-8" title="Bold">
              <Bold className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting("*", "*")} className="w-8 h-8" title="Italic">
              <Italic className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting("__", "__")} className="w-8 h-8" title="Underline">
              <Underline className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting("# ", "")} className="w-8 h-8" title="Heading 1">
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting("## ", "")} className="w-8 h-8" title="Heading 2">
              <Heading2 className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting("- ", "")} className="w-8 h-8" title="Bullet List">
              <List className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting("1. ", "")} className="w-8 h-8" title="Numbered List">
              <ListOrdered className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting("> ", "")} className="w-8 h-8" title="Quote">
              <Quote className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting("`", "`")} className="w-8 h-8" title="Code">
              <Code className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => insertFormatting("[", "](https://)")} className="w-8 h-8" title="Link">
              <Link className="w-4 h-4" />
            </Button>
          </div>

          <Textarea ref={textareaRef} value={text} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="Start typing here... Use markdown-like syntax for formatting." className="min-h-[200px] resize-none p-4" required />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-xs text-muted-foreground">
            Tip: Press <kbd className="px-1 py-0.5 bg-muted rounded border">Shift</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded border">Enter</kbd> for line break
          </p>
        </CardFooter>

        <Separator />

        <Tabs defaultValue="preview" className="w-full">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Output</CardTitle>
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="preview" className="mt-0">
              <div className="p-4 min-h-[150px] bg-muted/30 rounded-md">{formatTextForPreview()}</div>
            </TabsContent>
            <TabsContent value="html" className="mt-0">
              <div className="p-4 min-h-[150px] bg-muted/30 rounded-md overflow-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  <code dangerouslySetInnerHTML={{ __html: getHtmlFormat() }} />
                </pre>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* HTML Output Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>HTML Output</DialogTitle>
            <DialogDescription>Your content has been converted to HTML format.</DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted/30 rounded-md max-h-[300px] overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              <code
                dangerouslySetInnerHTML={{
                  __html: htmlOutput.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                }}
              />
            </pre>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={copyToClipboard} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy HTML"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
