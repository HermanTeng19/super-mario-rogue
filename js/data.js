// Weapons, Roguelite Perks, Biome Stages & Shop Data (Bilingual EN / ZH)

export const WEAPONS = [
  {
    id: 'fire_flower',
    key: '1',
    nameEn: 'Fire Flower Staff',
    shortNameEn: 'Fire Staff',
    nameZh: '烈焰花法杖',
    icon: '🔥',
    unlockedByDefault: true,
    cost: 0,
    baseDamage: 22,
    cooldown: 0.26,
    speed: 440,
    descEn: 'Launches bouncing fireballs that inflict [Burn] DoT. Upgrading adds extra fireballs and blast radius.',
    descZh: '发射在地面弹跳的炽热火球，命中敌人附加【灼烧】持续伤害。升级可增加火球数量与爆炸半径。',
    palette: { hat: '#ffffff', shirt: '#e52521', overalls: '#e52521', accent: '#ff9800' }
  },
  {
    id: 'heavy_hammer',
    key: '2',
    nameEn: 'Hammer Bros. Mallet',
    shortNameEn: 'War Mallet',
    nameZh: '重装战锤',
    icon: '🔨',
    unlockedByDefault: true,
    cost: 0,
    baseDamage: 46,
    cooldown: 0.44,
    speed: 360,
    descEn: 'Hurls high-arc armor-piercing warhammers that crush Buzzy Beetles and pierce through foes!',
    descZh: '高抛物线投掷重型破甲战锤，无视钢盔龟护甲并造成眩晕重击！贴身时附带近战顺劈。',
    palette: { hat: '#263238', shirt: '#455a64', overalls: '#d97706', accent: '#facc15' }
  },
  {
    id: 'boomerang_star',
    key: '3',
    nameEn: 'Boomerang Flower',
    shortNameEn: 'Boomerang',
    nameZh: '旋风回旋花',
    icon: '🪃',
    unlockedByDefault: false,
    cost: 45,
    baseDamage: 26,
    cooldown: 0.36,
    speed: 480,
    descEn: 'Throws a piercing star boomerang that hits both ways and magnetizes coins & EXP gems along its path!',
    descZh: '投出穿透群怪的星辉回旋镖，飞出与折返均可造成伤害，并自动吸附沿途金币与经验宝石！',
    palette: { hat: '#0284c7', shirt: '#ffffff', overalls: '#0369a1', accent: '#38bdf8' }
  },
  {
    id: 'ice_blaster',
    key: '4',
    nameEn: 'Ice Storm Blaster',
    shortNameEn: 'Ice Storm',
    nameZh: '极寒冰晶炮',
    icon: '❄️',
    unlockedByDefault: false,
    cost: 55,
    baseDamage: 24,
    cooldown: 0.28,
    speed: 490,
    descEn: 'Fires freezing icicles! Stomping a [Frozen] foe triggers a massive 300% AoE [Ice Shatter]!',
    descZh: '发射极寒冰锥冻结敌人！踩踏或重锤命中【冰冻】状态的敌人将触发300%范围【冰爆碎裂】！',
    palette: { hat: '#38bdf8', shirt: '#0284c7', overalls: '#e0f2fe', accent: '#7dd3fc' }
  },
  {
    id: 'thunder_wand',
    key: '5',
    nameEn: 'Thunder Star Wand',
    shortNameEn: 'Thunder',
    nameZh: '雷霆星辉杖',
    icon: '⚡',
    unlockedByDefault: false,
    cost: 70,
    baseDamage: 32,
    cooldown: 0.34,
    speed: 620,
    descEn: 'Fires high-velocity lightning bolts that trigger [Chain Lightning] arcing across up to 4 nearby enemies!',
    descZh: '释放高速雷电脉冲，命中后在周围最多4名敌人之间触发【连锁闪电】并麻痹目标！',
    palette: { hat: '#facc15', shirt: '#581c87', overalls: '#eab308', accent: '#fef08a' }
  },
  {
    id: 'cape_blade',
    key: '6',
    nameEn: 'Golden Cape Blade',
    shortNameEn: 'Cape Blade',
    nameZh: '黄金披风旋刃',
    icon: '🦅',
    unlockedByDefault: false,
    cost: 80,
    baseDamage: 38,
    cooldown: 0.24,
    speed: 320,
    descEn: 'Unleashes sweeping golden cyclone slashes that [Parry & Reflect] enemy projectiles (2x dmg) and grant midair lift!',
    descZh: '挥舞黄金斗篷释放近身旋风刀波，可直接【弹反敌方飞行道具】（双倍伤害）并在空中短暂滑翔！',
    palette: { hat: '#e52521', shirt: '#facc15', overalls: '#1d4ed8', accent: '#fde047' }
  }
];

