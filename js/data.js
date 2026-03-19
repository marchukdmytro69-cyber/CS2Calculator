/* ═══════════════════════════════════════════════════════════════════════════
   data.js  —  Game constants, weapon database, loadout definitions
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── ECONOMY CONSTANTS ──────────────────────────────────────────────────── */

/** Maximum money a player can hold. */
const MAX_MONEY = 16000;

/** Round-win income per side. */
const WIN_INCOME = { CT: 3250, T: 3500 };

/**
 * Bomb plant bonus – awarded to T side ONLY when they plant the bomb,
 * regardless of whether they win or lose the round.
 * CT side NEVER receives this bonus.
 */
const BOMB_PLANT_BONUS = 800;

/**
 * CT defuse bonus – awarded to CT side when:
 *   • bomb was planted  AND
 *   • CT won the round (successfully defused)
 * In all other cases CT gets $0 extra.
 */
const CT_DEFUSE_BONUS = 300;

/**
 * Kill reward per weapon category (CS2 values).
 * id must be stable – used as key in state.kills[].killId
 */
const KILL_REWARDS = [
  { id: 'rifle',  label: 'Гвинтівка / Пістолет', reward: 300,  icon: '🔫', desc: 'AK, M4, Deagle…' },
  { id: 'awp',    label: 'AWP / Снайпер',         reward: 100,  icon: '🎯', desc: 'AWP, SSG 08…'    },
  { id: 'smg_sg', label: 'SMG / Дробовик',        reward: 600,  icon: '💥', desc: 'MP9, UMP, Nova…' },
  { id: 'knife',  label: 'Ніж',                   reward: 1500, icon: '🔪', desc: '+$1500 за кіл'   },
];

/** Maximum kills that can be recorded per round. */
const MAX_KILLS = 5;

/**
 * Loss bonus indexed by consecutive loss streak (1 = first loss in a row, etc.).
 * Index 0 is a placeholder (a team cannot have a "0-loss streak" that earns a bonus).
 */
const LOSS_BONUS = [1400, 1900, 2400, 2900, 3400, 3400];

/* ─── WEAPON DATABASE ────────────────────────────────────────────────────── */

/**
 * Each category has:
 *   id       – unique key used as tab identifier
 *   label    – display name (Ukrainian)
 *   items[]  – array of weapon objects
 *
 * Each item has:
 *   id       – unique string key
 *   name     – display name
 *   price    – cost in $
 *   sides    – ['CT'] | ['T'] | ['CT', 'T']
 *   cat      – category tag shown in chip
 *   maxCount – how many the player can carry (default 1)
 */
