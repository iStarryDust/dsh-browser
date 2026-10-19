import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Built-in browser settings section: the agent-use switch and the request
 * headers editor. Visual language mirrors the official settings sections
 * (ui-settings-agent-memory): one column capped at 720px, an 18px title over
 * a tertiary intro, uppercase group heads, and card rows built on the
 * settings-card tokens.
 */
import { useState } from 'react';
import { Button, Switch } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './BrowserSection.module.css';
/**
 * Render the built-in browser settings section.
 * @param props - settings actions, snapshot hook, and localized copy.
 * @returns the section page.
 */
export function BrowserSection({ useBrowserSection, toggle, setHeadersDraft, saveHeaders, restoreHeadersDefault, t, }) {
    const state = useBrowserSection(value => value);
    const [saveFailed, setSaveFailed] = useState(false);
    const disabled = state.status !== 'ready';
    return (_jsxs("section", { className: css.section, children: [_jsx("h2", { className: css.title, children: t('nav') }), _jsx("p", { className: css.intro, children: t('intro') }), state.status === 'unavailable' && _jsx("p", { className: css.error, role: "alert", children: t('unavailable') }), _jsxs("section", { className: css.group, children: [_jsx("h3", { className: css.groupHead, children: t('switchesGroup') }), _jsx("ul", { className: css.rows, children: _jsxs("li", { className: css.rowCard, children: [_jsxs("div", { className: css.rowText, children: [_jsx("span", { className: css.rowTitle, children: t('agentUseBrowser.title') }), _jsx("span", { className: css.rowDesc, children: t('agentUseBrowser.description') })] }), _jsx(Switch, { checked: state.switches.agentUseBrowser, disabled: disabled, label: t('agentUseBrowser.title'), onChange: (next) => { void toggle('agentUseBrowser', next); } })] }) })] }), _jsxs("section", { className: css.group, children: [_jsx("h3", { className: css.groupHead, children: t('headersGroup') }), _jsx("p", { className: css.rowDesc, children: t('headersEditor.hint') }), _jsx("textarea", { className: css.editor, value: state.headersDraft, placeholder: state.switches.requestHeaders, spellCheck: false, disabled: disabled || state.saveState === 'saving', onChange: (event) => { setHeadersDraft(event.target.value); } }), _jsxs("div", { className: css.editorFooter, children: [state.saveState === 'saved' && _jsx("span", { className: css.status, role: "status", children: t('headersEditor.saved') }), (state.saveState === 'failed' || saveFailed) && (_jsx("span", { className: css.error, role: "alert", children: state.error ?? t('headersEditor.saveFailed') })), _jsx(Button, { variant: "outline", disabled: disabled || state.saveState === 'saving', onClick: () => { restoreHeadersDefault(); }, children: t('headersEditor.restore') }), _jsx(Button, { variant: "primary", disabled: disabled || state.saveState === 'saving', onClick: () => {
                                    setSaveFailed(false);
                                    void saveHeaders().catch(() => { setSaveFailed(true); });
                                }, children: state.saveState === 'saving' ? t('headersEditor.saving') : t('headersEditor.save') })] })] })] }));
}
//# sourceMappingURL=BrowserSection.js.map