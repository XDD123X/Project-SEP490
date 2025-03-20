import sanitizeHtml from "sanitize-html";

export function RichTextViewer({ content }) {
  const cleanContent = sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "iframe"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen"],
      img: ["src", "alt", "width", "height"],
    },
  });

  return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cleanContent }} />;
}