const WEAPON_CATEGORIES = [
  {
    id: 'rifles',
    label: 'Рифли',
    items: [
      { id: 'ak47',   name: 'AK-47',      price: 2700, sides: ['T'],        cat: 'RIFLE'  },
      { id: 'sg553',  name: 'SG 553',     price: 3000, sides: ['T'],        cat: 'RIFLE'  },
      { id: 'galil',  name: 'Galil AR',   price: 1800, sides: ['T'],        cat: 'RIFLE'  },
      { id: 'm4a1s',  name: 'M4A1-S',     price: 2900, sides: ['CT'],       cat: 'RIFLE'  },
      { id: 'm4a4',   name: 'M4A4',       price: 3100, sides: ['CT'],       cat: 'RIFLE'  },
      { id: 'famas',  name: 'FAMAS',      price: 2050, sides: ['CT'],       cat: 'RIFLE'  },
      { id: 'aug',    name: 'AUG',        price: 3300, sides: ['CT'],       cat: 'RIFLE'  },
      { id: 'awp',    name: 'AWP',        price: 4750, sides: ['CT', 'T'],  cat: 'SNIPER' },
      { id: 'ssg08',  name: 'SSG 08',     price: 1700, sides: ['CT', 'T'],  cat: 'SNIPER' },
      { id: 'scar20', name: 'SCAR-20',    price: 5000, sides: ['CT'],       cat: 'SNIPER' },
      { id: 'g3sg1',  name: 'G3SG1',      price: 5000, sides: ['T'],        cat: 'SNIPER' },
    ],
  },
  {
    id: 'pistols',
    label: 'Пістолети',
    items: [
      { id: 'deagle',    name: 'Desert Eagle', price: 700, sides: ['CT', 'T'], cat: 'PISTOL' },
      { id: 'r8',        name: 'R8 Revolver',  price: 700, sides: ['CT', 'T'], cat: 'PISTOL' },
      { id: 'p250',      name: 'P250',         price: 300, sides: ['CT', 'T'], cat: 'PISTOL' },
      { id: 'cz75',      name: 'CZ75-Auto',    price: 500, sides: ['CT', 'T'], cat: 'PISTOL' },
      { id: 'fiveseven', name: 'Five-SeveN',   price: 500, sides: ['CT'],      cat: 'PISTOL' },
      { id: 'tec9',      name: 'Tec-9',        price: 500, sides: ['T'],       cat: 'PISTOL' },
      { id: 'usp',       name: 'USP-S',        price: 200, sides: ['CT'],      cat: 'PISTOL' },
      { id: 'glock',     name: 'Glock-18',     price: 200, sides: ['T'],       cat: 'PISTOL' },
      { id: 'p2000',     name: 'P2000',        price: 200, sides: ['CT'],      cat: 'PISTOL' },
    ],
  },
  {
    id: 'smg',
    label: 'SMG',
    items: [
      { id: 'mp9',   name: 'MP9',      price: 1250, sides: ['CT'],       cat: 'SMG' },
      { id: 'mac10', name: 'MAC-10',   price: 1050, sides: ['T'],        cat: 'SMG' },
      { id: 'ump45', name: 'UMP-45',   price: 1200, sides: ['CT', 'T'],  cat: 'SMG' },
      { id: 'mp5sd', name: 'MP5-SD',   price: 1500, sides: ['CT'],       cat: 'SMG' },
      { id: 'p90',   name: 'P90',      price: 2350, sides: ['CT', 'T'],  cat: 'SMG' },
      { id: 'bizon', name: 'PP-Bizon', price: 1400, sides: ['CT', 'T'],  cat: 'SMG' },
      { id: 'mp7',   name: 'MP7',      price: 1500, sides: ['CT', 'T'],  cat: 'SMG' },
    ],
  },
  {
    id: 'heavy',
    label: 'Важке',
    items: [
      { id: 'nova',   name: 'Nova',           price: 1050, sides: ['CT', 'T'], cat: 'SHOTGUN' },
      { id: 'xm1014', name: 'XM1014',         price: 2000, sides: ['CT', 'T'], cat: 'SHOTGUN' },
      { id: 'm249',   name: 'M249',           price: 5200, sides: ['CT', 'T'], cat: 'MG'      },
      { id: 'negev',  name: 'Negev',          price: 1700, sides: ['CT', 'T'], cat: 'MG'      },
    ],
  },
  {
    id: 'armor',
    label: 'Броня',
    items: [
      { id: 'kevlar',     name: 'Kevlar',         price: 650,  sides: ['CT', 'T'], cat: 'ARMOR'   },
      { id: 'kevlarhelm', name: 'Kevlar + Шолом', price: 1000, sides: ['CT', 'T'], cat: 'ARMOR'   },
      { id: 'kit',        name: 'Defuse Kit',     price: 400,  sides: ['CT'],      cat: 'UTILITY' },
    ],
  },
  {
    id: 'grenades',
    label: 'Гранати',
    items: [
      { id: 'he',      name: 'HE Граната',  price: 300, sides: ['CT', 'T'], maxCount: 1, cat: 'GRENADE' },
      { id: 'flash',   name: 'Flashbang',   price: 200, sides: ['CT', 'T'], maxCount: 2, cat: 'GRENADE' },
      { id: 'smoke',   name: 'Smoke',       price: 300, sides: ['CT', 'T'], maxCount: 1, cat: 'GRENADE' },
      { id: 'molotov', name: 'Molotov',     price: 400, sides: ['T'],       maxCount: 1, cat: 'GRENADE' },
      { id: 'incend',  name: 'Incendiary',  price: 500, sides: ['CT'],      maxCount: 1, cat: 'GRENADE' },
      { id: 'decoy',   name: 'Decoy',       price: 50,  sides: ['CT', 'T'], maxCount: 1, cat: 'GRENADE' },
    ],
  },
];

