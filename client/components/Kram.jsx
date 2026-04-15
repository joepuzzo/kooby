import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  TreeView,
  TreeViewItem,
  TreeViewItemContent,
} from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import "./Kram.css";

/** @typedef {{ label: string; items?: NavItem[]; id?: string | number; href?: string }} NavItem */

/**
 * Depth-first flatten (same order as kram tool / system prompt): parent, then subtree.
 * @param {NavItem[]} items
 * @param {number} depth
 * @param {string} pathPrefix
 * @param {{ item: NavItem; depth: number; index: number; id: string }[]} out
 */
function flattenNavRows(items, depth, pathPrefix, out) {
  if (!items?.length) return out;
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const id = pathPrefix !== "" ? `${pathPrefix}.${index}` : `${index}`;
    const rowIndex = out.length;
    out.push({ item, depth, index: rowIndex, id });
    if (item.items?.length) {
      flattenNavRows(item.items, depth + 1, id, out);
    }
  }
  return out;
}

/**
 * Extract parameters from a URL hash against a pattern
 * @param {string} pattern - Pattern like "about/people/:personId"
 * @param {string} hash - Actual hash like "about/people/7"
 * @returns {object|null} - Params object like { personId: "7" } or null if no match
 */
function extractParams(pattern, hash) {
  const patternParts = pattern.split("/");
  const hashParts = hash.split("/");

  if (patternParts.length !== hashParts.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      const paramName = patternParts[i].slice(1);
      params[paramName] = hashParts[i];
    } else if (patternParts[i] !== hashParts[i]) {
      return null;
    }
  }

  return params;
}

/**
 * Match URL hash (decoded) to a nav row — same idea as old SideNav + findItemByLabel,
 * extended for optional `item.href`.
 * @param {{ item: NavItem; depth: number; index: number; id: string }} row
 * @param {string} decodedHash fragment without leading #, after decodeURIComponent
 */
function rowMatchesHash(row, decodedHash) {
  const { item } = row;
  if (item.href != null && item.href !== "") {
    const frag = item.href.startsWith("#") ? item.href.slice(1) : item.href;
    let decodedFrag = frag;
    try {
      decodedFrag = decodeURIComponent(frag);
    } catch {
      /* keep frag */
    }
    return decodedFrag === decodedHash || frag === decodedHash;
  }
  return item.label === decodedHash;
}

/**
 * @param {object} props
 * @param {{ items: NavItem[] }} props.nav
 * @param {(detail: { index: number; item: NavItem; depth: number }) => void} [props.onSelect]
 * @param {import('react').MutableRefObject<{ setSelectedNavIndex: (index: number | null) => void } | null>} [props.apiRef]
 * @param {string} [props.className]
 */
function NavTreeItems({ items, pathPrefix }) {
  if (!items?.length) return null;
  return items.map((item, index) => {
    const id = pathPrefix !== "" ? `${pathPrefix}.${index}` : `${index}`;
    return (
      <TreeViewItem key={id} id={id} textValue={item.label} href={item.href}>
        <TreeViewItemContent>{item.label}</TreeViewItemContent>
        {item.items?.length ? (
          <NavTreeItems items={item.items} pathPrefix={id} />
        ) : null}
      </TreeViewItem>
    );
  });
}

export function Kram({ nav, onSelect, apiRef, className = "" }) {
  const items = nav?.items ?? [];

  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const flatRows = useMemo(() => flattenNavRows(items, 0, "", []), [items]);

  const allExpandableIds = useMemo(() => {
    const ids = [];
    function walk(navItems, pathPrefix) {
      navItems.forEach((item, index) => {
        const id = pathPrefix !== "" ? `${pathPrefix}.${index}` : `${index}`;
        if (item.items?.length) {
          ids.push(id);
          walk(item.items, id);
        }
      });
    }
    walk(items, "");
    return ids;
  }, [items]);

  const [expandedKeys, setExpandedKeys] = useState(
    () => new Set(allExpandableIds),
  );

  useEffect(() => {
    setExpandedKeys(new Set(allExpandableIds));
  }, [allExpandableIds]);

  /** Expands ancestors so the row at `navIndex` is visible (e.g. Kooby kram tool). */
  const setSelectedNavIndex = useCallback(
    (navIndex) => {
      if (navIndex == null) return;
      const row = flatRows[navIndex];
      if (!row) return;
      const parts = row.id.split(".");
      const ancestors = [];
      for (let i = 1; i < parts.length; i++) {
        ancestors.push(parts.slice(0, i).join("."));
      }
      if (!ancestors.length) return;
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        for (const a of ancestors) {
          next.add(a);
        }
        return next;
      });
    },
    [flatRows],
  );

  // useEffect(() => {
  //   if (!apiRef) return;
  //   apiRef.current = {
  //     setSelectedNavIndex,
  //   };
  //   return () => {
  //     apiRef.current = null;
  //   };
  // }, [apiRef, setSelectedNavIndex]);

  useEffect(() => {
    if (!onSelect) return;

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the #
      if (!hash) return; // Decode URL-encoded hash (e.g., "Product%201" -> "Product 1")

      const decodedHash = decodeURIComponent(hash); // First, try to find exact match

      let row = flatRows.find((r) => rowMatchesHash(r, decodedHash));
      let matchedItem = row?.item;
      let params = {}; // If no exact match, check for dynamic routes (item.item with params)

      if (!row) {
        for (const r of flatRows) {
          if (r.item.item?.href) {
            const pattern = r.item.item.href.startsWith("#")
              ? r.item.item.href.slice(1)
              : r.item.item.href;
            const extractedParams = extractParams(pattern, decodedHash);
            if (extractedParams) {
              row = r;
              params = extractedParams; // Use the dynamic item configuration
              matchedItem = { ...r.item.item };
              break;
            }
          }
        }
      }

      if (!row || !matchedItem) return;

      const cb = onSelectRef.current;
      if (cb) {
        // If instructions is a function, call it with params to get the string
        if (typeof matchedItem.instructions === "function") {
          matchedItem = {
            ...matchedItem,
            instructions: matchedItem.instructions(params),
          };
        }

        console.log("Selected", {
          item: matchedItem,
          depth: row.depth,
          index: row.index,
          params,
        });
        cb({ item: matchedItem, depth: row.depth, index: row.index });
      }
    }; // Listen for hash changes

    window.addEventListener("hashchange", handleHashChange); // Call on mount if hash exists

    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [nav]);

  return (
    <div
      className={`kram-tree-root ${className}`.trim()}
      style={{
        position: "fixed",
        left: "20px",
        top: "max(16px, 8vh)",
        padding: "16px",
        width: "min(260px, 42vw)",
        minWidth: 0,
        /* Virtualizer needs a definite height; use vh (not only max-height) so first paint isn’t 0 */
        height: "80vh",
        maxHeight: "80dvh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TreeView
          aria-label="Site navigation"
          selectionMode="none"
          expandedKeys={expandedKeys}
          onExpandedChange={setExpandedKeys}
          styles={style({
            width: "full",
            height: "full",
            minHeight: 0,
            minWidth: 0,
          })}
        >
          <NavTreeItems items={items} pathPrefix="" />
        </TreeView>
      </div>
    </div>
  );
}
