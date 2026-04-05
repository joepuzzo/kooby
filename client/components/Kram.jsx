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

  /** Hash → expand path to row + onSelect. */
  useEffect(() => {
    const handleHashChange = () => {
      const raw = window.location.hash.slice(1);
      if (!raw) return;

      let decodedHash = raw;
      try {
        decodedHash = decodeURIComponent(raw);
      } catch {
        /* keep raw */
      }

      const row = flatRows.find((r) => rowMatchesHash(r, decodedHash));
      if (!row) return;

      setSelectedNavIndex(row.index);
      const cb = onSelectRef.current;
      if (cb) {
        cb({ item: row.item, depth: row.depth, index: row.index });
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [flatRows, setSelectedNavIndex]);

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
