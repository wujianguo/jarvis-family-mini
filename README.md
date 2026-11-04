# 窝事微信小程序

独立于 [jarvis-family](https://github.com/wujianguo/jarvis-family) 的 Taro 小程序项目。AppID 与原始 ID 是公开配置；真实值通过构建变量提供。

`.env.example` 仅含占位值。复制为本地 `.env`，填入实际配置并在 shell 中加载这些变量后构建；不要提交本地 `.env`。`WECHAT_MINI_APPID` 用来生成忽略提交的 `project.config.json`；`TARO_APP_*` 变量编入小程序包。`TARO_APP_API_BASE` 为完整的 HTTPS API 根路径。`WECHAT_MINI_ORIGINAL_ID` 仅用于展示/备案。

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

GitHub Actions 在推送到 `main` 后构建并使用 `miniprogram-ci` 上传体验版。仓库 Variables 需设置 `WECHAT_MINI_APPID`、`WECHAT_MINI_ORIGINAL_ID`、`PUBLIC_API_BASE`；Secret `WECHAT_UPLOAD_PRIVATE_KEY` 保存微信小程序上传密钥的完整内容。上传只需要 AppID 和上传密钥；`WECHAT_MINI_SECRET` 属于服务端登录接口，不进入此仓库或上传流程。

本地上传前将密钥放在仓库外，并设置 `WECHAT_UPLOAD_PRIVATE_KEY_PATH`，然后运行 `pnpm upload`。可通过 `MINI_VERSION` 和 `MINI_DESC` 设置版本号与描述。
