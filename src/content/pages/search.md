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
      Everything on your site is just one search away. (Free static search courtesy of [Pagefind](https://pagefind.app/) 💙)
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
          <style>
              #search {
                  --pagefind-ui-primary: var(--color-text-strong);
                  --pagefind-ui-text: var(--color-text);
                  --pagefind-ui-background: var(--color-bg);
                  --pagefind-ui-border: var(--color-border);
                  --pagefind-ui-tag: var(--color-bg-surface);
                  --pagefind-ui-font: var(--font-body);
              }
              #search .pagefind-ui__search-input::placeholder {
                  color: var(--color-text-muted);
                  opacity: 0.6;
              }
              #search .pagefind-ui__result-tags .pagefind-ui__result-tag,
              #search .pagefind-ui__result-excerpt {
                  color: var(--color-text);
              }
              #search .pagefind-ui__result-tags .pagefind-ui__result-tag {
                  background: var(--color-bg-surface);
                  border-color: var(--color-border);
              }
              #search .pagefind-ui__filters {
                  display: flex;
                  flex-direction: column;
              }
          </style>
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

                  const filterOrder = { Type: 1, Tag: 2, Author: 3 };
                  const reorderFilters = () => {
                      const blocks = searchEl.querySelectorAll('.pagefind-ui__filter-block');
                      blocks.forEach((block) => {
                          const name = block.querySelector('.pagefind-ui__filter-name')?.textContent?.trim();
                          block.style.order = String(filterOrder[name] ?? 50);
                      });
                  };

                  const filterPanel = searchEl.querySelector('.pagefind-ui__filters') ?? searchEl;
                  new MutationObserver(reorderFilters).observe(filterPanel, { childList: true, subtree: true });
                  reorderFilters();
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
