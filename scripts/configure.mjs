import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const appid = process.env.WECHAT_MINI_APPID?.trim()
if (!appid) throw new Error("WECHAT_MINI_APPID is required")
if (process.env.TARO_APP_WECHAT_MINI_APPID !== appid)
  throw new Error("TARO_APP_WECHAT_MINI_APPID must match WECHAT_MINI_APPID")
const root = resolve(import.meta.dirname, "..")
const config = JSON.parse(
  await readFile(resolve(root, "project.config.template.json"), "utf8")
)
config.appid = appid
await writeFile(
  resolve(root, "project.config.json"),
  JSON.stringify(config, null, 2) + "\n"
)
