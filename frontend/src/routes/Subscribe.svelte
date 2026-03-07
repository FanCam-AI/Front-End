    <script>
      import { onMount } from "svelte";
      import fastapi from "../lib/api";
      import { is_login, username, logout } from "../lib/store";
      import { navigate } from "svelte-routing";
      import Header from "../components/Header.svelte";
      import BottomNavigationBar from "../components/BottomNavigationBar.svelte";

      import {
        initRevenueCat,
        getOfferings,
        purchase,
        checkPurchase,
      } from "../lib/purchases";
      import { goToHome, goToLogin } from "../lib/navigation.js";

      let offerings = null;
      let error = null;
      let isUpdated = true;
      let appVersion = "1.7";

      let currentPlan = null;

      async function handlePurchase(pkg) {
        try {
          if (currentPlan === "" || currentPlan === "FREE") {
            alert(
              "Your purchase is in progress. Please wait until the completion alert appears!",
            );
          }
          const res = await purchase(pkg);
          if (currentPlan === "PREMIUM") {
            return;
          }
          alert("Premium subscription has been successfully purchased! Welcome!");
        } catch (e) {
          if (currentPlan === "PREMIUM") {
            return;
          }
          alert(
            "Failed to purchase the premium subscription. Please try again later.",
          );
        }
      }

      async function restorePurchase() {
        currentPlan = await checkPurchase();
        alert("Purchase restored successfully!");
      }

      onMount(async () => {
        try {
          await initRevenueCat();
          offerings = await getOfferings();
        } catch (e) {
          error = e;
        }
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
        {logout}
      />
      <main class="plan-flow">
        {#if $is_login}
          <section class="my-plan-card">
            <div class="plan-title">MY Plan: {currentPlan}</div>
          </section>
        {/if}

        <section class="subscribe-container">
          <div class="plan-grid">
            <div class="plan-card">
              <h3>PREMIUM</h3>
              <div class="price">$3.99 /week</div>
              <div class="feature">1. High-Quality & High-Frame GIF Conversion</div>
              <div class="feature">2. Unlock AI-Powered Tracking</div>
              <div class="feature">3. Supports up to 3 images per Target</div>
              <div class="feature">4. Save to My Gallery</div>

              {#if error}
                <p style="color: red;">{error}</p>
              {:else if offerings}
                {#each offerings.current?.availablePackages as pkg}
                  <div class="terms-card">
                    <div class="terms-item">
                      <label for="terms"
                        >fancam ai <a
                          href="#"
                          on:click|preventDefault={() => navigate("/terms")}
                        >
                          terms of use
                        </a>
                      </label>
                    </div>
                    <div class="terms-item">
                      <label for="terms"
                        >fancam ai <a
                          href="#"
                          on:click|preventDefault={() =>
                            navigate("/privacy-policy")}
                        >
                          privacy policy
                        </a>
                      </label>
                    </div>
                  </div>

                  <button class="cta w-full" on:click={() => handlePurchase(pkg)}>
                    {currentPlan === "PREMIUM"
                      ? "Manage Subscription"
                      : "Subscribe"}
                  </button>

                    <button class="cta w-full" on:click={""}>
                        {currentPlan === "PREMIUM"
                      ? "QR code authentication"
                      : "Restore Purchases"}
                    </button>

                {/each}
              {:else}{/if}
            </div>

            <div class="plan-card">
              <h3>FREE</h3>
              <div class="price">$0</div>
              <div class="feature">
                1. Make GIF and VIDEO from any part you want!
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNavigationBar />

      <div style="height: 300px;"></div>
    {/if}

    <style>
      :root {
        --primary: #222222; /* 기본 검정에 가까운 진한 회색 */
        --primary-light: #444444; /* 약간 더 밝은 회색 */
        --primary-dark: #000000; /* 완전한 검정 */
        --bg-light: #eeeeee; /* 밝은 회색 (배경용) */
      }

      body {
        margin: 0;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        background: var(--bg-light);
        color: #333;
      }

      .my-plan-card {
        max-width: 680px;
        margin: 1.5rem auto;
        padding: 1.25rem 1.75rem;
        border-left: 6px solid var(--primary);
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
        text-align: center;
      }
      .plan-title {
        font-size: 1.3rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--primary-dark);
      }

      /* ───────────────  Plan Grid  ─────────────── */
      .plan-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
      }

      .plan-card {
        background: #fff;
        border: 1px solid var(--primary-light);
        border-radius: 16px;
        padding: 1.75rem 1.25rem;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        transition:
          transform 0.2s,
          box-shadow 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .plan-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      }
      .plan-card h3 {
        margin: 0 0 0.75rem 0;
        font-size: 1.25rem;
        color: var(--primary-dark);
      }
      .plan-card .price {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
        color: var(--primary);
      }
      .feature {
        font-size: 0.9rem;
        color: #555;
        margin: 0.15rem 0;
      }
      .cta {
        margin-top: 1rem;
        padding: 0.55rem 1.25rem;
        background: rgba(255, 255, 255, 0.5); /* 흰색 + 50% 투명 */
        color: #000;
        border: 1px solid #000;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .cta:hover {
        background: rgba(255, 255, 255, 0.7); /* 흰색 + 50% 투명 */
      }

      /* ───────────────  Terms  ─────────────── */
      .terms-card {
        max-width: 680px;
        margin: 2rem auto;
        padding: 1rem 1.5rem;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border: 1px solid #e5e5e5;
      }
      .terms-item {
        display: flex;
        flex-direction: column; /* 세로로 배치 */
        align-items: center; /* 가로 가운데 정렬 */
        gap: 0.6rem;
        margin: 0.5rem 0;
      }

      .terms-item a {
        color: #000;
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 2px;
        font-weight: 500;
        transition:
          color 0.2s ease,
          text-decoration-thickness 0.2s ease;
      }

      .terms-item a:hover {
        color: #333;
        text-decoration-thickness: 2px;
      }

      @media (max-width: 768px) {
        .my-plan-card {
          width: 100%;
          box-sizing: border-box;
          margin: 1rem auto;
          padding: 1rem 1.25rem;
        }

        .terms-card {
          width: 100%;
          box-sizing: border-box;
          margin: 1rem auto;
          padding: 1rem 1.25rem;
        }

        .plan-flow {
          display: flex; /* block → flex */
          flex-direction: column; /* 위→아래 흐름 */
        }
      }
    </style>
