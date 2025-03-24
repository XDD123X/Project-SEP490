import parse from "html-react-parser";

export function RichTextViewer({ content }) {
  return <div className="prose dark:prose-invert max-w-none">{parse(content)}</div>;
}
