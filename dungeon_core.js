const SkillDB = {
  scout: { name: '弱點洞悉', type: 'Scout', desc: '先發：破敵5甲', maxCd: 0 },
  fast: { name: '迅捷架勢', type: 'Fast', desc: '前置：不耗回合 攻+5', maxCd: 3 },
  slash: { name: '重劈', type: 'Norm', desc: '普通：100%攻擊傷', maxCd: 0 },
  pierce: { name: '碎甲擊', type: 'Norm', desc: '普通：120%破甲傷', maxCd: 0 },
  charge: { name: '蓄力崩山', type: 'Charge', turns: 1, desc: '束力1回：下回250%傷', maxCd: 2 },
  fire: { name: '延遲火球', type: 'Spell', turns: 1, desc: '咒1回：200%魔傷', maxCd: 2 },
  ice: { name: '冰霜新星', type: 'Spell', turns: 2, desc: '咒2回：180%真傷', maxCd: 3 },
  heal_ally: { name: '戰地包紮', type: 'Norm', desc: '普通：回復全隊20%血', maxCd: 2 }
};

// 武器店與裝備屋販售的轉職專屬道具池
const PromoShopPool = {
  weapons: [
    { name: '小刀', cost: 20 }, { name: '木杖', cost: 20 }, { name: '武士刀', cost: 25 },
    { name: '解剖刀', cost: 25 }, { name: '竹矛', cost: 25 }, { name: '警棍', cost: 25 },
    { name: '斧頭', cost: 25 }, { name: '弓', cost: 35 }, { name: '鐵鏟', cost: 35 },
    { name: '鐵砲', cost: 40 }, { name: '槍', cost: 40 }, { name: '雙手巨斧', cost: 45 },
    { name: '匕首', cost: 35 }, { name: '掌心魔杖', cost: 40 }, { name: '長劍', cost: 40 },
    { name: '苦無', cost: 40 }, { name: '鐵指虎', cost: 50 }, { name: '自動步槍', cost: 75 },
    { name: '黑魔杖', cost: 110 }, { name: 'AWP狙擊槍', cost: 110 }, { name: '劊子手大刀', cost: 110 }
  ],
  armours: [
    { name: '布甲', cost: 20 }, { name: '圓盾', cost: 25 }, { name: '跆拳白帶', cost: 20 },
    { name: '消防哨', cost: 20 }, { name: '小圍裙', cost: 20 }, { name: '電腦', cost: 25 },
    { name: '鉛筆', cost: 20 }, { name: '相機', cost: 25 }, { name: '斗篷', cost: 35 },
    { name: '暗殺面紗', cost: 40 }, { name: '斗笠', cost: 35 }, { name: '黑帶', cost: 40 },
    { name: '血石', cost: 45 }, { name: '術書', cost: 45 }, { name: '魔法靴', cost: 50 },
    { name: '頭帶', cost: 50 }, { name: '魔法書', cost: 65 }, { name: '拳術繃帶', cost: 65 },
    { name: '魔法禁書', cost: 85 }, { name: '巫師帽', cost: 85 }, { name: '武術腰帶', cost: 85 },
    { name: '宗師之袍', cost: 120 }, { name: '神槍手眼鏡', cost: 120 }, { name: '反應爐核心', cost: 120 }
  ]
};

class DungeonScene extends Phaser.Scene {
  constructor() { super('DungeonScene'); }

