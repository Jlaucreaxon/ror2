// === 技能效果資料庫 (普/前/先/束/咒) ===
const CustomSkillDB = {
  reckless: { name: '魯莽一擊[普]', type: 'Norm', desc: '造成130%物理傷，自身護甲-2', maxCd: 0 },
  observe: { name: '靜觀[普]', type: 'Norm', desc: '跳過行動，回復5%生命與1點護甲', maxCd: 0 },
  escape: { name: '逃跑[普]', type: 'Norm', desc: '50%機率脫離普通戰鬥(Boss無效)', maxCd: 2 },
  crit_strike: { name: '會心一擊[普]', type: 'Norm', desc: '必中且造成180%暴擊傷害', maxCd: 2 },
  bite: { name: '咬[普]', type: 'Norm', desc: '造成110%物理傷並吸取50%傷害為生命', maxCd: 0 },
  haste: { name: '加速[前]', type: 'Fast', desc: '不耗回合，本場Move+4', maxCd: 3 },
  sand_scatter: { name: '金沙散[前]', type: 'Fast', desc: '耗團隊5%金沙，致盲敵人3回合', maxCd: 3 },
  gather_sand: { name: '聚金沙[普]', type: 'Norm', desc: '造成(Move x 1.2)傷害，機率獲5-10金沙', maxCd: 1 },
  war_cry: { name: '吶喊[前]', type: 'Fast', desc: '不耗回合，全隊攻/魔/Move +1', maxCd: 3 },
  slash: { name: '斬擊[普]', type: 'Norm', desc: '造成110%物理傷害', maxCd: 0 },
  pierce: { name: '破甲突刺[普]', type: 'Norm', desc: '造成120%破甲傷害', maxCd: 0 },
  heavy_charge: { name: '蓄力重斬[束]', type: 'Charge', turns: 1, desc: '束力1回：下回造成260%物理傷', maxCd: 2 },
  magic_bolt: { name: '魔力彈[普]', type: 'Norm', desc: '造成115%魔法傷害(無視50%甲)', maxCd: 0 },
  chant_fire: { name: '爆炎咒[咒]', type: 'Spell', turns: 1, desc: '咒1回：不卡行動，220%魔法傷', maxCd: 2 },
  chant_doom: { name: '禁咒毀滅[咒]', type: 'Spell', turns: 2, desc: '咒2回：造成300%真實傷害', maxCd: 3 },
  med_heal: { name: '戰地急救[普]', type: 'Norm', desc: '回復全隊25%最大生命', maxCd: 2 },
  snipe_shot: { name: '致命狙擊[束]', type: 'Charge', turns: 1, desc: '束力1回：造成350%無視護甲真傷', maxCd: 2 },
  rapid_fire: { name: '火力壓制[前]', type: 'Fast', desc: '不耗回合，本回合攻擊力翻倍', maxCd: 3 }
};

