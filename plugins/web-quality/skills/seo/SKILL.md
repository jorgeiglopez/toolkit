---
name: seo
description: Optimize for search engine visibility and ranking. Use when asked to improve SEO, optimize for search, fix meta tags, add structured data, optimize a sitemap, or do search engine optimization.
---

# SEO optimization

Technical SEO, on-page optimization, and structured data. Based on Lighthouse SEO audits and Google Search guidelines.

## SEO fundamentals

| Factor | Influence | This skill |
|--------|-----------|------------|
| Content quality & relevance | ~40% | Partial (structure) |
| Backlinks & authority | ~25% | Out of scope |
| Technical SEO | ~15% | Covered |
| Page experience (Core Web Vitals) | ~10% | See [core-web-vitals](../core-web-vitals/SKILL.md) |
| On-page SEO | ~10% | Covered |

---

## Technical SEO

**robots.txt:**
```text
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
# Don't block resources needed for rendering (e.g. /static/)
Sitemap: https://example.com/sitemap.xml
```

**Meta robots and canonical:**
```html
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://example.com/current-page">
```
Self-referencing canonical on every page prevents duplicate-content issues; use `rel="prev"`/`rel="next"` for pagination instead of canonicalizing every page to page 1.

**XML sitemap:** list only canonical, indexable URLs; update `lastmod` on content change; max 50,000 URLs / 50MB per file (use a sitemap index above that); submit to Search Console.
```xml
<url>
  <loc>https://example.com/products</loc>
  <lastmod>2024-01-14</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

**URL structure:** hyphens not underscores, lowercase, short (< 75 chars), HTTPS always.
```
Good: https://example.com/products/blue-widget
Bad:  https://example.com/p?id=12345
```

**Security headers** (also SEO trust signals): `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`.

---

## On-page SEO

**Title tags:** 50-60 characters, primary keyword near the start, unique per page, brand at the end.
```html
<title>Blue Widgets for Sale | Premium Quality | Example Store</title>
```

**Meta descriptions:** 150-160 characters, unique per page, includes a call-to-action.
```html
<meta name="description" content="Shop premium blue widgets with free shipping. 30-day returns. Rated 4.9/5 by 10,000+ customers.">
```

**Heading structure:** single `<h1>` per page, logical hierarchy, no skipped levels.
```html
<h1>Blue Widgets - Premium Quality</h1>
  <h2>Product Features</h2>
    <h3>Durability</h3>
  <h2>Customer Reviews</h2>
```

**Image SEO:** descriptive filenames, alt text describes content, compressed WebP/AVIF, lazy-loaded below the fold.
```html
<img src="blue-widget-product-photo.webp"
     alt="Blue widget with chrome finish, side view showing control panel"
     width="800" height="600" loading="lazy">
```

**Internal linking:** descriptive anchor text, not "click here".
```html
<a href="/products/blue-widgets">Browse our blue widget collection</a>
```

---

## Structured data (JSON-LD)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Example Company",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png"
}
</script>
```
Full schemas for Article, Product, FAQ, and Breadcrumbs: [references/structured-data.md](references/structured-data.md). Validate at [Google Rich Results Test](https://search.google.com/test/rich-results) or [Schema.org Validator](https://validator.schema.org/).

## Mobile and international SEO

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```
Tap targets ≥ 48px, body text ≥ 16px. For multi-language sites, set `<html lang="...">` and hreflang alternates:
```html
<link rel="alternate" hreflang="es" href="https://example.com/es/page">
<link rel="alternate" hreflang="x-default" href="https://example.com/page">
```

---

## SEO audit checklist

**Critical:** HTTPS enabled · robots.txt allows crawling · no `noindex` on important pages · unique title tags · single `<h1>` per page.

**High:** meta descriptions present · sitemap submitted · canonical URLs set · mobile-responsive · Core Web Vitals passing.

**Medium:** structured data implemented · internal linking strategy · image alt text · descriptive URLs · breadcrumb navigation.

**Ongoing:** fix Search Console crawl errors · update sitemap on content changes · monitor ranking changes · check for broken links.

## Tools

| Tool | Use |
|------|-----|
| Google Search Console | Monitor indexing, fix issues |
| Google PageSpeed Insights | Performance + Core Web Vitals |
| Rich Results Test | Validate structured data |
| Lighthouse | Full SEO audit |
| Screaming Frog | Crawl analysis |

## References

- [Google Search Central](https://developers.google.com/search) · [Schema.org](https://schema.org/)
- [core-web-vitals/SKILL.md](../core-web-vitals/SKILL.md) · [web-quality-audit/SKILL.md](../web-quality-audit/SKILL.md)
- [references/structured-data.md](references/structured-data.md) - full JSON-LD schemas
