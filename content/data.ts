// All timetable, price and distance values are SAMPLE DATA until a real rail API is connected.

export type Route = {
  id: string;
  to: string;
  via: string;
  depart: string;
  arrive: string;
  durationMin: number;
  distanceKm: number;
  platform: number;
  status: "Boarding" | "On time";
};

export const ORIGIN = "Paris";
export const ORIGIN_STATION = "Paris Gare de l'Est";

export const routes: Route[] = [
  { id: "vie", to: "Vienna", via: "Munich", depart: "19:42", arrive: "07:18", durationMin: 696, distanceKm: 1240, platform: 4, status: "Boarding" },
  { id: "ber", to: "Berlin", via: "Brussels", depart: "20:15", arrive: "07:05", durationMin: 650, distanceKm: 1050, platform: 7, status: "On time" },
  { id: "ven", to: "Venice", via: "Zurich", depart: "21:03", arrive: "08:40", durationMin: 697, distanceKm: 1110, platform: 2, status: "On time" },
  { id: "cph", to: "Copenhagen", via: "Hamburg", depart: "21:30", arrive: "09:12", durationMin: 702, distanceKm: 1250, platform: 9, status: "On time" },
  { id: "bcn", to: "Barcelona", via: "Lyon", depart: "22:05", arrive: "08:55", durationMin: 650, distanceKm: 1040, platform: 5, status: "On time" },
  { id: "bud", to: "Budapest", via: "Salzburg", depart: "22:48", arrive: "11:56", durationMin: 788, distanceKm: 1480, platform: 11, status: "On time" },
];

export type CabinId = "seat" | "couchette" | "sleeper";

export type LookId = "spring" | "sunrise" | "rain" | "winter" | "autumn" | "night";
/** looks whose film and cabin views have been rendered; add an id here once its files are in /public */
const READY: LookId[] = ["spring"];
/** the same route rendered in six conditions */
const allLooks: { id: LookId; label: string; note: string }[] = [
  { id: "spring", label: "Spring", note: "Fresh green valleys in clear daylight" },
  { id: "sunrise", label: "Sunrise", note: "Low gold light and mist on the river" },
  { id: "rain", label: "Rain", note: "Grey skies, wet rails, lit windows" },
  { id: "winter", label: "Winter", note: "Snow on every pine, snow still falling" },
  { id: "autumn", label: "Autumn", note: "Copper woods in afternoon sun" },
  { id: "night", label: "Night", note: "Moonlight, lit windows, dawn at the end" },
];
export const looks = allLooks.filter((l) => READY.includes(l.id));
export const cabinImg = (id: CabinId, look: LookId) => `/img/cabins/cabin-${id}-${look}.webp`;
export const film = (look: LookId, mobile: boolean) => `/video/journey-${look}-${mobile ? "mobile" : "wide"}.mp4`;
export const filmPoster = (look: LookId) => `/img/journey-${look}.webp`;

export const cabins: { id: CabinId; name: string; short: string; berths: string; includes: string[]; priceFrom: number; img: string; alt: string }[] = [
  {
    id: "seat",
    name: "Reclining seat",
    short: "Seats",
    berths: "One seat in a six-seat compartment",
    includes: ["Reclining seat with headrest", "Reading light and socket", "Quiet coach after 23:00"],
    priceFrom: 49,
    img: "/img/cabin_seat.webp",
    alt: "A six-seat compartment with blue upholstered seats, a fold-down table and a window onto the countryside",
  },
  {
    id: "couchette",
    name: "Couchette",
    short: "Couchettes",
    berths: "One berth in a six-berth compartment",
    includes: ["Fresh bedding and pillow", "Lockable compartment", "Bottle of water"],
    priceFrom: 89,
    img: "/img/cabin_couchette.webp",
    alt: "A couchette compartment with six berths made up with white bedding, a ladder and a window table",
  },
  {
    id: "sleeper",
    name: "Private sleeper",
    short: "Sleepers",
    berths: "A private room for one to three",
    includes: ["Real bed and duvet", "Washbasin and towels", "Breakfast served to your door"],
    priceFrom: 189,
    img: "/img/cabin_sleeper.webp",
    alt: "A walnut-panelled private sleeper with a made bed, velvet curtains and reading lamps",
  },
];

// grams of CO2 per passenger-kilometre (rounded public averages, for comparison only)
export const CO2 = { train: 25, plane: 180 };

export const faq = [
  { q: "How much luggage can I bring?", a: "Two suitcases and a small bag per traveller. There is space under the lower berths and on a rack above the door." },
  { q: "Are there showers on board?", a: "Private sleepers have a washbasin. Showers are available in the premium sleeper car on longer routes." },
  { q: "Can I travel with my dog?", a: "Yes, in a private sleeper you book for your group. Small pets in a carrier are welcome in seats." },
  { q: "Will I be woken at the border?", a: "No. Passport checks on our routes happen on the platform or not at all inside the Schengen area." },
  { q: "What if the train is late?", a: "If you arrive more than 60 minutes late you get 25% back, and 50% after two hours, paid automatically." },
];

// The pinned night: clock values are minutes after 19:42 (total 696 = 07:18)
export const chapters = [
  { id: "departure", minute: 0, title: "Departure", copy: "The platform slides away. Your evening is still yours.", img: "/img/n1_departure.webp", alt: "City lights streaking past a train window at dusk" },
  { id: "dinner", minute: 78, title: "Dinner car", copy: "Dinner with the countryside going by at 160 km/h.", img: "/img/n2_dinner.webp", alt: "A dining car table with two glasses and a lamp at night" },
  { id: "lights", minute: 228, title: "Lights out", copy: "The rocking does the rest.", img: "/img/n3_lightsout.webp", alt: "A moonlit snowy forest seen from a train window" },
  { id: "border", minute: 388, title: "The border", copy: "You cross a border in your sleep. Nobody wakes you.", img: "/img/n4_border.webp", alt: "A quiet snowy station with one lamp at 2am" },
  { id: "sunrise", minute: 638, title: "Sunrise", copy: "First light over the Danube.", img: "/img/n5_sunrise.webp", alt: "Sunrise over a misty river and hills", dawn: true },
  { id: "arrival", minute: 696, title: "Arrival", copy: "Vienna. Coffee is five minutes away.", img: "/img/n6_arrival.webp", alt: "A grand station hall in morning sun", dawn: true },
] as const;

export const NIGHT_START = 19 * 60 + 42; // minutes after midnight
export const NIGHT_LENGTH = 696;

export const clockLabel = (minuteOfNight: number) => {
  const t = (NIGHT_START + Math.round(minuteOfNight)) % (24 * 60);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

export const duration = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;
export const eur = (n: number) => `${n.toLocaleString("en-GB")} EUR`;
