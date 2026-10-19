import { createRequire } from "node:module";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import z from "@deepseek-ai/schemastery";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dshHomePath } from "@deepseek-ai/dsh-home-paths";
import { defineTool } from "@deepseek-ai/dsh-tools";
//#region lib/types/settings.js
/** Edge-flavored default user agent used to seed the request headers. */
const DEFAULT_EDGE_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
/** Default request headers, as JSON text, in an Edge-browser style. */
const DEFAULT_REQUEST_HEADERS = JSON.stringify({
	"User-Agent": DEFAULT_EDGE_USER_AGENT,
	"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
	Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
}, null, 2);
/** Default cooperative tool-call budget (ms) for one browser call. */
const DEFAULT_BROWSER_TOOL_TIMEOUT_MS = 3e4;
/**
* The plugin's configuration schema. The two switches are volatile: the
* settings surfaces commit them onto the running fiber WITHOUT a remount,
* so flipping the switch takes the next tool call immediately.
*/
const Config = z.object({
	agentUseBrowser: z.boolean().default(true).description("Let the agent drive the built-in browser").volatile(),
	requestHeaders: z.string().default(DEFAULT_REQUEST_HEADERS).description("Extra request headers, as a JSON object").volatile(),
	timeoutMs: z.number().min(1).default(DEFAULT_BROWSER_TOOL_TIMEOUT_MS).description("Cooperative tool-call budget (ms)")
});
//#endregion
//#region lib/types/browser.js
/**
* The built-in browser runtime: a Playwright-derived Chromium installed under
* `<harness-home>/browser`, plus a **stateful** session the agent tools drive
* (open a page once, then click / type / scroll / wait against the same
* page). The install root is always relative to the Harness home, so the
* plugin behaves identically on Windows, macOS, and Linux. Ported from the
* previous custom deployment with the navigation and session handling kept.
*/
/** The built-in browser install root: `<harness-home>/browser` (e.g. `~/.dsh/browser`). */
function browserRoot() {
	return dshHomePath("browser");
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
function parseHeaders(json) {
	if (json === void 0 || json.trim() === "") return void 0;
	try {
		const parsed = JSON.parse(json);
		if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
			const headers = Object.fromEntries(Object.entries(parsed).filter((entry) => typeof entry[1] === "string"));
			return Object.keys(headers).length > 0 ? headers : void 0;
		}
	} catch {}
}
/** Build a browser runtime bound to the current settings source. */
function createBrowserRuntime(source) {
	let browser;
	let context;
	let page;
	let idleTimer;
	let installStarted = false;
	const closeSession = async () => {
		if (idleTimer !== void 0) {
			clearTimeout(idleTimer);
			idleTimer = void 0;
		}
		try {
			await browser?.close();
		} finally {
			browser = void 0;
			context = void 0;
			page = void 0;
		}
	};
	/** Fire-and-forget Chromium download into the harness home (see install()). */
	const runtimeInstall = () => {
		mkdir(browserRoot(), { recursive: true }).then(() => {
			const cliPath = join(dirname(createRequire(import.meta.url).resolve("playwright/package.json")), "cli.js");
			spawn(process.execPath, [
				cliPath,
				"install",
				"chromium"
			], {
				env: {
					...process.env,
					PLAYWRIGHT_BROWSERS_PATH: browserRoot()
				},
				stdio: "ignore"
			}).on("error", () => {});
		});
	};
	const scheduleIdleClose = () => {
		if (idleTimer !== void 0) clearTimeout(idleTimer);
		idleTimer = setTimeout(() => {
			closeSession();
		}, 5 * 6e4);
	};
	const ensureSession = async () => {
		if (browser !== void 0 && !browser.isConnected()) await closeSession();
		const current = source();
		if (browser === void 0) {
			configurePlaywrightPath();
			const { chromium } = await import("playwright");
			try {
				browser = await chromium.launch({ headless: false });
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				if (!installStarted && /Executable doesn't exist|browserType\.launch/i.test(message)) {
					installStarted = true;
					runtimeInstall();
					throw new Error("内置浏览器尚未安装：已自动开始后台下载 Chromium，请稍后重试。");
				}
				throw error;
			}
		}
		if (context === void 0) {
			const headers = parseHeaders(current.requestHeaders);
			context = await browser.newContext(headers ? { extraHTTPHeaders: headers } : {});
		}
		if (page === void 0 || page.isClosed()) page = await context.newPage();
		scheduleIdleClose();
		return page;
	};
	const readPage = async (status = 0) => {
		const target = page ?? await ensureSession();
		const title = await target.title();
		const text = await target.evaluate(() => document.body?.innerText ?? "");
		return {
			url: target.url(),
			title,
			status,
			text: text.slice(0, 2e4)
		};
	};
	return {
		async detect() {
			configurePlaywrightPath();
			const { chromium } = await import("playwright");
			try {
				const p = chromium.executablePath();
				return existsSync(p) ? {
					installed: true,
					path: p
				} : { installed: false };
			} catch {
				return { installed: false };
			}
		},
		async install() {
			configurePlaywrightPath();
			await mkdir(browserRoot(), { recursive: true });
			const cliPath = join(dirname(createRequire(import.meta.url).resolve("playwright/package.json")), "cli.js");
			spawn(process.execPath, [
				cliPath,
				"install",
				"chromium"
			], {
				env: {
					...process.env,
					PLAYWRIGHT_BROWSERS_PATH: browserRoot()
				},
				stdio: "ignore"
			}).on("error", () => {});
			return {
				ok: true,
				output: "The Chromium install has started in the background."
			};
		},
		async open(url) {
			if (!source().agentUseBrowser) return {
				url,
				title: "",
				status: 0,
				text: "内置浏览器未启用：请在插件配置中开启 agentUseBrowser 后重试。"
			};
			const target = await ensureSession();
			let response;
			let navError;
			try {
				response = await target.goto(url, {
					waitUntil: "domcontentloaded",
					timeout: 3e4
				});
			} catch (error) {
				navError = error;
			}
			let title = "";
			try {
				title = await target.title();
			} catch {}
			const status = response?.status() ?? 0;
			let text = "";
			try {
				text = (await target.evaluate(() => document.body?.innerText ?? "")).slice(0, 2e4);
			} catch {}
			if (text === "" && navError !== void 0) text = `页面加载失败：${navError instanceof Error ? navError.message : String(navError)}`;
			return {
				url: target.url(),
				title,
				status,
				text
			};
		},
		async act(action, args = {}) {
			if (!source().agentUseBrowser) return {
				url: "",
				title: "",
				status: 0,
				text: "内置浏览器未启用：请在插件配置中开启 agentUseBrowser 后重试。"
			};
			const target = await ensureSession();
			switch (action) {
				case "click":
					await target.click(args.selector ?? "body", { timeout: 1e4 });
					break;
				case "type":
					await target.fill(args.selector ?? "", args.text ?? "");
					break;
				case "scroll":
					await target.evaluate((amount) => window.scrollBy(0, amount), args.amount ?? 600);
					await target.waitForTimeout(600);
					break;
				case "wait":
					if (args.selector !== void 0 && args.selector !== "") await target.waitForSelector(args.selector, { timeout: args.timeoutMs ?? 1e4 });
					else await target.waitForTimeout(args.timeoutMs ?? 2e3);
					break;
				case "content": break;
			}
			return readPage(0);
		},
		async close() {
			await closeSession();
		}
	};
}
//#endregion
//#region lib/types/tool.js
/**
* The model-facing built-in browser tools: `browser_open` (navigate and read
* rendered content) and `browser_interact` (click / type / scroll / wait /
* content against the live page). Both drive the stateful browser runtime and
* honor the `agentUseBrowser` switch at execution time.
*/
/** The output schema shared by both browser tools. */
const pageSchema = {
	type: "object",
	additionalProperties: false,
	properties: {
		url: {
			type: "string",
			required: true
		},
		title: { type: "string" },
		status: { type: "number" },
		text: { type: "string" }
	}
};
/**
* Register the `browser_open` and `browser_interact` tools and their
* system-prompt guidance.
* @param ctx - context whose `tools` and `systemPrompt` registries receive the
*   registration; both are effect-scoped and unregister on plugin dispose.
* @param runtime - the browser runtime the tools drive (stateful).
* @param timeoutMs - the cooperative tool-call budget (ms).
*/
function applyBrowserTools(ctx, runtime, timeoutMs) {
	ctx.systemPrompt.section({
		name: "tool:browser",
		order: 120,
		text: "Use the browser_open tool to open a URL in the built-in browser and read its rendered content. Use browser_interact to click, type, scroll, or wait against the already-open page (the session is kept between calls). Both only work when the built-in browser is enabled in the plugin settings."
	});
	ctx.tools.register(defineTool({
		name: "browser_open",
		description: "Open a URL in the built-in browser, wait for the page to render, and return the page title and visible text.",
		parameters: { url: {
			type: "string",
			required: true,
			description: "The absolute URL to open."
		} },
		output: {
			schema: pageSchema,
			render: renderPage
		},
		timeoutMs,
		isConcurrencySafe: () => false,
		async execute(args) {
			return runtime.open(args.url);
		}
	}));
	ctx.tools.register(defineTool({
		name: "browser_interact",
		description: "Interact with the already-open built-in browser page (click / type / scroll / wait / content) and return the resulting page text.",
		parameters: {
			action: {
				type: "string",
				required: true,
				description: "One of click, type, scroll, wait, or content."
			},
			selector: {
				type: "string",
				description: "CSS selector target for click / type / wait."
			},
			text: {
				type: "string",
				description: "Text typed by type."
			},
			amount: {
				type: "number",
				description: "Pixels scrolled by scroll."
			},
			timeoutMs: {
				type: "number",
				description: "Timeout (ms) for wait."
			}
		},
		output: {
			schema: pageSchema,
			render: renderPage
		},
		timeoutMs,
		isConcurrencySafe: () => false,
		async execute(args) {
			return runtime.act(args.action, args);
		}
	}));
}
/** Render a browser page result as a text block. */
function renderPage(_args, value) {
	return [{
		type: "text",
		text: [value.title, value.text].filter(Boolean).join("\n\n")
	}];
}
//#endregion
//#region lib/types/index.js
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
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
let DshBrowser = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _probe_decorators;
	let _install_decorators;
	return class DshBrowser extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_probe_decorators = [Remote("probe")];
			_install_decorators = [Remote("install")];
			__esDecorate(this, null, _probe_decorators, {
				kind: "method",
				name: "probe",
				static: false,
				private: false,
				access: {
					has: (obj) => "probe" in obj,
					get: (obj) => obj.probe
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _install_decorators, {
				kind: "method",
				name: "install",
				static: false,
				private: false,
				access: {
					has: (obj) => "install" in obj,
					get: (obj) => obj.install
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		config = __runInitializers(this, _instanceExtraInitializers);
		static inject = ["tools", "systemPrompt"];
		static Config = Config;
		/** The stateful runtime bound to the volatile switches. */
		runtime;
		constructor(ctx, config) {
			super(ctx, "browser");
			this.config = config;
			const read = () => ({
				agentUseBrowser: this.config.agentUseBrowser.get(),
				requestHeaders: this.config.requestHeaders.get()
			});
			this.runtime = createBrowserRuntime(read);
			applyBrowserTools(ctx, this.runtime, this.config.timeoutMs);
			ctx.effect(() => () => {
				this.close();
			}, "dsh-browser: session cleanup");
			ctx.effect(() => {
				const timer = setTimeout(() => {
					try {
						if (syncComponentFromBundle(this.ctx)) ctx.logger.warn("dsh-browser: Chromium component copied into the harness home");
					} catch (error) {
						ctx.logger.warn(`dsh-browser: component sync failed: ${error instanceof Error ? error.message : String(error)}`);
					}
				}, 3e3);
				return () => {
					clearTimeout(timer);
				};
			}, "dsh-browser: activation-time component sync");
		}
		/**
		* Whether a Chromium is already installed under the harness home.
		* @returns the install state and the resolved executable path when present.
		*/
		async probe() {
			return this.runtime.detect();
		}
		/**
		* Install Chromium under the harness home (fire-and-forget: the download
		* runs in a detached Playwright CLI process and the call returns at once).
		* @returns acknowledgement that the background install has started.
		*/
		async install() {
			return this.runtime.install();
		}
		/** @returns whether the built-in Chromium is installed (runtime face). */
		detect() {
			return this.runtime.detect();
		}
		/** Open `url` in the stateful session and return the rendered page. */
		open(url) {
			return this.runtime.open(url);
		}
		/** Perform one interaction against the live page. */
		act(action, args) {
			return this.runtime.act(action, args);
		}
		/** Close the stateful session and release the browser. */
		async close() {
			await this.runtime.close();
		}
	};
})();
/**
* Copy the bundled finished Chromium component into the harness home. The
* component directory sits at the BUNDLE root (`component/chromium-1228`),
* discovered by walking up from this package's own location; absent in dev
* checkouts, where the sync is a no-op. The unused ctx parameter is kept for
* call-site symmetry with other lifecycle helpers.
* @param ctx - host context.
* @returns whether a copy was performed.
*/
function syncComponentFromBundle(ctx) {
	const component = join(dirname(dirname(fileURLToPath(import.meta.url))), "..", "..", "..", "component", "chromium-1228");
	if (!existsSync(component)) return false;
	const home = browserRoot();
	const target = join(home, "chromium-1228");
	if (existsSync(join(target, "chrome-win64", "chrome.exe"))) return false;
	mkdirSync(home, { recursive: true });
	cpSync(component, target, { recursive: true });
	return true;
}
//#endregion
export { Config, DEFAULT_BROWSER_TOOL_TIMEOUT_MS, DEFAULT_EDGE_USER_AGENT, DEFAULT_REQUEST_HEADERS, applyBrowserTools, browserRoot, createBrowserRuntime, DshBrowser as default, parseHeaders };