// === F ~ S 級完整職業表 ===
const JobDB = {
  // F職
  '冒險者': { rank: 'F', hp: 90, arm: 10, move: 12, atk: 14, matk: 10, skills: ['reckless', 'observe', 'escape'] },
  '失憶者': { rank: 'F', hp: 85, arm: 8, move: 13, atk: 13, matk: 13, skills: ['reckless', 'observe', 'escape'] },
  '流浪者': { rank: 'F', hp: 160, arm: 25, move: 18, atk: 32, matk: 20, skills: ['crit_strike', 'observe', 'escape'] },
  '喪屍': { rank: 'F', hp: 110, arm: 0, move: 8, atk: 18, matk: 0, skills: ['bite', 'haste'] },
  '囚犯': { rank: 'F', hp: 80, arm: 5, move: 9, atk: 12, matk: 5, skills: ['observe', 'escape'] },

  // E職 (冒險者支線 & 喪屍支線)
  '小偷': { rank: 'E', hp: 95, arm: 12, move: 17, atk: 18, matk: 10, skills: ['sand_scatter', 'gather_sand', 'observe', 'escape'] },
  '足輕': { rank: 'E', hp: 115, arm: 22, move: 12, atk: 20, matk: 8, skills: ['war_cry', 'reckless', 'observe', 'escape'] },
  '野魔': { rank: 'E', hp: 90, arm: 10, move: 13, atk: 12, matk: 22, skills: ['war_cry', 'reckless', 'observe', 'escape'] },
  '浪人': { rank: 'E', hp: 110, arm: 16, move: 16, atk: 24, matk: 10, skills: ['crit_strike', 'slash', 'observe'] },
  '仵作': { rank: 'E', hp: 95, arm: 12, move: 14, atk: 18, matk: 16, skills: ['pierce', 'med_heal', 'observe'] },
  '步行軍': { rank: 'E', hp: 130, arm: 30, move: 10, atk: 18, matk: 5, skills: ['war_cry', 'slash', 'observe'] },
  '突擊兵': { rank: 'E', hp: 105, arm: 15, move: 16, atk: 23, matk: 8, skills: ['haste', 'pierce', 'reckless'] },
  '巡警': { rank: 'E', hp: 110, arm: 18, move: 14, atk: 21, matk: 10, skills: ['war_cry', 'pierce', 'observe'] },
  '伐木兵': { rank: 'E', hp: 125, arm: 18, move: 11, atk: 25, matk: 5, skills: ['heavy_charge', 'reckless', 'observe'] },
  '跆拳學徒': { rank: 'E', hp: 100, arm: 12, move: 17, atk: 22, matk: 8, skills: ['haste', 'slash', 'observe'] },
  '消防學員': { rank: 'E', hp: 120, arm: 20, move: 14, atk: 19, matk: 12, skills: ['med_heal', 'war_cry', 'observe'] },
  '廚房打雜': { rank: 'E', hp: 105, arm: 12, move: 13, atk: 18, matk: 12, skills: ['med_heal', 'slash', 'observe'] },
  '代購小編': { rank: 'E', hp: 85, arm: 10, move: 15, atk: 14, matk: 18, skills: ['gather_sand', 'war_cry', 'escape'] },
  '乞丐': { rank: 'E', hp: 80, arm: 5, move: 14, atk: 15, matk: 10, skills: ['sand_scatter', 'gather_sand', 'escape'] },
  '寫生學徒': { rank: 'E', hp: 85, arm: 10, move: 14, atk: 12, matk: 20, skills: ['magic_bolt', 'observe', 'escape'] },
  '攝影愛好者': { rank: 'E', hp: 90, arm: 10, move: 16, atk: 14, matk: 18, skills: ['sand_scatter', 'observe', 'escape'] },
  '超級士兵': { rank: 'E', hp: 160, arm: 25, move: 16, atk: 30, matk: 10, skills: ['bite', 'haste', 'heavy_charge'] },

  // D職
  '大盜': { rank: 'D', hp: 120, arm: 18, move: 21, atk: 26, matk: 14, skills: ['sand_scatter', 'gather_sand', 'crit_strike'] },
  '暗獵者': { rank: 'D', hp: 115, arm: 16, move: 20, atk: 28, matk: 15, skills: ['haste', 'pierce', 'crit_strike'] },
  '暗殺士徒': { rank: 'D', hp: 105, arm: 14, move: 23, atk: 31, matk: 14, skills: ['haste', 'crit_strike', 'pierce'] },
  '盜墓者': { rank: 'D', hp: 125, arm: 20, move: 16, atk: 24, matk: 16, skills: ['gather_sand', 'pierce', 'observe'] },
  '地侍': { rank: 'D', hp: 145, arm: 32, move: 15, atk: 29, matk: 12, skills: ['war_cry', 'slash', 'crit_strike'] },
  '足輕頭': { rank: 'D', hp: 140, arm: 30, move: 14, atk: 27, matk: 12, skills: ['war_cry', 'pierce', 'slash'] },
  '鐵砲足輕': { rank: 'D', hp: 120, arm: 22, move: 13, atk: 34, matk: 10, skills: ['heavy_charge', 'pierce', 'war_cry'] },
  '弓足輕': { rank: 'D', hp: 115, arm: 20, move: 16, atk: 28, matk: 12, skills: ['pierce', 'war_cry', 'slash'] },
  '長槍足輕': { rank: 'D', hp: 135, arm: 28, move: 14, atk: 28, matk: 10, skills: ['pierce', 'war_cry', 'observe'] },
  '見習軍醫': { rank: 'D', hp: 120, arm: 22, move: 15, atk: 20, matk: 24, skills: ['med_heal', 'war_cry', 'slash'] },
  '死侍': { rank: 'D', hp: 150, arm: 18, move: 16, atk: 36, matk: 10, skills: ['heavy_charge', 'reckless', 'crit_strike'] },
  '魔法崇拜者': { rank: 'D', hp: 105, arm: 14, move: 15, atk: 14, matk: 32, skills: ['magic_bolt', 'chant_fire', 'observe'] },
  '血魔士': { rank: 'D', hp: 130, arm: 14, move: 15, atk: 18, matk: 34, skills: ['bite', 'chant_fire', 'magic_bolt'] },
  '魔術士': { rank: 'D', hp: 105, arm: 15, move: 16, atk: 14, matk: 33, skills: ['chant_fire', 'magic_bolt', 'haste'] },
  '魔劍士': { rank: 'D', hp: 130, arm: 24, move: 16, atk: 28, matk: 26, skills: ['slash', 'chant_fire', 'magic_bolt'] },
  '魔武士': { rank: 'D', hp: 130, arm: 22, move: 17, atk: 30, matk: 25, skills: ['crit_strike', 'chant_fire', 'slash'] },
  '魔盜士': { rank: 'D', hp: 110, arm: 16, move: 20, atk: 24, matk: 26, skills: ['gather_sand', 'magic_bolt', 'haste'] },
  '見習魔醫': { rank: 'D', hp: 115, arm: 16, move: 15, atk: 16, matk: 30, skills: ['med_heal', 'magic_bolt', 'observe'] },
  '流放魔匠': { rank: 'D', hp: 135, arm: 24, move: 13, atk: 28, matk: 26, skills: ['heavy_charge', 'magic_bolt', 'pierce'] },
  '吟唱準備員': { rank: 'D', hp: 135, arm: 32, move: 12, atk: 16, matk: 28, skills: ['chant_fire', 'observe', 'war_cry'] },
  '魔忍': { rank: 'D', hp: 110, arm: 16, move: 22, atk: 26, matk: 28, skills: ['haste', 'chant_fire', 'crit_strike'] },
  '血武士': { rank: 'D', hp: 145, arm: 20, move: 17, atk: 34, matk: 16, skills: ['bite', 'crit_strike', 'slash'] },
  '賞金獵手': { rank: 'D', hp: 125, arm: 20, move: 19, atk: 31, matk: 14, skills: ['gather_sand', 'crit_strike', 'pierce'] },
  '雙刀浪人': { rank: 'D', hp: 125, arm: 18, move: 20, atk: 35, matk: 12, skills: ['haste', 'crit_strike', 'slash'] },
  '隊長': { rank: 'D', hp: 160, arm: 38, move: 13, atk: 28, matk: 14, skills: ['war_cry', 'pierce', 'med_heal'] },
  '計謀兵': { rank: 'D', hp: 115, arm: 18, move: 18, atk: 22, matk: 26, skills: ['sand_scatter', 'war_cry', 'pierce'] },
  '忍者': { rank: 'D', hp: 110, arm: 16, move: 23, atk: 29, matk: 18, skills: ['haste', 'sand_scatter', 'crit_strike'] },
  '跆拳師': { rank: 'D', hp: 125, arm: 18, move: 21, atk: 31, matk: 12, skills: ['haste', 'pierce', 'crit_strike'] },

  // C職
  '魔法學徒': { rank: 'C', hp: 125, arm: 18, move: 18, atk: 16, matk: 42, skills: ['chant_fire', 'magic_bolt', 'haste'] },
  '武痴': { rank: 'C', hp: 155, arm: 24, move: 23, atk: 40, matk: 14, skills: ['haste', 'heavy_charge', 'crit_strike'] },
  '黑道打手': { rank: 'C', hp: 165, arm: 26, move: 19, atk: 42, matk: 10, skills: ['war_cry', 'heavy_charge', 'reckless'] },

  // B職
  '魔法師': { rank: 'B', hp: 145, arm: 22, move: 20, atk: 18, matk: 54, skills: ['chant_fire', 'chant_doom', 'magic_bolt'] },
  '武術士': { rank: 'B', hp: 180, arm: 30, move: 25, atk: 50, matk: 18, skills: ['haste', 'crit_strike', 'heavy_charge'] },

  // A職
  '黑魔法士': { rank: 'A', hp: 165, arm: 25, move: 21, atk: 22, matk: 68, skills: ['chant_doom', 'chant_fire', 'bite'] },
  '大魔法師': { rank: 'A', hp: 170, arm: 28, move: 22, atk: 20, matk: 72, skills: ['chant_doom', 'chant_fire', 'med_heal'] },
  '武術家': { rank: 'A', hp: 210, arm: 36, move: 28, atk: 64, matk: 22, skills: ['haste', 'crit_strike', 'heavy_charge'] },
  '僱傭兵': { rank: 'A', hp: 195, arm: 35, move: 22, atk: 62, matk: 15, skills: ['rapid_fire', 'pierce', 'war_cry'] },
  '黑道老大': { rank: 'A', hp: 220, arm: 38, move: 21, atk: 66, matk: 16, skills: ['rapid_fire', 'war_cry', 'crit_strike'] },

  // S職 (傳說)
  '黑魔法王': { rank: 'S', hp: 220, arm: 35, move: 25, atk: 30, matk: 95, skills: ['chant_doom', 'chant_fire', 'bite'] },
  '魔法宗師': { rank: 'S', hp: 230, arm: 40, move: 26, atk: 28, matk: 98, skills: ['chant_doom', 'chant_fire', 'med_heal'] },
  '狙擊狂': { rank: 'S', hp: 190, arm: 30, move: 30, atk: 92, matk: 20, skills: ['snipe_shot', 'haste', 'crit_strike'] },
  '武術宗師': { rank: 'S', hp: 280, arm: 50, move: 34, atk: 88, matk: 30, skills: ['haste', 'crit_strike', 'heavy_charge'] },
  '劊子手': { rank: 'S', hp: 260, arm: 45, move: 24, atk: 94, matk: 15, skills: ['heavy_charge', 'crit_strike', 'pierce'] },
  '神槍手': { rank: 'S', hp: 230, arm: 40, move: 29, atk: 90, matk: 22, skills: ['rapid_fire', 'snipe_shot', 'crit_strike'] },
  '人型兵器': { rank: 'S', hp: 320, arm: 60, move: 28, atk: 96, matk: 40, skills: ['rapid_fire', 'heavy_charge', 'bite'] }
};

