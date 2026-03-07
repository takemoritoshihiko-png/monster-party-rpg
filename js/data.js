// ============================================================
// data.js - All game data constants
// ============================================================

window.GAME_DATA = (() => {

const MONSTER_TYPES = {
  slime: {
    name: 'スライム',
    stages: ['スライム', 'ビッグスライム', 'キングスライム', 'スライム神'],
    baseStats: { hp: 50, atk: 8, def: 5, spd: 7 },
    traits: ['regeneration', null],
    evolveLevel: [0, 10, 25, 50],
    description: '最も基本的なモンスター。高い再生能力を持つ。',
    expYield: 12,
    goldYield: 6,
    fragmentChance: 0.20,
    color: '#4CAF50',
  },
  zombie: {
    name: 'ゾンビ',
    stages: ['ゾンビ', 'ゾンビ兵士', 'ゾンビ将軍', 'リッチ'],
    baseStats: { hp: 80, atk: 12, def: 8, spd: 3 },
    traits: ['undead', 'cursed'],
    evolveLevel: [0, 10, 25, 50],
    description: '高いHPと耐久力を持つアンデッドモンスター。',
    expYield: 15,
    goldYield: 7,
    fragmentChance: 0.20,
    color: '#78909C',
  },
  goblin: {
    name: 'ゴブリン',
    stages: ['ゴブリン', 'ゴブリン戦士', 'ゴブリンキング', 'ゴブリン神皇'],
    baseStats: { hp: 40, atk: 15, def: 4, spd: 12 },
    traits: ['scavenger', 'cunning'],
    evolveLevel: [0, 10, 25, 50],
    description: '素早くずる賢いモンスター。ゴールドを多く落とす。',
    expYield: 13,
    goldYield: 10,
    fragmentChance: 0.20,
    color: '#8BC34A',
  },
  orc: {
    name: 'オーク',
    stages: ['オーク', 'オーク戦士', 'オーク将軍', 'オーク王'],
    baseStats: { hp: 100, atk: 18, def: 12, spd: 4 },
    traits: ['berserk', 'tough'],
    evolveLevel: [0, 10, 25, 50],
    description: '高い攻撃力と耐久力を持つ強大な戦士。',
    expYield: 18,
    goldYield: 9,
    fragmentChance: 0.15,
    color: '#795548',
  },
  darkelf: {
    name: 'ダークエルフ',
    stages: ['ダークエルフ', 'ダークエルフ魔術師', 'ダークエルフ賢者', 'ダークエルフ女王'],
    baseStats: { hp: 45, atk: 20, def: 6, spd: 15 },
    traits: ['magic_affinity', 'shadow'],
    evolveLevel: [0, 10, 25, 50],
    description: '魔法に長けた俊足のモンスター。必殺技が強力。',
    expYield: 20,
    goldYield: 12,
    fragmentChance: 0.15,
    color: '#7B1FA2',
  },
  dragon: {
    name: 'ドラゴン',
    stages: ['ドラゴン幼体', 'ドラゴン', 'エルダードラゴン', '古竜'],
    baseStats: { hp: 120, atk: 25, def: 15, spd: 8 },
    traits: ['fire', 'flying'],
    evolveLevel: [0, 15, 30, 60],
    description: '炎を操る強大なドラゴン。全ステータスが高い。',
    expYield: 30,
    goldYield: 20,
    fragmentChance: 0.12,
    color: '#F44336',
  },
  demon: {
    name: 'デーモン',
    stages: ['デーモン', 'アークデーモン', 'デーモン公', 'デーモン王'],
    baseStats: { hp: 150, atk: 30, def: 20, spd: 10 },
    traits: ['dark_power', 'terror'],
    evolveLevel: [0, 20, 40, 70],
    description: '全ての面で最強クラスのモンスター。捕獲が非常に難しい。',
    expYield: 40,
    goldYield: 25,
    fragmentChance: 0.10,
    color: '#B71C1C',
  },
};

const TRAITS = {
  regeneration: {
    name: '再生',
    description: '毎ターン最大HPの5%を回復する',
    icon: '♻',
  },
  undead: {
    name: 'アンデッド',
    description: '毒・睡眠状態無効',
    icon: '💀',
  },
  cursed: {
    name: '呪われし者',
    description: '攻撃時10%の確率で敵のATKを-15%にする',
    icon: '🔮',
  },
  scavenger: {
    name: '略奪者',
    description: '戦闘後のゴールド獲得量+30%',
    icon: '💰',
  },
  cunning: {
    name: '狡猾',
    description: '回避率+10%',
    icon: '👁',
  },
  berserk: {
    name: '狂戦士',
    description: 'HP50%以下でATK+30%',
    icon: '⚔',
  },
  tough: {
    name: '頑強',
    description: '最大HP+20%',
    icon: '🛡',
  },
  magic_affinity: {
    name: '魔法親和',
    description: '必殺技ダメージ+25%',
    icon: '✨',
  },
  shadow: {
    name: '影',
    description: 'SPD+15%',
    icon: '🌑',
  },
  fire: {
    name: '炎',
    description: 'ATKが火属性として扱われ、ダメージ+20%',
    icon: '🔥',
  },
  flying: {
    name: '飛行',
    description: '敵の速度依存スキルを無効化',
    icon: '🦅',
  },
  dark_power: {
    name: '暗黒の力',
    description: '全ステータス+10%',
    icon: '🌑',
  },
  terror: {
    name: '恐怖',
    description: '戦闘開始時に敵全体のDEF-10%',
    icon: '👹',
  },
};

// 3 routes x 12 skills each
const SKILL_TREE = {
  atk: [
    { id: 'atk_1',  name: '力の目覚め',    desc: 'ATK+3',                      effect: { atk: 3 },              requires: null      },
    { id: 'atk_2',  name: '攻撃訓練',      desc: 'ATK+5',                      effect: { atk: 5 },              requires: 'atk_1'   },
    { id: 'atk_3',  name: '急所の心得',    desc: 'クリティカル率+5%',          effect: { crit: 0.05 },          requires: 'atk_2'   },
    { id: 'atk_4',  name: '剛力',          desc: 'ATK+8',                      effect: { atk: 8 },              requires: 'atk_3'   },
    { id: 'atk_5',  name: '連撃',          desc: '20%の確率で2回攻撃',         effect: { double_hit: 0.2 },     requires: 'atk_4'   },
    { id: 'atk_6',  name: '覇者の爪',      desc: 'ATK+10',                     effect: { atk: 10 },             requires: 'atk_5'   },
    { id: 'atk_7',  name: '必殺の一撃',    desc: 'クリティカルダメージ+20%',   effect: { crit_dmg: 0.2 },       requires: 'atk_6'   },
    { id: 'atk_8',  name: '魔力注入',      desc: 'ATK+12',                     effect: { atk: 12 },             requires: 'atk_7'   },
    { id: 'atk_9',  name: '狂乱の刃',      desc: 'HP<50%でATK+15%',            effect: { low_hp_atk: 0.15 },   requires: 'atk_8'   },
    { id: 'atk_10', name: '剣聖の境地',    desc: 'ATK+15',                     effect: { atk: 15 },             requires: 'atk_9'   },
    { id: 'atk_11', name: '超越した力',    desc: 'ATK+18',                     effect: { atk: 18 },             requires: 'atk_10'  },
    { id: 'atk_12', name: '無限の力',      desc: '必殺技ダメージ+30%',         effect: { special_dmg: 0.3 },    requires: 'atk_11'  },
  ],
  def: [
    { id: 'def_1',  name: '守りの基本',    desc: 'DEF+3',                      effect: { def: 3 },              requires: null      },
    { id: 'def_2',  name: '盾訓練',        desc: 'DEF+5',                      effect: { def: 5 },              requires: 'def_1'   },
    { id: 'def_3',  name: '生命力強化',    desc: '最大HP+20',                  effect: { maxHp: 20 },           requires: 'def_2'   },
    { id: 'def_4',  name: '鋼の意志',      desc: 'DEF+8',                      effect: { def: 8 },              requires: 'def_3'   },
    { id: 'def_5',  name: 'カウンター',    desc: '被弾時10%で反撃',            effect: { counter: 0.1 },        requires: 'def_4'   },
    { id: 'def_6',  name: '不屈',          desc: 'DEF+10',                     effect: { def: 10 },             requires: 'def_5'   },
    { id: 'def_7',  name: '生命爆発',      desc: '最大HP+40',                  effect: { maxHp: 40 },           requires: 'def_6'   },
    { id: 'def_8',  name: '鉄壁',          desc: 'DEF+12',                     effect: { def: 12 },             requires: 'def_7'   },
    { id: 'def_9',  name: '不壊の鎧',      desc: 'ガード時ダメージ更に-20%',   effect: { guard_bonus: 0.2 },    requires: 'def_8'   },
    { id: 'def_10', name: '守護者',        desc: 'DEF+15',                     effect: { def: 15 },             requires: 'def_9'   },
    { id: 'def_11', name: '絶対防壁',      desc: 'DEF+18',                     effect: { def: 18 },             requires: 'def_10'  },
    { id: 'def_12', name: '不死身',        desc: '致死ダメージを1HPで耐える(1戦1回)', effect: { endure: true }, requires: 'def_11'  },
  ],
  spd: [
    { id: 'spd_1',  name: '俊足の心得',    desc: 'SPD+3',                      effect: { spd: 3 },              requires: null      },
    { id: 'spd_2',  name: '疾走訓練',      desc: 'SPD+5',                      effect: { spd: 5 },              requires: 'spd_1'   },
    { id: 'spd_3',  name: '風の加護',      desc: '回避率+5%',                  effect: { evade: 0.05 },         requires: 'spd_2'   },
    { id: 'spd_4',  name: '加速',          desc: 'SPD+8',                      effect: { spd: 8 },              requires: 'spd_3'   },
    { id: 'spd_5',  name: '先手必勝',      desc: '速度同値時に先攻',           effect: { first_strike: true },  requires: 'spd_4'   },
    { id: 'spd_6',  name: '神速',          desc: 'SPD+10',                     effect: { spd: 10 },             requires: 'spd_5'   },
    { id: 'spd_7',  name: '残像',          desc: '回避率+10%',                 effect: { evade: 0.1 },          requires: 'spd_6'   },
    { id: 'spd_8',  name: '閃光',          desc: 'SPD+12',                     effect: { spd: 12 },             requires: 'spd_7'   },
    { id: 'spd_9',  name: '幻影',          desc: 'バトル1ターン目に必ず回避',  effect: { first_evade: true },   requires: 'spd_8'   },
    { id: 'spd_10', name: '音速',          desc: 'SPD+15',                     effect: { spd: 15 },             requires: 'spd_9'   },
    { id: 'spd_11', name: '光速',          desc: 'SPD+18',                     effect: { spd: 18 },             requires: 'spd_10'  },
    { id: 'spd_12', name: '時間操作',      desc: '1バトルに1回、追加行動を得る', effect: { extra_turn: true },  requires: 'spd_11'  },
  ],
};

const ITEMS = {
  potion:       { name: 'ポーション',    type: 'consumable', desc: 'HPを50回復',               effect: { heal: 50 },          buyPrice: 50,  sellPrice: 25  },
  hi_potion:    { name: 'ハイポーション', type: 'consumable', desc: 'HPを150回復',              effect: { heal: 150 },         buyPrice: 150, sellPrice: 75  },
  elixir:       { name: 'エリクサー',    type: 'consumable', desc: 'HPを全回復',               effect: { heal: 99999 },       buyPrice: 600, sellPrice: 300 },
  ball_normal:  { name: '捕獲ボール',    type: 'ball',       desc: '捕獲率1.0倍',              effect: { catchRate: 1.0 },    buyPrice: 30,  sellPrice: 15  },
  ball_great:   { name: 'グレートボール', type: 'ball',      desc: '捕獲率1.5倍',              effect: { catchRate: 1.5 },    buyPrice: 80,  sellPrice: 40  },
  ball_ultra:   { name: 'ウルトラボール', type: 'ball',      desc: '捕獲率2.0倍',              effect: { catchRate: 2.0 },    buyPrice: 200, sellPrice: 100 },
  iron_sword:   { name: '鉄の剣',        type: 'weapon',     desc: 'ATK+5',                   effect: { atk: 5 },            buyPrice: 200, sellPrice: 100 },
  steel_sword:  { name: '鋼の剣',        type: 'weapon',     desc: 'ATK+12',                  effect: { atk: 12 },           buyPrice: 500, sellPrice: 250 },
  magic_staff:  { name: '魔法の杖',      type: 'weapon',     desc: 'ATK+8、必殺技+15%',       effect: { atk: 8, special_dmg: 0.15 }, buyPrice: 600, sellPrice: 300 },
  leather_armor:{ name: '革の鎧',        type: 'armor',      desc: 'DEF+5',                   effect: { def: 5 },            buyPrice: 200, sellPrice: 100 },
  iron_armor:   { name: '鉄の鎧',        type: 'armor',      desc: 'DEF+12',                  effect: { def: 12 },           buyPrice: 500, sellPrice: 250 },
  magic_robe:   { name: '魔法のローブ',  type: 'armor',      desc: 'DEF+6、SPD+5',            effect: { def: 6, spd: 5 },    buyPrice: 600, sellPrice: 300 },
};

const SHOP_INVENTORY = [
  { id: 'potion',        unlockArea: 0 },
  { id: 'ball_normal',   unlockArea: 0 },
  { id: 'hi_potion',     unlockArea: 1 },
  { id: 'ball_great',    unlockArea: 1 },
  { id: 'iron_sword',    unlockArea: 1 },
  { id: 'leather_armor', unlockArea: 1 },
  { id: 'ball_ultra',    unlockArea: 2 },
  { id: 'steel_sword',   unlockArea: 2 },
  { id: 'iron_armor',    unlockArea: 2 },
  { id: 'magic_staff',   unlockArea: 3 },
  { id: 'magic_robe',    unlockArea: 3 },
  { id: 'elixir',        unlockArea: 4 },
];

const AREAS = [
  {
    id: 0,
    name: '森の入り口',
    description: '初心者向けのエリア。スライムとゴブリンが生息する穏やかな森。',
    minLevel: 1, maxLevel: 2,
    enemies: [{ type: 'slime', weight: 50 }, { type: 'goblin', weight: 50 }],
    enemyCount: [1, 2],
    bgColor: '#1a3a0a',
    unlockCondition: null,
    bossType: null,
  },
  {
    id: 1,
    name: '暗い沼地',
    description: 'ゾンビとオークが徘徊する危険な沼地。',
    minLevel: 6, maxLevel: 12,
    enemies: [{ type: 'zombie', weight: 40 }, { type: 'goblin', weight: 30 }, { type: 'orc', weight: 30 }],
    enemyCount: [1, 2],
    bgColor: '#1a2a0a',
    unlockCondition: { wins: 5 },
    bossType: 'orc',
  },
  {
    id: 2,
    name: '霧の山脈',
    description: 'オークとダークエルフが支配する険しい山岳地帯。',
    minLevel: 13, maxLevel: 22,
    enemies: [{ type: 'orc', weight: 35 }, { type: 'darkelf', weight: 45 }, { type: 'zombie', weight: 20 }],
    enemyCount: [1, 3],
    bgColor: '#0a0a2a',
    unlockCondition: { wins: 15 },
    bossType: 'darkelf',
  },
  {
    id: 3,
    name: '暗黒城',
    description: 'デーモンとダークエルフが守る魔の城。強敵が多数待ち受ける。',
    minLevel: 23, maxLevel: 35,
    enemies: [{ type: 'darkelf', weight: 30 }, { type: 'demon', weight: 40 }, { type: 'dragon', weight: 30 }],
    enemyCount: [2, 3],
    bgColor: '#0a0a1a',
    unlockCondition: { wins: 30 },
    bossType: 'demon',
  },
  {
    id: 4,
    name: 'ドラゴンの巣',
    description: '最強のドラゴンとデーモンが棲む場所。ここを制した者が真の強者。',
    minLevel: 36, maxLevel: 55,
    enemies: [{ type: 'dragon', weight: 50 }, { type: 'demon', weight: 50 }],
    enemyCount: [2, 3],
    bgColor: '#1a0000',
    unlockCondition: { wins: 50 },
    bossType: 'dragon',
  },
];

const ACHIEVEMENTS = [
  { id: 'first_win',      name: '初勝利',         desc: '初めてバトルに勝利する',               reward: 50  },
  { id: 'first_capture',  name: '捕獲成功',        desc: '初めてモンスターを捕獲する',            reward: 100 },
  { id: 'party_full',     name: 'パーティ完成',    desc: 'パーティを3体揃える',                   reward: 100 },
  { id: 'box_25',         name: 'コレクター',      desc: 'ボックスを25体で埋める',                reward: 200 },
  { id: 'box_50',         name: 'マスターコレクター', desc: 'ボックスを50体で埋める',             reward: 500 },
  { id: 'win_10',         name: '10戦士',          desc: 'バトルに10回勝利する',                  reward: 100 },
  { id: 'win_50',         name: '50戦士',          desc: 'バトルに50回勝利する',                  reward: 300 },
  { id: 'win_100',        name: '百戦錬磨',        desc: 'バトルに100回勝利する',                 reward: 800 },
  { id: 'capture_10',     name: '捕獲者',          desc: 'モンスターを10体捕獲する',              reward: 150 },
  { id: 'capture_30',     name: '大捕獲者',        desc: 'モンスターを30体捕獲する',              reward: 400 },
  { id: 'first_evolve',   name: '進化！',          desc: 'モンスターを進化させる',                reward: 150 },
  { id: 'max_evolve',     name: '最終進化',        desc: 'モンスターを最終進化させる（段階4）',    reward: 500 },
  { id: 'first_breed',    name: '遺伝子操作',      desc: '初めて繁殖させる',                      reward: 200 },
  { id: 'breed_10',       name: '血統管理者',      desc: '10回繁殖させる',                        reward: 500 },
  { id: 'all_areas',      name: '探検家',          desc: '全5エリアを解放する',                   reward: 600 },
  { id: 'all_monsters',   name: '図鑑完成',        desc: '全7種のモンスターを入手する',           reward: 1000 },
  { id: 'first_synthesis',name: '合成師',          desc: '初めて合成を行う',                      reward: 150 },
  { id: 'skill_master',   name: 'スキルマスター',  desc: '1体に12個以上のスキルを習得させる',     reward: 400 },
  { id: 'rich',           name: '大富豪',          desc: '所持金を10000ゴールド以上にする',       reward: 0   },
  { id: 'defeat_demon',   name: '魔王討伐',        desc: 'デーモンを倒す',                        reward: 800 },
  { id: 'ng_plus',        name: '強くてニューゲーム', desc: 'NG+を解放する',                     reward: 0   },
  { id: 'generation_3',   name: '3世代目',         desc: '3世代目のモンスターを育てる',           reward: 300 },
  { id: 'no_damage_win',  name: '完璧な勝利',      desc: 'HP満タンのまま勝利する',                reward: 200 },
  { id: 'level_30',       name: 'ベテラン',        desc: 'モンスターをLv30にする',                reward: 300 },
  { id: 'level_50',       name: '覇者',            desc: 'モンスターをLv50にする',                reward: 1000 },
];

const DAILY_QUEST_POOL = [
  { id: 'win_3',     name: '3連勝',        desc: 'バトルに3回勝利する',         goal: 3,  type: 'win',     reward: 100 },
  { id: 'capture_1', name: 'ハンター',     desc: 'モンスターを1体捕獲する',     goal: 1,  type: 'capture', reward: 150 },
  { id: 'capture_3', name: '大ハンター',   desc: 'モンスターを3体捕獲する',     goal: 3,  type: 'capture', reward: 350 },
  { id: 'use_item',  name: 'アイテム活用', desc: 'バトルでアイテムを3回使う',   goal: 3,  type: 'item_use',reward: 80  },
  { id: 'earn_gold', name: '金稼ぎ',       desc: '500ゴールド以上稼ぐ',         goal: 500,type: 'gold',    reward: 150 },
  { id: 'win_5',     name: '5連勝',        desc: 'バトルに5回勝利する',         goal: 5,  type: 'win',     reward: 200 },
  { id: 'area3_win', name: '山岳の挑戦',   desc: '霧の山脈で1回勝利する',       goal: 1,  type: 'area_win',reward: 250, areaId: 2 },
  { id: 'breed_1',   name: '育種家',       desc: 'モンスターを1回繁殖させる',   goal: 1,  type: 'breed',   reward: 180 },
  { id: 'synth_1',   name: '錬金術師',     desc: '合成を1回行う',               goal: 1,  type: 'synth',   reward: 150 },
  { id: 'no_dmg',    name: '無傷の勝利',   desc: '誰もHPを失わずに勝利する',    goal: 1,  type: 'no_dmg',  reward: 200 },
];

// Exp needed to reach next level
function expToLevel(level) {
  return Math.floor(50 * Math.pow(1.3, level - 1));
}

// Calculate monster effective stats considering level, stage, traits, skills, equipment
function calcEffectiveStats(monster) {
  const md = MONSTER_TYPES[monster.type];
  const stageMultipliers = [1.0, 1.5, 2.2, 3.0];
  const sm = stageMultipliers[monster.stage] || 1.0;
  const lv = monster.level;

  // Base formula: baseStats * stageMultiplier * (1 + level * 0.08)
  let baseHp  = Math.floor(md.baseStats.hp  * sm * (1 + lv * 0.08));
  let baseAtk = Math.floor(md.baseStats.atk * sm * (1 + lv * 0.08));
  let baseDef = Math.floor(md.baseStats.def * sm * (1 + lv * 0.08));
  let baseSpd = Math.floor(md.baseStats.spd * sm * (1 + lv * 0.08));

  // Skill bonuses (additive flat)
  let skillBonusHp = 0, skillBonusAtk = 0, skillBonusDef = 0, skillBonusSpd = 0;
  let evadeBonus = 0, critBonus = 0.05, critDmgBonus = 1.0;
  let doubleHit = 0, counter = 0, lowHpAtk = 0, specialDmg = 1.0, guardBonus = 0;
  let endure = false, extraTurn = false, firstStrike = false, firstEvade = false;

  const learnedSkills = [
    ...(monster.skills?.atk || []),
    ...(monster.skills?.def || []),
    ...(monster.skills?.spd || []),
  ];
  const allSkills = [...SKILL_TREE.atk, ...SKILL_TREE.def, ...SKILL_TREE.spd];

  for (const sid of learnedSkills) {
    const skill = allSkills.find(s => s.id === sid);
    if (!skill) continue;
    const e = skill.effect;
    if (e.atk)          skillBonusAtk += e.atk;
    if (e.def)          skillBonusDef += e.def;
    if (e.spd)          skillBonusSpd += e.spd;
    if (e.maxHp)        skillBonusHp  += e.maxHp;
    if (e.crit)         critBonus     += e.crit;
    if (e.crit_dmg)     critDmgBonus  += e.crit_dmg;
    if (e.evade)        evadeBonus    += e.evade;
    if (e.double_hit)   doubleHit     += e.double_hit;
    if (e.counter)      counter       += e.counter;
    if (e.low_hp_atk)   lowHpAtk      += e.low_hp_atk;
    if (e.special_dmg)  specialDmg    += e.special_dmg;
    if (e.guard_bonus)  guardBonus    += e.guard_bonus;
    if (e.endure)       endure        = true;
    if (e.extra_turn)   extraTurn     = true;
    if (e.first_strike) firstStrike   = true;
    if (e.first_evade)  firstEvade    = true;
  }

  // Equipment bonuses
  const eq = monster.equipment || {};
  if (eq.weapon && ITEMS[eq.weapon]) {
    const ef = ITEMS[eq.weapon].effect;
    if (ef.atk)         skillBonusAtk += ef.atk;
    if (ef.special_dmg) specialDmg    += ef.special_dmg;
  }
  if (eq.armor && ITEMS[eq.armor]) {
    const ef = ITEMS[eq.armor].effect;
    if (ef.def) skillBonusDef += ef.def;
    if (ef.spd) skillBonusSpd += ef.spd;
  }

  // Trait bonuses
  const allTraits = [...(monster.traits || []), ...(monster.synthTraits || [])].filter(Boolean);
  let traitHpMult = 1, traitAtkMult = 1, traitSpdMult = 1;
  let goldBonus = 0;

  for (const trait of allTraits) {
    if (trait === 'tough')         traitHpMult  += 0.20;
    if (trait === 'dark_power')  { traitAtkMult += 0.10; traitHpMult += 0.10; traitSpdMult += 0.10; }
    if (trait === 'shadow')        traitSpdMult += 0.15;
    if (trait === 'magic_affinity') specialDmg  += 0.25;
    if (trait === 'fire')           traitAtkMult += 0.20;
    if (trait === 'scavenger')      goldBonus    += 0.30;
    if (trait === 'cunning')        evadeBonus   += 0.10;
    if (trait === 'berserk')        lowHpAtk     += 0.30;
  }

  const maxHp  = Math.floor(baseHp  * traitHpMult)  + skillBonusHp;
  const atk    = Math.floor(baseAtk * traitAtkMult)  + skillBonusAtk;
  const def    = baseDef + skillBonusDef;
  const spd    = Math.floor(baseSpd * traitSpdMult)  + skillBonusSpd;

  return {
    maxHp, atk, def, spd,
    evade: evadeBonus,
    crit: critBonus,
    critDmg: critDmgBonus,
    doubleHit,
    counter,
    lowHpAtk,
    specialDmg,
    guardBonus,
    goldBonus,
    endure,
    extraTurn,
    firstStrike,
    firstEvade,
    allTraits,
  };
}

return {
  MONSTER_TYPES,
  TRAITS,
  SKILL_TREE,
  ITEMS,
  SHOP_INVENTORY,
  AREAS,
  ACHIEVEMENTS,
  DAILY_QUEST_POOL,
  expToLevel,
  calcEffectiveStats,
};

})();
