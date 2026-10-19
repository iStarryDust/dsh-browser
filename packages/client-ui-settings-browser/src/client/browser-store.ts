/**
 * Built-in browser settings store: the agent-use switch and the request
 * headers over the `browser` settings namespace (through the shared
 * configuration form, so writes ride the same revision fencing as every
 * other settings surface).
 */

import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import { createSnapshotStore, type SnapshotStore } from '@deepseek-ai/dsh-client-store'

/** The browser switches; the shape mirrors the host plugin's volatile Config. */
export interface BrowserSwitches {
  /** Whether the agent tools may drive the built-in browser. */
  agentUseBrowser: boolean
  /** JSON object text applied as extra request headers when the browser navigates. */
  requestHeaders: string
}

/** One accepted switch section; malformed durable values read as defaults-off. */
export function decodeBrowserSwitches(section: unknown): BrowserSwitches {
  const source = typeof section === 'object' && section !== null && !Array.isArray(section)
    ? section as Record<string, unknown>
    : {}
  return {
    agentUseBrowser: source.agentUseBrowser === true,
    requestHeaders: typeof source.requestHeaders === 'string' ? source.requestHeaders : '',
  }
}

/** Page snapshot rendered by the section. */
export interface BrowserSectionState {
  /** Switch transport state; `unavailable` renders the controls disabled. */
  status: 'loading' | 'ready' | 'unavailable'
  /** The switches as the Host holds them. */
  switches: BrowserSwitches
  /** The request-headers editor draft. */
  headersDraft: string
  /** Headers save lifecycle. */
  saveState: 'idle' | 'saving' | 'saved' | 'failed'
  /** Save failure text, when the write could not be served. */
  error: string | null
}

/** One settings-page controller (one per browser page). */
export class BrowserSettingsController {
  /** Snapshot the section renderer subscribes to. */
  readonly store: SnapshotStore<BrowserSectionState> = createSnapshotStore<BrowserSectionState>({
    status: 'loading',
    switches: decodeBrowserSwitches(undefined),
    headersDraft: '',
    saveState: 'idle',
    error: null,
  })

  private readonly unsubscribe: () => void
  /** True while the editor draft differs from the saved Host value. */
  private dirty = false

  /**
   * @param form - the shared configuration form for the `browser` namespace
   *   (switch state, ordered writes, and the current headers value the editor
   *   mirrors when not dirty).
   */
  constructor(private readonly form: ConfigForm<BrowserSwitches>) {
    this.unsubscribe = form.subscribe(() => { this.deriveSwitches() })
    this.deriveSwitches()
  }

  /** Release the form subscription. */
  dispose(): void {
    this.unsubscribe()
  }

  /** Toggle one switch through the shared configuration form. */
  async toggle(field: keyof BrowserSwitches, next: boolean): Promise<void> {
    await this.form.set(field, next)
  }

  /** Update the request-headers editor draft (client-side only until save). */
  setHeadersDraft(text: string): void {
    this.dirty = true
    const snapshot = this.store.getSnapshot()
    this.store.set({ ...snapshot, headersDraft: text, saveState: 'idle', error: null })
  }

  /** Save the request-headers draft through the shared configuration form. */
  async saveHeaders(): Promise<void> {
    const { headersDraft } = this.store.getSnapshot()
    this.store.set({ ...this.store.getSnapshot(), saveState: 'saving', error: null })
    try {
      await this.form.set('requestHeaders', headersDraft)
      this.dirty = false
      this.deriveSwitches()
      this.store.set({ ...this.store.getSnapshot(), saveState: 'saved' })
    } catch (error) {
      this.store.set({
        ...this.store.getSnapshot(),
        saveState: 'failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /** Restore the editor draft (and the saved value) to the built-in default headers. */
  restoreHeadersDefault(): void {
    this.setHeadersDraft(DEFAULT_REQUEST_HEADERS_JSON)
    void this.saveHeaders()
  }

  private deriveSwitches(): void {
    const snapshot = this.form.getSnapshot()
    const switches = snapshot.value === undefined ? decodeBrowserSwitches(undefined) : decodeBrowserSwitches(snapshot.value)
    // When the editor is not mid-edit, the draft mirrors the saved Host value
    // (including right after a save, so the editor content never disappears).
    const next: BrowserSectionState = {
      ...this.store.getSnapshot(),
      status: snapshot.status === 'ready' ? 'ready' : snapshot.status === 'loading' ? 'loading' : 'unavailable',
      switches,
    }
    if (!this.dirty) next.headersDraft = switches.requestHeaders
    this.store.set(next)
  }
}

/** The built-in default request headers, formatted exactly like the Host default. */
export const DEFAULT_REQUEST_HEADERS_JSON = JSON.stringify(
  {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  },
  null,
  2,
)
