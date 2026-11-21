// Route-Aware Bilingual i18n Manager (/en/ Default, /zh/ Chinese Edition)

function detectRouteLocale() {
  const attr = document.documentElement.dataset.locale;
  if (attr === 'en' || attr === 'zh') return attr;
  const path = window.location.pathname || '';
  if (/\/zh(\/|$)/.test(path)) return 'zh';
  return 'en';
}

let currentLang = detectRouteLocale();

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (lang !== 'en' && lang !== 'zh') return;
  currentLang = lang;
  document.documentElement.dataset.locale = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
}

export function loc(obj, field) {
  if (!obj) return '';
  if (currentLang === 'zh') {
    return obj[`${field}Zh`] ?? obj[field] ?? '';
  }
  return obj[`${field}En`] ?? obj[field] ?? '';
}

export const RANK_TITLES = {
  en: [
    'Rookie Jumper',
    'Mushroom Hunter',
    'Flame Ranger',
    'Armor Breaker',
    'Aerial Martialist',
    'Starlight Arbiter',
    'Thunder Strider',
    'Rogue Legend',
    'God of Mushroom Kingdom'
  ],
  zh: [
    '见习跳跃者',
    '蘑菇猎手',
    '烈焰游侠',
    '破甲重锤手',
    '空连武道家',
    '星辉裁决者',
    '雷霆踏云客',
    '肉鸽传奇英雄',
    '蘑菇王国战神'
  ]
};