/* ─── RECOMMENDED LOADOUTS ───────────────────────────────────────────────── */

/**
 * Loadouts per side and strategy type.
 * 'essential: true'  → marked with ★, shown with accent left-border
 *
 * INCENDIARY for CT = $500 (correct CS2 price)
 * MOLOTOV    for T  = $400
 */
const LOADOUTS = {
  CT: {
    full: [
      { name: 'M4A4 / M4A1-S',  cat: 'RIFLE',   price: 2900, essential: true  },
      { name: 'Defuse Kit',      cat: 'UTILITY',  price: 400,  essential: true  },
      { name: 'Kevlar + Шолом', cat: 'ARMOR',    price: 1000, essential: true  },
      { name: 'Smoke',           cat: 'GRENADE',  price: 300,  essential: true  },
      { name: 'Incendiary',      cat: 'GRENADE',  price: 500,  essential: false }, // CT $500
      { name: 'Flashbang ×2',   cat: 'GRENADE',  price: 400,  essential: false },
      { name: 'HE Grenade',      cat: 'GRENADE',  price: 300,  essential: false },
    ],
    semi: [
      { name: 'FAMAS',           cat: 'RIFLE',   price: 2050, essential: true  },
      { name: 'Defuse Kit',      cat: 'UTILITY',  price: 400,  essential: true  },
      { name: 'Kevlar + Шолом', cat: 'ARMOR',    price: 1000, essential: true  },
      { name: 'Smoke',           cat: 'GRENADE',  price: 300,  essential: true  },
      { name: 'Flashbang',       cat: 'GRENADE',  price: 200,  essential: false },
    ],
    ssg: [
      { name: 'SSG 08',          cat: 'SNIPER',   price: 1700, essential: true  },
      { name: 'Kevlar + Шолом', cat: 'ARMOR',    price: 1000, essential: true  },
      { name: 'Defuse Kit',      cat: 'UTILITY',  price: 400,  essential: false },
      { name: 'Smoke',           cat: 'GRENADE',  price: 300,  essential: false },
    ],
    force: [
      { name: 'MP9 / UMP-45',   cat: 'SMG',      price: 1250, essential: true  },
      { name: 'Kevlar + Шолом', cat: 'ARMOR',    price: 1000, essential: true  },
      { name: 'Flashbang',       cat: 'GRENADE',  price: 200,  essential: false },
      { name: 'Smoke',           cat: 'GRENADE',  price: 300,  essential: false },
    ],
    eco: [
      { name: 'USP-S / P2000',  cat: 'PISTOL',   price: 200,  essential: true  },
      { name: 'Kevlar',          cat: 'ARMOR',    price: 650,  essential: false },
    ],
    save: [
      { name: 'USP-S / P2000',  cat: 'PISTOL',   price: 0,    essential: true  },
    ],
  },
  T: {
    full: [
      { name: 'AK-47',           cat: 'RIFLE',   price: 2700, essential: true  },
      { name: 'Kevlar + Шолом', cat: 'ARMOR',    price: 1000, essential: true  },
      { name: 'Smoke',           cat: 'GRENADE',  price: 300,  essential: true  },
      { name: 'Molotov',         cat: 'GRENADE',  price: 400,  essential: true  }, // T $400
      { name: 'Flashbang ×2',   cat: 'GRENADE',  price: 400,  essential: false },
      { name: 'HE Grenade',      cat: 'GRENADE',  price: 300,  essential: false },
    ],
    semi: [
      { name: 'Galil AR',        cat: 'RIFLE',   price: 1800, essential: true  },
      { name: 'Kevlar + Шолом', cat: 'ARMOR',    price: 1000, essential: true  },
      { name: 'Smoke',           cat: 'GRENADE',  price: 300,  essential: true  },
      { name: 'Molotov',         cat: 'GRENADE',  price: 400,  essential: false },
      { name: 'Flashbang',       cat: 'GRENADE',  price: 200,  essential: false },
    ],
    ssg: [
      { name: 'SSG 08',          cat: 'SNIPER',   price: 1700, essential: true  },
      { name: 'Kevlar + Шолом', cat: 'ARMOR',    price: 1000, essential: true  },
      { name: 'Smoke',           cat: 'GRENADE',  price: 300,  essential: false },
      { name: 'Molotov',         cat: 'GRENADE',  price: 400,  essential: false },
    ],
    force: [
      { name: 'MAC-10 / UMP-45', cat: 'SMG',      price: 1050, essential: true  },
      { name: 'Kevlar + Шолом', cat: 'ARMOR',    price: 1000, essential: true  },
      { name: 'Molotov',         cat: 'GRENADE',  price: 400,  essential: false },
      { name: 'Flashbang',       cat: 'GRENADE',  price: 200,  essential: false },
    ],
    eco: [
      { name: 'Glock-18',        cat: 'PISTOL',   price: 0,    essential: true  },
      { name: 'Kevlar',          cat: 'ARMOR',    price: 650,  essential: false },
    ],
    save: [
      { name: 'Glock-18',        cat: 'PISTOL',   price: 0,    essential: true  },
    ],
  },
};

