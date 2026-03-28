"use server"

import { AES } from "crypto-js"
import * as crypto from "crypto"

export async function encryptDataAction(data: string): Promise<string> {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error("Encryption key not configured")
  return AES.encrypt(data, key).toString()
}

export async function generateSignatureAction(
  method: string,
  uri: string,
  body?: any
): Promise<string> {
  const secret = process.env.APP_SECRET
  if (!secret) throw new Error("App secret not configured")

  const decodedString = purifiedString(method, uri, body)
  const hmac = crypto.createHmac("sha512", secret).update(decodedString)
  return hmac.digest("hex")
}

function fixedEncodeURIComponent(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

function sortBodyParams(object: Record<string, any>): Record<string, any> {
  if (typeof object !== "object" || object === null) return object
  if (Array.isArray(object)) return object.map((item) => sortBodyParams(item))
  const sorted: any = {}
  Object.keys(object)
    .sort()
    .forEach((key) => {
      sorted[key] = sortBodyParams(object[key])
    })
  return sorted
}

function sortQueryParams(wholeUrl: string): string {
  const url = wholeUrl.split("?")
  const baseUrl = url[0]
  const queryParam = url[1].split("&")
  wholeUrl = baseUrl + "?" + queryParam.sort().join("&")
  return fixedEncodeURIComponent(wholeUrl)
}

function purifiedString(
  method: string,
  wholeurl: string,
  requestBody?: Record<string, any>
): string {
  const baseArray: string[] = []
  baseArray.push(method.toUpperCase())

  if (wholeurl.indexOf("?") >= 0) {
    baseArray.push(sortQueryParams(wholeurl))
  } else {
    baseArray.push(fixedEncodeURIComponent(wholeurl))
  }

  if (requestBody && method.toUpperCase() !== "GET") {
    baseArray.push(
      fixedEncodeURIComponent(JSON.stringify(sortBodyParams(requestBody)))
    )
  }

  return baseArray.join("&")
}
