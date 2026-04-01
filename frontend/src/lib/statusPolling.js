import { processingProgress } from "./store";
import fastapi from "./api";

let interval = null;
let finished = false;
let requesting = false;

export function startStatusPolling(onUpdate, onDone, onFail) {

  if (interval) {
    clearInterval(interval);
  }

  finished = false;
  requesting = false;

  interval = setInterval(() => {

    if (requesting || finished) return;

    requesting = true;

    fastapi("get", "/result/status", null, (res) => {

      requesting = false;

      if (finished) return;

      if (res.status === "done") {
        finished = true;
        stopStatusPolling();
        onDone?.();
        return;
      }

      if (res.status === "failed") {
        finished = true;
        stopStatusPolling();
        onFail?.();
        return;
      }

      const progress = Number(res.progress);

      if (!isNaN(progress)) {
        processingProgress.set(progress);
        onUpdate?.(progress);
      }

    });

  }, 3000);
}

export function stopStatusPolling() {

  if (interval) {
    clearInterval(interval);
  }

  interval = null;
  finished = true;
  requesting = false;
}

export function isPolling() {
  return interval !== null;
}