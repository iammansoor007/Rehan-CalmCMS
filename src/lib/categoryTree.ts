import type { Category } from "@/types/cms";

export type CategoryNode = Category & { depth: number };

/** Every category nested (at any depth) under `slug`. */
export function descendantSlugs(categories: Category[], slug: string): string[] {
  const result: string[] = [];
  const queue = [slug];
  while (queue.length) {
    const current = queue.shift() as string;
    for (const c of categories) {
      if (c.parent === current && !result.includes(c.slug) && c.slug !== slug) {
        result.push(c.slug);
        queue.push(c.slug);
      }
    }
  }
  return result;
}

/** Parents first, each followed by its children — with a `depth` for indentation. */
export function orderCategories(categories: Category[]): CategoryNode[] {
  const slugs = new Set(categories.map((c) => c.slug));
  const out: CategoryNode[] = [];
  const seen = new Set<string>();

  const walk = (parent: string | undefined, depth: number) => {
    for (const c of categories) {
      const isRoot = !c.parent || !slugs.has(c.parent);
      const belongs = parent === undefined ? isRoot : c.parent === parent;
      if (belongs && !seen.has(c.slug)) {
        seen.add(c.slug);
        out.push({ ...c, depth });
        walk(c.slug, depth + 1);
      }
    }
  };
  walk(undefined, 0);
  return out;
}

/**
 * Resolves an admin "which categories to show" selection. An empty selection means
 * every category (parents first); otherwise only the chosen ones, in the chosen order.
 * The built-in "all" archive is never included.
 */
export function pickCategories(categories: Category[], slugs: string[] | undefined): CategoryNode[] {
  const real = categories.filter((c) => c.slug !== "all");
  if (!slugs || slugs.length === 0) return orderCategories(real);

  const chosen = slugs
    .map((slug) => real.find((c) => c.slug === slug))
    .filter((c): c is Category => !!c);
  const chosenSlugs = new Set(chosen.map((c) => c.slug));
  return chosen.map((c) => ({
    ...c,
    depth: c.parent && chosenSlugs.has(c.parent) ? 1 : 0,
  }));
}
