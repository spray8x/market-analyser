/* ═══════════════════════════════════════════════════
   PRICING.JS — deterministic ±5% vendor price offset
   Prevents a perfect market without backend
   ═══════════════════════════════════════════════════ */

const Pricing = (() => {

  // Linear Congruential Generator — deterministic per (vendorId, productId) pair
  // Same vendor always sees same offset. Different vendors see different offsets.
  function lcgSeed(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h;
  }

  function lcgNext(seed) {
    return ((seed * 1664525 + 1013904223) >>> 0) / 0xffffffff;
  }

  /**
   * Returns a vendor-specific price for a product.
   * Offset is ±5%, stable per (vendorId × productId) pair.
   * @param {number} basePrice
   * @param {string} productId
   * @param {string} vendorId
   * @returns {number}
   */
  function getVendorPrice(basePrice, productId, vendorId = 'V001') {
    const seed = lcgSeed(vendorId + ':' + productId);
    const rng  = lcgNext(seed);            // 0..1
    const offset = (rng - 0.5) * 0.10;    // -0.05 to +0.05
    return Math.round(basePrice * (1 + offset));
  }

  /**
   * Returns prices from all 5 simulated vendors for a product.
   * Used in vendor dashboard competitor view.
   */
  function getAllVendorPrices(basePrice, productId, vendors) {
    return vendors.map(v => ({
      vendor_id: v.id,
      vendor_name: v.name,
      city: v.city,
      price: getVendorPrice(basePrice, productId, v.id),
      rating: v.rating,
      verified: v.verified
    })).sort((a, b) => a.price - b.price);
  }

  /**
   * Apply city multiplier on top of vendor price.
   * @param {number} price
   * @param {string} city
   * @param {object} multipliers — city_multipliers map from products.json
   */
  function applyCityMultiplier(price, city, multipliers) {
    const m = multipliers[city] || 1.0;
    return Math.round(price * m);
  }

  /**
   * Format price in Indian number system (lakhs/crore).
   * e.g. 28500 → "₹28,500"
   */
  function formatINR(amount) {
    if (amount === null || amount === undefined) return '—';
    return '₹' + amount.toLocaleString('en-IN');
  }

  /**
   * Generate a "market recommended" price band for vendor dashboard.
   * Band is basePrice ± 7% shown as a range.
   */
  function recommendedBand(basePrice) {
    return {
      low:  Math.round(basePrice * 0.93),
      high: Math.round(basePrice * 1.07)
    };
  }

  return { getVendorPrice, getAllVendorPrices, applyCityMultiplier, formatINR, recommendedBand };
})();

// Expose globally
window.Pricing = Pricing;
