import { launchBrowser as launch, serveDist as serve } from "../../lib/distServer.mjs";

export const serveDist = serve;

export const launchBrowser = (
  message = "Could not launch a browser. Install Google Chrome, or set CHROME_PATH to a Chromium binary."
) => launch(message);
