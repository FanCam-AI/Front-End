<!-- PrivacyPolicy.svelte -->
<script>
  import { navigate } from 'svelte-routing';
  // 다국어 지원 또는 동적 내용(예: lastUpdated)을 추가하려면 이 스크립트에 로직을 넣으세요.
  export let lastUpdated = 'September 04, 2025';
  export let supportEmail = 'support@fancamai.com';
  export let dmcaEmail = 'dmca@fancamai.com';
  export let companyAddress = '[Company Address]';
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
      height: 90px; /* 높이 조절 */
      display: flex;
      justify-content: space-around; /* 버튼 사이 간격 고르게 */
      align-items: center;
      background-color: #ffffff;
      border-top: 1px solid #ddd;
      box-shadow: 0 -1px 5px rgba(0,0,0,0.1);
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

<section>
<h1></h1>
  <h1>FanCam AI Privacy Policy</h1>
  <div class="meta">Last updated: 2025.09.16</div>

  <p>
    FanCam AI ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your information.
  </p>

  <h2>Applicability</h2>

  <p>FanCam AI is intended for users located in the **United States and Asia. We **do not target or provide services to residents of the European Union (EU).
     We currently do not provide services to users in the European Union (EU) or European Economic Area (EEA).
     If we decide to support EU/EEA users in the future, the GDPR provisions described below will apply.
</p>
  <p>If you are accessing this Service from the EU, please be aware that certain features may be restricted, and the service may not function properly. By using the Service, you confirm that you are not located in the EU or acting on behalf of an EU resident.</p>

  <h2>1. Information We Collect</h2>
  <p>When you use FanCam AI, we may collect the following:</p>

  <h3>(1) Content Uploaded by Users</h3>
  <ul>
    <li><strong>Video files</strong> uploaded for processing.</li>
    <li><strong>Target object images</strong> (screenshots of humans or pets such as dogs, cats).</li>
    <li><strong>Time ranges</strong> selected for video/GIF generation.</li>
  </ul>
  <p>
    These files are used <strong>only for generating your requested results</strong> and are <strong>automatically deleted after processing</strong> unless you are a Premium user who explicitly saves generated outputs to <em>My Gallery</em>.
  </p>

  <h3>(2) Generated Results</h3>
  <ul>
    <li><strong>Free Plan Users</strong>: Results are available for immediate download and are not stored by default.</li>
    <li><strong>Premium Plan Users</strong>: Results may be stored securely in your <em>My Gallery</em> until you choose to delete them.</li>
  </ul>
  <p>Please note that if a Premium user cancels their subscription or their subscription period ends, any results saved in My Gallery will be permanently deleted.</p>
  <p><strong>We do not guarantee permanent storage.</strong> You are responsible for maintaining your own backups.</p>

  <h3>(3) Account Information</h3>
  <ul>
    <li><strong>Google Sign-In</strong>: We collect your Google account email.</li>
    <li><strong>Apple Sign-In</strong>: We collect your Apple account email.</li>
  </ul>

  <h3>(4) Usage Data</h3>
  <ul>
    <li>Device type, operating system, app version.</li>
    <li>App logs, crash reports, and performance data.</li>
    <li>Aggregated, anonymized analytics.</li>
  </ul>
  <p>We do <strong>not</strong> track users across third-party apps or websites for advertising purposes.</p>

  <h2>2. How We Use Information</h2>
  <p>We use collected data to:</p>
  <ul>
    <li>Provide and improve the FanCam AI service.</li>
    <li>Generate personalized fancam videos or GIFs.</li>
    <li>Manage subscriptions and payments.</li>
    <li>Provide customer support.</li>
    <li>Ensure security, prevent fraud, and comply with legal obligations.</li>
  </ul>
  <p>We <strong>never sell</strong> your personal data to third parties.</p>

  <h2>3. Legal Basis for Processing (GDPR Users)</h2>
  <p>Note: This section applies only if FanCam AI begins providing services to EU/EEA users in the future.
