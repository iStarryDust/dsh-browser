window.__ModuleLoader__.load({
	id: "@istarry/dsh-client-ui-settings-browser",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region \0dsh-css:E:\dsh\deepseek-harness-starry\packages\client\ui-settings-browser\src\client\BrowserSection.module.css.mjs
		const css = ".jwS9Vq_section{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:12px;display:flex}.jwS9Vq_title{margin:0;font-size:18px;font-weight:600}.jwS9Vq_intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px}.jwS9Vq_group{flex-direction:column;gap:10px;display:flex}.jwS9Vq_group+.jwS9Vq_group{margin-top:8px}.jwS9Vq_groupHead{letter-spacing:.06em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;font-weight:600}.jwS9Vq_rows{flex-direction:column;gap:12px;margin:0;padding:0;list-style:none;display:flex}.jwS9Vq_rowCard{border:.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-settings-card-fill);justify-content:space-between;align-items:flex-start;gap:24px;padding:14px 16px;transition:background .16s;display:flex}.jwS9Vq_rowCard:hover{background:var(--dsw-alias-interactive-bg-hover)}.jwS9Vq_rowText{flex-direction:column;gap:3px;min-width:0;display:flex}.jwS9Vq_rowTitle{font-size:15px;font-weight:600;line-height:1.4}.jwS9Vq_rowTitle[data-install]{color:var(--dsw-alias-state-success-primary,var(--dsw-alias-label-primary))}.jwS9Vq_rowDesc{color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;margin:0;font-size:13px;line-height:1.55}.jwS9Vq_error{color:var(--dsw-alias-state-error-primary);margin:0;font-size:12px}.jwS9Vq_editor{box-sizing:border-box;resize:vertical;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-2);width:100%;min-height:140px;color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-mono,ui-monospace, SFMono-Regular, Menlo, monospace);white-space:pre;tab-size:2;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);margin:0;padding:12px;font-size:12.5px;line-height:1.6}.jwS9Vq_editor:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-1px}.jwS9Vq_editorFooter{align-items:center;gap:10px;display:flex}.jwS9Vq_status{color:var(--dsw-alias-label-tertiary);font-size:12px}";
		const tagId = "@istarry/dsh-client-ui-settings-browser/BrowserSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@istarry/dsh-client-ui-settings-browser";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var BrowserSection_module_css_default = {
			"editor": "jwS9Vq_editor",
			"editorFooter": "jwS9Vq_editorFooter",
			"error": "jwS9Vq_error",
			"group": "jwS9Vq_group",
			"groupHead": "jwS9Vq_groupHead",
			"intro": "jwS9Vq_intro",
			"rowCard": "jwS9Vq_rowCard",
			"rowDesc": "jwS9Vq_rowDesc",
			"rowText": "jwS9Vq_rowText",
			"rowTitle": "jwS9Vq_rowTitle",
			"rows": "jwS9Vq_rows",
			"section": "jwS9Vq_section",
			"status": "jwS9Vq_status",
			"title": "jwS9Vq_title"
		};
		//#endregion
		//#region src/client/BrowserSection.tsx
		/**
		* Built-in browser settings section: the agent-use switch and the request
		* headers editor. Visual language mirrors the official settings sections
		* (ui-settings-agent-memory): one column capped at 720px, an 18px title over
		* a tertiary intro, uppercase group heads, and card rows built on the
		* settings-card tokens.
		*/
		/**
		* Render the built-in browser settings section.
		* @param props - settings actions, snapshot hook, and localized copy.
		* @returns the section page.
		*/
		function BrowserSection({ useBrowserSection, toggle, setHeadersDraft, saveHeaders, restoreHeadersDefault, t }) {
			const state = useBrowserSection((value) => value);
			const [saveFailed, setSaveFailed] = (0, react.useState)(false);
			const disabled = state.status !== "ready";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: BrowserSection_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						className: BrowserSection_module_css_default.title,
						children: t("nav")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: BrowserSection_module_css_default.intro,
						children: t("intro")
					}),
					state.status === "unavailable" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: BrowserSection_module_css_default.error,
						role: "alert",
						children: t("unavailable")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: BrowserSection_module_css_default.group,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
							className: BrowserSection_module_css_default.groupHead,
							children: t("switchesGroup")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: BrowserSection_module_css_default.rows,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
								className: BrowserSection_module_css_default.rowCard,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: BrowserSection_module_css_default.rowText,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: BrowserSection_module_css_default.rowTitle,
										children: t("agentUseBrowser.title")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: BrowserSection_module_css_default.rowDesc,
										children: t("agentUseBrowser.description")
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
									checked: state.switches.agentUseBrowser,
									disabled,
									label: t("agentUseBrowser.title"),
									onChange: (next) => {
										toggle("agentUseBrowser", next);
									}
								})]
							})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: BrowserSection_module_css_default.group,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								className: BrowserSection_module_css_default.groupHead,
								children: t("headersGroup")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: BrowserSection_module_css_default.rowDesc,
								children: t("headersEditor.hint")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								className: BrowserSection_module_css_default.editor,
								value: state.headersDraft,
								placeholder: state.switches.requestHeaders,
								spellCheck: false,
								disabled: disabled || state.saveState === "saving",
								onChange: (event) => {
									setHeadersDraft(event.target.value);
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: BrowserSection_module_css_default.editorFooter,
								children: [
									state.saveState === "saved" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: BrowserSection_module_css_default.status,
										role: "status",
										children: t("headersEditor.saved")
									}),
									(state.saveState === "failed" || saveFailed) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: BrowserSection_module_css_default.error,
										role: "alert",
										children: state.error ?? t("headersEditor.saveFailed")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										disabled: disabled || state.saveState === "saving",
										onClick: () => {
											restoreHeadersDefault();
										},
										children: t("headersEditor.restore")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "primary",
										disabled: disabled || state.saveState === "saving",
										onClick: () => {
											setSaveFailed(false);
											saveHeaders().catch(() => {
												setSaveFailed(true);
											});
										},
										children: state.saveState === "saving" ? t("headersEditor.saving") : t("headersEditor.save")
									})
								]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/browser-store.ts
		/** One accepted switch section; malformed durable values read as defaults-off. */
		function decodeBrowserSwitches(section) {
			const source = typeof section === "object" && section !== null && !Array.isArray(section) ? section : {};
			return {
				agentUseBrowser: source.agentUseBrowser === true,
				requestHeaders: typeof source.requestHeaders === "string" ? source.requestHeaders : ""
			};
		}
		/** One settings-page controller (one per browser page). */
		var BrowserSettingsController = class {
			form;
			/** Snapshot the section renderer subscribes to. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				status: "loading",
				switches: decodeBrowserSwitches(void 0),
				headersDraft: "",
				saveState: "idle",
				error: null
			});
			unsubscribe;
			/** True while the editor draft differs from the saved Host value. */
			dirty = false;
			/**
			* @param form - the shared configuration form for the `browser` namespace
			*   (switch state, ordered writes, and the current headers value the editor
			*   mirrors when not dirty).
			*/
			constructor(form) {
				this.form = form;
				this.unsubscribe = form.subscribe(() => {
					this.deriveSwitches();
				});
				this.deriveSwitches();
			}
			/** Release the form subscription. */
			dispose() {
				this.unsubscribe();
			}
			/** Toggle one switch through the shared configuration form. */
			async toggle(field, next) {
				await this.form.set(field, next);
			}
			/** Update the request-headers editor draft (client-side only until save). */
			setHeadersDraft(text) {
				this.dirty = true;
				const snapshot = this.store.getSnapshot();
				this.store.set({
					...snapshot,
					headersDraft: text,
					saveState: "idle",
					error: null
				});
			}
			/** Save the request-headers draft through the shared configuration form. */
			async saveHeaders() {
				const { headersDraft } = this.store.getSnapshot();
				this.store.set({
					...this.store.getSnapshot(),
					saveState: "saving",
					error: null
				});
				try {
					await this.form.set("requestHeaders", headersDraft);
					this.dirty = false;
					this.deriveSwitches();
					this.store.set({
						...this.store.getSnapshot(),
						saveState: "saved"
					});
				} catch (error) {
					this.store.set({
						...this.store.getSnapshot(),
						saveState: "failed",
						error: error instanceof Error ? error.message : String(error)
					});
				}
			}
			/** Restore the editor draft (and the saved value) to the built-in default headers. */
			restoreHeadersDefault() {
				this.setHeadersDraft(DEFAULT_REQUEST_HEADERS_JSON);
				this.saveHeaders();
			}
			deriveSwitches() {
				const snapshot = this.form.getSnapshot();
				const switches = snapshot.value === void 0 ? decodeBrowserSwitches(void 0) : decodeBrowserSwitches(snapshot.value);
				const next = {
					...this.store.getSnapshot(),
					status: snapshot.status === "ready" ? "ready" : snapshot.status === "loading" ? "loading" : "unavailable",
					switches
				};
				if (!this.dirty) next.headersDraft = switches.requestHeaders;
				this.store.set(next);
			}
		};
		/** The built-in default request headers, formatted exactly like the Host default. */
		const DEFAULT_REQUEST_HEADERS_JSON = JSON.stringify({
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
			"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
		}, null, 2);
		//#endregion
		//#region src/client/locales.ts
		/** `settings.browser` namespace dictionaries: the built-in browser settings page. */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"nav": "内置浏览器",
			"intro": "给智能体一个真实的有头浏览器：browser_open 打开网页并读取渲染内容，browser_interact 点击、输入、滚动。Chromium 安装在本 Harness 主目录的 browser 文件夹下。",
			"switchesGroup": "开关",
			"agentUseBrowser.title": "启用内置浏览器",
			"agentUseBrowser.description": "关闭后 browser_open 与 browser_interact 调用会返回未启用提示",
			"headersGroup": "请求头",
			"headersEditor.hint": "导航时附加的额外请求头，JSON 对象格式；留空或非法 JSON 时使用浏览器自身请求头",
			"headersEditor.save": "保存请求头",
			"headersEditor.restore": "恢复默认",
			"headersEditor.saving": "保存中…",
			"headersEditor.saved": "已保存",
			"headersEditor.saveFailed": "保存失败",
			"installGroup": "安装状态",
			"install.checking": "正在检查 Chromium 安装状态…",
			"install.installed": "Chromium 已安装",
			"install.notInstalled": "Chromium 未安装：首次调用 browser_open 时会自动在后台下载安装，安装完成前调用会返回未安装提示",
			"install.probeFailed": "安装状态检查失败",
			"writeFailed": "保存失败，请重试",
			"unavailable": "配置暂不可用，请稍后刷新"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"nav": "Built-in browser",
			"intro": "Give the agent a real headed browser: browser_open navigates and reads rendered pages, browser_interact clicks, types, and scrolls. Chromium installs under the harness home's browser folder.",
			"switchesGroup": "Switches",
			"agentUseBrowser.title": "Enable the built-in browser",
			"agentUseBrowser.description": "When off, browser_open and browser_interact calls return a not-enabled notice",
			"headersGroup": "Request headers",
			"headersEditor.hint": "Extra request headers applied on navigation, as a JSON object; empty or invalid JSON falls back to the browser's own headers",
			"headersEditor.save": "Save headers",
			"headersEditor.restore": "Restore defaults",
			"headersEditor.saving": "Saving…",
			"headersEditor.saved": "Saved",
			"headersEditor.saveFailed": "Save failed",
			"installGroup": "Install status",
			"install.checking": "Checking the Chromium install state…",
			"install.installed": "Chromium is installed",
			"install.notInstalled": "Chromium is not installed: the first browser_open call downloads it in the background; calls before that return a not-installed notice",
			"install.probeFailed": "Failed to check the install state",
			"writeFailed": "Save failed, please retry",
			"unavailable": "Configuration is temporarily unavailable; refresh later"
		};
		//#endregion
		//#region src/client/index.ts
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.browser";
		/** The host plugin entry whose configuration section holds the switches. */
		const BROWSER_ENTRY = "browser";
		/** Required services (cordis fiber inject). */
		const inject = [
			"slots",
			"locale",
			"configForms"
		];
		/**
		* Register the built-in browser section and its dictionaries.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-settings-browser: dictionaries");
			const controller = new BrowserSettingsController(ctx.configForms.get(BROWSER_ENTRY));
			ctx.effect(() => () => {
				controller.dispose();
			}, "ui-settings-browser: form subscription");
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "browser",
				order: 30,
				label: () => t("nav"),
				locale: NS,
				inject: () => ({
					hooks: { browserSection: controller.store },
					toggle: (field, next) => controller.toggle(field, next),
					setHeadersDraft: (text) => {
						controller.setHeadersDraft(text);
					},
					saveHeaders: () => controller.saveHeaders(),
					restoreHeadersDefault: () => {
						controller.restoreHeadersDefault();
					}
				})
			}, BrowserSection));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map