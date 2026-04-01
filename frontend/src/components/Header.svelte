<script>
    export let is_login;
    export let username;

    export let goToHome;
    export let goToLogin;
    export let handleLogout;
</script>

<div class="header">
    <div on:click={goToHome} style="cursor: pointer; font-weight: 1000;">
        FanCam AI
    </div>

    <div class="header-buttons">
        {#if is_login}
            <div class="username-display">{username}</div>
            <button on:click={handleLogout}>Log out</button>
        {:else}
            <button on:click={goToLogin}>Log in</button>
        {/if}
    </div>
</div>

<style>
    .header {
        background: #ffffff;
        padding-top: calc(1.25rem + env(safe-area-inset-top));
        padding-right: 2rem;
        padding-bottom: 1.25rem;
        padding-left: 2rem;
        font-size: 1.75rem;
        font-weight: 700;
        color: #000000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e5e5e5;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .header-buttons {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
    }

    .header-buttons button {
        padding: 0.4rem 0.75rem;
        font-size: 1rem;
        font-weight: 700;
        background: #fff;
        border: 1px solid #999;
        border-radius: 6px;
        cursor: pointer;
    }

    .header-buttons button:hover {
        background: #f0f0f0; /* 호버 시 배경색 변경 */
    }


    .username-display {
        font-size: 0.9rem;
        margin-right: 0.25rem;
        font-weight: 700;

        white-space: nowrap; /* 한 줄로 유지 */
        overflow: hidden; /* 넘치는 텍스트 숨김 */
        text-overflow: ellipsis; /* ...으로 표시 */
        max-width: 60px; /* 원하는 최대 너비 설정 */
    }
</style>
