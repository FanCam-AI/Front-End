<!-- TermsOfService.svelte -->
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
  <h1>FanCam AI Terms of Service</h1>
  <div class="meta">Last updated: 2025.09.16</div>

  <p>
    By accessing or using <strong>FanCam AI</strong> ("Service", "we", "us", "our") provided by FanCam AI, you agree to be bound by these Terms of Service ("Terms").
    If you do not agree to these Terms, you may not use the Service.
  </p>


  <h2>Geographic Restrictions</h2>
  <p>
    The FanCam AI Service is intended for use by individuals located in the **United States and Asia**. Access to or use of the Service from the **European Union (EU) or other regions where we do not operate** is prohibited.
  </p>

  <p>
  By accessing or using the Service, you represent and warrant that you are located in the United States or Asia and that you are not accessing the Service from the EU. The Company reserves the right to block or restrict access from regions where the Service is not available.

  </p>

  <h2>1. Acceptance of Terms</h2>
  <p>
    By accessing or using FanCam AI, you agree to be bound by these Terms. If you do not consent, you must refrain from using the Service. Continued use after amendments constitutes acceptance.
  </p>

  <h2>2. Description of Service</h2>
  <p>
    FanCam AI uses Object Tracking, Deep Learning (DL), and Machine Learning (ML) to generate personalized fancam videos or GIFs. Uploaded files are deleted after processing; Premium users may save outputs in “My Gallery”.
  </p>

  <h2>3. Interpretation and Definitions</h2>
  <p>
    Definitions include: <strong>Application</strong> (software), <strong>Application Store</strong> (Apple App Store), <strong>Company</strong> (FanCam AI), <strong>Service</strong> (the Application), and <strong>You</strong> (the user).
  </p>

  <h2>4. Acknowledgment</h2>
  <p>
    You represent that you are at least 13 years old. If 13–18, parental consent is required. Under-13s are prohibited per COPPA. Our FanCam AI Privacy Policy also applies.
  </p>

  <h2>5. Links to Other Websites</h2>
  <p>
    We are not responsible for third-party websites or services linked through our Service.
  </p>

  <h2>6. Termination</h2>
  <p>
    We may suspend or terminate access immediately for any violation. Rights cease upon termination.
  </p>

  <h2>7. Governing Law and Dispute Resolution</h2>
  <p>
    These Terms are governed by Delaware law. Disputes shall be resolved by binding arbitration (AAA). No class actions allowed. Arbitration takes place in New Castle County, Delaware. Users may opt out within 30 days by emailing <a href="mailto:kangfancam@gmail.com">kangfancam@gmail.com</a>.
  </p>

  <h2>8. Severability and Waiver</h2>
  <p>
    If a provision is unenforceable, the remainder remains valid. Failure to enforce is not a waiver.
  </p>

  <h2>9. User Content and License</h2>
  <p>
    You retain ownership of content. By uploading, you grant us a limited license to process it. Files are deleted after processing. Premium users may save outputs. We do not guarantee permanent storage.
  </p>

  <h2>10. Prohibited Conduct</h2>
  <p>
    You may not upload unlawful, infringing, obscene, or harmful content; misuse, reverse engineer, resell, or compromise the Service.
  </p>

  <h2>11. Copyright Infringement Notice</h2>
  <p>
    If you believe your copyright has been infringed, please send the FanCam AI Share Link containing the content and any materials that can verify your ownership to kangfancam@gmail.com.
    False or misleading claims may result in civil and criminal liability.
    Note: We plan to register a DMCA Agent in the future.
  </p>

  <h2>12. Termination of Service</h2>
  <p>
    We may terminate Service at any time. Premium users retain access until billing cycle ends, unless immediate termination is required.
  </p>

  <h2>13. "AS IS" Disclaimer</h2>
  <p>
    The Service is provided “AS IS” and “AS AVAILABLE”. No warranties are made for uninterrupted, error-free, or secure operation.
  </p>

  <h2>14. Limitation of Liability</h2>
  <p>
    Liability is limited to the greater of $100 or the amount paid. We are not liable for indirect or consequential damages, except as permitted by law.
  </p>

  <h2>15. Changes to Terms</h2>
  <p>
    We may update Terms at any time with 7 days’ notice for material changes. Continued use means acceptance.
  </p>

  <h2>16. In-App Purchases and Subscriptions</h2>
  <p>
    Purchases are processed by Apple. Subscriptions renew automatically unless canceled 24 hours before renewal. Refunds follow Apple’s policy and consumer protection laws.
  </p>

  <h2>17. User Content and AI Training Disclaimer</h2>
  <p>
    We do not use your uploaded content for AI training, machine learning, or purposes beyond generating outputs.
  </p>

  <h2>18. Privacy Policy</h2>
  <p>
    Use of the Service is also governed by our FanCam AI Privacy Policy.
  </p>

  <h2>19. Contact</h2>
  <p>
    General support: <a href="mailto:kangfancam@gmail.com">kangfancam@gmail.com</a><br/>
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