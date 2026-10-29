/** Bản đồ thị trấn: mỗi cảnh thuộc đúng một khu phố, kèm biểu tượng để vẽ "tòa nhà". Thêm cảnh mới thì phải thêm vào đây (có test kiểm tra). */
export interface TownDistrict {
  id: string;
  name: string;
  emoji: string;
  /** Màu nền khu phố (sáng) và màu mái nhà (đậm hơn). */
  ground: string;
  roof: string;
  scenes: string[];
}

export const TOWN_DISTRICTS: TownDistrict[] = [
  { id: "home", name: "Nhà và bếp", emoji: "🏠", ground: "#fde8c8", roof: "#e08a3c", scenes: ["room", "kitchen"] },
  { id: "food", name: "Phố ẩm thực", emoji: "🍜", ground: "#fbd9cf", roof: "#d9573f", scenes: ["restaurant", "hotpot", "bubbletea", "bakery", "cafe", "breakfast", "nightmarket", "teahouse"] },
  { id: "shopping", name: "Chợ và mua sắm", emoji: "🛍️", ground: "#e4f1c9", roof: "#5e9e45", scenes: ["market", "supermarket", "clothing-store", "flowershop", "toyshop", "tailor", "photostudio"] },
  { id: "services", name: "Khu dịch vụ", emoji: "🏦", ground: "#d6e6f7", roof: "#3f86c4", scenes: ["bank", "postoffice", "pharmacy", "hospital", "salon", "laundry", "garage", "phoneshop", "office", "police", "firestation", "dental", "construction", "tcm", "courier"] },
  { id: "culture", name: "Học tập và văn hóa", emoji: "🎓", ground: "#e6dcf5", roof: "#8062b8", scenes: ["school", "library", "museum", "cinema", "lab", "bookstore", "calligraphy", "newyear"] },
  { id: "tech", name: "Công nghệ và kỹ thuật số", emoji: "💻", ground: "#dfe3f7", roof: "#4a5fc4", scenes: ["datacenter", "devroom", "ailab"] },
  { id: "travel", name: "Đi lại", emoji: "🚉", ground: "#d4ece8", roof: "#2f9a90", scenes: ["station", "airport", "hotel", "subway", "port"] },
  { id: "fun", name: "Vui chơi và thiên nhiên", emoji: "🎡", ground: "#d8f0d0", roof: "#3f9a5a", scenes: ["park", "beach", "stadium", "gym", "funfair", "zoo", "farm", "camping", "pool", "greenhouse", "petshop", "ktv"] },
];

/** Biểu tượng của "tòa nhà" từng cảnh. */
export const SCENE_EMOJI: Record<string, string> = {
  room: "🛏️", kitchen: "🍳", restaurant: "🍜", hotpot: "🍲", bubbletea: "🧋", bakery: "🥐",
  market: "🥬", supermarket: "🛒", "clothing-store": "👕", flowershop: "💐", toyshop: "🧸", police: "👮", subway: "🚇", camping: "⛺", lab: "🔬", datacenter: "🖥️", devroom: "💻", ailab: "🤖", port: "🚢", greenhouse: "🍅", petshop: "🐹", tailor: "🧵", photostudio: "📷", dental: "🦷", construction: "🏗️", breakfast: "🥟", nightmarket: "🍢", teahouse: "🍵", tcm: "🌿", calligraphy: "🖌️", courier: "📦", ktv: "🎤", newyear: "🧧", cafe: "☕", bookstore: "📚", pool: "🏊", firestation: "🚒",
  bank: "🏦", postoffice: "📮", pharmacy: "💊", hospital: "🏥", salon: "💇", laundry: "🧺", garage: "🔧", phoneshop: "📱", office: "💼",
  school: "🏫", library: "📚", museum: "🏛️", cinema: "🎬",
  station: "🚉", airport: "✈️", hotel: "🏨",
  park: "🌳", beach: "🏖️", stadium: "🏟️", gym: "🏋️", funfair: "🎡", zoo: "🦁", farm: "🚜",
};
