/**
 * Built-in browser settings page, browser half: registers the 内置浏览器
 * section once the settings shell's section slot is on the ledger. The
 * agent-use switch and the request-headers editor ride the shared
 * configuration form for the host plugin's `browser` namespace. No
 * install/download controls: the component ships with the bundle and is
 * synced into the harness home at plugin activation.
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the settings shell's SlotMap merge (the 'settings.section'
// entry) and the configForms service.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: pulls the SlotRegistry service merge (ctx.slots).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { BrowserSection } from './BrowserSection.tsx'
import type { BrowserSectionInjected } from './BrowserSection.tsx'
import { BrowserSettingsController } from './browser-store.ts'
import type { BrowserSwitches } from './browser-store.ts'
import { en, zh, type BrowserSettingsKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The built-in browser settings page copy. */
    'settings.browser': BrowserSettingsKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'settings.browser'

/** The host plugin entry whose configuration section holds the switches. */
const BROWSER_ENTRY = 'browser'

/** Required services (cordis fiber inject). */
export const inject = ['slots', 'locale', 'configForms']

/**
 * Register the built-in browser section and its dictionaries.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-settings-browser: dictionaries')

  const form = ctx.configForms.get<BrowserSwitches>(BROWSER_ENTRY)
  const controller = new BrowserSettingsController(form)
  ctx.effect(() => () => { controller.dispose() }, 'ui-settings-browser: form subscription')

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'browser',
    // After the agent-memory section: memory shapes what the agent
    // remembers; the browser shapes what it can reach.
    order: 30,
    label: () => t('nav'),
    locale: NS,
    inject: (): BrowserSectionInjected => ({
      hooks: { browserSection: controller.store },
      toggle: (field, next) => controller.toggle(field, next),
      setHeadersDraft: (text) => { controller.setHeadersDraft(text) },
      saveHeaders: () => controller.saveHeaders(),
      restoreHeadersDefault: () => { controller.restoreHeadersDefault() },
    }),
  }, BrowserSection))
}
