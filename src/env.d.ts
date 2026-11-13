/// <reference types="astro/client" />

// Fallback for editor sessions where the Astro TS plugin is not attached.
declare const Astro: any;
declare const Fragment: any;

declare namespace App {
  interface Locals {
    /** Heading ids already emitted on this page, so duplicate titles get a suffix. */
    headingIds?: Set<string>;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
