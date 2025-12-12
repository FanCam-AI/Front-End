<!-- Manual.svelte -->
<script>
  import { navigate } from 'svelte-routing';
</script>

<style>
  section {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    line-height: 1.6;
  }

  h1, h2 {
    color: #333;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.25rem;
    margin-top: 1.5rem;
  }

  p {
    margin-bottom: 1rem;
  }

  strong {
    color: #111;
  }

  a {
    color: #0070f3;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 90px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: #ffffff;
    border-top: 1px solid #ddd;
    box-shadow: 0 -1px 5px rgba(0,0,0,0.1);
  }

  .bottom-nav button {
    display: flex;
    flex-direction: column;
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
    color: #007bff;
  }

  .bottom-nav button svg {
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
  }
</style>

<section>
  <h1></h1>
  <h1>FanCam AI Manual</h1>

  <h2>1. Video Upload</h2>
  <p>Click the <strong>Choose File</strong> button to upload a video that is at least <strong>1 second long</strong>.<br>
  Supported formats: <strong>mp4, mov</strong></p>

  <h2>2. Target Screenshot(s) Upload</h2>
  <p>Take a screenshot from the uploaded video showing the <strong>person</strong> or <strong>pet</strong> you want to create a fan-cam of, and upload it.<br>
  <strong>Premium Users</strong>: Can upload up to 3 screenshots<br>
  <strong>Free Users</strong>: Screenshot upload is not available</p>

  <h2>3. Time Range</h2>
  <p>Enter the <strong>start time</strong> and <strong>end time</strong> from the uploaded video.<br>
  A <strong>GIF</strong> or <strong>Video</strong> will be generated based on the selected time range.</p>

  <h2>4. Auto-Edit GIF/VIDEO</h2>
  <p><strong>Premium Users</strong>: Based on the uploaded screenshot(s), choose whether to create a <strong>person fan-cam</strong> or a <strong>pet fan-cam</strong>, then click the corresponding button.<br>
  <strong>Free Users</strong>: The fan-cam feature (<em>AI Powered Tracking</em>) is not available. You can only choose between <strong>GIF</strong> or <strong>Video</strong>.</p>

  <h2>5. Troubleshooting</h2>
  <p>If the <strong>Processing progress</strong> stays at <strong>0% for more than 10 seconds</strong>:<br>
  1) Exit the app and restart it.<br>
  2) Check your <strong>Wi-Fi connection</strong>.<br>
  3) If the issue persists, contact <a href="mailto:kangfancam@gmail.com">FanCam AI Support</a>.</p>

  <div style="height: 300px;"></div>
</section>

<div class="bottom-nav">
  <button on:click={() => navigate('/subscribe')}>
    <span class="material-icons">credit_card</span>
    <span>Subscribe</span>
  </button>
  <button on:click={() => navigate('/')}>
    <span class="material-icons">home</span>
    <span>Home</span>
  </button>
  <button on:click={() => navigate('/my-gallery')}>
    <span class="material-icons">image</span>
    <span>My Gallery</span>
  </button>
  <button on:click={() => navigate('/settings')}>
    <span class="material-icons">settings</span>
    <span>Settings</span>
  </button>
</div>
