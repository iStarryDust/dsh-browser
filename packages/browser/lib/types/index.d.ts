/**
 * Built-in browser plugin. Owns the browser runtime (a Playwright-derived
 * Chromium installed under `<harness-home>/browser`), the model-facing
 * `browser_open` / `browser_interact` tools, and the install/detect remotes.
 *
 * The runtime is the service itself: `ctx.browser` carries the stateful
 * session the tools drive, and the same instance exposes the wire namespace
 * (`remote.browser.probe` / `remote.browser.install`) a settings surface can
 * use to detect and install the Chromium without touching the host shell.
 *
 * @module @istarry/dsh-browser
 */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { type BrowserConfig } from './settings.ts';
import { type BrowserRuntime, type BrowserPageResult, type BrowserActAction, type BrowserActArgs } from './browser.ts';
export { DEFAULT_EDGE_USER_AGENT, DEFAULT_REQUEST_HEADERS, DEFAULT_BROWSER_TOOL_TIMEOUT_MS, Config, type BrowserConfig, } from './settings.ts';
export type { BrowserSettings } from './settings.ts';
export { browserRoot, parseHeaders, createBrowserRuntime, type BrowserActAction, BrowserActArgs, BrowserPageResult, BrowserRuntime, } from './browser.ts';
export { applyBrowserTools } from './tool.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** The built-in browser runtime (stateful session + install verbs). */
        browser: DshBrowser;
    }
}
/**
 * The browser service: the runtime face the tools drive, plus the two wire
 * verbs for install detection. The stateful session lives for the plugin's
 * lifetime with a five-minute idle close.
 */
export default class DshBrowser extends TypertRemoteService implements BrowserRuntime {
    readonly config: BrowserConfig;
    static inject: string[];
    static Config: import("@deepseek-ai/schemastery").default<{
        agentUseBrowser?: boolean;
        requestHeaders?: string;
        timeoutMs?: number;
    }, BrowserConfig>;
    /** The stateful runtime bound to the volatile switches. */
    private readonly runtime;
    constructor(ctx: Context, config: BrowserConfig);
    /**
     * Whether a Chromium is already installed under the harness home.
     * @returns the install state and the resolved executable path when present.
     */
    probe(): Promise<{
        installed: boolean;
        path?: string;
    }>;
    /**
     * Install Chromium under the harness home (fire-and-forget: the download
     * runs in a detached Playwright CLI process and the call returns at once).
     * @returns acknowledgement that the background install has started.
     */
    install(): Promise<{
        ok: boolean;
        output?: string;
        error?: string;
    }>;
    /** @returns whether the built-in Chromium is installed (runtime face). */
    detect(): Promise<{
        installed: boolean;
        path?: string;
    }>;
    /** Open `url` in the stateful session and return the rendered page. */
    open(url: string): Promise<BrowserPageResult>;
    /** Perform one interaction against the live page. */
    act(action: BrowserActAction, args?: BrowserActArgs): Promise<BrowserPageResult>;
    /** Close the stateful session and release the browser. */
    close(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map