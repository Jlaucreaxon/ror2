// 1. 合併新舊技能庫，讓畫面能正常顯示所有新技能按鈕
Object.assign(SkillDB, typeof CustomSkillDB !== 'undefined' ? CustomSkillDB : {});

// 2. 覆寫技能施放邏輯，完整支援 data.js 裡的所有新技能
DungeonScene.prototype.useMemberSkill = function(m, skId) {
  const sk = SkillDB[skId];
  if (!sk || (m.cooldowns[skId] || 0) > 0) return;
  const mod = getCombatModifiers();
  this.cameras.main.shake(90, 0.007);

  // [前] 前置技能（不消耗行動權）
  if (sk.type === 'Fast') {
    m.cooldowns[skId] = sk.maxCd;
    if (skId === 'haste') { m.move += 4; this.log('<span class="tag-fast">[前] ' + m.name + ' 加速！Move +4</span>'); }
    else if (skId === 'war_cry') {
      getAliveParty().forEach(a => { a.atk += 1; a.matk += 1; a.move += 1; });
      this.log('<span class="tag-fast">[前] ' + m.name + ' 吶喊！全隊全能力 +1</span>');
    } else if (skId === 'sand_scatter') {
      const cost = Math.max(1, Math.floor(GameData.sand * 0.05));
      GameData.sand = Math.max(0, GameData.sand - cost); saveGame();
      RunState.enemy.atk = Math.max(1, Math.floor(RunState.enemy.atk * 0.7));
      this.log('<span class="tag-fast">[前] 撒出 ' + cost + ' 金沙致盲敵人！敵攻大幅下降</span>');
    } else if (skId === 'rapid_fire') {
      m.atk *= 2; this.log('<span class="tag-fast">[前] 火力壓制！本場攻擊力翻倍</span>');
    }
    this.updateHUD(m.id); this.renderMemberActions(m); return;
  }

  m.cooldowns[skId] = sk.maxCd + (sk.type === 'Spell' ? mod.extraCd : 0);
  m.skillPts++;

  // [普] / [束] / [咒] 技能結算
  if (skId === 'observe') {
    m.hp = Math.min(m.maxHp, m.hp + Math.floor(m.maxHp * 0.05));
    m.armour = Math.min(m.maxArmour, m.armour + 1);
    this.log(m.name + ' 靜觀局勢，回復少量生命與護甲。');
  } else if (skId === 'escape') {
    if (Math.random() < 0.5) {
      this.log('💨 逃跑成功！脫離了這場戰鬥！');
      RunState.enemy.hp = 0; this.checkEnd(); return;
    } else { this.log('❌ 逃跑失敗！被敵人攔住了！'); }
  } else if (skId === 'reckless') {
    m.armour = Math.max(0, m.armour - 2);
    const res = this.calcDmg(Math.floor(m.atk * 1.3 * mod.atkMult), 'Attack', RunState.enemy, true);
    this.log(m.name + ' 魯莽一擊（自損2甲）：造成 <span class="tag-dmg">' + res.final + ' 傷害</span>');
  } else if (skId === 'crit_strike') {
    const res = this.calcDmg(Math.floor(m.atk * 1.8 * mod.atkMult), 'True', RunState.enemy, true);
    this.log('💥 ' + m.name + ' 會心一擊！造成 <span class="tag-dmg">' + res.final + ' 暴擊真傷</span>');
  } else if (skId === 'bite') {
    const res = this.calcDmg(Math.floor(m.atk * 1.1 * mod.atkMult), 'Attack', RunState.enemy, true);
    const heal = Math.floor(res.final * 0.5);
    m.hp = Math.min(m.maxHp, m.hp + heal);
    this.log('🧛 ' + m.name + ' 撕咬造成 ' + res.final + ' 傷害並吸血 +' + heal);
  } else if (skId === 'gather_sand') {
    const res = this.calcDmg(Math.floor(m.move * 1.2 * mod.atkMult), 'Attack', RunState.enemy, true);
    const gain = 5 + Math.floor(Math.random() * 6);
    GameData.sand += gain; saveGame();
    this.log('⏳ ' + m.name + ' 聚金沙造成 ' + res.final + ' 傷害，順手摸走 +' + gain + ' 金沙！');
  } else if (skId === 'med_heal') {
    getAliveParty().forEach(a => { a.hp = Math.min(a.maxHp, a.hp + Math.floor(a.maxHp * 0.25)); });
    this.log('💚 ' + m.name + ' 戰地急救，全隊回復 25% 生命！');
  } else if (sk.type === 'Charge') {
    const mult = skId === 'snipe_shot' ? 3.5 : 2.6;
    m.charging = { name: sk.name, turns: sk.turns, dmg: Math.floor(m.atk * mult * mod.atkMult) };
    this.log('<span class="tag-charge">[束] ' + m.name + ' 開始蓄力 ' + sk.name + '！</span>');
  } else if (sk.type === 'Spell') {
    const mult = skId === 'chant_doom' ? 3.0 : 2.2;
    m.spells.push({ name: sk.name, turns: sk.turns, dmg: Math.floor(m.matk * mult * mod.matkMult), dtype: skId === 'chant_doom' ? 'True' : 'Skill' });
    this.log('<span class="tag-spell">[咒] ' + m.name + ' 開始吟唱 ' + sk.name + '</span>');
  } else {
    const res = this.calcDmg(Math.floor(m.atk * 1.15 * mod.atkMult), skId === 'pierce' ? 'Mega' : 'Attack', RunState.enemy, true);
    this.log(m.name + ' 使用 ' + sk.name + '：破甲 ' + res.armDmg + '，<span class="tag-dmg">' + res.final + ' 傷害</span>');
  }

  this.updateHUD();
  this.processNextTurn();
};

