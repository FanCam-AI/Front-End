<script>
  import { App } from "@capacitor/app";
  import { Browser } from "@capacitor/browser";
  import { setAccessToken, setRefreshToken } from "./lib/token";
  import { navigate } from "svelte-routing";
  import { Router, Route } from "svelte-routing";
  import Home from "./routes/Home.svelte";
  import Result from "./routes/Result.svelte";
  import UserLogin from "./routes/UserLogin.svelte";
  import Subscribe from "./routes/Subscribe.svelte";
  import Terms from "./components/footer/Terms.svelte";
  import Privacy from "./components/footer/PrivacyPolicy.svelte";
  import Settings from "./routes/Settings.svelte";
  import Credits from "./components/footer/Credits.svelte";
  import Manual from "./components/footer/Manual.svelte";

  App.addListener("appUrlOpen", async ({ url }) => {
    const parsed = new URL(url);
    const access = parsed.searchParams.get("access_token");
    const refresh = parsed.searchParams.get("refresh_token");

    if (access && refresh) {
      await setAccessToken(access);
      await setRefreshToken(refresh);
    }

    await Browser.close();
    navigate("/");
  });
</script>

<Router>
  <Route path="/">
    <Home />
  </Route>
  <Route path="/my-gallery">
    <Result />
  </Route>
  <Route path="/user-login">
    <UserLogin />
  </Route>
  <Route path="/subscribe">
    <Subscribe />
  </Route>
  <Route path="/terms">
    <Terms />
  </Route>
  <Route path="/privacy-policy">
    <Privacy />
  </Route>
  <Route path="/credits">
    <Credits />
  </Route>
  <Route path="/settings">
    <Settings />
  </Route>
  <Route path="/manual">
    <Manual />
  </Route>
</Router>
