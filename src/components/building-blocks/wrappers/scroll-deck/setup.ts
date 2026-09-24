// Not a `view()` timeline: it measures a pinned card's stuck position, so it never progresses.

const MAX_DEPTH = 3;

export function setupScrollDeck(deck: HTMLElement): void {
  // Flag the layout, not the root: the root survives an editor re-render that replaces the cards.
  const layout = deck.querySelector<HTMLElement>(".scroll-deck-layout");

  if (!layout || layout.hasAttribute("data-scroll-deck-initialized")) return;
  layout.setAttribute("data-scroll-deck-initialized", "");

  const cards = Array.from(deck.querySelectorAll<HTMLElement>(".scroll-deck-card"));
  const links = Array.from(deck.querySelectorAll<HTMLAnchorElement>(".scroll-deck-rail-link"));
  const rail = deck.querySelector<HTMLElement>(".scroll-deck-rail");

  if (!cards.length) {
    if (import.meta.env.DEV) {
      console.debug("ScrollDeck: skipping setup, required elements missing", deck);
    }
    return;
  }

  const syncCardHeight = () => {
    deck.style.removeProperty("--deck-card-height");

    const tallest = Math.ceil(
      Math.max(...cards.map((card) => card.getBoundingClientRect().height))
    );

    deck.style.setProperty("--deck-card-height", `${tallest}px`);

    if (rail) {
      deck.style.setProperty(
        "--deck-rail-height",
        `${Math.ceil(rail.getBoundingClientRect().height)}px`
      );
    }
  };

  deck.style.setProperty("--deck-last-index", String(cards.length - 1));
  syncCardHeight();

  const resizeObserver = new ResizeObserver(syncCardHeight);
  const contentObserver = new MutationObserver(syncCardHeight);

  cards.forEach((card) => {
    resizeObserver.observe(card);
    contentObserver.observe(card, { childList: true, subtree: true, characterData: true });
  });

  // Never cache (a stale port silently stops the rail). Body is excluded: its `overflow-x: hidden`
  // computes `overflow-y: auto`, so the computed value alone would pick body on every page.
  const scrollportTop = (): number => {
    let el = deck.parentElement;

    while (el && el !== document.body && el !== document.documentElement) {
      const overflowY = getComputedStyle(el).overflowY;

      if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
        return el.getBoundingClientRect().top;
      }
      el = el.parentElement;
    }
    return 0;
  };

  let active = -1;

  const apply = (index: number) => {
    if (index === active) return;
    active = index;

    links.forEach((link, i) => {
      if (i === index) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });

    cards.forEach((card, i) => {
      const depth = Math.min(Math.max(index - i, 0), MAX_DEPTH);

      card
        .querySelector<HTMLElement>(".scroll-deck-card-inner")
        ?.style.setProperty("--deck-covered", String(depth));
    });
  };

  const update = () => {
    const portTop = scrollportTop();
    let top = 0;

    cards.forEach((card, index) => {
      const stickyTop = parseFloat(getComputedStyle(card).top);

      if (!Number.isNaN(stickyTop) && card.getBoundingClientRect().top - portTop <= stickyTop + 1) {
        top = index;
      }
    });

    const lastCard = cards[cards.length - 1];
    const lastStickyTop = parseFloat(getComputedStyle(lastCard).top);
    const releaseDistance = lastCard.getBoundingClientRect().top - portTop - lastStickyTop;

    rail?.style.setProperty("--deck-rail-release", `${Math.min(0, releaseDistance)}px`);
    apply(top);
  };

  // Viewport-rooted on purpose: an element root goes quiet once it stops scrolling.
  const observer = new IntersectionObserver(update, {
    threshold: Array.from({ length: 21 }, (_, i) => i / 20),
  });

  cards.forEach((card) => observer.observe(card));

  // The last card stays fully intersecting through its runway, so thresholds alone miss its release.
  const onScroll = () => {
    if (!layout.isConnected) {
      observer.disconnect();
      resizeObserver.disconnect();
      contentObserver.disconnect();
      document.removeEventListener("scroll", onScroll, true);
      return;
    }

    update();
  };

  document.addEventListener("scroll", onScroll, { capture: true, passive: true });
  update();
}

export function setupAllScrollDecks(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".scroll-deck").forEach(setupScrollDeck);
}