export const UI_STRINGS = {
  en: {
    pageTitle: 'SUPER MARIO: ROGUE ODYSSEY',
    brandTitle: 'SUPER MARIO: ROGUE ODYSSEY',
    brandSub: '16-BIT ACTION ROGUELITE',
    topNavAria: 'Quick game controls',
    btnArmory: 'Armory & Relics',
    btnShop: "Toad's Shop",
    btnBossWarp: 'Warp to Boss',
    btnBossWarpTitle: 'Warp directly to Final Keep (Stage 5) to fight the Final Boss',
    crtOn: 'CRT: ON',
    crtOff: 'CRT: OFF',
    audioOn: '🔊 SFX',
    audioMuted: '🔇 Muted',
    audioGroupAria: 'Audio controls',
    volumeLabel: 'Volume',
    volumeAria: 'Master volume',
    btnHelp: '❓ Controls',
    langGroupAria: 'Language selector',

    leftPanelAria: 'Mario Character Stats',
    marioStatusTitle: 'MARIO STATUS',
    starActive: '🌟 Rainbow Star Invincible!',
    labelHp: '❤️ Health (HP)',
    labelExp: '⭐ Experience (EXP)',
    labelStamina: '⚡ Dash / Spin Energy',
    statCoins: '🪙 Coins',
    statStomp: '🥾 Stomp Power',
    statAtk: '⚔️ Weapon Mult',
    statCrit: '💥 Crit Rate',
    statJumps: '🪽 Air Jumps',
    statMaxCombo: '🏆 Best Combo',
    jumpsUnit: (n) => `${n}x`,
    comboUnit: (n) => `${n}x`,

    activePerksTitle: 'Active Blessings',
    btnFreeLevelUp: '+ Test Blessing',
    btnFreeLevelUpTitle: 'Trigger a Roguelite 3-choice level-up blessing immediately',
    activePerksAria: 'Active roguelite perks list',
    emptyPerksHint: 'Defeat enemies or smash ? blocks to gain EXP, level up, and unlock roguelite blessings!',

    stageCenterAria: 'Main Game Stage',
    stageProgressTitle: 'Current stage exploration progress',
    stageProgressLabel: '🚩 Progress',
    comboPrefix: '🔥 AIR STOMP',
    canvasAria: 'Super Mario Rogue Odyssey pixel-art action canvas',
    weaponDockAria: 'Weapon hotbar',
    weaponDockTitle: 'ARSENAL',
    weaponDockHint: '[1-6] Switch · [J / LMB] Attack · [K / Shift] Dash · [Midair S] Slam',
    slotPower: (dmg) => `PWR ${dmg}`,
    slotUnlockHint: 'Buy in Shop',

    rightPanelAria: 'Mechanics Guide & Combat Log',
    mechanicsTitle: 'CORE MECHANICS',
    mechStompTitle: '🥾 Aerial Stomp Combo',
    mechStompDesc: 'Land on enemy heads for high stomp damage & bounce. <strong>Chain stomps without touching ground</strong> to scale damage, crit, and refresh air jumps!',
    mechPoundTitle: '☄️ Meteor Ground Pound',
    mechPoundDesc: 'Press <kbd>S</kbd> or <kbd>↓</kbd> in midair to slam down at high speed, unleashing a shockwave that blasts foes and shatters blocks!',
    mechSpinTitle: '🌪️ Cyclone Spin Jump',
    mechSpinDesc: 'Press <kbd>Q</kbd> for a spinning leap with multi-hit slashes that deflects enemy projectiles!',
    mechShellTitle: '🐢 Shell Ricochet',
    mechShellDesc: 'Stomp a Koopa into its shell, then kick or hit it to bowl through enemies across the screen!',

    stageJumpTitle: 'STAGE WARP & DEBUG',
    stageBtn0: '1. Emerald Plains',
    stageBtn1: '2. Crystal Cavern',
    stageBtn2: '3. Sky Ruins',
    stageBtn3: '4. Ghost Keep',
    stageBtn4: '5. Bowser Keep',
    btnUnlockAll: '⚡ Max All Weapons',
    combatLogTitle: 'COMBAT LOG',
    welcomeLog: '🌟 Welcome to SUPER MARIO: ROGUE ODYSSEY! Move with A/D, Jump with Space, Attack with J or Click!',

    // Level-Up Dialog
    levelUpKicker: '✨ LEVEL UP! STAR POWER AWAKENED ✨',
    levelUpTitle: 'Choose a Roguelite Blessing for Mario',
    levelUpSubtitlePrefix: 'Reached ',
    levelUpSubtitleSuffix: ' · Every blessing reshapes your combat build',
    btnRerollPrefix: '🎲 Reroll (',
    btnRerollSuffix: ' Coins)',
    perkChooseHint: '✨ Click to Imprint Blessing',
    rarity: {
      common: 'COMMON',
      rare: 'RARE',
      epic: 'EPIC',
      legendary: 'LEGENDARY'
    },

    // Shop Dialog
    shopKicker: "🍄 TOAD'S CARAVAN · BLACK MARKET",
    shopTitle: "Toad's Legendary Armory & Supplies",
    shopCoinsPrefix: 'Coins: ',
    shopCoinsSuffix: ' · Unlock weapons, forge upgrades, or restore HP',
    shopContinue: 'Back to Adventure (ESC)',
    shopLockedTag: '(Locked)',
    shopUpgradeBtn: (lv, cost) => `⬆️ Upgrade to LV.${lv} (${cost} 🪙)`,
    shopUnlockBtn: (cost) => `🔓 Unlock Weapon (${cost} 🪙)`,
    shopBuyBtn: (cost) => `Buy (${cost} 🪙)`,
    shopSupplies: [
      {
        icon: '🍄',
        title: 'Royal Golden Super Mushroom',
        desc: 'Instantly restore 75 HP and permanently gain +15 Max HP.',
        cost: 25
      },
      {
        icon: '🎁',
        title: 'Mystery Star Relic Box',
        desc: 'Immediately trigger a 3-choice Roguelite Blessing draft!',
        cost: 40
      },
      {
        icon: '🍀',
        title: '1-UP Emerald Life Mushroom',
        desc: 'Gain +1 Full-HP Revive—essential insurance against Final Boss Bowser!',
        cost: 60
      }
    ],

    // Armory Dialog
    armoryKicker: '📖 COMPENDIUM · WEAPONS & RELICS',
    armoryTitle: "Mario's Arsenal & Blessing Codex",
    armoryWeaponsHeading: '⚔️ 6 Legendary Weapons (Click to equip or unlock free)',
    armoryPerksHeading: '🌟 Roguelite Blessing Pool (24 Synergies)',
    armoryEquipBtn: 'Equip Now',
    armoryUnlockEquipBtn: '⚡ Free Unlock & Equip',
    armoryCloseBtn: 'Close Compendium',

    // Help Dialog
    helpKicker: '🎮 HOW TO PLAY · ACTION GUIDE',
    helpTitle: 'Controls & Advanced Techniques',
    helpMoveHeading: 'Movement & Aerial Combat',
    helpMoveList: `
      <li><kbd>A</kbd> / <kbd>D</kbd> or <kbd>←</kbd> / <kbd>→</kbd>: Run left / right</li>
      <li><kbd>W</kbd> / <kbd>Space</kbd> / <kbd>↑</kbd>: Jump & Double Jump</li>
      <li><kbd>Q</kbd>: Spin Jump (Multi-hit + Deflect Projectiles)</li>
      <li>Midair <kbd>S</kbd> or <kbd>↓</kbd>: <strong>Meteor Ground Pound</strong></li>
    `,
    helpCombatHeading: 'Weapons, Dash & Shop',
    helpCombatList: `
      <li><kbd>J</kbd> / <kbd>F</kbd> / <strong>Left Click</strong>: Fire equipped weapon</li>
      <li><kbd>K</kbd> / <kbd>Shift</kbd> / <strong>Right Click</strong>: Invincible Phantom Dash</li>
      <li><kbd>1</kbd> ~ <kbd>6</kbd> or <kbd>E</kbd>: Switch unlocked weapons</li>
      <li><kbd>B</kbd>: Open Toad's Black Market Shop anytime</li>
    `,
    helpCloseBtn: 'Return to Game',

    // Game Over / Victory Dialog
    victoryKicker: '🏆 VICTORY · ROGUE ODYSSEY CLEARED!',
    defeatKicker: '💀 RUN ENDED · DEFEATED',
    victoryTitle: 'You Defeated Mecha-Crowned Bowser!',
    defeatTitle: (stageName) => `Mario fell in ${stageName}`,
    victorySubtitle: "Your aerial stomps and roguelite build shattered Bowser's iron throne!",
    defeatReviveSubtitle: 'You hold a 1-UP Mushroom—revive on the spot with full HP!',
    defeatRetrySubtitle: 'Adapt your weapon build & blessings and charge back in!',
    btnRevive: (lives) => `🍀 Use 1-UP Mushroom to Revive (${lives} left)`,
    btnNewRun: '🔄 Start New Roguelite Run',
    summaryStats: {
      score: 'Final Score',
      level: 'Mario Level',
      combo: 'Best Air Combo',
      kills: 'Enemies Defeated',
      perks: 'Blessings',
      coins: 'Coins Held'
    },

    // Boss & Combat Logs & Floating Text
    bossPhaseName: {
      1: '👑 PHASE 1: IRON BOWSER',
      2: '🔥 PHASE 2: DARK FLAME BOWSER',
      3: '⚡ PHASE 3: OMEGA MECHA-BOWSER'
    },
    bossPhaseHint: {
      1: 'Tip: Jump over shockwaves & kick summoned Koopa shells into Bowser for huge armor-break damage!',
      2: 'Tip: Bowser spins across the arena & calls meteor rain—use double jumps & air stomps to counter!',
      3: 'Tip: OMEGA ENRAGE! Unleash all upgraded weapons and aerial combos for the final takedown!'
    },
    bossPhaseLog: {
      2: '🔥 Bowser enters Phase 2: Dark Flame Enrage!',
      3: '⚡ Bowser activates Omega Mecha Crown! Final showdown!'
    },
    toadShopCanvas: 'TOAD SHOP',
    toadPrompt: 'Press [B] for Toad Shop!',
    logStageEnter: (code, name) => `🚩 Entered ${code} · ${name}`,
    logUnlockAll: '⚡ All 6 legendary weapons unlocked & upgraded! Press [1-6] to switch anytime!',
    logRevive: '🍀 Consumed 1-UP Mushroom! Revived with full HP + 5s Rainbow Star!',
    logWeaponLocked: (name) => `🔒 [${name}] is locked! Buy it in Toad's Shop or unlock in Armory.`,
    logLavaFall: '🌋 Fell into lava hazard! Emergency launch activated',
    logStageClear: (coins) => `🏁 Flagpole reached! Bonus +${coins} Coins! Advancing to next stage...`,
    logEnemyHit: (type) => `Hit by ${type.toUpperCase()}`,
    logBossHit: 'Crushed by Final Boss Bowser!',
    logStarKills: '🌟 12-Kill Streak! Rainbow Star Invincibility activated!',
    logProjectileHit: 'Hit by enemy projectile',
    logPerkGain: (icon, name) => `✨ Blessing Imprinted: [${icon} ${name}]!`,
    logShopUnlock: (name) => `🔓 Unlocked new weapon in Toad's Shop: [${name}]!`,
    logShopUpgrade: (name, lv) => `⚒️ Forged [${name}] to LV.${lv}!`,
    logBossDefeated: '🏆 EPIC VICTORY! You defeated 3-Phase Mecha-Bowser and saved the Mushroom Kingdom!',

    ftBurn: '🔥BURN',
    ftIceBreak: (dmg) => `❄️SHATTER ${dmg}!`,
    ftShadowBlast: '👻SHADOW BLAST',
    ftParry: '🦅PERFECT PARRY!',
    ftMeteorSlam: '☄️METEOR SLAM',
    ftShellRam: '🐢SHELL RAM',
    ftShellBreak: '🐢SHELL BREAK',
    ftStarRam: '🌟STAR RAM',
    ftShellKick: '🐢SHELL KICK!',
    ftIceShatter: '❄️ICE SHATTER',
    ftStompCombo: (n) => `🥾STOMP x${n}`,
    ftBossStomp: (n) => `🥾HEAD STOMP x${n}`,
    ftThunderBoots: '🌩️THUNDER',
    ftFireproof: '🛡️FIREPROOF',
    ftSpinParry: '🌪️SPIN PARRY!',
    ftChainLight: '⚡CHAIN',
    ftFrost: '🧊FROST',
    ftBlast: '💥BLAST',
    ftRainbowStar: '🌟RAINBOW STAR!'
  },

  zh: {
    pageTitle: '超级马里奥：肉鸽奥德赛 | SUPER MARIO: ROGUE ODYSSEY',
    brandTitle: '超级马里奥：肉鸽奥德赛',
    brandSub: 'SUPER MARIO: ROGUE ODYSSEY',
    topNavAria: '游戏快捷控制',
    btnArmory: '武器与圣物图鉴',
    btnShop: '奇诺比奥商店',
    btnBossWarp: '直通最终Boss',
    btnBossWarpTitle: '直接传送至第5关终焉魔王城挑战最终Boss',
    crtOn: 'CRT 滤镜: 开',
    crtOff: 'CRT 滤镜: 关',
    audioOn: '🔊 音效',
    audioMuted: '🔇 静音',
    audioGroupAria: '音量控制',
    volumeLabel: '音量调节',
    volumeAria: '主音量',
    btnHelp: '❓ 操作说明',
    langGroupAria: '语言切换',

    leftPanelAria: '马里奥角色属性',
    marioStatusTitle: 'MARIO 状态面板',
    starActive: '🌟 无敌彩虹星生效中!',
    labelHp: '❤️ 生命值 (HP)',
    labelExp: '⭐ 经验值 (EXP)',
    labelStamina: '⚡ 冲刺/旋风能量',
    statCoins: '🪙 金币',
    statStomp: '🥾 踩踏威力',
    statAtk: '⚔️ 武器倍率',
    statCrit: '💥 暴击率',
    statJumps: '🪽 空中连跳',
    statMaxCombo: '🏆 最高连踩',
    jumpsUnit: (n) => `${n}段`,
    comboUnit: (n) => `${n}连`,

    activePerksTitle: '已获肉鸽赐福',
    btnFreeLevelUp: '+ 赐福测试',
    btnFreeLevelUpTitle: '立即唤醒一次肉鸽升级三选一',
    activePerksAria: '当前生效的肉鸽词条列表',
    emptyPerksHint: '击败敌人或顶碎问号砖获取经验升级，解锁强力肉鸽词条！',

    stageCenterAria: '游戏主画面',
    stageProgressTitle: '当前关卡探索进度',
    stageProgressLabel: '🚩 赛段进度',
    comboPrefix: '🔥 空中连踩',
    canvasAria: '超级马里奥肉鸽横版动作游戏画布',
    weaponDockAria: '武器切换栏',
    weaponDockTitle: '当前武器库',
    weaponDockHint: '[1-6] 切换 / [J/鼠标左键] 攻击 / [K/Shift] 冲刺 / [空中S] 陨石下砸',
    slotPower: (dmg) => `威力 ${dmg}`,
    slotUnlockHint: '点击去商店解锁',

    rightPanelAria: '操作指南与战况记录',
    mechanicsTitle: '核心动作机制',
    mechStompTitle: '🥾 跳跃踩踏连击 (Stomp Combo)',
    mechStompDesc: '落在敌人头顶造成高额踩踏伤害并弹起，<strong>不落地连续踩踏</strong>将叠加连击倍率与暴击，并刷新二段跳与空中冲刺！',
    mechPoundTitle: '☄️ 陨石下砸 (Ground Pound)',
    mechPoundDesc: '在空中按 <kbd>S</kbd> 或 <kbd>↓</kbd>，马里奥将高速旋转下砸，落地引发范围冲击波，震飞群怪并击碎强化砖块！',
    mechSpinTitle: '🌪️ 旋风斩跳 (Spin Jump)',
    mechSpinDesc: '按 <kbd>Q</kbd> 发动旋转跳跃，产生多段切割判定并可弹反敌方飞行道具！',
    mechShellTitle: '🐢 龟壳保龄球 (Shell Ricochet)',
    mechShellDesc: '踩缩绿龟/钢盔龟后触碰或攻击龟壳，可将其踢出高速横扫全屏！',

    stageJumpTitle: '关卡快速传送 & 调试',
    stageBtn0: '1. 蘑菇平原',
    stageBtn1: '2. 地下晶洞',
    stageBtn2: '3. 云端遗迹',
    stageBtn3: '4. 幽灵古堡',
    stageBtn4: '5. 魔王终焉城',
    btnUnlockAll: '⚡ 全武器满级体验',
    combatLogTitle: '实时战斗播报',
    welcomeLog: '🌟 欢迎来到《超级马里奥：肉鸽奥德赛》！按 A/D 移动，Space 跳跃，J 发射武器！',

    // Level-Up Dialog
    levelUpKicker: '✨ LEVEL UP! 星之力量觉醒 ✨',
    levelUpTitle: '选择一项肉鸽赐福强化马里奥',
    levelUpSubtitlePrefix: '当前等级提升至 ',
    levelUpSubtitleSuffix: ' · 每次选择都将改变你的战斗流派',
    btnRerollPrefix: '🎲 刷新词条 (',
    btnRerollSuffix: ' 金币)',
    perkChooseHint: '✨ 点击烙印此赐福',
    rarity: {
      common: '普通 COMMON',
      rare: '稀有 RARE',
      epic: '史诗 EPIC',
      legendary: '传说 LEGENDARY'
    },

    // Shop Dialog
    shopKicker: '🍄 TOAD\'S CARAVAN · 奇诺比奥流亡黑市',
    shopTitle: '奇诺比奥神装补给站',
    shopCoinsPrefix: '当前持有金币: ',
    shopCoinsSuffix: ' · 购买新武器、升级锻造或恢复生命',
    shopContinue: '继续冒险 (ESC)',
    shopLockedTag: '(未解锁)',
    shopUpgradeBtn: (lv, cost) => `⬆️ 强化至 LV.${lv} (${cost} 🪙)`,
    shopUnlockBtn: (cost) => `🔓 解锁新武器 (${cost} 🪙)`,
    shopBuyBtn: (cost) => `购买 (${cost} 🪙)`,
    shopSupplies: [
      {
        icon: '🍄',
        title: '皇家黄金超级蘑菇',
        desc: '立即恢复 75 点生命值，并永久提升 +15 最大生命上限。',
        cost: 25
      },
      {
        icon: '🎁',
        title: '盲盒星之圣物匣',
        desc: '立即开启一次【肉鸽升级赐福三选一】，打造神装协同！',
        cost: 40
      },
      {
        icon: '🍀',
        title: '1-UP 翠绿不死神菇',
        desc: '增加 +1 次原地满血复活机会，挑战最终Boss酷霸王的绝佳保险！',
        cost: 60
      }
    ],

    // Armory Dialog
    armoryKicker: '📖 COMPENDIUM · 武器与肉鸽圣物全图鉴',
    armoryTitle: '马里奥武器库与赐福图鉴',
    armoryWeaponsHeading: '⚔️ 六大传奇武器系统 (点击可直接切换或解锁体验)',
    armoryPerksHeading: '🌟 肉鸽核心词条池 (24种流派协同)',
    armoryEquipBtn: '立即切换装备',
    armoryUnlockEquipBtn: '⚡ 免费解锁并装备',
    armoryCloseBtn: '关闭图鉴',

    // Help Dialog
    helpKicker: '🎮 HOW TO PLAY · 动作指南',
    helpTitle: '按键操作与进阶技巧',
    helpMoveHeading: '基础移动与跳跃',
    helpMoveList: `
      <li><kbd>A</kbd> / <kbd>D</kbd> 或 <kbd>←</kbd> / <kbd>→</kbd>：左右奔跑</li>
      <li><kbd>W</kbd> / <kbd>Space</kbd> / <kbd>↑</kbd>：跳跃（支持二段跳与蹬墙跳）</li>
      <li><kbd>Q</kbd>：旋风切割跳（多段伤害 + 弹反子弹）</li>
      <li>空中按 <kbd>S</kbd> 或 <kbd>↓</kbd>：<strong>陨石重锤下砸 (Ground Pound)</strong></li>
    `,
    helpCombatHeading: '武器、冲刺与交互',
    helpCombatList: `
      <li><kbd>J</kbd> / <kbd>F</kbd> / <strong>鼠标左键</strong>：使用当前主武器攻击</li>
      <li><kbd>K</kbd> / <kbd>Shift</kbd> / <strong>鼠标右键</strong>：无敌幻影冲刺 (Dash)</li>
      <li><kbd>1</kbd> ~ <kbd>6</kbd> 或 <kbd>E</kbd>：实时切换已解锁武器</li>
      <li><kbd>B</kbd>：随时打开奇诺比奥黑市商店</li>
    `,
    helpCloseBtn: '返回游戏',

    // Game Over / Victory Dialog
    victoryKicker: '🏆 VICTORY · 肉鸽奥德赛通关！',
    defeatKicker: '💀 RUN ENDED · 冒险受挫',
    victoryTitle: '恭喜击败终焉魔王酷霸王！',
    defeatTitle: (stageName) => `马里奥倒在了 ${stageName}`,
    victorySubtitle: '你运用精湛的跳跃踩踏与肉鸽神装粉碎了酷霸王的机甲王座！',
    defeatReviveSubtitle: '你持有一枚 1-UP 翠绿神菇，可选择立即原地满血复活！',
    defeatRetrySubtitle: '总结经验，重新搭配武器与肉鸽赐福再次挑战吧！',
    btnRevive: (lives) => `🍀 消耗 1-UP 神菇满血复活 (剩余 ${lives})`,
    btnNewRun: '🔄 开启新一轮肉鸽征程',
    summaryStats: {
      score: '最终得分',
      level: '角色等级',
      combo: '最高空中连踩',
      kills: '击败敌军',
      perks: '收集赐福',
      coins: '持有金币'
    },

    // Boss & Combat Logs & Floating Text
    bossPhaseName: {
      1: '👑 阶段一：铁甲魔王·酷霸王 (IRON BOWSER)',
      2: '🔥 阶段二：魔导狂化·暗焰酷霸王 (DARK FLAME BOWSER)',
      3: '⚡ 阶段三：终焉形态·星陨机甲酷霸王 (OMEGA MECHA-BOWSER)'
    },
    bossPhaseHint: {
      1: '提示：跳过震地波，踩踏召唤出的绿龟壳踢向酷霸王可造成巨额破甲伤害！',
      2: '提示：酷霸王进入高速缩壳冲撞并召唤陨石火雨，利用二段跳与空中连踩反击！',
      3: '提示：终焉狂暴状态！踩踏掉落的能量星核或倾泻全部高阶武器完成绝杀！'
    },
    bossPhaseLog: {
      2: '🔥 酷霸王进入第二阶段：魔导暗焰狂化！',
      3: '⚡ 酷霸王启动终焉星陨机甲！决战时刻！'
    },
    toadShopCanvas: '奇诺比奥商店',
    toadPrompt: '按 [B] 进入奇诺比奥黑市!',
    logStageEnter: (code, name) => `🚩 进入关卡：${code} · ${name}`,
    logUnlockAll: '⚡ 已解锁全部6把传奇武器并强化至高阶状态！按数字键 [1-6] 随时切换！',
    logRevive: '🍀 消耗 1-UP 翠绿神菇满血复活，并触发5秒彩虹星无敌！',
    logWeaponLocked: (name) => `🔒 武器【${name}】尚未解锁，可在奇诺比奥黑市购买或点击图鉴解锁！`,
    logLavaFall: '🌋 跌入熔岩陷阱！已紧急弹射脱险',
    logStageClear: (coins) => `🏁 成功夺旗通关！奖励 +${coins} 金币！即将前往下一赛段...`,
    logEnemyHit: (type) => `受到 ${type.toUpperCase()} 撞击`,
    logBossHit: '遭到终焉魔王酷霸王重创！',
    logStarKills: '🌟 达成12连斩！自动激活【无敌彩虹星】状态！',
    logProjectileHit: '被敌方弹幕命中',
    logPerkGain: (icon, name) => `✨ 肉鸽赐福觉醒：获得【${icon} ${name}】！`,
    logShopUnlock: (name) => `🔓 在奇诺比奥黑市解锁了新武器：【${name}】！`,
    logShopUpgrade: (name, lv) => `⚒️ 【${name}】成功强化至 LV.${lv}！`,
    logBossDefeated: '🏆 史诗胜利！你击败了三阶段终焉魔王酷霸王，拯救了蘑菇王国！',

    ftBurn: '🔥灼烧',
    ftIceBreak: (dmg) => `❄️冰爆破甲 ${dmg}!`,
    ftShadowBlast: '👻幻影爆破',
    ftParry: '🦅完美弹反!',
    ftMeteorSlam: '☄️陨石震地',
    ftShellRam: '🐢龟壳冲撞',
    ftShellBreak: '🐢龟壳破甲',
    ftStarRam: '🌟彩虹冲撞',
    ftShellKick: '🐢龟壳飞踢!',
    ftIceShatter: '❄️冰爆碎裂',
    ftStompCombo: (n) => `🥾连踩x${n}`,
    ftBossStomp: (n) => `🥾踩头x${n}`,
    ftThunderBoots: '🌩️雷靴',
    ftFireproof: '🛡️防火免疫',
    ftSpinParry: '🌪️旋风弹反!',
    ftChainLight: '⚡连锁雷击',
    ftFrost: '🧊霜冻',
    ftBlast: '💥爆破',
    ftRainbowStar: '🌟无敌彩虹星!'
  }
};

export function t(key, ...args) {
  const dict = UI_STRINGS[currentLang] || UI_STRINGS.en;
  const val = dict[key];
  if (typeof val === 'function') return val(...args);
  return val ?? key;
}

export function applyDomTranslations() {
  const dict = UI_STRINGS[currentLang] || UI_STRINGS.en;
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = dict.pageTitle;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && dict[key] !== undefined && typeof dict[key] === 'string') {
      el.textContent = dict[key];
    }
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (key && dict[key] !== undefined && typeof dict[key] === 'string') {
      el.innerHTML = dict[key];
    }
  });

  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (key && dict[key] !== undefined && typeof dict[key] === 'string') {
      el.setAttribute('aria-label', dict[key]);
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key && dict[key] !== undefined && typeof dict[key] === 'string') {
      el.setAttribute('title', dict[key]);
    }
  });

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    const isActive = btn.getAttribute('data-lang') === currentLang;
    btn.classList.toggle('active', isActive);
    if (btn.tagName === 'A') {
      if (isActive) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    } else {
      btn.setAttribute('aria-pressed', String(isActive));
    }
  });
}
