import { writable } from "svelte/store";
import fastapi from "./api.js";
import { isPlatform } from "@ionic/core";
import { clearTokens } from "./token.js";

const persist_storage = (key, initValue) => {
  const storedValueStr = localStorage.getItem(key);
  const store = writable(
    storedValueStr != null ? JSON.parse(storedValueStr) : initValue,
  );
  store.subscribe((val) => {
    localStorage.setItem(key, JSON.stringify(val));
  });
  return store;
};

export const username = persist_storage("username", "");
export const is_login = persist_storage("is_login", false);

export const result_list = writable([]);

export async function logout() {
  await fastapi(
    "post",
    "/api/user/logout",
    null,
    (res) => console.log("Server logout completed successfully.", res),
    (err) => console.error("Failed to log out from the server.", err),
  );
  if (isPlatform) {
    await clearTokens(); // 앱은 토큰 직접 삭제
  }

  is_login.set(false);
  username.set("");
  alert("You have been logged out.");
}
