<script>
  import { onMount } from "svelte";
  import fastapi from "../lib/api";
  import { is_login, username, logout } from "../lib/store";
  import { navigate } from "svelte-routing";
  import { clearTokens } from "../lib/token";
  import { initRevenueCat, checkPurchase } from "../lib/purchases";
  import Header from "../components/Header.svelte";
  import BottomNavigationBar from "../components/BottomNavigationBar.svelte";
  import { goToHome, goToLogin } from "../lib/navigation.js";

  let currentPlan = "";
  let isUpdated = true;
  let appVersion = "1.7";

  // ✅ 계정 삭제
  async function deleteAccount() {
    if (!$is_login) {
      alert("Please log in to continue!");
      navigate("/user-login");
      return;
    }
    if (
      !confirm(
        "Are you sure you want to delete your account? This action is irreversible.",
      )
    )
      return;

    await fastapi(
      "post",
      "/api/user/delete_account",
      null,
      async (res) => {
        console.log("계정 삭제 완료:", res);
        await clearTokens();
        is_login.set(false);
        username.set("");
        alert("Your account has been deleted.");
        navigate("/user-login");
      },
      (err) => {
        console.error("Failed to delete account:", err);
        alert("Failed to delete account.");
      },
    );
  }

  // ✅ Share Link 비밀번호 추가
  async function addSharePassword() {
    if (!$is_login) {
      alert("Please log in to continue!");
      navigate("/user-login");
      return;
    }
    if (currentPlan === "" || currentPlan === "FREE") {
      alert(
        "Only users on the Premium plan have access to the Share Link feature!",
      );
      return;
    }
    const password = prompt("Enter the password to set for the Share Link :");
    if (!password) return;

    const formData = new FormData();
    formData.append("password", password);
    await fastapi(
      "post",
      "/api/result/set_all_private",
      formData,
      (res) => {
        console.log("Share Link 비밀번호 설정 완료:", res);
        alert("Share Link password has been set.");
      },
      (err) => {
        console.error("Share Link 비밀번호 설정 실패:", err);
        alert("Failed to set the password for the Share Link.");
      },
    );
  }

  // ✅ Share Link 비밀번호 해제
  async function removeSharePassword() {
    if (!$is_login) {
      alert("Please log in to continue!");
      navigate("/user-login");
      return;
    }
    if (currentPlan === "" || currentPlan === "FREE") {
      alert(
        "Only users on the Premium plan have access to the Share Link feature!",
      );
      return;
    }
    if (!confirm("Do you want to remove the password for the Share Link?"))
      return;

    await fastapi(
      "post",
      "/api/result/set_all_public",
      null,
      (res) => {
        console.log("Share Link 비밀번호 해제 완료:", res);
        alert("Share Link password has been removed.");
      },
      (err) => {
        console.error("Share Link 비밀번호 해제 실패:", err);
        alert("Failed to remove the password for the Share Link.");
      },
    );
  }

  onMount(async () => {
    await initRevenueCat();
    currentPlan = await checkPurchase();
    await fastapi(
      "get",
      "/api/user/me",
      null,
      (res) => {
        username.set(res.username);
        is_login.set(true);

        if (res.app_version !== appVersion) {
          isUpdated = false;
          alert("Please update the app from the App Store");
        } else {
          isUpdated = true;
        }
      },
      (err) => {
        fastapi("get", "/api/app/version", null, (res) => {
          if (res.app_version !== appVersion) {
            isUpdated = false;
            alert("Please update the app from the App Store");
          } else {
            isUpdated = true;
          }
        });
        username.set("");
        is_login.set(false);
      },
    );
  });
</script>

{#if isUpdated}
  <Header
    is_login={$is_login}
    username={$username}
    {goToHome}
    {goToLogin}
    {logout}
  />

  <div class="settings-container">
    <h2>Settings</h2>

    <button on:click={addSharePassword}>
      🔓 Add a password to the Share Link
    </button>

    <button on:click={removeSharePassword}>
      🔓 Remove password from Share Link
    </button>

    <button class="danger-button" on:click={deleteAccount}>
      🗑️ Delete Account
    </button>
  </div>

  <div class="bottom-menu">
    <a on:click={() => navigate("/terms")}>Terms Of Use</a>
    <a on:click={() => navigate("/privacy-policy")}>Privacy Policy</a>
    <a on:click={() => navigate("/credits")}>Credits</a>
    <a on:click={() => navigate("/manual")}>Manual</a>
  </div>
  <BottomNavigationBar />

  <div style="height: 300px;"></div>
{/if}

<style>
  body {
    margin: 0;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  .bottom-menu {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    font-size: 1rem;
    margin-top: 1rem;
  }

  .bottom-menu a {
    text-decoration: none;
    color: #000;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .bottom-menu a:hover {
    color: #111;
  }

  .settings-container {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .settings-container button {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-weight: 500;
    background: #ffffff;
    border: 1px solid #aaa;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease;
    text-align: left;
  }

  .settings-container button:hover {
    background: #f0f0f0;
  }

  .danger-button {
    border: 1px solid #d9534f;
    color: #d9534f;
  }

  .danger-button:hover {
    background: #f8d7da;
  }
</style>
