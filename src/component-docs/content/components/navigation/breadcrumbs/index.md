---
title: 'Breadcrumbs'
description: 'A wayfinding trail showing where the current page sits in the site.'
overview: 'Renders a Home › Blog › page trail above blog post and tag page titles, with the current page as plain text. The leading crumb links to the homepage and its label comes from `src/data/breadcrumbs.json` (editable in CloudCannon under Data). Long titles clamp with an ellipsis so the trail stays on one line, on small screens the trail collapses to a single back-link to the parent, and every trail emits schema.org `BreadcrumbList` structured data for search engines. It is rendered automatically by the blog templates rather than added through the page builder.'
examples:
  - title: 'Long titles clamp'
    slugs:
      - long-title
---
