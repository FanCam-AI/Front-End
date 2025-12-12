import {
  SignInWithApple,
  SignInWithAppleResponse,
  SignInWithAppleOptions,
} from "@capacitor-community/apple-sign-in";

function generateRandomString(length: number) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const options: SignInWithAppleOptions = {
  clientId: "com.fancamai.login",
  redirectURI: "https://fancamai.com",
  scopes: "email name",
  state: generateRandomString(16),
  nonce: generateRandomString(16),
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loginWithApple() {
  SignInWithApple.authorize(options)
    .then((result: SignInWithAppleResponse) => {
      console.log("Apple 로그인 결과:", result);
      // 사용자 정보 처리
      // 서버로 토큰 보내 검증 및 세션 생성
    })
    .catch((error) => {
      console.error("Apple 로그인 실패:", error);
      // 오류 처리
    });
}
