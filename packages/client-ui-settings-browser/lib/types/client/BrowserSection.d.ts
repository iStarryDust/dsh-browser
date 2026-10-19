import type { SnapshotStore } from '@deepseek-ai/dsh-client-store';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { BrowserSectionState } from './browser-store.ts';
/** Settings actions and their shared controller state. */
export interface BrowserSectionInjected {
    hooks: {
        /** Page snapshot bound by the renderer as useBrowserSection. */
        browserSection: SnapshotStore<BrowserSectionState>;
    };
    /** Toggle the agent-use switch. */
    toggle: (field: 'agentUseBrowser', next: boolean) => Promise<void>;
    /** Update the request-headers editor draft. */
    setHeadersDraft: (text: string) => void;
    /** Save the request-headers draft. */
    saveHeaders: () => Promise<void>;
    /** Restore the request headers to the built-in default. */
    restoreHeadersDefault: () => void;
}
/** Props assembled by the settings renderer. */
export type BrowserSectionProps = PropsRuntime<'settings.section'> & PropsLocale<'settings.browser'> & InjectFace<BrowserSectionInjected>;
/**
 * Render the built-in browser settings section.
 * @param props - settings actions, snapshot hook, and localized copy.
 * @returns the section page.
 */
export declare function BrowserSection({ useBrowserSection, toggle, setHeadersDraft, saveHeaders, restoreHeadersDefault, t, }: BrowserSectionProps): import("react").JSX.Element;
//# sourceMappingURL=BrowserSection.d.ts.map