import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import "./Kram.css";

/** @typedef {{ label: string; items?: NavItem[] }} NavItem */

/** Default palette (cycles). */
const DEFAULT_COLORS = [
  // "#777e71",
  "#3b63fb",
  // "#fbb01b",
  // "#eb432f",
  // "#863ee1",
  // "#e13e8c",
  // "#12bb00",
];

/**
 * Depth-first flattening of nav tree for a vertical strip order.
 * @param {NavItem[]} items
 * @param {number} depth
 * @param {{ item: NavItem; depth: number }[]} out
 */
function flattenNavItems(items, depth, out) {
  if (!items?.length) return out;
  for (const item of items) {
    out.push({ item, depth });
    if (item.items?.length) {
      flattenNavItems(item.items, depth + 1, out);
    }
  }
  return out;
}

/** Sum of offsetTop from `el` up to but not including `container` (must be an offsetParent ancestor). */
function offsetTopWithinScrollContainer(el, container) {
  let y = 0;
  let n = el;
  while (n && n !== container) {
    y += n.offsetTop;
    n = n.offsetParent;
  }
  return n === container ? y : null;
}

/**
 * @param {object} props
 * @param {{ items: NavItem[] }} props.nav — tree with `items` at root (see temp.js)
 * @param {string[]} [props.colors] — pill background colors, cycled by index
 * @param {number} [props.baseWidth] — pill width in px at depth 0 (default 120)
 * @param {number} [props.widthStep] — width subtracted per nesting level (default 10)
 * @param {number} [props.baseFolderHeight] — pill height in px at depth 0 (default 40)
 * @param {number} [props.heightStep] — height subtracted per nesting level (default 10)
 * @param {number} [props.minFolderHeight] — minimum pill height in px (default 22)
 * @param {number} [props.indentStep] — left offset per depth in px (default 10)
 * @param {boolean} [props.hideLabels] — hide pill text until hover or focus (default false)
 * @param {boolean} [props.fadeLabels] — dim pill text until hover or focus; ignored if hideLabels (default false)
 * @param {(detail: { index: number; item: NavItem; depth: number }) => void} [props.onSelect] — click / activate
 * @param {React.MutableRefObject<{ setSelectedNavIndex: (index: number | null) => void } | null>} [props.apiRef] — imperative API (e.g. drive selection from Kooby `onUpdate`)
 * @param {string} [props.className]
 */
