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
  let appVersion = "1.4";

  function toggleMenu(id) {
    openMenu = {
      ...openMenu,
      [id]: !openMenu[id],
    };
  }

  function handleOutsideClick(event) {
    if (!event.target.closest(".menu-container")) {
      openMenu = {};
    }
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

    fastapi("delete", `/api/result/${id}`, {}, () => {
      get_result_list();
    });
  }

  function downloadFile(url, filename = "download") {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function copyLink(url) {
    navigator.clipboard.writeText(url).then(
      () => {
        alert("The link has been copied!");
      },
      () => {
        alert("Failed to copy the link.");
      },
    );
  }

  onMount(async () => {
    await fastapi("get", "/api/app/version", null, (res) => {
      if (res.app_version !== appVersion) {
        isUpdated = false;
        alert("Please update the app from the App Store");
      } else {
        isUpdated = true;
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
        if (currentPlan === "" || currentPlan === "FREE") {
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
      (err) => {
        username.set("");
        is_login.set(false);
        alert("Please log in to continue!");
        navigate("/user-login");
      },
    );
  });
</script>

<!-- 전역 클릭 리스너 -->
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
        {#if result.file_type === "image/gif"}
          <div class="card">
            <img src={result.owner_url} alt={result.title} />
            <!-- 점3개 버튼 -->
            <button
              class="ellipsis"
              on:click|stopPropagation={() => toggleMenu(result.id)}>⋯</button
            >
            <!-- openMenu[result.id]가 true일 때만 표시 -->
            {#if openMenu[result.id]}
              <div class="button-group">
                <button
                  class="btn delete"
                  on:click={() => delete_result(result.id)}>Delete</button
                >
                <button
                  class="btn copy"
                  on:click={() => copyLink(result.share_url)}>Copy Link</button
                >
                <button
                  class="btn download"
                  on:click={() => downloadFile(result.owner_url, result.title)}
                  >Download</button
                >
              </div>
            {/if}
          </div>
        {:else if result.file_type === "video/mp4"}
          <!-- 기존 .video-container 안에 있던 버튼들을 이렇게 감싸줍니다 -->
          <div class="video-container">
            <video controls>
              <source src={result.owner_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button
              class="ellipsis"
              on:click|stopPropagation={() => toggleMenu(result.id)}>⋯</button
            >
            <!-- openMenu[result.id]가 true일 때만 표시 -->
            {#if openMenu[result.id]}
              <div class="button-group">
                <button
                  class="btn delete"
                  on:click={() => delete_result(result.id)}>Delete</button
                >
                <button
                  class="btn copy"
                  on:click={() => copyLink(result.share_url)}>Copy Link</button
                >
                <button
                  class="btn download"
                  on:click={() => downloadFile(result.owner_url, result.title)}
                  >Download</button
                >
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  </div>

  <BottomNavigationBar />

  <div style="height: 300px;"></div>
{/if}

<style>
  body {
    margin: 0;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  .container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main {
    flex: 1;
    padding: 2rem;
    background: #ffffff;
    display: flex;
    gap: 3rem;
    flex-wrap: wrap;
  }

  .card,
  .video-container {
    width: auto;
    height: auto;
    max-width: 300px;
    max-height: 400px;

    margin-bottom: 4rem;
    position: relative;
  }

  video,
  img {
    width: 100%;
    height: auto;
    object-fit: contain;
  }

  /* 카드(.card)와 비디오(.video-container)에 모두 적용 */
  .card,
  .video-container {
    position: relative;
  }

  /* 점 3개 버튼 */
  .ellipsis {
    color: white;
    position: absolute;
    top: 8px;
    right: 8px;
    background: transparent;
    border: none;
    font-size: 1.65rem;
    cursor: pointer;
    line-height: 1;
  }

  /* 버튼 그룹 (토글 시 나타남) */
  .card .button-group,
  .video-container .button-group {
    position: absolute;
    top: 36px; /* ellipsis 아래로 */
    right: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: rgba(255, 255, 255, 0.95);
    padding: 4px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  /* 버튼 공통 스타일 */
  .button-group .btn {
    display: inline-block;
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
    background: #fff;
    border: 1px solid #999;
    border-radius: 4px;
    cursor: pointer;
  }
  .button-group .btn:hover {
    background: #f0f0f0;
  }
</style>
