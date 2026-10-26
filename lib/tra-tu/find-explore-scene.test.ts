import { describe, expect, it } from "vitest";
import { SCENES } from "@/lib/explore/scenes";
import { findExploreScene } from "./find-explore-scene";

describe("findExploreScene", () => {
  it("tìm đúng cảnh chứa từ của một vật trong cảnh", () => {
    const scene = Object.values(SCENES)[0];
    expect(findExploreScene(scene.objects[0].term)).toEqual({ id: scene.id, title: scene.title });
  });
  it("từ không thuộc cảnh nào thì null", () => {
    expect(findExploreScene("龘龘")).toBeNull();
  });
});
