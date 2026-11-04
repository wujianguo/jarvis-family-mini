# 窝事微信小程序

「窝事」是家庭快递管理的 Taro 微信小程序，可查看、录入和完成待取快递。服务端 API 与 Web 管理端位于独立的 [jarvis-family 主仓](https://github.com/wujianguo/jarvis-family)；登录流程及 API 契约见主仓的[第一版方案](https://github.com/wujianguo/jarvis-family/blob/main/docs/plan-v1.md)。

## 本地开发

需要 Node.js 20.18.3+ 和 pnpm 10.34.6。复制 [`.env.example`](.env.example) 为 `.env`，填入自己的配置，再将变量导出到运行命令的 shell。`TARO_APP_API_BASE` 填完整的 HTTPS API 根路径，例如 `https://your-domain.example/family/api`；小程序后台也需将该域名配置为合法 `request` 域名。

```bash
corepack enable
cp .env.example .env
# 编辑 .env 后，在当前 shell 导出变量
set -a
source .env
set +a
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

`WECHAT_MINI_APPID` 用于生成 `project.config.json`，必须与 `TARO_APP_WECHAT_MINI_APPID` 一致。`TARO_APP_*` 变量会编入小程序包；原始 ID 仅用于展示和备案。生成的 `project.config.json` 与本地 `.env` 均不提交。

## 上传体验版

先完成构建，将微信小程序上传私钥保存在仓库外，并设置其文件路径：

```bash
WECHAT_UPLOAD_PRIVATE_KEY_PATH=/path/to/upload-private-key pnpm upload
```

可选用 `MINI_VERSION`、`MINI_DESC` 设置上传版本和描述。推送 `main` 会触发 [GitHub Actions](.github/workflows/mini.yml) 构建并上传；仓库需设置 Variables `WECHAT_MINI_APPID`、`WECHAT_MINI_ORIGINAL_ID`、`PUBLIC_API_BASE`，以及保存完整上传私钥内容的 Secret `WECHAT_UPLOAD_PRIVATE_KEY`。

微信 AppSecret 属于主仓服务端配置，不放入小程序包或本仓。上传私钥仅通过 CI Secret 或本地文件路径提供。
