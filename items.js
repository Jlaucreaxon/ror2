const ItemDB = {
  medGear: [
    { id: 'scalpel', name: '解剖刀', bagName: '解剖刀', cost: 45, desc: '醫療裝備：暴擊率 +20%，暴擊傷害變為 2 倍（可作轉職素材）' },
    { id: 'serum', name: '濃縮血清', bagName: '血清', cost: 50, desc: '醫療裝備：每場戰鬥開始時自動回復 15% 最大生命（可作轉職素材）' },
    { id: 'gloves', name: '無菌手術手套', bagName: '無菌手術手套', cost: 40, desc: '醫療裝備：所有治療效果 +30%，且命中率 +10%' },
    { id: 'sanitizer', name: '高濃度消毒液', bagName: '高濃度消毒液', cost: 40, desc: '醫療裝備：免疫敵方減益，且承受傷害減少 15%' }
  ],
  potions: [
    { id: 'p_heal25', name: '3.1 回復藥水', cost: 20, turns: 0, desc: '立即回復全隊 25% 最大生命值' },
    { id: 'p_berserk', name: '3.2 狂暴藥水', cost: 35, turns: 3, desc: '3回合：近戰傷害 x2，受到傷害 x2' },
    { id: 'p_mana', name: '3.3 增魔藥水', cost: 35, turns: 3, desc: '3回合：魔法傷害 x2，技能冷卻 +1' },
    { id: 'p_thunder', name: '3.4 疾雷藥水', cost: 35, turns: 3, desc: '3回合：Move值 x2，命中率 -10%' },
    { id: 'p_aim', name: '3.5 準繩藥水', cost: 30, turns: 3, desc: '3回合：100% 命中率，0% 暴擊率' },
    { id: 'p_undead', name: '3.6 不死藥水', cost: 55, turns: 2, desc: '2回合：Move值變為 0，期間鎖血不死！' }
  ]
};

function initRunItems() {
  RunState.gear = [];
  RunState.potions = ['p_heal25'];
  RunState.activePotions = [];
  RunState.acc = 90;
  RunState.crit = 15;
}

function generateClinicStock() {
  const pool = [
    { type: 'instant', id: 'heal50', name: '1. 濃縮回復藥劑', cost: 30, desc: '立即回復全隊 50% 最大生命值' },
    ...ItemDB.medGear.map(g => ({ type: 'gear', ...g })),
    ...ItemDB.potions.map(p => ({ type: 'potion', ...p }))
  ];
  return pool.sort(() => Math.random() - 0.5).slice(0, 3);
}

// 輔助函式：治療所有存活隊員
function healAllParty(ratio) {
  const mult = RunState.gear.includes('gloves') ? 1.3 : 1.0;
  let totalHealed = 0;
  getAliveParty().forEach(m => {
    const amt = Math.floor(m.maxHp * ratio * mult);
    m.hp = Math.min(m.maxHp, m.hp + amt);
    totalHealed += amt;
  });
  return totalHealed;
}

function buyClinicItem(itemJson) {
  const item = JSON.parse(decodeURIComponent(itemJson));
  const scene = game.scene.getScene('DungeonScene');
  if (GameData.sand < item.cost) { scene.log('❌ 金沙不足！'); return; }

  GameData.sand -= item.cost;
  saveGame();

  if (item.type === 'instant') {
    const healed = healAllParty(0.5);
    scene.log('💉 飲用濃縮回復藥劑，全隊共回復 ' + healed + ' HP！');
  } else if (item.type === 'gear') {
    // 同步加入轉職素材背包
    if (item.bagName && RunState.bagItems) {
      RunState.bagItems.push(item.bagName);
    }
    if (!RunState.gear.includes(item.id)) {
      RunState.gear.push(item.id);
      if (item.id === 'scalpel') RunState.crit += 20;
      if (item.id === 'gloves') RunState.acc += 10;
      scene.log('🩺 裝備【' + item.name + '】：' + item.desc);
    } else {
      getAliveParty().forEach(m => { m.maxHp += 10; m.hp += 10; });
      scene.log('已擁有【' + item.name + '】，轉化為全隊最大生命 +10（並獲得轉職素材）！');
    }
  } else if (item.type === 'potion') {
    RunState.potions.push(item.id);
    scene.log('🧪 獲得【' + item.name + '】並放入戰鬥腰帶！');
  }
  scene.updateHUD();
}

function useBattlePotion(index) {
  const pid = RunState.potions[index];
  const pData = ItemDB.potions.find(p => p.id === pid);
  const scene = game.scene.getScene('DungeonScene');
  if (!pData) return;

  RunState.potions.splice(index, 1);

  if (pid === 'p_heal25') {
    const healed = healAllParty(0.25);
    scene.log('🧪 使用【' + pData.name + '】，全隊共回復 ' + healed + ' HP！');
  } else {
    RunState.activePotions.push({ id: pid, name: pData.name, turns: pData.turns });
    scene.log('🧪 喝下【' + pData.name + '】(' + pData.turns + '回合)！' + pData.desc);
  }
  scene.updateHUD();
}

function getCombatModifiers() {
  const activeIds = RunState.activePotions.map(p => p.id);
  const isUndead = activeIds.includes('p_undead');
  const isAim = activeIds.includes('p_aim');
  const isThunder = activeIds.includes('p_thunder');
  const isBerserk = activeIds.includes('p_berserk');
  const isMana = activeIds.includes('p_mana');

  return {
    atkMult: isBerserk ? 2.0 : 1.0,
    matkMult: isMana ? 2.0 : 1.0,
    dmgTakenMult: (isBerserk ? 2.0 : 1.0) * (RunState.gear.includes('sanitizer') ? 0.85 : 1.0),
    moveMult: isUndead ? 0 : (isThunder ? 2.0 : 1.0), // 改為倍率，避免讀取 undefined 的 RunState.move
    acc: isAim ? 100 : Math.max(10, RunState.acc - (isThunder ? 10 : 0)),
    crit: isAim ? 0 : RunState.crit,
    critMult: RunState.gear.includes('scalpel') ? 2.0 : 1.5,
    undead: isUndead,
    extraCd: isMana ? 1 : 0
  };
}
