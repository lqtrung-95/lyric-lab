/** Tranh minh họa một đoạn truyện: bối cảnh + các hình (id sprite của kho hình phẳng dùng chung với Khám phá) xếp hàng ngang trên nền. */
export type ReadingSky = "day" | "night" | "rain" | "indoor" | "sunset" | "snow";
export interface ReadingScene { sky: ReadingSky; items: string[] }

/** Hình bay lơ lửng trên trời thay vì đứng trên mặt đất. */
export const FLOATING_SPRITES: ReadonlySet<string> = new Set(["sun", "moon", "star", "kite", "balloon", "plane"]);

const s = (sky: ReadingSky, ...items: string[]): ReadingScene => ({ sky, items });

/** Mỗi truyện một mảng, mỗi đoạn một tranh (cùng thứ tự đoạn). Kiểm bằng test: đủ số đoạn, mọi id hình có thật. */
export const READING_SCENES: Record<string, ReadingScene[]> = {
  "kitten-friend": [s("day", "cat", "door", "flower"), s("day", "cat", "dog", "bird", "sun")],
  "rainy-day": [s("day", "sun", "bag", "door"), s("rain", "umbrella", "bag", "shoes")],
  "bowl-of-noodles": [s("indoor", "noodles", "table", "chopsticks"), s("indoor", "egg", "bowl", "noodles"), s("sunset", "door", "noodles", "tree")],
  "high-speed-rail": [s("day", "train", "backpack", "ticket"), s("day", "train", "tree", "apple"), s("sunset", "flower", "bag", "sun")],
  "making-dumplings": [s("indoor", "flour", "rollingpin", "dumpling"), s("indoor", "pot", "dumpling", "plate"), s("indoor", "dumpling", "table", "redlantern", "plate")],
  "lost-phone": [s("day", "subwaytrain", "phone", "clock"), s("day", "phone", "subwaytrain", "bag"), s("night", "phone", "moon", "bench")],
  "renting-room": [s("day", "laptop", "suitcase", "window"), s("indoor", "bed", "window", "lamp"), s("day", "kettle", "flowerpot", "door", "sun")],
  "diet-plan": [s("indoor", "scale", "notebook", "fridge"), s("day", "shoes", "bed", "clock"), s("day", "tree", "shoes", "sun")],
  "old-letter": [s("indoor", "bookshelf", "envelope", "suitcase"), s("day", "letter", "tree", "sun"), s("night", "phone", "lamp", "moon")],
  "my-day": [s("indoor", "bed", "bread", "milk", "clock"), s("day", "subwaytrain", "blackboard", "book", "pen"), s("night", "dumpling", "plate", "book", "lamp", "moon")],
  "rabbit-birthday": [s("day", "rabbit", "cat", "dog", "duck", "balloon"), s("day", "book", "star", "flower", "rabbit"), s("indoor", "cake", "candle", "rabbit", "cat", "dog")],
  "supermarket": [s("indoor", "cart", "basket", "notebook"), s("indoor", "apple", "banana", "milk", "bread", "watermelon"), s("day", "bag", "milk", "bread", "car")],
  "lost-panda": [s("day", "tree", "flower", "guide", "tree"), s("night", "moon", "tree", "guide", "bird"), s("night", "door", "guide", "bird", "star")],
  "snowman": [s("snow", "hat", "tree", "door"), s("snow", "hat", "tree", "bench"), s("day", "sun", "hat", "tree", "bench")],
  "deskmate": [s("indoor", "desk", "chair", "blackboard", "book"), s("indoor", "pen", "notebook", "desk"), s("day", "bicycle", "book", "tree", "sun")],
  "mooncake": [s("indoor", "flour", "rollingpin", "egg", "table"), s("indoor", "wok", "ricecake", "plate", "pot"), s("night", "moon", "ricecake", "teapot", "redlantern")],
  "unforgettable-trip": [s("day", "plane", "suitcase", "backpack", "map"), s("day", "sun", "tent", "bed", "window"), s("day", "bicycle", "cow", "sheep", "tent", "kettle")],
};
