/**
 * Built-in browser settings page, browser half: registers the 内置浏览器
 * section once the settings shell's section slot is on the ledger. The
 * agent-use switch and the request-headers editor ride the shared
 * configuration form for the host plugin's `browser` namespace. No
 * install/download controls: the component ships with the bundle and is
 * synced into the harness home at plugin activation.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { type BrowserSettingsKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** The built-in browser settings page copy. */
        'settings.browser': BrowserSettingsKey;
    }
}
/** Required services (cordis fiber inject). */
export declare const inject: string[];
/**
 * Register the built-in browser section and its dictionaries.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map