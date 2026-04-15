---
_schema: default
title: Search
description: >-
  Static Pagefind search across pages and posts—filter by type, author, and tag with no backend.
pageSections:
  - _component: page-sections/heroes/hero-center
    eyebrow:
    heading: Search
    subtext: >-
      Everything on your site is just one search away. Type a query to match titles and body copy
      across marketing pages, the blog, and component documentation. Results show excerpts, dates,
      and authors when available, and you can narrow results using the Type, Author, and Tag
      filters. This index is built at deploy time with
      <a href="https://pagefind.app/" target="_blank" rel="noopener">Pagefind</a>, so search stays
      fast and works on a static host without a database or paid API. 💙
      Start from the home page or blog if you prefer browsing; search complements navigation when
      you already know a keyword, a person’s name, or a topic you read about earlier. Results update
      as you type, and you can clear filters anytime to widen the set again.
    buttonSections: []
    colorScheme: inherit
    backgroundColor: base
    paddingVertical: 4xl
  - _component: page-sections/builders/custom-section
    label: ''
    contentSections:
      - _component: building-blocks/core-elements/embed
        html: |
          <link href="/pagefind/pagefind-ui.css" rel="stylesheet">
          <script src="/pagefind/pagefind-ui.js"></script>
          <div id="search"></div>
          <script>
              const initSearch = () => {
                  const searchEl = document.getElementById('search');
                  if (!searchEl || typeof PagefindUI === 'undefined') return;

                  const currentUrl = window.location.href;
                  if (searchEl.dataset.pagefindInitialized === currentUrl) return;

                  searchEl.dataset.pagefindInitialized = currentUrl;
                  searchEl.innerHTML = '';
                  new PagefindUI({
                      element: "#search",
                      showSubResults: true,
                      showImages: true,
                      openFilters: ["Type", "Author", "Tag"],
                      showEmptyFilters: true,
                      processResult: (result) => {
                          const published = result.meta?.published;
                          const author = result.meta?.author;
                          const lead = [published, author].filter(Boolean).join(" · ");
                          if (lead) {
                              result.excerpt = result.excerpt
                                  ? `${lead} — ${result.excerpt}`
                                  : lead;
                          }
                          return result;
                      },
                  });
              };

              if (document.readyState === "loading") {
                  document.addEventListener('DOMContentLoaded', initSearch, { once: true });
              } else {
                  initSearch();
              }

              document.addEventListener('astro:page-load', initSearch);
          </script>
        aspectRatio: landscape
    maxContentWidth: xl
    paddingHorizontal: xl
    paddingVertical: 2xl
    colorScheme: inherit
    backgroundColor: base
    rounded: false
---
