// @ts-ignore
import { Capacitor } from "@capacitor/core";
// @ts-ignore
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";

// 👉 Native 환경에서만 토큰 저장
export async function getAccessToken() {
  if (Capacitor.isNativePlatform()) {
    try {
      const { value } = await SecureStoragePlugin.get({ key: "access_token" });
      return value;
    } catch {
      return null;
    }
  }
  return null; // 웹은 HttpOnly 쿠키
}

export async function setAccessToken(token: string) {
  if (Capacitor.isNativePlatform()) {
    await SecureStoragePlugin.set({ key: "access_token", value: token });
  }
}

export async function getRefreshToken() {
  if (Capacitor.isNativePlatform()) {
    try {
      const { value } = await SecureStoragePlugin.get({ key: "refresh_token" });
      return value;
    } catch {
      return null;
    }
  }
  return null;
}

export async function setRefreshToken(token: string) {
  if (Capacitor.isNativePlatform()) {
    await SecureStoragePlugin.set({ key: "refresh_token", value: token });
  }
}

export async function clearTokens() {
  if (Capacitor.isNativePlatform()) {
    await SecureStoragePlugin.clear();
  }
}
