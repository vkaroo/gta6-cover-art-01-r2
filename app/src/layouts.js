// Panel layouts for Sunset Cover Studio. Every rect is a fraction of the
// cover's width and height, so the same layout works at any export size.
const LAYOUTS = {
  vice: {
    label: 'Vice',
    // Hero panel across the top, two panels below it.
    panels: [
      { x: 0.0, y: 0.0, w: 1.0, h: 0.56 },
      { x: 0.0, y: 0.58, w: 0.49, h: 0.42 },
      { x: 0.51, y: 0.58, w: 0.49, h: 0.42 },
    ],
  },
  streets: {
    label: 'Streets',
    // Four equal panels in a 2 x 2 grid with thin gutters.
    panels: [
      { x: 0.0, y: 0.0, w: 0.49, h: 0.49 },
      { x: 0.51, y: 0.0, w: 0.49, h: 0.49 },
      { x: 0.0, y: 0.51, w: 0.49, h: 0.49 },
      { x: 0.51, y: 0.51, w: 0.49, h: 0.49 },
    ],
  },
  solo: {
    label: 'Solo',
    // One photo filling the whole cover.
    panels: [
      { x: 0.0, y: 0.0, w: 1.0, h: 1.0 },
    ],
  },
};
const LAYOUT_IDS = Object.keys(LAYOUTS);
