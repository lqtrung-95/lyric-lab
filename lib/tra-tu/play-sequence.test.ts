import { describe, expect, it } from "vitest";
import { playSequence } from "./play-sequence";

function harness(busyForTicks = 2) {
  const log: string[] = [];
  let busy = 0;
  return {
    log,
    deps: {
      play: async (t: string) => { log.push(`play:${t}`); busy = busyForTicks; },
      isBusy: () => { if (busy > 0) { busy--; return true; } return false; },
      sleep: async () => {},
      shouldStop: () => false,
      onStep: (i: number) => log.push(`step:${i}`),
    },
  };
}

describe("playSequence", () => {
  it("phát lần lượt từng từ theo thứ tự", async () => {
    const h = harness();
    await playSequence(["a", "b", "c"], h.deps);
    expect(h.log.filter((l) => l.startsWith("play"))).toEqual(["play:a", "play:b", "play:c"]);
  });
  it("dừng ngay khi người dùng bấm dừng", async () => {
    const h = harness();
    let stop = false;
    await playSequence(["a", "b", "c"], { ...h.deps, onStep: (i) => { if (i === 1) stop = true; }, shouldStop: () => stop });
    expect(h.log).toEqual(["play:a", "play:b"]);
  });
  it("không chờ vô hạn nếu giọng cứ báo bận", async () => {
    const h = harness();
    await playSequence(["a"], { ...h.deps, isBusy: () => true });
    expect(h.log.filter((l) => l === "play:a")).toHaveLength(1);
  });
});
