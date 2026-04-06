<script>
    import {onMount} from "svelte";
    import fastapi from "../lib/api";
    import {is_login, username, logout} from "../lib/store";
    import {navigate} from "svelte-routing";
    import {clearTokens} from "../lib/token";
    import {initRevenueCat, checkPurchase} from "../lib/purchases";
    import Header from "../components/Header.svelte";
    import BottomNavigationBar from "../components/BottomNavigationBar.svelte";
    import {goToHome, goToLogin} from "../lib/navigation.js";

    let currentPlan = "";
    let isUpdated = true;
    let appVersion = "2.3";

    function handleLogout(){
        logout();
    }

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
            "/user/delete_account",
            null,
            async (res) => {
                await clearTokens();
                is_login.set(false);
                username.set("");
                alert("Your account has been deleted.");
                navigate("/user-login");
            },
            (err) => {
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
            "/share/set_all_private",
            formData,
            (res) => {
                alert("Share Link password has been set.");
            },
            (err) => {
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
            "/share/set_all_public",
            null,
            (res) => {
                alert("Share Link password has been removed.");
            },
            (err) => {
                alert("Failed to remove the password for the Share Link.");
            },
        );
    }

    onMount(async () => {
        await initRevenueCat();
        currentPlan = await checkPurchase();
        await fastapi(
            "get",
            "/user/me",
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
                fastapi("get", "/user/app_version", null, (res) => {
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
            {handleLogout}
    />

    <div class="page">
        <div class="card">
            <h2>Settings</h2>

            <div class="section">
                <p class="section-title">Share Link</p>

                <button class="btn primary" on:click={addSharePassword}>
                    Set a Password for All Results
                </button>

                <button class="btn ghost" on:click={removeSharePassword}>
                    Remove Password for All Results
                </button>
            </div>

            <div class="divider"></div>

            <div class="section">
                <p class="section-title danger-text">Danger Zone</p>

                <button class="btn danger" on:click={deleteAccount}>
                    Delete Account
                </button>
            </div>
        </div>

        <div class="footer-links">
            <a on:click={() => navigate("/terms")}>Terms</a>
            <a on:click={() => navigate("/privacy-policy")}>Privacy</a>
            <a on:click={() => navigate("/credits")}>Credits</a>
            <a on:click={() => navigate("/manual")}>Manual</a>
        </div>
    </div>

    <BottomNavigationBar/>
{/if}

<style>
    :global(body) {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif;
        background: #f5f5f5;
        color: #0a0a0a;
        -webkit-font-smoothing: antialiased;
    }

    .page {
        padding: 2rem 1.25rem;
        max-width: 540px;
        margin: 0 auto;
    }

    .card {
        background: #ffffff;
        border-radius: 20px;
        padding: 2rem 1.75rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
        border: 1px solid #eaeaea;
    }

    h2 {
        margin: 0 0 2rem;
        font-size: 1.6rem;
        font-weight: 900;
        letter-spacing: -0.02em;
    }

    .section {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
    }

    .section-title {
        font-size: 0.72rem;
        font-weight: 700;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.12em;
    }

    .divider {
        height: 1px;
        background: #eee;
        margin: 2rem 0;
    }

    .btn {
        padding: 1rem 1.1rem;
        border-radius: 14px;
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        border: 1px solid transparent;
        cursor: pointer;

        /* 부드러운 hover 애니메이션 */
        transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .btn:active {
        transform: translateY(0); /* 눌림 효과 제거 유지 */
    }

    /* 공통 hover (살짝 떠오름) */
    .btn:hover {
        transform: translateY(-2px);
    }

    /* Primary */
    .primary {
        background: #111;
        color: #fff;
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
    }

    .primary:hover {
        background: #111;
        color: #fff;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.18);
    }

    /* Ghost */
    .ghost {
        background: #fafafa;
        color: #222;
        border: 1px solid #e5e5e5;
    }

    .ghost:hover {
        background: #fafafa;
        color: #222;
        border: 1px solid #e5e5e5;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.06);
    }

    /* Danger */
    .danger {
        background: #fff;
        border: 1px solid #f1b0b7;
        color: #e5484d;
    }

    .danger:hover {
        background: #fff;
        border: 1px solid #f1b0b7;
        color: #e5484d;
        box-shadow: 0 6px 12px rgba(229, 72, 77, 0.12);
    }

    .danger-text {
        color: #bbb;
    }

    .footer-links {
        margin-top: 2.5rem;
        display: flex;
        justify-content: space-between;
        font-size: 0.78rem;
        font-weight: 700;
        color: #000000;
        padding: 0 0.25rem;
    }

    .footer-links a {
        cursor: pointer;
        text-decoration: none;
        color: #000000;
        font-weight: 700;
        transition: none;
    }

    .footer-links a:hover {
        color: #000000;
    }
</style>