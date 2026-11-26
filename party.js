const RandomNames = ['凱恩', '莉莉絲', '雷歐', '賽琳娜', '莫德雷德', '艾琳', '加雷斯', '薇薇安'];

// 生成一名指定職業或隨機F級隊員
function createMemberByJob(jobName, customName) {
  const data = JobDB[jobName] || JobDB['冒險者'];
  return {
    id: 'm_' + Math.random().toString(36).substr(2, 5),
    name: customName || jobName,
    job: jobName,
    rank: data.rank,
    lv: 1,
    exp: 0,
    hp: data.hp, maxHp: data.hp,
    armour: data.arm, maxArmour: data.arm,
    move: data.move, atk: data.atk, matk: data.matk,
    weapon: '徒手',
    skillPts: 0,
    skills: data.skills.slice(),
    cooldowns: {}, charging: null, spells: []
  };
}

function generateRandomMember(isMain) {
  if (isMain) {
    const startJob = JobDB[GameData.job] ? GameData.job : '冒險者';
    return createMemberByJob(startJob, '隊長(' + startJob + ')');
  }
  // 酒吧招募限定 F 級隨機職業
  const pool = Object.keys(JobDB).filter(k => JobDB[k].rank === 'F');
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const rName = RandomNames[Math.floor(Math.random() * RandomNames.length)];
  return createMemberByJob(pick, rName + '(' + pick + ')');
}

function initParty() {
  RunState.party = [generateRandomMember(true)];
  RunState.bagItems = ['小刀', '布甲', '木杖', '武士刀', '血清'];
  const count = Math.min(3, GameData.hiredCount || 0);
  for (let i = 0; i < count; i++) {
    RunState.party.push(generateRandomMember(false));
  }
}

function getAliveParty() {
  return RunState.party.filter(m => m.hp > 0);
}

// 查詢某隊員目前滿足哪些轉職條件
function getAvailablePromotions(member) {
  return PromotionRecipes.filter(r => {
    const matchJob = r.from ? member.job === r.from : member.rank === r.rankReq;
    const matchLv = member.lv >= r.lv;
    const matchItem = !r.item || (RunState.bagItems && RunState.bagItems.includes(r.item));
    return matchJob && matchLv && matchItem;
  });
}

// 執行轉職並消耗對應裝備（保留等級成長屬性）
function promoteMember(member, recipe) {
  if (recipe.item) {
    const idx = RunState.bagItems.indexOf(recipe.item);
    if (idx > -1) RunState.bagItems.splice(idx, 1);
    member.weapon = recipe.item;
  }
  const oldData = JobDB[member.job] || JobDB['冒險者'];
  const newData = JobDB[recipe.to];
  
  member.job = recipe.to;
  member.rank = newData.rank;
  member.name = member.name.replace(/\(.*?\)/, '(' + recipe.to + ')');
  
  // 加上新舊職業基礎值差額，保留升級獲得的額外成長
  member.maxHp += (newData.hp - oldData.hp);
  member.hp = member.maxHp;
  member.maxArmour += (newData.arm - oldData.arm);
  member.armour = member.maxArmour;
  member.move += (newData.move - oldData.move);
  member.atk += (newData.atk - oldData.atk);
  member.matk += (newData.matk - oldData.matk);
  member.skills = newData.skills.slice();
}

// 戰鬥勝利發放經驗值與升級處理
function grantPartyExp(expGain) {
  const logs = [];
  getAliveParty().forEach(m => {
    m.exp += expGain;
    while (m.exp >= m.lv * 30) {
      m.exp -= m.lv * 30;
      m.lv += 1;
      m.maxHp += 12;
      m.hp = Math.min(m.maxHp, m.hp + 12);
      m.atk += 3;
      m.matk += 3;
      if (m.lv % 2 === 0) { m.maxArmour += 3; m.armour += 3; }
      logs.push('⬆️ ' + m.name + ' 升到了 Lv.' + m.lv + '！');
    }
  });
  return logs;
}
