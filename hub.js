const defaultSave = {
  coin: 100, sand: 0, bankSand: 500, gem: 10,
  job: '冒險者', hiredCount: 0
};
const GameData = Object.assign({}, defaultSave, JSON.parse(localStorage.getItem('abyss_save') || '{}'));
function saveGame() { localStorage.setItem('abyss_save', JSON.stringify(GameData)); }

const RunState = {
  direction: 0, floor: 0, party: [], enemy: null
};

class HubScene extends Phaser.Scene {
  constructor() { super('HubScene'); }

  create() {
    const w = this.scale.width, h = this.scale.height;
    this.add.grid(w / 2, h / 2, w, h, 40, 40, 0x12141d, 1, 0x1e2230, 1);
    this.topText = this.add.text(14, 42, '', { fontFamily: '"Cubic11", monospace', fontSize: '13px', color: '#f5b041', stroke: '#000', strokeThickness: 3 });
    this.updateTopBar();

    this.zones = [
      this.createZone(w * 0.24, h * 0.24, 110, 74, 0x2ecc71, '地城銀行\n(稅收/匯率)', 'bank'),
      this.createZone(w * 0.76, h * 0.24, 110, 74, 0xf1c40f, '出發整頓\n(F~D隨機職)', 'prep'),
      this.createZone(w * 0.24, h * 0.45, 110, 74, 0x9b59b6, '集會所酒吧\n(招募上限4人)', 'bar'),
      this.createZone(w * 0.76, h * 0.45, 110, 74, 0xe74c3c, '無歸傳送門\n(上下探索)', 'gate')
    ];

    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x3498db, 1).fillRect(4, 4, 28, 28).lineStyle(3, 0xffffff, 1).strokeRect(4, 4, 28, 28);
    g.generateTexture('player_orb', 36, 36);

    this.player = this.add.sprite(w * 0.5, h * 0.34, 'player_orb');
    this.targetPos = null;

    this.input.on('pointerdown', (p) => {
      if (p.y <= h * 0.72) this.targetPos = new Phaser.Math.Vector2(p.x, p.y);
    });

    const logBox = document.getElementById('log-box');
    const partyHud = document.getElementById('party-hud');
    if (logBox) { logBox.style.display = 'none'; logBox.innerHTML = ''; }
    if (partyHud) { partyHud.style.display = 'none'; partyHud.innerHTML = ''; }

