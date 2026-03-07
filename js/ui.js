// ============================================================
// ui.js - Screen rendering (Title + World Map)
// ============================================================

window.UI = (() => {
  const D = window.GAME_DATA;

  const AREA_ICONS = ['🌲', '🏚', '⛰', '🏰', '🐉'];
  const AREA_COLORS = ['#2E7D32', '#4E342E', '#37474F', '#311B92', '#B71C1C'];

  let toastTimer = null;

  // ---- Screen Management ----
  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + screenId);
    if (el) el.classList.add('active');
    if (Game.getState()) {
      Game.getState().currentScreen = screenId;
      Game.autoSave();
    }
  }

  function showToast(msg, duration = 2500) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    clearTimeout(toastTimer);
    // Force reflow
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  // ---- Title Screen ----
  function renderTitle() {
    const screen = document.getElementById('screen-title');

    // Monster showcase canvases
    const showcase = screen.querySelector('.title-monster-showcase');
    showcase.innerHTML = '';
    const showTypes = ['slime', 'dragon', 'demon'];
    showTypes.forEach(type => {
      const c = document.createElement('canvas');
      c.width = 80;
      c.height = 80;
      MonsterCanvas.drawMonster(c, type, type === 'slime' ? 0 : 2);
      showcase.appendChild(c);
    });

    // Continue button state
    const continueBtn = document.getElementById('btn-continue');
    continueBtn.disabled = !SaveSystem.hasSave();
  }

  function onNewGame() {
    const overlay = document.getElementById('name-input-overlay');
    overlay.classList.add('active');
    const input = document.getElementById('input-player-name');
    input.value = '';
    input.focus();
  }

  function onConfirmName() {
    const input = document.getElementById('input-player-name');
    const name = input.value.trim() || 'プレイヤー';

    document.getElementById('name-input-overlay').classList.remove('active');

    Game.newGame();
    Game.startGame(name);

    // Show starter overlay
    showStarterOverlay();
  }

  function onCancelName() {
    document.getElementById('name-input-overlay').classList.remove('active');
  }

  function showStarterOverlay() {
    const overlay = document.getElementById('starter-overlay');
    overlay.classList.add('active');

    const mon = Game.getState().party[0];
    const stats = Game.getEffStats(mon);
    const md = D.MONSTER_TYPES[mon.type];

    // Draw slime
    const canvas = overlay.querySelector('.starter-box canvas');
    canvas.width = 140;
    canvas.height = 140;
    MonsterCanvas.drawMonster(canvas, mon.type, mon.stage);

    overlay.querySelector('.starter-name').textContent = mon.nickname;
    overlay.querySelector('.starter-desc').textContent =
      `${md.description}\n特性: ${mon.traits.map(t => D.TRAITS[t]?.name || '').join(', ')}`;

    const statsEl = overlay.querySelector('.starter-stats');
    statsEl.innerHTML = [
      { label: 'HP', val: stats.maxHp },
      { label: 'ATK', val: stats.atk },
      { label: 'DEF', val: stats.def },
      { label: 'SPD', val: stats.spd },
    ].map(s =>
      `<div class="stat-item"><div class="stat-label">${s.label}</div><div class="stat-val">${s.val}</div></div>`
    ).join('');
  }

  function onAcceptStarter() {
    document.getElementById('starter-overlay').classList.remove('active');
    showScreen('worldmap');
    renderWorldMap();
    showToast('冒険が始まった！');
  }

  function onContinue() {
    if (Game.loadGame()) {
      showScreen('worldmap');
      renderWorldMap();
      showToast('おかえりなさい、' + Game.getState().player.name + '！');
    }
  }

  // ---- World Map ----
  function renderWorldMap() {
    const state = Game.getState();
    if (!state) return;

    // Top bar
    const nameEl = document.getElementById('wm-player-name');
    nameEl.innerHTML = state.player.name + (state.ngPlus ? '<span class="ngplus-badge">NG+</span>' : '');
    document.getElementById('wm-gold').textContent = state.player.gold.toLocaleString() + ' G';

    // Party bar
    renderPartyBar();

    // Daily quests
    renderDailyQuests();

    // Areas
    renderAreas();
  }

  function renderPartyBar() {
    const container = document.getElementById('wm-party-bar');
    container.innerHTML = '';
    const state = Game.getState();

    for (let i = 0; i < 3; i++) {
      const mon = state.party[i];
      if (mon) {
        const stats = Game.getEffStats(mon);
        const hpPercent = Math.max(0, Math.min(100, (mon.hp / stats.maxHp) * 100));
        const hpColor = hpPercent > 50 ? '#4CAF50' : hpPercent > 25 ? '#FF9800' : '#F44336';
        const isFullHp = mon.hp >= stats.maxHp;

        const slot = document.createElement('div');
        slot.className = 'party-slot';

        const canvas = document.createElement('canvas');
        canvas.width = 56;
        canvas.height = 56;
        MonsterCanvas.drawMonster(canvas, mon.type, mon.stage, mon.synthTraits);

        const info = document.createElement('div');
        info.className = 'party-slot-info';

        // Find best available potion
        const potionTypes = ['elixir', 'hi_potion', 'potion'];
        const hasAnyPotion = potionTypes.some(id => Game.getItem(id) > 0);

        let potionBtnHtml = '';
        if (!isFullHp && hasAnyPotion) {
          const potionOptions = potionTypes
            .filter(id => Game.getItem(id) > 0)
            .map(id => `<option value="${id}">${D.ITEMS[id].name} (${Game.getItem(id)})</option>`)
            .join('');
          potionBtnHtml = `
            <div class="wm-potion-row">
              <select class="wm-potion-select" data-party-idx="${i}">${potionOptions}</select>
              <button class="btn wm-potion-btn" data-party-idx="${i}">回復</button>
            </div>
          `;
        } else if (isFullHp) {
          potionBtnHtml = `<div class="wm-potion-row"><span class="wm-hp-full">HP満タン</span></div>`;
        } else {
          potionBtnHtml = `<div class="wm-potion-row"><span class="wm-no-potion">ポーションなし</span></div>`;
        }

        info.innerHTML = `
          <div class="mon-name">${mon.nickname}</div>
          <div class="mon-level">Lv.${mon.level} <span style="color:#666;font-size:11px">EXP ${mon.exp}/${D.expToLevel(mon.level)}</span></div>
          <div class="party-slot-hp-bar">
            <div class="hp-fill" style="width:${hpPercent}%;background:${hpColor}"></div>
          </div>
          <div style="font-size:11px;color:#888;margin-top:2px">HP ${mon.hp}/${stats.maxHp}</div>
          ${potionBtnHtml}
        `;

        slot.appendChild(canvas);
        slot.appendChild(info);
        container.appendChild(slot);
      } else {
        const empty = document.createElement('div');
        empty.className = 'party-slot-empty';
        empty.textContent = '空きスロット';
        container.appendChild(empty);
      }
    }

    // Attach potion button events
    container.querySelectorAll('.wm-potion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.partyIdx);
        const select = container.querySelector(`.wm-potion-select[data-party-idx="${idx}"]`);
        if (!select) return;
        const itemId = select.value;
        useWorldMapPotion(idx, itemId);
      });
    });
  }

  function useWorldMapPotion(partyIdx, itemId) {
    const state = Game.getState();
    const mon = state.party[partyIdx];
    if (!mon) return;

    const stats = Game.getEffStats(mon);
    if (mon.hp >= stats.maxHp) {
      showToast('HPは満タンです');
      return;
    }

    const itemData = D.ITEMS[itemId];
    if (!itemData || itemData.type !== 'consumable') return;

    if (!Game.useItem(itemId)) {
      showToast('アイテムがありません');
      return;
    }

    const before = mon.hp;
    mon.hp = Math.min(stats.maxHp, mon.hp + itemData.effect.heal);
    const healed = mon.hp - before;

    showToast(`${mon.nickname}のHPが${healed}回復した！`);
    Game.autoSave();
    renderPartyBar();
  }

  function renderDailyQuests() {
    const container = document.getElementById('wm-daily-list');
    container.innerHTML = '';
    const state = Game.getState();

    if (!state.dailyQuests || state.dailyQuests.length === 0) return;

    state.dailyQuests.forEach(q => {
      const div = document.createElement('div');
      div.className = 'daily-item' + (q.completed ? ' completed' : '') + (q.claimed ? ' claimed' : '');

      let progressText = `${Math.min(q.progress, q.goal)}/${q.goal}`;
      let btnHtml = '';
      if (q.completed && !q.claimed) {
        btnHtml = `<button class="btn success" onclick="UI.claimQuest('${q.id}')">受取 ${q.reward}G</button>`;
      }

      div.innerHTML = `
        <div class="dq-name">${q.name}</div>
        <div class="dq-desc">${q.desc}</div>
        <div class="dq-progress">${progressText} ${q.claimed ? '(受取済)' : ''}</div>
        ${btnHtml}
      `;
      container.appendChild(div);
    });
  }

  function claimQuest(questId) {
    if (Game.claimDailyQuest(questId)) {
      showToast('クエスト報酬を受け取った！');
      renderWorldMap();
    }
  }

  function renderAreas() {
    const container = document.getElementById('wm-area-path');
    container.innerHTML = '';
    const state = Game.getState();

    D.AREAS.forEach((area, idx) => {
      const unlocked = state.unlockedAreas.includes(area.id);

      // Connector (except first)
      if (idx > 0) {
        const conn = document.createElement('div');
        conn.className = 'area-connector' + (unlocked ? ' unlocked' : '');
        container.appendChild(conn);
      }

      const node = document.createElement('div');
      node.className = 'area-node' + (unlocked ? '' : ' locked');

      const icon = document.createElement('div');
      icon.className = 'area-icon';
      icon.style.background = AREA_COLORS[idx] || '#333';
      icon.textContent = AREA_ICONS[idx] || '?';

      const info = document.createElement('div');
      info.className = 'area-info';
      info.innerHTML = `
        <div class="area-name">${area.name}</div>
        <div class="area-level">Lv.${area.minLevel} ~ ${area.maxLevel}</div>
        <div class="area-desc">${area.description}</div>
      `;

      node.appendChild(icon);
      node.appendChild(info);

      if (!unlocked && area.unlockCondition) {
        const lock = document.createElement('div');
        lock.className = 'area-lock-info';
        lock.textContent = `${area.unlockCondition.wins}勝で解放`;
        node.appendChild(lock);
      }

      if (unlocked) {
        node.addEventListener('click', () => onAreaSelect(area.id));
      }

      container.appendChild(node);
    });
  }

  function onAreaSelect(areaId) {
    const state = Game.getState();
    if (state.party.length === 0) {
      showToast('パーティにモンスターがいません！');
      return;
    }

    const allDead = state.party.every(m => m.hp <= 0);
    if (allDead) {
      showToast('パーティが全滅しています！回復してください');
      return;
    }

    startBattle(areaId);
  }

  // ================================================================
  // BATTLE SCREEN
  // ================================================================

  let pendingAction = null; // 'attack','special','capture' - waiting for target

  function startBattle(areaId) {
    const enemies = BattleEngine.generateEnemies(areaId);
    const state = Game.getState();
    BattleEngine.createBattleState(state.party, enemies, areaId);

    showScreen('battle');
    renderBattle();
    bindBattleActions();
  }

  function renderBattle() {
    const bs = BattleEngine.getState();
    if (!bs) return;

    const area = D.AREAS[bs.areaId];
    document.getElementById('bt-area-name').textContent = area.name;
    document.getElementById('bt-turn').textContent = 'Turn ' + (bs.turn + 1);

    renderBattleParty('bt-player-party', bs.playerParty, true, bs.currentPlayerIndex);
    renderBattleParty('bt-enemy-party', bs.enemyParty, false, -1);
    renderBattleLog();
    updateActionButtons();

    // Hide submenus
    hideAllSubmenus();

    // Show/hide result
    document.getElementById('bt-result').style.display = bs.phase === 'result' ? 'flex' : 'none';
  }

  function renderBattleParty(containerId, party, isPlayer, activeIdx) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    party.forEach((mon, idx) => {
      const stats = Game.getEffStats(mon);
      const hpMax = stats.maxHp;
      const hp = mon.battleHp;
      const hpPct = Math.max(0, Math.min(100, (hp / hpMax) * 100));
      const hpColor = hpPct > 50 ? '#4CAF50' : hpPct > 25 ? '#FF9800' : '#F44336';
      const defeated = hp <= 0;

      const card = document.createElement('div');
      card.className = 'battle-mon-card';
      if (defeated) card.classList.add('defeated');
      if (isPlayer && idx === activeIdx) card.classList.add('active-player');

      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;
      if (!defeated) {
        MonsterCanvas.drawMonster(canvas, mon.type, mon.stage, mon.synthTraits || []);
      }

      const info = document.createElement('div');
      info.className = 'battle-mon-info';

      let statusText = '';
      if (mon.guarding) statusText = 'ガード中';
      if (!isPlayer && !defeated) {
        const capPct = hp / hpMax;
        if (capPct <= 0.5) statusText = '捕獲可能！';
      }

      info.innerHTML = `
        <div class="battle-mon-name">${mon.nickname}</div>
        <div class="battle-mon-level">Lv.${mon.level}</div>
        <div class="battle-hp-bar"><div class="hp-fill" style="width:${hpPct}%;background:${hpColor}"></div></div>
        <div class="battle-hp-text">HP ${hp} / ${hpMax}</div>
        ${statusText ? `<div class="battle-mon-status">${statusText}</div>` : ''}
      `;

      card.appendChild(canvas);
      card.appendChild(info);

      // Enemy target click
      if (!isPlayer && !defeated && pendingAction) {
        card.classList.add('enemy-target');
        card.addEventListener('click', () => onTargetSelect(idx));
      }

      container.appendChild(card);
    });
  }

  function renderBattleLog() {
    const bs = BattleEngine.getState();
    const el = document.getElementById('bt-log');
    const last = bs.log.slice(-8);
    el.innerHTML = last.map(l => `<div class="log-line">${l}</div>`).join('');
    el.scrollTop = el.scrollHeight;
  }

  function updateActionButtons() {
    const bs = BattleEngine.getState();
    if (!bs) return;

    const actionsEl = document.getElementById('bt-actions');
    const isPlayerTurn = bs.phase === 'player_action';
    actionsEl.style.display = isPlayerTurn ? 'flex' : 'none';

    if (!isPlayerTurn) return;

    const specInfo = BattleEngine.getSpecialCooldownInfo();
    const specBtn = document.getElementById('bt-btn-special');
    specBtn.disabled = !specInfo.available;
    if (specInfo.available) {
      specBtn.textContent = '必殺技';
    } else if (specInfo.turnsToUnlock > 0) {
      specBtn.textContent = `必殺技 (${specInfo.turnsToUnlock}T後)`;
    } else {
      specBtn.textContent = `必殺技 (CD:${specInfo.cooldown})`;
    }

    const capBtn = document.getElementById('bt-btn-capture');
    const hasBalls = (Game.getItem('ball_normal') + Game.getItem('ball_great') + Game.getItem('ball_ultra')) > 0;
    capBtn.disabled = !BattleEngine.canCapture() || !hasBalls;

    const switchBtn = document.getElementById('bt-btn-switch');
    const bs2 = BattleEngine.getState();
    const aliveOthers = bs2.playerParty.filter((m, i) => m.battleHp > 0 && i !== bs2.currentPlayerIndex);
    switchBtn.disabled = aliveOthers.length === 0;
  }

  function hideAllSubmenus() {
    document.getElementById('bt-target-menu').style.display = 'none';
    document.getElementById('bt-item-menu').style.display = 'none';
    document.getElementById('bt-switch-menu').style.display = 'none';
    pendingAction = null;
    // Re-render to remove target highlights
    const bs = BattleEngine.getState();
    if (bs && bs.phase === 'player_action') {
      renderBattleParty('bt-enemy-party', bs.enemyParty, false, -1);
    }
  }

  function showTargetMenu(action) {
    const bs = BattleEngine.getState();
    pendingAction = action;
    document.getElementById('bt-actions').style.display = 'none';

    const title = action === 'attack' ? '攻撃対象を選択' :
                  action === 'special' ? '必殺技の対象を選択' : '対象を選択';
    document.getElementById('bt-submenu-title').textContent = title;
    document.getElementById('bt-target-menu').style.display = 'block';

    // Re-render enemy cards with target highlights
    renderBattleParty('bt-enemy-party', bs.enemyParty, false, -1);
  }

  function onTargetSelect(targetIdx) {
    const action = pendingAction;
    hideAllSubmenus();

    if (action === 'attack') {
      BattleEngine.playerAttack(targetIdx);
    } else if (action === 'special') {
      BattleEngine.playerSpecial(targetIdx);
    }

    afterAction();
  }

  function showItemMenu() {
    document.getElementById('bt-actions').style.display = 'none';
    document.getElementById('bt-item-menu').style.display = 'block';

    const list = document.getElementById('bt-item-list');
    list.innerHTML = '';

    // Consumables
    const consumables = ['potion', 'hi_potion', 'elixir'];
    consumables.forEach(id => {
      const count = Game.getItem(id);
      if (count <= 0) return;
      const item = D.ITEMS[id];
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.innerHTML = `${item.name}<span class="item-count">x${count}</span>`;
      btn.addEventListener('click', () => {
        document.getElementById('bt-item-menu').style.display = 'none';
        BattleEngine.playerUseItem(id);
        afterAction();
      });
      list.appendChild(btn);
    });

    // Balls (only show if capture possible)
    if (BattleEngine.canCapture()) {
      ['ball_normal', 'ball_great', 'ball_ultra'].forEach(id => {
        const count = Game.getItem(id);
        if (count <= 0) return;
        const item = D.ITEMS[id];
        const btn = document.createElement('button');
        btn.className = 'btn success';
        btn.innerHTML = `${item.name}<span class="item-count">x${count}</span>`;
        btn.addEventListener('click', () => {
          document.getElementById('bt-item-menu').style.display = 'none';
          BattleEngine.playerCapture(id);
          afterAction();
        });
        list.appendChild(btn);
      });
    }

    if (list.children.length === 0) {
      list.innerHTML = '<div style="color:#888;font-size:13px">使えるアイテムがありません</div>';
    }
  }

  function showSwitchMenu() {
    document.getElementById('bt-actions').style.display = 'none';
    document.getElementById('bt-switch-menu').style.display = 'block';

    const bs = BattleEngine.getState();
    const list = document.getElementById('bt-switch-list');
    list.innerHTML = '';

    bs.playerParty.forEach((mon, idx) => {
      if (idx === bs.currentPlayerIndex || mon.battleHp <= 0) return;
      const stats = Game.getEffStats(mon);
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = `${mon.nickname} Lv.${mon.level}  HP ${mon.battleHp}/${stats.maxHp}`;
      btn.addEventListener('click', () => {
        document.getElementById('bt-switch-menu').style.display = 'none';
        BattleEngine.playerSwitch(idx);
        afterAction();
      });
      list.appendChild(btn);
    });
  }

  function afterAction() {
    const bs = BattleEngine.getState();

    renderBattle();

    if (bs.phase === 'result') {
      showBattleResult();
    }
  }

  function showBattleResult() {
    const bs = BattleEngine.getState();
    const overlay = document.getElementById('bt-result');
    const box = document.getElementById('bt-result-box');
    overlay.style.display = 'flex';

    if (bs.result === 'win') {
      box.className = 'battle-result-box win';
      const rewards = BattleEngine.getBattleRewards();
      const levelUps = BattleEngine.applyRewards(rewards);

      // Check if demon was defeated
      const defeatedDemon = bs.enemyParty.some(m => m.type === 'demon');
      if (defeatedDemon && !Game.getState().player.defeatDemon) {
        Game.getState().player.defeatDemon = true;
        Game.autoSave();
      }

      // Check achievements
      const newAch = Systems.checkAchievements();
      if (bs.noDamageTaken) {
        const nda = Systems.checkNoDamageAchievement();
        if (nda) newAch.push(nda);
      }

      let html = '<div class="result-title win">VICTORY!</div>';
      html += '<div class="result-rewards">';
      html += `<div><span class="reward-label">獲得EXP:</span> <span class="reward-val">${rewards.totalExp}</span></div>`;
      html += `<div><span class="reward-label">獲得ゴールド:</span> <span class="reward-val">${rewards.totalGold} G</span></div>`;
      if (rewards.fragments.length > 0) {
        const fragNames = rewards.fragments.map(t => D.MONSTER_TYPES[t].name + 'の欠片');
        html += `<div class="reward-fragment">素材ドロップ: ${fragNames.join(', ')}</div>`;
      }
      if (levelUps.length > 0) {
        html += `<div class="reward-lvup">レベルアップ！ ${levelUps.join(', ')}</div>`;
      }
      if (bs.capturedMonster) {
        html += `<div class="reward-capture">${bs.capturedMonster.nickname} を捕獲！ボックスに追加しました</div>`;
      }
      html += '</div>';

      if (newAch.length > 0) {
        html += '<div class="result-achievements">';
        for (const a of newAch) {
          html += `<div class="ach-item"><span class="ach-name">${a.name}</span> - <span class="ach-desc">${a.desc}</span>${a.reward ? ` (+${a.reward}G)` : ''}</div>`;
        }
        html += '</div>';
      }

      // NG+ offer if demon defeated and not already in NG+
      if (defeatedDemon && !Game.getState().ngPlus) {
        html += '<div style="margin-top:12px;padding:12px;background:rgba(255,215,0,0.08);border:1px solid #FFD54F;border-radius:8px">';
        html += '<div style="color:#FFD54F;font-weight:bold;font-size:14px">魔王を倒した！</div>';
        html += '<div style="color:#ccc;font-size:12px;margin:6px 0">NG+モードが解放されました。敵が1.5倍強くなりますが、パーティとアイテムを引き継いで冒険できます。</div>';
        html += '<button class="btn warn" id="bt-ngplus" style="margin-top:6px;width:100%">NG+を開始する</button>';
        html += '</div>';
      }

      html += '<button class="btn primary" id="bt-result-ok" style="margin-top:8px;width:100%">ワールドマップに戻る</button>';
      box.innerHTML = html;

      // NG+ button handler
      const ngBtn = document.getElementById('bt-ngplus');
      if (ngBtn) {
        ngBtn.addEventListener('click', () => {
          Game.enableNGPlus();
          showToast('NG+モードが開始された！敵が1.5倍強くなる！');
          showScreen('worldmap');
          renderWorldMap();
        });
      }

    } else {
      box.className = 'battle-result-box lose';
      const lostGold = BattleEngine.applyLoss();

      let html = '<div class="result-title lose">DEFEAT...</div>';
      html += '<div class="result-rewards">';
      html += `<div class="reward-lost">${lostGold} ゴールドを失った...</div>`;
      html += '<div style="color:#888;margin-top:8px">パーティのHPが50%まで回復しました</div>';
      html += '</div>';
      html += '<button class="btn danger" id="bt-result-ok" style="margin-top:8px;width:100%">ワールドマップに戻る</button>';
      box.innerHTML = html;
    }

    document.getElementById('bt-result-ok').addEventListener('click', () => {
      showScreen('worldmap');
      renderWorldMap();
    });
  }

  let battleBound = false;
  function bindBattleActions() {
    if (battleBound) return;
    battleBound = true;

    document.getElementById('bt-btn-attack').addEventListener('click', () => {
      const bs = BattleEngine.getState();
      // If only 1 enemy alive, attack directly
      const alive = bs.enemyParty.filter(m => m.battleHp > 0);
      if (alive.length === 1) {
        const idx = bs.enemyParty.indexOf(alive[0]);
        BattleEngine.playerAttack(idx);
        afterAction();
      } else {
        showTargetMenu('attack');
      }
    });

    document.getElementById('bt-btn-guard').addEventListener('click', () => {
      BattleEngine.playerGuard();
      afterAction();
    });

    document.getElementById('bt-btn-special').addEventListener('click', () => {
      if (!BattleEngine.canSpecial()) return;
      const bs = BattleEngine.getState();
      const alive = bs.enemyParty.filter(m => m.battleHp > 0);
      if (alive.length === 1) {
        const idx = bs.enemyParty.indexOf(alive[0]);
        BattleEngine.playerSpecial(idx);
        afterAction();
      } else {
        showTargetMenu('special');
      }
    });

    document.getElementById('bt-btn-item').addEventListener('click', showItemMenu);
    document.getElementById('bt-btn-capture').addEventListener('click', showItemMenu);
    document.getElementById('bt-btn-switch').addEventListener('click', showSwitchMenu);

    document.getElementById('bt-target-cancel').addEventListener('click', () => {
      hideAllSubmenus();
      document.getElementById('bt-actions').style.display = 'flex';
      updateActionButtons();
    });
    document.getElementById('bt-item-cancel').addEventListener('click', () => {
      document.getElementById('bt-item-menu').style.display = 'none';
      document.getElementById('bt-actions').style.display = 'flex';
      updateActionButtons();
    });
    document.getElementById('bt-switch-cancel').addEventListener('click', () => {
      document.getElementById('bt-switch-menu').style.display = 'none';
      document.getElementById('bt-actions').style.display = 'flex';
      updateActionButtons();
    });
  }

  // ================================================================
  // PARTY EDIT SCREEN
  // ================================================================

  function openPartyScreen() {
    showScreen('party');
    renderPartyEdit();
  }

  function renderPartyEdit() {
    const state = Game.getState();

    document.getElementById('party-count').textContent = state.party.length;
    document.getElementById('pe-box-count').textContent = state.box.length + ' 体';

    // Party slots
    const partyList = document.getElementById('pe-party-list');
    partyList.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const mon = state.party[i];
      if (mon) {
        partyList.appendChild(createMonCard(mon, true));
      } else {
        const ph = document.createElement('div');
        ph.className = 'party-slot-placeholder';
        ph.textContent = '-- 空きスロット --';
        partyList.appendChild(ph);
      }
    }

    // Box list (for adding to party)
    const boxList = document.getElementById('pe-box-list');
    boxList.innerHTML = '';
    if (state.box.length === 0) {
      boxList.innerHTML = '<div style="color:#666;font-size:13px;padding:12px">ボックスにモンスターがいません</div>';
    }
    state.box.forEach(mon => {
      boxList.appendChild(createMonCard(mon, false));
    });
  }

  function createMonCard(mon, isInParty) {
    const stats = Game.getEffStats(mon);
    const md = D.MONSTER_TYPES[mon.type];
    const hpPct = Math.max(0, (mon.hp / stats.maxHp) * 100);
    const hpColor = hpPct > 50 ? '#4CAF50' : hpPct > 25 ? '#FF9800' : '#F44336';

    const card = document.createElement('div');
    card.className = 'mon-card' + (isInParty ? ' in-party' : '');

    const canvas = document.createElement('canvas');
    canvas.width = 56;
    canvas.height = 56;
    MonsterCanvas.drawMonster(canvas, mon.type, mon.stage, mon.synthTraits || []);

    const info = document.createElement('div');
    info.className = 'mon-card-info';

    const traitNames = mon.traits
      .filter(Boolean)
      .map(t => D.TRAITS[t]?.name || '')
      .filter(Boolean)
      .join(' / ');

    info.innerHTML = `
      <div class="mon-card-name">${mon.nickname}</div>
      <div class="mon-card-sub">Lv.${mon.level}  世代${mon.generation}  ${md.name}</div>
      <div class="mon-card-stats">
        HP:<span>${stats.maxHp}</span> ATK:<span>${stats.atk}</span>
        DEF:<span>${stats.def}</span> SPD:<span>${stats.spd}</span>
      </div>
      <div class="mon-card-hp"><div class="hp-fill" style="width:${hpPct}%;background:${hpColor}"></div></div>
      ${traitNames ? `<div class="mon-card-traits">${traitNames}</div>` : ''}
    `;

    const actions = document.createElement('div');
    actions.className = 'mon-card-actions';

    if (isInParty) {
      // Can remove from party if more than 1 member
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn danger';
      removeBtn.textContent = '外す';
      removeBtn.addEventListener('click', () => {
        if (Game.getState().party.length <= 1) {
          showToast('パーティには最低1体必要です');
          return;
        }
        Game.removeFromParty(mon.id);
        Game.autoSave();
        renderPartyEdit();
      });
      actions.appendChild(removeBtn);
    } else {
      // Can add to party if less than 3
      const addBtn = document.createElement('button');
      addBtn.className = 'btn primary';
      addBtn.textContent = '追加';
      if (Game.getState().party.length >= 3) {
        addBtn.disabled = true;
      }
      addBtn.addEventListener('click', () => {
        if (Game.getState().party.length >= 3) {
          showToast('パーティは最大3体です');
          return;
        }
        Game.addToParty(mon.id);
        Game.autoSave();
        renderPartyEdit();
        showToast(mon.nickname + ' をパーティに追加！');
      });
      actions.appendChild(addBtn);
    }

    card.appendChild(canvas);
    card.appendChild(info);
    card.appendChild(actions);
    return card;
  }

  // ================================================================
  // BOX SCREEN
  // ================================================================

  function openBoxScreen() {
    showScreen('box');
    renderBox();
  }

  function renderBox() {
    const state = Game.getState();
    const all = Game.getAllMonsters();
    document.getElementById('box-total').textContent = all.length + ' / 53';

    const grid = document.getElementById('bx-grid');
    grid.innerHTML = '';

    // Show party members first, then box
    const partyIds = new Set(state.party.map(m => m.id));

    all.forEach(mon => {
      const inParty = partyIds.has(mon.id);
      const card = document.createElement('div');
      card.className = 'box-card' + (inParty ? ' is-party' : '');

      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      MonsterCanvas.drawMonster(canvas, mon.type, mon.stage, mon.synthTraits || []);

      card.innerHTML = '';
      card.appendChild(canvas);

      const name = document.createElement('div');
      name.className = 'box-card-name';
      name.textContent = mon.nickname;
      card.appendChild(name);

      const level = document.createElement('div');
      level.className = 'box-card-level';
      level.textContent = 'Lv.' + mon.level;
      card.appendChild(level);

      if (inParty) {
        const badge = document.createElement('div');
        badge.className = 'box-card-badge';
        badge.textContent = 'PARTY';
        card.appendChild(badge);
      }

      card.addEventListener('click', () => showMonDetail(mon, inParty));
      grid.appendChild(card);
    });

    if (all.length === 0) {
      grid.innerHTML = '<div style="color:#666;font-size:14px;padding:24px;grid-column:1/-1;text-align:center">モンスターがいません</div>';
    }
  }

  function showMonDetail(mon, isInParty) {
    const overlay = document.getElementById('bx-detail');
    const box = document.getElementById('bx-detail-box');
    overlay.style.display = 'flex';

    const stats = Game.getEffStats(mon);
    const md = D.MONSTER_TYPES[mon.type];
    const hpPct = Math.max(0, (mon.hp / stats.maxHp) * 100);
    const hpColor = hpPct > 50 ? '#4CAF50' : hpPct > 25 ? '#FF9800' : '#F44336';

    let html = '';

    // Canvas placeholder
    html += '<div id="bx-detail-canvas-wrap" style="margin:0 auto 8px"></div>';

    html += `<div class="detail-name">${mon.nickname}</div>`;
    html += `<div class="detail-level">Lv.${mon.level}  ${md.name}  世代${mon.generation}</div>`;
    html += `<div style="margin:4px 0 8px"><div class="battle-hp-bar" style="width:60%;margin:0 auto"><div class="hp-fill" style="width:${hpPct}%;background:${hpColor}"></div></div><div style="font-size:11px;color:#888;margin-top:2px">HP ${mon.hp} / ${stats.maxHp}</div></div>`;

    html += `<div class="detail-stats-grid">
      <div class="detail-stat"><div class="ds-label">HP</div><div class="ds-val">${stats.maxHp}</div></div>
      <div class="detail-stat"><div class="ds-label">ATK</div><div class="ds-val">${stats.atk}</div></div>
      <div class="detail-stat"><div class="ds-label">DEF</div><div class="ds-val">${stats.def}</div></div>
      <div class="detail-stat"><div class="ds-label">SPD</div><div class="ds-val">${stats.spd}</div></div>
    </div>`;

    // EXP
    html += `<div style="font-size:12px;color:#78909C;text-align:left;margin:4px 0">EXP: ${mon.exp} / ${D.expToLevel(mon.level)}  |  SP: ${mon.skillPoints}pt</div>`;

    // Traits
    const allTraits = [...(mon.traits || []), ...(mon.synthTraits || [])].filter(Boolean);
    if (allTraits.length > 0) {
      const traitText = allTraits.map(t => {
        const td = D.TRAITS[t];
        return td ? `${td.name}: ${td.description}` : t;
      }).join('<br>');
      html += `<div class="detail-traits">特性:<br>${traitText}</div>`;
    }

    // Equipment slots
    html += `<div class="detail-equip-section" id="bx-equip-section"></div>`;

    // Pedigree
    if (mon.pedigree?.parent1) {
      html += `<div class="detail-pedigree">血統:<br>`;
      html += `  親1: ${mon.pedigree.parent1.name} Lv.${mon.pedigree.parent1.level}<br>`;
      html += `  親2: ${mon.pedigree.parent2.name} Lv.${mon.pedigree.parent2.level}`;
      html += `</div>`;
    }

    // Buttons
    html += '<div class="detail-btns">';
    if (isInParty) {
      html += `<button class="btn danger" id="bx-detail-remove">パーティから外す</button>`;
    } else {
      html += `<button class="btn primary" id="bx-detail-add">パーティに追加</button>`;
    }
    html += `<button class="btn" id="bx-detail-close">閉じる</button>`;
    html += '</div>';

    box.innerHTML = html;

    // Draw canvas
    const wrap = document.getElementById('bx-detail-canvas-wrap');
    const c = document.createElement('canvas');
    c.width = 120;
    c.height = 120;
    MonsterCanvas.drawMonster(c, mon.type, mon.stage, mon.synthTraits || []);
    wrap.appendChild(c);

    // Button events
    document.getElementById('bx-detail-close').addEventListener('click', () => {
      overlay.style.display = 'none';
    });

    const addBtn = document.getElementById('bx-detail-add');
    if (addBtn) {
      if (Game.getState().party.length >= 3) addBtn.disabled = true;
      addBtn.addEventListener('click', () => {
        if (Game.getState().party.length >= 3) {
          showToast('パーティは最大3体です');
          return;
        }
        Game.addToParty(mon.id);
        Game.autoSave();
        overlay.style.display = 'none';
        renderBox();
        showToast(mon.nickname + ' をパーティに追加！');
      });
    }

    const removeBtn = document.getElementById('bx-detail-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (Game.getState().party.length <= 1) {
          showToast('パーティには最低1体必要です');
          return;
        }
        Game.removeFromParty(mon.id);
        Game.autoSave();
        overlay.style.display = 'none';
        renderBox();
        showToast(mon.nickname + ' をボックスに戻しました');
      });
    }

    // Equipment UI
    renderEquipSlots(mon, isInParty);
  }

  function renderEquipSlots(mon, isInParty) {
    const section = document.getElementById('bx-equip-section');
    if (!section) return;

    const state = Game.getState();
    if (!mon.equipment) mon.equipment = { weapon: null, armor: null };

    const slots = [
      { slot: 'weapon', label: '武器', icon: '🗡' },
      { slot: 'armor',  label: '防具', icon: '🛡' },
    ];

    let html = '<div class="equip-title">装備</div>';

    for (const { slot, label, icon } of slots) {
      const equipped = mon.equipment[slot];
      const equippedItem = equipped ? D.ITEMS[equipped] : null;

      html += `<div class="equip-slot-row">`;
      html += `<span class="equip-slot-icon">${icon}</span>`;
      html += `<span class="equip-slot-label">${label}:</span>`;

      if (equippedItem) {
        html += `<span class="equip-slot-name">${equippedItem.name}</span>`;
        html += `<span class="equip-slot-desc">(${equippedItem.desc})</span>`;
        html += `<button class="btn equip-remove-btn" data-slot="${slot}">外す</button>`;
      } else {
        html += `<span class="equip-slot-empty">なし</span>`;
      }

      // Available items to equip
      const available = Object.entries(D.ITEMS)
        .filter(([id, item]) => item.type === slot && Game.getItem(id) > 0)
        .map(([id, item]) => ({ id, ...item }));

      if (available.length > 0) {
        html += `<select class="equip-select" data-slot="${slot}">`;
        html += `<option value="">-- 選択 --</option>`;
        for (const item of available) {
          html += `<option value="${item.id}">${item.name} (${item.desc}) ×${Game.getItem(item.id)}</option>`;
        }
        html += `</select>`;
        html += `<button class="btn equip-set-btn" data-slot="${slot}">装着</button>`;
      }

      html += `</div>`;
    }

    section.innerHTML = html;

    // Equip button events
    section.querySelectorAll('.equip-set-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = btn.dataset.slot;
        const select = section.querySelector(`.equip-select[data-slot="${slot}"]`);
        const itemId = select?.value;
        if (!itemId) return;

        // Return currently equipped item to inventory
        if (mon.equipment[slot]) {
          Game.addItem(mon.equipment[slot]);
        }
        // Consume from inventory and equip
        Game.useItem(itemId);
        mon.equipment[slot] = itemId;
        Game.autoSave();

        // Refresh stats display and equip UI
        refreshDetailStats(mon);
        renderEquipSlots(mon, isInParty);
        showToast(`${D.ITEMS[itemId].name}を装備した！`);
      });
    });

    // Unequip button events
    section.querySelectorAll('.equip-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = btn.dataset.slot;
        const itemId = mon.equipment[slot];
        if (!itemId) return;

        Game.addItem(itemId);
        mon.equipment[slot] = null;
        Game.autoSave();

        refreshDetailStats(mon);
        renderEquipSlots(mon, isInParty);
        showToast(`${D.ITEMS[itemId].name}を外した！`);
      });
    });
  }

  function refreshDetailStats(mon) {
    const stats = Game.getEffStats(mon);
    const grid = document.querySelector('.detail-stats-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="detail-stat"><div class="ds-label">HP</div><div class="ds-val">${stats.maxHp}</div></div>
        <div class="detail-stat"><div class="ds-label">ATK</div><div class="ds-val">${stats.atk}</div></div>
        <div class="detail-stat"><div class="ds-label">DEF</div><div class="ds-val">${stats.def}</div></div>
        <div class="detail-stat"><div class="ds-label">SPD</div><div class="ds-val">${stats.spd}</div></div>
      `;
    }
  }

  // ================================================================
  // SHOP SCREEN
  // ================================================================

  const SHOP_ICONS = {
    consumable: { bg: '#1B5E20', icon: '💊' },
    ball:       { bg: '#1565C0', icon: '🔴' },
    weapon:     { bg: '#4E342E', icon: '🗡' },
    armor:      { bg: '#37474F', icon: '🛡' },
  };

  function openShopScreen() {
    showScreen('shop');
    renderShop();
  }

  function renderShop() {
    const state = Game.getState();
    document.getElementById('shop-gold').textContent = state.player.gold.toLocaleString() + ' G';

    const list = document.getElementById('shop-list');
    list.innerHTML = '';

    const maxUnlockedArea = Math.max(...state.unlockedAreas);

    D.SHOP_INVENTORY.forEach(entry => {
      const item = D.ITEMS[entry.id];
      if (!item) return;
      const locked = entry.unlockArea > maxUnlockedArea;

      const row = document.createElement('div');
      row.className = 'shop-item';
      if (locked) row.style.opacity = '0.3';

      const iconInfo = SHOP_ICONS[item.type] || SHOP_ICONS.consumable;

      const icon = document.createElement('div');
      icon.className = 'shop-item-icon';
      icon.style.background = iconInfo.bg;
      icon.textContent = iconInfo.icon;

      const info = document.createElement('div');
      info.className = 'shop-item-info';
      const owned = Game.getItem(entry.id);
      info.innerHTML = `
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.desc}</div>
        <div class="shop-item-owned">所持: ${owned}個</div>
      `;

      const right = document.createElement('div');
      right.className = 'shop-item-right';

      const price = document.createElement('div');
      price.className = 'shop-item-price';
      price.textContent = item.buyPrice + ' G';
      right.appendChild(price);

      if (!locked) {
        const buyBtn = document.createElement('button');
        buyBtn.className = 'btn primary';
        buyBtn.textContent = '購入';
        if (state.player.gold < item.buyPrice) {
          buyBtn.disabled = true;
        }
        buyBtn.addEventListener('click', () => {
          if (Game.spendGold(item.buyPrice)) {
            Game.addItem(entry.id);
            Game.autoSave();
            showToast(item.name + ' を購入！');
            renderShop();
          } else {
            showToast('ゴールドが足りません');
          }
        });
        right.appendChild(buyBtn);
      } else {
        const lockLabel = document.createElement('div');
        lockLabel.style.cssText = 'font-size:11px;color:#EF5350';
        lockLabel.textContent = 'エリア' + (entry.unlockArea + 1) + '解放後';
        right.appendChild(lockLabel);
      }

      row.appendChild(icon);
      row.appendChild(info);
      row.appendChild(right);
      list.appendChild(row);
    });
  }

  // ================================================================
  // SYNTHESIS SCREEN
  // ================================================================

  let synthTarget = null;

  function openSynthScreen() {
    showScreen('synthesis');
    synthTarget = null;
    renderSynthStep1();
  }

  function renderSynthStep1() {
    document.getElementById('synth-step1').style.display = '';
    document.getElementById('synth-step2').style.display = 'none';
    document.getElementById('synth-step3').style.display = 'none';

    const list = document.getElementById('synth-mon-list');
    list.innerHTML = '';

    const all = Game.getAllMonsters();
    if (all.length === 0) {
      list.innerHTML = '<div style="color:#666;font-size:13px;padding:12px">モンスターがいません</div>';
      return;
    }

    all.forEach(mon => {
      const synthCount = (mon.synthTraits || []).length;
      const card = document.createElement('div');
      card.className = 'mon-card';
      card.style.cursor = 'pointer';

      const canvas = document.createElement('canvas');
      canvas.width = 56;
      canvas.height = 56;
      MonsterCanvas.drawMonster(canvas, mon.type, mon.stage, mon.synthTraits || []);

      const info = document.createElement('div');
      info.className = 'mon-card-info';
      const synthLabel = synthCount >= 3
        ? '<span style="color:#EF5350">合成上限(3/3)</span>'
        : `<span style="color:#CE93D8">合成${synthCount}/3</span>`;
      info.innerHTML = `
        <div class="mon-card-name">${mon.nickname}</div>
        <div class="mon-card-sub">Lv.${mon.level}  ${D.MONSTER_TYPES[mon.type].name}  ${synthLabel}</div>
      `;

      card.appendChild(canvas);
      card.appendChild(info);

      if (synthCount < 3) {
        card.addEventListener('click', () => {
          synthTarget = mon;
          renderSynthStep2();
        });
      } else {
        card.style.opacity = '0.4';
        card.style.cursor = 'not-allowed';
      }

      list.appendChild(card);
    });
  }

  function renderSynthStep2() {
    document.getElementById('synth-step1').style.display = 'none';
    document.getElementById('synth-step2').style.display = '';
    document.getElementById('synth-step3').style.display = 'none';

    const mon = synthTarget;
    const selectedEl = document.getElementById('synth-selected');
    selectedEl.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.width = 56;
    canvas.height = 56;
    MonsterCanvas.drawMonster(canvas, mon.type, mon.stage, mon.synthTraits || []);
    selectedEl.appendChild(canvas);

    const info = document.createElement('div');
    info.className = 'synth-selected-info';
    const currentTraits = (mon.synthTraits || [])
      .map(t => D.TRAITS[t]?.name || t).join(', ') || 'なし';
    info.innerHTML = `
      <div class="ss-name">${mon.nickname}</div>
      <div class="ss-sub">Lv.${mon.level} | 合成特性: ${currentTraits}</div>
    `;
    selectedEl.appendChild(info);

    // Fragment list
    const fragList = document.getElementById('synth-frag-list');
    fragList.innerHTML = '';

    const fragments = Game.getState().fragments;
    const types = Object.keys(D.MONSTER_TYPES);
    let hasAny = false;

    types.forEach(type => {
      const count = fragments[type] || 0;
      if (count <= 0) return;
      hasAny = true;

      const md = D.MONSTER_TYPES[type];
      const traitId = md.traits[0];
      const trait = D.TRAITS[traitId];
      const canSynth = Systems.canSynthesize(mon, type);

      const row = document.createElement('div');
      row.className = 'synth-frag-item';

      const fc = document.createElement('canvas');
      fc.width = 44;
      fc.height = 44;
      MonsterCanvas.drawMonster(fc, type, 0);

      const finfo = document.createElement('div');
      finfo.className = 'synth-frag-info';
      finfo.innerHTML = `
        <div class="synth-frag-name">${md.name}の欠片</div>
        <div class="synth-frag-count">所持: ${count}個 (3個必要)</div>
        <div class="synth-frag-trait">吸収特性: ${trait ? trait.name + ' - ' + trait.description : '不明'}</div>
      `;

      const btn = document.createElement('button');
      btn.className = 'btn primary';
      btn.textContent = '合成';
      if (!canSynth) {
        btn.disabled = true;
        if (count < 3) btn.textContent = '不足';
        else btn.textContent = '済み';
      }
      btn.addEventListener('click', () => {
        if (Systems.synthesize(mon, type)) {
          renderSynthResult(mon, traitId);
        }
      });

      row.appendChild(fc);
      row.appendChild(finfo);
      row.appendChild(btn);
      fragList.appendChild(row);
    });

    if (!hasAny) {
      fragList.innerHTML = '<div style="color:#666;font-size:13px;padding:12px">欠片がありません。バトルで敵を倒すと低確率でドロップします。</div>';
    }
  }

  function renderSynthResult(mon, traitId) {
    document.getElementById('synth-step1').style.display = 'none';
    document.getElementById('synth-step2').style.display = 'none';
    document.getElementById('synth-step3').style.display = '';

    const trait = D.TRAITS[traitId];
    const resultEl = document.getElementById('synth-result');

    let html = '<div class="synth-result-title">合成成功！</div>';

    // Draw updated monster
    html += '<div id="synth-result-canvas" style="margin:0 auto 12px"></div>';

    html += `<div style="font-size:16px;color:#fff;font-weight:bold;margin-bottom:4px">${mon.nickname}</div>`;
    html += '<div class="synth-result-trait">';
    html += `<div class="srt-name">${trait.name} を吸収！</div>`;
    html += `<div class="srt-desc">${trait.description}</div>`;
    html += '</div>';

    const allSynth = (mon.synthTraits || []).map(t => D.TRAITS[t]?.name || t).join(', ');
    html += `<div style="font-size:13px;color:#aaa;margin:8px 0">合成特性: ${allSynth}  (${mon.synthTraits.length}/3)</div>`;

    html += '<div style="display:flex;gap:8px;justify-content:center;margin-top:16px">';
    html += '<button class="btn primary" id="synth-continue">続けて合成</button>';
    html += '<button class="btn" id="synth-done">戻る</button>';
    html += '</div>';

    resultEl.innerHTML = html;

    // Draw canvas
    const wrap = document.getElementById('synth-result-canvas');
    const c = document.createElement('canvas');
    c.width = 120;
    c.height = 120;
    MonsterCanvas.drawMonster(c, mon.type, mon.stage, mon.synthTraits || []);
    wrap.appendChild(c);

    document.getElementById('synth-continue').addEventListener('click', () => {
      renderSynthStep2();
    });
    document.getElementById('synth-done').addEventListener('click', () => {
      showScreen('worldmap');
      renderWorldMap();
    });
  }

  // ---- Achievement Screen ----
  function openAchievementScreen() {
    showScreen('achievement');
    renderAchievements();
  }

  function renderAchievements() {
    const state = Game.getState();
    const grid = document.getElementById('ach-grid');
    grid.innerHTML = '';

    const earned = state.achievements;
    const total = D.ACHIEVEMENTS.length;
    document.getElementById('ach-progress').textContent = `${earned.length}/${total}`;

    const achIcons = {
      first_win: '⚔️', first_capture: '🎯', party_full: '👥', box_25: '📦', box_50: '📦',
      win_10: '🏅', win_50: '🏅', win_100: '🏆', capture_10: '🎯', capture_30: '🎯',
      first_evolve: '✨', max_evolve: '🌟', first_breed: '🧬', breed_10: '🧬',
      all_areas: '🗺️', all_monsters: '📖', first_synthesis: '🔮', skill_master: '📚',
      rich: '💰', defeat_demon: '👹', ng_plus: '🔁', generation_3: '👶',
      no_damage_win: '🛡️', level_30: '💪', level_50: '👑',
    };

    D.ACHIEVEMENTS.forEach(ach => {
      const isEarned = earned.includes(ach.id);
      const card = document.createElement('div');
      card.className = 'ach-card' + (isEarned ? ' earned' : ' locked');
      card.innerHTML = `
        <div class="ach-icon">${achIcons[ach.id] || '🏅'}</div>
        <div class="ach-info">
          <div class="ach-name">${ach.name}</div>
          <div class="ach-desc">${ach.desc}</div>
          ${ach.reward > 0 ? `<div class="ach-reward">報酬: ${ach.reward}G</div>` : ''}
        </div>
        <div class="ach-status">${isEarned ? '✅' : '🔒'}</div>
      `;
      grid.appendChild(card);
    });
  }

  // ---- Skill Tree Screen ----
  let skillSelectedMon = null;
  let skillSelectedRoute = 'atk';

  function openSkillScreen() {
    showScreen('skill');
    skillSelectedMon = null;
    skillSelectedRoute = 'atk';
    renderSkillMonList();
    document.getElementById('sk-mon-info').style.display = 'none';
    document.getElementById('sk-tree').style.display = 'none';

    // Tab clicks
    document.querySelectorAll('.skill-tab').forEach(tab => {
      tab.onclick = () => {
        skillSelectedRoute = tab.dataset.route;
        document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderSkillNodes();
      };
    });
  }

  function renderSkillMonList() {
    const list = document.getElementById('sk-mon-list');
    list.innerHTML = '';
    const allMons = Game.getAllMonsters();
    if (allMons.length === 0) {
      list.innerHTML = '<div style="color:#888;padding:20px">モンスターがいません</div>';
      return;
    }
    allMons.forEach(mon => {
      const md = D.MONSTER_TYPES[mon.type];
      const div = document.createElement('div');
      div.className = 'skill-mon-btn' + (skillSelectedMon && skillSelectedMon.id === mon.id ? ' selected' : '');
      div.innerHTML = `<div class="sk-mon-canvas"></div>
        <div class="sk-mon-name">${mon.nickname}</div>
        <div class="sk-mon-pts">SP: ${mon.skillPoints || 0}</div>`;
      const c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      MonsterCanvas.drawMonster(c, mon.type, mon.stage, mon.synthTraits || []);
      div.querySelector('.sk-mon-canvas').appendChild(c);
      div.addEventListener('click', () => {
        skillSelectedMon = mon;
        renderSkillMonList();
        renderSkillInfo();
        renderSkillNodes();
        document.getElementById('sk-mon-info').style.display = 'flex';
        document.getElementById('sk-tree').style.display = 'block';
      });
      list.appendChild(div);
    });
  }

  function renderSkillInfo() {
    const mon = skillSelectedMon;
    if (!mon) return;
    const md = D.MONSTER_TYPES[mon.type];
    const info = document.getElementById('sk-mon-info');
    const totalSkills = Systems.getSkillCount(mon);
    info.innerHTML = `
      <div>
        <div class="sk-info-name">${mon.nickname}</div>
        <div class="sk-info-detail">Lv.${mon.level} ${md.stages[mon.stage]} | スキル: ${totalSkills}/36</div>
      </div>
      <div style="margin-left:auto">
        <div class="sk-info-pts">スキルポイント: ${mon.skillPoints || 0}</div>
      </div>
    `;
  }

  function renderSkillNodes() {
    const container = document.getElementById('sk-nodes');
    container.innerHTML = '';
    if (!skillSelectedMon) return;

    const mon = skillSelectedMon;
    const route = skillSelectedRoute;
    const skills = D.SKILL_TREE[route];

    skills.forEach((skill, i) => {
      // Connector line (except before first)
      if (i > 0) {
        const conn = document.createElement('div');
        conn.className = 'skill-connector';
        container.appendChild(conn);
      }

      const learned = mon.skills[route].includes(skill.id);
      const canLearn = Systems.canLearnSkill(mon, skill.id);
      let stateClass = 'locked';
      if (learned) stateClass = 'learned';
      else if (canLearn) stateClass = 'available';

      const node = document.createElement('div');
      node.className = `skill-node ${stateClass}`;
      let statusText = '🔒 ロック中';
      if (learned) statusText = '✅ 習得済み';
      else if (canLearn) statusText = '⬆ タップで習得 (1SP)';

      node.innerHTML = `
        <div class="skill-node-name">${skill.name}</div>
        <div class="skill-node-desc">${skill.desc}</div>
        <div class="skill-node-status">${statusText}</div>
      `;

      if (canLearn) {
        node.addEventListener('click', () => {
          if (Systems.learnSkill(mon, skill.id)) {
            showToast(`${skill.name}を習得した！`);
            renderSkillInfo();
            renderSkillNodes();
            renderSkillMonList();
          }
        });
      }

      container.appendChild(node);
    });
  }

  // ---- Breeding Screen ----
  let breedParent1 = null;
  let breedParent2 = null;
  let breedSelectingSlot = null; // 1 or 2

  function openBreedScreen() {
    showScreen('breed');
    breedParent1 = null;
    breedParent2 = null;
    breedSelectingSlot = null;
    document.getElementById('breed-step1').style.display = 'block';
    document.getElementById('breed-step2').style.display = 'none';
    renderBreedParents();
    renderBreedMonList();

    document.getElementById('breed-parent1').onclick = () => {
      breedSelectingSlot = 1;
      renderBreedMonList();
    };
    document.getElementById('breed-parent2').onclick = () => {
      breedSelectingSlot = 2;
      renderBreedMonList();
    };
    document.getElementById('breed-start').onclick = () => {
      if (!breedParent1 || !breedParent2) return;
      if (!Systems.canBreed(breedParent1, breedParent2)) {
        showToast('繁殖条件を満たしていません');
        return;
      }
      const child = Systems.breed(breedParent1, breedParent2);
      if (!child) { showToast('繁殖に失敗しました'); return; }
      Systems.retireParents(breedParent1.id, breedParent2.id);
      Game.addToBox(child);
      renderBreedResult(child);
    };
  }

  function renderBreedParents() {
    const slot1 = document.getElementById('breed-parent1');
    const slot2 = document.getElementById('breed-parent2');

    if (breedParent1) {
      slot1.className = 'breed-parent-slot filled';
      slot1.innerHTML = `<div class="breed-slot-label">親1</div>
        <div class="breed-slot-canvas"></div>
        <div class="breed-slot-name">${breedParent1.nickname}</div>
        <div class="breed-slot-info">Lv.${breedParent1.level}</div>`;
      const c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      MonsterCanvas.drawMonster(c, breedParent1.type, breedParent1.stage, breedParent1.synthTraits || []);
      slot1.querySelector('.breed-slot-canvas').appendChild(c);
    } else {
      slot1.className = 'breed-parent-slot';
      slot1.innerHTML = `<div class="breed-slot-label">親1</div><div class="breed-slot-empty">タップで選択</div>`;
    }

    if (breedParent2) {
      slot2.className = 'breed-parent-slot filled';
      slot2.innerHTML = `<div class="breed-slot-label">親2</div>
        <div class="breed-slot-canvas"></div>
        <div class="breed-slot-name">${breedParent2.nickname}</div>
        <div class="breed-slot-info">Lv.${breedParent2.level}</div>`;
      const c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      MonsterCanvas.drawMonster(c, breedParent2.type, breedParent2.stage, breedParent2.synthTraits || []);
      slot2.querySelector('.breed-slot-canvas').appendChild(c);
    } else {
      slot2.className = 'breed-parent-slot';
      slot2.innerHTML = `<div class="breed-slot-label">親2</div><div class="breed-slot-empty">タップで選択</div>`;
    }

    // Enable/disable breed button
    const btn = document.getElementById('breed-start');
    btn.disabled = !(breedParent1 && breedParent2 && Systems.canBreed(breedParent1, breedParent2));
  }

  function renderBreedMonList() {
    const list = document.getElementById('breed-mon-list');
    list.innerHTML = '';
    const allMons = Game.getAllMonsters();

    // Filter: level >= 5 only
    const eligible = allMons.filter(m => m.level >= 5);
    if (eligible.length === 0) {
      list.innerHTML = '<div style="color:#888;padding:20px">Lv.5以上のモンスターがいません</div>';
      return;
    }

    eligible.forEach(mon => {
      const md = D.MONSTER_TYPES[mon.type];
      const isParent1 = breedParent1 && breedParent1.id === mon.id;
      const isParent2 = breedParent2 && breedParent2.id === mon.id;
      const isSelected = isParent1 || isParent2;

      // Check if selectable for current slot
      let disabled = false;
      if (breedSelectingSlot === 2 && breedParent1) {
        // Must be same type, different id
        if (mon.type !== breedParent1.type || mon.id === breedParent1.id) disabled = true;
      } else if (breedSelectingSlot === 1 && breedParent2) {
        if (mon.type !== breedParent2.type || mon.id === breedParent2.id) disabled = true;
      }
      if (isSelected) disabled = true;

      const div = document.createElement('div');
      div.className = 'breed-mon-card' + (isSelected ? ' selected' : '') + (disabled ? ' disabled' : '');
      div.innerHTML = `<div class="bm-canvas"></div>
        <div class="bm-name">${mon.nickname}</div>
        <div class="bm-info">Lv.${mon.level} ${md.name}</div>`;
      const c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      MonsterCanvas.drawMonster(c, mon.type, mon.stage, mon.synthTraits || []);
      div.querySelector('.bm-canvas').appendChild(c);

      if (!disabled) {
        div.addEventListener('click', () => {
          if (breedSelectingSlot === 1 || (!breedSelectingSlot && !breedParent1)) {
            breedParent1 = mon;
            breedSelectingSlot = null;
            // If parent2 is set but wrong type, clear it
            if (breedParent2 && breedParent2.type !== mon.type) breedParent2 = null;
          } else if (breedSelectingSlot === 2 || (!breedSelectingSlot && !breedParent2)) {
            breedParent2 = mon;
            breedSelectingSlot = null;
          }
          renderBreedParents();
          renderBreedMonList();
        });
      }

      list.appendChild(div);
    });
  }

  function renderBreedResult(child) {
    document.getElementById('breed-step1').style.display = 'none';
    document.getElementById('breed-step2').style.display = 'block';

    const md = D.MONSTER_TYPES[child.type];
    const result = document.getElementById('breed-result');

    let html = `<div class="breed-result-title">子モンスター誕生！</div>`;
    const c = document.createElement('canvas');
    c.width = 100; c.height = 100;

    html += `<div id="breed-child-canvas-wrap"></div>`;
    html += `<div class="breed-child-info">`;
    html += `<div class="breed-child-name">${child.nickname}</div>`;
    html += `<div class="breed-child-stat">`;
    html += `世代: <span class="bonus">${child.generation}</span><br>`;
    const bonus = child.statBonus || {};
    if (bonus.hp) html += `HP補正: <span class="bonus">+${bonus.hp}</span><br>`;
    if (bonus.atk) html += `ATK補正: <span class="bonus">+${bonus.atk}</span><br>`;
    if (bonus.def) html += `DEF補正: <span class="bonus">+${bonus.def}</span><br>`;
    if (bonus.spd) html += `SPD補正: <span class="bonus">+${bonus.spd}</span><br>`;
    if (child.traits.length > 0) {
      html += `特性: ${child.traits.map(t => D.TRAITS[t]?.name || t).join(', ')}<br>`;
    }
    if (child.synthTraits && child.synthTraits.length > 0) {
      html += `合成特性: ${child.synthTraits.map(t => D.TRAITS[t]?.name || t).join(', ')}<br>`;
    }
    html += `</div></div>`;

    // Pedigree display
    if (child.pedigree) {
      html += `<div class="breed-pedigree">`;
      html += `<div class="breed-pedigree-title">家系図</div>`;
      html += `<div class="pedigree-tree">`;
      html += renderPedigreeNode(child.pedigree, 0);
      html += `</div></div>`;
    }

    html += `<button class="btn primary" id="breed-done" style="margin-top:16px">戻る</button>`;
    result.innerHTML = html;

    // Draw canvas
    const wrap = document.getElementById('breed-child-canvas-wrap');
    if (wrap) {
      MonsterCanvas.drawMonster(c, child.type, child.stage, child.synthTraits || []);
      wrap.appendChild(c);
    }

    document.getElementById('breed-done').addEventListener('click', () => {
      showScreen('worldmap');
      renderWorldMap();
    });
  }

  function renderPedigreeNode(pedigree, depth) {
    if (!pedigree || depth > 2) return '';
    const indent = '　'.repeat(depth);
    let html = '';
    if (pedigree.parent1) {
      html += `${indent}<span class="ped-parent">├ ${pedigree.parent1.name}</span> (Lv.${pedigree.parent1.level} 第${pedigree.parent1.generation}世代)<br>`;
      if (pedigree.parent1.pedigree) html += renderPedigreeNode(pedigree.parent1.pedigree, depth + 1);
    }
    if (pedigree.parent2) {
      html += `${indent}<span class="ped-parent">└ ${pedigree.parent2.name}</span> (Lv.${pedigree.parent2.level} 第${pedigree.parent2.generation}世代)<br>`;
      if (pedigree.parent2.pedigree) html += renderPedigreeNode(pedigree.parent2.pedigree, depth + 1);
    }
    return html;
  }

  // Placeholder handlers for menu buttons
  function onMenuBtn(name) {
    showToast(`${name}画面は未実装です`);
  }

  // ---- Init ----
  function init() {
    showScreen('title');
    renderTitle();

    // Event listeners
    document.getElementById('btn-newgame').addEventListener('click', onNewGame);
    document.getElementById('btn-continue').addEventListener('click', onContinue);
    document.getElementById('btn-confirm-name').addEventListener('click', onConfirmName);
    document.getElementById('btn-cancel-name').addEventListener('click', onCancelName);
    document.getElementById('btn-accept-starter').addEventListener('click', onAcceptStarter);

    // Enter key for name input
    document.getElementById('input-player-name').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') onConfirmName();
    });

    // Worldmap menu buttons
    document.querySelectorAll('[data-menu]').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.menu;
        if (name === 'パーティ編成') return openPartyScreen();
        if (name === 'ボックス') return openBoxScreen();
        if (name === 'ショップ') return openShopScreen();
        if (name === '合成') return openSynthScreen();
        if (name === 'スキル') return openSkillScreen();
        if (name === '繁殖') return openBreedScreen();
        if (name === '実績') return openAchievementScreen();
        onMenuBtn(name);
      });
    });

    // Sub-screen back buttons
    document.getElementById('party-back').addEventListener('click', () => {
      showScreen('worldmap');
      renderWorldMap();
    });
    document.getElementById('box-back').addEventListener('click', () => {
      showScreen('worldmap');
      renderWorldMap();
    });
    document.getElementById('shop-back').addEventListener('click', () => {
      showScreen('worldmap');
      renderWorldMap();
    });
    document.getElementById('synth-back').addEventListener('click', () => {
      showScreen('worldmap');
      renderWorldMap();
    });
    document.getElementById('synth-step2-back').addEventListener('click', () => {
      renderSynthStep1();
    });
    document.getElementById('skill-back').addEventListener('click', () => {
      showScreen('worldmap');
      renderWorldMap();
    });
    document.getElementById('breed-back').addEventListener('click', () => {
      showScreen('worldmap');
      renderWorldMap();
    });
    document.getElementById('ach-back').addEventListener('click', () => {
      showScreen('worldmap');
      renderWorldMap();
    });
  }

  return {
    init,
    showScreen,
    showToast,
    renderTitle,
    renderWorldMap,
    renderPartyBar,
    claimQuest,
    onAreaSelect,
    startBattle,
    renderBattle,
    openPartyScreen,
    openBoxScreen,
    openShopScreen,
    openSynthScreen,
    openSkillScreen,
    openBreedScreen,
    openAchievementScreen,
  };
})();

// Boot
window.addEventListener('DOMContentLoaded', () => UI.init());
