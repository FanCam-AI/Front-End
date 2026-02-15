<script>
  import { onMount } from "svelte";
  import fastapi from "../lib/api";
  import { is_login, username, result_list, logout } from "../lib/store";
  import { navigate } from "svelte-routing";
  import { goToHome, goToLogin } from "../lib/navigation";
  import { initRevenueCat, checkPurchase } from "../lib/purchases";
  import Header from "../components/Header.svelte";
  import BottomNavigationBar from "../components/BottomNavigationBar.svelte";

  let openMenu = {};
  let currentPlan = "";
  let isUpdated = true;
  let appVersion = "1.7";

  let visibleMap = {};

  function lazyLoad(node, id) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleMap = { ...visibleMap, [id]: true };
            observer.disconnect(); // 이 카드만 관찰 종료
          }
        });
      },
      {
        rootMargin: "200px",
        threshold: 0.1,
      },
    );

    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }

  function toggleMenu(id) {
    openMenu = { ...openMenu, [id]: !openMenu[id] };
  }

  function handleOutsideClick(event) {
    if (
      event.target.closest(".menu-container") ||
      event.target.closest(".bottom-nav-safe")
    ) {
      return;
    }
    openMenu = {};
  }

  function get_result_list() {
    if (!$is_login) {
      alert("You need to log in to continue!");
      navigate("/user-login");
      return;
    }

    fastapi("get", "/api/result/result_list", {}, (json) => {
      result_list.set(json);
    });
  }

  function delete_result(id) {
    if (!confirm("Do you want to delete it")) return;
    fastapi("delete", `/api/result/${id}`, {}, get_result_list);
  }

  function downloadFile(url, filename = "download") {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  }

  function copyLink(url) {
    navigator.clipboard.writeText(url).then(
      () => alert("The link has been copied!"),
      () => alert("Failed to copy the link."),
    );
  }

  onMount(async () => {
    visibleMap = {};

    await fastapi("get", "/api/app/version", null, (res) => {
      isUpdated = res.app_version === appVersion;
      if (!isUpdated) {
        alert("Please update the app from the App Store");
      }
    });

    await initRevenueCat();
    currentPlan = await checkPurchase();

    const formData = new FormData();
    formData.append("current_plan", currentPlan);

    await fastapi(
      "post",
      "/api/user/me_check_premium",
      formData,
      (res) => {
        if (!currentPlan || currentPlan === "FREE") {
          alert("My-Gallery is only available to Premium plan users");
          if (res.is_updated) {
            alert(
              "Your saved results are currently stored in My-Gallery. Since your Premium plan has ended, they are now password-protected and will be deleted in the future.",
            );
          }
          navigate("/subscribe");
          return;
        }
        username.set(res.username);
        is_login.set(true);
        get_result_list();
      },
      () => {
        is_login.set(false);
        navigate("/user-login");
      },
    );
  });
</script>

<svelte:window on:click={handleOutsideClick} />

{#if isUpdated}
  <Header
    is_login={$is_login}
    username={$username}
    {goToHome}
    {goToLogin}
    {logout}
  />

  <div class="container">
    <div class="main">
      {#each $result_list as result (result.id)}
        <div class="media-card menu-container" use:lazyLoad={result.id}>
          <div class="media-wrapper">
            {#if visibleMap[result.id]}
              {#if result.file_type === "image/gif"}
                <img src={result.owner_url} alt={result.title} />
              {:else if result.file_type === "video/mp4"}
                <video controls playsinline webkit-playsinline>
                  <source src={result.owner_url} type="video/mp4" />
                </video>
              {/if}
            {:else}
              <div class="placeholder"></div>
            {/if}
          </div>

          <button
            class="ellipsis"
            on:click|stopPropagation={() => toggleMenu(result.id)}
          >
            ⋯
          </button>

          {#if openMenu[result.id]}
            <div class="button-group">
              <button class="btn" on:click={() => delete_result(result.id)}>
                Delete
              </button>
              <button class="btn" on:click={() => copyLink(result.share_url)}>
                Copy Link
              </button>
              <button
                class="btn"
                on:click={() => downloadFile(result.owner_url, result.title)}
              >
                Download
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <div class="bottom-nav-safe" on:click|stopPropagation>
    <BottomNavigationBar />
  </div>
{/if}

<style>
  body {
    margin: 0;
    font-family: Helvetica, Arial, sans-serif;
  }

  .container {
    min-height: 100vh;
    padding-bottom: 90px;
  }

  .main {
    padding: 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, 280px);
    gap: 2.5rem;
    justify-content: center;
  }

  .media-card {
    position: relative;
    width: 280px;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }

  .media-wrapper {
    width: 100%;
    background: #000;
  }

  img,
  video {
    width: 100%;
    height: auto;
    object-fit: contain;
  }

  .placeholder {
    width: 100%;
    height: 180px;
    background: #111;
  }

  .ellipsis {
    position: absolute;
    top: 8px;
    right: 8px;
    background: transparent;
    border: none;
    color: white;
    font-size: 1.6rem;
    cursor: pointer;
    z-index: 5;
  }

  .button-group {
    position: absolute;
    top: 36px;
    right: 8px;
    background: #fff;
    border-radius: 6px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 10;
  }

  .btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.75rem;
    border: 1px solid #999;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn:hover {
    background: #f0f0f0;
  }
</style>