For those users, we will process personal data based on the following legal bases under GDPR:</p>
  <ul>
    <li><strong>Consent</strong> (e.g., uploading content for processing).</li>
    <li><strong>Contract necessity</strong> (to provide the Service).</li>
    <li><strong>Legal obligations</strong> (billing, compliance, security).</li>
  </ul>

  <h2>4. Data Storage & Deletion</h2>
  <ul>
    <li><strong>Uploaded content</strong> → Deleted automatically after processing.</li>
    <li><strong>Generated results</strong> → Stored in My Gallery for Premium users until deletion.</li>
    <li><strong>Account and payment records</strong> → Retained as long as legally required for billing and compliance.</li>
    <p>Please note that if a Premium user cancels their subscription or their subscription period ends, any results saved in My Gallery will be permanently deleted.</p>
  </ul>

  <h2>5. Data Sharing & Third Parties</h2>
  <p>We may share information only in limited cases:</p>
  <ul>
    <li><strong>Service providers</strong>: e.g., cloud hosting, analytics, payment processing (RevenueCat, Apple).</li>
    <li><strong>Legal compliance</strong>: when required by law, court order, or regulatory authorities.</li>
    <li><strong>Business transfers</strong>: in connection with mergers, acquisitions, or asset sales.</li>
  </ul>
  <p>We do <strong>not</strong> share uploaded videos, screenshots, or generated results with advertisers.</p>

  <h2>6. Security</h2>
  <p>We implement safeguards including encrypted data transfer (HTTPS), secure cloud storage with restricted access, and automatic deletion of sensitive content. However, no internet-based system is 100% secure. By using our Service you acknowledge the inherent risks of transmitting data online.</p>

  <h2>7. Children’s Privacy</h2>
  <p>Our Service is <strong>not intended for children under 13 years of age</strong> (or the minimum legal age in your jurisdiction). We comply with the <strong>U.S. Children’s Online Privacy Protection Act (COPPA)</strong>. If information of children under 13 is discovered, it will be deleted immediately.</p>

  <h2>8. International Data Transfers</h2>
  <p>Your information may be processed and stored in the <strong>United States</strong> or other countries where our service providers operate. Privacy laws in these countries may differ from those in your country. When required, we use safeguards such as <strong>Standard Contractual Clauses (SCCs)</strong> to ensure adequate protection.</p>

  <h2>9. Your Rights</h2>
  <p>Depending on your location, you may have rights under GDPR, CCPA, or other privacy laws, including:</p>
  <ul>
    <li>Access to your data.</li>
    <li>Correction or deletion of data.</li>
    <li>Withdrawal of consent.</li>
    <li>Data portability.</li>
    <li>Filing complaints with a data protection authority.</li>
  </ul>
  <p>Requests can be submitted at Email : kangfancam@gmail.com.</p>



  <h2>10. Technologies We Use</h2>
  <p><strong>Authentication Tokens</strong></p>
  <p>
    <strong>Access Token:</strong> Stored in the device’s secure storage and used for Service requests.
  </p>
  <p>
    <strong>Refresh Token:</strong> Used to issue new Access Tokens. For all logins, Refresh Tokens
    generated by us are stored securely on the device. For <strong>Apple Sign-In</strong>, an
    Apple-issued Refresh Token is also securely encrypted and stored in our database (DB). This
    Apple Refresh Token is used <strong>only for account unlinking upon account deletion</strong> and
    is never used for any other purpose.
  </p>
  <p>
    ⚠️ Refresh Tokens are rotated each time the app is accessed. As long as you use the Service within
    6 months, you will not be automatically logged out.
  </p>

  <p><strong>Essential Cookies</strong></p>
  <p>
    During Google and Apple social login, each provider may set its own session cookies. These cookies
    are essential for login functionality and are not controlled by us. For details, please review
    <a href="https://policies.google.com/privacy" target="_blank">Google’s Privacy Policy</a> and
    <a href="https://www.apple.com/legal/privacy/" target="_blank">Apple’s Privacy Policy</a>.
  </p>

  <p><strong>Analytics/Performance Cookies (Optional)</strong></p>
  <p>
    We may use tools such as Google Analytics or Firebase Analytics in the future to improve Service
    quality. These will only be enabled after prior notice and, where required, obtaining your
    consent. We do <strong>not</strong> use cookies for advertising or marketing purposes.
  </p>

  <h2>11. Retention Periods</h2>
  <p><strong>Refresh Tokens:</strong> Valid for up to 6 months (rotated whenever the Service is accessed).</p>
  <p><strong>Apple Refresh Token (DB-stored):</strong> Deleted immediately once your account is removed and the unlinking process is complete.</p>
  <p><strong>Session Cookies:</strong> Retained for the duration of the login session and may expire when the browser/webview is closed.</p>
  <p><strong>Analytics Cookies (if introduced):</strong> Retention depends on the policies of the respective tools and will be separately disclosed.</p>

  <h2>12. Your Choices</h2>
  <p><strong>Logout:</strong> Logging out from the app deletes Access Tokens and Refresh Tokens stored on the device.</p>
  <p><strong>App Deletion:</strong> Removing the app from your device deletes all locally stored data.</p>
  <p><strong>Browser/Webview Settings:</strong> Cookies set by Google or Apple during login can be managed or deleted via your browser/device settings.</p>
  <p><strong>Analytics Opt-Out:</strong> If analytics tools are introduced, you will be provided with options to opt in or out.</p>

  <h2>13. Third-Party Cookies</h2>
  <p>
    FanCam AI does not use advertising or marketing cookies. However, Google and Apple may set their
    own cookies or trackers during the social login process, which are outside of our control.
  </p>

  <h2>14. Changes to This Policy</h2>
  <p>We may update this Privacy Policy from time to time. Updates will be posted in the app. The “Last Updated” date at the top will reflect the latest revision.</p>

  <h2>15. Contact Us</h2>
  <p>
    If you have questions about this Privacy Policy or your data, please contact us:
  </p>
  <p>
    📧 Email: kangfancam@gmail.com<br>
  </p>

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