<script>
    import {onMount} from "svelte";
    import fastapi from "../lib/api";
    import {is_login, username, result_list, logout} from "../lib/store";
    import {navigate} from "svelte-routing";
    import {goToHome, goToLogin} from "../lib/navigation";
    import {initRevenueCat, checkPurchase} from "../lib/purchases";
    import Header from "../components/Header.svelte";
    import BottomNavigationBar from "../components/BottomNavigationBar.svelte";

    let openMenu = {};
    let currentPlan = "";
    let isUpdated = true;
    let appVersion = "2.0";

    let visibleMap = {};

    function lazyLoad(node, id) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        visibleMap = {...visibleMap, [id]: true};
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
        openMenu = {...openMenu, [id]: !openMenu[id]};
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

        fastapi("get", "/share/result_list", {}, (json) => {
            result_list.set(json);
        });
    }

    function delete_result(id) {
        if (!confirm("Do you want to delete it")) return;
        fastapi("delete", `/share/${id}`, {});
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

    function setPassword(id) {
        const password = prompt("Enter the password to set for the Share Link :");
        if (!password) return;
        const formData = new FormData();
        formData.append("password", password);
        fastapi("post", `/share/set_private/${id}`, formData,
            (res) => {
                alert("Share Link password has been set.");
            },
            (err) => {
                alert("Failed to set the password for the Share Link.");
            },
        );
    }
    function handleLogout(){
        logout();
    }

    function removePassword(id) {
        fastapi("post", `/share/set_public/${id}`, {},
            (res) => {
                alert("Share Link password has been removed.");
            },
            (err) => {
                alert("Failed to remove the password for the Share Link.");
            },
        );
    }

    onMount(async () => {
        visibleMap = {};

        await fastapi("get", "/user/app_version", null, (res) => {
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
            "/user/me_check_premium",
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
            (err) => {
                alert("Please Log In to Continue!");
                is_login.set(false);
                navigate("/user-login");
            },
        );
    });
</script>

<svelte:window on:click={handleOutsideClick}/>

{#if isUpdated}
    <Header
            is_login={$is_login}
            username={$username}
            {goToHome}
            {goToLogin}
            {handleLogout}
    />

    <div class="container">
        <div class="main">
            {#each $result_list as result (result.id)}
                <div class="media-card menu-container" use:lazyLoad={result.id}>
                    <div class="media-wrapper">
                        {#if visibleMap[result.id]}
                            {#if result.file_type === "image/gif"}
                                <img src={result.owner_url} alt={result.title}/>
                            {:else if result.file_type === "video/mp4"}
                                <video controls playsinline webkit-playsinline>
                                    <source src={result.owner_url} type="video/mp4"/>
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
                            <button class="btn" on:click={() => setPassword(result.id)}>
                                Set PW
                            </button>

                            <button class="btn" on:click={() => removePassword(result.id)}>
                                Remove PW
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

                            <button class="btn" on:click={() => delete_result(result.id)}>
                                Delete
                            </button>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <div class="bottom-nav-safe" on:click|stopPropagation>
        <BottomNavigationBar/>
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
    top: 40px;
    right: 10px;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(12px);
    border-radius: 12px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    z-index: 10;

    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);

    animation: dropdown 0.18s ease-out;
}

/* 버튼 */
.btn {
    font-size: 0.82rem;
    padding: 0.55rem 0.9rem;
    border-radius: 8px;
    cursor: pointer;

    background: #ffffff;
    color: #222;

    font-weight: 800; /* 👉 핵심: 더 또렷하게 */
    letter-spacing: 0.2px;

    border: 1px solid #e6e6e6;

    transition:
        transform 0.15s ease,
        background 0.15s ease,
        box-shadow 0.15s ease;
}

/* 버튼 간 간격 */
.btn + .btn {
    margin-top: 4px;
}

/* hover */
.btn:hover {
    background: #f4f4f4;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.08);
}

/* 클릭 */
.btn:active {
    transform: scale(0.96);
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

/* 위험 버튼 */
.btn.delete {
    color: #d33;
    border-color: #f1caca;
}

.btn.delete:hover {
    background: #d33;
    color: white;
    border-color: #d33;
}

/* 드롭다운 등장 애니메이션 */
@keyframes dropdown {
    from {
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>
