/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bold, Italic, Underline, Heading1, Heading2, Quote, AlignLeft, AlignCenter, AlignRight, LinkIcon, ImageIcon, Video, Palette } from "lucide-react";

export function RichTextEditor({ value, onChange, placeholder = "Enter content...", className = "", minHeight = "200px" }) {
  const textareaRef = useRef();
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedColor, setSelectedColor] = useState("#000000");

  // Save selection when textarea is focused
  const saveSelection = () => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart);
      setSelectionEnd(textareaRef.current.selectionEnd);
    }
  };

  //Handle Keydown
  const handleKeyDown = (e) => {
    // Handle Shift+Enter to create a line break
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();

      // Get cursor position
      const cursorPosition = e.currentTarget.selectionStart;
      const textBeforeCursor = value.substring(0, cursorPosition);
      const textAfterCursor = value.substring(cursorPosition);

      // Insert a line break at cursor position
      const newText = textBeforeCursor + "\n" + textAfterCursor;
      onChange(newText);

      // Set cursor position after the inserted line break
      setTimeout(() => {
        const textarea = e.currentTarget;
        textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1;
      }, 0);
    }
  };

  // Apply formatting to selected text
  const applyFormatting = (prefix, suffix) => {
    if (textareaRef.current) {
      const start = selectionStart;
      const end = selectionEnd;
      const selectedText = value.substring(start, end);
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);

      const newValue = beforeText + prefix + selectedText + suffix + afterText;
      onChange(newValue);

      // Focus back on textarea and set cursor position after formatting
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
        }
      }, 0);
    }
  };

  // Insert HTML at cursor position
  const insertHtml = (html) => {
    if (textareaRef.current) {
      const start = selectionStart;
      const beforeText = value.substring(0, start);
      const afterText = value.substring(start);

      const newValue = beforeText + html + afterText;
      onChange(newValue);

      // Focus back on textarea and set cursor position after inserted HTML
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + html.length, start + html.length);
        }
      }, 0);
    }
  };

  // Format handlers
  const handleBold = () => applyFormatting("<strong>", "</strong>");
  const handleItalic = () => applyFormatting("<em>", "</em>");
  const handleUnderline = () => applyFormatting("<u>", "</u>");
  const handleHeading1 = () => applyFormatting("<h1>", "</h1>");
  const handleHeading2 = () => applyFormatting("<h2>", "</h2>");
  const handleQuote = () => applyFormatting("<blockquote>", "</blockquote>");
  const handleAlignLeft = () => applyFormatting('<div style="text-align: left;">', "</div>");
  const handleAlignCenter = () => applyFormatting('<div style="text-align: center;">', "</div>");
  const handleAlignRight = () => applyFormatting('<div style="text-align: right;">', "</div>");

  const handleColor = () => {
    applyFormatting(`<span style="color: ${selectedColor}">`, "</span>");
  };

  const handleLink = () => {
    if (linkUrl) {
      const selectedText = value.substring(selectionStart, selectionEnd) || "Link text";
      const linkHtml = `<a href="${linkUrl}" target="_blank">${selectedText}</a>`;

      if (selectionStart !== selectionEnd) {
        applyFormatting(`<a href="${linkUrl}" target="_blank">`, "</a>");
      } else {
        insertHtml(linkHtml);
      }

      setLinkUrl("");
    }
  };

  const handleImage = () => {
    if (imageUrl) {
      const imageHtml = `<img src="${imageUrl}" alt="Image" style="max-width: 100%;" />`;
      insertHtml(imageHtml);
      setImageUrl("");
    }
  };

  const handleVideo = () => {
    if (videoUrl) {
      // Extract YouTube video ID if it's a YouTube URL
      let videoHtml = "";
      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        const videoId = videoUrl.includes("v=") ? videoUrl.split("v=")[1].split("&")[0] : videoUrl.split("/").pop();

        videoHtml = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
      } else {
        videoHtml = `<video controls style="max-width: 100%;"><source src="${videoUrl}" /></video>`;
      }

      insertHtml(videoHtml);
      setVideoUrl("");
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-1 p-1 border rounded-md bg-muted/50">
        <Button type="button" variant="ghost" size="icon" onClick={handleBold} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={handleItalic} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={handleUnderline} title="Underline">
          <Underline className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={handleHeading1} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={handleHeading2} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={handleQuote} title="Quote">
          <Quote className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <Button type="button" variant="ghost" size="icon" onClick={handleAlignLeft} title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={handleAlignCenter} title="Align Center">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={handleAlignRight} title="Align Right">
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" title="Text Color">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="space-y-2">
              <Label htmlFor="color-picker">Select Color</Label>
              <div className="flex items-center gap-2">
                <Input id="color-picker" type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-10 h-10 p-1" />
                <Button size="sm" onClick={handleColor}>
                  Apply Color
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" title="Insert Link">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2">
            <div className="space-y-2">
              <Label htmlFor="link-url">Link URL</Label>
              <div className="flex items-center gap-2">
                <Input id="link-url" type="url" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                <Button size="sm" onClick={handleLink}>
                  Insert
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" title="Insert Image">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <div className="flex items-center gap-2">
                <Input id="image-url" type="url" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                <Button size="sm" onClick={handleImage}>
                  Insert
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" title="Insert Video">
              <Video className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <div className="flex items-center gap-2">
                <Input id="video-url" type="url" placeholder="https://youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                <Button size="sm" onClick={handleVideo}>
                  Insert
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Textarea ref={textareaRef} value={value} onChange={(e) => onChange(e.target.value)} onSelect={saveSelection} onClick={saveSelection} onKeyUp={saveSelection} onKeyDown={handleKeyDown} placeholder={placeholder} className={`min-h-[${minHeight}px]`} />

      <p>
        Tip: Press <kbd className="px-1 py-0.5 bg-muted rounded border">Shift</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded border">Enter</kbd> for line break
      </p>

      {value && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Preview:</h3>
          <div className="p-4 border rounded-md prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: value }} />
        </div>
      )}
    </div>
  );
}
