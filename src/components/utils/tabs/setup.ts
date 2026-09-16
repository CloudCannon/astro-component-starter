const ROOT_SELECTOR = "[data-tabs]";
const TAB_SELECTOR = "[data-tab]";
const PANEL_SELECTOR = "[data-tab-panel]";

function ownedElements<T extends HTMLElement>(root: HTMLElement, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector)).filter(
    (element) => element.closest<HTMLElement>(ROOT_SELECTOR) === root
  );
}

function matchingPanel(tab: HTMLElement, panels: HTMLElement[]): HTMLElement | undefined {
  const panelId = tab.getAttribute("aria-controls");

  return panels.find((panel) => panel.id === panelId);
}

function activateTab(root: HTMLElement, activeTab: HTMLButtonElement): void {
  const tabs = ownedElements<HTMLButtonElement>(root, TAB_SELECTOR);
  const panels = ownedElements<HTMLElement>(root, PANEL_SELECTOR);
  const activePanel = matchingPanel(activeTab, panels);

  if (!activePanel) return;

  tabs.forEach((tab) => {
    const active = tab === activeTab;

    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  panels.forEach((panel) => {
    const active = panel === activePanel;

    panel.hidden = !active;
    panel.setAttribute("aria-hidden", String(!active));
  });
}

export function setupTabs(root: HTMLElement): void {
  const panels = ownedElements<HTMLElement>(root, PANEL_SELECTOR);
  const tabs = ownedElements<HTMLButtonElement>(root, TAB_SELECTOR).filter((tab) =>
    Boolean(matchingPanel(tab, panels))
  );

  if (!tabs.length) return;

  const selectedTab = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ?? tabs[0];

  activateTab(root, selectedTab);
  root.dataset.tabsInitialized = "true";

  tabs.forEach((tab) => {
    if (tab.dataset.tabInitialized === "true") return;
    tab.dataset.tabInitialized = "true";

    tab.addEventListener("click", () => activateTab(root, tab));
    tab.addEventListener("keydown", (event) => {
      const currentTabs = ownedElements<HTMLButtonElement>(root, TAB_SELECTOR).filter((item) =>
        Boolean(matchingPanel(item, ownedElements(root, PANEL_SELECTOR)))
      );
      const index = currentTabs.indexOf(tab);
      const orientation = tab.closest('[role="tablist"]')?.getAttribute("aria-orientation");
      const previousKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
      const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";

      if (index === -1 || ![previousKey, nextKey, "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      const nextIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? currentTabs.length - 1
            : (index + (event.key === nextKey ? 1 : -1) + currentTabs.length) % currentTabs.length;
      const nextTab = currentTabs[nextIndex];

      if (!nextTab) return;
      activateTab(root, nextTab);
      nextTab.focus();
    });
  });
}

export function setupAllTabs(root: ParentNode = document): void {
  const groups = new Set<HTMLElement>();

  if (root instanceof Element) {
    const owner = root.closest<HTMLElement>(ROOT_SELECTOR);

    if (owner) groups.add(owner);
  }

  root.querySelectorAll<HTMLElement>(ROOT_SELECTOR).forEach((group) => groups.add(group));
  groups.forEach(setupTabs);
}
