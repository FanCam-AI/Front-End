import {
  Purchases,
  LOG_LEVEL,
} from "@revenuecat/purchases-capacitor";

export async function initRevenueCat(userID: string) {
  await Purchases.setLogLevel({ level: LOG_LEVEL.INFO });
  await Purchases.configure({
    apiKey: "appl_zTjPeGpDvlCMbZuPouajikuVhuR",
    appUserID: userID,
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
    const { customerInfo } = await Purchases.getCustomerInfo();
    const purchased = !!(
      customerInfo.entitlements.active &&
      customerInfo.entitlements.active["Custom"]
    );

    if (purchased) {
      return "PREMIUM";
    } else {
      return "FREE";
    }
  } catch (err) {
    return "FREE";
  }
}
