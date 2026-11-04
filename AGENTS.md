# 窝事 · coding agent 指引

本仓是 Taro 微信小程序「窝事」，独立于 [wujianguo/jarvis-family](https://github.com/wujianguo/jarvis-family) monorepo；服务端 API 在主仓。

## 工作位置

- `src/`：页面、应用入口和 API 客户端；`config/`：Taro 构建配置。
- `scripts/upload.mjs`：体验版上传；`.github/workflows/`：CI 构建与上传。

## 按任务读取

- 开始本地开发或准备上传时，读 [README.md](README.md)；增改配置变量时，核对 [`.env.example`](.env.example) 与 CI 映射。
- 改微信登录、会话或快递 API 时，先读主仓 [`docs/plan-v1.md`](https://github.com/wujianguo/jarvis-family/blob/main/docs/plan-v1.md) 中的小程序登录与 API 契约；本地 sibling monorepo 位于 `../jarvis-family`。

## 开发与发布

1. 运行 `pnpm install --frozen-lockfile`、`pnpm typecheck`、`pnpm build`。构建前按 README 配好环境变量。
2. 本地已有构建产物、有效 AppID 和仓库外上传私钥时，设置 `WECHAT_UPLOAD_PRIVATE_KEY_PATH` 后运行 `pnpm upload`。
3. 推送 `main` 会触发 CI 上传体验版：Repository Variables 为 `WECHAT_MINI_APPID`、`WECHAT_MINI_ORIGINAL_ID`、`PUBLIC_API_BASE`；Secret 为 `WECHAT_UPLOAD_PRIVATE_KEY`。`project.config.json` 由构建生成，不提交。

AppSecret 只由主仓服务端持有，不进入本仓；上传私钥只通过 CI Secret 或本地路径变量提供。
