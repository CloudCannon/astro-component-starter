/**
 * Rail scroll-spy and depth cue for the Scroll Deck. Used by
 * `ScrollDeck.astro`'s inline script and by `editor-live-sync.js`, where
 * inline scripts don't run. The rail is a list of real anchors, so it
 * navigates without this; the deck still stacks, just without the dimming.
 *
 * The depth cue is JS rather than a `view()` scroll-driven animation because a
 * view progress timeline measures the subject's STUCK position: a pinned card
 * never enters its own exit range, so the timeline sits at negative progress
 * forever.
 */

/** Cards dim and shrink one step per card covering them, up to this many. */
const MAX_DEPTH = 3;

export function setupScrollDeck(deck: HTMLElement): void {
  if (deck.hasAttribute("data-scroll-deck-initialized")) return;
  deck.setAttribute("data-scroll-deck-initialized", "");

  const cards = Array.from(deck.querySelectorAll<HTMLElement>(".scroll-deck-card"));
  const links = Array.from(deck.querySelectorAll<HTMLAnchorElement>(".scroll-deck-rail-link"));

  if (!cards.length) {
    // In the CloudCannon editor the subtree can be briefly incomplete while
    // content loads; the live-sync observer re-runs setup once it lands.
    if (import.meta.env.DEV) {
      console.debug("ScrollDeck: skipping setup, required elements missing", deck);
    }
    return;
  }

  // A card's sticky `top` is resolved against its scrollport, which is the
  // viewport on a real page but the preview pane in the component docs.
  // Comparing viewport coordinates would be wrong there.
  //
  // Resolved on every read, never cached: the answer changes with layout, and a
  // stale one silently stops the rail. `body` must be excluded and the element
  // must ACTUALLY scroll — the site sets `overflow-x: hidden` on body, which
  // computes `overflow-y: auto`, so testing the computed value alone picks body
  // on every real page.
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

  // The card on top is the highest-indexed one that has reached its own sticky
  // top. Reading the computed `top` keeps this in step with the CSS rather
  // than re-deriving the peek offsets here.
  const update = () => {
    const portTop = scrollportTop();
    let top = 0;

    cards.forEach((card, index) => {
      const stickyTop = parseFloat(getComputedStyle(card).top);

      if (!Number.isNaN(stickyTop) && card.getBoundingClientRect().top - portTop <= stickyTop + 1) {
        top = index;
      }
    });
    apply(top);
  };

  // Rooted at the viewport in every environment. A nested scrollport moves its
  // contents through the viewport too, so this still fires there, whereas an
  // observer rooted at an element that later stops scrolling goes quiet. A
  // callback only arrives on a threshold crossing, so the ladder has to be fine
  // enough to keep up with a card sliding over a pinned one.
  const observer = new IntersectionObserver(update, {
    threshold: Array.from({ length: 21 }, (_, i) => i / 20),
  });

  cards.forEach((card) => observer.observe(card));
  update();
}

export function setupAllScrollDecks(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".scroll-deck").forEach(setupScrollDeck);
}