export const PERKS_POOL = [
  // --- Stomp & Jump Attack Synergies ---
  {
    id: 'thunder_boots',
    nameEn: 'Thundercloud Boots',
    nameZh: '雷霆踏云靴',
    icon: '🌩️',
    rarity: 'epic',
    descEn: 'Every enemy stomp unleashes Chain Lightning from the impact point dealing 35 shock damage nearby.',
    descZh: '每次踩踏敌人时，以落点为中心释放一道连锁闪电，对周围敌人造成 35 点雷电伤害。',
    apply: (p) => { p.perks.thunderBoots = (p.perks.thunderBoots || 0) + 1; }
  },
  {
    id: 'vampiric_stomp',
    nameEn: 'Crimson Leech Boots',
    nameZh: '猩红嗜血铁靴',
    icon: '🩸',
    rarity: 'rare',
    descEn: 'Defeating an enemy with an aerial stomp restores 8 HP and increases base stomp damage by +15%.',
    descZh: '跳跃踩踏或陨石下砸击败敌人时，立即恢复 8 点生命值，并提升 15% 踩踏基础伤害。',
    apply: (p) => {
      p.perks.vampStomp = (p.perks.vampStomp || 0) + 1;
      p.stompDamage = Math.round(p.stompDamage * 1.15);
    }
  },
  {
    id: 'sky_jumper',
    nameEn: 'Winged Multi-Jump',
    nameZh: '羽翼多重跳',
    icon: '🪽',
    rarity: 'epic',
    descEn: 'Gain +1 extra midair jump and boost critical hit chance by +8%!',
    descZh: '空中可额外多跳跃 +1 次，且每次空中连跳后 2 秒内暴击率提升 +15%！',
    apply: (p) => {
      p.maxJumps += 1;
      p.critChance = Math.min(0.85, p.critChance + 0.08);
    }
  },
  {
    id: 'meteor_pound',
    nameEn: 'Molten Meteor Slam',
    nameZh: '熔核陨石震地',
    icon: '☄️',
    rarity: 'legendary',
    descEn: 'Midair [S/↓] Ground Pound shockwave radius +60%, damage +45%, and erupts blazing fire pillars!',
    descZh: '空中按 [S/↓] 发动的陨石下砸冲击波半径扩大 60%，伤害提升 +45%，并在地面喷发3枚烈焰火柱！',
    apply: (p) => {
      p.perks.meteorPound = (p.perks.meteorPound || 0) + 1;
      p.stompDamage += 14;
    }
  },
  {
    id: 'combo_master',
    nameEn: 'Endless Air-Combo Master',
    nameZh: '无尽空连大师',
    icon: '🔥',
    rarity: 'rare',
    descEn: 'Aerial stomp combo scaling jumps from +25% to +45% per stack, with boosted bounce height.',
    descZh: '不落地连续踩踏的伤害递增倍率从每层 +25% 提升至 +45%，且每踩踏一次弹跳高度微幅提升。',
    apply: (p) => {
      p.perks.comboMaster = (p.perks.comboMaster || 0) + 1;
    }
  },
  {
    id: 'spiky_soles',
    nameEn: 'Bowser Spike Soles',
    nameZh: '库巴钉刺战靴',
    icon: '🥾',
    rarity: 'common',
    descEn: 'Base Stomp Power +16, and safely stomp spiky Piranha Plants & Bowser shells without taking recoil!',
    descZh: '踩踏基础威力 +16，且现在可以直接踩踏带刺食人花与烈焰怪而不受反伤！',
    apply: (p) => {
      p.stompDamage += 16;
      p.perks.safeStomp = true;
    }
  },

  // --- Weapon & Projectile Synergies ---
  {
    id: 'multishot_star',
    nameEn: 'Twin-Star Multishot',
    nameZh: '双子星辉散射',
    icon: '✨',
    rarity: 'legendary',
    descEn: 'All weapons fire +1 extra projectile per attack and gain +15% overall weapon damage!',
    descZh: '所有武器每次攻击额外发射 +1 枚弹体，武器总伤害提升 +15%！',
    apply: (p) => {
      p.bonusProjectiles += 1;
      p.atkMultiplier += 0.15;
    }
  },
  {
    id: 'elemental_overload',
    nameEn: 'Elemental Fusion Core',
    nameZh: '元素聚变核心',
    icon: '🔮',
    rarity: 'epic',
    descEn: 'Weapon damage +28%, and burn, freeze, and chain lightning durations are dramatically amplified!',
    descZh: '武器伤害提升 +28%，火球灼烧、寒冰冻结与雷电链的触发概率与持续时间翻倍！',
    apply: (p) => {
      p.atkMultiplier += 0.28;
      p.perks.elementalOverload = (p.perks.elementalOverload || 0) + 1;
    }
  },
  {
    id: 'rapid_gloves',
    nameEn: 'Gale Throwing Gloves',
    nameZh: '疾风投掷手套',
    icon: '🧤',
    rarity: 'common',
    descEn: 'Reduces all weapon attack cooldowns by 18% for rapid-fire barrages.',
    descZh: '所有武器攻击冷却时间缩短 20%，弹道飞行速度提升 18%。',
    apply: (p) => {
      p.cooldownReduction = Math.min(0.65, p.cooldownReduction + 0.18);
    }
  },
  {
    id: 'giant_arsenal',
    nameEn: 'Mega Mushroom Coating',
    nameZh: '巨化蘑菇涂层',
    icon: '🍄',
    rarity: 'rare',
    descEn: 'Weapon projectiles grow +40% larger and deal +22% bonus damage!',
    descZh: '发射的武器弹体体积增大 45%，伤害提升 +22%，并具备更强的击退效果。',
    apply: (p) => {
      p.projectileScale += 0.4;
      p.atkMultiplier += 0.22;
    }
  },
  {
    id: 'homing_spores',
    nameEn: 'Starlight Homing Guidance',
    nameZh: '星灵追踪导引',
    icon: '🎯',
    rarity: 'epic',
    descEn: 'Projectiles gently curve toward the nearest enemy, plus +10% critical hit chance.',
    descZh: '发射的火球、冰锥与战锤会自动朝最近的敌人微调弯曲追踪，暴击率 +10%。',
    apply: (p) => {
      p.perks.homing = true;
      p.critChance = Math.min(0.85, p.critChance + 0.1);
    }
  },
  {
    id: 'stomp_barrage',
    nameEn: 'Skyfall Star Barrage',
    nameZh: '踏天星雨',
    icon: '🌠',
    rarity: 'legendary',
    descEn: 'Every successful enemy stomp fires your equipped weapon left & right automatically for free!',
    descZh: '每次成功踩踏敌人时，自动向左右两侧免费齐射当前装备的主武器弹幕！',
    apply: (p) => {
      p.perks.stompBarrage = (p.perks.stompBarrage || 0) + 1;
    }
  },

  // --- Dash, Defense & Survival Synergies ---
  {
    id: 'shadow_dash',
    nameEn: 'Phantom Afterimage Dash',
    nameZh: '幻影残像冲刺',
    icon: '👻',
    rarity: 'epic',
    descEn: 'Dashing (K/Shift) leaves behind a blazing Mario decoy that explodes for 45 AoE damage!',
    descZh: '冲刺 (K/Shift) 距离延长，且在起点留下一道马里奥火焰残影，0.4秒后爆炸造成 45 点范围伤害！',
    apply: (p) => {
      p.perks.shadowDash = (p.perks.shadowDash || 0) + 1;
    }
  },
  {
    id: 'super_heart',
    nameEn: 'Golden Vitality Mushroom',
    nameZh: '黄金生命蘑菇',
    icon: '❤️',
    rarity: 'common',
    descEn: 'Max HP +35 and instantly recover 45 HP.',
    descZh: '最大生命值上限 +35，并立即恢复 45 点生命值。',
    apply: (p) => {
      p.maxHp += 35;
      p.hp = Math.min(p.maxHp, p.hp + 45);
    }
  },
  {
    id: 'star_overdrive',
    nameEn: 'Rainbow Star Core',
    nameZh: '无敌彩虹星核',
    icon: '🌟',
    rarity: 'legendary',
    descEn: 'Gain 6s [Rainbow Star] invincibility now! Auto-triggers 4.5s Star Power every 12 kills!',
    descZh: '立即进入 6 秒【无敌彩虹星】状态！且每累计击败 12 名敌人自动触发 4 秒无敌冲撞！',
    apply: (p) => {
      p.starTimer = Math.max(p.starTimer, 6.0);
      p.perks.starOnKills = true;
    }
  },
  {
    id: 'thorns_shell',
    nameEn: 'Spiked Koopa Armor',
    nameZh: '绿龟反伤护甲',
    icon: '🐢',
    rarity: 'common',
    descEn: 'Damage taken -22%, and taking damage launches 4 bouncing counter-attack shell shards.',
    descZh: '受到伤害降低 25%，受伤时无敌帧延长，并向四周发射4枚反弹龟壳碎片。',
    apply: (p) => {
      p.damageReduction = Math.min(0.6, p.damageReduction + 0.22);
      p.perks.thornsShell = (p.perks.thornsShell || 0) + 1;
    }
  },

  // --- Economy, Crit & Utility Synergies ---
  {
    id: 'golden_greed',
    nameEn: 'Crown of Golden Greed',
    nameZh: '黄金皇冠贪婪',
    icon: '👑',
    rarity: 'epic',
    descEn: 'Gain +40 Coins immediately! Every 10 Coins held increases ALL damage by +3% (unlimited)!',
    descZh: '立即获得 +40 金币！你每持有 10 枚金币，所有伤害额外提升 +3%（无上限）！',
    apply: (p) => {
      p.coins += 40;
      p.perks.coinDamage = (p.perks.coinDamage || 0) + 1;
    }
  },
  {
    id: 'star_magnet',
    nameEn: 'Star Gravity Emblem',
    nameZh: '星之引力徽章',
    icon: '🧲',
    rarity: 'common',
    descEn: 'Greatly widens Coin & EXP Gem pickup magnet radius and boosts EXP gain by +30%!',
    descZh: '金币与经验宝石自动吸附范围扩大 250%，且获取的经验值提升 +30%！',
    apply: (p) => {
      p.pickupRadius += 150;
      p.xpMultiplier += 0.3;
    }
  },
  {
    id: 'lethal_crit',
    nameEn: 'Lethal Weakpoint Lens',
    nameZh: '致命弱点透镜',
    icon: '💥',
    rarity: 'rare',
    descEn: 'Critical Hit Chance +16% and Critical Hit Multiplier +50%!',
    descZh: '暴击率提升 +16%，暴击伤害倍率从 160% 提升至 220%！',
    apply: (p) => {
      p.critChance = Math.min(0.9, p.critChance + 0.16);
      p.critDamage += 0.5;
    }
  },
  {
    id: 'extra_life',
    nameEn: '1-UP Emerald Mushroom',
    nameZh: '1-UP 翠绿神菇',
    icon: '🍀',
    rarity: 'legendary',
    descEn: 'Gain +1 Full-HP Revive with Rainbow Star invincibility, plus +15 Max HP!',
    descZh: '获得 +1 次【原地满血复活】机会，并在复活时释放全屏无敌星陨冲击波！',
    apply: (p) => {
      p.lives += 1;
      p.maxHp += 15;
      p.hp = Math.min(p.maxHp, p.hp + 30);
    }
  },
  {
    id: 'ice_nova_step',
    nameEn: 'Frost Winter Step',
    nameZh: '霜冻凛冬步',
    icon: '🧊',
    rarity: 'rare',
    descEn: 'Double-jumping unleashes a Frost Nova beneath Mario, freezing nearby enemies for 2.6s.',
    descZh: '二段跳与旋风跳时在脚下绽放冰霜新星，冻结周围敌人 2.5 秒。',
    apply: (p) => {
      p.perks.iceJump = (p.perks.iceJump || 0) + 1;
    }
  },
  {
    id: 'mystery_smith',
    nameEn: "Toad's Master Forge",
    nameZh: '奇诺比奥神匠锤',
    icon: '⚒️',
    rarity: 'epic',
    descEn: 'Instantly upgrades ALL weapons by +1 Level and boosts base attack multiplier by +20%!',
    descZh: '当前所有已解锁武器的等级立即 +1，且基础攻击倍率 +20%！',
    apply: (p) => {
      Object.keys(p.weaponLevels).forEach(k => {
        p.weaponLevels[k] += 1;
      });
      p.atkMultiplier += 0.2;
    }
  },
  {
    id: 'shell_summoner',
    nameEn: 'Shell Summoner Horn',
    nameZh: '龟壳召唤号角',
    icon: '🐚',
    rarity: 'rare',
    descEn: 'Landing a Ground Pound automatically launches a high-speed spinning Koopa Shell forward!',
    descZh: '每当使用陨石下砸落地时，自动在身边召唤一枚高速横冲直撞的绿龟壳！',
    apply: (p) => {
      p.perks.poundShell = true;
    }
  },
  {
    id: 'berserker_mustache',
    nameEn: 'Berserker Mustache',
    nameZh: '狂战大胡子',
    icon: '🥸',
    rarity: 'rare',
    descEn: 'Move Speed +18%, Jump Height +8%, Weapon Damage +20%, and Stomp Power +10.',
    descZh: '移动速度提升 +18%，跳跃高度提升 +10%，踩踏与武器伤害各提升 +20%。',
    apply: (p) => {
      p.speedMultiplier += 0.18;
      p.jumpMultiplier += 0.08;
      p.atkMultiplier += 0.2;
      p.stompDamage += 10;
    }
  }
];

