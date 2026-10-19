/**
 * Built-in browser settings section: the agent-use switch and the request
 * headers editor. Visual language mirrors the official settings sections
 * (ui-settings-agent-memory): one column capped at 720px, an 18px title over
 * a tertiary intro, uppercase group heads, and card rows built on the
 * settings-card tokens.
 */
import { useState } from 'react'
import { Button, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { BrowserSectionState } from './browser-store.ts'
import css from './BrowserSection.module.css'

/** Settings actions and their shared controller state. */
export interface BrowserSectionInjected {
  hooks: {
    /** Page snapshot bound by the renderer as useBrowserSection. */
    browserSection: SnapshotStore<BrowserSectionState>
  }
  /** Toggle the agent-use switch. */
  toggle: (field: 'agentUseBrowser', next: boolean) => Promise<void>
  /** Update the request-headers editor draft. */
  setHeadersDraft: (text: string) => void
  /** Save the request-headers draft. */
  saveHeaders: () => Promise<void>
  /** Restore the request headers to the built-in default. */
  restoreHeadersDefault: () => void
}

/** Props assembled by the settings renderer. */
export type BrowserSectionProps =
  PropsRuntime<'settings.section'>
  & PropsLocale<'settings.browser'>
  & InjectFace<BrowserSectionInjected>

/**
 * Render the built-in browser settings section.
 * @param props - settings actions, snapshot hook, and localized copy.
 * @returns the section page.
 */
export function BrowserSection({
  useBrowserSection, toggle, setHeadersDraft, saveHeaders, restoreHeadersDefault, t,
}: BrowserSectionProps) {
  const state = useBrowserSection(value => value)
  const [saveFailed, setSaveFailed] = useState(false)

  const disabled = state.status !== 'ready'

  return (
    <section className={css.section}>
      <h2 className={css.title}>{t('nav')}</h2>
      <p className={css.intro}>{t('intro')}</p>
      {state.status === 'unavailable' && <p className={css.error} role="alert">{t('unavailable')}</p>}
      <section className={css.group}>
        <h3 className={css.groupHead}>{t('switchesGroup')}</h3>
        <ul className={css.rows}>
          <li className={css.rowCard}>
            <div className={css.rowText}>
              <span className={css.rowTitle}>{t('agentUseBrowser.title')}</span>
              <span className={css.rowDesc}>{t('agentUseBrowser.description')}</span>
            </div>
            <Switch
              checked={state.switches.agentUseBrowser}
              disabled={disabled}
              label={t('agentUseBrowser.title')}
              onChange={(next) => { void toggle('agentUseBrowser', next) }}
            />
          </li>
        </ul>
      </section>
      <section className={css.group}>
        <h3 className={css.groupHead}>{t('headersGroup')}</h3>
        <p className={css.rowDesc}>{t('headersEditor.hint')}</p>
        <textarea
          className={css.editor}
          value={state.headersDraft}
          placeholder={state.switches.requestHeaders}
          spellCheck={false}
          disabled={disabled || state.saveState === 'saving'}
          onChange={(event) => { setHeadersDraft(event.target.value) }}
        />
        <div className={css.editorFooter}>
          {state.saveState === 'saved' && <span className={css.status} role="status">{t('headersEditor.saved')}</span>}
          {(state.saveState === 'failed' || saveFailed) && (
            <span className={css.error} role="alert">{state.error ?? t('headersEditor.saveFailed')}</span>
          )}
          <Button
            variant="outline"
            disabled={disabled || state.saveState === 'saving'}
            onClick={() => { restoreHeadersDefault() }}
          >
            {t('headersEditor.restore')}
          </Button>
          <Button
            variant="primary"
            disabled={disabled || state.saveState === 'saving'}
            onClick={() => {
              setSaveFailed(false)
              void saveHeaders().catch(() => { setSaveFailed(true) })
            }}
          >
            {state.saveState === 'saving' ? t('headersEditor.saving') : t('headersEditor.save')}
          </Button>
        </div>
      </section>
    </section>
  )
}
