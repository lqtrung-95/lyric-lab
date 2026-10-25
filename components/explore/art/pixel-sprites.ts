import { Canvas, type PixelSprite } from "./pixel-canvas";

// Sprite của cảnh "Phòng của bạn" cho Tranh B (vẽ bằng code, đơn giản có chủ đích). Khóa là `id` của vật trong cảnh.
const bed = new Canvas(24, 16)
  .box(0, 0, 24, 5, "d").box(0, 4, 24, 12, "w").box(2, 8, 20, 7, "g").fill(3, 9, 18, 1, "l")
  .box(3, 5, 7, 4, "c").box(12, 5, 7, 4, "c").fill(5, 11, 2, 1, "G").fill(11, 12, 2, 1, "G").fill(16, 10, 2, 1, "G").fill(8, 13, 2, 1, "l")
  .box(1, 14, 3, 2, "d").box(20, 14, 3, 2, "d").done();

const table = new Canvas(24, 14)
  .box(0, 0, 24, 6, "W").fill(2, 1, 20, 1, "C").box(1, 5, 22, 3, "w").box(1, 8, 3, 6, "d").box(20, 8, 3, 6, "d").done();

const chair = new Canvas(12, 16)
  .box(1, 0, 10, 7, "w").fill(3, 1, 1, 5, "d").fill(5, 1, 1, 5, "d").fill(7, 1, 1, 5, "d").fill(9, 1, 1, 5, "d")
  .box(0, 7, 12, 4, "W").box(1, 11, 2, 5, "d").box(9, 11, 2, 5, "d").done();

const book = new Canvas(12, 10)
  .box(0, 1, 12, 8, "r").fill(1, 7, 10, 2, "c").box(0, 1, 2, 8, "R").fill(4, 3, 6, 1, "y").fill(4, 5, 5, 1, "y").done();

const door = new Canvas(12, 20)
  .box(0, 0, 12, 20, "w").px(0, 0, ".").px(11, 0, ".").box(2, 2, 8, 7, "W").box(2, 11, 8, 7, "W").px(8, 10, "y").px(8, 11, "Y").done();

const windowSprite = new Canvas(16, 16)
  .box(0, 0, 16, 16, "w").fill(2, 2, 12, 12, "a").fill(7, 2, 2, 12, "w").fill(2, 7, 12, 2, "w")
  .fill(2, 2, 3, 12, "g").fill(11, 2, 3, 12, "g").px(6, 4, "h").px(7, 4, "h").px(10, 11, "h").done();

const cup = new Canvas(9, 8)
  .box(0, 1, 6, 7, "h").fill(1, 2, 4, 1, "o").fill(1, 5, 4, 1, "b").px(6, 2, "k").px(7, 2, "k").px(7, 3, "k").px(7, 4, "k").px(7, 5, "k").px(6, 5, "k").done();

const water = new Canvas(8, 12)
  .box(1, 0, 6, 12, "a").fill(2, 4, 4, 7, "b").fill(2, 1, 1, 3, "h").fill(5, 6, 1, 2, "a").done();

const laptop = new Canvas(16, 12)
  .box(1, 0, 14, 8, "S").fill(2, 1, 12, 6, "b").fill(3, 2, 4, 1, "a").box(0, 8, 16, 3, "s").fill(2, 9, 12, 1, "S").done();

const tv = new Canvas(18, 16)
  .fill(5, 0, 1, 2, "k").fill(11, 0, 1, 2, "k").box(0, 2, 18, 12, "w").box(2, 4, 10, 8, "B").fill(3, 5, 8, 6, "b").fill(4, 6, 3, 1, "a")
  .px(14, 5, "y").px(14, 8, "y").fill(14, 10, 2, 1, "d").box(2, 14, 2, 2, "d").box(14, 14, 2, 2, "d").done();

const cat = new Canvas(14, 14)
  .box(2, 6, 10, 7, "o").box(3, 1, 8, 6, "o").px(3, 0, "O").px(4, 0, "O").px(9, 0, "O").px(10, 0, "O")
  .px(5, 3, "n").px(8, 3, "n").px(6, 5, "p").px(7, 5, "p").fill(12, 8, 2, 4, "O").fill(4, 8, 1, 3, "O").fill(8, 8, 1, 3, "O").done();

const flower = new Canvas(12, 16)
  .box(2, 9, 8, 7, "t").fill(2, 9, 8, 1, "T").fill(5, 5, 2, 5, "G").px(3, 7, "g").px(4, 7, "g").px(8, 7, "g").px(7, 7, "g")
  .box(3, 0, 6, 5, "r").px(5, 2, "y").px(6, 2, "y").done();

const apple = new Canvas(8, 8).box(1, 2, 6, 6, "r").px(2, 3, "h").fill(4, 0, 1, 2, "d").px(5, 1, "g").done();

const lamp = new Canvas(8, 20)
  .box(0, 0, 8, 6, "c").fill(1, 1, 6, 1, "y").box(3, 6, 2, 11, "d").box(1, 17, 6, 3, "w").done();

/** Gấu Trúc dẫn đường (Tranh B). */
export const GUIDE_PIXEL: PixelSprite = new Canvas(14, 16)
  .box(2, 1, 10, 6, "o").px(2, 0, "O").px(3, 0, "O").px(10, 0, "O").px(11, 0, "O").fill(3, 3, 3, 2, "h").fill(8, 3, 3, 2, "h")
  .px(4, 4, "n").px(9, 4, "n").px(6, 5, "n").px(7, 5, "n").box(3, 7, 8, 7, "O").fill(5, 8, 4, 4, "c").box(10, 8, 3, 5, "B")
  .box(3, 13, 3, 3, "O").box(8, 13, 3, 3, "O").done();

export const PIXEL_SPRITES: Record<string, PixelSprite> = { bed, table, chair, book, door, window: windowSprite, cup, water, laptop, tv, cat, flower, apple, lamp };
