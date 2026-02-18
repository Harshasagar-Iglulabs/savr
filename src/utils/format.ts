export function formatPrice(price: number): string {
  return `₹${price.toFixed(2)}`;
}

export function formatSavings(actualPrice: number, discountedPrice: number): string {
  const savings = Math.max(0, actualPrice - discountedPrice);
  return `₹${savings.toFixed(2)}`;
}
