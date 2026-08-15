import type { JSONContent } from "@tiptap/react";
import type { ReactNode } from "react";

function renderNode(node: JSONContent, key: string): ReactNode {
  const children = node.content?.map((child, index) => renderNode(child, `${key}-${index}`));
  let content: ReactNode = node.text ?? children;
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") content = <strong>{content}</strong>;
    if (mark.type === "italic") content = <em>{content}</em>;
    if (mark.type === "strike") content = <s>{content}</s>;
    if (mark.type === "code") content = <code>{content}</code>;
  }
  switch (node.type) {
    case "doc": return <>{children}</>;
    case "paragraph": return <p key={key}>{content}</p>;
    case "heading": {
      const level = Number(node.attrs?.level) === 3 ? 3 : 2;
      return level === 3 ? <h3 key={key}>{content}</h3> : <h2 key={key}>{content}</h2>;
    }
    case "blockquote": return <blockquote key={key}>{children}</blockquote>;
    case "bulletList": return <ul key={key}>{children}</ul>;
    case "orderedList": return <ol key={key}>{children}</ol>;
    case "listItem": return <li key={key}>{children}</li>;
    case "hardBreak": return <br key={key} />;
    case "horizontalRule": return <hr key={key} />;
    case "text": return <span key={key}>{content}</span>;
    default: return children ? <span key={key}>{children}</span> : null;
  }
}

export function RichTextDocument({ document }: { document: JSONContent }) {
  return <>{renderNode(document, "root")}</>;
}

