// Nạp YouTube IFrame Player API đúng một lần (script chính thức của YouTube).
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<typeof YT> | null = null;

export function loadYouTubeIframeApi(): Promise<typeof YT> {
  if (typeof window === "undefined") return Promise.reject(new Error("Chỉ dùng ở trình duyệt"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise<typeof YT>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error("Không tải được YouTube Player"));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}
