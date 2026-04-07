# VendorPulse

A multi-role B2B marketplace web application for buyers and vendors to browse products, compare vendor pricing, and submit quote requests. Built as a static frontend with no server-side runtime required.

---

#### Deployment:

https://market-analyser-mu.vercel.app/

## Project Structure

```
vendorpulse/
  index.html          Role selection entry point
  customer.html       Buyer marketplace view
  vendor.html         Vendor dashboard view
  css/
    base.css          Global design tokens, layout utilities, component styles
  js/
    auth.js           Role management and city persistence via localStorage
    data.js           DataStore module — product catalogue, categories, brands
    pricing.js        Pricing utilities — vendor multipliers, city adjustments, formatting
```

---

## Architecture

VendorPulse is a fully client-side application. All data is loaded and processed in the browser. There is no backend API, database, or build step.

**Module responsibilities:**

- `auth.js` — Exposes an `Auth` object that stores the active role (`customer` or `vendor`) and selected city in `localStorage`. Pages call `Auth.requireRole()` on load to guard access.
- `data.js` — Exposes a `DataStore` object initialised via `DataStore.init()`. Provides methods for retrieving products, categories, brands, vendors, price ranges, and city multipliers.
- `pricing.js` — Exposes a `Pricing` object with helpers to compute vendor-specific prices, apply city-based multipliers, retrieve all vendor prices for a product, and format currency in the Indian numbering system.

---

## Pages

### `index.html`
Entry point. Presents role selection (Buyer or Vendor). Sets role via `Auth` and redirects.

### `customer.html`
The buyer-facing marketplace. Features:

- Category filter sidebar with product counts
- Brand chip multi-select filter
- Price range slider
- Full-text search across product names and brands
- Sort by price (ascending/descending), rating, and review count
- Product grid with city-adjusted pricing
- Slide-out cart drawer with quantity controls and running total
- Product detail modal showing specifications and all vendor prices ranked lowest first
- Quote request submission (clears cart on confirm)
- City selector in the top bar that recalculates all displayed prices live

### `vendor.html`
The vendor-facing dashboard. (Refer to `vendor.html` for full feature details — not included in this analysis.)

---

## Running Locally

The application must be served over HTTP. Opening HTML files directly via the `file://` protocol will cause `DataStore.init()` to fail due to browser security restrictions on local resource loading.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

---

## Pricing Model

Base prices are stored per product in `DataStore`. The displayed price is computed in two steps:

1. A vendor-specific multiplier is applied to the base price via `Pricing.getVendorPrice(basePrice, productId, vendorId)`.
2. A city-specific multiplier is applied via `Pricing.applyCityMultiplier(price, city, cityMultipliers)`.

The vendor price list in the product detail modal shows all vendors ranked by final price, with the lowest highlighted.

---

## Security Notes

- A `Content-Security-Policy` meta tag is set on each page. It permits inline styles and scripts (`unsafe-inline`) which are required for the current architecture, but this should be reviewed before any production deployment.
- The `esc()` helper function is used throughout template literals to sanitise product data before inserting it into the DOM, reducing XSS risk from malicious data values.
- `Auth` state is stored in `localStorage`. There is no server-side session validation. Role guards are UI-only and should not be relied upon for access control in a production environment.

---

## Supported Cities

Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Ahmedabad, Pune, Kolkata

City multipliers are defined in `DataStore` and affect all displayed prices.

---

## Dependencies

No npm packages or external frameworks are required to run the application. All functionality is implemented in vanilla JavaScript.

External resources loaded at runtime:

- Google Fonts (via `fonts.googleapis.com` and `fonts.gstatic.com`) — permitted by the CSP

---

## Known Limitations

- Cart state is held in a JavaScript variable and is lost on page refresh or navigation. There is no persistence layer for cart contents.
- The `vendor.html` page is referenced in the role selection flow but was not included in this documentation pass.
- All data is static. Prices, product listings, and vendor information cannot be updated without modifying the source data in `data.js`.

