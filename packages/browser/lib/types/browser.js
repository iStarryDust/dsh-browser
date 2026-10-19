/**
 * The built-in browser runtime: a Playwright-derived Chromium installed under
 * `<harness-home>/browser`, plus a **stateful** session the agent tools drive
 * (open a page once, then click / type / scroll / wait against the same
 * page). The install root is always relative to the Harness home, so the
 * plugin behaves identically on Windows, macOS, and Linux. Ported from the
 * previous custom deployment with the navigation and session handling kept.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { dshHomePath } from '@deepseek-ai/dsh-home-paths';
/** The built-in browser install root: `<harness-home>/browser` (e.g. `~/.dsh/browser`). */
export function browserRoot() {
    return dshHomePath('browser');
}
/**
 * Point Playwright's browser registry at `<harness-home>/browser`. Must run
 * before any dynamic `import('playwright')`, because the registry reads the
 * environment variable when the module first resolves.
 */
function configurePlaywrightPath() {
    process.env.PLAYWRIGHT_BROWSERS_PATH ??= browserRoot();
}
/**
 * Parse the request-headers JSON text into an `extraHTTPHeaders` object. An
 * empty or non-object/array JSON falls back to `undefined`.
 */
export function parseHeaders(json) {
    if (json === undefined || json.trim() === '')
        return undefined;
    try {
        const parsed = JSON.parse(json);
        if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const headers = Object.fromEntries(Object.entries(parsed).filter((entry) => typeof entry[1] === 'string'));
            return Object.keys(headers).length > 0 ? headers : undefined;
        }
    }
    catch {
        /* Invalid JSON falls back to the browser's own headers. */
    }
    return undefined;
}
/** Build a browser runtime bound to the current settings source. */
export function createBrowserRuntime(source) {
    let browser;
    let context;
    let page;
    let idleTimer;
    let installStarted = false;
    const closeSession = async () => {
        if (idleTimer !== undefined) {
            clearTimeout(idleTimer);
            idleTimer = undefined;
        }
        try {
            await browser?.close();
        }
        finally {
            browser = undefined;
            context = undefined;
            page = undefined;
        }
    };
    /** Fire-and-forget Chromium download into the harness home (see install()). */
    const runtimeInstall = () => {
        void mkdir(browserRoot(), { recursive: true }).then(() => {
            const cliPath = join(dirname(createRequire(import.meta.url).resolve('playwright/package.json')), 'cli.js');
            const child = spawn(process.execPath, [cliPath, 'install', 'chromium'], {
                env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browserRoot() },
                stdio: 'ignore',
            });
            child.on('error', () => { });
        });
    };
    const scheduleIdleClose = () => {
        if (idleTimer !== undefined)
            clearTimeout(idleTimer);
        idleTimer = setTimeout(() => { void closeSession(); }, 5 * 60_000);
    };
    const ensureSession = async () => {
        // A headed window may have been closed by the user (or an idle close ran),
        // which makes the next goto fail with "browser has been closed". Re-create
        // the session when the browser or page is no longer usable.
        if (browser !== undefined && !browser.isConnected())
            await closeSession();
        const current = source();
        if (browser === undefined) {
            configurePlaywrightPath();
            const { chromium } = await import('playwright');
            try {
                browser = await chromium.launch({ headless: false });
            }
            catch (error) {
                // The most common launch failure on a fresh harness home is the
                // missing Chromium download. Kick the background install off once and
                // report it in the tool result; the next call launches normally.
                const message = error instanceof Error ? error.message : String(error);
                if (!installStarted && /Executable doesn't exist|browserType\.launch/i.test(message)) {
                    installStarted = true;
                    void runtimeInstall();
                    throw new Error('内置浏览器尚未安装：已自动开始后台下载 Chromium，请稍后重试。');
                }
                throw error;
            }
        }
        if (context === undefined) {
            const headers = parseHeaders(current.requestHeaders);
            context = await browser.newContext(headers ? { extraHTTPHeaders: headers } : {});
        }
        if (page === undefined || page.isClosed())
            page = await context.newPage();
        scheduleIdleClose();
        return page;
    };
    const readPage = async (status = 0) => {
        const target = page ?? await ensureSession();
        const title = await target.title();
        const text = await target.evaluate(() => document.body?.innerText ?? '');
        return { url: target.url(), title, status, text: text.slice(0, 20_000) };
    };
    return {
        async detect() {
            configurePlaywrightPath();
            const { chromium } = await import('playwright');
            try {
                const p = chromium.executablePath();
                return existsSync(p) ? { installed: true, path: p } : { installed: false };
            }
            catch {
                return { installed: false };
            }
        },
        async install() {
            configurePlaywrightPath();
            await mkdir(browserRoot(), { recursive: true });
            // Fire-and-forget: run Playwright's CLI so the remote call returns
            // immediately instead of hitting the carrier's request timeout.
            const cliPath = join(dirname(createRequire(import.meta.url).resolve('playwright/package.json')), 'cli.js');
            const child = spawn(process.execPath, [cliPath, 'install', 'chromium'], {
                env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browserRoot() },
                stdio: 'ignore',
            });
            child.on('error', () => { });
            return { ok: true, output: 'The Chromium install has started in the background.' };
        },
        async open(url) {
            const current = source();
            if (!current.agentUseBrowser) {
                return { url, title: '', status: 0, text: '内置浏览器未启用：请在插件配置中开启 agentUseBrowser 后重试。' };
            }
            const target = await ensureSession();
            // Wait for the DOM instead of `networkidle`: heavy SPA pages (GitHub,
            // dashboards, admin panels) keep long-lived connections or lazy-loaded
            // traffic running, so `networkidle` rarely settles and the 30s timeout
            // discarded an already-rendered page. When navigation still fails
            // (offline, DNS, TLS reset), report the error in the page text instead
            // of throwing away the snapshot.
            let response;
            let navError;
            try {
                response = await target.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
            }
            catch (error) {
                navError = error;
            }
            let title = '';
            try {
                title = await target.title();
            }
            catch {
                /* navigation failed before a document attached */
            }
            const status = response?.status() ?? 0;
            let text = '';
            try {
                text = (await target.evaluate(() => document.body?.innerText ?? '')).slice(0, 20_000);
            }
            catch {
                /* navigation failed before a document attached */
            }
            if (text === '' && navError !== undefined) {
                text = `页面加载失败：${navError instanceof Error ? navError.message : String(navError)}`;
            }
            return { url: target.url(), title, status, text };
        },
        async act(action, args = {}) {
            const current = source();
            if (!current.agentUseBrowser) {
                return { url: '', title: '', status: 0, text: '内置浏览器未启用：请在插件配置中开启 agentUseBrowser 后重试。' };
            }
            const target = await ensureSession();
            switch (action) {
                case 'click':
                    await target.click(args.selector ?? 'body', { timeout: 10_000 });
                    break;
                case 'type':
                    await target.fill(args.selector ?? '', args.text ?? '');
                    break;
                case 'scroll':
                    await target.evaluate(amount => window.scrollBy(0, amount), args.amount ?? 600);
                    await target.waitForTimeout(600);
                    break;
                case 'wait':
                    if (args.selector !== undefined && args.selector !== '') {
                        await target.waitForSelector(args.selector, { timeout: args.timeoutMs ?? 10_000 });
                    }
                    else {
                        await target.waitForTimeout(args.timeoutMs ?? 2_000);
                    }
                    break;
                case 'content':
                    break;
            }
            return readPage(0);
        },
        async close() {
            await closeSession();
        },
    };
}
//# sourceMappingURL=browser.js.map