<script>
    import {App} from "@capacitor/app";
    import {Browser} from "@capacitor/browser";
    import {setAccessToken, setRefreshToken} from "./lib/token";
    import {getPkceVerifier, clearPkceVerifier} from "./lib/pkceSession";
    import {navigate} from "svelte-routing";
    import {Router, Route} from "svelte-routing";
    import Home from "./routes/Home.svelte";
    import Result from "./routes/Result.svelte";
    import UserLogin from "./routes/UserLogin.svelte";
    import Subscribe from "./routes/Subscribe.svelte";
    import Terms from "./components/footer/Terms.svelte";
    import Privacy from "./components/footer/PrivacyPolicy.svelte";
    import Settings from "./routes/Settings.svelte";
    import Credits from "./components/footer/Credits.svelte";
    import Manual from "./components/footer/Manual.svelte";


    App.addListener("appUrlOpen", async ({url}) => {
        const parsed = new URL(url);
        const code = parsed.searchParams.get("code");

        if (!code) return;

        const verifier = getPkceVerifier();

        if (!verifier) {
            console.error("PKCE verifier missing");
            return;
        }

        const params = new URLSearchParams();
        params.append("code", code);
        params.append("code_verifier", verifier);

        const res = await fetch("https://fancamai.com/api/auth/exchange", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
        });

        const data = await res.json();

        clearPkceVerifier()

        if (data.access_token && data.refresh_token) {
            await setAccessToken(data.access_token);
            await setRefreshToken(data.refresh_token);
        }

        await Browser.close();
        navigate("/");
    });
</script>

<Router>
    <Route path="/">
        <Home/>
    </Route>
    <Route path="/my-gallery">
        <Result/>
    </Route>
    <Route path="/user-login">
        <UserLogin/>
    </Route>
    <Route path="/subscribe">
        <Subscribe/>
    </Route>
    <Route path="/terms">
        <Terms/>
    </Route>
    <Route path="/privacy-policy">
        <Privacy/>
    </Route>
    <Route path="/credits">
        <Credits/>
    </Route>
    <Route path="/settings">
        <Settings/>
    </Route>
    <Route path="/manual">
        <Manual/>
    </Route>
</Router>
