import { describe, expect, it } from "vitest";
import { SCENES } from "@/lib/explore/scenes";
import { SCENE_ICON_IDS } from "./scene-icon";

describe("SceneIcon", () => {
  it("mọi cảnh trong Khám phá đều có biểu tượng vẽ tay (không rơi về emoji)", () => {
    for (const id of Object.keys(SCENES)) expect(SCENE_ICON_IDS, id).toContain(id);
  });
});