export const STAGES = [
  {
    index: 0,
    code: 'WORLD 1-1',
    nameEn: 'Mushroom Emerald Plains',
    nameZh: '蘑菇翡翠平原',
    icon: '🌳',
    subtitleEn: 'Stomp Goombas & Koopas · Smash ? Blocks for Star EXP',
    subtitleZh: '踩踏栗宝宝与绿龟 · 顶碎问号砖收集星之经验',
    skyTop: '#1e40af',
    skyBottom: '#60a5fa',
    hillColor: '#15803d',
    groundTop: '#4ade80',
    groundFill: '#92400e',
    brickColor: '#b45309',
    length: 3400,
    enemies: ['goomba', 'koopa', 'piranha', 'paratroopa'],
    isBossStage: false
  },
  {
    index: 1,
    code: 'WORLD 1-2',
    nameEn: 'Abyssal Crystal Cavern',
    nameZh: '幽暗水晶地窟',
    icon: '💎',
    subtitleEn: 'Beware fireproof Buzzy Beetles & Hammer Bros · Crush armor with Mallets & Ground Pounds',
    subtitleZh: '小心防火钢盔龟与重锤兄弟 · 善用重锤与下砸破甲',
    skyTop: '#090d16',
    skyBottom: '#1e1b4b',
    hillColor: '#312e81',
    groundTop: '#38bdf8',
    groundFill: '#1e293b',
    brickColor: '#334155',
    length: 3600,
    enemies: ['buzzy', 'hammerbro', 'swooper', 'goomba', 'piranha'],
    isBossStage: false
  },
  {
    index: 2,
    code: 'WORLD 1-3',
    nameEn: 'Gale Sky Ruins',
    nameZh: '云端疾风遗迹',
    icon: '☁️',
    subtitleEn: 'Floating islands & Lakitu bombers · Unleash extreme aerial stomp chains!',
    subtitleZh: '高空弹跳浮岛与拉基图投弹手 · 施展极限空中连踩！',
    skyTop: '#0284c7',
    skyBottom: '#bae6fd',
    hillColor: '#7dd3fc',
    groundTop: '#fef08a',
    groundFill: '#d97706',
    brickColor: '#f59e0b',
    length: 3800,
    enemies: ['paratroopa', 'lakitu', 'hammerbro', 'koopa'],
    isBossStage: false
  },
  {
    index: 3,
    code: 'WORLD 1-4',
    nameEn: 'Phantom Ghost Keep',
    nameZh: '幻影幽灵古堡',
    icon: '👻',
    subtitleEn: 'Shy Boos & Magikoopa sorcerers lurk inside the haunted corridors',
    subtitleZh: '害羞幽灵 Boo 与卡美克魔导师潜伏于迷廊之中',
    skyTop: '#0f071e',
    skyBottom: '#2e1065',
    hillColor: '#3b0764',
    groundTop: '#a855f7',
    groundFill: '#1f1235',
    brickColor: '#4c1d95',
    length: 3900,
    enemies: ['boo', 'magikoopa', 'buzzy', 'hammerbro'],
    isBossStage: false
  },
  {
    index: 4,
    code: 'FINAL KEEP',
    nameEn: "Bowser's Molten Citadel",
    nameZh: '酷霸王终焉熔岩魔城',
    icon: '👑',
    subtitleEn: 'Breach the royal vanguard · Face 3-Phase Mecha-Crowned Bowser!',
    subtitleZh: '突破皇家禁卫防线 · 迎战三阶段终焉魔王酷霸王 (BOWSER)！',
    skyTop: '#180404',
    skyBottom: '#450a0a',
    hillColor: '#7f1d1d',
    groundTop: '#f97316',
    groundFill: '#27272a',
    brickColor: '#52525b',
    length: 2500,
    enemies: ['hammerbro', 'magikoopa', 'buzzy'],
    isBossStage: true
  }
];
