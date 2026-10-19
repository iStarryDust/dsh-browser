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

import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { Config, DEFAULT_REQUEST_HEADERS, type BrowserConfig } from './settings.ts'
import type { BrowserSettings } from './settings.ts'
import {
  browserRoot, createBrowserRuntime,
  type BrowserRuntime, type BrowserPageResult, type BrowserActAction, type BrowserActArgs,
} from './browser.ts'
import { applyBrowserTools } from './tool.ts'

export {
  DEFAULT_EDGE_USER_AGENT, DEFAULT_REQUEST_HEADERS, DEFAULT_BROWSER_TOOL_TIMEOUT_MS,
  Config, type BrowserConfig,
} from './settings.ts'
export type { BrowserSettings } from './settings.ts'
export {
  browserRoot, parseHeaders, createBrowserRuntime,
  type BrowserActAction, BrowserActArgs, BrowserPageResult, BrowserRuntime,
} from './browser.ts'
export { applyBrowserTools } from './tool.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** The built-in browser runtime (stateful session + install verbs). */
    browser: DshBrowser
  }
}

/**
 * The browser service: the runtime face the tools drive, plus the two wire
 * verbs for install detection. The stateful session lives for the plugin's
 * lifetime with a five-minute idle close.
 */
export default class DshBrowser extends TypertRemoteService implements BrowserRuntime {
  static inject = ['tools', 'systemPrompt', 'configForms']

  static Config = Config

  /** The stateful runtime bound to the volatile switches. */
  private readonly runtime: BrowserRuntime

  constructor(ctx: Context, public readonly config: BrowserConfig) {
    super(ctx, 'browser')
    // Materialize the request-headers default once: the volatile field reads
    // as an empty string until first written, and both the tools and the
    // settings page expect the Edge-flavoured defaults to be the visible
    // value from the start. The write goes through the settings mutation API
    // (revision-fenced, same as a settings-page edit).
    if (this.config.requestHeaders.get().trim() === '') {
      const forms = ctx.get('configForms') as
        | { get(entryId: string): { set(field: string, value: unknown): Promise<boolean> } }
        | undefined
      void forms?.get('browser')?.set('requestHeaders', DEFAULT_REQUEST_HEADERS)
        .catch((reason: unknown) => {
          ctx.logger.warn(`dsh-browser: request-headers default write failed: ${String(reason)}`)
        })
    }
    const read = (): BrowserSettings => ({
      agentUseBrowser: this.config.agentUseBrowser.get(),
      requestHeaders: this.config.requestHeaders.get(),
    })
    this.runtime = createBrowserRuntime(read)
    // The switches are volatile, so the tools read them per call and a
    // committed edit needs no re-registration.
    applyBrowserTools(ctx, this.runtime, this.config.timeoutMs)
    ctx.effect(() => () => { void this.close() }, 'dsh-browser: session cleanup')

    // Component sync: the bundle ships a finished Chromium under
    // <bundle>/component/chromium-1228. When the harness home has no
    // Chromium yet, copy it into place — no network download needed. Skipped
    // in dev (no component dir beside the package) and when already present.
    ctx.effect(() => {
      const timer = setTimeout(() => {
        try {
          const copied = syncComponentFromBundle(this.ctx)
          if (copied) ctx.logger.warn('dsh-browser: Chromium component copied into the harness home')
        } catch (error) {
          ctx.logger.warn(`dsh-browser: component sync failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      }, 3_000)
      return () => { clearTimeout(timer) }
    }, 'dsh-browser: activation-time component sync')
  }

  /**
   * Whether a Chromium is already installed under the harness home.
   * @returns the install state and the resolved executable path when present.
   */
  @Remote('probe')
  async probe(): Promise<{ installed: boolean; path?: string }> {
    return this.runtime.detect()
  }

  /**
   * Install Chromium under the harness home (fire-and-forget: the download
   * runs in a detached Playwright CLI process and the call returns at once).
   * @returns acknowledgement that the background install has started.
   */
  @Remote('install')
  async install(): Promise<{ ok: boolean; output?: string; error?: string }> {
    return this.runtime.install()
  }

  /** @returns whether the built-in Chromium is installed (runtime face). */
  detect(): Promise<{ installed: boolean; path?: string }> {
    return this.runtime.detect()
  }

  /** Open `url` in the stateful session and return the rendered page. */
  open(url: string): Promise<BrowserPageResult> {
    return this.runtime.open(url)
  }

  /** Perform one interaction against the live page. */
  act(action: BrowserActAction, args?: BrowserActArgs): Promise<BrowserPageResult> {
    return this.runtime.act(action, args)
  }

  /** Close the stateful session and release the browser. */
  async close(): Promise<void> {
    await this.runtime.close()
  }
}

/**
 * Copy the bundled finished Chromium component into the harness home. The
 * component directory sits at the BUNDLE root (`component/chromium-1228`),
 * discovered by walking up from this package's own location; absent in dev
 * checkouts, where the sync is a no-op. The unused ctx parameter is kept for
 * call-site symmetry with other lifecycle helpers.
 * @param ctx - host context.
 * @returns whether a copy was performed.
 */
function syncComponentFromBundle(ctx: Context): boolean {
  void ctx
  const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)))
  const component = join(pkgRoot, '..', '..', '..', 'component', 'chromium-1228')
  if (!existsSync(component)) return false
  const home = browserRoot()
  const target = join(home, 'chromium-1228')
  if (existsSync(join(target, 'chrome-win64', 'chrome.exe'))) return false
  mkdirSync(home, { recursive: true })
  cpSync(component, target, { recursive: true })
  return true
}
