<!-- LicenseCredits.svelte -->
<script>
  import { navigate } from "svelte-routing";
</script>

<section>
  <h1></h1>
  <h1>FanCam AI Credits</h1>

  <h2>1. YOLO-NAS Model Architecture</h2>
  <p>
    Developed by <strong>Deci-AI</strong> (<a
      href="https://github.com/Deci-AI/super-gradients"
      target="_blank">GitHub</a
    >)<br />
    Licensed under <strong>Apache License 2.0</strong> (<a
      href="https://www.apache.org/licenses/LICENSE-2.0"
      target="_blank">Full text</a
    >)<br />
    This app does not perform inference using Deci-AI's pretrained weights.
  </p>

  <h2>2. Open Images Dataset V7</h2>
  <p>
    Dataset: <strong>Open Images Dataset V7</strong><br />
    © Google LLC, licensed under <strong>CC BY 4.0</strong> (<a
      href="https://creativecommons.org/licenses/by/4.0/"
      target="_blank">License link</a
    >)<br />
    Image data: CC BY 2.0 (<a
      href="https://creativecommons.org/licenses/by/2.0/"
      target="_blank">License link</a
    >)
  </p>
  <p>
    Image data: CC BY 2.0 (<a
      href="https://creativecommons.org/licenses/by/2.0/"
      target="_blank">License link</a
    >)
  </p>
  <p>Used for training in this app.</p>
  <p>
    <em>Attribution:</em> This app uses data from the Open Images Dataset V7. Annotation
    data: © Google LLC, CC BY 4.0 Image data: © Google LLC, CC BY 2.0
  </p>

  <h2>3. FFmpeg</h2>
  <p>
    This application uses <strong>FFmpeg</strong> for video processing (metadata
    extraction, GIF conversion).<br />
    FFmpeg is licensed under
    <strong>LGPL 2.1 or later / GPL 2.0 or later</strong>
    (<a href="https://ffmpeg.org/legal.html" target="_blank">Details</a>).<br />
    No GPL-only libraries are linked, and FFmpeg is used only as an external executable.<br
    />
    GIF conversion and metadata operations involve no codec patent issues. The app
    does not use FFmpeg libraries or plugins internally, and all video processing
    (GIF conversion, metadata extraction, etc.) is performed on external servers using
    FFmpeg.
  </p>

  <h2>4. Notes</h2>
  <p>
    No source code disclosure or model release is required by CC BY 4.0,
    Apache-2.0, or LGPL when used in this manner.<br />
    The License / Credits page is accessible from the app (About / Legal / Settings).<br
    />
    Including this section in Terms of Service is optional, but recommended for clarity.
    General support:
    <a href="mailto:kangfancam@gmail.com">kangfancam@gmail.com</a>
  </p>
  <div style="height: 300px;"></div>
</section>

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
  section {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    line-height: 1.6;
  }

  h1,
  h2 {
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

  .bottom-nav button svg {
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
  }
</style>
