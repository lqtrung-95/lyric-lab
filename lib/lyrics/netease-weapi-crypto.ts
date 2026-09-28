import { createCipheriv, randomBytes } from "node:crypto";

// Mã hoá `weapi` của NetEase Cloud Music: web client của họ mã hoá MỌI tham số request bằng AES rồi mã hoá khoá AES
// bằng RSA trước khi gửi, phản hồi vẫn là JSON thường. Đây là thuật toán công khai, cộng đồng đã giải ngược từ lâu
// (vd. dự án mã nguồn mở NeteaseCloudMusicApi) — không phải khóa bí mật của NetEase, chỉ là bước mã hoá bắt buộc để
// request được server chấp nhận.
const AES_KEY = "0CoJUm6Qyw8W8jud"; // khoá AES cố định, dùng chung cho mọi client web
const IV = "0102030405060708";
const RSA_MODULUS_HEX =
  "00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7";
const RSA_EXPONENT_HEX = "010001";

const aesEncrypt = (text: string, key: string): string => {
  const cipher = createCipheriv("aes-128-cbc", Buffer.from(key), Buffer.from(IV));
  return Buffer.concat([cipher.update(text, "utf8"), cipher.final()]).toString("base64");
};

/** Lũy thừa modulo cho số lớn (RSA "textbook", không đệm — đúng cách NetEase dùng, không phải PKCS1). */
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  const ZERO = BigInt(0);
  const ONE = BigInt(1);
  let result = ONE;
  let b = base % mod;
  let e = exp;
  while (e > ZERO) {
    if (e & ONE) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= ONE;
  }
  return result;
}

const rsaEncrypt = (text: string): string => {
  const reversed = [...text].reverse().join("");
  const base = BigInt(`0x${Buffer.from(reversed, "utf8").toString("hex")}`);
  const result = modPow(base, BigInt(`0x${RSA_EXPONENT_HEX}`), BigInt(`0x${RSA_MODULUS_HEX}`));
  return result.toString(16).padStart(256, "0");
};

export interface WeapiPayload {
  params: string;
  encSecKey: string;
}

/** Mã hoá tham số request theo giao thức weapi. `params`/`encSecKey` là 2 field gửi trong form-urlencoded body. */
export function weapiEncrypt(data: Record<string, unknown>): WeapiPayload {
  const text = JSON.stringify(data);
  const secretKey = randomBytes(8).toString("hex"); // 16 ký tự hex ngẫu nhiên, đúng độ dài AES-128 client dùng
  const params = aesEncrypt(aesEncrypt(text, AES_KEY), secretKey);
  return { params, encSecKey: rsaEncrypt(secretKey) };
}
