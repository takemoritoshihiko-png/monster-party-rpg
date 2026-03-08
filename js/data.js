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
    description: '2ターンに1回、最大HPの5%を回復する',
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
  hero_sword:   { name: '勇者の剣',    type: 'weapon',     desc: 'ATK+20',                  effect: { atk: 20 },           buyPrice: 2000, sellPrice: 1000, set: 'hero' },
  hero_armor:   { name: '勇者の鎧',    type: 'armor',      desc: 'DEF+20',                  effect: { def: 20 },           buyPrice: 2200, sellPrice: 1100, set: 'hero' },
  legend_sword: { name: '英雄の剣',    type: 'weapon',     desc: 'ATK+15、SPD+10',          effect: { atk: 15, spd: 10 },  buyPrice: 3200, sellPrice: 1600, set: 'legend' },
  legend_armor: { name: '英雄の鎧',    type: 'armor',      desc: 'DEF+15、HP+30',           effect: { def: 15, maxHp: 30 },buyPrice: 3500, sellPrice: 1750, set: 'legend' },
};

const SET_BONUSES = {
  hero: {
    name: '戦士セット',
    pieces: ['hero_sword', 'hero_armor'],
    bonus: { maxHp: 50 },
    desc: 'セット効果: HP+50',
  },
  legend: {
    name: '英雄セット',
    pieces: ['legend_sword', 'legend_armor'],
    bonus: { catchRateBonus: 0.10 },
    desc: 'セット効果: 捕獲成功率+10%',
  },
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
  { id: 'magic_staff',   unlockArea: 6 },
  { id: 'magic_robe',    unlockArea: 6 },
  { id: 'elixir',        unlockArea: 7 },
  { id: 'hero_sword',    unlockArea: 7, category: 'セット装備' },
  { id: 'hero_armor',    unlockArea: 7, category: 'セット装備' },
  { id: 'legend_sword',  unlockArea: 7, category: 'セット装備' },
  { id: 'legend_armor',  unlockArea: 7, category: 'セット装備' },
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
    name: '氷の洞窟',
    description: '凍てつく地下洞窟。氷に強いモンスターが潜む。',
    minLevel: 16, maxLevel: 20,
    enemies: [{ type: 'slime', weight: 30 }, { type: 'zombie', weight: 35 }, { type: 'orc', weight: 35 }],
    enemyCount: [1, 3],
    bgColor: '#0a2a3a',
    unlockCondition: { wins: 25 },
    bossType: 'zombie',
  },
  {
    id: 4,
    name: '海底・深海',
    description: '光の届かない深海。素早い敵が多く出現する。',
    minLevel: 21, maxLevel: 25,
    enemies: [{ type: 'slime', weight: 25 }, { type: 'goblin', weight: 40 }, { type: 'darkelf', weight: 35 }],
    enemyCount: [2, 3],
    bgColor: '#0a1a3a',
    unlockCondition: { wins: 35 },
    bossType: 'goblin',
  },
  {
    id: 5,
    name: '空中城',
    description: '雲の上に浮かぶ古代の城。飛行するモンスターが多い。',
    minLevel: 26, maxLevel: 30,
    enemies: [{ type: 'darkelf', weight: 45 }, { type: 'dragon', weight: 55 }],
    enemyCount: [2, 3],
    bgColor: '#1a2a4a',
    unlockCondition: { wins: 45 },
    bossType: 'dragon',
  },
  {
    id: 6,
    name: '暗黒城',
    description: 'デーモンとダークエルフが守る魔の城。強敵が多数待ち受ける。',
    minLevel: 31, maxLevel: 35,
    enemies: [{ type: 'darkelf', weight: 30 }, { type: 'demon', weight: 40 }, { type: 'dragon', weight: 30 }],
    enemyCount: [2, 3],
    bgColor: '#0a0a1a',
    unlockCondition: { wins: 55 },
    bossType: 'demon',
  },
  {
    id: 7,
    name: 'ドラゴンの巣',
    description: '最強のドラゴンとデーモンが棲む場所。ここを制した者が真の強者。',
    minLevel: 36, maxLevel: 40,
    enemies: [{ type: 'dragon', weight: 50 }, { type: 'demon', weight: 50 }],
    enemyCount: [2, 3],
    bgColor: '#1a0000',
    unlockCondition: { wins: 70 },
    bossType: 'dragon',
  },
  {
    id: 8,
    name: '神々の試練場',
    description: '神に選ばれし者だけが挑める究極の試練場。',
    minLevel: 41, maxLevel: 45,
    enemies: [{ type: 'dragon', weight: 50 }, { type: 'demon', weight: 50 }],
    enemyCount: [2, 3],
    bgColor: '#3a2a0a',
    unlockCondition: { wins: 85 },
    bossType: 'demon',
  },
  {
    id: 9,
    name: '世界の果て',
    description: '全ての終わりと始まりの地。最強のモンスターが待ち受ける。',
    minLevel: 46, maxLevel: 55,
    enemies: [{ type: 'demon', weight: 45 }, { type: 'dragon', weight: 55 }],
    enemyCount: [3, 3],
    bgColor: '#0a0a0a',
    unlockCondition: { wins: 100 },
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
  { id: 'all_areas',      name: '探検家',          desc: '全10エリアを解放する',                  reward: 600 },
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

// Rarity system
const RARITY_TABLE = [
  { star: 1, weight: 49, statMult: 1.0,  color: '#B0BEC5', label: '★' },
  { star: 2, weight: 30, statMult: 1.15, color: '#4CAF50', label: '★★' },
  { star: 3, weight: 15, statMult: 1.35, color: '#42A5F5', label: '★★★' },
  { star: 4, weight: 5,  statMult: 1.65, color: '#AB47BC', label: '★★★★' },
  { star: 5, weight: 1,  statMult: 2.0,  color: '#FFD54F', label: '★★★★★' },
];

function rollRarity() {
  const total = RARITY_TABLE.reduce((s, r) => s + r.weight, 0);
  let rand = Math.random() * total;
  for (const r of RARITY_TABLE) {
    rand -= r.weight;
    if (rand <= 0) return r.star;
  }
  return 1;
}

function getRarityInfo(star) {
  return RARITY_TABLE[(star || 1) - 1];
}

// Exp needed to reach next level
function expToLevel(level) {
  return Math.floor(38.5 * Math.pow(1.3, level - 1));
}

// Calculate monster effective stats considering level, stage, traits, skills, equipment
function calcEffectiveStats(monster) {
  const md = MONSTER_TYPES[monster.type];
  const stageMultipliers = [1.0, 1.5, 2.2, 3.0];
  const sm = stageMultipliers[monster.stage] || 1.0;
  const lv = monster.level;

  // Rarity multiplier
  const rarityMult = getRarityInfo(monster.rarity || 1).statMult;

  // Base formula: baseStats * stageMultiplier * (1 + level * 0.08) * rarityMult
  let baseHp  = Math.floor(md.baseStats.hp  * sm * (1 + lv * 0.08) * rarityMult);
  let baseAtk = Math.floor(md.baseStats.atk * sm * (1 + lv * 0.08) * rarityMult);
  let baseDef = Math.floor(md.baseStats.def * sm * (1 + lv * 0.08) * rarityMult);
  let baseSpd = Math.floor(md.baseStats.spd * sm * (1 + lv * 0.08) * rarityMult);

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
    if (ef.spd)         skillBonusSpd += ef.spd;
    if (ef.special_dmg) specialDmg    += ef.special_dmg;
  }
  if (eq.armor && ITEMS[eq.armor]) {
    const ef = ITEMS[eq.armor].effect;
    if (ef.def)   skillBonusDef += ef.def;
    if (ef.spd)   skillBonusSpd += ef.spd;
    if (ef.maxHp) skillBonusHp  += ef.maxHp;
  }

  // Set bonuses
  let catchRateBonus = 0;
  for (const setId in SET_BONUSES) {
    const setDef = SET_BONUSES[setId];
    const hasAll = setDef.pieces.every(p => eq.weapon === p || eq.armor === p);
    if (hasAll) {
      if (setDef.bonus.maxHp)          skillBonusHp   += setDef.bonus.maxHp;
      if (setDef.bonus.catchRateBonus) catchRateBonus += setDef.bonus.catchRateBonus;
    }
  }

  // Trait bonuses (with trait level enhancement)
  const allTraits = [...(monster.traits || []), ...(monster.synthTraits || [])].filter(Boolean);
  const tLv = monster.traitLevels || {};
  let traitHpMult = 1, traitAtkMult = 1, traitSpdMult = 1;
  let goldBonus = 0;
  const TLVB = 0.10; // bonus per trait level

  for (const trait of allTraits) {
    const lv = tLv[trait] || 0;
    const mult = 1 + lv * TLVB; // e.g. lv2 = 1.2x the base effect
    if (trait === 'tough')         traitHpMult  += 0.20 * mult;
    if (trait === 'dark_power')  { traitAtkMult += 0.10 * mult; traitHpMult += 0.10 * mult; traitSpdMult += 0.10 * mult; }
    if (trait === 'shadow')        traitSpdMult += 0.15 * mult;
    if (trait === 'magic_affinity') specialDmg  += 0.25 * mult;
    if (trait === 'fire')           traitAtkMult += 0.20 * mult;
    if (trait === 'scavenger')      goldBonus    += 0.30 * mult;
    if (trait === 'cunning')        evadeBonus   += 0.10 * mult;
    if (trait === 'berserk')        lowHpAtk     += 0.30 * mult;
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
    catchRateBonus,
    allTraits,
  };
}

return {
  MONSTER_TYPES,
  TRAITS,
  SKILL_TREE,
  ITEMS,
  SHOP_INVENTORY,
  SET_BONUSES,
  AREAS,
  ACHIEVEMENTS,
  DAILY_QUEST_POOL,
  RARITY_TABLE,
  expToLevel,
  calcEffectiveStats,
  rollRarity,
  getRarityInfo,
};

})();
