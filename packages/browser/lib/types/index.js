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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { Config } from "./settings.js";
import { browserRoot, createBrowserRuntime, } from "./browser.js";
import { applyBrowserTools } from "./tool.js";
export { DEFAULT_EDGE_USER_AGENT, DEFAULT_REQUEST_HEADERS, DEFAULT_BROWSER_TOOL_TIMEOUT_MS, Config, } from "./settings.js";
export { browserRoot, parseHeaders, createBrowserRuntime, } from "./browser.js";
export { applyBrowserTools } from "./tool.js";
let DshBrowser = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _probe_decorators;
    let _install_decorators;
    return class DshBrowser extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _probe_decorators = [Remote('probe')];
            _install_decorators = [Remote('install')];
            __esDecorate(this, null, _probe_decorators, { kind: "method", name: "probe", static: false, private: false, access: { has: obj => "probe" in obj, get: obj => obj.probe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _install_decorators, { kind: "method", name: "install", static: false, private: false, access: { has: obj => "install" in obj, get: obj => obj.install }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        config = __runInitializers(this, _instanceExtraInitializers);
        static inject = ['tools', 'systemPrompt'];
        static Config = Config;
        /** The stateful runtime bound to the volatile switches. */
        runtime;
        constructor(ctx, config) {
            super(ctx, 'browser');
            this.config = config;
            const read = () => ({
                agentUseBrowser: this.config.agentUseBrowser.get(),
                requestHeaders: this.config.requestHeaders.get(),
            });
            this.runtime = createBrowserRuntime(read);
            // The switches are volatile, so the tools read them per call and a
            // committed edit needs no re-registration.
            applyBrowserTools(ctx, this.runtime, this.config.timeoutMs);
            ctx.effect(() => () => { void this.close(); }, 'dsh-browser: session cleanup');
            // Component sync: the bundle ships a finished Chromium under
            // <bundle>/component/chromium-1228. When the harness home has no
            // Chromium yet, copy it into place — no network download needed. Skipped
            // in dev (no component dir beside the package) and when already present.
            ctx.effect(() => {
                const timer = setTimeout(() => {
                    try {
                        const copied = syncComponentFromBundle(this.ctx);
                        if (copied)
                            ctx.logger.warn('dsh-browser: Chromium component copied into the harness home');
                    }
                    catch (error) {
                        ctx.logger.warn(`dsh-browser: component sync failed: ${error instanceof Error ? error.message : String(error)}`);
                    }
                }, 3_000);
                return () => { clearTimeout(timer); };
            }, 'dsh-browser: activation-time component sync');
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
 * The browser service: the runtime face the tools drive, plus the two wire
 * verbs for install detection. The stateful session lives for the plugin's
 * lifetime with a five-minute idle close.
 */
export default DshBrowser;
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
    void ctx;
    const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)));
    const component = join(pkgRoot, '..', '..', '..', 'component', 'chromium-1228');
    if (!existsSync(component))
        return false;
    const home = browserRoot();
    const target = join(home, 'chromium-1228');
    if (existsSync(join(target, 'chrome-win64', 'chrome.exe')))
        return false;
    mkdirSync(home, { recursive: true });
    cpSync(component, target, { recursive: true });
    return true;
}
//# sourceMappingURL=index.js.map