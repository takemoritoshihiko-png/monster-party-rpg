// ============================================================
// battle.js - Turn-based battle engine
// ============================================================

window.BattleEngine = (() => {
  const D = window.GAME_DATA;

  let battleState = null;

  function createBattleState(playerParty, enemyParty, areaId) {
    battleState = {
      playerParty: playerParty.map(m => ({
        ...m,
        battleHp: m.hp,
        guarding: false,
        specialCooldown: 0,
        turnCount: 0,
        endureUsed: false,
        extraTurnUsed: false,
        cursedDebuff: false,
        atkDebuff: 0,
      })),
      enemyParty: enemyParty.map(m => ({
        ...m,
        battleHp: m.hp,
        guarding: false,
        specialCooldown: 0,
        turnCount: 0,
        endureUsed: false,
        extraTurnUsed: false,
        atkDebuff: 0,
      })),
      currentPlayerIndex: 0,
      currentEnemyIndex: 0,
      turn: 0,
      areaId,
      log: [],
      phase: 'player_action', // player_action, enemy_action, result
      result: null, // 'win', 'lose'
      capturedMonster: null,
      noDamageTaken: true,
    };

    // Terror trait: reduce all enemy DEF by 10%
    for (const pm of battleState.playerParty) {
      const s = Game.getEffStats(pm);
      if (s.allTraits.includes('terror')) {
        addLog('恐怖の力が敵を包む！全ての敵のDEFが低下！');
        for (const em of battleState.enemyParty) {
          em.atkDebuff = 0; // mark as affected
        }
        break;
      }
    }

    // Find first alive player
    battleState.currentPlayerIndex = findNextAlive(battleState.playerParty, -1);
    battleState.currentEnemyIndex = findNextAlive(battleState.enemyParty, -1);

    addLog('バトル開始！');
    return battleState;
  }

  function getState() { return battleState; }

  function addLog(msg) {
    battleState.log.push(msg);
    if (battleState.log.length > 50) battleState.log.shift();
  }

  function findNextAlive(party, currentIndex) {
    for (let i = currentIndex + 1; i < party.length; i++) {
      if (party[i].battleHp > 0) return i;
    }
    return -1;
  }

  function findFirstAlive(party) {
    return findNextAlive(party, -1);
  }

  function isPartyDefeated(party) {
    return party.every(m => m.battleHp <= 0);
  }

  function getCurrentPlayer() {
    if (battleState.currentPlayerIndex < 0) return null;
    return battleState.playerParty[battleState.currentPlayerIndex];
  }

  function getCurrentEnemy() {
    if (battleState.currentEnemyIndex < 0) return null;
    return battleState.enemyParty[battleState.currentEnemyIndex];
  }

  function calcDamage(attacker, defender, isSpecial = false) {
    const atkStats = Game.getEffStats(attacker);
    const defStats = Game.getEffStats(defender);

    let atk = atkStats.atk;
    let def = defStats.def;

    // Low HP ATK bonus
    if (atkStats.lowHpAtk > 0 && attacker.battleHp <= atkStats.maxHp * 0.5) {
      atk = Math.floor(atk * (1 + atkStats.lowHpAtk));
    }

    // ATK debuff from curse
    if (attacker.atkDebuff > 0) {
      atk = Math.floor(atk * (1 - attacker.atkDebuff));
    }

    // Terror trait reduces enemy def
    if (defStats.allTraits.includes('terror') === false) {
      // Check if attacker has terror
      for (const pm of battleState.playerParty) {
        const ps = Game.getEffStats(pm);
        if (ps.allTraits.includes('terror')) {
          def = Math.floor(def * 0.9);
          break;
        }
      }
    }

    let damage = Math.max(1, atk - Math.floor(def * 0.5)) + Math.floor(Math.random() * 5) - 2;

    if (isSpecial) {
      damage = Math.floor(damage * 1.8 * atkStats.specialDmg);
    }

    // Guard
    if (defender.guarding) {
      const guardReduction = 0.35 + (defStats.guardBonus || 0);
      damage = Math.floor(damage * (1 - Math.min(0.85, guardReduction + 0.65)));
      // Actually guard = 65% reduction base
      damage = Math.floor(damage * 0.35);
      if (defStats.guardBonus) {
        damage = Math.floor(damage * (1 - defStats.guardBonus));
      }
    }

    // Critical hit
    let isCrit = false;
    if (Math.random() < atkStats.crit) {
      damage = Math.floor(damage * atkStats.critDmg * 1.5);
      isCrit = true;
    }

    damage = Math.max(1, damage);

    return { damage, isCrit };
  }

  function applyDamage(target, damage, targetParty) {
    const stats = Game.getEffStats(target);

    // Endure check
    if (target.battleHp - damage <= 0 && stats.endure && !target.endureUsed) {
      target.endureUsed = true;
      target.battleHp = 1;
      addLog(`${target.nickname}は耐えた！HPが1で踏みとどまった！`);
      return false;
    }

    target.battleHp = Math.max(0, target.battleHp - damage);

    if (target.battleHp <= 0) {
      addLog(`${target.nickname}は倒れた！`);
      return true; // defeated
    }
    return false;
  }

  // ---- Player Actions ----

  function playerAttack(targetIndex) {
    const player = getCurrentPlayer();
    if (!player || player.battleHp <= 0) return;

    const target = battleState.enemyParty[targetIndex];
    if (!target || target.battleHp <= 0) {
      targetIndex = findFirstAlive(battleState.enemyParty);
      if (targetIndex < 0) return;
    }
    const enemy = battleState.enemyParty[targetIndex];

    const pStats = Game.getEffStats(player);
    const eStats = Game.getEffStats(enemy);

    // Evade check
    if (eStats.evade > 0 && Math.random() < eStats.evade) {
      addLog(`${player.nickname}の攻撃！${enemy.nickname}はかわした！`);
      afterPlayerAction();
      return;
    }

    // First turn evade
    if (eStats.firstEvade && battleState.turn === 0) {
      addLog(`${player.nickname}の攻撃！${enemy.nickname}は幻影で回避した！`);
      afterPlayerAction();
      return;
    }

    const { damage, isCrit } = calcDamage(player, enemy, false);
    const critText = isCrit ? 'クリティカル！' : '';
    addLog(`${player.nickname}の攻撃！${enemy.nickname}に${damage}ダメージ！${critText}`);
    const defeated = applyDamage(enemy, damage, battleState.enemyParty);

    // Curse trait
    if (pStats.allTraits.includes('cursed') && Math.random() < 0.1) {
      enemy.atkDebuff = 0.15;
      addLog(`呪いの力！${enemy.nickname}のATKが低下！`);
    }

    // Double hit
    if (pStats.doubleHit > 0 && Math.random() < pStats.doubleHit && !defeated) {
      const { damage: d2, isCrit: c2 } = calcDamage(player, enemy, false);
      const ct2 = c2 ? 'クリティカル！' : '';
      addLog(`連撃！追加で${d2}ダメージ！${ct2}`);
      applyDamage(enemy, d2, battleState.enemyParty);
    }

    // Counter from enemy
    if (!defeated && eStats.counter > 0 && Math.random() < eStats.counter) {
      const { damage: cd } = calcDamage(enemy, player, false);
      addLog(`${enemy.nickname}のカウンター！${player.nickname}に${cd}ダメージ！`);
      applyDamage(player, cd, battleState.playerParty);
      if (cd > 0) battleState.noDamageTaken = false;
    }

    afterPlayerAction();
  }

  function playerGuard() {
    const player = getCurrentPlayer();
    if (!player) return;
    player.guarding = true;
    addLog(`${player.nickname}はガードしている！`);
    afterPlayerAction();
  }

  function playerSpecial(targetIndex) {
    const player = getCurrentPlayer();
    if (!player) return;

    if (player.turnCount < 3 || player.specialCooldown > 0) {
      addLog('必殺技はまだ使えない！');
      return;
    }

    let target = battleState.enemyParty[targetIndex];
    if (!target || target.battleHp <= 0) {
      targetIndex = findFirstAlive(battleState.enemyParty);
      if (targetIndex < 0) return;
      target = battleState.enemyParty[targetIndex];
    }

    const { damage, isCrit } = calcDamage(player, target, true);
    const critText = isCrit ? 'クリティカル！' : '';
    addLog(`${player.nickname}の必殺技！${target.nickname}に${damage}ダメージ！${critText}`);
    applyDamage(target, damage, battleState.enemyParty);

    player.specialCooldown = 5;
    afterPlayerAction();
  }

  function playerUseItem(itemId) {
    const player = getCurrentPlayer();
    if (!player) return false;

    const itemData = D.ITEMS[itemId];
    if (!itemData) return false;

    if (itemData.type === 'consumable') {
      if (!Game.useItem(itemId)) {
        addLog('アイテムがない！');
        return false;
      }
      const heal = Math.min(itemData.effect.heal, Game.getEffStats(player).maxHp - player.battleHp);
      player.battleHp = Math.min(Game.getEffStats(player).maxHp, player.battleHp + itemData.effect.heal);
      addLog(`${player.nickname}は${itemData.name}を使った！HPが${heal}回復した！`);
      Game.getState().player.itemsUsed++;
      Game.updateDailyQuest('item_use');
      afterPlayerAction();
      return true;
    }

    if (itemData.type === 'ball') {
      return playerCapture(itemId);
    }

    return false;
  }

  function playerCapture(ballId) {
    const player = getCurrentPlayer();
    if (!player) return false;

    const ballData = D.ITEMS[ballId];
    if (!ballData || ballData.type !== 'ball') return false;

    // Find target (first alive enemy)
    const targetIdx = findFirstAlive(battleState.enemyParty);
    if (targetIdx < 0) return false;
    const target = battleState.enemyParty[targetIdx];
    const tStats = Game.getEffStats(target);

    // Check HP <= 50%
    const hpPercent = target.battleHp / tStats.maxHp;
    if (hpPercent > 0.5) {
      addLog(`${target.nickname}はまだ元気すぎる！HPを50%以下にしないと捕獲できない！`);
      return false;
    }

    if (!Game.useItem(ballId)) {
      addLog(`${ballData.name}がない！`);
      return false;
    }

    // Capture rate calculation (higher base rate, wider window)
    const baseRate = (0.5 - hpPercent) / 0.5 * 0.5 + 0.35;
    const levelDiff = Math.max(0, target.level - (player.level + 10));
    const levelPenalty = Math.max(0.3, 1 - levelDiff * 0.03);
    const rate = Math.min(0.95, baseRate * ballData.effect.catchRate * levelPenalty);

    addLog(`${ballData.name}を投げた！(成功率${Math.floor(rate * 100)}%)`);

    if (Math.random() < rate) {
      // Success!
      addLog(`やった！${target.nickname}を捕獲した！`);
      const captured = Game.createMonster(target.type, target.level);
      captured.battleHp = target.battleHp;
      captured.hp = target.battleHp;

      if (Game.getAllMonsters().length < 53) {
        Game.addToBox(captured);
        battleState.capturedMonster = captured;
        Game.getState().player.captures++;
        Game.updateDailyQuest('capture');
      } else {
        addLog('ボックスが一杯！捕獲したモンスターを逃がした...');
      }

      // Remove from enemy party
      target.battleHp = 0;
      afterPlayerAction();
      return true;
    } else {
      addLog(`しかし${target.nickname}は逃げ出した！`);
      afterPlayerAction();
      return true;
    }
  }

  function playerSwitch(partyIndex) {
    const current = getCurrentPlayer();
    const target = battleState.playerParty[partyIndex];
    if (!target || target.battleHp <= 0 || target === current) return;

    addLog(`${current.nickname}を引っ込めて${target.nickname}を出した！`);
    battleState.currentPlayerIndex = partyIndex;
    afterPlayerAction();
  }

  function afterPlayerAction() {
    const player = getCurrentPlayer();
    if (player) {
      player.turnCount++;
      if (player.specialCooldown > 0) player.specialCooldown--;
    }

    // Check if all enemies defeated
    if (isPartyDefeated(battleState.enemyParty)) {
      battleState.phase = 'result';
      battleState.result = 'win';
      addLog('勝利！');
      return;
    }

    // Move to enemy action
    battleState.phase = 'enemy_action';
    processEnemyTurn();
  }

  // ---- Enemy AI ----

  function processEnemyTurn() {
    for (let i = 0; i < battleState.enemyParty.length; i++) {
      const enemy = battleState.enemyParty[i];
      if (enemy.battleHp <= 0) continue;
      enemy.guarding = false;
      enemyAction(enemy, i);
    }

    // Regeneration trait for active player monster only
    const activePlayer = battleState.playerParty[battleState.currentPlayerIndex];
    if (activePlayer && activePlayer.battleHp > 0) {
      const s = Game.getEffStats(activePlayer);
      if (s.allTraits.includes('regeneration')) {
        const heal = Math.max(1, Math.floor(s.maxHp * 0.05));
        activePlayer.battleHp = Math.min(s.maxHp, activePlayer.battleHp + heal);
        addLog(`${activePlayer.nickname}の再生！HPが${heal}回復！`);
      }
    }

    // Check if all players defeated
    if (isPartyDefeated(battleState.playerParty)) {
      battleState.phase = 'result';
      battleState.result = 'lose';
      addLog('全滅...敗北...');
      return;
    }

    // Reset guard for player party
    for (const pm of battleState.playerParty) {
      pm.guarding = false;
    }

    // Advance turn
    battleState.turn++;

    // Ensure current player is alive
    if (battleState.playerParty[battleState.currentPlayerIndex]?.battleHp <= 0) {
      const next = findFirstAlive(battleState.playerParty);
      if (next >= 0) {
        battleState.currentPlayerIndex = next;
        addLog(`${battleState.playerParty[next].nickname}が前に出た！`);
      }
    }

    battleState.phase = 'player_action';
  }

  function enemyAction(enemy, enemyIndex) {
    const eStats = Game.getEffStats(enemy);
    const ngMult = Game.getState().ngPlusMultiplier || 1;

    // Target is always the current active player monster
    const activeIdx = battleState.currentPlayerIndex;
    const target = battleState.playerParty[activeIdx];
    if (!target || target.battleHp <= 0) return;

    // Strong enemy behavior (level > 15 or boss-like)
    const isStrong = enemy.level >= 15 || enemy.stage >= 2;

    // First turn evade for enemy
    const tStats = Game.getEffStats(target);
    if (tStats.firstEvade && battleState.turn === 0) {
      addLog(`${enemy.nickname}の攻撃！${target.nickname}は幻影で回避した！`);
      return;
    }

    // Evade check for target
    if (tStats.evade > 0 && Math.random() < tStats.evade) {
      addLog(`${enemy.nickname}の攻撃！${target.nickname}はかわした！`);
      return;
    }

    // Strong enemies: special behavior
    if (isStrong && Math.random() < 0.25) {
      // Buff self
      addLog(`${enemy.nickname}は力を溜めた！ATKが上昇！`);
      enemy.atkDebuff = -0.2; // negative debuff = buff
      return;
    }

    // Special attack for strong enemies (every 4 turns)
    if (isStrong && enemy.turnCount > 0 && enemy.turnCount % 4 === 0) {
      let specDmg = calcDamage(enemy, target, true);
      let d = Math.floor(specDmg.damage * ngMult);
      addLog(`${enemy.nickname}の必殺技！${target.nickname}に${d}ダメージ！`);
      applyDamage(target, d, battleState.playerParty);
      if (d > 0) battleState.noDamageTaken = false;

      // Counter
      if (tStats.counter > 0 && Math.random() < tStats.counter) {
        const { damage: cd } = calcDamage(target, enemy, false);
        addLog(`${target.nickname}のカウンター！${enemy.nickname}に${cd}ダメージ！`);
        applyDamage(enemy, cd, battleState.enemyParty);
      }

      enemy.turnCount++;
      return;
    }

    // Double attack for very strong enemies
    const doubleAttack = isStrong && enemy.level >= 25 && Math.random() < 0.3;

    let { damage, isCrit } = calcDamage(enemy, target, false);
    damage = Math.floor(damage * ngMult);
    const critText = isCrit ? 'クリティカル！' : '';
    addLog(`${enemy.nickname}の攻撃！${target.nickname}に${damage}ダメージ！${critText}`);
    const defeated = applyDamage(target, damage, battleState.playerParty);
    if (damage > 0) battleState.noDamageTaken = false;

    // Counter
    if (!defeated && tStats.counter > 0 && Math.random() < tStats.counter && target.battleHp > 0) {
      const { damage: cd } = calcDamage(target, enemy, false);
      addLog(`${target.nickname}のカウンター！${enemy.nickname}に${cd}ダメージ！`);
      applyDamage(enemy, cd, battleState.enemyParty);
    }

    // Second attack (same target - active monster only)
    if (doubleAttack && !isPartyDefeated(battleState.playerParty) && target.battleHp > 0) {
      let { damage: d2 } = calcDamage(enemy, target, false);
      d2 = Math.floor(d2 * ngMult);
      addLog(`${enemy.nickname}の2回攻撃！${target.nickname}に${d2}ダメージ！`);
      applyDamage(target, d2, battleState.playerParty);
      if (d2 > 0) battleState.noDamageTaken = false;
    }

    enemy.turnCount++;
  }

  // ---- Battle Results ----

  function getBattleRewards() {
    if (battleState.result !== 'win') return null;

    const area = D.AREAS[battleState.areaId];
    let totalExp = 0;
    let totalGold = 0;
    const fragments = [];
    const pStats = Game.getEffStats(battleState.playerParty[0] || battleState.playerParty.find(p => true));

    for (const enemy of battleState.enemyParty) {
      const md = D.MONSTER_TYPES[enemy.type];
      totalExp += Math.floor((md.expYield * enemy.level + Math.random() * 10) * (Game.getState().ngPlusMultiplier || 1));
      totalGold += Math.floor(md.goldYield + Math.random() * 8);

      // Fragment drop
      if (Math.random() < md.fragmentChance) {
        fragments.push(enemy.type);
        Game.addFragment(enemy.type);
      }

      // Demon defeat tracking
      if (enemy.type === 'demon') {
        Game.getState().player.defeatDemon = true;
      }
    }

    // Gold bonus from scavenger trait
    let goldBonus = 0;
    for (const pm of battleState.playerParty) {
      const s = Game.getEffStats(pm);
      if (s.goldBonus > 0) goldBonus += s.goldBonus;
    }
    totalGold = Math.floor(totalGold * (1 + goldBonus));

    return { totalExp, totalGold, fragments };
  }

  function applyRewards(rewards) {
    if (!rewards) return [];

    const levelUps = [];
    Game.addGold(rewards.totalGold);
    Game.updateDailyQuest('gold', rewards.totalGold);

    // Distribute exp to alive party members
    const alive = battleState.playerParty.filter(m => m.battleHp > 0);
    const expEach = Math.floor(rewards.totalExp / Math.max(1, alive.length));

    for (const mon of alive) {
      // Find original monster in party
      const original = Game.getState().party.find(m => m.id === mon.id);
      if (original) {
        original.hp = mon.battleHp;
        const leveled = Game.addExp(original, expEach);
        if (leveled) levelUps.push(original.nickname);
      }
    }

    // Update HP for alive but damaged monsters
    for (const mon of battleState.playerParty) {
      const original = Game.getState().party.find(m => m.id === mon.id);
      if (original && mon.battleHp > 0) {
        original.hp = mon.battleHp;
      } else if (original && mon.battleHp <= 0) {
        // Revive with 1 HP
        original.hp = 1;
      }
    }

    Game.getState().player.wins++;
    Game.updateDailyQuest('win');
    Game.updateDailyQuest('area_win', 1, { areaId: battleState.areaId });
    if (battleState.noDamageTaken) {
      Game.updateDailyQuest('no_dmg');
    }
    Game.checkAreaUnlock();
    Game.autoSave();

    return levelUps;
  }

  function applyLoss() {
    // Lose half gold
    const lostGold = Math.floor(Game.getState().player.gold * 0.2);
    Game.getState().player.gold -= lostGold;
    Game.getState().player.losses++;

    // Restore party HP to 50%
    for (const mon of Game.getState().party) {
      const stats = Game.getEffStats(mon);
      mon.hp = Math.max(1, Math.floor(stats.maxHp * 0.5));
    }

    Game.autoSave();
    return lostGold;
  }

  function generateEnemies(areaId) {
    const area = D.AREAS[areaId];
    const ngMult = Game.getState().ngPlusMultiplier || 1;

    // Determine enemy count (area 0: cap to 1 until 3 wins)
    let [minCount, maxCount] = area.enemyCount;
    if (areaId === 0 && Game.getState().player.wins < 3) {
      maxCount = 1;
    }
    const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));

    const enemies = [];
    for (let i = 0; i < count; i++) {
      // Weighted random type
      const totalWeight = area.enemies.reduce((s, e) => s + e.weight, 0);
      let rand = Math.random() * totalWeight;
      let type = area.enemies[0].type;
      for (const e of area.enemies) {
        rand -= e.weight;
        if (rand <= 0) { type = e.type; break; }
      }

      // Random level in range
      const level = area.minLevel + Math.floor(Math.random() * (area.maxLevel - area.minLevel + 1));
      const enemy = Game.createMonster(type, level);

      // Apply NG+ multiplier to all stats
      if (ngMult > 1) {
        const stats = Game.getEffStats(enemy);
        enemy.hp = Math.floor(stats.maxHp * ngMult);
        enemy.statBonus = {
          hp:  Math.floor(stats.maxHp * (ngMult - 1)),
          atk: Math.floor(stats.atk * (ngMult - 1)),
          def: Math.floor(stats.def * (ngMult - 1)),
          spd: Math.floor(stats.spd * (ngMult - 1)),
        };
      }

      enemies.push(enemy);
    }

    return enemies;
  }

  function canCapture() {
    if (!battleState) return false;
    const idx = findFirstAlive(battleState.enemyParty);
    if (idx < 0) return false;
    const enemy = battleState.enemyParty[idx];
    const stats = Game.getEffStats(enemy);
    return enemy.battleHp / stats.maxHp <= 0.5;
  }

  function canSpecial() {
    const player = getCurrentPlayer();
    if (!player) return false;
    return player.turnCount >= 3 && player.specialCooldown <= 0;
  }

  function getSpecialCooldownInfo() {
    const player = getCurrentPlayer();
    if (!player) return { available: false, turnsToUnlock: 3, cooldown: 0 };
    return {
      available: player.turnCount >= 3 && player.specialCooldown <= 0,
      turnsToUnlock: Math.max(0, 3 - player.turnCount),
      cooldown: player.specialCooldown,
    };
  }

  return {
    createBattleState,
    getState,
    getCurrentPlayer,
    getCurrentEnemy,
    playerAttack,
    playerGuard,
    playerSpecial,
    playerUseItem,
    playerCapture,
    playerSwitch,
    getBattleRewards,
    applyRewards,
    applyLoss,
    generateEnemies,
    canCapture,
    canSpecial,
    getSpecialCooldownInfo,
    isPartyDefeated,
    findFirstAlive,
  };
})();
