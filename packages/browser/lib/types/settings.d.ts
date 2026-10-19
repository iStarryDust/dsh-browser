/**
 * `browser` plugin configuration: the user-facing switches (volatile, so a
 * committed edit reaches the running tools without a remount) and the
 * composition-level tool budget.
 */
import type { Volatile } from '@deepseek-ai/cosmokit';
import z from '@deepseek-ai/schemastery';
/** Edge-flavored default user agent used to seed the request headers. */
export declare const DEFAULT_EDGE_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
/** Default request headers, as JSON text, in an Edge-browser style. */
export declare const DEFAULT_REQUEST_HEADERS: string;
/** Default cooperative tool-call budget (ms) for one browser call. */
export declare const DEFAULT_BROWSER_TOOL_TIMEOUT_MS = 30000;
/** The resolved configuration: live-editable volatile values the tools read
 * on every call; the settings surface writes them without a remount. */
export interface BrowserConfig {
    agentUseBrowser: Volatile<boolean>;
    requestHeaders: Volatile<string>;
    timeoutMs: number;
}
/** The live browser switches the tools read at execution time. */
export interface BrowserSettings {
    /** Whether the agent tools may drive the built-in browser. */
    readonly agentUseBrowser: boolean;
    /** JSON object text applied as extra request headers when the browser navigates. */
    readonly requestHeaders: string;
}
/**
 * The plugin's configuration schema. The two switches are volatile: the
 * settings surfaces commit them onto the running fiber WITHOUT a remount,
 * so flipping the switch takes the next tool call immediately.
 */
export declare const Config: z<{
    agentUseBrowser?: boolean;
    requestHeaders?: string;
    timeoutMs?: number;
}, BrowserConfig>;
//# sourceMappingURL=settings.d.ts.map