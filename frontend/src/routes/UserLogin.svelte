<script>
    import fastapi from "../lib/api";
    import {navigate} from "svelte-routing";
    import {username, is_login, logout} from "../lib/store";
    import {Browser} from "@capacitor/browser";
    import {isPlatform} from "@ionic/core";
    import {onMount} from "svelte";
    import Header from "../components/Header.svelte";
    import BottomNavigationBar from "../components/BottomNavigationBar.svelte";
    import {goToHome, goToLogin} from "../lib/navigation.js";
    import {generateVerifier, generateChallenge} from "../lib/pkce.js";
    import {setPkceVerifier} from "../lib/pkceSession.ts";
    import googleLogo from '../assets/google_logo.svg';
    import appleLogo from '../assets/apple_logo.png';


    let error = {detail: []};
    let isUpdated = true;
    let appVersion = "1.7";

    let agreeAll = false;
    let agreeTerms = false;
    let agreePrivacy = false;

    function toggleAllAgree() {
        agreeTerms = agreeAll;
        agreePrivacy = agreeAll;
    }

    onMount(() => {
        fastapi("get", "/user/app_version", null, (res) => {
            if (res.app_version !== appVersion) {
                isUpdated = false;
                alert("Please update the app from the App Store");
            } else {
                isUpdated = true;
            }
        });
    });

    function checkAgreeAll() {
        agreeAll = agreeTerms && agreePrivacy;
    }

    function validateBeforeSubmit() {
        if (!agreeTerms || !agreePrivacy) {
            alert("Agreement to the Terms of Use, Privacy Policy is required.");
            return false;
        }
        return true;
    }

    async function loginWithGoogle(event) {
        event.preventDefault();
        if (!validateBeforeSubmit()) return;

        const platform = isPlatform("capacitor") ? "app" : "web";
        const verifier = generateVerifier();
        const challenge = await generateChallenge(verifier);
        setPkceVerifier(verifier);
        const url = `https://fancamai.com/auth/google?platform=${platform}&code_challenge=${challenge}`;

        if (platform === "app") {
            Browser.open({url});
        } else {
            window.location.href = url;
        }
    }

    async function loginWithApple(event) {
        event.preventDefault();
        if (!validateBeforeSubmit()) return;

        const platform = isPlatform("capacitor") ? "app" : "web";
        const verifier = generateVerifier();
        const challenge = await generateChallenge(verifier);
        setPkceVerifier(verifier);
        const url = `https://fancamai.com/auth/apple?platform=${platform}&code_challenge=${challenge}`;

        if (platform === "app") {
            Browser.open({url});
        } else {
            window.location.href = url;
        }
    }
</script>

{#if isUpdated}
    <Header
            is_login={$is_login}
            username={$username}
            {goToHome}
            {goToLogin}
            {logout}
    />

    <div class="container">
        <h5 class="my-3 border-bottom pb-2">Log In</h5>

        {#if error.detail.length > 0}
            <div class="alert">
                <ul>
                    {#each error.detail as err}
                        <li>{err.msg}</li>
                    {/each}
                </ul>
            </div>
        {/if}

        <form>
            <!-- Checkbox Section -->
            <div class="checkbox-container">
                <!-- Agree to all -->
                <label class="checkbox-label bold">
                    <input
                            type="checkbox"
                            bind:checked={agreeAll}
                            on:change={toggleAllAgree}
                    />
                    <span>I agree to all terms and conditions.</span>
                </label>

                <!-- Individual agreements -->
                <div class="sub-checkboxes">
                    <label class="checkbox-label">
                        <input
                                type="checkbox"
                                bind:checked={agreeTerms}
                                on:change={checkAgreeAll}
                        />
                        <span
                        >[Required] <a
                                href="#"
                                on:click|preventDefault={() => navigate("/terms")}
                        >
                terms of use
              </a></span
                        >
                    </label>
                    <label class="checkbox-label">
                        <input
                                type="checkbox"
                                bind:checked={agreePrivacy}
                                on:change={checkAgreeAll}
                        />
                        <span
                        >[Required] <a
                                href="#"
                                on:click|preventDefault={() => navigate("/privacy-policy")}
                        >
                privacy policy
              </a></span
                        >
                    </label>
                </div>
            </div>

            <div class="buttons-container">
                <button class="google-login-btn" on:click={loginWithGoogle}>
                    <img
                            src={googleLogo}
                            alt="Google Logo"
                            class="google-logo"
                    />
                    Sign in with Google
                </button>

                <button class="apple-login-btn" on:click={loginWithApple}>
                    <img
                            src={appleLogo}
                            alt="Apple Logo"
                            class="apple-logo"
                    />
                    Sign in with Apple
                </button>
            </div>
        </form>
    </div>

    <BottomNavigationBar/>
{/if}

<style>
    body {
        margin: 0;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    }

    .container {
        padding: 2rem;
        max-width: 600px;
        margin: auto;
    }

    .alert {
        padding: 1rem;
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        margin-bottom: 1rem;
    }

    .buttons-container {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        gap: 1.15rem;
    }

    .apple-login-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #000000; /* 기본: 검정 버튼 */
        color: #ffffff;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px; /* 권장 라운드 */
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        max-width: 300px;
        height: 44px;
    }

    .google-login-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #ffffff;
        color: black;
        padding: 0.5rem 1rem;
        padding-left: 1.9rem; /* ← 이거 추가 */
        border: 1px solid #aaa;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        max-width: 300px;
    }

    .google-login-btn:hover {
        background-color: #f0f0f0;
        border: 1px solid #aaa;
    }

    .google-logo {
        width: 24px;
        height: 24px;
        margin-right: 7px;
    }

    .apple-logo {
        width: 40px; /* 원하시는 크기로 조정 */
        height: 40px;
    }

    .checkbox-container {
        margin-top: 1rem;
        margin-bottom: 1.5rem;
        padding: 0.75rem 1rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        background-color: #fafafa;
    }

    .checkbox-label {
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #333;
    }

    .checkbox-label a {
        color: #007bff;
        text-decoration: none;
    }

    .checkbox-label a:hover {
        text-decoration: underline;
    }

    .checkbox-label input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
    }

    .checkbox-label a {
        color: #000; /* 검정색 */
        text-decoration: underline; /* 점선 밑줄로 링크임을 표현 */
        font-weight: 500;
        cursor: pointer;
    }

    .checkbox-label a:hover {
        color: #444; /* 호버 시 약간 진하게 */
        text-decoration: underline solid;
        text-decoration-thickness: 2px;
    }

    .apple-login-btn:hover {
        background-color: #111111;
    }
</style>
