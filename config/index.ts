const required = (name: string) => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required for the mini program build`)
  return JSON.stringify(value)
}

export default {
  projectName: "woshi",
  date: "2026-11-03",
  designWidth: 375,
  deviceRatio: { 375: 2 },
  sourceRoot: "src",
  outputRoot: "dist",
  framework: "react",
  compiler: "vite",
  env: {
    TARO_APP_API_BASE: required("TARO_APP_API_BASE"),
    TARO_APP_WECHAT_MINI_APPID: required("TARO_APP_WECHAT_MINI_APPID"),
    TARO_APP_WECHAT_MINI_ORIGINAL_ID: required(
      "TARO_APP_WECHAT_MINI_ORIGINAL_ID"
    )
  },
  plugins: [],
  mini: {},
  h5: {}
}
