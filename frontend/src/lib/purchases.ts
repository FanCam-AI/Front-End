import {
  Purchases,
  LOG_LEVEL,
} from "@revenuecat/purchases-capacitor";

export async function initRevenueCat() {
  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  await Purchases.configure({
    apiKey: "appl_zTjPeGpDvlCMbZuPouajikuVhuR",
    appUserID: undefined, // 로그인 시스템이 있다면 여기에 사용자 ID 넣기
  });
}

export async function getOfferings() {
  const offerings = await Purchases.getOfferings();
  return offerings;
}

export async function purchase(pkg: any) {
  return await Purchases.purchasePackage({ aPackage: pkg });
}

export async function checkPurchase() {
  try {
    // 고객 정보 가져오기
    const { customerInfo } = await Purchases.getCustomerInfo();
    console.log("customerInfo:", customerInfo);

    // Entitlement 이름 = "Custom" 확인
    const purchased = !!(
      customerInfo.entitlements.active &&
      customerInfo.entitlements.active["Custom"]
    );

    if (purchased) {
      console.log("✅ 사용자가 프리미엄 구매/구독 상태입니다.");
      return "PREMIUM";
    } else {
      console.log("❌ 사용자가 프리미엄을 구매하지 않았습니다.");
      return "FREE";
    }
  } catch (err) {
    console.error("구매 여부 확인 실패:", err);
    return "FREE";
  }
}
