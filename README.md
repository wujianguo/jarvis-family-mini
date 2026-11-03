# 窝事微信小程序

独立于 [jarvis-family](https://github.com/wujianguo/jarvis-family) 的 Taro 小程序项目，AppID `wxce94463a6a805e99`。

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

GitHub Actions 在推送到 `main` 后构建并使用 `miniprogram-ci` 上传体验版。仓库 Secret `WECHAT_UPLOAD_PRIVATE_KEY` 保存微信小程序上传密钥的完整内容。上传只需要 AppID 和上传密钥；`WECHAT_MINI_SECRET` 属于服务端登录接口，不进入此仓库或上传流程。

本地上传前将密钥放在仓库外，并设置 `WECHAT_UPLOAD_PRIVATE_KEY_PATH`，然后运行 `pnpm upload`。可通过 `MINI_VERSION` 和 `MINI_DESC` 设置版本号与描述。
