// ============================================================
// systems.js - Genetics, Synthesis, Skills, Achievements
// ============================================================

window.Systems = (() => {
  const D = window.GAME_DATA;

  // ---- Genetics / Breeding ----
  const TRAIT_LEVEL_MAX = 5; // Max enhancement level per trait
  const TRAIT_LEVEL_BONUS = 0.10; // +10% per level (base is level 0)

  function canBreed(mon1, mon2) {
    if (!mon1 || !mon2) return false;
    if (mon1.id === mon2.id) return false;
    if (mon1.level < 5 || mon2.level < 5) return false;
    return true;
  }

  function breed(mon1, mon2) {
    if (!canBreed(mon1, mon2)) return null;

    // Child type: random from parents
    const childType = Math.random() < 0.5 ? mon1.type : mon2.type;
    const md = D.MONSTER_TYPES[childType];

    // Stats: average of parents + random bonus
    const s1 = Game.getEffStats(mon1);
    const s2 = Game.getEffStats(mon2);
    const statBonus = {
      hp:  Math.floor((s1.maxHp + s2.maxHp) / 2 * 0.05 + Math.random() * 10),
      atk: Math.floor((s1.atk + s2.atk) / 2 * 0.05 + Math.random() * 3),
      def: Math.floor((s1.def + s2.def) / 2 * 0.05 + Math.random() * 3),
      spd: Math.floor((s1.spd + s2.spd) / 2 * 0.05 + Math.random() * 3),
    };

    // Child rarity: based on parents' average
    const avgRarity = ((mon1.rarity || 1) + (mon2.rarity || 1)) / 2;
    let childRarity = Math.round(avgRarity);
    // Random ±1 variation
    const rVar = Math.random();
    if (rVar < 0.2) childRarity = Math.max(1, childRarity - 1);
    else if (rVar < 0.35) childRarity = Math.min(5, childRarity + 1);
    // ★5 can only come from ★5×★5 or ★4×★5 parents (avg >= 4.5)
    if (childRarity >= 5 && avgRarity < 4.5) childRarity = 4;
    childRarity = Math.max(1, Math.min(5, childRarity));

    // Traits inheritance - higher rarity parents = higher inheritance rate
    const avgParentRarity = avgRarity;
    const traitInheritRate = 0.5 + avgParentRarity * 0.05; // 0.55 ~ 0.75
    const parentTraits = [...new Set([...mon1.traits, ...mon2.traits])].filter(Boolean);
    const childTraits = [];
    for (const t of parentTraits) {
      if (Math.random() < traitInheritRate) childTraits.push(t);
    }
    // If no traits inherited, at least get one from child's species
    if (childTraits.length === 0 && md.traits[0]) {
      childTraits.push(md.traits[0]);
    }

    // Trait enhancement: shared traits between parents get boosted
    const traitLevels = {};
    const p1Levels = mon1.traitLevels || {};
    const p2Levels = mon2.traitLevels || {};
    const p1AllTraits = [...(mon1.traits || []), ...(mon1.synthTraits || [])].filter(Boolean);
    const p2AllTraits = [...(mon2.traits || []), ...(mon2.synthTraits || [])].filter(Boolean);

    for (const t of childTraits) {
      const baseLevel = Math.max(p1Levels[t] || 0, p2Levels[t] || 0);
      // Both parents have this trait → enhance
      if (p1AllTraits.includes(t) && p2AllTraits.includes(t)) {
        traitLevels[t] = Math.min(TRAIT_LEVEL_MAX, baseLevel + 1);
      } else {
        traitLevels[t] = baseLevel;
      }
    }

    // Synth traits inheritance (lower chance)
    const synthTraits = [];
    const parentSynth = [...new Set([...(mon1.synthTraits || []), ...(mon2.synthTraits || [])])];
    for (const t of parentSynth) {
      if (Math.random() < 0.35) {
        synthTraits.push(t);
        // Enhance synth traits too if shared
        const baseLevel = Math.max(p1Levels[t] || 0, p2Levels[t] || 0);
        if (p1AllTraits.includes(t) && p2AllTraits.includes(t)) {
          traitLevels[t] = Math.min(TRAIT_LEVEL_MAX, baseLevel + 1);
        } else if (!traitLevels[t]) {
          traitLevels[t] = baseLevel;
        }
      }
    }

    const generation = Math.max(mon1.generation, mon2.generation) + 1;

    // Create pedigree snapshots
    const pedigree = {
      parent1: {
        name: mon1.nickname,
        type: mon1.type,
        level: mon1.level,
        stage: mon1.stage,
        generation: mon1.generation,
        traits: [...mon1.traits],
        pedigree: mon1.pedigree,
      },
      parent2: {
        name: mon2.nickname,
        type: mon2.type,
        level: mon2.level,
        stage: mon2.stage,
        generation: mon2.generation,
        traits: [...mon2.traits],
        pedigree: mon2.pedigree,
      },
    };

    const child = Game.createMonster(childType, 1, {
      rarity: childRarity,
      statBonus,
      pedigree,
      generation,
      synthTraits,
    });
    child.traits = childTraits;
    child.traitLevels = traitLevels;

    return child;
  }

  function retireParents(mon1Id, mon2Id) {
    const state = Game.getState();

    // Find and remove parents from party and box
    const findAndRemove = (id) => {
      let mon = state.party.find(m => m.id === id);
      if (mon) {
        state.party = state.party.filter(m => m.id !== id);
        return mon;
      }
      mon = state.box.find(m => m.id === id);
      if (mon) {
        state.box = state.box.filter(m => m.id !== id);
        return mon;
      }
      return null;
    };

    const p1 = findAndRemove(mon1Id);
    const p2 = findAndRemove(mon2Id);

    // Add to pedigree records
    if (p1) state.pedigreeRecords.push({
      name: p1.nickname, type: p1.type, level: p1.level,
      stage: p1.stage, generation: p1.generation,
      retiredAt: Date.now(),
    });
    if (p2) state.pedigreeRecords.push({
      name: p2.nickname, type: p2.type, level: p2.level,
      stage: p2.stage, generation: p2.generation,
      retiredAt: Date.now(),
    });

    state.player.breeds++;
    Game.updateDailyQuest('breed');
  }

  // ---- Synthesis ----
  function canSynthesize(targetMon, fragmentType) {
    if (!targetMon || !fragmentType) return false;
    const count = Game.getState().fragments[fragmentType] || 0;
    if (count < 3) return false;
    if ((targetMon.synthTraits || []).length >= 3) return false;
    const traitToAbsorb = D.MONSTER_TYPES[fragmentType]?.traits[0];
    if (!traitToAbsorb) return false;
    if (targetMon.synthTraits.includes(traitToAbsorb)) return false;
    return true;
  }

  function synthesize(targetMon, fragmentType) {
    if (!canSynthesize(targetMon, fragmentType)) return false;

    const state = Game.getState();
    state.fragments[fragmentType] -= 3;

    const traitToAbsorb = D.MONSTER_TYPES[fragmentType].traits[0];
    if (!targetMon.synthTraits) targetMon.synthTraits = [];
    targetMon.synthTraits.push(traitToAbsorb);

    state.player.syntheses++;
    Game.updateDailyQuest('synth');
    Game.autoSave();
    return true;
  }

  // ---- Skill Tree ----
  function canLearnSkill(mon, skillId) {
    if (mon.skillPoints <= 0) return false;

    // Find skill in tree
    let skill = null;
    let route = null;
    for (const r of ['atk', 'def', 'spd']) {
      const found = D.SKILL_TREE[r].find(s => s.id === skillId);
      if (found) { skill = found; route = r; break; }
    }
    if (!skill || !route) return false;

    // Already learned?
    if (mon.skills[route].includes(skillId)) return false;

    // Check prerequisite
    if (skill.requires) {
      if (!mon.skills[route].includes(skill.requires)) return false;
    }

    return true;
  }

  function learnSkill(mon, skillId) {
    if (!canLearnSkill(mon, skillId)) return false;

    let route = null;
    for (const r of ['atk', 'def', 'spd']) {
      if (D.SKILL_TREE[r].find(s => s.id === skillId)) { route = r; break; }
    }
    if (!route) return false;

    mon.skills[route].push(skillId);
    mon.skillPoints--;
    Game.autoSave();
    return true;
  }

  function getSkillCount(mon) {
    return (mon.skills?.atk?.length || 0) +
           (mon.skills?.def?.length || 0) +
           (mon.skills?.spd?.length || 0);
  }

  // ---- Achievements ----
  function checkAchievements() {
    const state = Game.getState();
    const newAchievements = [];

    for (const ach of D.ACHIEVEMENTS) {
      if (state.achievements.includes(ach.id)) continue;

      let earned = false;
      switch (ach.id) {
        case 'first_win':    earned = state.player.wins >= 1; break;
        case 'first_capture': earned = state.player.captures >= 1; break;
        case 'party_full':   earned = state.party.length >= 3; break;
        case 'box_25':       earned = state.box.length >= 25; break;
        case 'box_50':       earned = state.box.length >= 50; break;
        case 'win_10':       earned = state.player.wins >= 10; break;
        case 'win_50':       earned = state.player.wins >= 50; break;
        case 'win_100':      earned = state.player.wins >= 100; break;
        case 'capture_10':   earned = state.player.captures >= 10; break;
        case 'capture_30':   earned = state.player.captures >= 30; break;
        case 'first_evolve': earned = state.player.evolves >= 1; break;
        case 'max_evolve':   earned = Game.getAllMonsters().some(m => m.stage >= 3); break;
        case 'first_breed':  earned = state.player.breeds >= 1; break;
        case 'breed_10':     earned = state.player.breeds >= 10; break;
        case 'all_areas':    earned = state.unlockedAreas.length >= 5; break;
        case 'all_monsters': {
          const types = new Set(Game.getAllMonsters().map(m => m.type));
          earned = types.size >= 7;
          break;
        }
        case 'first_synthesis': earned = state.player.syntheses >= 1; break;
        case 'skill_master': earned = Game.getAllMonsters().some(m => getSkillCount(m) >= 12); break;
        case 'rich':         earned = state.player.gold >= 10000; break;
        case 'defeat_demon': earned = state.player.defeatDemon; break;
        case 'ng_plus':      earned = state.ngPlus; break;
        case 'generation_3': earned = Game.getAllMonsters().some(m => m.generation >= 3); break;
        case 'no_damage_win': earned = false; break; // checked in battle
        case 'level_30':     earned = Game.getAllMonsters().some(m => m.level >= 30); break;
        case 'level_50':     earned = Game.getAllMonsters().some(m => m.level >= 50); break;
      }

      if (earned) {
        state.achievements.push(ach.id);
        if (ach.reward > 0) {
          Game.addGold(ach.reward);
        }
        newAchievements.push(ach);
      }
    }

    return newAchievements;
  }

  function checkNoDamageAchievement() {
    const state = Game.getState();
    if (!state.achievements.includes('no_damage_win')) {
      state.achievements.push('no_damage_win');
      const ach = D.ACHIEVEMENTS.find(a => a.id === 'no_damage_win');
      if (ach.reward > 0) Game.addGold(ach.reward);
      return ach;
    }
    return null;
  }

  // ---- Equipment ----
  function equipItem(mon, itemId) {
    const item = D.ITEMS[itemId];
    if (!item) return false;

    const slot = item.type; // 'weapon' or 'armor'
    if (slot !== 'weapon' && slot !== 'armor') return false;

    // Unequip current
    if (mon.equipment[slot]) {
      Game.addItem(mon.equipment[slot]);
    }

    mon.equipment[slot] = itemId;
    Game.useItem(itemId);
    Game.autoSave();
    return true;
  }

  function unequipItem(mon, slot) {
    if (!mon.equipment[slot]) return false;
    Game.addItem(mon.equipment[slot]);
    mon.equipment[slot] = null;
    Game.autoSave();
    return true;
  }

  return {
    canBreed,
    breed,
    retireParents,
    canSynthesize,
    synthesize,
    canLearnSkill,
    learnSkill,
    getSkillCount,
    checkAchievements,
    checkNoDamageAchievement,
    equipItem,
    unequipItem,
  };
})();
