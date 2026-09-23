// Brand defaults — edit these once and every template picks them up.
// (You can also change them live in the editor's "Jenama / Brand" panel;
//  those edits are remembered in your browser and can be saved as a JSON file.)
window.BRAND_DEFAULTS = {
  name: "Pusat Tuisyen Cahaya Ilmu",
  tagline: "Belajar faham, bukan hafal",
  phone: "012-345 6789", // shown next to the WhatsApp icon
  social: "@cahayailmu.tuisyen", // Instagram / Facebook / TikTok handle
  website: "",
  address: "Seksyen 7, Shah Alam",
  logo: "", // data URL; empty = monogram from the brand name
  palette: "brand",
  primary: "#1B3A6B", // dark colour: backgrounds, headlines
  accent: "#F5B82E", // bright colour: highlights, badges, buttons
};

// Colour presets. Keep `primary` dark and `accent` bright; text colour on top
// of each is picked automatically for contrast.
window.PALETTES = [
  { id: "brand", name: "Jenama / Brand", primary: null, accent: null },
  { id: "navy-gold", name: "Navy & Gold", primary: "#13294B", accent: "#F2B632" },
  { id: "emerald", name: "Emerald", primary: "#0B5D46", accent: "#F9C74F" },
  { id: "royal", name: "Royal", primary: "#3F2482", accent: "#FF8FAB" },
  { id: "sunset", name: "Sunset", primary: "#B42318", accent: "#FFC53D" },
  { id: "ocean", name: "Ocean", primary: "#034C7C", accent: "#7FDBFF" },
  { id: "charcoal", name: "Charcoal & Lime", primary: "#1F2421", accent: "#C6F432" },
  { id: "berry", name: "Berry", primary: "#7A1F4B", accent: "#FFB4A2" },
];
