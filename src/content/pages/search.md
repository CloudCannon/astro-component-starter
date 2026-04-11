---
_schema: default
title: Search
description: Search your site content with fast static search powered by Pagefind.
pageSections:
  - _component: page-sections/heroes/hero-center
    eyebrow:
    heading: Search
    subtext: >-
      Everything on your site is just one search away. (Free static search
      courtesy of <a href="https://pagefind.app/" target="_blank"
      rel="noopener">Pagefind</a> 💙)
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