    this.showHubUI(null);
  }

  createZone(x, y, w, h, color, label, type) {
    this.add.rectangle(x, y, w, h, color, 0.2).setStrokeStyle(3, color);
    this.add.rectangle(x, y, w - 6, h - 6, 0x000000, 0).setStrokeStyle(1, 0xffffff, 0.5);
    this.add.text(x, y, label, { fontFamily: '"Cubic11", monospace', fontSize: '12px', color: '#fff', align: 'center', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);
    return { type, bounds: new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h) };
  }

  update(time, delta) {
    if (this.targetPos) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.targetPos.x, this.targetPos.y);
      if (dist > 5) {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.targetPos.x, this.targetPos.y);
        this.player.x += Math.cos(angle) * 260 * (delta / 1000);
        this.player.y += Math.sin(angle) * 260 * (delta / 1000);
      } else { this.targetPos = null; }
    }

    let hit = null;
    for (const z of this.zones) {
      if (Phaser.Geom.Rectangle.Contains(z.bounds, this.player.x, this.player.y)) { hit = z.type; break; }
    }
    if (this.currentZone !== hit) { this.currentZone = hit; this.showHubUI(hit); }
  }

  updateTopBar() {
    const teamSize = 1 + (GameData.hiredCount || 0);
    this.topText.setText('🪙幣:' + GameData.coin + ' ⏳沙:' + GameData.sand + '(庫:' + GameData.bankSand + ') 💎' + GameData.gem + ' 👥' + teamSize + '/4');
  }

  showHubUI(type) {
    const panel = document.getElementById('action-panel');
    const teamSize = 1 + (GameData.hiredCount || 0);
    if (!type) {
      panel.innerHTML = '<b>【地下集會所 0F】</b> 點擊畫面上方移動角色。<br><span style="font-size:11px;color:#88c0d0;">目前編隊：' + teamSize + '/4 人 | 隊長職業：' + GameData.job + '</span>';
    } else if (type === 'bank') {
      panel.innerHTML = '<b>【地城銀行】</b> 攜帶：' + GameData.sand + ' | 銀行庫存：' + GameData.bankSand +
        '<div class="btn-grid">' +
        '<button onclick="hubAction(\'sand\', 50)">帶 +50 金沙</button>' +
        '<button onclick="hubAction(\'sand\', -GameData.sand)">0沙出城 (全存)</button>' +
        '<button onclick="hubAction(\'ex_sand2coin\', 0)">20銀行沙 ➔ 100金幣</button>' +
        '<button onclick="hubAction(\'ex_coin2sand\', 0)">100金幣 ➔ 10銀行沙</button></div>';
    } else if (type === 'prep') {
      const rank = (typeof JobDB !== 'undefined' && JobDB[GameData.job]) ? JobDB[GameData.job].rank : 'F';
      panel.innerHTML = '<b>【出發整頓】</b> 當前隊長：<span style="color:#f5b041;">[' + rank + '職] ' + GameData.job + '</span>' +
        '<div class="btn-grid">' +
        '<button class="btn-full" onclick="hubAction(\'roll_job\', 20)">🎲 隨機轉職 F~D 級職業 (20金幣)</button>' +
        '<button class="btn-full" onclick="hubAction(\'roll_job\', 0)">🆓 免費重抽基礎 F 級職業</button></div>';
    } else if (type === 'bar') {
      panel.innerHTML = '<b>【集會所酒吧】</b> 小隊人數：' + teamSize + ' / 4 人 (最多招募3名同伴)' +
        '<div class="btn-grid">' +
        '<button onclick="hubAction(\'hire\', 40)">🪙招募流浪者 (40金幣)</button>' +
        '<button onclick="hubAction(\'dismiss\', 0)">解散隨行隊員</button></div>';
    } else if (type === 'gate') {
      panel.innerHTML = '<b>【無歸傳送門】</b> 編隊 ' + teamSize + '/4 人準備就緒：' +
        '<div class="btn-grid">' +
        '<button onclick="hubAction(\'enter\', 1)">⬆️ 向上：無盡高塔</button>' +
        '<button onclick="hubAction(\'enter\', -1)">⬇️ 向下：無底深淵</button></div>';
    }
  }
}

window.hubAction = function(act, val) {
  const scene = game.scene.getScene('HubScene');
  if (act === 'sand') {
    if (val > 0 && GameData.bankSand >= val) { GameData.bankSand -= val; GameData.sand += val; }
    else if (val < 0 && GameData.sand >= -val) { GameData.sand += val; GameData.bankSand -= val; }
  } else if (act === 'ex_sand2coin') {
    if (GameData.bankSand < 20) { alert('銀行庫存金沙不足 20！'); return; }
    GameData.bankSand -= 20;
    GameData.coin += 100;
  } else if (act === 'ex_coin2sand') {
    if (GameData.coin < 100) { alert('地城金幣不足 100！'); return; }
    GameData.coin -= 100;
    GameData.bankSand += 10;
  } else if (act === 'roll_job') {
    if (val > 0) {
      if (GameData.coin < val) { alert('地城金幣不足！'); return; }
      GameData.coin -= val;
    }
    const targetRanks = val > 0 ? ['F', 'E', 'D'] : ['F'];
    const pool = typeof JobDB !== 'undefined'
      ? Object.keys(JobDB).filter(k => targetRanks.includes(JobDB[k].rank))
      : ['冒險者'];
    GameData.job = pool[Math.floor(Math.random() * pool.length)];
  } else if (act === 'hire') {
    if ((GameData.hiredCount || 0) >= 3) { alert('小隊已達上限 4 人！'); return; }
    if (GameData.coin < val) { alert('地城金幣不足！'); return; }
    GameData.coin -= val;
    GameData.hiredCount = (GameData.hiredCount || 0) + 1;
  } else if (act === 'dismiss') {
    GameData.hiredCount = 0;
  } else if (act === 'enter') {
    Object.assign(RunState, { direction: val, floor: val, enemy: null });
    initParty();
    initRunItems();
    GameData.hiredCount = 0;
    saveGame();
    scene.scene.start('DungeonScene');
    return;
  }
  saveGame();
  scene.updateTopBar();
  scene.showHubUI(scene.currentZone);
};
