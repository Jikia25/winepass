import type { Bundle } from '@/types/database'

/** Lowest bundle price for a château, used as the "from €X" headline price. */
export function priceFrom(bundles?: Pick<Bundle, 'price'>[] | null): number | null {
  if (!bundles?.length) return null
  return Math.min(...bundles.map((b) => b.price))
}
