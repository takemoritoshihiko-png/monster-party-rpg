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
  ancient_god: {
    name: '古代神',
    stages: ['古代神の欠片', '古代神の化身', '古代神', '創世神'],
    baseStats: { hp: 180, atk: 28, def: 25, spd: 9 },
    traits: ['divine_regen', 'divine_guard'],
    evolveLevel: [0, 20, 40, 70],
    description: '太古より存在する神。強大な回復力と防御力を持つ。',
    expYield: 50,
    goldYield: 30,
    fragmentChance: 0.08,
    color: '#FFD700',
    captureRateCap: 0.05,
  },
  dragon_god: {
    name: '龍神',
    stages: ['龍神の幼体', '龍神の顕現', '龍神', '天元龍神'],
    baseStats: { hp: 240, atk: 42, def: 26, spd: 14 },
    traits: ['omni_damage', 'quick_special'],
    evolveLevel: [0, 20, 40, 70],
    description: '全てを超越した最強の龍。倒した者にNG+の道が開かれる。',
    expYield: 60,
    goldYield: 35,
    fragmentChance: 0.06,
    color: '#1565C0',
    captureRateCap: 0.05,
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
  divine_regen: {
    name: '神の再生',
    description: '毎ターンHPの5%を回復する',
    icon: '🌟',
  },
  divine_guard: {
    name: '神の守護',
    description: '被ダメージを20%軽減する',
    icon: '🛡',
  },
  omni_damage: {
    name: '全属性の力',
    description: '全ての攻撃ダメージ+15%',
    icon: '⚡',
  },
  quick_special: {
    name: '迅速必殺',
    description: '必殺技のクールダウン-1ターン',
    icon: '💨',
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
  // ① 冒険者セット
  advent_sword:  { name: '冒険者の剣',   type: 'weapon', desc: 'ATK+5',                  effect: { atk: 5 },                     buyPrice: 200,  sellPrice: 100,  set: 'adventurer' },
  advent_armor:  { name: '冒険者の鎧',   type: 'armor',  desc: 'DEF+5',                  effect: { def: 5 },                     buyPrice: 200,  sellPrice: 100,  set: 'adventurer' },
  // ② 戦士セット
  warrior_sword: { name: '戦士の剣',     type: 'weapon', desc: 'ATK+12',                 effect: { atk: 12 },                    buyPrice: 500,  sellPrice: 250,  set: 'warrior' },
  warrior_armor: { name: '戦士の鎧',     type: 'armor',  desc: 'DEF+12',                 effect: { def: 12 },                    buyPrice: 500,  sellPrice: 250,  set: 'warrior' },
  // ③ 魔法使いセット
  magic_staff:   { name: '魔法の杖',     type: 'weapon', desc: 'ATK+14、必殺技+15%',     effect: { atk: 14, special_dmg: 0.15 }, buyPrice: 1000, sellPrice: 500,  set: 'mage' },
  magic_robe:    { name: '魔法のローブ',  type: 'armor',  desc: 'DEF+8、SPD+8',           effect: { def: 8, spd: 8 },             buyPrice: 1000, sellPrice: 500,  set: 'mage' },
  // ④ 騎士セット
  knight_sword:  { name: '騎士の剣',     type: 'weapon', desc: 'ATK+20、SPD+5',          effect: { atk: 20, spd: 5 },            buyPrice: 2000, sellPrice: 1000, set: 'knight' },
  knight_armor:  { name: '騎士の鎧',     type: 'armor',  desc: 'DEF+20、HP+30',          effect: { def: 20, maxHp: 30 },         buyPrice: 2000, sellPrice: 1000, set: 'knight' },
  // ⑤ 勇者セット
  hero_sword:    { name: '勇者の剣',     type: 'weapon', desc: 'ATK+28、SPD+8',          effect: { atk: 28, spd: 8 },            buyPrice: 3000, sellPrice: 1500, set: 'hero' },
  hero_armor:    { name: '勇者の鎧',     type: 'armor',  desc: 'DEF+28、HP+50',          effect: { def: 28, maxHp: 50 },         buyPrice: 3000, sellPrice: 1500, set: 'hero' },
  // ⑥ 英雄セット
  legend_sword:  { name: '英雄の剣',     type: 'weapon', desc: 'ATK+35、SPD+15',         effect: { atk: 35, spd: 15 },           buyPrice: 5000, sellPrice: 2500, set: 'legend' },
  legend_armor:  { name: '英雄の鎧',     type: 'armor',  desc: 'DEF+35、HP+80',          effect: { def: 35, maxHp: 80 },         buyPrice: 5000, sellPrice: 2500, set: 'legend' },
  // ⑦ 古代神セット（ドロップ限定）
  ancgod_sword:  { name: '古代神の剣',   type: 'weapon', desc: 'ATK+45、必殺技+25%',     effect: { atk: 45, special_dmg: 0.25 }, buyPrice: 0,    sellPrice: 5000, set: 'ancient_god' },
  ancgod_armor:  { name: '古代神の鎧',   type: 'armor',  desc: 'DEF+45、HP+100',         effect: { def: 45, maxHp: 100 },        buyPrice: 0,    sellPrice: 5000, set: 'ancient_god' },
  // ⑧ 龍神セット（ドロップ限定）
  drggod_sword:  { name: '龍神の剣',     type: 'weapon', desc: 'ATK+45、SPD+15',         effect: { atk: 45, spd: 15 },           buyPrice: 0,    sellPrice: 8000, set: 'dragon_god' },
  drggod_armor:  { name: '龍神の鎧',     type: 'armor',  desc: 'DEF+45、HP+100',         effect: { def: 45, maxHp: 100 },        buyPrice: 0,    sellPrice: 8000, set: 'dragon_god' },
};

const SET_BONUSES = {
  adventurer: {
    name: '冒険者セット',
    pieces: ['advent_sword', 'advent_armor'],
    bonus: { maxHp: 20 },
    desc: 'セット効果: HP+20',
  },
  warrior: {
    name: '戦士セット',
    pieces: ['warrior_sword', 'warrior_armor'],
    bonus: { atk: 5 },
    desc: 'セット効果: ATK+5',
  },
  mage: {
    name: '魔法使いセット',
    pieces: ['magic_staff', 'magic_robe'],
    bonus: { quickSpecial: true },
    desc: 'セット効果: 必殺技クールダウン-1',
  },
  knight: {
    name: '騎士セット',
    pieces: ['knight_sword', 'knight_armor'],
    bonus: { damageReduction: 0.10 },
    desc: 'セット効果: 被ダメージ10%軽減',
  },
  hero: {
    name: '勇者セット',
    pieces: ['hero_sword', 'hero_armor'],
    bonus: { maxHp: 80 },
    desc: 'セット効果: HP+80',
  },
  legend: {
    name: '英雄セット',
    pieces: ['legend_sword', 'legend_armor'],
    bonus: { catchRateBonus: 0.15, allStatMult: 0.10 },
    desc: 'セット効果: 捕獲率+15%・全ステ+10%',
  },
  ancient_god: {
    name: '古代神セット',
    pieces: ['ancgod_sword', 'ancgod_armor'],
    bonus: { setRegen: 0.03 },
    desc: 'セット効果: 毎ターンHP3%回復',
  },
  dragon_god: {
    name: '龍神セット',
    pieces: ['drggod_sword', 'drggod_armor'],
    bonus: { allStatMult: 0.20 },
    desc: 'セット効果: 全ステータス+20%',
  },
};

const SHOP_INVENTORY = [
  { id: 'potion',        unlockArea: 0 },
  { id: 'ball_normal',   unlockArea: 0 },
  { id: 'advent_sword',  unlockArea: 0, category: 'セット装備' },
  { id: 'advent_armor',  unlockArea: 0, category: 'セット装備' },
  { id: 'hi_potion',     unlockArea: 1 },
  { id: 'ball_great',    unlockArea: 1 },
  { id: 'warrior_sword', unlockArea: 2, category: 'セット装備' },
  { id: 'warrior_armor', unlockArea: 2, category: 'セット装備' },
  { id: 'ball_ultra',    unlockArea: 2 },
  { id: 'magic_staff',   unlockArea: 3, category: 'セット装備' },
  { id: 'magic_robe',    unlockArea: 3, category: 'セット装備' },
  { id: 'knight_sword',  unlockArea: 5, category: 'セット装備' },
  { id: 'knight_armor',  unlockArea: 5, category: 'セット装備' },
  { id: 'hero_sword',    unlockArea: 6, category: 'セット装備' },
  { id: 'hero_armor',    unlockArea: 6, category: 'セット装備' },
  { id: 'elixir',        unlockArea: 7 },
  { id: 'legend_sword',  unlockArea: 8, category: 'セット装備' },
  { id: 'legend_armor',  unlockArea: 8, category: 'セット装備' },
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
    enemies: [{ type: 'zombie', weight: 40 }, { type: 'goblin', weight: 30 }, { type: 'slime', weight: 20 }, { type: 'orc', weight: 10 }],
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
    enemies: [{ type: 'orc', weight: 40 }, { type: 'zombie', weight: 30 }, { type: 'goblin', weight: 20 }, { type: 'darkelf', weight: 10 }],
    enemyCount: [1, 3],
    bgColor: '#0a0a2a',
    unlockCondition: { wins: 15 },
    bossType: 'darkelf',
  },
  {
    id: 3,
    name: '氷の洞窟',
    description: '凍てつく地下洞窟。氷に強いモンスターが潜む。',
    minLevel: 20, maxLevel: 26,
    enemies: [{ type: 'zombie', weight: 40 }, { type: 'orc', weight: 30 }, { type: 'darkelf', weight: 20 }, { type: 'slime', weight: 10 }],
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
    enemies: [{ type: 'darkelf', weight: 40 }, { type: 'goblin', weight: 30 }, { type: 'orc', weight: 20 }, { type: 'zombie', weight: 10 }],
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
    enemies: [{ type: 'dragon', weight: 40 }, { type: 'darkelf', weight: 30 }, { type: 'orc', weight: 20 }, { type: 'goblin', weight: 10 }],
    enemyCount: [2, 3],
    bgColor: '#1a2a4a',
    unlockCondition: { wins: 45 },
    bossType: 'dragon',
  },
  {
    id: 6,
    name: '暗黒城',
    description: 'ダークエルフとドラゴンが守る魔の城。強敵が多数待ち受ける。',
    minLevel: 31, maxLevel: 35,
    enemies: [{ type: 'demon', weight: 40 }, { type: 'dragon', weight: 30 }, { type: 'darkelf', weight: 20 }, { type: 'orc', weight: 10 }],
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
    enemies: [{ type: 'dragon', weight: 40 }, { type: 'demon', weight: 30 }, { type: 'ancient_god', weight: 20 }, { type: 'darkelf', weight: 10 }],
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
    enemies: [{ type: 'ancient_god', weight: 40 }, { type: 'demon', weight: 30 }, { type: 'dragon', weight: 20 }, { type: 'darkelf', weight: 10 }],
    enemyCount: [2, 3],
    bgColor: '#3a2a0a',
    unlockCondition: { wins: 85 },
    bossType: 'ancient_god',
  },
  {
    id: 9,
    name: '世界の果て',
    description: '全ての終わりと始まりの地。最強のモンスターが待ち受ける。',
    minLevel: 46, maxLevel: 55,
    enemies: [{ type: 'dragon_god', weight: 40 }, { type: 'ancient_god', weight: 30 }, { type: 'demon', weight: 20 }, { type: 'dragon', weight: 10 }],
    enemyCount: [3, 3],
    bgColor: '#0a0a0a',
    unlockCondition: { wins: 100 },
    bossType: 'dragon_god',
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
  { id: 'all_monsters',   name: '図鑑完成',        desc: '全9種のモンスターを入手する',           reward: 1000 },
  { id: 'first_synthesis',name: '合成師',          desc: '初めて合成を行う',                      reward: 150 },
  { id: 'skill_master',   name: 'スキルマスター',  desc: '1体に12個以上のスキルを習得させる',     reward: 400 },
  { id: 'rich',           name: '大富豪',          desc: '所持金を10000ゴールド以上にする',       reward: 0   },
  { id: 'defeat_demon',   name: '魔王討伐',        desc: 'デーモンを倒す',                        reward: 800 },
  { id: 'defeat_dragon_god', name: '龍神討伐',     desc: '龍神を倒す',                            reward: 1500 },
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

// Stat breakdown for display (base / rarity bonus / breed bonus)
function calcStatBreakdown(monster) {
  const md = MONSTER_TYPES[monster.type];
  const stageMultipliers = [1.0, 1.5, 2.2, 3.0];
  const sm = stageMultipliers[monster.stage] || 1.0;
  const lv = monster.level;
  const rarityMult = getRarityInfo(monster.rarity || 1).statMult;

  const pureHp  = Math.floor(md.baseStats.hp  * sm * (1 + lv * 0.08));
  const pureAtk = Math.floor(md.baseStats.atk * sm * (1 + lv * 0.08));
  const pureDef = Math.floor(md.baseStats.def * sm * (1 + lv * 0.08));
  const pureSpd = Math.floor(md.baseStats.spd * sm * (1 + lv * 0.08));

  const withRarityHp  = Math.floor(md.baseStats.hp  * sm * (1 + lv * 0.08) * rarityMult);
  const withRarityAtk = Math.floor(md.baseStats.atk * sm * (1 + lv * 0.08) * rarityMult);
  const withRarityDef = Math.floor(md.baseStats.def * sm * (1 + lv * 0.08) * rarityMult);
  const withRaritySpd = Math.floor(md.baseStats.spd * sm * (1 + lv * 0.08) * rarityMult);

  const b = monster.statBonus || { hp: 0, atk: 0, def: 0, spd: 0 };

  return {
    base:   { hp: pureHp,                    atk: pureAtk,                    def: pureDef,                    spd: pureSpd },
    rarity: { hp: withRarityHp - pureHp,     atk: withRarityAtk - pureAtk,    def: withRarityDef - pureDef,    spd: withRaritySpd - pureSpd },
    breed:  { hp: b.hp,                      atk: b.atk,                      def: b.def,                      spd: b.spd },
  };
}

// Exp needed to reach next level
function expToLevel(level) {
  return Math.floor(19.25 * Math.pow(1.25, level - 1));
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
  let damageReduction = 0;
  let setQuickSpecial = false;
  let allStatMult = 0;
  let setRegen = 0;
  for (const setId in SET_BONUSES) {
    const setDef = SET_BONUSES[setId];
    const hasAll = setDef.pieces.every(p => eq.weapon === p || eq.armor === p);
    if (hasAll) {
      if (setDef.bonus.maxHp)           skillBonusHp    += setDef.bonus.maxHp;
      if (setDef.bonus.atk)             skillBonusAtk   += setDef.bonus.atk;
      if (setDef.bonus.catchRateBonus)  catchRateBonus  += setDef.bonus.catchRateBonus;
      if (setDef.bonus.damageReduction) damageReduction += setDef.bonus.damageReduction;
      if (setDef.bonus.quickSpecial)    setQuickSpecial  = true;
      if (setDef.bonus.allStatMult)     allStatMult     += setDef.bonus.allStatMult;
      if (setDef.bonus.setRegen)        setRegen        += setDef.bonus.setRegen;
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
    if (trait === 'omni_damage')    traitAtkMult += 0.15 * mult;
  }

  let maxHp  = Math.floor(baseHp  * traitHpMult)  + skillBonusHp;
  let atk    = Math.floor(baseAtk * traitAtkMult)  + skillBonusAtk;
  let def    = baseDef + skillBonusDef;
  let spd    = Math.floor(baseSpd * traitSpdMult)  + skillBonusSpd;

  // allStatMult from set bonuses (applied after all other calculations)
  if (allStatMult > 0) {
    maxHp = Math.floor(maxHp * (1 + allStatMult));
    atk   = Math.floor(atk   * (1 + allStatMult));
    def   = Math.floor(def   * (1 + allStatMult));
    spd   = Math.floor(spd   * (1 + allStatMult));
  }

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
    damageReduction,
    setQuickSpecial,
    setRegen,
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
  calcStatBreakdown,
  rollRarity,
  getRarityInfo,
};

})();