  create() {
    const w = this.scale.width, h = this.scale.height;
    this.add.rectangle(w / 2, h / 2, w, h, RunState.direction > 0 ? 0x162238 : 0x241114);
    this.headerText = this.add.text(14, 38, '', {fontFamily: '"Cubic 11", monospace', stroke: '#000', strokeThickness: 3, fontSize: '12px', color: '#f5b041', fontStyle: 'bold', lineSpacing: 3 });

    this.enemySprite = this.add.rectangle(w * 0.5, h * 0.24, 95, 95, 0xc0392b).setStrokeStyle(3, 0xff7675).setVisible(false);
    this.enemyInfo = this.add.text(w * 0.5, h * 0.35, '', { fontFamily: '"Cubic 11", monospace', stroke: '#000', strokeThickness: 3,fontSize: '14px', color: '#fff', align: 'center', fontStyle: 'bold', lineSpacing: 4 }).setOrigin(0.5);

    const hud = document.getElementById('party-hud');
    if (hud) hud.style.display = 'grid';

    const logBox = document.getElementById('log-box');
    if (logBox) {
      logBox.style.display = 'block';
      logBox.innerHTML = '';
    }

    if (RunState.direction > 0) {
      this.log('⬆️ 踏入【無盡高塔】！雲層在腳下急速遠去，通往地面的階梯已崩塌...');
    } else {
      this.log('⬇️ 墜入【無底深淵】！頭頂微光徹底吞沒，重力將你拉向地心，再也無法回到地面...');
    }
    this.nextRoom();
  }

  log(msg) {
    const box = document.getElementById('log-box');
    if (!box) return;
    box.innerHTML += '<div>> ' + msg + '</div>';
    box.scrollTop = box.scrollHeight;
  }

  makeBtn(parent, text, sub, isFull, fn) {
    const btn = document.createElement('button');
    if (isFull) btn.className = 'btn-full';
    const s1 = document.createElement('span');
    s1.textContent = text;
    btn.appendChild(s1);
    if (sub) {
      btn.appendChild(document.createElement('br'));
      const s2 = document.createElement('span');
      s2.style.cssText = 'font-size:10px;color:#aaa;font-weight:normal;';
      s2.textContent = sub;
      btn.appendChild(s2);
    }
    btn.onclick = fn;
    parent.appendChild(btn);
    return btn;
  }

  getJobAvatar(job, rank) {
    const rankColors = { F: '#555', E: '#2e86c1', D: '#28b463', C: '#8e44ad', B: '#d35400', A: '#c0392b', S: '#f1c40f' };
    let icon = '⚔️';
    if (job.includes('魔') || job.includes('咒') || job.includes('寫生')) icon = '🔮';
    else if (job.includes('偷') || job.includes('盜') || job.includes('忍') || job.includes('暗')) icon = '🗡️';
    else if (job.includes('醫') || job.includes('仵') || job.includes('消防')) icon = '🩺';
    else if (job.includes('槍') || job.includes('砲') || job.includes('狙') || job.includes('僱傭')) icon = '🔫';
    else if (job.includes('喪屍') || job.includes('兵器')) icon = '☣️';
    else if (job.includes('武') || job.includes('跆') || job.includes('黑道')) icon = '🥊';
    return { icon: icon, color: rankColors[rank] || '#555' };
  }

  updateHUD(activeMemberId) {
    const fl = RunState.floor > 0 ? '高塔 +' + RunState.floor + 'F' : '深淵 ' + RunState.floor + 'F';
    const bagTxt = (RunState.bagItems || []).join('、') || '空';
    this.headerText.setText('📍' + fl + ' | 🪙' + GameData.coin + ' | ⏳沙:' + GameData.sand + ' | 💎' + GameData.gem + '\n🎒轉職背包:' + bagTxt);

    const hud = document.getElementById('party-hud');
    if (hud) {
      hud.innerHTML = '';
      (RunState.party || []).forEach(m => {
        const av = this.getJobAvatar(m.job, m.rank);
        const hpPct = Math.max(0, Math.min(100, (m.hp / m.maxHp) * 100));
        const armPct = m.maxArmour > 0 ? Math.max(0, Math.min(100, (m.armour / m.maxArmour) * 100)) : 0;

        const card = document.createElement('div');
        card.className = 'member-card' + (m.hp <= 0 ? ' dead' : '') + (activeMemberId === m.id ? ' active-turn' : '');

        const avatar = document.createElement('div');
        avatar.className = 'avatar-box';
        avatar.style.background = av.color;
        avatar.textContent = m.hp <= 0 ? '💀' : av.icon;

        const info = document.createElement('div');
        info.className = 'm-info';

        const nameRow = document.createElement('div');
        nameRow.className = 'm-name';
        nameRow.textContent = '[' + m.rank + ' Lv.' + m.lv + '] ' + m.name;

        const hpBg = document.createElement('div');
        hpBg.className = 'bar-bg';
        const hpFill = document.createElement('div');
        hpFill.className = 'hp-fill';
        hpFill.style.width = hpPct + '%';
        hpBg.appendChild(hpFill);

        const armBg = document.createElement('div');
        armBg.className = 'bar-bg';
        const armFill = document.createElement('div');
        armFill.className = 'arm-fill';
        armFill.style.width = armPct + '%';
        armBg.appendChild(armFill);

        const stats = document.createElement('div');
        stats.className = 'm-stats';
        stats.textContent = '❤️' + m.hp + '/' + m.maxHp + ' 🛡️' + m.armour + ' 👟' + m.move;

        info.appendChild(nameRow);
        info.appendChild(hpBg);
        info.appendChild(armBg);
        info.appendChild(stats);

        card.appendChild(avatar);
        card.appendChild(info);
        hud.appendChild(card);
      });
    }

    this.enemyInfo.setText(RunState.enemy ? '👹 ' + RunState.enemy.name + '\n❤️ ' + RunState.enemy.hp + ' / ' + RunState.enemy.maxHp + '   🛡️ 護甲: ' + RunState.enemy.armour + '   👟 Move: ' + RunState.enemy.move : '');
  }

