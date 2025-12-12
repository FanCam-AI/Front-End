<script>
  import { navigate } from "svelte-routing";
</script>

<div class="bottom-nav">
  <button on:click={() => navigate("/subscribe")}>
    <span class="material-icons">credit_card</span>
    <span>Subscribe</span>
  </button>
  <button on:click={() => navigate("/")}>
    <span class="material-icons">home</span>
    <span>Home</span>
  </button>
  <button on:click={() => navigate("/my-gallery")}>
    <span class="material-icons">image</span>
    <span>My Gallery</span>
  </button>

  <button on:click={() => navigate("/settings")}>
    <span class="material-icons">settings</span>
    <span>Settings</span>
  </button>
</div>

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 90px; /* 높이 조절 */
    display: flex;
    justify-content: space-around; /* 버튼 사이 간격 고르게 */
    align-items: center;
    background-color: #ffffff;
    border-top: 1px solid #ddd;
    box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
  }

  .bottom-nav button {
    display: flex;
    flex-direction: column; /* 아이콘 위, 텍스트 아래 */
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: #333;
    padding: 0;
  }

  .bottom-nav button:hover {
    color: #007bff; /* 활성화 느낌 */
  }
</style>