/* ─── STRATEGY THRESHOLDS ────────────────────────────────────────────────── */

/**
 * Minimum balance to recommend each strategy.
 * Returns all 6 strategy objects for the given side, ordered best → worst.
 */
function buildStrategies(side) {
  const thresholds = {
    CT: { full: 4200, ssg: 2700, semi: 2850, force: 1800, eco: 900 },
    T:  { full: 4000, ssg: 2500, semi: 2600, force: 1700, eco: 900 },
  }[side];

  return [
    {
      type: 'full',  label: 'ПОВНА ЗАКУПІВЛЯ', cssClass: 'rec-full',  altClass: 'alt-full',
      reason: 'Достатньо для повного закупу. Основна зброя + броня + шолом + повний набір гранат.',
      loadout: LOADOUTS[side].full,   minBalance: thresholds.full,
    },
    {
      type: 'ssg',   label: 'SSG БАЙ',         cssClass: 'rec-semi',  altClass: 'alt-semi',
      reason: 'SSG 08 + броня + шолом. Бюджетний снайпер — хороший вибір після серії поразок.',
      loadout: LOADOUTS[side].ssg,    minBalance: thresholds.ssg,
    },
    {
      type: 'semi',  label: 'НАПІВ-БАЙ',        cssClass: 'rec-semi',  altClass: 'alt-semi',
      reason: 'Бюджетний рифл + броня + шолом + ключові гранати. Баланс між силою та економією.',
      loadout: LOADOUTS[side].semi,   minBalance: thresholds.semi,
    },
    {
      type: 'force', label: 'ФОРС-БАЙ',         cssClass: 'rec-force', altClass: 'alt-force',
      reason: 'SMG форс. Є шанс переломити серію поразок. Ризик! Агресивні позиції та ближній бій.',
      loadout: LOADOUTS[side].force,  minBalance: thresholds.force,
    },
    {
      type: 'eco',   label: 'ЕКО-РАУНД',        cssClass: 'rec-eco',   altClass: 'alt-eco',
      reason: 'Зберігайте гроші. Пістолет + броня по можливості. Накопичуйте на повний закуп.',
      loadout: LOADOUTS[side].eco,    minBalance: thresholds.eco,
    },
    {
      type: 'save',  label: 'ПОВНЕ СЕЙВ',        cssClass: 'rec-eco',   altClass: 'alt-save',
      reason: 'Нічого не купуйте. Максимізуйте бюджет наступного раунду для сильного закупу.',
      loadout: LOADOUTS[side].save,   minBalance: 0,
    },
  ];
}

/* ─── WEAPON LOOKUP HELPER ───────────────────────────────────────────────── */

function findWeapon(id) {
  for (const cat of WEAPON_CATEGORIES) {
    const found = cat.items.find(item => item.id === id);
    if (found) return found;
  }
  return null;
}