Object.assign(DungeonScene.prototype, {
  startCombat() {
    const d = Math.abs(RunState.floor);
    RunState.enemy = {
      name: RunState.direction > 0 ? '高塔石像鬼 Lv.' + d : '深淵重甲兵 Lv.' + d,
      hp: 80 + d * 25, maxHp: 80 + d * 25,
      armour: RunState.direction < 0 ? 20 + d * 6 : 8 + d * 3,
      move: RunState.direction > 0 ? 15 + d : 10 + d,
      atk: 16 + d * 5
    };
    this.enemySprite.setVisible(true);

    RunState.party.forEach(m => {
      m.cooldowns = {}; m.charging = null; m.spells = [];
      if (m.hp > 0 && RunState.gear.includes('serum')) {
        m.hp = Math.min(m.maxHp, m.hp + Math.floor(m.maxHp * 0.15));
      }
    });

    RunState.enemy.armour = Math.max(0, RunState.enemy.armour - 5);
    this.log('<span class="tag-scout">[先發] 弱點洞悉自動觸發！敵甲 -5</span>');
    this.startNewRound();
  },

  startNewRound() {
    if (this.checkEnd()) return;
    const mod = getCombatModifiers();

    for (let i = RunState.activePotions.length - 1; i >= 0; i--) {
      if (--RunState.activePotions[i].turns <= 0) {
        this.log('⏳ 【' + RunState.activePotions[i].name + '】藥效結束。');
        RunState.activePotions.splice(i, 1);
      }
    }

    const queue = [];
    getAliveParty().forEach(m => {
      const spd = mod.undead ? 0 : (RunState.activePotions.some(p => p.id === 'p_thunder') ? m.move * 2 : m.move);
      queue.push({ isPlayer: true, unit: m, speed: spd });
    });
    queue.push({ isPlayer: false, unit: RunState.enemy, speed: RunState.enemy.move });
    queue.sort((a, b) => b.speed - a.speed);

    this.turnQueue = queue;
    this.log('--- 新回合開始 (行動序: ' + queue.map(q => q.unit.name).join(' → ') + ') ---');
    this.processNextTurn();
  },

  processNextTurn() {
    if (this.checkEnd()) return;
    if (this.turnQueue.length === 0) {
      this.startNewRound();
      return;
    }
    const actor = this.turnQueue.shift();
    if (actor.isPlayer) {
      if (actor.unit.hp <= 0) { this.processNextTurn(); return; }
      this.playerUnitStartTurn(actor.unit);
    } else {
      this.enemyAct();
    }
  },

  playerUnitStartTurn(m) {
    for (const k in m.cooldowns) { if (m.cooldowns[k] > 0) m.cooldowns[k]--; }

    for (let i = m.spells.length - 1; i >= 0; i--) {
      let sp = m.spells[i];
      if (--sp.turns <= 0) {
        const r = this.calcDmg(sp.dmg, sp.dtype, RunState.enemy, true);
        this.log('<span class="tag-spell">[咒爆發] ' + m.name + ' 的 ' + sp.name + '：<span class="tag-dmg">' + r.final + ' 傷害</span></span>');
        m.spells.splice(i, 1);
      }
    }
    if (this.checkEnd()) return;

    if (m.charging) {
      if (--m.charging.turns <= 0) {
        const r = this.calcDmg(m.charging.dmg, 'Attack', RunState.enemy, true);
        this.log('<span class="tag-charge">[束力釋放] ' + m.name + ' 的 ' + m.charging.name + '：<span class="tag-dmg">' + r.final + ' 傷害</span></span>');
        m.charging = null;
        if (this.checkEnd()) return;
      } else {
        this.log('<span class="tag-charge">[束力中] ' + m.name + ' 蓄力中無法行動！</span>');
        this.updateHUD();
        this.time.delayedCall(500, () => this.processNextTurn());
        return;
      }
    }

    this.updateHUD();
    this.renderMemberActions(m);
  },

  enemyAct() {
    const alive = getAliveParty();
    if (alive.length === 0) { this.checkEnd(); return; }
    const target = alive[Math.floor(Math.random() * alive.length)];
    const mod = getCombatModifiers();
    const res = this.calcDmg(Math.floor(RunState.enemy.atk * mod.dmgTakenMult), 'Attack', target, false);
    this.log('👹 敵方攻擊 ' + target.name + '！損甲 ' + res.armDmg + '，受 <span class="tag-dmg">' + res.final + ' 傷害</span>');
    this.updateHUD();
    this.time.delayedCall(500, () => this.processNextTurn());
  },

  calcDmg(raw, type, target, isPlayerAttack) {
    const mod = getCombatModifiers();
    if (isPlayerAttack) {
      if (Math.random() * 100 > mod.acc) {
        this.log('<span style="color:#888;">💨 攻擊揮空了！(命中 ' + mod.acc + '%)</span>');
        return { armDmg: 0, final: 0 };
      }
      if (Math.random() * 100 < mod.crit) {
        raw = Math.floor(raw * mod.critMult);
        this.log('<span style="color:#f1c40f;">💥 暴擊！(x' + mod.critMult + ')</span>');
      }
    }

    let final = 0, armDmg = 0;
    if (type === 'Attack') {
      armDmg = Math.min(target.armour, raw); target.armour -= armDmg; final = Math.max(0, raw - armDmg);
    } else if (type === 'Skill') {
      const effArm = Math.floor(target.armour * 0.5);
      armDmg = Math.min(effArm, raw); target.armour = Math.max(0, target.armour - armDmg); final = Math.max(0, raw - effArm);
    } else if (type === 'Mega') {
      if (target.armour > 0) {
        armDmg = Math.min(target.armour, Math.floor(raw * 1.5));
        target.armour -= armDmg; final = Math.max(0, raw - Math.floor(armDmg / 1.5));
      } else { final = raw; }
    } else if (type === 'True') { final = raw; }

    target.hp = Math.max(0, target.hp - final);
    if (!isPlayerAttack && target.hp <= 0 && mod.undead) {
      target.hp = 1;
      this.log('<span class="tag-fast">💀【不死藥效】' + target.name + ' 強行鎖住 1 點生命！</span>');
    }
    return { armDmg: armDmg, final: final };
  },



  checkEnd() {
    this.updateHUD();
    if (RunState.enemy && RunState.enemy.hp <= 0) {
      const c = 30 + Math.floor(Math.random() * 25);
      const s = Math.random() < 0.5 ? 20 + Math.floor(Math.random() * 15) : 0;
      const expGain = 25 + Math.abs(RunState.floor) * 15;
      GameData.coin += c;
      GameData.sand += s;
      saveGame();

      this.log('🎉 擊敗敵人！+' + c + '金幣 ' + (s ? '+' + s + '金沙 ' : '') + '+' + expGain + 'EXP');
      const lvLogs = grantPartyExp(expGain);
      lvLogs.forEach(msg => this.log('<span style="color:#f1c40f;font-weight:bold;">' + msg + '</span>'));
      this.updateHUD();

      const panel = document.getElementById('action-panel');
      panel.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'btn-grid';
      this.makeBtn(grid, '繼續前進 (' + (RunState.direction > 0 ? '向上' : '向下') + ')', '', true, () => {
        RunState.floor += RunState.direction; this.nextRoom();
      });
      panel.appendChild(grid);
      return true;
    }

    if (getAliveParty().length === 0) {
      const kept = Math.floor(GameData.sand * 0.20), lost = GameData.sand - kept;
      GameData.bankSand += kept; GameData.sand = 0; saveGame();
      alert('💀 全隊覆沒！（無法回到地面）\n\n【地城稅收結算】\n沒收 80% 金沙 (-' + lost + ')\n保留 20% 存入銀行 (+' + kept + ')');
      this.scene.start('HubScene');
      return true;
    }
    return false;
  },

renderMemberActions(m) {
    this.updateHUD(m.id); // <--- 加上這行，輪到該角色時卡片就會立刻閃爍！
    const panel = document.getElementById('action-panel');
    panel.innerHTML = '';
    const title = document.createElement('div');
    title.style.cssText = 'font-size:12px;color:#f5b041;font-weight:bold;margin-bottom:4px;';
    title.textContent = '▶ 輪到【' + m.name + '】行動 (詠唱:' + (m.spells.map(s => s.name + '(' + s.turns + ')').join(' ') || '無') + ')';
    panel.appendChild(title);

    if (RunState.potions.length > 0) {
      const pGrid = document.createElement('div');
      pGrid.className = 'btn-grid';
      pGrid.style.marginBottom = '6px';
      RunState.potions.forEach((pid, idx) => {
        const p = ItemDB.potions.find(x => x.id === pid);
        if (!p) return;
        const btn = this.makeBtn(pGrid, '🧪' + p.name, '', false, () => {
          useBattlePotion(idx);
          this.renderMemberActions(m);
        });
        btn.style.cssText = 'background:#1e3a2f;border-color:#2ecc71;';
      });
      panel.appendChild(pGrid);
    }

    const sGrid = document.createElement('div');
    sGrid.className = 'btn-grid';
    m.skills.forEach(skId => {
      const sk = SkillDB[skId];
      const cd = m.cooldowns[skId] || 0;
      const btn = this.makeBtn(sGrid, sk.name + (cd > 0 ? '(CD:' + cd + ')' : ''), sk.desc, false, () => this.useMemberSkill(m, skId));
      btn.disabled = cd > 0;
    });
    panel.appendChild(sGrid);
  }
});
