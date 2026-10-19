/**
 * The model-facing built-in browser tools: `browser_open` (navigate and read
 * rendered content) and `browser_interact` (click / type / scroll / wait /
 * content against the live page). Both drive the stateful browser runtime and
 * honor the `agentUseBrowser` switch at execution time.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { BrowserRuntime } from './browser.ts';
/**
 * Register the `browser_open` and `browser_interact` tools and their
 * system-prompt guidance.
 * @param ctx - context whose `tools` and `systemPrompt` registries receive the
 *   registration; both are effect-scoped and unregister on plugin dispose.
 * @param runtime - the browser runtime the tools drive (stateful).
 * @param timeoutMs - the cooperative tool-call budget (ms).
 */
export declare function applyBrowserTools(ctx: Context, runtime: BrowserRuntime, timeoutMs: number): void;
//# sourceMappingURL=tool.d.ts.map