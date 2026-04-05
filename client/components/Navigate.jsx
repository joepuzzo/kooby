import React, { useEffect, useMemo, useRef } from "react";
import { useKoobyMessage } from "./Kooby";

function parseChildren(children) {
  if (children == null) {
    return null;
  }
  const raw =
    typeof children === "string"
      ? children
      : React.Children.toArray(children).join("");
  try {
    return JSON.parse(String(raw).trim());
  } catch {
    return null;
  }
}

/**
 * Navigates the browser to `href` once when mounted (or when `href` first becomes non-empty).
 * Renders nothing.
 */
export function Navigate({ children }) {
  const didNavigate = useRef(false);

  const { currentMessage, totalMessages, index } = useKoobyMessage();

  const parsed = useMemo(() => parseChildren(children), [children]);

  let href = parsed?.href;

  // Make sure href has # as first character if it already does not
  href = href?.startsWith("#") ? href : `#${href}`;

  useEffect(() => {
    if (children) {
      // console.log("Children", children);
      // console.log("Parsed", parsed);
      // console.log("Current Message", currentMessage);
      // console.log("Did Navigate", didNavigate.current);
      // console.log("Href", href);
      // console.log("Total Messages", totalMessages);
      // console.log("Index", index);

      // Dont re navigate and also only navigate if we are the latest message
      if (didNavigate.current || !currentMessage) return;
      if (href == null || href === "") return;

      console.log("Navigating to", href);
      console.log("Current Message", currentMessage);

      didNavigate.current = true;
      window.location.assign(href);
    }
  }, [href]);

  if (!children) return null;

  return <span>...</span>;
}
