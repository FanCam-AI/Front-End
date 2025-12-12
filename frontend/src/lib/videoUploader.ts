import { Uploader, UploadEvent } from "@capgo/capacitor-uploader";
import fastapi from "../lib/api";
import { getAccessToken } from "../lib/token";

export async function uploadVideoInBackground(
  filePath: string,
  fileName: string,
): Promise<string> {
  const token = await getAccessToken();
  const options = {
    serverUrl: "https://fancamai.com/api/result/upload_video",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    filePath,
    fileKey: "video",
    fileName,
    method: "POST" as const,
    notification: {
      enabled: true,
      onProgressTitle: "Uploading...",
      onCompleteTitle: "Upload completed",
      onErrorTitle: "Upload failed",
    },
  };

  try {
    const { id } = await Uploader.startUpload(options);

    return await new Promise<string>(async (resolve, reject) => {
      const listener = await Uploader.addListener(
        "events",
        (event: UploadEvent) => {
          if (event.id !== id) return;

          switch (event.name) {
            case "uploading":
              console.log(`Upload progress: ${event.payload?.percent}%`);
              break;

            case "completed": {
              listener.remove(); // 리스너 제거

              // payload에 response가 있다고 가정하고 타입 단언
              const responseStr = (event.payload as any)?.response;
              try {
                let video_path = "";
                fastapi(
                  "get",
                  "/api/result/video_path",
                  null,
                  (res) => {
                    video_path = res.video_path;
                    if (video_path) {
                      resolve(video_path);
                    } else {
                      reject(
                        new Error(
                          "Please check your Wi-Fi (internet) connection. Exit the app and try again. If this issue persists, please contact us at kangfancam@gmail.com.",
                        ),
                      );
                    }
                  },
                  (err) => {
                    reject(
                      new Error(
                        "Please check your Wi-Fi (internet) connection. Exit the app and try again. If this issue persists, please contact us at kangfancam@gmail.com.",
                      ),
                    );
                  },
                );
              } catch (e) {
                reject(
                  new Error(
                    "Please check your Wi-Fi (internet) connection. Exit the app and try again. If this issue persists, please contact us at kangfancam@gmail.com.",
                  ),
                );
              }
              break;
            }

            case "failed":
              listener.remove();
              reject(
                new Error(
                  "Please check your Wi-Fi (internet) connection. Exit the app and try again. If this issue persists, please contact us at kangfancam@gmail.com.",
                ),
              );
              break;
          }
        },
      );
    });
  } catch (error: any) {
    throw new Error(
      "Please check your Wi-Fi (internet) connection. Exit the app and try again. If this issue persists, please contact us at kangfancam@gmail.com.",
    );
  }
}
