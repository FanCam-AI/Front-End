import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fancamai.fancamai",
  appName: "FanCam AI",
  webDir: "dist",

  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    DeepLinks: {
      urlScheme: "fancamai",
    },
    NativeFileCopier: {},

    SplashScreen: {
      autoHide: false,
      showSpinner: false,
      backgroundColor: "#FBFDFD",
    },
  },
};

export default config;
