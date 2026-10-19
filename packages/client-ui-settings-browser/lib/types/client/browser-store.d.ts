/**
 * Built-in browser settings store: the agent-use switch and the request
 * headers over the `browser` settings namespace (through the shared
 * configuration form, so writes ride the same revision fencing as every
 * other settings surface).
 */
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import { type SnapshotStore } from '@deepseek-ai/dsh-client-store';
/** The browser switches; the shape mirrors the host plugin's volatile Config. */
export interface BrowserSwitches {
    /** Whether the agent tools may drive the built-in browser. */
    agentUseBrowser: boolean;
    /** JSON object text applied as extra request headers when the browser navigates. */
    requestHeaders: string;
}
/** One accepted switch section; malformed durable values read as defaults-off. */
export declare function decodeBrowserSwitches(section: unknown): BrowserSwitches;
/** Page snapshot rendered by the section. */
export interface BrowserSectionState {
    /** Switch transport state; `unavailable` renders the controls disabled. */
    status: 'loading' | 'ready' | 'unavailable';
    /** The switches as the Host holds them. */
    switches: BrowserSwitches;
    /** The request-headers editor draft. */
    headersDraft: string;
    /** Headers save lifecycle. */
    saveState: 'idle' | 'saving' | 'saved' | 'failed';
    /** Save failure text, when the write could not be served. */
    error: string | null;
}
/** One settings-page controller (one per browser page). */
export declare class BrowserSettingsController {
    private readonly form;
    /** Snapshot the section renderer subscribes to. */
    readonly store: SnapshotStore<BrowserSectionState>;
    private readonly unsubscribe;
    /** True while the editor draft differs from the saved Host value. */
    private dirty;
    /**
     * @param form - the shared configuration form for the `browser` namespace
     *   (switch state, ordered writes, and the current headers value the editor
     *   mirrors when not dirty).
     */
    constructor(form: ConfigForm<BrowserSwitches>);
    /** Release the form subscription. */
    dispose(): void;
    /** Toggle one switch through the shared configuration form. */
    toggle(field: keyof BrowserSwitches, next: boolean): Promise<void>;
    /** Update the request-headers editor draft (client-side only until save). */
    setHeadersDraft(text: string): void;
    /** Save the request-headers draft through the shared configuration form. */
    saveHeaders(): Promise<void>;
    /** Restore the editor draft (and the saved value) to the built-in default headers. */
    restoreHeadersDefault(): void;
    private deriveSwitches;
}
/** The built-in default request headers, formatted exactly like the Host default. */
export declare const DEFAULT_REQUEST_HEADERS_JSON: string;
//# sourceMappingURL=browser-store.d.ts.map