// === 完整轉職配方表 ===
const PromotionRecipes = [
  { from: '冒險者', lv: 50, item: null, to: '流浪者' },
  { from: '冒險者', lv: 5, item: '小刀', to: '小偷' },
  { from: '冒險者', lv: 5, item: '布甲', to: '足輕' },
  { from: '冒險者', lv: 5, item: '木杖', to: '野魔' },
  { from: '冒險者', lv: 5, item: '武士刀', to: '浪人' },
  { from: '冒險者', lv: 5, item: '解剖刀', to: '仵作' },
  { from: '冒險者', lv: 5, item: '圓盾', to: '步行軍' },
{ from: '冒險者', lv: 5, item: '竹矛', to: '突擊兵' },
{ from: '冒險者', lv: 5, item: '警棍', to: '巡警' },
{ from: '冒險者', lv: 5, item: '斧頭', to: '伐木兵' },
{ from: '冒險者', lv: 5, item: '跆拳白帶', to: '跆拳學徒' },
{ from: '冒險者', lv: 5, item: '消防哨', to: '消防學員' },
{ from: '冒險者', lv: 5, item: '小圍裙', to: '廚房打雜' },
{ from: '冒險者', lv: 5, item: '電腦', to: '代購小編' },
{ from: '冒險者', lv: 5, item: '排洩物', to: '乞丐' },
{ from: '冒險者', lv: 5, item: '鉛筆', to: '寫生學徒' },
{ from: '冒險者', lv: 5, item: '相機', to: '攝影愛好者' },
{ from: '喪屍', lv: 1, item: '血清', to: '超級士兵' },
// D職
{ from: '小偷', lv: 5, item: '斗篷', to: '大盜' },
{ from: '小偷', lv: 5, item: '弓', to: '暗獵者' },
{ from: '小偷', lv: 5, item: '暗殺面紗', to: '暗殺士徒' },
{ from: '小偷', lv: 5, item: '鐵鏟', to: '盜墓者' },
{ from: '足輕', lv: 5, item: '武士刀', to: '地侍' },
{ from: '浪人', lv: 5, item: '布甲', to: '地侍' },
{ from: '足輕', lv: 5, item: '斗笠', to: '足輕頭' },
{ from: '足輕', lv: 5, item: '鐵砲', to: '鐵砲足輕' },
{ from: '足輕', lv: 5, item: '弓', to: '弓足輕' },
{ from: '足輕', lv: 5, item: '槍', to: '長槍足輕' },
{ from: '足輕', lv: 5, item: '解剖刀', to: '見習軍醫' },
{ from: '足輕', lv: 5, item: '雙手巨斧', to: '死侍' },
{ from: '足輕', lv: 5, item: '圓盾', to: '隊長' },
{ from: '步行軍', lv: 5, item: '布甲', to: '隊長' },
{ from: '足輕', lv: 5, item: '匕首', to: '計謀兵' },
{ from: '足輕', lv: 5, item: '小刀', to: '忍者' },
{ from: '小偷', lv: 5, item: '布甲', to: '忍者' },
{ from: '跆拳學徒', lv: 5, item: '黑帶', to: '跆拳師' },
// 野魔 & 浪人分支
{ from: '野魔', lv: 5, item: '掌心魔杖', to: '魔法崇拜者' },
{ from: '野魔', lv: 5, item: '血石', to: '血魔士' },
{ from: '野魔', lv: 5, item: '術書', to: '魔術士' },
{ from: '野魔', lv: 5, item: '長劍', to: '魔劍士' },
{ from: '野魔', lv: 5, item: '武士刀', to: '魔武士' },
{ from: '野魔', lv: 5, item: '匕首', to: '魔盜士' },
{ from: '野魔', lv: 5, item: '解剖刀', to: '見習魔醫' },
{ from: '野魔', lv: 5, item: '斧頭', to: '流放魔匠' },
{ from: '野魔', lv: 5, item: '圓盾', to: '吟唱準備員' },
{ from: '野魔', lv: 5, item: '苦無', to: '魔忍' },
{ from: '浪人', lv: 5, item: '血石', to: '血武士' },
{ from: '浪人', lv: 5, item: '斗笠', to: '賞金獵手' },
{ from: '浪人', lv: 5, item: '武士刀', to: '雙刀浪人' },
// C / B / A / S 進階路線
{ from: '魔法崇拜者', lv: 5, item: '魔法靴', to: '魔法學徒' },
{ from: '跆拳師', lv: 5, item: '頭帶', to: '武痴' },
{ from: '跆拳師', lv: 5, item: '鐵指虎', to: '黑道打手' },
{ from: '魔法學徒', lv: 5, item: '魔法書', to: '魔法師' },
{ from: '武痴', lv: 5, item: '拳術繃帶', to: '武術士' },
{ from: '魔法學徒', lv: 10, item: '魔法禁書', to: '黑魔法士' },
{ from: '魔法師', lv: 5, item: '巫師帽', to: '大魔法師' },
{ from: '武術士', lv: 5, item: '武術腰帶', to: '武術家' },
{ from: '突擊兵', lv: 5, item: '自動步槍', to: '僱傭兵' },
{ from: '黑道打手', lv: 5, item: '自動步槍', to: '黑道老大' },
{ from: '黑魔法士', lv: 10, item: '黑魔杖', to: '黑魔法王' },
{ from: '大魔法師', lv: 10, item: '宗師之袍', to: '魔法宗師' },
{ from: '武術家', lv: 10, item: '宗師之袍', to: '武術宗師' },
{ from: '僱傭兵', lv: 10, item: '神槍手眼鏡', to: '神槍手' },
{ from: '超級士兵', lv: 10, item: '反應爐核心', to: '人型兵器' },
{ rankReq: 'C', lv: 10, item: 'AWP狙擊槍', to: '狙擊狂' },
{ rankReq: 'C', lv: 10, item: '劊子手大刀', to: '劊子手' }
];
window.togglePromoTree = function(show) {
  const modal = document.getElementById('tree-modal');
  if (!modal) return;
  if (!show) {
    modal.style.display = 'none';
    return;
  }

  const content = document.getElementById('tree-content');
  content.innerHTML = '';
  const bag = (typeof RunState !== 'undefined' && RunState.bagItems) ? RunState.bagItems : [];

  // 依照起點職業分組整理路線
  const groups = {};
  PromotionRecipes.forEach(r => {
    const key = r.from ? ('起點：【' + r.from + '】') : ('通用條件：任意 ' + r.rankReq + ' 級職業');
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  Object.keys(groups).forEach(groupTitle => {
    const box = document.createElement('div');
    box.className = 'tree-group';

    const title = document.createElement('div');
    title.className = 'tree-title';
    title.textContent = groupTitle;
    box.appendChild(title);

    groups[groupTitle].forEach(r => {
      const targetRank = (JobDB[r.to] && JobDB[r.to].rank) ? JobDB[r.to].rank : '?';
      const owned = r.item && bag.includes(r.item);
      const reqStr = 'Lv.' + r.lv + (r.item ? ' + 【' + r.item + '】' : ' (無需道具)');

      const row = document.createElement('div');
      row.className = 'tree-row' + (owned ? ' has-item' : '');
      row.innerHTML = '<span>' + reqStr + '</span><span>➔ [' + targetRank + '] <b>' + r.to + '</b></span>';
      box.appendChild(row);
    });

    content.appendChild(box);
  });

  modal.style.display = 'flex';
};
