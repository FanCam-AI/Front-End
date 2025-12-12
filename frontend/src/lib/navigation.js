import { navigate } from "svelte-routing";

export function goToHome() {
  navigate("/");
}
export function goToLogin() {
  navigate("/user-login");
}
