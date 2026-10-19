import z from '@deepseek-ai/schemastery';
/** Edge-flavored default user agent used to seed the request headers. */
export const DEFAULT_EDGE_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
/** Default request headers, as JSON text, in an Edge-browser style. */
export const DEFAULT_REQUEST_HEADERS = JSON.stringify({
    'User-Agent': DEFAULT_EDGE_USER_AGENT,
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}, null, 2);
/** Default cooperative tool-call budget (ms) for one browser call. */
export const DEFAULT_BROWSER_TOOL_TIMEOUT_MS = 30_000;
/**
 * The plugin's configuration schema. The two switches are volatile: the
 * settings surfaces commit them onto the running fiber WITHOUT a remount,
 * so flipping the switch takes the next tool call immediately.
 */
export const Config = z.object({
    agentUseBrowser: z.boolean().default(true).description('Let the agent drive the built-in browser').volatile(),
    requestHeaders: z.string().default(DEFAULT_REQUEST_HEADERS).description('Extra request headers, as a JSON object').volatile(),
    timeoutMs: z.number().min(1).default(DEFAULT_BROWSER_TOOL_TIMEOUT_MS).description('Cooperative tool-call budget (ms)'),
});
//# sourceMappingURL=settings.js.map