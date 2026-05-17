"use strict";
/*
 * Mod Machine — Application Logic
 * app.js
 *
 * Sections:
 *   ROUTER       — view switching
 *   DATA         — MODELS, SOURCE, MODEL_SHELLS, BTN_HEX, MODEL_MODS
 *   GALLERY      — documented builds
 *   FAQ          — accordion data
 *   PREVIEW SVG  — device illustration generator
 *   RENDER       — all renderXxx() functions
 *   INIT         — initial render call
 *
 * Note: theme toggle functions (getEffectiveTheme, applyTheme, toggleTheme)
 * live inline in index.html to prevent flash of wrong theme on load.
 */

/* ===== ROUTER ===== */
  function setView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + name).classList.add('active');
    document.querySelectorAll('.mast-nav button').forEach(b => {
      b.classList.toggle('active', b.dataset.view === name);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ===== DATA ===== */
  const MODELS = [
    { id: 'dmg',   code: 'DMG-01',  name: 'Game Boy',     year: 1989, base: 55, sourceFee: 65 },
    { id: 'gbp',   code: 'MGB-001', name: 'Pocket',       year: 1996, base: null, inquire: true },
    { id: 'gbc',   code: 'CGB-001', name: 'Color',        year: 1998, base: 55, sourceFee: 75 },
    { id: 'gba',   code: 'AGB-001', name: 'Advance',      year: 2001, base: 60, sourceFee: 65 },
    { id: 'sp',    code: 'AGS-101', name: 'Advance SP',   year: 2003, base: 70, sourceFee: 85 },
    { id: 'micro', code: 'OXY-001', name: 'Micro',        year: 2005, base: null, inquire: true },
  ];
  const SOURCE = [
    { id: 'sendin', name: 'I\'ll send my unit',     price: 0,    note: 'Packing instructions within 24 hrs' },
    { id: 'source', name: 'Source a unit for me',  price: null, note: 'We locate, vet & test a working chassis' },
  ];
  const OEM_STOCK = { id: 'oem', name: 'OEM Stock (keep original)', price: 0, color: '#9fa3a8', btnColor: 'Original factory', img: 'images/shells/oem.jpg' };

  const MODEL_SHELLS = {
    dmg: [
      { id: 'dmg-gray',       name: 'Gray',                           price: 30, color: '#9fa3a8', btnColor: 'Classic DMG (off-white + colored)', img: 'images/shells/dmg-gray.jpg' },
      { id: 'dmg-black',      name: 'Black',                          price: 30, color: '#1a1a1a', btnColor: 'Black', img: 'images/shells/dmg-black.jpg' },
      { id: 'dmg-white',      name: 'White',                          price: 30, color: '#f0f0ec', btnColor: 'Black', img: 'images/shells/dmg-white.jpg' },
      { id: 'dmg-red',        name: 'Red',                            price: 30, color: '#cc2820', btnColor: 'Black', img: 'images/shells/dmg-red.jpg' },
      { id: 'dmg-blue',       name: 'Blue',                           price: 30, color: '#2850c8', btnColor: 'Black', img: 'images/shells/dmg-blue.jpg' },
      { id: 'dmg-yellow',     name: 'Yellow',                         price: 30, color: '#e8c020', btnColor: 'Black', img: 'images/shells/dmg-yellow.jpg' },
      { id: 'dmg-green',      name: 'Green',                          price: 30, color: '#28a040', btnColor: 'Black', img: 'images/shells/dmg-green.jpg' },
      { id: 'dmg-teal',       name: 'Teal',                           price: 30, color: '#20a090', btnColor: 'Black', img: 'images/shells/dmg-teal.jpg' },
      { id: 'dmg-clear',      name: 'Clear',                          price: 30, color: '#d8e8e0', btnColor: 'Black', img: 'images/shells/dmg-clear.jpg' },
      { id: 'dmg-clr-black',  name: 'Clear Black',                    price: 30, color: '#2a2a30', btnColor: 'Black', img: 'images/shells/dmg-clr-black.jpg' },
      { id: 'dmg-clr-green',  name: 'Clear Green',                    price: 30, color: '#70d890', btnColor: 'Black', img: 'images/shells/dmg-clr-green.jpg' },
      { id: 'dmg-atomic',     name: 'Atomic Purple',                  price: 30, color: '#8850c0', btnColor: 'Black', img: 'images/shells/dmg-atomic.jpg' },
      { id: 'dmg-midnight',   name: 'Midnight Blue',                  price: 30, color: '#1a2860', btnColor: 'Black', img: 'images/shells/dmg-midnight.jpg' },
      { id: 'dmg-glow-blue',  name: 'Clear Blue (Glow-in-the-Dark)',  price: 30, color: '#70b0f8', btnColor: 'Black', img: 'images/shells/dmg-glow-blue.jpg' },
      { id: 'dmg-glow-mint',  name: 'Clear Mint (Glow-in-the-Dark)',  price: 30, color: '#a0e8c8', btnColor: 'Black', img: 'images/shells/dmg-glow-mint.jpg' },
      { id: 'dmg-glow-sea',   name: 'Clear Sea Green (Glow-in-the-Dark)', price: 30, color: '#60d8b0', btnColor: 'Black', img: 'images/shells/dmg-glow-sea.jpg' },
      { id: 'dmg-clr-red',    name: 'Clear Red',                      price: 30, color: '#e87060', btnColor: 'Black', img: 'images/shells/dmg-clr-red.jpg' },
      { id: 'dmg-clr-orange', name: 'Clear Orange',                   price: 30, color: '#f09050', btnColor: 'Black', img: 'images/shells/dmg-clr-orange.jpg' },
      { id: 'dmg-clr-dpink',  name: 'Clear Dark Pink',                price: 30, color: '#e870a0', btnColor: 'Black', img: 'images/shells/dmg-clr-dpink.jpg' },
      { id: 'dmg-lime',       name: 'Lime Green',                     price: 30, color: '#90d020', btnColor: 'Black', img: 'images/shells/dmg-lime.jpg' },
      { id: 'dmg-sp-yellow',  name: 'Special Edition Yellow Gray',    price: 30, color: '#d8c870', btnColor: 'Black', img: 'images/shells/dmg-sp-yellow.jpg' },
    ],
    gbc: [
      { id: 'gbc-nes',            name: 'Classic NES',                     price: 30, color: '#e8e0c8', btnColor: 'Classic NES (red + yellow)', img: 'images/shells/gbc-nes.jpg' },
      { id: 'gbc-champ-pb',       name: 'Chameleon Purple Blue',           price: 30, color: '#8060c0', btnColor: 'Chameleon Purple Blue', img: 'images/shells/gbc-champ-pb.jpg' },
      { id: 'gbc-scarlet',        name: 'Scarlet Red',                     price: 30, color: '#cc2820', btnColor: 'Scarlet Red', img: 'images/shells/gbc-scarlet.jpg' },
      { id: 'gbc-gold',           name: 'Chrome Gold',                     price: 30, color: '#c8a020', btnColor: 'Chrome Gold', img: 'images/shells/gbc-gold.jpg' },
      { id: 'gbc-black',          name: 'Black',                           price: 30, color: '#1a1a1a', btnColor: 'Black', img: 'images/shells/gbc-black.jpg' },
      { id: 'gbc-white',          name: 'White',                           price: 30, color: '#f0f0ec', btnColor: 'White', img: 'images/shells/gbc-white.jpg' },
      { id: 'gbc-gray',           name: 'Classic Gray',                    price: 30, color: '#9fa3a8', btnColor: 'Classic Gray', img: 'images/shells/gbc-gray.jpg' },
      { id: 'gbc-purple',         name: 'Purple',                          price: 30, color: '#7840a8', btnColor: 'Purple', img: 'images/shells/gbc-purple.jpg' },
      { id: 'gbc-cherry-blossom', name: 'Cherry Blossom Pink',            price: 30, color: '#e8a8c0', btnColor: 'Cherry Blossom Pink', img: 'images/shells/gbc-cherry-blossom.jpg' },
      { id: 'gbc-clear',          name: 'Clear',                           price: 30, color: '#d8e8e0', btnColor: 'Clear', img: 'images/shells/gbc-clear.jpg' },
      { id: 'gbc-clr-cherry-pink',name: 'Clear Cherry Pink',              price: 30, color: '#f0b0c0', btnColor: 'Clear Cherry Pink', img: 'images/shells/gbc-clr-cherry-pink.jpg' },
      { id: 'gbc-clr-atomic',     name: 'Clear Atomic Purple',             price: 30, color: '#c0a0e0', btnColor: 'Clear Atomic Purple', img: 'images/shells/gbc-clr-atomic.jpg' },
      { id: 'gbc-glacier',        name: 'Glacier Blue',                    price: 30, color: '#88d0f0', btnColor: 'Glacier Blue', img: 'images/shells/gbc-glacier.jpg' },
      { id: 'gbc-clr-red',        name: 'Clear Red',                       price: 30, color: '#e87060', btnColor: 'Clear Red', img: 'images/shells/gbc-clr-red.jpg' },
      { id: 'gbc-bluebell',       name: 'Gradient Translucent Bluebell',   price: 30, color: '#7880d8', btnColor: 'Gradient Bluebell', img: 'images/shells/gbc-bluebell.jpg' },
      { id: 'gbc-grn-blue',       name: 'Gradient Translucent Green Blue', price: 30, color: '#60b8c0', btnColor: 'Gradient Green Blue', img: 'images/shells/gbc-grn-blue.jpg' },
      { id: 'gbc-wood',           name: 'Wood Grain',                      price: 30, color: '#a07848', btnColor: 'Wood Grain', img: 'images/shells/gbc-wood.jpg' },
      { id: 'gbc-wave',           name: 'The Great Wave',                  price: 30, color: '#1840a0', btnColor: 'The Great Wave', img: 'images/shells/gbc-wave.jpg' },
      { id: 'gbc-glow',           name: 'Glow in Dark \u2014 Green',      price: 30, color: '#80c858', btnColor: 'Glow in Dark Green', img: 'images/shells/gbc-glow.jpg' },
    ],
    gba: [
      { id: 'gba-carbon',         name: 'Carbon Fiber',                price: 30, color: '#2a2a2a', btnColor: 'Black', img: 'images/shells/gba-carbon.jpg' },
      { id: 'gba-black',          name: 'Black',                       price: 30, color: '#1a1a1a', btnColor: 'Black', img: 'images/shells/gba-black.jpg' },
      { id: 'gba-white',          name: 'White',                       price: 30, color: '#f0f0ec', btnColor: 'Gray', img: 'images/shells/gba-white.jpg' },
      { id: 'gba-champ-pb',       name: 'Chameleon Purple Blue',       price: 30, color: '#8060c0', btnColor: 'Chameleon Purple Blue', img: 'images/shells/gba-champ-pb.jpg' },
      { id: 'gba-champ-gp',       name: 'Chameleon Green Purple',      price: 30, color: '#70a060', btnColor: 'Chameleon Green Purple', img: 'images/shells/gba-champ-gp.jpg' },
      { id: 'gba-scarlet',        name: 'Scarlet Red',                 price: 30, color: '#cc2820', btnColor: 'Scarlet Red', img: 'images/shells/gba-scarlet.jpg' },
      { id: 'gba-cherry-blossom', name: 'Cherry Blossom Pink',        price: 30, color: '#e8a8c0', btnColor: 'Cherry Blossom Pink', img: 'images/shells/gba-cherry-blossom.jpg' },
      { id: 'gba-glow-green',     name: 'Glow in Dark \u2014 Green', price: 30, color: '#80c858', btnColor: 'Glow in Dark Green', img: 'images/shells/gba-glow-green.jpg' },
      { id: 'gba-clear',          name: 'Clear',                       price: 30, color: '#d8e8e0', btnColor: 'Clear', img: 'images/shells/gba-clear.jpg' },
      { id: 'gba-clr-black',      name: 'Clear Black',                 price: 30, color: '#2a2a30', btnColor: 'Clear Black', img: 'images/shells/gba-clr-black.jpg' },
      { id: 'gba-clr-atomic',     name: 'Clear Atomic Purple',         price: 30, color: '#c0a0e0', btnColor: 'Clear Atomic Purple', img: 'images/shells/gba-clr-atomic.jpg' },
      { id: 'gba-clr-cherry-pink',name: 'Clear Cherry Pink',          price: 30, color: '#f0b0c0', btnColor: 'Clear Cherry Pink', img: 'images/shells/gba-clr-cherry-pink.jpg' },
    ],
    sp: [
      { id: 'sp-classic-fc',      name: 'Classic FC',              price: 30, color: '#c8a050', btnColor: 'Classic FC (red + gold)', img: 'images/shells/sp-classic-fc.jpg' },
      { id: 'sp-classic-snes',    name: 'Classic SNES',            price: 30, color: '#c8c0d0', btnColor: 'SNES colors (purple, pink, yellow, green)', img: 'images/shells/sp-classic-snes.jpg' },
      { id: 'sp-classic-dmg',     name: 'Classic DMG',             price: 30, color: '#9fa3a8', btnColor: 'Classic DMG (off-white + colored)', img: 'images/shells/sp-classic-dmg.jpg' },
      { id: 'sp-classic-sfc',     name: 'Classic SFC',             price: 30, color: '#c0b8d0', btnColor: 'SFC colors (purple, pink, yellow, green)', img: 'images/shells/sp-classic-sfc.jpg' },
      { id: 'sp-classic-nes',     name: 'Classic NES',             price: 30, color: '#e8e0c8', btnColor: 'Classic NES (red + yellow)', img: 'images/shells/sp-classic-nes.jpg' },
      { id: 'sp-monster',         name: 'Monster Index',           price: 30, color: '#2a2a30', btnColor: 'Black', img: 'images/shells/sp-monster.jpg' },
      { id: 'sp-gold',            name: 'Chrome Gold',             price: 30, color: '#c8a020', btnColor: 'Chrome Gold', img: 'images/shells/sp-gold.jpg' },
      { id: 'sp-champ-pb',        name: 'Chameleon Purple Blue',   price: 30, color: '#8060c0', btnColor: 'Chameleon Purple Blue', img: 'images/shells/sp-champ-pb.jpg' },
      { id: 'sp-scarlet',         name: 'Scarlet Red',             price: 30, color: '#cc2820', btnColor: 'Scarlet Red', img: 'images/shells/sp-scarlet.jpg' },
      { id: 'sp-black',           name: 'Black',                   price: 30, color: '#1a1a1a', btnColor: 'Black', img: 'images/shells/sp-black.jpg' },
      { id: 'sp-white',           name: 'White',                   price: 30, color: '#f0f0ec', btnColor: 'White', img: 'images/shells/sp-white.jpg' },
      { id: 'sp-cherry-blossom',  name: 'Cherry Blossom Pink',     price: 30, color: '#e8a8c0', btnColor: 'Cherry Blossom Pink', img: 'images/shells/sp-cherry-blossom.jpg' },
      { id: 'sp-clear',           name: 'Clear',                   price: 30, color: '#d8e8e0', btnColor: 'Clear', img: 'images/shells/sp-clear.jpg' },
      { id: 'sp-glacier',         name: 'Glacier Blue',            price: 30, color: '#88d0f0', btnColor: 'Glacier Blue', img: 'images/shells/sp-glacier.jpg' },
      { id: 'sp-clr-atomic',      name: 'Clear Atomic Purple',     price: 30, color: '#c0a0e0', btnColor: 'Clear Atomic Purple', img: 'images/shells/sp-clr-atomic.jpg' },
      { id: 'sp-clr-blue',        name: 'Clear Blue',              price: 30, color: '#6090e0', btnColor: 'Clear Blue', img: 'images/shells/sp-clr-blue.jpg' },
      { id: 'sp-clr-emerald',     name: 'Clear Emerald Green',     price: 30, color: '#40c080', btnColor: 'Clear Emerald Green', img: 'images/shells/sp-clr-emerald.jpg' },
      { id: 'sp-clr-cherry-pink', name: 'Clear Cherry Pink',       price: 30, color: '#f0b0c0', btnColor: 'Clear Cherry Pink', img: 'images/shells/sp-clr-cherry-pink.jpg' },
      { id: 'sp-clr-black',       name: 'Clear Black',             price: 30, color: '#2a2a30', btnColor: 'Clear Black', img: 'images/shells/sp-clr-black.jpg' },
      { id: 'sp-clr-glow',        name: 'Clear Glow-in-the-Dark', price: 30, color: '#b0f0b0', btnColor: 'Clear Glow-in-the-Dark', img: 'images/shells/sp-clr-glow.jpg' },
      { id: 'sp-matcha',          name: 'Matcha Green',            price: 30, color: '#8cc070', btnColor: 'Matcha Green', img: 'images/shells/sp-matcha.jpg' },
      { id: 'sp-passion-red',     name: 'Passion Red & White',     price: 30, color: '#e03028', btnColor: 'Passion Red & White', img: 'images/shells/sp-passion-red.jpg' },
      { id: 'sp-champ-gp',        name: 'Chameleon Green Purple',  price: 30, color: '#70a060', btnColor: 'Chameleon Green Purple', img: 'images/shells/sp-champ-gp.jpg' },
    ],
  };

  // Hex lookup for button swatch colors — often differs from shell color
  const BTN_HEX = {
    'Original factory':                       '#9fa3a8',
    'Classic DMG (off-white + colored)':      '#e8e4d0',
    'Black':                                  '#1a1a1a',
    'Classic NES (red + yellow)':             '#cc2820',
    'Chameleon Purple Blue':                  '#8060c0',
    'Scarlet Red':                            '#cc2820',
    'Chrome Gold':                            '#c8a020',
    'White':                                  '#f0f0ec',
    'Classic Gray':                           '#9fa3a8',
    'Gray':                                   '#9fa3a8',
    'Purple':                                 '#7840a8',
    'Cherry Blossom Pink':                    '#e8a8c0',
    'Clear':                                  '#d8e8e0',
    'Clear Cherry Pink':                      '#f0b0c0',
    'Clear Atomic Purple':                    '#c0a0e0',
    'Glacier Blue':                           '#88d0f0',
    'Clear Red':                              '#e87060',
    'Gradient Bluebell':                      '#7880d8',
    'Gradient Green Blue':                    '#60b8c0',
    'Wood Grain':                             '#a07848',
    'The Great Wave':                         '#1840a0',
    'Glow in Dark Green':                     '#80c858',
    'Chameleon Green Purple':                 '#70a060',
    'Classic FC (red + gold)':                '#cc4020',
    'SNES colors (purple, pink, yellow, green)': '#9030a8',
    'SFC colors (purple, pink, yellow, green)':  '#9030a8',
    'Clear Blue':                             '#6090e0',
    'Clear Emerald Green':                    '#40c080',
    'Clear Black':                            '#2a2a30',
    'Clear Glow-in-the-Dark':                '#b0f0b0',
    'Matcha Green':                           '#8cc070',
    'Passion Red & White':                    '#e03028',
  };

  function getModelButtons() {
    const shells = [OEM_STOCK, ...(MODEL_SHELLS[state.model] || [])];
    const seen = new Set();
    const list = [];
    shells.forEach(s => {
      if (!seen.has(s.btnColor)) {
        seen.add(s.btnColor);
        list.push({ id: s.btnColor, name: s.btnColor, color: BTN_HEX[s.btnColor] || s.color });
      }
    });
    return list;
  }

  function getIncludedBtnColor() {
    const shell = getModelShells().find(s => s.id === state.shell) || OEM_STOCK;
    return shell.btnColor;
  }

  function getBtnPrice() {
    return state.buttons === getIncludedBtnColor() ? 0 : 10;
  }

  const MODEL_MODS = {
    dmg: {
      screens: [
        { id: 'stock',   name: 'Stock (cleaned)',                          price: 0,   note: '' },
        { id: 'v5-ips',  name: 'V5 Ultra IPS + OSD \u2014 Hispeedido',    price: 80,  note: 'Standard size \u00b7 36 color modes \u00b7 OSD menu' },
        { id: 'q5-fp',   name: 'Q5 Retro Pixel IPS \u2014 FunnyPlaying',  price: 90,  note: '11% enlarged view \u00b7 glass lens required (sep.)' },
        { id: 'q5-lam',  name: 'Q5 3.1\u2033 Laminated IPS \u2014 Hispeedido', price: 105, note: 'Pre-adhered glass lens \u00b7 requires Hispeedido laminated shell' },
      ],
      audio: [
        { id: 'stock',   name: 'Stock audio',         price: 0 },
        { id: 'pro',     name: 'Prosound out',         price: 20 },
        { id: 'bivert',  name: 'Bivert chip',          price: 15 },
        { id: 'pro+bi',  name: 'Prosound + bivert',    price: 30 },
      ],
      power: [
        { id: 'aa',      name: 'AA / stock',                   price: 0 },
        { id: 'usb',     name: 'USB-C port only',              price: 20 },
        { id: 'cj',      name: 'CleanJuice Li-Ion + USB-C',    price: 55 },
        { id: 'li+fg',   name: 'Li-Ion + fuel gauge',          price: 65 },
      ],
      wireless: [
        { id: 'none',    name: 'No wireless',    price: 0 },
        { id: 'bt',      name: 'BT 5.0',         price: 40 },
        { id: 'bt-ll',   name: 'BT low-latency', price: 50 },
      ],
    },
    gbc: {
      screens: [
        { id: 'stock',   name: 'Stock (cleaned)',                               price: 0,   note: '' },
        { id: 'drop-in', name: '2.45\u2033 Drop-in IPS + OSD \u2014 Hispeedido', price: 110, note: 'Original size \u00b7 no shell mod needed \u00b7 OSD + touch' },
        { id: 'q5-lam',  name: 'Q5 Laminated IPS + OSD \u2014 Hispeedido',    price: 115, note: 'Larger display \u00b7 laminated glass \u00b7 custom shell recommended' },
        { id: 'rp2-fp',  name: 'Retro Pixel 2.0 Q5 Laminated \u2014 FunnyPlaying', price: 120, note: 'Custom lens options \u00b7 FunnyPlaying shell required' },
        { id: 'amoled',  name: 'AMOLED Retro Pixel Touch \u2014 Hispeedido',  price: 125, note: 'OLED panel \u00b7 laminated \u00b7 deepest blacks' },
        { id: 'fpgbc',   name: 'FPGBC \u2014 FunnyPlaying',                   price: 155, note: 'FPGA-based \u00b7 ultimate pixel-accurate display' },
      ],
      audio: [
        { id: 'stock',   name: 'Stock audio',    price: 0 },
        { id: 'pro',     name: 'Prosound out',   price: 20 },
      ],
      power: [
        { id: 'aa',      name: 'AA / stock',              price: 0 },
        { id: 'usb',     name: 'USB-C port only',         price: 20 },
        { id: 'li',      name: 'Li-Ion + USB-C',          price: 45 },
        { id: 'li+fg',   name: 'Li-Ion + fuel gauge',     price: 60 },
      ],
      wireless: [
        { id: 'none',    name: 'No wireless',    price: 0 },
        { id: 'bt',      name: 'BT 5.0',         price: 40 },
        { id: 'bt-ll',   name: 'BT low-latency', price: 50 },
      ],
    },
    gba: {
      screens: [
        { id: 'stock',    name: 'Stock (cleaned)',                             price: 0,  note: '' },
        { id: 'v2-touch', name: 'V2 IPS Touch Sensor \u2014 Hispeedido',     price: 65, note: 'Original shell compatible \u00b7 touch brightness + color' },
        { id: 'v5-drop',  name: 'V5 HD IPS + OSD \u2014 Hispeedido',         price: 85, note: '720\u00d7480 drop-in \u00b7 OSD menu \u00b7 15 brightness levels' },
        { id: 'v5-lam',   name: 'V5 Laminated IPS \u2014 Hispeedido',        price: 100, note: 'Laminated glass \u00b7 requires Hispeedido laminated shell' },
      ],
      audio: [
        { id: 'stock',   name: 'Stock audio',      price: 0 },
        { id: 'speaker', name: 'Speaker upgrade',  price: 15 },
      ],
      power: [
        { id: 'aa',      name: 'AA / stock',              price: 0 },
        { id: 'usb',     name: 'USB-C port only',         price: 20 },
        { id: 'li',      name: 'Li-Ion + USB-C',          price: 45 },
        { id: 'li+fg',   name: 'Li-Ion + fuel gauge',     price: 60 },
      ],
      wireless: [
        { id: 'none',    name: 'No wireless',    price: 0 },
        { id: 'bt',      name: 'BT 5.0',         price: 40 },
        { id: 'bt-ll',   name: 'BT low-latency', price: 50 },
      ],
    },
    sp: {
      screens: [
        { id: 'stock',   name: 'Stock (cleaned)',                             price: 0,  note: '' },
        { id: 'v2-lam',  name: 'V2 IPS Laminated \u2014 Hispeedido',        price: 70, note: 'Bright IPS \u00b7 shell modification required' },
        { id: 'v5-lam',  name: 'V5 3.0\u2033 Laminated + OSD \u2014 Hispeedido', price: 90, note: '720\u00d7480 \u00b7 OSD menu \u00b7 touch pad \u00b7 retro pixel modes' },
        { id: 'fp-m2',   name: 'FP M2 3.0\u2033 Laminated \u2014 FunnyPlaying', price: 90, note: 'Holographic lens \u00b7 fits OEM + IPS shells \u00b7 OSD' },
      ],
      audio: [
        { id: 'stock',   name: 'Stock audio',      price: 0 },
        { id: 'speaker', name: 'Speaker upgrade',  price: 15 },
      ],
      power: [
        { id: 'stock',   name: 'Stock rechargeable',       price: 0 },
        { id: 'usb',     name: 'USB-C port swap',          price: 20 },
        { id: 'li',      name: 'Li-Ion upgrade + USB-C',   price: 45 },
      ],
      wireless: [
        { id: 'none',    name: 'No wireless',    price: 0 },
        { id: 'bt',      name: 'BT 5.0',         price: 40 },
        { id: 'bt-ll',   name: 'BT low-latency', price: 50 },
      ],
    },
  };

  function getMods(cat) {
    return (MODEL_MODS[state.model] || MODEL_MODS.dmg)[cat];
  }

  const state = {
    source: 'source',
    model: 'dmg', shell: 'oem', buttons: 'Original factory',
    screen: 'stock', audio: 'stock', power: 'aa', wireless: 'none',
  };

  /* ===== GALLERY (documented builds) ===== */
  const GALLERY = [
    {
      code:  '001',
      name:  'SP · Clear Blue — Chrome Gold',
      model: 'sp',
      shell: 'sp-clr-blue',
      tags:  'Clear Blue shell · Chrome Gold D-pad &amp; buttons · AGS-001 · USB-C',
      img:   'images/builds/build-001.jpg',
      date:  'May 2026',
      sold:  true,
    },
  ];

  /* ===== FAQ ===== */
  const FAQ = [
    {
      q: 'How do I send my handheld in?',
      a: 'After we confirm your estimate, we send packing notes and (optional) a pre-paid return label. We open the package on camera.'
    },
    {
      q: 'What\'s the typical turnaround?',
      a: 'Most builds and repairs are on the bench for 7 to 18 days. The variable is parts availability — IPS panels and certain shells can be order-only. You\'ll get a progress note when we open the unit and another when we close it.'
    },
    {
      q: 'Do you guarantee the work?',
      a: 'Sixty-day workmanship warranty on every modification. Pre-existing board damage, cartridge slot corrosion, and physical damage are noted in the service record but not covered. We will always tell you what we find.'
    },
    {
      q: 'Can you save my saves?',
      a: 'Cartridge save data can be backed up and saved. Send us an inquiry for game cartridge repairs.'
    },
    {
      q: 'Do you work on clones or aftermarket consoles?',
      a: 'Case-by-case. Some clone boards are well-supported; others are sealed in epoxy and not worth the bench time. Send photos in your inquiry and we\'ll let you know.'
    },
    {
      q: 'Where are you based, and do you ship internationally?',
      a: 'Mod Machine is based in Michigan, USA. At the moment we do not provide service for our friends outside of the United States'
    },
  ];

  /* ===== PREVIEW SVG ===== */
  function getModelShells() {
    return [OEM_STOCK, ...(MODEL_SHELLS[state.model] || [])];
  }

  function getSwatch(id) {
    const s = getModelShells().find(s => s.id === id);
    return s ? s.color : '#9fa3a8';
  }

  function deviceSvg(modelId, shellId, opts={}) {
    const shell = getSwatch(shellId);
    const screenOn = opts.screenOn !== false;
    const screenColor = opts.screenColor || '#9bbc0f';
    const buttonColor = opts.buttonColor || '#1a1815';
    const m = modelId;

    if (m === 'dmg' || m === 'gbc') {
      return `<svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="6" width="180" height="308" rx="14" fill="${shell}" stroke="#0a0a0a" stroke-width="1.5"/>
        <rect x="26" y="32" width="148" height="118" rx="4" fill="#0a0a0a"/>
        <text x="34" y="50" font-family="Space Mono" font-size="7" fill="${m==='gbc'?'#d96820':'#8a8580'}" letter-spacing="1">${m==='gbc' ? 'COLOR' : 'DOT MATRIX'}</text>
        <rect x="48" y="58" width="104" height="80" fill="${screenColor}" opacity="${screenOn?0.95:0.6}"/>
        <circle cx="36" cy="102" r="3" fill="#d96820"/>
        <text x="100" y="174" text-anchor="middle" font-family="Barlow Condensed" font-style="italic" font-size="11" fill="#0a0a0a">${m==='gbc'?'Color':'Game Boy'}</text>
        <rect x="34" y="200" width="44" height="14" fill="${buttonColor}" rx="2"/>
        <rect x="49" y="186" width="14" height="42" fill="${buttonColor}" rx="2"/>
        <circle cx="142" cy="212" r="11" fill="${buttonColor}"/>
        <circle cx="120" cy="222" r="11" fill="${buttonColor}"/>
        <text x="142" y="216" text-anchor="middle" font-family="Anton" font-size="9" fill="${shell}">A</text>
        <text x="120" y="226" text-anchor="middle" font-family="Anton" font-size="9" fill="${shell}">B</text>
        <rect x="75" y="252" width="20" height="6" rx="3" fill="${buttonColor}" transform="rotate(-25 85 255)"/>
        <rect x="105" y="252" width="20" height="6" rx="3" fill="${buttonColor}" transform="rotate(-25 115 255)"/>
        <g stroke="#0a0a0a" stroke-width="0.7" opacity="0.5">
          <line x1="142" y1="278" x2="160" y2="296"/>
          <line x1="148" y1="278" x2="166" y2="296"/>
          <line x1="154" y1="278" x2="172" y2="296"/>
        </g>
      </svg>`;
    }
    if (m === 'gbp') {
      return `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="6" width="172" height="250" rx="16" fill="${shell}" stroke="#0a0a0a" stroke-width="1.5"/>
        <rect x="28" y="28" width="144" height="92" rx="4" fill="#0a0a0a"/>
        <rect x="46" y="48" width="108" height="56" fill="${screenColor}" opacity="${screenOn?0.95:0.6}"/>
        <circle cx="36" cy="74" r="3" fill="#d96820"/>
        <text x="100" y="142" text-anchor="middle" font-family="Barlow Condensed" font-style="italic" font-size="11" fill="#0a0a0a">Pocket</text>
        <rect x="36" y="166" width="40" height="12" fill="${buttonColor}" rx="2"/>
        <rect x="50" y="154" width="12" height="36" fill="${buttonColor}" rx="2"/>
        <circle cx="148" cy="174" r="10" fill="${buttonColor}"/>
        <circle cx="126" cy="184" r="10" fill="${buttonColor}"/>
        <rect x="78" y="212" width="18" height="5" rx="2" fill="${buttonColor}" transform="rotate(-22 87 215)"/>
        <rect x="104" y="212" width="18" height="5" rx="2" fill="${buttonColor}" transform="rotate(-22 113 215)"/>
      </svg>`;
    }
    if (m === 'gba') {
      return `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M 30 6 Q 6 6 6 36 L 6 164 Q 6 194 30 194 L 330 194 Q 354 194 354 164 L 354 36 Q 354 6 330 6 Z" fill="${shell}" stroke="#0a0a0a" stroke-width="1.5"/>
        <rect x="14" y="4" width="60" height="14" rx="6" fill="${shell}" stroke="#0a0a0a" stroke-width="1.2"/>
        <rect x="286" y="4" width="60" height="14" rx="6" fill="${shell}" stroke="#0a0a0a" stroke-width="1.2"/>
        <rect x="100" y="32" width="160" height="120" rx="4" fill="#0a0a0a"/>
        <rect x="116" y="50" width="128" height="84" fill="${screenColor}" opacity="0.92"/>
        <text x="180" y="170" text-anchor="middle" font-family="Barlow Condensed" font-style="italic" font-size="11" fill="#0a0a0a">Advance</text>
        <rect x="32" y="86" width="44" height="14" fill="${buttonColor}" rx="2"/>
        <rect x="47" y="72" width="14" height="42" fill="${buttonColor}" rx="2"/>
        <circle cx="316" cy="92" r="12" fill="${buttonColor}"/>
        <circle cx="290" cy="106" r="12" fill="${buttonColor}"/>
        <rect x="170" y="172" width="18" height="5" rx="2" fill="${buttonColor}"/>
        <rect x="194" y="172" width="18" height="5" rx="2" fill="${buttonColor}"/>
      </svg>`;
    }
    if (m === 'sp') {
      return `<svg viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="10" width="200" height="140" rx="10" fill="${shell}" stroke="#0a0a0a" stroke-width="1.5"/>
        <rect x="36" y="26" width="168" height="108" rx="3" fill="#0a0a0a"/>
        <rect x="48" y="38" width="144" height="84" fill="${screenColor}" opacity="${screenOn?0.95:0.7}"/>
        <rect x="20" y="148" width="200" height="14" fill="#2a2a2a" stroke="#0a0a0a" stroke-width="1.2"/>
        <circle cx="40" cy="155" r="4" fill="#0a0a0a"/>
        <circle cx="200" cy="155" r="4" fill="#0a0a0a"/>
        <rect x="20" y="162" width="200" height="148" rx="10" fill="${shell}" stroke="#0a0a0a" stroke-width="1.5"/>
        <rect x="44" y="216" width="44" height="14" fill="${buttonColor}" rx="2"/>
        <rect x="59" y="202" width="14" height="42" fill="${buttonColor}" rx="2"/>
        <circle cx="184" cy="222" r="11" fill="${buttonColor}"/>
        <circle cx="160" cy="232" r="11" fill="${buttonColor}"/>
        <text x="184" y="226" text-anchor="middle" font-family="Anton" font-size="9" fill="${shell}">A</text>
        <text x="160" y="236" text-anchor="middle" font-family="Anton" font-size="9" fill="${shell}">B</text>
        <rect x="98" y="270" width="18" height="5" rx="2" fill="${buttonColor}"/>
        <rect x="124" y="270" width="18" height="5" rx="2" fill="${buttonColor}"/>
        <text x="120" y="294" text-anchor="middle" font-family="Barlow Condensed" font-style="italic" font-size="11" fill="#0a0a0a">Advance SP</text>
      </svg>`;
    }
    if (m === 'micro') {
      return `<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="308" height="148" rx="10" fill="${shell}" stroke="#0a0a0a" stroke-width="1.5"/>
        <rect x="74" y="22" width="172" height="118" rx="3" fill="#0a0a0a"/>
        <rect x="90" y="38" width="140" height="84" fill="${screenColor}" opacity="0.95"/>
        <rect x="20" y="68" width="38" height="12" fill="${buttonColor}" rx="2"/>
        <rect x="32" y="56" width="12" height="36" fill="${buttonColor}" rx="2"/>
        <circle cx="282" cy="74" r="10" fill="${buttonColor}"/>
        <circle cx="262" cy="86" r="10" fill="${buttonColor}"/>
        <text x="160" y="150" text-anchor="middle" font-family="Barlow Condensed" font-style="italic" font-size="11" fill="#0a0a0a">Micro</text>
      </svg>`;
    }
    return '';
  }

  function renderPreview() {
    const slot = document.getElementById('previewSlot');
    const screenOn = state.screen !== 'stock';
    const screenColor = state.screen === 'stock' ? '#9bbc0f' : '#bdf26d';
    const buttonColor = state.buttons === 'metallic' ? '#a8a8b0' :
                        state.buttons === 'translucent' ? 'rgba(60,40,40,0.4)' :
                        state.buttons === 'reproblk' ? '#0a0a0a' :
                        '#d96820';
    slot.innerHTML = deviceSvg(state.model, state.shell, { screenOn, screenColor, buttonColor });
  }

  /* ===== RENDER ===== */
  function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = GALLERY.map(g => `
      <div class="gal-item ${GALLERY.length === 1 ? 'gal-solo' : ''}">
        <div class="gal-frame" data-num="No. ${g.code}">
          ${g.img
            ? `<img src="${g.img}" alt="${g.name}" class="gal-photo"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
              /><div class="gal-svg-fallback" style="display:none">${deviceSvg(g.model, g.shell, { screenOn: true, screenColor: '#bdf26d', buttonColor: '#c8a020' })}</div>`
            : deviceSvg(g.model, g.shell, { screenOn: true, screenColor: '#bdf26d', buttonColor: '#0a0a0a' })
          }
        </div>
        <div class="gal-info">
          <span class="nm">${g.name}</span>
          <span class="gal-date">${g.date}</span>
        </div>
        <div class="gal-tags">${g.tags}</div>
      </div>
    `).join('');
  }

  function renderFaq() {
    const list = document.getElementById('faqList');
    list.innerHTML = FAQ.map((f, i) => `
      <div class="faq-item" data-i="${i}">
        <div class="faq-q">
          <span class="qn">Q.${String(i+1).padStart(2,'0')}</span>
          <span class="qt">${f.q}</span>
          <span class="plus">+</span>
        </div>
        <div class="faq-a"><div class="faq-a-inner">${f.a}</div></div>
      </div>
    `).join('');
    list.querySelectorAll('.faq-item').forEach(it => {
      it.onclick = () => it.classList.toggle('open');
    });
  }

  function renderSource() {
    const el = document.getElementById('sourceChoices');
    const curModel = MODELS.find(m => m.id === state.model && !m.inquire) || MODELS.find(m => !m.inquire);
    el.innerHTML = SOURCE.map(o => {
      const priceLabel = o.price === 0
        ? 'incl.'
        : o.price === null
          ? '+$' + (curModel ? curModel.sourceFee : '??')
          : '+$' + o.price;
      return `
      <button class="chip ${state.source===o.id?'selected':''}" data-id="${o.id}">
        <span class="chip-inner">
          <span>${o.name}</span>
          <span class="chip-note">${o.note}</span>
        </span>
        <span class="pr">${priceLabel}</span>
      </button>`;
    }).join('');
    el.querySelectorAll('.chip').forEach(c =>
      c.onclick = () => { state.source = c.dataset.id; renderAll(); }
    );
  }

  function renderChassis() {
    const grid = document.getElementById('chassisGrid');
    grid.innerHTML = MODELS.map(m => {
      if (m.inquire) {
        return `
          <div class="ch ch-inquire" title="Shell availability varies — inquire for Micro builds" onclick="setView('inquire')">
            <div class="code">${m.code}</div>
            <div class="nm">${m.name}</div>
            <div class="yr">— ${m.year}</div>
            <div class="ch-inquire-label">Inquire only ↗</div>
          </div>`;
      }
      return `
        <div class="ch ${state.model===m.id?'selected':''}" data-id="${m.id}">
          <div class="code">${m.code}</div>
          <div class="nm">${m.name}</div>
          <div class="yr">— ${m.year}</div>
          <div class="base">$${m.base}</div>
        </div>`;
    }).join('');
    grid.querySelectorAll('.ch:not(.ch-inquire)').forEach(c =>
      c.onclick = () => { state.model = c.dataset.id; state.shell = 'oem'; renderAll(); }
    );
  }

  function renderChips(containerId, list, key, hasSwatch=false) {
    const el = document.getElementById(containerId);
    el.innerHTML = list.map(o => `
      <button class="chip ${state[key]===o.id?'selected':''}" data-id="${o.id}">
        ${hasSwatch ? `<span class="swatch" style="background:${o.color}"></span>` : ''}
        <span>${o.name}</span>
        <span class="pr">${o.price===0?'incl.':'+$'+o.price}</span>
      </button>
    `).join('');
    el.querySelectorAll('.chip').forEach(c =>
      c.onclick = () => { state[key] = c.dataset.id; renderAll(); }
    );
  }

  function renderBom() {
    const model = MODELS.find(m=>m.id===state.model && !m.inquire) || MODELS.find(m=>!m.inquire);
    const src      = SOURCE.find(s=>s.id===state.source);
    const srcPrice = src.id === 'source' ? (model.sourceFee || 0) : 0;
    const shell = getModelShells().find(s=>s.id===state.shell) || OEM_STOCK;
    const btnPrice = getBtnPrice();
    const btnLabel = state.buttons + (btnPrice === 0 ? ' (incl.)' : '');
    const mods = MODEL_MODS[state.model] || MODEL_MODS.dmg;
    const scr = mods.screens.find(s=>s.id===state.screen)   || mods.screens[0];
    const aud = mods.audio.find(a=>a.id===state.audio)      || mods.audio[0];
    const pwr = mods.power.find(p=>p.id===state.power)      || mods.power[0];
    const wir = mods.wireless.find(w=>w.id===state.wireless) || mods.wireless[0];

    const items = [
      { l:'UNIT',     v: src.name,     p: srcPrice },
      { l:'SERVICE',  v: model.name+' · teardown, clean, test, document', p: model.base },
      { l:'SHELL',    v: shell.name,   p: shell.price },
      { l:'BUTTONS',  v: btnLabel,     p: btnPrice },
      { l:'DISPLAY',  v: scr.name,     p: scr.price },
      { l:'AUDIO',    v: aud.name,     p: aud.price },
      { l:'POWER',    v: pwr.name,     p: pwr.price },
      { l:'WIRELESS', v: wir.name,     p: wir.price },
    ];
    const total = items.reduce((s,i)=>s+i.p,0);
    const eta = total<150?'7 days':total<300?'10 days':total<450?'14 days':'18 days';

    document.getElementById('bomList').innerHTML = items.map(i=>`
      <li><span class="lbl">${i.l}</span><span class="val">${i.v}</span><span class="pri">${i.p===0?'—':'$'+i.p}</span></li>
    `).join('');
    document.getElementById('totalNum').textContent = total;
    document.getElementById('etaText').textContent = eta;
  }

  function renderButtonGrid() {
    const el = document.getElementById('buttonChoices');
    if (!el) return;
    const list = getModelButtons();
    const includedColor = getIncludedBtnColor();
    el.innerHTML = list.map(o => {
      const isSelected  = state.buttons === o.id;
      const isIncluded  = o.id === includedColor;
      const priceLabel  = isIncluded ? 'incl.' : '+$10';
      return `
        <button class="btn-card ${isSelected ? 'selected' : ''} ${isIncluded ? 'is-included' : ''}"
                data-id="${o.id}" title="${o.name}">
          <div class="btn-swatch" style="background:${o.color}"></div>
          <div class="btn-info">
            <span class="b-name">${o.name}</span>
            <span class="b-price">${priceLabel}</span>
          </div>
        </button>`;
    }).join('');
    el.querySelectorAll('.btn-card').forEach(c =>
      c.onclick = () => { state.buttons = c.dataset.id; renderAll(); }
    );
  }

  function renderShells() {
    const el = document.getElementById('shellChoices');
    const list = getModelShells();
    const supplier = { dmg: 'Hispeedido', gbc: 'eXtremeRate', gba: 'eXtremeRate', sp: 'eXtremeRate' }[state.model] || '';
    const shellHead = el?.previousElementSibling;
    if (shellHead) { const tag = shellHead.querySelector('.tag'); if (tag) tag.textContent = supplier; }
    el.innerHTML = list.map(o => `
      <button class="chip ${state.shell===o.id?'selected':''}" data-id="${o.id}">
        <span class="swatch" style="background:${o.color};width:16px;height:16px;border:1.5px solid var(--ink);flex-shrink:0;display:inline-block;"></span>
        <span>${o.name}</span>
        <span class="pr">${o.price===0?'incl.':'+$'+o.price}</span>
      </button>
    `).join('');
    el.querySelectorAll('.chip').forEach(c =>
      c.onclick = () => { const s = getModelShells().find(x=>x.id===c.dataset.id)||OEM_STOCK; state.shell = s.id; state.buttons = s.btnColor; renderAll(); }
    );
  }

  function renderAll() {
    renderSource();
    renderChassis();
    renderShells();
    renderButtonGrid();
    renderChips('screenChoices',   getMods('screens'),      'screen',   false);
    renderChips('audioChoices',    getMods('audio'),        'audio',    false);
    renderChips('powerChoices',    getMods('power'),        'power',    false);
    renderChips('wirelessChoices', getMods('wireless'),     'wireless', false);
    renderPreview();
    renderBom();
  }

  /* ── Form helpers ── */
  function showFormStatus(elId, type, msg) {
    let el = document.getElementById(elId);
    if (!el) {
      el = document.createElement('div');
      el.id = elId;
      el.style.cssText = 'margin-top:12px;padding:12px 16px;font-family:"Space Mono",monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;';
    }
    el.style.background = type === 'ok'   ? 'rgba(80,160,80,0.15)'  :
                          type === 'err'  ? 'rgba(200,48,24,0.15)'  :
                                            'rgba(240,192,0,0.1)';
    el.style.color = type === 'ok'  ? '#60c860' :
                     type === 'err' ? '#c83018'  :
                                      '#f0c000';
    el.style.border = `1px solid ${el.style.color}`;
    el.textContent = msg;
    return el;
  }

  function setBtnLoading(btn, loading) {
    btn.disabled = loading;
    btn.dataset.orig = btn.dataset.orig || btn.innerHTML;
    btn.innerHTML = loading ? '⚙ Sending…' : btn.dataset.orig;
  }

  /* ── Build request — contact modal ── */
  function submitBuild() {
    document.getElementById('buildModal').style.display = 'flex';
    document.getElementById('bmName').focus();
  }

  function closeBuildModal() {
    document.getElementById('buildModal').style.display = 'none';
    const status = document.getElementById('bmStatus');
    if (status) status.remove();
  }

  async function confirmBuildSubmit() {
    const name  = (document.getElementById('bmName').value  || '').trim();
    const email = (document.getElementById('bmEmail').value || '').trim();
    const btn   = document.getElementById('bmSubmitBtn');

    if (!name || !email) {
      document.getElementById('bmForm').appendChild(
        showFormStatus('bmStatus', 'err', 'Name and email are required.')
      );
      return;
    }

    const mods    = MODEL_MODS[state.model] || MODEL_MODS.dmg;
    const model   = MODELS.find(m => m.id === state.model) || MODELS[0];
    const src     = SOURCE.find(s => s.id === state.source);
    const shell   = getModelShells().find(s => s.id === state.shell) || OEM_STOCK;
    const scr     = mods.screens.find(s => s.id === state.screen)   || mods.screens[0];
    const aud     = mods.audio.find(a => a.id === state.audio)      || mods.audio[0];
    const pwr     = mods.power.find(p => p.id === state.power)      || mods.power[0];
    const wir     = mods.wireless.find(w => w.id === state.wireless) || mods.wireless[0];
    const total   = document.getElementById('totalNum').textContent;
    const eta     = document.getElementById('etaText').textContent;

    setBtnLoading(btn, true);

    try {
      const res = await fetch('/api/build', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName:  name,
          customerEmail: email,
          model:    model.name + ' (' + model.code + ')',
          source:   src ? src.name : state.source,
          shell:    shell.name + ' (+$' + shell.price + ')',
          buttons:  state.buttons + (getBtnPrice() === 0 ? ' (incl.)' : ' (+$10)'),
          screen:   scr.name  + ' (+$' + scr.price  + ')',
          audio:    aud.name  + ' (+$' + aud.price  + ')',
          power:    pwr.name  + ' (+$' + pwr.price  + ')',
          wireless: wir.name  + ' (+$' + wir.price  + ')',
          total,
          eta,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        document.getElementById('bmForm').appendChild(
          showFormStatus('bmStatus', 'ok', '✓ Work order sent — check your email for confirmation.')
        );
        setTimeout(closeBuildModal, 3000);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      document.getElementById('bmForm').appendChild(
        showFormStatus('bmStatus', 'err', err.message || 'Send failed — try emailing us directly.')
      );
    } finally {
      setBtnLoading(btn, false);
    }
  }

  /* ── Inquiry form ── */
  async function submitInquiry() {
    const name    = (document.getElementById('iName').value   || '').trim();
    const email   = (document.getElementById('iEmail').value  || '').trim();
    const device  = (document.getElementById('iDevice').value || '').trim();
    const type    = (document.getElementById('iType').value   || '').trim();
    const message = (document.getElementById('iMsg').value    || '').trim();
    const btn     = document.querySelector('.btn[onclick="submitInquiry()"]') ||
                    document.querySelector('[onclick="submitInquiry()"]');
    const foot    = btn?.closest('.form-foot') || btn?.parentElement;

    if (!name || !email || !message) {
      if (foot) foot.appendChild(showFormStatus('iqStatus', 'err', 'Name, email and message are required.'));
      return;
    }

    setBtnLoading(btn, true);

    try {
      const res = await fetch('/api/inquiry', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, device, serviceType: type, message }),
      });
      const data = await res.json();
      if (data.ok) {
        document.getElementById('iName').value  = '';
        document.getElementById('iEmail').value = '';
        document.getElementById('iMsg').value   = '';
        if (foot) foot.appendChild(
          showFormStatus('iqStatus', 'ok', '✓ Inquiry sent — we\'ll reply within 48 hours.')
        );
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      if (foot) foot.appendChild(
        showFormStatus('iqStatus', 'err', err.message || 'Send failed — email us directly at builders@modmachine.shop')
      );
    } finally {
      setBtnLoading(btn, false);
    }
  }

  /* ===== INIT ===== */
  renderGallery();
  renderFaq();
  renderAll();

  // Explicitly expose functions used by inline onclick handlers in HTML
  window.setView            = setView;
  window.submitBuild        = submitBuild;
  window.submitInquiry      = submitInquiry;
  window.closeBuildModal    = closeBuildModal;
  window.confirmBuildSubmit = confirmBuildSubmit;
