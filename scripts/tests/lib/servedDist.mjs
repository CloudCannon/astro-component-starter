/**
 * Shared helpers for the browser-based test scripts (smoke, a11y, css-parity,
 * flow-margins): they serve the built site in dist/ on an ephemeral 127.0.0.1
 * port and drive it with playwright-core against a system Chrome — or
 * Playwright's own Chromium as a fallback (that is what CI installs).
 *
 * The server and launch order live in scripts/lib/distServer.mjs, shared with
 * scripts/previews/screenshot.mjs so the two cannot serve different MIME types.
 */
import { launchBrowser as launch, serveDist as serve } from "../../lib/distServer.mjs";

export const serveDist = serve;

/** Only the diagnostic differs from the preview script's launcher. */
export const launchBrowser = (
  message = "Could not launch a browser. Install Google Chrome, or set CHROME_PATH to a Chromium binary."
) => launch(message);
