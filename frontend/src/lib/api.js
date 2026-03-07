import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens
} from "./token";
import { is_login, username } from "./store";
import { isPlatform } from "@ionic/core";
import { navigate } from "svelte-routing";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
let refreshPromise = null;

async function refreshAccessToken() {

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {

    try {

      const isNative = isPlatform("capacitor");
      if (!isNative) return false;

      const refreshToken = await getRefreshToken();
      if (!refreshToken) return false;

      const res = await fetch(`${SERVER_URL}/auth/refresh_token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          "Content-Type": "application/json"
        }
      });

      if (res.status === 401) {
        alert("Your session has expired. Please log in again!");
        await clearTokens();
        is_login.set(false);
        username.set("");
        navigate("/user-login");
        return false;
      }

      if (!res.ok) return false;

      const data = await res.json();

      await setAccessToken(data.access_token);
      await setRefreshToken(data.refresh_token);

      username.set(data.username);
      is_login.set(true);

      return true;

    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }

  })();

  return refreshPromise;
}

const fastapi = async (
  operation,
  url,
  params,
  success_callback,
  failure_callback
) => {
  const isNative = isPlatform("capacitor");
  let method = operation;
  let _url = SERVER_URL + url;
  const isFormData = params instanceof FormData;

  let headers = {};

  if (isNative) {
    const token = await getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } else if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  let body = null;

  if (operation === "login") {
    method = "POST";
    body = JSON.stringify(params);
  } else if (method === "get") {
    _url += "?" + new URLSearchParams(params);
  } else {
    body = isFormData ? params : JSON.stringify(params);
  }

  const options = {
    method: method,
    headers: headers,
    credentials: isNative ? undefined : "include",
    body: method === "get" ? undefined : body
  };

  let response = await fetch(_url, options);

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const token = await getAccessToken();
      if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
      }
      response = await fetch(_url, options);
    } else {
      is_login.set(false);
      username.set("");
      failure_callback?.({ status: 401, detail: "Session Expired" });
      return;
    }
  }

  if (response.status === 204) {
    success_callback?.();
    return;
  }

  if (response.ok) {
    const json = await response.json();
    success_callback?.(json);
  } else {
    try {
      const json = await response.json();
      failure_callback?.(json);
    } catch (e) {
      failure_callback?.(e);
    }
  }
};

export default fastapi;
export { refreshAccessToken };
