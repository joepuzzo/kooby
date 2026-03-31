import mermaid from "mermaid";
import React, { useEffect, useRef } from "react";

// Custom comparison function for React.memo
const arePropsEqual = (prevProps, nextProps) => {
  // Convert children to string for comparison
  const prevChildren =
    typeof prevProps.children === "string"
      ? prevProps.children
      : React.Children.toArray(prevProps.children).join("");

  const nextChildren =
    typeof nextProps.children === "string"
      ? nextProps.children
      : React.Children.toArray(nextProps.children).join("");

  return prevChildren === nextChildren;
};

export const Mermaid = React.memo(({ children }) => {
  const mermaidRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default"
    });

    const renderMermaid = async () => {
      if (mermaidRef.current && children) {
        try {
          let mermaidCode = children;
          if (React.isValidElement(children) || Array.isArray(children)) {
            mermaidCode = React.Children.toArray(children)
              .map((child) =>
                typeof child === "string" ? child : child.props?.children || ""
              )
              .join("");
          } else if (typeof children !== "string") {
            mermaidCode = String(children);
          }

          // Clean up the mermaid code
          mermaidCode = mermaidCode
            .replace(/\<mermaid\>/g, "")
            .replace(/\<\/mermaid\>/g, "")
            .trim();

          // Remove any extra newlines at the beginning or end
          mermaidCode = mermaidCode.replace(/^\n+|\n+$/g, "");

          // Ensure proper line breaks between nodes
          mermaidCode = mermaidCode.replace(/\n\s*\n/g, "\n");

          // List of special characters that need quoting in Mermaid node text
          const specialChars = [
            { char: "()", example: "Installbase (WARP)" },
            { char: "||", example: "Activated || Upcoming" },
            { char: '"', example: "TRT_ID: 27491" },
            { char: "/", example: "/installbase/api" }
            // Add more special characters here as they are discovered during testing
            // Format: { char: "special_char", example: "example text" }
          ];

          // First, remove any escaped quotes from the text
          mermaidCode = mermaidCode.replace(/\\"/g, '"');

          // Remove any existing quotes around node text to avoid double-quoting
          mermaidCode = mermaidCode.replace(/\["([^"]+)"\]/g, "[$1]");

          // Create regex pattern from special characters
          const specialCharsPattern = specialChars
            .map(({ char }) => char.split("").join("\\"))
            .join("|");

          // Find text in square brackets containing special characters and wrap in quotes
          if (specialCharsPattern) {
            mermaidCode = mermaidCode.replace(
              new RegExp(`\\[([^\\]]*[${specialCharsPattern}][^\\]]*)\\]`, "g"),
              '["$1"]'
            );
          }

          console.log("mermaidCode\n\n", mermaidCode);

          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, mermaidCode);
          mermaidRef.current.innerHTML = svg;
        } catch (error) {
          console.error("Mermaid rendering error:", error);
          mermaidRef.current.innerHTML = `<pre><code class="mermaid-error">${error.message}</code></pre>`;
        }
      }
    };

    renderMermaid();
  }, [children]);

  return <div ref={mermaidRef} className="mermaid" />;
}, arePropsEqual);
