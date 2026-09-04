import { useEffect, useState, type RefObject } from "react";

export type ArticleHeading = { id: string; text: string; level: number; num: number };

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

/**
 * Scans an article for h2/h3, gives every heading a stable id when it does not
 * have one, and tracks which section is currently being read. Used by the docs
 * "on this page" rail and the legal pages' contents column.
 */
export function useArticleHeadings(ref: RefObject<HTMLElement | null>) {
  const [headings, setHeadings] = useState<ArticleHeading[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("h2, h3"));
    let counter = 0;
    const items: ArticleHeading[] = nodes.map((node, index) => {
      const text = (node.textContent ?? "").trim();
      if (!node.id) node.id = slugify(text) || `section-${index + 1}`;
      const level = node.tagName === "H2" ? 2 : 3;
      if (level === 2) counter += 1;
      return { id: node.id, text, level, num: level === 2 ? counter : 0 };
    });
    setHeadings(items);

    if (!("IntersectionObserver" in window) || items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-110px 0px -68% 0px", threshold: 0 }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
    /* The article content of a page never changes after mount. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { headings, activeId };
}
