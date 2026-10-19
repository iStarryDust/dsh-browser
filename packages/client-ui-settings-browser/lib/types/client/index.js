/**
 * Built-in browser settings page, browser half: registers the 内置浏览器
 * section once the settings shell's section slot is on the ledger. The
 * agent-use switch and the request-headers editor ride the shared
 * configuration form for the host plugin's `browser` namespace. No
 * install/download controls: the component ships with the bundle and is
 * synced into the harness home at plugin activation.
 */
import { BrowserSection } from "./BrowserSection.js";
import { BrowserSettingsController } from "./browser-store.js";
import { en, zh } from "./locales.js";
/** Dictionary namespace owned by this plugin. */
const NS = 'settings.browser';
/** The host plugin entry whose configuration section holds the switches. */
const BROWSER_ENTRY = 'browser';
/** Required services (cordis fiber inject). */
export const inject = ['slots', 'locale', 'configForms'];
/**
 * Register the built-in browser section and its dictionaries.
 * @param ctx - client root context.
 */
export function apply(ctx) {
    const t = ctx.locale.bind(NS);
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-settings-browser: dictionaries');
    const form = ctx.configForms.get(BROWSER_ENTRY);
    const controller = new BrowserSettingsController(form);
    ctx.effect(() => () => { controller.dispose(); }, 'ui-settings-browser: form subscription');
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'browser',
        // After the agent-memory section: memory shapes what the agent
        // remembers; the browser shapes what it can reach.
        order: 30,
        label: () => t('nav'),
        locale: NS,
        inject: () => ({
            hooks: { browserSection: controller.store },
            toggle: (field, next) => controller.toggle(field, next),
            setHeadersDraft: (text) => { controller.setHeadersDraft(text); },
            saveHeaders: () => controller.saveHeaders(),
            restoreHeadersDefault: () => { controller.restoreHeadersDefault(); },
        }),
    }, BrowserSection));
}
//# sourceMappingURL=index.js.map