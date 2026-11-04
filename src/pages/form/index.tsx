import { useRef, useState } from "react"
import { View, Text, Input, Textarea, Button } from "@tarojs/components"
import Taro, { useLoad, useRouter } from "@tarojs/taro"
import { api, type Pickup } from "../../api"

type NoticeResponse =
  | { status: "CREATED"; pickup: Pickup }
  | {
      status: "REVIEW"
      address: string
      pickupCode: string
      rawInfo: string | null
      confidence: number
      reason: string
    }

const MAX_IMAGE_BYTES = 3_000_000
const IMAGE_ERROR = "请选择小于 3 MB 的 JPEG、PNG 或 WebP 图片"

function imageType(base64: string) {
  const bytes = new Uint8Array(Taro.base64ToArrayBuffer(base64.slice(0, 16)))
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg"
  if ([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => bytes[i] === v)) return "png"
  if (String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "webp"
  return null
}

function readImage(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    Taro.getFileSystemManager().readFile({
      filePath: path,
      encoding: "base64",
      success: (res) => resolve(String(res.data)),
      fail: () => reject(new Error("截图读取失败，请重新选择"))
    })
  })
}

export default function Form() {
  const id = useRouter().params.id
  const [address, setAddress] = useState(""),
    [pickupCode, setPickupCode] = useState(""),
    [recipientName, setRecipientName] = useState(""),
    [rawInfo, setRawInfo] = useState(""),
    [image, setImage] = useState(""),
    [reviewReason, setReviewReason] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("")
  const busyRef = useRef(false)

  useLoad(() => {
    if (id)
      void api<Pickup>(`/express/pickups/${id}`).then((p) => {
        setAddress(p.address)
        setPickupCode(p.pickupCode)
        setRecipientName(p.recipientName || "")
        setRawInfo(p.rawInfo || "")
      }).catch((e: Error) => setError(e.message))
  })

  const chooseImage = async () => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    setError("")
    try {
      const selected = await Taro.chooseImage({ count: 1, sourceType: ["album", "camera"] })
      const file = selected.tempFiles[0]
      if (!file) return
      if (file.size > MAX_IMAGE_BYTES || file.size <= 0) throw new Error(IMAGE_ERROR)
      const base64 = await readImage(file.path)
      const mime = imageType(base64)
      const decodedBytes = base64.length * 3 / 4 - (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0)
      if (!mime || decodedBytes > MAX_IMAGE_BYTES) {
        throw new Error(IMAGE_ERROR)
      }
      setImage(`data:image/${mime};base64,${base64}`)
      setRawInfo("")
    } catch (e) {
      if (!String((e as Error).message).includes("cancel")) setError((e as Error).message)
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  const submit = async (manual = false) => {
    if (busyRef.current) return
    const recognize = !manual && !id && reviewReason === null && !!(image || rawInfo.trim())
    if (!recognize && (!address.trim() || !pickupCode.trim())) return
    busyRef.current = true
    setBusy(true)
    setError("")
    try {
      if (recognize) {
        const result = await api<NoticeResponse>(
          "/express/pickups/from-notice",
          "POST",
          image ? { image } : { content: rawInfo.trim() }
        )
        if (result.status === "REVIEW") {
          setAddress(result.address)
          setPickupCode(result.pickupCode)
          setRawInfo(result.rawInfo || rawInfo)
          setImage("")
          setReviewReason(result.reason || "INCOMPLETE")
          return
        }
      } else {
        await api(
          id ? `/express/pickups/${id}` : "/express/pickups",
          id ? "PATCH" : "POST",
          { address, pickupCode, recipientName, rawInfo }
        )
      }
      if (!id) void Taro.showToast({ title: "录入成功", icon: "success" })
      Taro.navigateBack()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  const recognize = !id && reviewReason === null && !!(image || rawInfo.trim())
  const complete = !!address.trim() && !!pickupCode.trim()
  return (
    <View className="page">
      <View className="hero">
        <Text className="title">{id ? "编辑快递" : "录入快递"}</Text>
      </View>
      {reviewReason !== null && (
        <Text className="source">
          {reviewReason === "AI_NOT_CONFIGURED"
            ? "图片识别尚未配置，请手填地点和取件码后确认保存。"
            : reviewReason === "AI_FAILED"
              ? "识别暂时失败，请核对并补齐信息后确认保存。"
              : "识别结果不完整或不确定，请核对并补齐信息后确认保存。"}
        </Text>
      )}
      <View className="panel form">
        <Text>取件地点 *</Text>
        <Input
          placeholder="例如：小区驿站"
          value={address}
          maxlength={200}
          onInput={(e) => setAddress(e.detail.value)}
        />
        <Text>取件码 *</Text>
        <Input
          placeholder="输入取件码"
          value={pickupCode}
          maxlength={80}
          onInput={(e) => setPickupCode(e.detail.value)}
        />
        <Text>收件人</Text>
        <Input
          placeholder="可选"
          value={recipientName}
          maxlength={80}
          onInput={(e) => setRecipientName(e.detail.value)}
        />
        <Text>通知原文</Text>
        <Textarea
          placeholder={id ? "可选" : "贴短信正文，可只填这一项"}
          value={rawInfo}
          maxlength={4000}
          onInput={(e) => {
            setRawInfo(e.detail.value)
            if (e.detail.value) setImage("")
          }}
        />
        {!id && reviewReason === null && (
          <>
            <Text>通知截图</Text>
            <Button disabled={busy} onClick={chooseImage}>
              {image ? "重新选择截图" : "选一张截图（相册或拍照）"}
            </Button>
            {image && (
              <Button disabled={busy} onClick={() => setImage("")}>清除截图</Button>
            )}
          </>
        )}
      </View>
      <Button
        className="primary"
        loading={busy}
        disabled={busy || (!recognize && !complete)}
        onClick={() => void submit()}
      >
        {reviewReason !== null ? "确认并保存" : recognize ? "识别并录入" : "保存"}
      </Button>
      {recognize && complete && (
        <Button disabled={busy} onClick={() => void submit(true)}>直接保存手填信息</Button>
      )}
      {error && <Text className="error">{error}</Text>}
    </View>
  )
}
