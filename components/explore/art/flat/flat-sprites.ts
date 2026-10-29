import { AIRPORT_SPRITES } from "./flat-airport";
import { ANIMAL_SPRITES } from "./flat-animals";
import { CHARACTER_SPRITES } from "./flat-characters";
import { FOOD_SPRITES } from "./flat-food";
import { FURNITURE_SPRITES } from "./flat-furniture";
import type { FlatSprite } from "./flat-kit";
import { HOSPITAL_SPRITES } from "./flat-hospital";
import { HOTEL_SPRITES } from "./flat-hotel";
import { MARKET_SPRITES } from "./flat-market";
import { PARK_SPRITES } from "./flat-park";
import { VENUE2A_SPRITES } from "./flat-venue2-a";
import { VENUE2B_SPRITES } from "./flat-venue2-b";
import { VENUE2C_SPRITES } from "./flat-venue2-c";
import { VENUE3_SPRITES } from "./flat-venue3";
import { VENUE4_SHOP_SPRITES } from "./flat-venue4-shops";
import { VENUE4_ZOO_SPRITES } from "./flat-venue4-zoo";
import { VENUE6_SPRITES } from "./flat-venue6";
import { VENUE7_SPRITES } from "./flat-venue7";
import { VENUE8_SPRITES } from "./flat-venue8";
import { VENUE9_SPRITES } from "./flat-venue9";
import { VENUE10_SPRITES } from "./flat-venue10";
import { VENUE11_SPRITES } from "./flat-venue11";
import { VENUE12_SPRITES } from "./flat-venue12";
import { VENUE13_SPRITES } from "./flat-venue13";
import { VENUE14_SPRITES } from "./flat-venue14";
import { VENUE15_SPRITES } from "./flat-venue15";
import { VENUE16_SPRITES } from "./flat-venue16";
import { VENUE5_FUN_FARM_SPRITES } from "./flat-venue5-fun-farm";
import { VENUE5_LAUNDRY_TOY_SPRITES } from "./flat-venue5-laundry-toys";
import { NEW_FUN_SPRITES } from "./flat-new-fun";
import { NEW_HOME_SPRITES } from "./flat-new-home";
import { NEW_LEARN_SPRITES } from "./flat-new-learn";
import { NEW_TRANS_SPRITES } from "./flat-new-trans";
import { NEW_WORK_SPRITES } from "./flat-new-work";
import { PLACE_SPRITES } from "./flat-places";
import { PROP_SPRITES } from "./flat-props";
import { SCHOOL_SPRITES } from "./flat-school";
import { SHOP_SPRITES } from "./flat-shop";
import { STATION_SPRITES } from "./flat-station";
import { STORY_SPRITES } from "./flat-story";
import { VENUE_SPRITES } from "./flat-venues";
import { SMALL_SPRITES } from "./flat-small";

/** Tất cả sprite Tranh C theo `id` của vật trong cảnh (kèm `guide` cho nhân vật dẫn đường). */
const BASE: Record<string, FlatSprite> = {
  ...FURNITURE_SPRITES, ...SMALL_SPRITES, ...FOOD_SPRITES, ...PROP_SPRITES, ...STORY_SPRITES, ...CHARACTER_SPRITES, ...ANIMAL_SPRITES, ...MARKET_SPRITES, ...STATION_SPRITES,
  ...HOSPITAL_SPRITES, ...PARK_SPRITES, ...SCHOOL_SPRITES, ...SHOP_SPRITES, ...HOTEL_SPRITES, ...AIRPORT_SPRITES, ...PLACE_SPRITES, ...VENUE_SPRITES,
  ...NEW_HOME_SPRITES, ...NEW_TRANS_SPRITES, ...NEW_LEARN_SPRITES, ...NEW_WORK_SPRITES, ...NEW_FUN_SPRITES, ...VENUE2A_SPRITES, ...VENUE2B_SPRITES, ...VENUE2C_SPRITES, ...VENUE3_SPRITES, ...VENUE4_ZOO_SPRITES, ...VENUE4_SHOP_SPRITES, ...VENUE5_FUN_FARM_SPRITES, ...VENUE5_LAUNDRY_TOY_SPRITES, ...VENUE6_SPRITES, ...VENUE7_SPRITES, ...VENUE8_SPRITES, ...VENUE9_SPRITES, ...VENUE10_SPRITES, ...VENUE11_SPRITES, ...VENUE12_SPRITES, ...VENUE13_SPRITES, ...VENUE14_SPRITES, ...VENUE15_SPRITES, ...VENUE16_SPRITES,
};

