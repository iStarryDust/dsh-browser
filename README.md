# 内置浏览器（dsh-browser）

给 Agent 一个**真实的有头浏览器**：`browser_open` / `browser_interact` 两个工具，跑在一个装在
harness home 下、状态可保持的 Chromium 上。

## 有什么

- **`browser_open`**：打开页面，返回可交互的页面状态。
- **`browser_interact`**：在同一个浏览器会话里点击、输入、滚动、读取——状态在多次调用之间保持。
- **设置页**：Agent 使用开关、请求头编辑器、Chromium 安装状态。
- **Chromium 管理**：检测 / 安装 / 复用，装在 `~/.dsh` 下，不污染系统。

## 安装

```sh
dsh plugin add @istarry/dsh-browser
```

装完重启 DSH 服务。**首次使用需要在设置页里安装 Chromium**（约 400MB 下载，几百个文件），
装好之后不再重复下载。

## 权限与行为

这是本插件最需要注意的部分——它不只是渲染界面：

- 会**下载并安装一个 Chromium 运行时**到 `~/.dsh` 下（首次约 400MB，需要网络）。
- 会**启动一个有头浏览器进程**（不是无头），占用内存与一个窗口。
- `browser_interact` 能让模型**操作真实网页**：点击、输入、提交表单。请在设置页里决定是否对
  Agent 开放（`agentUseBrowser`），并清楚这意味着模型可以碰到你打开的任何页面。
- 可自定义**请求头**（设置页），用于需要特定 UA / Referer 的场景。

## 兼容性

- 实测于 DSH `0.2.0-rc.2`。
- peer 依赖：`@deepseek-ai/cordis`、`@deepseek-ai/dsh-tools`、`@deepseek-ai/dsh-session` 等
  （见各自 package.json）。
- Chromium 运行时**不随包分发**，由插件在运行时安装到用户目录。

## 结构

| 包 | 职责 |
|---|---|
| `@istarry/dsh-browser` | Chromium 运行时管理、`browser_open` / `browser_interact` 工具、安装/检测 Remote |
| `@istarry/dsh-client-ui-settings-browser` | 设置页：Agent 使用开关、请求头编辑、安装状态 |

## 许可

MIT，见 [LICENSE](LICENSE)。
