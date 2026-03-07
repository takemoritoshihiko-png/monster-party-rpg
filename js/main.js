// ============================================================
// main.js - Game state management and initialization
// ============================================================

window.Game = (() => {
  const D = window.GAME_DATA;

  let state = null;
  let idCounter = 0;

  function generateId() {
    return 'mon_' + Date.now().toString(36) + '_' + (idCounter++);
  }

  function createDefaultState() {
    return {
      player: {
        name: '',
        gold: 300,
        wins: 0,
        losses: 0,
        captures: 0,
        breeds: 0,
        evolves: 0,
        syntheses: 0,
        itemsUsed: 0,
        goldEarned: 0,
        defeatDemon: false,
      },
      party: [],
      box: [],
      pedigreeRecords: [],
      achievements: [],
      dailyQuests: [],
      lastDailyReset: null,
      items: {
        potion: 3,
        ball_normal: 5,
      },
      fragments: {},
      unlockedAreas: [0],
      ngPlus: false,
      ngPlusMultiplier: 1.0,
      currentScreen: 'title',
    };
  }

  function createMonster(type, level, options = {}) {
    const md = D.MONSTER_TYPES[type];
    if (!md) return null;

    let stage = 0;
    for (let i = md.evolveLevel.length - 1; i >= 0; i--) {
      if (level >= md.evolveLevel[i]) { stage = i; break; }
    }

    const traits = md.traits.filter(Boolean);
    const mon = {
      id: generateId(),
      type,
      nickname: options.nickname || md.stages[stage],
      stage,
      level,
      exp: 0,
      traits: [...traits],
      synthTraits: options.synthTraits || [],
      skills: { atk: [], def: [], spd: [] },
      skillPoints: Math.floor((level - 1) / 2),
      equipment: { weapon: null, armor: null },
      pedigree: options.pedigree || { parent1: null, parent2: null },
      generation: options.generation || 1,
      statBonus: options.statBonus || { hp: 0, atk: 0, def: 0, spd: 0 },
    };

    // Set HP to max
    const stats = D.calcEffectiveStats(mon);
    mon.hp = stats.maxHp;

    return mon;
  }

  function getMonsterDisplayName(mon) {
    const md = D.MONSTER_TYPES[mon.type];
    return md.stages[mon.stage];
  }

  function getEffStats(mon) {
    const base = D.calcEffectiveStats(mon);
    // Add breeding stat bonus
    base.maxHp += (mon.statBonus?.hp || 0);
    base.atk += (mon.statBonus?.atk || 0);
    base.def += (mon.statBonus?.def || 0);
    base.spd += (mon.statBonus?.spd || 0);
    return base;
  }

  function addExp(mon, amount) {
    mon.exp += amount;
    let leveledUp = false;
    while (mon.exp >= D.expToLevel(mon.level)) {
      mon.exp -= D.expToLevel(mon.level);
      mon.level++;
      leveledUp = true;
      // Skill point every 2 levels
      if (mon.level % 2 === 0) {
        mon.skillPoints++;
      }
      // Check evolution
      const md = D.MONSTER_TYPES[mon.type];
      for (let i = md.evolveLevel.length - 1; i >= 0; i--) {
        if (mon.level >= md.evolveLevel[i] && mon.stage < i) {
          mon.stage = i;
          mon.nickname = md.stages[i];
          state.player.evolves++;
          break;
        }
      }
    }
    // Recalc HP
    if (leveledUp) {
      const stats = getEffStats(mon);
      mon.hp = stats.maxHp;
    }
    return leveledUp;
  }

  function addToBox(mon) {
    if (getAllMonsters().length >= 53) return false; // 50 box + 3 party max
    state.box.push(mon);
    return true;
  }

  function removeFromBox(monId) {
    state.box = state.box.filter(m => m.id !== monId);
  }

  function addToParty(monId) {
    if (state.party.length >= 3) return false;
    const mon = state.box.find(m => m.id === monId);
    if (!mon) return false;
    state.box = state.box.filter(m => m.id !== monId);
    state.party.push(mon);
    return true;
  }

  function removeFromParty(monId) {
    const mon = state.party.find(m => m.id === monId);
    if (!mon) return false;
    state.party = state.party.filter(m => m.id !== monId);
    state.box.push(mon);
    return true;
  }

  function getAllMonsters() {
    return [...state.party, ...state.box];
  }

  function getItem(itemId) {
    return state.items[itemId] || 0;
  }

  function addItem(itemId, count = 1) {
    state.items[itemId] = (state.items[itemId] || 0) + count;
  }

  function useItem(itemId) {
    if (!state.items[itemId] || state.items[itemId] <= 0) return false;
    state.items[itemId]--;
    return true;
  }

  function addGold(amount) {
    state.player.gold += amount;
    state.player.goldEarned += amount;
  }

  function spendGold(amount) {
    if (state.player.gold < amount) return false;
    state.player.gold -= amount;
    return true;
  }

  function addFragment(type, count = 1) {
    state.fragments[type] = (state.fragments[type] || 0) + count;
  }

  function checkAreaUnlock() {
    const { AREAS } = D;
    for (const area of AREAS) {
      if (state.unlockedAreas.includes(area.id)) continue;
      if (!area.unlockCondition) {
        state.unlockedAreas.push(area.id);
        continue;
      }
      if (area.unlockCondition.wins && state.player.wins >= area.unlockCondition.wins) {
        state.unlockedAreas.push(area.id);
      }
    }
  }

  function autoSave() {
    SaveSystem.save(state);
  }

  function newGame() {
    state = createDefaultState();
    idCounter = 0;
  }

  function startGame(playerName) {
    state.player.name = playerName || 'プレイヤー';
    // Give starter slime
    const starter = createMonster('slime', 1, { nickname: 'スライム' });
    state.party.push(starter);
    state.currentScreen = 'worldmap';
    initDailyQuests();
    autoSave();
  }

  function initDailyQuests() {
    const today = new Date().toDateString();
    if (state.lastDailyReset === today) return;
    state.lastDailyReset = today;
    // Pick 3 random quests
    const pool = [...D.DAILY_QUEST_POOL];
    const quests = [];
    for (let i = 0; i < 3 && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      const q = pool.splice(idx, 1)[0];
      quests.push({ ...q, progress: 0, completed: false, claimed: false });
    }
    state.dailyQuests = quests;
  }

  function updateDailyQuest(type, amount = 1, extra = {}) {
    for (const q of state.dailyQuests) {
      if (q.completed || q.type !== type) continue;
      if (q.areaId !== undefined && extra.areaId !== q.areaId) continue;
      q.progress += amount;
      if (q.progress >= q.goal) {
        q.completed = true;
      }
    }
  }

  function claimDailyQuest(questId) {
    const q = state.dailyQuests.find(dq => dq.id === questId);
    if (!q || !q.completed || q.claimed) return false;
    q.claimed = true;
    addGold(q.reward);
    return true;
  }

  function loadGame() {
    const saved = SaveSystem.load();
    if (saved) {
      state = saved;
      // Migrate: ensure all monsters have required fields
      const allMons = [...(state.party || []), ...(state.box || [])];
      for (const mon of allMons) {
        if (!mon.equipment) mon.equipment = { weapon: null, armor: null };
        if (!mon.traitLevels) mon.traitLevels = {};
      }
      initDailyQuests();
      return true;
    }
    return false;
  }

  function enableNGPlus() {
    state.ngPlus = true;
    state.ngPlusMultiplier = 1.5;
    // Reset area progress but keep party/box
    state.player.wins = 0;
    state.player.losses = 0;
    autoSave();
  }

  function getState() { return state; }

  return {
    getState,
    newGame,
    startGame,
    loadGame,
    autoSave,
    createMonster,
    getMonsterDisplayName,
    getEffStats,
    addExp,
    addToBox,
    removeFromBox,
    addToParty,
    removeFromParty,
    getAllMonsters,
    getItem,
    addItem,
    useItem,
    addGold,
    spendGold,
    addFragment,
    checkAreaUnlock,
    generateId,
    initDailyQuests,
    updateDailyQuest,
    claimDailyQuest,
    enableNGPlus,
  };
})();