/** Một từ khác nhau dùng chung hình: id mới → hình có sẵn (ví dụ "bệnh giường" dùng hình giường). Giữ mỗi cảnh có từ riêng mà không phải vẽ lại. */
const ALIASES: Record<string, string> = {
  hospitalbed: "bed", chart: "clipboard", desk: "table", telephone: "phone", reception: "counter", minibar: "fridge", desklamp: "lamp", libcard: "roomcard",
  scoreboard: "blackboard", jersey: "clothes", flightboard: "blackboard", boardingpass: "ticket", whiteboard: "blackboard", meetingtable: "table", receipt: "note", bookcart: "cart", exhibitboard: "blackboard",
  movieticket: "ticket", glasses3d: "glasses", bodyscale: "scale", gymclothes: "clothes", salonchair: "chair", readingtable: "table", waitingbench: "bench", ancientcoin: "coin",
  airmeal: "lunchbox", checkin: "counter", pilothat: "hat", textbook: "book", breakfast: "plate", parasol: "umbrella", hotelcart: "trolley",
  postscale: "scale", prescription: "note", medcabinet: "locker", handwash: "shampoo",
  warranty: "note", dip: "bowl", plumdrink: "juice",
  record: "note", file: "folder", platform: "rails", routemap: "timetable", broadcast: "speaker", transitcard: "roomcard", faregate: "securitygate", labthermo: "thermometer", reagent: "syrup", reportphone: "phone",
  zooticket: "ticket", greetcard: "note", pricelist: "note", takeaway: "bag",
  latte: "coffee", syrupbottle: "syrup", togocup: "cup", barcounter: "counter", pastrycase: "showcase", potplant: "flowerpot",
  novel: "book", comic: "magazine", fountainpen: "pen", journal: "notebook", cashdesk: "counter", revolveshelf: "bookshelf", readlamp: "lamp",
  networkcable: "cable", monitor: "screen", password: "lock", backupfiles: "folder", powersupply: "socket",
  software: "laptop", requirement: "note", workstation: "table", bigscreen: "tv", projectorbeam: "projector", staffcard: "idcard",
  voiceassistant: "speaker", touchscreen: "tablet", cargoship: "boat", tariff: "note", importgoods: "parcel", freight: "cash", sample: "woodbox", shelving: "shelf",
  hygrometer: "thermometer", plasticfilm: "sheetcloth", compostbin: "bucket", handcart: "cart",
  stopsign: "signboard", linemap: "timetable", buscard: "roomcard", priorityseat: "seat", stopbell: "bell", change: "coinpurse", busdoor: "door", shelter: "pavilion", ledboard: "blackboard", oden: "soup", riceball: "rice", bento: "lunchbox", cupnoodle: "instantnoodles", drink: "juice", snack: "chips", gum: "candy", lighter: "matches", checkout: "basket", coolercase: "fridge", microwave: "oven", autodoor: "door", crayons: "pens", bib: "apron", napmat: "picnicmat", littlechair: "plasticstool", picturebook: "fairytale", sticker: "stickynotes", waterCup: "cup", slide: "ladder", sandpit: "sandcastle", cubby: "locker", toothcup: "cup", basin: "bucket", hotkettle: "kettle", powerstrip: "socket", phonestand: "phonecase", coolmat: "picnicmat", doorcard: "idcard", shoecabinet: "locker", dormstairs: "ladder", gate: "securitygate", signpost: "signboard", wildflower: "flower", pinetree: "tree", stonestep: "brick", sunrise: "sun", cloudsea: "cottoncandy", trailmap: "map", restpavilion: "pavilion", brook: "pond", foldfan: "fan", waterSleeve: "ribbon", jinghu: "guqin", opcostume: "cape", headdress: "hairpin", subtitlescreen: "screen", makeupmirror: "mirror", audience: "bench",
  swimgoggles: "goggles", bathtowel: "towel", firealarm: "bell", firesuit: "coat", turntable: "ladder",
};

/** Tất cả sprite Tranh C theo `id` của vật trong cảnh (kèm `guide` cho nhân vật dẫn đường). */
export const FLAT_SPRITES: Record<string, FlatSprite> = { ...BASE, ...Object.fromEntries(Object.entries(ALIASES).map(([k, v]) => [k, BASE[v]])) };
