/**
 * The built-in browser runtime: a Playwright-derived Chromium installed under
 * `<harness-home>/browser`, plus a **stateful** session the agent tools drive
 * (open a page once, then click / type / scroll / wait against the same
 * page). The install root is always relative to the Harness home, so the
 * plugin behaves identically on Windows, macOS, and Linux. Ported from the
 * previous custom deployment with the navigation and session handling kept.
 */
import type { BrowserSettings } from './settings.ts';
/** The built-in browser install root: `<harness-home>/browser` (e.g. `~/.dsh/browser`). */
export declare function browserRoot(): string;
/**
 * Parse the request-headers JSON text into an `extraHTTPHeaders` object. An
 * empty or non-object/array JSON falls back to `undefined`.
 */
export declare function parseHeaders(json: string | undefined): Record<string, string> | undefined;
/** A rendered page snapshot the tools return. */
export interface BrowserPageResult {
    /** The current page URL. */
    url: string;
    /** The page title. */
    title: string;
    /** The HTTP status of the last navigation, or 0 for an interaction (no nav). */
    status: number;
    /** Rendered page text, capped to keep tool output bounded. */
    text: string;
}
/** Interaction actions the `browser_interact` tool performs against the live page. */
export type BrowserActAction = 'click' | 'type' | 'scroll' | 'wait' | 'content';
/** Argument payload for one interaction. */
export interface BrowserActArgs {
    /** CSS selector for `click` / `type` / `wait`. */
    selector?: string;
    /** Text typed by `type` (fills the field). */
    text?: string;
    /** Pixels scrolled by `scroll`. */
    amount?: number;
    /** Timeout (ms) for `wait`. */
    timeoutMs?: number;
}
/** The capabilities served through `ctx.browser`. */
export interface BrowserRuntime {
    /** Whether a Chromium is already installed under `<harness-home>/browser`. */
    detect(): Promise<{
        installed: boolean;
        path?: string;
    }>;
    /** Install Chromium under `<harness-home>/browser` (fire-and-forget). */
    install(): Promise<{
        ok: boolean;
        output?: string;
        error?: string;
    }>;
    /** Open `url` in the (stateful) built-in browser and return the rendered content. */
    open(url: string): Promise<BrowserPageResult>;
    /** Perform one interaction against the live page. */
    act(action: BrowserActAction, args?: BrowserActArgs): Promise<BrowserPageResult>;
    /** Close the stateful session and release the browser. */
    close(): Promise<void>;
}
/** Build a browser runtime bound to the current settings source. */
export declare function createBrowserRuntime(source: () => BrowserSettings): BrowserRuntime;
//# sourceMappingURL=browser.d.ts.map