export function Kram({
  nav,
  colors = DEFAULT_COLORS,
  baseWidth = 120,
  widthStep = 10,
  baseFolderHeight = 40,
  heightStep = 10,
  minFolderHeight = 22,
  indentStep = 10,
  hideLabels = false,
  fadeLabels = false,
  onSelect,
  apiRef,
  className = "",
}) {
  console.log("RENDER");

  const rows = useMemo(() => {
    const items = nav?.items ?? [];
    return flattenNavItems(items, 0, []);
  }, [nav]);

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(
    /** @type {number | null} */ (null),
  );
  const navRef = useRef(null);
  const pillRefs = useRef([]);
  const scrollRaf = useRef(0);
  const prevScrollOpacityRef = useRef(/** @type {number[] | null} */ (null));
  const skipLoopAdjustRef = useRef(false);
  /** Prevents infinite-loop scroll correction from fighting programmatic scroll (center-on-select). */
  const suppressLoopUntilRef = useRef(0);
  const [scrollMetrics, setScrollMetrics] = useState(
    /** @type {{ opacity: number; scale: number }[]} */ ([]),
  );

  const updateScrollProximity = useCallback(() => {
    const root = navRef.current;
    if (!root || rows.length === 0) return;

    const navRect = root.getBoundingClientRect();
    const viewportCenterY = navRect.top + navRect.height / 2;
    const halfView = navRect.height / 2;
    const maxDist = halfView + 56;
    const n = rows.length;

    const minOpacity = 0.06;

    const next = new Array(n);
    for (let logical = 0; logical < n; logical++) {
      let bestOpacity = minOpacity;
      let sawPill = false;

      for (const pillIndex of [logical, logical + n]) {
        const pill = pillRefs.current[pillIndex];
        if (!pill) continue;
        sawPill = true;
        const layoutEl = pill.parentElement ?? pill;
        const rect = layoutEl.getBoundingClientRect();
        const cy = rect.top + rect.height / 2;
        const dist = Math.abs(cy - viewportCenterY);
        const t = Math.min(1, dist / maxDist);
        const near = 1 - t;
        const shaped = Math.pow(Math.max(0, near), 1.65);
        const opacity = minOpacity + (1 - minOpacity) * shaped;
        if (opacity > bestOpacity) {
          bestOpacity = opacity;
        }
      }
      // Scroll "pop" scale removed: scaling changed getBoundingClientRect() and caused a
      // feedback loop (jitter / blur) every frame. Fade uses opacity only.
      next[logical] = sawPill
        ? { opacity: bestOpacity, scale: 1 }
        : { opacity: 1, scale: 1 };
    }
    const prevOpacities = prevScrollOpacityRef.current;
    if (
      prevOpacities &&
      prevOpacities.length === next.length &&
      next.every(
        (m, i) => Math.abs(m.opacity - (prevOpacities[i] ?? 0)) < 0.025,
      )
    ) {
      return;
    }
    prevScrollOpacityRef.current = next.map((m) => m.opacity);
    setScrollMetrics(next);
  }, [rows.length]);

  const adjustLoopScroll = useCallback(() => {
    const el = navRef.current;
    if (!el || rows.length === 0) return;
    if (Date.now() < suppressLoopUntilRef.current) return;
    if (skipLoopAdjustRef.current) {
      skipLoopAdjustRef.current = false;
      return;
    }
    if (el.scrollHeight <= el.clientHeight + 1) return;
    const total = el.scrollHeight;
    const half = total / 2;
    if (half < 2) return;
    const buf = 2;
    const st = el.scrollTop;
    if (st >= half - buf) {
      skipLoopAdjustRef.current = true;
      el.scrollTop = st - half;
    } else if (st <= buf) {
      skipLoopAdjustRef.current = true;
      el.scrollTop = st + half;
    }
  }, [rows.length]);

  useLayoutEffect(() => {
    pillRefs.current = pillRefs.current.slice(0, rows.length * 2);
  }, [rows.length]);

  /** Infinite strip must not sit at scrollTop≈0: loop math only allows scrolling down until `adjustLoopScroll` runs; before that, scrollHeight may still be settling. */
  const ensureLoopBaseline = useCallback(() => {
    const el = navRef.current;
    if (!el || rows.length === 0) return;
    if (el.scrollHeight <= el.clientHeight + 1) return;
    const half = el.scrollHeight / 2;
    if (half < 2) return;
    if (el.scrollTop <= 2) {
      suppressLoopUntilRef.current = Date.now() + 50;
      el.scrollTop = half;
    }
  }, [rows.length]);

  useLayoutEffect(() => {
    const run = () => {
      ensureLoopBaseline();
      adjustLoopScroll();
      updateScrollProximity();
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  }, [
    rows.length,
    ensureLoopBaseline,
    adjustLoopScroll,
    updateScrollProximity,
  ]);

  useLayoutEffect(() => {
    const root = navRef.current;
    if (!root) return undefined;

    const schedule = () => {
      if (scrollRaf.current) return;
      scrollRaf.current = requestAnimationFrame(() => {
        scrollRaf.current = 0;
        adjustLoopScroll();
        updateScrollProximity();
      });
    };

    root.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      root.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
    };
  }, [adjustLoopScroll, updateScrollProximity]);

  const onEnter = useCallback((index) => {
    setHoveredIndex(index);
  }, []);

  const onLeaveNav = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const scrollPillIntoNavCenter = useCallback(
    (buttonEl) => {
      const nav = navRef.current;
      if (!nav || !buttonEl) return;
      ensureLoopBaseline();

      const topInNav = offsetTopWithinScrollContainer(buttonEl, nav);
      const h = buttonEl.offsetHeight;
      let target;
      if (topInNav != null && Number.isFinite(topInNav)) {
        target = topInNav + h / 2 - nav.clientHeight / 2;
      } else {
        const navRect = nav.getBoundingClientRect();
        const elRect = buttonEl.getBoundingClientRect();
        target =
          nav.scrollTop +
          (elRect.top + elRect.height / 2 - (navRect.top + navRect.height / 2));
      }
      const maxScroll = Math.max(0, nav.scrollHeight - nav.clientHeight);
      const nextTop = Math.max(0, Math.min(maxScroll, target));

      suppressLoopUntilRef.current = Date.now() + 450;
      nav.scrollTo({
        top: nextTop,
        behavior: "smooth",
      });
    },
    [ensureLoopBaseline],
  );

  const handleSelect = useCallback(
    (logicalIndex, item, depth, event) => {
      setSelectedIndex(logicalIndex);
      onSelect?.({ index: logicalIndex, item, depth });
      const btn = event.currentTarget;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollPillIntoNavCenter(btn);
        });
      });
    },
    [onSelect, scrollPillIntoNavCenter],
  );

  const setSelectedNavIndex = useCallback(
    (index) => {
      if (index === null || index === undefined) {
        setSelectedIndex(null);
        return;
      }
      const idx = Number(index);
      if (!Number.isFinite(idx) || idx < 0 || idx >= rows.length) return;
      setSelectedIndex(idx);
      const btn = pillRefs.current[idx];
      if (!btn) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollPillIntoNavCenter(btn);
        });
      });
    },
    [rows.length, scrollPillIntoNavCenter],
  );

  if (apiRef) {
    apiRef.current = {
      setSelectedNavIndex,
    };
  }

  const rootClass = [
    "kram",
    hideLabels && "kram--hide-labels",
    !hideLabels && fadeLabels && "kram--fade-labels",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav
      ref={navRef}
      className={rootClass}
      aria-label="Site"
      onMouseLeave={onLeaveNav}
      onFocusOut={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setHoveredIndex(null);
        }
      }}
    >
      <ul style={{ margin: 0, padding: 0, display: "contents" }}>
        {[0, 1].flatMap((copy) =>
          rows.map((row, index) => {
            const loopIndex = copy * rows.length + index;
            const logicalIndex = index;
            const { item, depth } = row;
            const label = item.label;
            const width = Math.max(44, baseWidth - depth * widthStep);
            const height = Math.max(
              minFolderHeight,
              baseFolderHeight - depth * heightStep,
            );
            const marginLeft = depth * indentStep;
            const bg = colors[logicalIndex % colors.length];

            let proximityClass = "";
            let hoverScale = 1;
            let hoverTx = 0;

            if (hoveredIndex !== null) {
              const dist = Math.abs(logicalIndex - hoveredIndex);
              if (dist === 0) {
                proximityClass = "kram-pill--hover";
                hoverScale = 1.22;
                hoverTx = 10;
              } else if (dist === 1) {
                proximityClass = "kram-pill--near-1";
                hoverScale = 1.12;
                hoverTx = 6;
              } else if (dist === 2) {
                proximityClass = "kram-pill--near-2";
                hoverScale = 1.06;
                hoverTx = 3;
              }
            }

            const m = scrollMetrics[logicalIndex];
            const scrollOpacity = m?.opacity ?? 1;
            const inHoverCluster =
              hoveredIndex !== null &&
              Math.abs(logicalIndex - hoveredIndex) <= 2;
            const isSelected = selectedIndex === logicalIndex;
            const opacity = inHoverCluster || isSelected ? 1 : scrollOpacity;
            const transform = `scale(${hoverScale}) translateX(${hoverTx}px) translateZ(0)`;

            return (
              <li
                key={`kram-${loopIndex}`}
                style={{ marginLeft, listStyle: "none" }}
              >
                <button
                  type="button"
                  ref={(el) => {
                    pillRefs.current[loopIndex] = el;
                  }}
                  className={[
                    "kram-pill",
                    proximityClass,
                    isSelected && "kram-pill--selected",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    width,
                    height,
                    backgroundColor: bg,
                    transform,
                    opacity,
                  }}
                  tabIndex={copy === 1 ? -1 : undefined}
                  aria-hidden={copy === 1 ? true : undefined}
                  aria-label={copy === 0 ? label : undefined}
                  aria-current={copy === 0 && isSelected ? "page" : undefined}
                  onMouseEnter={() => onEnter(logicalIndex)}
                  onFocus={() => onEnter(logicalIndex)}
                  onClick={(e) => handleSelect(logicalIndex, item, depth, e)}
                >
                  <span className="kram-pill__label">{label}</span>
                </button>
              </li>
            );
          }),
        )}
      </ul>
    </nav>
  );
}
