<script>
    import {Filesystem, Directory} from "@capacitor/filesystem";
    import {fly, fade} from 'svelte/transition';
    import {cubicInOut} from 'svelte/easing';
    import {onMount} from "svelte";
    import fastapi from "../lib/api";
    import {navigate} from "svelte-routing";
    import {is_login, username, logout, processingProgress} from "../lib/store";
    import {startStatusPolling, stopStatusPolling} from "../lib/statusPolling";
    import {copyBinaryFileToNative} from "../lib/nativeFileCopier";
    import {goToHome, goToLogin} from "../lib/navigation";
    import {registerPlugin} from "@capacitor/core";
    import {Share} from "@capacitor/share";
    import {initRevenueCat, checkPurchase} from "../lib/purchases";
    import Header from "../components/Header.svelte";
    import BottomNavigationBar from "../components/BottomNavigationBar.svelte";

    const NativeFileCopier = registerPlugin("NativeFileCopier");
    const VideoTools = registerPlugin("VideoTools");

    let videoFileInput;
    let imageFileInput;
    let agreeTerms = false;
    let agreePrivacy = false;
    let currentPlan = "";
    let videoFileName = "";
    let imageFileNames = [];
    let isUploading = false;
    let uploadProgress = 0;
    let isSubmitting = false;
    let isUpdated = true;
    let resultCount = 0;
    let totalTime = 0;

    let appVersion = "2.0";
    let showPanel = false;
    let format = "GIF";
    let mode = "Normal";
    let target = "Person";
    let access = "FREE";


    async function uploadVideoToR2(videoFile, onProgress) {
        let url = "";
        let key = "";
        let filename = videoFile.name;
        if (onProgress) onProgress(0);

        const ext = filename.split('.').pop().toLowerCase();
        let contentType = "application/octet-stream";
        if (ext === "mov") contentType = "video/quicktime";
        else if (ext === "mp4") contentType = "video/mp4";

        const formData = new FormData();
        formData.append("filename", filename);
        await fastapi(
            "post",
            "/result/init_video_upload",
            formData,
            (res) => {
                url = res.url;
                key = res.key;
            });


        // 2. R2로 직접 PUT 업로드
        await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": contentType,
            },
            body: videoFile,
        });

        if (onProgress) onProgress(1);

        // 3. 서버에 저장할 경로 반환
        return key;
    }


    /**
     *  toSeconds는 h,m,s를 초로 바꾸어 총합 초를 구하는 함수 입니다.
     *
     * @param t - h,w,s가 담긴 리스트 입니다.
     * @returns 입력된 h,w,s를 초로 변환하여 합산한 값 - t에 담긴 h, w, s를 각각 초로 바꾸어 합한 값을 리턴 합니다.
     */
    function toSeconds(t) {
        if (typeof t === "number") return t;
        const parts = t.split(":").map(Number);
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        return Number(t);
    }

    /**
     * shareGif는 파일을 클라이언트에서 공유 할 수 있는 팝업을 띄워주기 위한 함수 입니다.
     *
     * @param filePath - 공유 할 GIF 파일 경로
     * @returns PopUp Window - GIF 공유를 위한 팝업 창
     */
    async function shareGif(filePath) {
        await Share.share({
            title: "result",
            url: filePath,
            dialogTitle: "",
        });
    }

    /**
     * shareGif는 파일을 클라이언트에서 공유 할 수 있는 팝업을 띄워주기 위한 함수 입니다.
     *
     * @param filePath - 공유 할 GIF 파일 경로
     * @param startTime - 시작 시간
     * @param endTime - 끝나는 시간
     * @returns PopUp Window - GIF 공유를 위한 팝업 창
     */
    async function makeGif(filePath, startTime = 0, endTime = 3) {
        const start = toSeconds(startTime);
        const end = toSeconds(endTime);
        // Documents 경로의 uri
        const {uri} = await Filesystem.getUri({
            path: "",
            directory: Directory.Documents,
        });

        // 실제 파일 저장 경로 (native absolute path)
        const outputPath = uri.replace("file://", "") + "/output.gif";

        const result = await VideoTools.toGif({
            path: filePath,
            start,
            end,
            output: outputPath,
        });

        // 👉 이제 Capacitor URI 반환
        const gifUri = await Filesystem.getUri({
            path: "output.gif",
            directory: Directory.Documents,
        });

        return gifUri.uri; // "file://..." 형식
    }

    /**
     * makeTrimVideo는 파일을 클라이언트에서 공유 할 수 있는 팝업을 띄워주기 위한 함수 입니다.
     *
     * @param filePath - 공유 할 GIF 파일 경로
     * @param startTime - 시작 시간
     * @param endTime - 끝나는 시간
     * @returns PopUp Window - GIF 공유를 위한 팝업 창
     */
    async function makeTrimVideo(filePath, startTime = 0, endTime = 3) {
        const start = toSeconds(startTime);
        const end = toSeconds(endTime);
        const {uri} = await Filesystem.getUri({
            path: "",
            directory: Directory.Documents,
        });

        // 실제 파일 저장 경로 (native absolute path)
        const outputPath = uri.replace("file://", "") + "/output.mp4";

        const result = await VideoTools.trim({
            path: filePath,
            start: start,
            end: end,
            output: outputPath,
        });

        const gifUri = await Filesystem.getUri({
            path: "output.mp4",
            directory: Directory.Documents,
        });

        return gifUri.uri;
    }

    /**
     * handleVideoStandard는 비디오 파일을 사용자가 설정한 Time Range에 맞게 타임라인을 조정 후 세로 형식 비디오를
     outputType에 맞게 GIF 또는 비디오 클립으로 저장하는 함수 입니다.

     *
     * @param file - 비디오 파일
     * @param outputType - GIF 또는 비디오 확장자
     * @returns 완성된 비디오 공유 팝업 창
     */
    async function handleVideoStandard(file, outputType) {
        const spotList = JSON.parse(localStorage.getItem("spotList") || "[]");
        if (spotList.length === 0) {
            alert("No Time Range saved.");
            return;
        }

        const lastSpot = spotList[spotList.length - 1];
        const [key] = Object.keys(lastSpot);
        const [startArr, endArr] = lastSpot[key];
        const formatTime = ([h, m, s]) =>
            [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");

        const startTime = formatTime(startArr);
        const endTime = formatTime(endArr);

        const filePath = await copyBinaryFileToNative(
            file,
            1024 * 1024 * 3,
            (progress) => {
                isLoading = true;
                processingProgress.set(Math.round(progress * 0.9, 90));
            },
        );
        let outputPath;

        try {
            if (outputType === "gif") {
                outputPath = await makeGif(filePath, startTime, endTime);
            } else {
                outputPath = await makeTrimVideo(filePath, startTime, endTime);
            }

            await shareGif(outputPath);
        } catch (err) {

        } finally {
            NativeFileCopier.deleteFile({filePath});
        }
    }

    /**
     * validateBeforeSubmit은 사용자가 약관에 동의하였는 지 확인하는 함수입니다.
     *
     * @returns alert 문자
     */
    function validateBeforeSubmit() {
        if ($is_login) {
            return true;
        }

        if (!agreeTerms || !agreePrivacy) {
            alert(
                "You must agree to both the Terms of Service and the Privacy Policy!",
            );
            return false;
        }
        return true;
    }

    /**
     * handleVideoChange는 사용자가 업로드한 비디오 파일의 유효성을 검사하고 로컬스토리지에 video name을 저장합니다.
     *
     * @returns
     */
    function handleVideoChange() {
        const file = videoFileInput.files[0];
        if (file) {
            const allowedExtensions = ["mp4", "mov"];
            const ext = file.name.split(".").pop().toLowerCase();

            if (!allowedExtensions.includes(ext)) {
                alert("Only .mp4 and .mov files are allowed!");
                videoFileInput.value = "";
                return;
            }

            const maxSize = 500 * 1024 * 1024; // 500MB in bytes
            if (file.size > maxSize) {
                alert(
                    "The selected file is larger than 500MB. Please choose a smaller file.",
                );
                videoFileInput.value = "";
                return;
            }
        }

        videoFileName = videoFileInput.files[0]?.name || "";
        localStorage.setItem("videoFileName", videoFileName);
    }

    /**
     * handleVideoChange는 사용자가 업로드한 이미지 파일의 유효성을 검사하고 로컬스토리지에 image name을 저장합니다.
     *
     * @returns
     */
    function handleImageChange() {
        const files = Array.from(imageFileInput.files);

        // GIF 파일 체크
        const invalidFiles = files.filter(
            (file) => file.name.split(".").pop().toLowerCase() === "gif",
        );
        if (invalidFiles.length > 0) {
            alert("GIF files cannot be uploaded.");
            imageFileInput.value = ""; // 선택 초기화
            return;
        }

        imageFileNames = Array.from(imageFileInput.files).map((file) => file.name);
        localStorage.setItem("imageFileNames", JSON.stringify(imageFileNames));
    }

    let timeInputs = {
        start: ["", "", ""],
        end: ["", "", ""],
    };

    let spotList = [];
    let isLoading = false;
    let done = false;


    onMount(async () => {
        window.scrollTo({top: 0, left: 0, behavior: "smooth"});
        const raw = localStorage.getItem("isLoading");
        if (raw) {
            const {value} = JSON.parse(raw);
            if (value) {
                window.scrollTo({top: 250, left: 250, behavior: "smooth"});
                isLoading = true;
                isSubmitting = true;
                videoFileName = localStorage.getItem("videoFileName") || "";
                const names = localStorage.getItem("imageFileNames");
                imageFileNames = names ? JSON.parse(names) : [];
                const spotRaw = localStorage.getItem("spotList");
                if (spotRaw) spotList = JSON.parse(spotRaw);
                checkStatus();

            }
        }
        const revenuePromise = initRevenueCat();
        const planPromise = revenuePromise.then(() => checkPurchase());
        const statusPromise = fastapi(
            "get",
            "/result/status",
            null,
            (res) => {
                if (res.status === "processing") {
                    isLoading = true;
                    isSubmitting = true;

                    checkStatus();

                }
            }
        );
        const userPromise = fastapi(
            "get",
            "/user/me",
            null,
            (res) => {
                username.set(res.username);
                is_login.set(true);
                if (res.app_version !== appVersion) {
                    isUpdated = false;
                    alert("Please update the app from the App Store");
                } else {
                    isUpdated = true;
                    resultCount = res.result_count;

                }
            },
            (err) => {
                fastapi("get", "/user/app_version", null, (res) => {
                    if (res.app_version !== appVersion) {
                        isUpdated = false;
                        alert("Please update the app from the App Store");
                    } else {
                        isUpdated = true;
                    }
                });
                username.set("");
                is_login.set(false);
            },
        );
        const [, plan] = await Promise.all([
            revenuePromise,
            planPromise,
            userPromise,
            statusPromise
        ]);

        currentPlan = plan;
        done = false;
    });

    /**
     * addSpot은 사용자가 원하는 구간 즉 spot을 추가할 수 있는 기간 입니다.
     *
     * @returns
     */

    function addSpot() {
        if (spotList.length >= 1) {
            alert("You can only add up to 1 Time ranges.");
            timeInputs = {start: ["", "", ""], end: ["", "", ""]};
            return;
        }

        const start = timeInputs.start.map((v) => parseInt(v));
        const end = timeInputs.end.map((v) => parseInt(v));
        const isValidTime = ([h, m, s]) =>
            ![h, m, s].some(isNaN) &&
            h >= 0 &&
            h <= 5 &&
            m >= 0 &&
            m <= 59 &&
            s >= 0 &&
            s <= 59;

        if (!isValidTime(start) || !isValidTime(end)) {
            alert("Please enter a valid time.");
            timeInputs = {start: ["", "", ""], end: ["", "", ""]};
            return;
        }

        const toSeconds = ([h, m, s]) => h * 3600 + m * 60 + s;
        if (toSeconds(start) >= toSeconds(end)) {
            alert("Start time must be earlier than end time.");
            timeInputs = {start: ["", "", ""], end: ["", "", ""]};
            return;
        }

        const startSec = toSeconds(start);
        const endSec = toSeconds(end);
        const maxRange = 91;

        totalTime = endSec - startSec

        spotList = [...spotList, {[`spot_${spotList.length}`]: [start, end]}];

        localStorage.setItem("spotList", JSON.stringify(spotList));
        timeInputs = {start: ["", "", ""], end: ["", "", ""]};
    }

    /**
     * removeSpot 사용자가 time range부분에 추가한 spot을 지울 수 있는 기능 입니다. 로컬스토리지에 저장된 스팟이 삭제 됩니다.
     *
     * @param index - 삭제한 spot 번호
     * @returns X
     */
    function removeSpot(index) {
        spotList = spotList
            .filter((_, i) => i !== index)
            .map((item, idx) => ({[`spot_${idx}`]: Object.values(item)[0]}));
        localStorage.setItem("spotList", JSON.stringify(spotList));
    }

    async function uploadImagesToR2(imageFiles) {
        const imageKeys = [];

        for (const img of imageFiles) {
            // 1️⃣ presigned URL 요청
            const presign = await new Promise((resolve) => {
                const formData = new FormData();
                let filename = img.name
                formData.append("filename", filename);
                fastapi("post", "/result/init_image_upload", formData, resolve);
            });

            // presign 결과
            const key = presign.key;
            const url = presign.url;

            // 2️⃣ R2에 직접 PUT
            const res = await fetch(url, {
                method: "PUT",
                body: img,
            });
            if (!res.ok) {
                throw new Error("이미지 업로드 실패");
            }

            imageKeys.push(key);
        }

        return imageKeys;
    }


    /**
     * submitRequest 사용자가 time range부분에 추가한 spot을 지울 수 있는 기능 입니다. 로컬스토리지에 저장된 스팟이 삭제 됩니다.
     *
     * @param type - gif 또는 video 파일 확장자를 정하는 파라미터
     * @param detection_model_type - animal 또는 person 모델의 타입을 정하는 파라미터
     * @returns X
     */
    async function submitRequest(type, detection_model_type) {
        if (isSubmitting) {
            alert(
                "Your result is being processed right now. Plea se wait for it to complete.",
            );
            return;
        }
        if (!validateBeforeSubmit()) {
            return;
        }

        const videoFile = videoFileInput.files[0];
        const imageFiles = Array.from(imageFileInput.files);

        if (!videoFile || spotList.length === 0) {
            alert("Please upload video file and add at least one time range.");
            return;
        }

        if (currentPlan === "FREE" && imageFiles.length > 0) {
            alert(
                "You're currently on the Free plan, and you've reached its usage limits. To continue using the service without interruption, please consider upgrading to a Premium!",
            );
            return;
        }

        videoFileName = videoFile.name;
        imageFileNames = imageFiles.map((f) => f.name);
        localStorage.setItem("videoFileName", videoFileName);
        localStorage.setItem("imageFileNames", JSON.stringify(imageFileNames));
        localStorage.setItem("spotList", JSON.stringify(spotList));

        done = false;
        isSubmitting = true;
        localStorage.setItem(
            "isLoading",
            JSON.stringify({value: true, timestamp: Date.now()}),
        );
        try {
            const videoForm = new FormData();
            videoForm.append("video", videoFile);

            if (
                (currentPlan === "FREE" || currentPlan === "") &&
                imageFiles.length === 0
            ) {
                alert("Stay on this screen until the Processing reaches 100%");
                const result = await handleVideoStandard(videoFile, type);
                processingProgress.set(100);
                handleDone();
            } else {
                alert(
                    "Stay on this screen until the upload reaches 100% and “Processing” appears!",
                );

                let videoKey = await new Promise(async (resolve, reject) => {
                    try {
                        const videoPath = await uploadVideoToR2(
                            videoFile,
                            (progress) => {
                                isUploading = true;
                                uploadProgress = Math.round(progress * 100);
                            },
                        );
                        resolve(videoPath);
                    } catch (err) {
                        reject(err);
                    }
                });
                const imageKeys = await uploadImagesToR2(imageFiles);
                const formData = new FormData();
                formData.append("video_key", videoKey);
                imageKeys.forEach((key) => {
                    formData.append("target_image_keys", key);
                });
                formData.append(
                    "spot_list",
                    JSON.stringify(Object.assign({}, ...spotList)),
                );
                formData.append("video_or_gif", type);
                formData.append("detection_model_type", detection_model_type);

                await fastapi(
                    "post",
                    "/result/make_result",
                    formData,
                    (result) => {
                        if (result.status === "started") {
                            alert("Processing has started!");
                            isLoading = true;
                            uploadProgress = 100;
                            processingProgress.set(0);
                            isUploading = false;
                            done = false;

                            checkStatus();

                        } else if (result.status === "done") {
                            handleDone();
                        } else {
                            throw new Error(
                                "Sorry, we couldn't start the process. Please try again, or reach out to us via the FanCam AI email.",
                            );
                        }
                    },
                    (error) => {
                        isSubmitting = false;
                        alert(
                            "Sorry, we couldn't start the process. Please try again, or reach out to us via the FanCam AI email.",
                        );
                        clearStorage();
                    },
                );
            }
        } catch (e) {
            isSubmitting = false;
            if (e instanceof Error) {
                alert(
                    "Please check your Wi-Fi or network connection and try again. If the issue persists, please contact us at the FanCam AI email.",
                );
            } else {
                alert(
                    "Please check your Wi-Fi or network connection and try again. If the issue persists, please contact us at the FanCam AI email.",
                );
            }
        }
    }

    /**
     * handleDone은 사용자의 result가 완성된 경우 로컬스토리지와 isLoading, isSubmitting, done등을 초기화 하는 함수다.
     *
     * @returns
     */
    function handleDone() {
        stopStatusPolling();
        done = true;
        isLoading = false;
        isSubmitting = false;
        isUploading = false;
        clearStorage();
    }


    /**
     * clearStorage 사용자의 result가 완성된 경우 로컬스토리지와 isLoading, isSubmitting, done등을 초기화 하는 함수다.
     *
     * @returns
     */
    function clearStorage() {
        videoFileName = "";
        imageFileNames = [];
        spotList = [];
        localStorage.removeItem("isLoading");
        localStorage.removeItem("videoFileName");
        localStorage.removeItem("imageFileNames");
        localStorage.removeItem("spotList");

        fastapi("post", "/result/reset_status", null);

        uploadProgress = 0
    }

    /**
     * checkStatus는 사용자의 result의 작업이 진행중일 때 중첩으로 진행되지 않도록 하기 위한 함수 입니다.
     *
     * @returns
     */

    function checkStatus() {
        if (done) return;

        startStatusPolling(
            (progress) => {
                processingProgress.set(progress);
            },
            () => {
                processingProgress.set(100);
                handleDone();
                alert("Result successfully made.");
            },
            () => {
                handleDone();
                alert("Processing failed.");
            }
        );
    }

    function handleLogout() {
        stopStatusPolling();
        done = true;
        isLoading = false;
        isSubmitting = false;
        isUploading = false;
        videoFileName = "";
        imageFileNames = [];
        spotList = [];
        localStorage.removeItem("isLoading");
        localStorage.removeItem("videoFileName");
        localStorage.removeItem("imageFileNames");
        localStorage.removeItem("spotList");
        uploadProgress = 0
        logout();
    }

    /**
     * handleChooseClick()는 사용자가 원본 이미지를 업로드 하려면 프리미엄 구독 서비스를 사용중이여야 가능하기 위한 유효성 검사 입니다.
     *
     * @returns
     */

    function handleChooseClick() {
        if (currentPlan === "") {
            alert(
                "Loading your subscription information. Please try again in 1–3 seconds. Thank you!",
            );
            return;

        }
        if (currentPlan === "" || currentPlan === "FREE") {
            alert(
                "Only users on the Premium plan have access to the AI Powered Tracking feature!",
            );
            return;
        }

        if (!$is_login) {
            alert("Please log in to continue!");
            return;
        }

        imageFileInput.click();
    }

    async function generatePremiumResult(mode, format) {
        if (isSubmitting) {
            alert(
                "Your result is being processed right now. Please wait for it to complete.",
            );
            return;
        }
        if (!validateBeforeSubmit()) {
            return;
        }

        try {

            if (currentPlan === "") {
                alert(
                    "Loading your subscription information. Please try again in 1–3 seconds. Thank you!",
                );
                return;
            }
            if (!$is_login) {
                alert("Please log in to continue!");
                return;
            }


            if (currentPlan === "FREE") {
                alert(
                    "You're currently on the Free plan, and you've reached its usage limits. To continue using the service without interruption, please consider upgrading to a Premium!",
                );
                return;
            }

            if (Number(resultCount) >= 300) {
                alert("There is no available space in My Gallery.\nYou have reached the maximum of 300 results.\n" +
                    "Please organize your My Gallery to continue!\nFor any inquiries, please contact us via email.\nThank you!");
                return;
            }

            const videoFile = videoFileInput.files[0];
            const imageFiles = Array.from(imageFileInput.files);

            if (!videoFile || spotList.length === 0) {
                alert("Please upload a video file and include at least one time range and one screenshot.");
                return;
            }

            if (totalTime >= 31) {
                alert("Time range cannot be 30 seconds or longer");
                removeSpot(0);
                return;
            }


            if (mode === "precision" && imageFiles.length === 0) {
                alert(
                    "If you use Precision mode, please upload at least one screenshot. Otherwise, please select Normal mode. Thank you!",
                );
                return;
            }


            videoFileName = videoFile.name;
            imageFileNames = imageFiles.map((f) => f.name);
            localStorage.setItem("videoFileName", videoFileName);
            localStorage.setItem("imageFileNames", JSON.stringify(imageFileNames));
            localStorage.setItem("spotList", JSON.stringify(spotList));

            done = false;
            isSubmitting = true;
            localStorage.setItem(
                "isLoading",
                JSON.stringify({value: true, timestamp: Date.now()}),
            );
            alert(
                "Stay on this screen until the upload reaches 100% and “Processing” appears!",
            );
            const readyData = new FormData();
            if (mode) {
                readyData.append("tracking_mode", mode);
            }
            let readyStatus = "";
            isUploading = true;

            await fastapi(
                "get",
                "/result/check_ml_server_ready",
                readyData,
                (ready) => {
                    if (ready.status === "ready") {
                        readyStatus = "ready";
                    } else if (ready.status === "not_ready") {
                        readyStatus = "not_ready";
                        handleDone();
                    }
                },
                (error) => {
                    readyStatus = "not_ready";
                    alert(
                        "Sorry, we couldn't start the process. Please try again, or reach out to us via the FanCam AI email.",
                    );
                    handleDone();
                },
            );


            if (readyStatus === "not_ready") {
                alert("Sorry, FanCam AI is currently at capacity.\n" +
                    "Please try again in a few minutes.\n" +
                    "We appreciate your patience as we work to improve the service.");
                return;
            }


            let videoKey = await new Promise(async (resolve, reject) => {
                try {
                    const videoPath = await uploadVideoToR2(
                        videoFile,
                        (progress) => {
                            isUploading = true;
                            uploadProgress = Math.round(progress * 100);
                        },
                    );
                    resolve(videoPath);
                } catch (err) {
                    reject(err);
                }
            });
            const imageKeys = await uploadImagesToR2(imageFiles);
            const formData = new FormData();
            formData.append("video_key", videoKey);
            imageKeys.forEach((key) => {
                formData.append("target_image_keys", key);
            });
            formData.append(
                "spot_list",
                JSON.stringify(Object.assign({}, ...spotList)),
            );
            formData.append("video_or_gif", format);
            formData.append("detection_model_type", "person");
            if (mode) {
                formData.append("tracking_mode", mode);
            }

            await fastapi(
                "post",
                "/result/make_result",
                formData,
                (result) => {
                    if (result.status === "started") {
                        alert("Processing has started!");
                        isLoading = true;
                        uploadProgress = 100;
                        processingProgress.set(0);
                        isUploading = false;
                        done = false;

                        checkStatus();

                    } else if (result.status === "done") {
                        handleDone();
                    } else if (result.status === "busy") {
                        alert("Sorry, FanCam AI is currently at capacity.\n" +
                            "Please try again in a few minutes.\n" +
                            "We appreciate your patience as we work to improve the service.");
                        handleDone();
                    } else {
                        throw new Error(
                            "Sorry, we couldn't start the process. Please try again, or reach out to us via the FanCam AI email.",
                        );
                    }
                },
                (error) => {
                    isSubmitting = false;
                    alert(
                        "Sorry, we couldn't start the process. Please try again, or reach out to us via the FanCam AI email.",
                    );
                    handleDone();
                },
            );

        } catch (e) {
            isSubmitting = false;
            handleDone();
            if (e instanceof Error) {
                alert(
                    "Please check your Wi-Fi or network connection and try again. If the issue persists, please contact us at the FanCam AI email.",
                );
            } else {
                alert(
                    "Please check your Wi-Fi or network connection and try again. If the issue persists, please contact us at the FanCam AI email.",
                );
            }
        }


    }


    async function generateFreeResult(format) {
        if (isSubmitting) {
            alert(
                "Your result is being processed right now. Please wait for it to complete.",
            );
            return;
        }
        if (!validateBeforeSubmit()) {
            return;
        }


        const videoFile = videoFileInput.files[0];
        const imageFiles = Array.from(imageFileInput.files);

        if (!videoFile || spotList.length === 0) {
            alert("Please upload video file and add at least one time range.");
            return;
        }

        if (totalTime >= 91) {
                alert("Time range cannot be 90 seconds or longer");
                removeSpot(0);
                return;
            }

        if (currentPlan === "FREE" && imageFiles.length > 0) {
            alert(
                "You're currently on the Free plan, and you've reached its usage limits. To continue using the service without interruption, please consider upgrading to a Premium!",
            );
            return;
        }

        try {
            videoFileName = videoFile.name;
            imageFileNames = imageFiles.map((f) => f.name);
            localStorage.setItem("videoFileName", videoFileName);
            localStorage.setItem("imageFileNames", JSON.stringify(imageFileNames));
            localStorage.setItem("spotList", JSON.stringify(spotList));

            done = false;
            isSubmitting = true;
            localStorage.setItem(
                "isLoading",
                JSON.stringify({value: true, timestamp: Date.now()}),
            );

            const videoForm = new FormData();
            videoForm.append("video", videoFile);

            if (
                (currentPlan === "FREE" || currentPlan === "") &&
                imageFiles.length === 0
            ) {
                alert("Stay on this screen until the Processing reaches 100%");
                const result = await handleVideoStandard(videoFile, format);
                processingProgress.set(100);
                handleDone();

            }
        } catch (e) {
            isSubmitting = false;
            if (e instanceof Error) {
                alert(
                    "Sorry, there was a problem. Please try again, or reach out to us via the FanCam AI email.",
                );
            } else {
                alert(
                    "Sorry, there was a problem. Please try again, or reach out to us via the FanCam AI email.",
                );
            }
        }
    }

    function handleFabClick() {
        showPanel = true;

    }

    function closePanel() {
        showPanel = false;
    }

    function handleGenerate() {
        if (access === "FREE") {
            generateFreeResult(format.toLowerCase())
        } else if (access === "PREMIUM") {
            generatePremiumResult(mode.toLowerCase(), format.toLowerCase())
        }

        showPanel = false;
    }

</script>

{#if isUpdated}
    <Header
            is_login={$is_login}
            username={$username}
            {goToHome}
            {goToLogin}
            {handleLogout}
    />
    <!-- ✅ 본문 UI -->
    <div class="layout">
        <div class="left-panel">
            <!-- 비디오 업로드 -->
            <div class="upload-box">
                <h3 style="color: #black; font-weight: 800;">Upload Video</h3>
                <div class="custom-file-wrapper">
                    <input
                            type="file"
                            accept="video/*"
                            bind:this={videoFileInput}
                            on:change={handleVideoChange}
                            class="hidden-file-input"
                    />
                    <label
                            class="custom-file-label"
                            on:click={() => videoFileInput.click()}>+</label
                    >
                    <span class="file-name">{videoFileName || "No file chosen"}</span>
                </div>
                <div class="caption">FanCam AI does not use generative AI.</div>
            </div>

            <!-- 이미지 업로드 (다중 선택) -->
            <div class="upload-box">
                <h3 style="color: #black; font-weight: 800;">Upload Screenshot(s)</h3>
                <div class="custom-file-wrapper">
                    <input
                            type="file"
                            accept="image/*"
                            multiple
                            bind:this={imageFileInput}
                            on:change={handleImageChange}
                            class="hidden-file-input"
                    />
                    <label class="custom-file-label" on:click={handleChooseClick}>+</label
                    >
                    <span class="file-name">
            {imageFileNames.length > 0
                ? imageFileNames.join(", ")
                : "No files chosen"}
          </span>
                </div>
                <div class="caption">
                    1–3 screenshots of the person you want to track in the video
                </div>
            </div>

            <!-- 체크박스 박스 -->
            {#if !$is_login}
                <div class="checkbox-container">
                    <label class="checkbox-label">
                        <input type="checkbox" bind:checked={agreeTerms}/>
                        Agree&nbsp;fancam ai
                        <a
                                href="#"
                                on:click|preventDefault={() => navigate("/privacy-policy")}
                        >
                            terms of use
                        </a>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" bind:checked={agreePrivacy}/>
                        Agree&nbsp;fancam ai
                        <a
                                href="#"
                                on:click|preventDefault={() => navigate("/privacy-policy")}
                        >
                            privacy policy
                        </a>
                    </label>
                </div>
            {/if}
        </div>

        <div class="center-panel">
            <div style="font-size: 2rem; font-weight: 800; margin-bottom: 1rem;">
                Time Range
            </div>

            <div class="time-row">
                <input
                        class="time-input"
                        placeholder="h"
                        bind:value={timeInputs.start[0]}
                />
                :
                <input
                        class="time-input"
                        placeholder="m"
                        bind:value={timeInputs.start[1]}
                />
                :
                <input
                        class="time-input"
                        placeholder="s"
                        bind:value={timeInputs.start[2]}
                />
                ~
                <input
                        class="time-input"
                        placeholder="h"
                        bind:value={timeInputs.end[0]}
                />
                :
                <input
                        class="time-input"
                        placeholder="m"
                        bind:value={timeInputs.end[1]}
                />
                :
                <input
                        class="time-input"
                        placeholder="s"
                        bind:value={timeInputs.end[2]}
                />
                <button class="add-button" on:click={addSpot}>+</button>
            </div>

            <div class="spot-list">
                {#each spotList as spot, index (index)}
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div class="time-text">
                            {index + 1}. {Object.values(spot)[0][0].join(":")} ~ {Object.values(
                            spot,
                        )[0][1].join(":")}
                        </div>
                        <button class="remove-button" on:click={() => removeSpot(index)}
                        >-
                        </button
                        >
                    </div>
                {/each}
            </div>

            {#if isUploading}
                <div class="processing-message">
                    Uploading...
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {uploadProgress}%"></div>
                    </div>
                    <div class="note">{uploadProgress}%</div>
                </div>
            {:else if isLoading}
                <div class="processing-message">
                    Processing...
                    <div class="progress-bar">
                        <div
                                class="progress-fill"
                                style="width: {$processingProgress}%"
                        ></div>
                    </div>
                    <div class="note">{$processingProgress}%</div>
                </div>
            {/if}
        </div>

    </div>

    <button class="fab-button" on:click={handleFabClick}>
        +
    </button>
    {#if showPanel}
        <div
                class="overlay"
                on:click={closePanel}
                out:fade={{ duration: 300 }}
        ></div>

        <div
                class="bottom-sheet"
                on:click|stopPropagation
                out:fly={{ y: 300, duration: 350, easing: cubicInOut }}
        >
            <div class="drag-handle"></div>

            <div class="sheet-header">
                Output Settings
            </div>

            <!-- Access Level (작게, 가운데) -->
            <div class="access-wrapper">
                <div class="square-group small">
                    <button class:selected={access==="FREE"} on:click={() => access="FREE"}>FREE</button>
                    <button class:selected={access==="PREMIUM"} on:click={() => access="PREMIUM"}>PREMIUM</button>
                </div>
            </div>


            <div class="sheet-content">

                <!-- Mode -->
                <div class="option-group mode {access !== 'PREMIUM' ? 'hidden' : ''}">
                    <div class="label">Mode</div>
                    <div class="pill-group">
                        <button class:selected={mode==="Normal"} on:click={() => mode="Normal"}>Normal</button>
                        <button class:selected={mode==="Precision"} on:click={() => mode="Precision"}>Precision</button>
                    </div>
                </div>

                <!-- Format -->
                <div class="option-group">
                    <div class="label">Format</div>
                    <div class="pill-group">
                        <button class:selected={format==="GIF"} on:click={() => format="GIF"}>GIF</button>
                        <button class:selected={format==="VIDEO"} on:click={() => format="VIDEO"}>VIDEO</button>
                    </div>
                </div>


                <!-- ✅ Generate 버튼 (핵심 위치) -->
                <div class="generate-wrapper">
                    <button class="generate-button" on:click={handleGenerate}>
                        Generate
                    </button>
                </div>

            </div>
        </div>
    {/if}
    <BottomNavigationBar/>

    <div class="mobile-only"></div>
{/if}

<style>
    body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-weight: 400; /* 🔥 추가 */
        background: #f5f5f5;
        padding-bottom: 6rem;
    }

    .mode {
        overflow: hidden;
        max-height: 100px; /* 충분히 크게 */
        opacity: 1;
        margin-bottom: 16px;
        font-weight: 800;

        transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.25s ease,
        margin 0.25s ease;
    }

    .mode.hidden {
        max-height: 0;
        opacity: 0;
        margin-bottom: 0;
        transition-delay: 0s, 0s, 0s;
    }

    .mode {
        transition-delay: 0s, 0.05s, 0.05s;
    }

    /* Access Level 전체 래퍼: Generation Options 바로 아래 중앙 */
    .access-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-weight: 800;
        margin-bottom: 1.5rem; /* 아래 간격 */
    }

    /* small 옵션: 버튼 작게 */
    .square-group.small button {
        width: 80px; /* 버튼 폭 작게 */
        padding: 0.4rem; /* 패딩 줄이기 */
        font-size: 0.8rem;
        font-weight: 800;
        border-radius: 6px;
    }

    /* square 버튼 그룹 */
    .square-group {
        display: flex;
        gap: 0.5rem;
    }

    .square-group button {
        flex: 1;
        padding: 0.8rem;
        font-size: 0.9rem;
        font-weight: 800;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f7f7f7;
        color: #000;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .square-group button.selected {
        background: #000;
        color: #fff;
        border-color: #000;
    }

    /* overlay */
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(2px);
        z-index: 9998;
    }

    /* bottom sheet */
    .bottom-sheet {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;

        height: 55vh; /* 👈 핵심 */
        max-height: 60vh; /* 👈 안전장치 */

        background: #fff;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        z-index: 9999;

        display: flex; /* 👈 중요 */
        flex-direction: column;

        animation: slideUp 0.4s ease;
    }

    /* 애니메이션 */
    @keyframes slideUp {
        from {
            transform: translateY(100%);
        }
        to {
            transform: translateY(0);
        }
    }

    /* 드래그 바 */
    .drag-handle {
        width: 40px;
        height: 4px;
        background: #ccc;
        border-radius: 2px;
        margin: 10px auto;
    }

    /* 헤더 */
    .sheet-header {
        text-align: center;
        font-weight: 1000;
        font-size: 1.1rem;
        margin-bottom: 1rem;
    }

    /* 컨텐츠 */
    .sheet-content {
        flex: 1; /* 👈 남은 공간 채움 */
        overflow-y: auto; /* 👈 스크롤 */
        padding: 0 1rem 1.5rem;
    }

    /* 옵션 */
    .option-group {
        margin-bottom: 1.2rem;
        font-weight: 800;
    }

    .label {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 0.4rem;
    }

    /* pill 버튼 */
    .pill-group {
        display: flex;
        gap: 0.5rem;
    }

    .pill-group button {
        flex: 1;
        padding: 0.6rem;
        color: #000000;
        border-radius: 999px;
        border: 1px solid #ddd;
        background: #f7f7f7;
        font-size: 0.9rem;
        cursor: pointer;
        font-weight: 800;
        transition: all 0.2s ease;
    }

    /* 선택 상태 */
    .pill-group button.selected {
        background: #000;
        color: #fff;
        border-color: #000;
        font-weight: 800;
    }

    /* Generate wrapper */
    .generate-wrapper {
        display: flex;
        justify-content: center;
        margin-top: 1.5rem;
    }

    /* Generate 버튼 */
    .generate-button {
        width: 80%;
        max-width: 320px;
        padding: 0.9rem;
        border-radius: 14px;
        border: none;
        font-weight: 800;
        font-size: 1rem;
        background: #000000;
        color: #fff;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .generate-button:hover {
        background: #f7f7f7;
        color: #000000;
    }

    .generate-button:active {
        transform: scale(0.97);
    }


    .fab-button {
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        border: none;
        background: #000;
        color: #007aff;
        font-size: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .fab-button:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
    }

    .fab-button:active {
        transform: scale(0.95);
    }

    .progress-bar {
        width: 100%;
        height: 12px;
        background: #eee;
        border-radius: 6px;
        overflow: hidden;
        margin-top: 0.5rem;
    }

    .progress-fill {
        width: 0;
        height: 100%;
        background: #000000;
        transition: width 0.2s ease;
    }

    /* CSS */
    .checkbox-container {
        border: 1px solid #000;
        border-radius: 8px;
        padding: 10px;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-weight: 700;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 700;
    }

    .checkbox-label a {
        color: #000;
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 2px;
        font-weight: 700;
        transition: color 0.2s ease,
        text-decoration-thickness 0.2s ease;
    }

    .checkbox-label a:hover {
        color: #333;
        text-decoration-thickness: 2px;
    }

    .layout {
        display: flex;
        flex-wrap: wrap;
        padding: 2rem;
        gap: 2rem;
    }

    .left-panel {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        width: 30%;
    }

    .upload-box {
        width: 100%;
        height: 100%;
        max-width: 500px;
        background: #fff;
        padding: 1.5rem;
        border: 1px solid #000;
        border-radius: 8px;
    }

    .upload-box .caption {
        font-size: 0.8rem;
        color: #555;
        margin-top: 0.2rem;
        font-weight: 800; /* 글씨 굵게 */
    }

    .upload-box h3 {
        margin-bottom: 1rem;
        font-size: 1.1rem;
    }

    .time-row {
        display: flex;
        gap: 0.3rem;
        font-weight: 700;
        align-items: center;
        margin-bottom: 1rem;
    }

    .time-text {
        width: 320px; /* 고정 너비 설정 */
        font-weight: 700;
    }

    .time-input {
        width: 100%;
        max-width: 2.5rem;
        padding: 0.3rem;
        text-align: center;
        font-weight: 700;
    }

    .add-button {
        width: 2rem;
        padding: 0.3rem 0.6rem;
        font-size: 1rem;
        margin-left: 0.5rem;
        cursor: pointer;
        border-radius: 4px;
        border: 1px solid #000;
        background: rgba(255, 255, 255, 0.5); /* 흰색 + 50% 투명 */
        font-weight: 700;
    }

    .add-button:hover {
        background: rgba(255, 255, 255, 0.7);
    }

    .spot-list {
        margin-top: 1rem;
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .spot-list > div {
        display: flex;
        align-items: center;
        justify-content: flex-start; /* 버튼이 오른쪽 끝에 위치하도록 */
        margin-bottom: 0.5rem;
    }

    .center-panel {
        width: 40%;
        background: #fff;
        padding: 1.5rem;
        border: 1px solid #000;
        border-radius: 8px;
    }

    .right-panel {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1.5rem;
        width: 21%;
        height: 100%;
        margin-bottom: 1rem;
    }

    .right-panel button {
        padding: 1rem;
        font-size: 1rem;
        font-weight: bold;
        border: 1px solid #000;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.5); /* 흰색 + 50% 투명 */
        cursor: pointer;
        transition: background 0.2s ease;
        height: 100%;
    }

    .right-panel button:hover {
        background: rgba(255, 255, 255, 0.7); /* 흰색 + 70% 불투명 */
    }

    .processing-message {
        margin-top: 2rem;
        font-size: 1rem;
        font-weight: 800;
        color: #444;
        text-align: center;
    }

    .note {
        margin-top: 10px;
        font-size: 14px;
        color: #555;
    }

    .custom-file-wrapper {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 0.5rem;
    }

    .hidden-file-input {
        display: none;
    }

    .custom-file-label {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        border: 2px dashed #aaa;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        font-weight: 400;
        background: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: all 0.2s ease;
        color: #007aff; /* + 아이콘만 파란색 */
    }

    .custom-file-label:hover {
        background: rgba(255, 255, 255, 0.7);
        border-color: #aaa; /* hover 해도 테두리는 그대로 */
    }

    .file-name {
        display: inline-block;
        max-width: 200px; /* 원하는 너비로 조정 */
        font-weight: 550;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .remove-button {
        width: 2rem;
        border: 1px solid #000;
        min-width: 2rem;
        padding: 0.2rem 0.4rem;
        font-size: 0.8rem;
        background: rgba(255, 255, 255, 0.5); /* 흰색 + 50% 투명 */
        border-radius: 4px;
        cursor: pointer;
        margin-left: 0.5rem;
        display: flex;
        justify-content: center; /* 가운데 정렬 */
        align-items: center; /* 수직 가운데 정렬 */
        font-weight: 700;
    }

    .remove-button:hover {
        background: rgba(255, 255, 255, 0.7);
    }

    .custom-button {
        padding: 0.6rem 1rem;
        font-size: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        line-height: 1.1;
    }

    .custom-button .caption {
        font-size: 0.8rem;
        color: #555;
        margin-top: 0.2rem;
    }


    .layout {
        flex-direction: column;
        padding: 1rem;
    }

    .mobile-only {
        height: 250px;
    }

    .left-panel,
    .center-panel,
    .right-panel {
        width: 100%;
    }

    .file-name {
        max-width: 120px;
    }


    @media (orientation: landscape) {
        .mobile-only {
            display: block;
            height: 50vh; /* 화면 높이 기준으로 고정 */
            overflow-y: auto; /* 스크롤 활성화 */
        }
    }

    @media (min-width: 768px) {
        .layout {
            flex-direction: column; /* 세로로 쌓이게 */
            padding: 1rem;
            gap: 1.5rem;
        }

        .left-panel {
            width: 100%; /* 아이패드에서는 꽉 채움 */
            max-width: none;
            gap: 1.5rem;
        }

        .center-panel {
            width: 100%; /* left-panel이 늘어나면 center도 100% */
            margin-left: 0; /* 오른쪽 이동 막기 */
        }

        .upload-box,
        .checkbox-container {
            width: 100%; /* 동일하게 맞춤 */
            max-width: none; /* 제한 없앰 */
        }

        .bottom-sheet {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;

            height: 60vh; /* :point_left: 핵심 */
            max-height: 70vh; /* :point_left: 안전장치 */

            background: #fff;
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
            z-index: 9999;

            display: flex; /* :point_left: 중요 */
            flex-direction: column;

            animation: slideUp 0.4s ease;
        }

    }
</style>
