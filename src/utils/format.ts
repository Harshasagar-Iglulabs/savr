const priceFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(price: number): string {
  return `₹${priceFormatter.format(price)}`;
}

export function formatSavings(actualPrice: number, discountedPrice: number): string {
  const savings = Math.max(0, actualPrice - discountedPrice);
  return `₹${priceFormatter.format(savings)}`;
}
