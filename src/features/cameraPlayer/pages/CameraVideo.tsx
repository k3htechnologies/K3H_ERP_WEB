import Hls from "hls.js";
import { useEffect, useRef } from "react";

interface Props {
    url: string;
    apiKey?: string;
}

export default function CameraVideo({ url, apiKey }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !url) return;

        const token =
            apiKey ||
            localStorage.getItem("auth_token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("jwt") ||
            "";

        console.log("🎥 Stream URL:", url);
        console.log(
            "🔑 Token:",
            token ? `${token.substring(0, 10)}...` : "No Token"
        );

        let hls: Hls | null = null;

        if (Hls.isSupported()) {
            hls = new Hls({
                xhrSetup: (xhr) => {
                    if (token) {
                        // Use only the headers your backend requires
                        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                        xhr.setRequestHeader("X-API-KEY", token);
                    }
                },
            });

            hls.loadSource(url);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log("✅ Manifest Loaded");
                video.play().catch(console.error);
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                console.error("❌ HLS Error:", data);

                if (data.response) {
                    console.error("Status:", data.response.code);
                    console.error("Text:", data.response.text);
                }

                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error("Network Error");
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error("Media Error");
                            hls?.recoverMediaError();
                            break;
                        default:
                            hls?.destroy();
                            break;
                    }
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;

            video.addEventListener("loadedmetadata", () => {
                video.play().catch(console.error);
            });
        }

        return () => {
            hls?.destroy();
        };
    }, [url, apiKey]);

    return (
        <video
            ref={videoRef}
            controls
            autoPlay
            muted
            playsInline
            className="w-full h-64 rounded bg-black"
        />
    );
}