# SEO and Social Sharing Implementation

**Issue:** #22  
**Branch:** feat/seo-social-optimization  
**Date:** 2026-02-13

## Overview

This PR implements comprehensive SEO and social sharing optimization for the Accountability Dashboard, including dynamic Open Graph images, structured data, sitemaps, and social sharing functionality.

## Features Implemented

### 1. Enhanced Metadata

#### Root Layout (`src/app/layout.tsx`)
- Comprehensive metadata with keywords, authors, and creator information
- Open Graph tags for social media previews
- Twitter Card tags for X/Twitter sharing
- Robots meta tags for search engine indexing
- Site manifest for PWA support
- Structured data (JSON-LD):
  - Organization schema for Accountability Dashboard
  - WebSite schema with SearchAction

#### Home Page (`src/app/page.tsx`)
- Custom metadata override for homepage
- Optimized title and description
- Custom Open Graph and Twitter Card configurations

#### Representative Pages (`src/app/rep/[id]/page.tsx`)
- Dynamic metadata generation per representative
- Personalized titles with Say vs. Do scores
- Dynamic descriptions with key stats
- Person schema (JSON-LD) for each representative
- Breadcrumb schema for navigation
- Dynamic Open Graph image generation

### 2. Open Graph Image Generation

**API Route:** `src/app/api/og/route.tsx`

Dynamic OG image generation using `@vercel/og` with:
- Representative name, photo, and details
- Party affiliation with color-coding
- State and district information
- Say vs. Do score (when available)
- Accountability Dashboard branding
- Proper dimensions (1200x630px) for social media

**URL Parameters:**
- `name` (required) - Representative's name
- `party` - Party affiliation (D/R/I)
- `state` - State
- `district` - Congressional district (optional)
- `score` - Say vs. Do score (optional)
- `chamber` - house or senate

### 3. Sitemap Generation

**Config:** `next-sitemap.config.js`

- Automatic sitemap generation on build
- Custom priority for different page types:
  - Homepage: 1.0 (highest)
  - Branch pages (Congress/Executive/Judicial): 0.9
  - Representative pages: 0.8
  - Other pages: 0.7
- Dynamic change frequency based on page type
- Excludes API routes and test pages
- Integrated robots.txt generation

### 4. Social Sharing Component

**Component:** `src/components/SocialShare.tsx`

Interactive social sharing widget with:
- X/Twitter sharing
- Facebook sharing
- LinkedIn sharing
- Reddit sharing
- Copy-to-clipboard functionality
- Visual feedback on copy
- Pre-filled share text with key stats

**Usage:**
```tsx
<SocialShare
  title="Page Title"
  text="Share text with context"
  url="https://example.com/page"
/>
```

### 5. Static Assets

#### `public/site.webmanifest`
- PWA manifest for app installation
- Theme colors and app metadata

## Testing

### New Test Files

1. **`src/components/SocialShare.test.tsx`**
   - Tests all share button functionality
   - Validates URL encoding
   - Tests clipboard interaction
   - Verifies error handling

2. **`src/app/api/og/route.test.ts`**
   - Tests OG image API endpoint
   - Validates parameter handling
   - Tests error scenarios
   - Verifies party color logic

### Running Tests

```bash
npm run test:run
```

## Build Integration

The sitemap is automatically generated on build via the `postbuild` script:

```json
{
  "scripts": {
    "postbuild": "next-sitemap"
  }
}
```

## SEO Best Practices Implemented

✅ Proper meta tags on all pages  
✅ Dynamic Open Graph images  
✅ Structured data (JSON-LD)  
✅ XML sitemap  
✅ Robots.txt  
✅ Social sharing functionality  
✅ Mobile-friendly meta tags  
✅ Canonical URLs  
✅ Image alt text  
✅ Semantic HTML structure  
✅ Performance optimization (lazy loading, code splitting)

## Validation Tools

Use these tools to validate the implementation:

- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Structured Data Testing Tool:** https://validator.schema.org/

## Future Enhancements

- [ ] Add Google Analytics / Plausible integration
- [ ] Set up Google Search Console
- [ ] Monitor search rankings
- [ ] Track social shares
- [ ] Add more structured data types (NewsArticle for Deep Dives)
- [ ] Generate representative profile images if missing
- [ ] Add social media share tracking

## Dependencies Added

```json
{
  "@vercel/og": "^0.x.x",
  "next-sitemap": "^4.x.x",
  "schema-dts": "^1.x.x"
}
```

## Environment Variables

Set `NEXT_PUBLIC_SITE_URL` to your production URL:

```bash
NEXT_PUBLIC_SITE_URL=https://accountability.arialabs.ai
```

Falls back to `https://accountability-dashboard.pages.dev` if not set.

## Performance Impact

- OG image generation: Edge runtime, minimal impact
- Sitemap generation: Build-time only
- Social share component: Client-side, minimal bundle size (~7KB)
- Structured data: ~2-3KB per page

## Lighthouse SEO Score

Expected improvement: 60-70 → 90+ SEO score

## Checklist from Issue #22

### Open Graph Images
- [x] Generate dynamic OG images for each representative
- [x] OG image includes representative details
- [x] Representative photo (when available)
- [x] Name and title
- [x] State and district
- [x] Say vs. Do score with visual indicator
- [x] Accountability Dashboard branding
- [x] Default OG image for homepage
- [x] Fallback image support

### Meta Tags
- [x] Homepage: title, description, OG tags, Twitter Card
- [x] Representative pages: dynamic titles and descriptions
- [x] Deep Dive pages: (to be added when Deep Dive pages exist)

### Structured Data
- [x] Person schema for representatives
- [x] Organization schema
- [x] BreadcrumbList schema
- [x] WebSite schema with SearchAction
- [ ] NewsArticle schema for Deep Dives (future)

### XML Sitemap
- [x] Generate sitemap.xml automatically
- [x] Include all pages
- [x] Update sitemap on content changes (via build)
- [x] Add sitemap reference to robots.txt

### Social Sharing
- [x] Share buttons on rep pages
- [x] Twitter/X
- [x] Facebook
- [x] LinkedIn
- [x] Reddit
- [x] Copy link functionality

### Other
- [x] robots.txt created
- [x] Site manifest for PWA
- [x] Tests written

## Notes

- The OG image generation uses Vercel's edge runtime for optimal performance
- Sitemap is generated at build time and includes all static routes
- Dynamic routes (rep pages) are included via `generateStaticParams`
- Social share buttons use native Web Share API when available
- All metadata uses Next.js 14+ Metadata API