  nextRoom() {
    RunState.enemy = null;
    this.enemySprite.setVisible(false);
    this.updateHUD();
    const panel = document.getElementById('action-panel');
    panel.innerHTML = '';
    const roll = Math.random();

    if (roll < 0.45) {
      panel.innerHTML = '<b>⚠️ 遭遇地下城守衛！</b>';
      const grid = document.createElement('div');
      grid.className = 'btn-grid';
      this.makeBtn(grid, '拔劍迎戰', '擊敗獲得金幣、金沙與經驗升級', true, () => this.startCombat());
      panel.appendChild(grid);
    } else if (roll < 0.80) {
      const shops = ['武器及加工店', '裝備屋', '流浪診所', '地下酒吧'];
      const pick = shops[Math.floor(Math.random() * shops.length)];
      const grid = document.createElement('div');
      grid.className = 'btn-grid';

      if (pick === '流浪診所') {
        const mult = RunState.gear.includes('gloves') ? 1.3 : 1.0;
        RunState.party.forEach(m => {
          if (m.hp > 0) m.hp = Math.min(m.maxHp, m.hp + Math.floor(m.maxHp * 0.25 * mult));
        });
        this.updateHUD();
        panel.innerHTML = '<b>🏥 流浪診所</b> (全隊回復25%血 | 3選1商品)';
        generateClinicStock().forEach(it => {
          const payload = encodeURIComponent(JSON.stringify(it));
          this.makeBtn(grid, it.name + ' (' + it.cost + '沙)', it.desc, true, () => buyClinicItem(payload));
        });
      } else if (pick === '地下酒吧') {
        panel.innerHTML = '<b>🍺 地下酒吧</b> (全隊壓力回復30% | 招募流浪者)';
        const recruit = generateRandomMember(false);
        this.makeBtn(grid, '招募 ' + recruit.name + ' (50沙)', recruit.job + ' | 初始Lv.1', true, () => {
          if (RunState.party.length >= 4) { this.log('❌ 小隊已滿4人！'); return; }
          if (GameData.sand < 50) { this.log('❌ 金沙不足！'); return; }
          GameData.sand -= 50; saveGame();
          RunState.party.push(recruit);
          this.log('🍺 ' + recruit.name + ' 加入了探索小隊！');
          this.updateHUD();
        });
      } else if (pick === '武器及加工店') {
        panel.innerHTML = '<b>⚒️ 武器及加工店</b> (強化與轉職武器販售)';
        this.makeBtn(grid, '武器加強 (35沙)', '全隊攻擊力 +5', false, () => this.shopAction('atk', 35));
        this.makeBtn(grid, '傳說武器箱 (80沙)', '全隊攻擊力 +12', false, () => this.shopAction('legend_w', 80));
        // 隨機刷出 2 件轉職專用武器
        const wItems = PromoShopPool.weapons.slice().sort(() => Math.random() - 0.5).slice(0, 2);
        wItems.forEach(wi => {
          this.makeBtn(grid, '🗡️購買【' + wi.name + '】(' + wi.cost + '沙)', '轉職必備武器(放入背包)', false, () => this.buyPromoItem(wi));
        });
      } else {
        panel.innerHTML = '<b>🛡️ 裝備屋</b> (防具與轉職道具販售)';
        this.makeBtn(grid, '防具加強 (35沙)', '全隊護甲上限 +10', false, () => this.shopAction('arm', 35));
        this.makeBtn(grid, '輕量化附魔 (40沙)', '全隊 Move +2', false, () => this.shopAction('move', 40));
        // 隨機刷出 2 件轉職專用防具/道具
        const aItems = PromoShopPool.armours.slice().sort(() => Math.random() - 0.5).slice(0, 2);
        aItems.forEach(ai => {
this.makeBtn(grid, '📦購買【' + ai.name + '】(' + ai.cost + '沙)', '轉職必備道具(放入背包)', false, () => this.buyPromoItem(ai));
});
}
this.makeBtn(grid, '離開商店繼續探索', '', true, () => { RunState.floor += RunState.direction; this.nextRoom(); });
panel.appendChild(grid);
} else {
// 營火處：修復護甲 + 檢查全隊轉職條件
RunState.party.forEach(m => { if (m.hp > 0) m.armour = m.maxArmour; });
this.updateHUD();
this.renderCampfire();
}
}
// 營火處專屬介面：顯示一鍵轉職按鈕
renderCampfire() {
const panel = document.getElementById('action-panel');
panel.innerHTML = '🔥 溫暖的營火處 (全隊護甲已完全修復！)';
const grid = document.createElement('div');
grid.className = 'btn-grid';
let canPromoteAny = false;
getAliveParty().forEach(m => {
const recipes = getAvailablePromotions(m);
recipes.forEach(rec => {
canPromoteAny = true;
const reqText = 'Lv.' + rec.lv + (rec.item ? ' + 消耗【' + rec.item + '】' : ' (無需道具)');
const btn = this.makeBtn(grid, '✨ ' + m.name + ' ➔ 【' + rec.to + '】', reqText, true, () => {
promoteMember(m, rec);
this.log('🌟 奇蹟發生！【' + m.name + '】在營火旁成功轉職為 ' + JobDB[rec.to].rank + '級職業【' + rec.to + '】！');
this.updateHUD();
this.renderCampfire();
});
btn.style.cssText = 'background:#3b2d14;border-color:#f5b041;color:#fdebd0;';
});
});
if (!canPromoteAny) {
const hint = document.createElement('div');
hint.style.cssText = 'grid-column:span 2;font-size:11px;color:#aaa;text-align:center;padding:4px;';
hint.textContent = '目前尚無隊員滿足轉職條件（需達 Lv.5/10 並持有對應轉職道具）';
grid.appendChild(hint);
}
this.makeBtn(grid, '整裝完畢，繼續深入', '', true, () => { RunState.floor += RunState.direction; this.nextRoom(); });
panel.appendChild(grid);
}
buyPromoItem(itemObj) {
if (GameData.sand < itemObj.cost) { this.log('❌ 金沙不足！'); return; }
GameData.sand -= itemObj.cost; saveGame();
if (!RunState.bagItems) RunState.bagItems = [];
RunState.bagItems.push(itemObj.name);
this.log('🎒 購得轉職道具【' + itemObj.name + '】，抵達營火處即可進行轉職！');
this.updateHUD();
}
shopAction(type, cost) {
if (GameData.sand < cost) { this.log('❌ 金沙不足！'); return; }
GameData.sand -= cost; saveGame();
RunState.party.forEach(m => {
if (type === 'atk') m.atk += 5;
if (type === 'legend_w') m.atk += 12;
if (type === 'arm') { m.maxArmour += 10; m.armour += 10; }
if (type === 'move') m.move += 2;
});
this.log('✨ 強化完成！全隊戰力提升！');
this.updateHUD();
}
}