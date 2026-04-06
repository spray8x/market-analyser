/* ═══════════════════════════════════════════════════
   DATA.JS — loads and caches JSON, exposes data store
   ═══════════════════════════════════════════════════ */

const DataStore = (() => {
  let _products = null;
  let _trends   = null;

  async function _fetchJSON(path) {
    const r = await fetch(path);
    if (!r.ok) throw new Error(`Failed to load ${path}: ${r.status}`);
    return r.json();
  }

  async function init() {
    [_products, _trends] = await Promise.all([
      _fetchJSON('data/products.json'),
      _fetchJSON('data/market_trends.json')
    ]);
    return { products: _products, trends: _trends };
  }

  function getProducts(filters = {}) {
    if (!_products) return [];
    let list = [..._products.products];

    if (filters.category) list = list.filter(p => p.category === filters.category);
    if (filters.subcategory) list = list.filter(p => p.subcategory === filters.subcategory);
    if (filters.brand) list = list.filter(p => p.brand === filters.brand);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (filters.maxPrice != null) list = list.filter(p => p.basePrice <= filters.maxPrice);
    if (filters.minPrice != null) list = list.filter(p => p.basePrice >= filters.minPrice);

    if (filters.sort === 'price_asc')   list.sort((a,b) => a.basePrice - b.basePrice);
    if (filters.sort === 'price_desc')  list.sort((a,b) => b.basePrice - a.basePrice);
    if (filters.sort === 'rating')      list.sort((a,b) => b.rating - a.rating);
    if (filters.sort === 'reviews')     list.sort((a,b) => b.reviews - a.reviews);

    return list;
  }

  function getProduct(id) {
    return _products?.products.find(p => p.id === id) || null;
  }

  function getCategories()    { return _products?.categories || []; }
  function getVendors()       { return _products?.vendors || []; }
  function getCityMultipliers(){ return _products?.city_multipliers || {}; }
  function getTrends()        { return _trends || null; }

  function getBrands(category = null) {
    if (!_products) return [];
    let list = _products.products;
    if (category) list = list.filter(p => p.category === category);
    return [...new Set(list.map(p => p.brand))].sort();
  }

  function getPriceRange(category = null) {
    const list = getProducts(category ? { category } : {});
    if (!list.length) return { min: 0, max: 10000 };
    const prices = list.map(p => p.basePrice);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }

  return { init, getProducts, getProduct, getCategories, getVendors,
           getCityMultipliers, getTrends, getBrands, getPriceRange };
})();

window.DataStore = DataStore;
