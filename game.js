(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const overlayIcon = document.getElementById('overlayIcon');
  const overlayEyebrow = document.getElementById('overlayEyebrow');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayText = document.getElementById('overlayText');
  const overlayButton = document.getElementById('overlayButton');
  const pauseButton = document.getElementById('pauseButton');
  const levelLabel = document.getElementById('levelLabel');
  const coinLabel = document.getElementById('coinLabel');
  const livesLabel = document.getElementById('livesLabel');
  const powerLabel = document.getElementById('powerLabel');
  const gameMessage = document.getElementById('gameMessage');
  const soundButton = document.getElementById('soundButton');
  const classLabel = document.getElementById('classLabel');
  const xpLabel = document.getElementById('xpLabel');
  const xpBar = document.getElementById('xpBar');
  const hpLabel = document.getElementById('hpLabel');
  const energyLabel = document.getElementById('energyLabel');
  const rewardList = document.getElementById('rewardList');
  const interactionLabel = document.getElementById('interactionLabel');
  const CLASSES = {
    warrior: { name: 'Guerreiro', color: '#e8b47b', hp: 5, speed: 300, attack: 'melee', interval: .36, dodge: 1.1, cost: 0, skill: 'Redemoinho', skillCost: 35, weapon: 'Espada' },
    mage: { name: 'Mago', color: '#bd9dff', hp: 3, speed: 300, attack: 'magic', interval: .48, dodge: 1.1, cost: 10, skill: 'Explosão arcana', skillCost: 35, weapon: 'Cajado' },
    rogue: { name: 'Ladrão', color: '#93e7cf', hp: 3, speed: 355, attack: 'melee', interval: .23, dodge: .75, cost: 0, skill: 'Véu das sombras', skillCost: 25, weapon: 'Adagas' },
    archer: { name: 'Arqueiro', color: '#b6d996', hp: 4, speed: 325, attack: 'arrow', interval: .38, dodge: 1, cost: 5, skill: 'Chuva de flechas', skillCost: 25, weapon: 'Arco' },
  };
  let selectedClass = 'warrior';
  let progress = { level: 1, xp: 0, gold: 0, bonusHp: 0, bonusDamage: 0, bonusEnergy: 0, kills: 0, claims: new Set(), rewards: [] };
  const MAX_LEVEL = 15;
  function heroClass() { return CLASSES[selectedClass]; }
  function maxHp() { return heroClass().hp + progress.bonusHp; }
  function maxEnergy() { return 100 + progress.bonusEnergy; }
  function xpNeeded() { return 60 + (progress.level - 1) * 35; }
  function attackDamage() { return WEAPONS[weaponTier].damage + progress.bonusDamage; }
  function equippedName() { return `${heroClass().weapon} ${['de treino', 'da Aurora', 'do Vento', 'Astral', 'Lunar', 'do Eclipse'][weaponTier]}`; }
  const POWER_TYPES = {
    shield: { name: 'Escudo', icon: '◆', color: '#71e4ff', duration: 10 },
    jump: { name: 'Super salto', icon: '↑', color: '#b6ff8a', duration: 12 },
    heart: { name: 'Vida extra', icon: '♥', color: '#ff92ae' },
  };
  const MAX_LIVES = 5;
  let audio;
  let muted = false;
  try { muted = localStorage.getItem('salto-som') === 'off'; } catch {}
  function enableAudio() {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (Audio && !audio) audio = new Audio();
      if (audio?.state === 'suspended') audio.resume().catch(() => {});
    } catch {}
  }
  function sound(kind) {
    if (muted || !audio || audio.state !== 'running') return;
    const notes = { jump: [330, 520], star: [880, 1175], power: [440, 660, 880], checkpoint: [523, 659, 784], hurt: [220, 110], stomp: [160, 320], portal: [523, 659, 784, 1047], shot: [180, 90], slash: [340, 170], hit: [170, 260], block: [460, 230], dodge: [420, 180], equip: [392, 523, 784] }[kind] || [440];
    try {
      notes.forEach((frequency, i) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        const start = audio.currentTime + i * .07;
        osc.type = kind === 'hurt' || kind === 'shot' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(.0001, start);
        gain.gain.exponentialRampToValueAtTime(.09, start + .01);
        gain.gain.exponentialRampToValueAtTime(.0001, start + .13);
        osc.connect(gain); gain.connect(audio.destination);
        osc.start(start); osc.stop(start + .14);
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };
      });
    } catch {}
  }
  function updateSoundButton() {
    soundButton.textContent = muted ? 'Som: desligado' : 'Som: ligado';
    soundButton.setAttribute('aria-pressed', String(!muted));
  }
  soundButton.addEventListener('click', () => {
    muted = !muted; enableAudio(); updateSoundButton();
    try { localStorage.setItem('salto-som', muted ? 'off' : 'on'); } catch {}
    if (!muted) sound('star');
  });
  updateSoundButton();

  const W = canvas.width;
  const H = canvas.height;
  const GROUND = 500;
  const JUMP = -720;
  const GRAVITY = 1900;
  const controls = { left: false, right: false, jump: false, attack: false, dodge: false, skill: false, interact: false };
  const keyMap = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
    KeyJ: 'attack', KeyZ: 'attack',
    KeyK: 'dodge', ShiftLeft: 'dodge', ShiftRight: 'dodge',
    KeyL: 'skill', KeyQ: 'skill', KeyE: 'interact',
  };
  const WEAPONS = [
    { name: 'Lâmina de treino', color: '#d4e4ed', reach: 43, damage: 1 },
    { name: 'Espada da Aurora', color: '#ffdb8b', reach: 53, damage: 1 },
    { name: 'Lâmina do Vento', color: '#a2f5dd', reach: 61, damage: 2 },
    { name: 'Espada Astral', color: '#b5bcff', reach: 67, damage: 2 },
    { name: 'Lâmina Lunar', color: '#e9dcff', reach: 73, damage: 3 },
    { name: 'Espada do Eclipse', color: '#ff9fba', reach: 80, damage: 3 },
  ];

  const LEVELS = [
    {
      name: 'Colinas do Amanhecer', width: 2200,
      ground: [[0, 600], [720, 1320], [1440, 2200]],
      platforms: [[250, 405, 145], [835, 390, 145], [1110, 355, 125], [1570, 405, 150], [1830, 375, 135]],
      stars: [[180, 450], [305, 355], [480, 450], [660, 375], [890, 340], [1165, 305], [1510, 365], [1630, 355], [1875, 325], [2040, 450]],
      spikes: [[525, 464], [1230, 464], [1660, 464], [1735, 464]],
      enemies: [[385, 300, 500, 75], [955, 830, 1065, 82], [1940, 1830, 2050, 90]],
      bonusEnemies: [[1170, 1090, 1280, 'sentinel']],
      loot: { sword: [1875, 335], power: ['shield', 1625, 365] },
    },
    {
      name: 'Vale dos Ventos', width: 2500,
      ground: [[0, 520], [645, 1120], [1245, 1795], [1920, 2500]],
      platforms: [[290, 400, 145], [475, 365, 110], [785, 390, 150], [1020, 355, 130], [1350, 405, 150], [1670, 370, 125], [2040, 400, 140], [2250, 360, 120]],
      stars: [[165, 450], [340, 350], [540, 315], [705, 370], [845, 340], [1075, 305], [1185, 355], [1410, 355], [1730, 320], [1855, 370], [2100, 350], [2300, 310]],
      spikes: [[425, 464], [970, 464], [1490, 464], [1575, 464], [2190, 464]],
      enemies: [[220, 160, 375, 85], [880, 745, 1030, 93], [1510, 1360, 1700, 95], [2110, 1990, 2260, 100]],
      bonusEnemies: [[1450, 1380, 1650, 'spitter'], [2310, 2220, 2420, 'sentinel']],
      loot: { sword: [2290, 320], power: ['jump', 2090, 360] },
    },
    {
      name: 'Céu das Estrelas', width: 2800,
      ground: [[0, 580], [705, 1190], [1315, 1810], [1935, 2390], [2515, 2800]],
      platforms: [[260, 400, 140], [470, 355, 120], [800, 390, 140], [1030, 345, 130], [1410, 395, 140], [1660, 350, 130], [2040, 390, 150], [2280, 350, 125], [2540, 390, 120]],
      stars: [[155, 450], [320, 350], [520, 305], [645, 360], [855, 340], [1085, 295], [1250, 365], [1465, 345], [1715, 300], [1870, 370], [2100, 340], [2340, 300], [2450, 360], [2610, 340]],
      spikes: [[410, 464], [960, 464], [1535, 464], [1690, 464], [2175, 464], [2650, 464]],
      enemies: [[180, 120, 350, 100], [865, 740, 1060, 105], [1450, 1340, 1650, 110], [2110, 2000, 2290, 110], [2600, 2550, 2720, 115]],
      bonusEnemies: [[1120, 1030, 1170, 'sentinel'], [2220, 2060, 2360, 'spitter']],
      loot: { sword: [2585, 350], power: ['heart', 2090, 350] },
    },
    {
      name: 'Floresta da Lua', width: 3000, theme: 'moon',
      ground: [[0, 580], [705, 1290], [1415, 2050], [2175, 3000]],
      platforms: [[230, 400, 140], [470, 350, 120], [840, 390, 140], [1120, 340, 130], [1530, 390, 150], [1830, 345, 140], [2300, 390, 140], [2600, 350, 140]],
      stars: [[150, 450], [290, 350], [525, 300], [640, 365], [900, 340], [1180, 290], [1350, 360], [1600, 340], [1900, 295], [2110, 365], [2360, 340], [2670, 300], [2860, 450]],
      spikes: [[410, 464], [1030, 464], [1730, 464], [2370, 464], [2510, 464]],
      enemies: [[300, 160, 370, 100], [950, 760, 1050, 110], [1670, 1500, 1770, 115], [2440, 2280, 2510, 120]],
      bonusEnemies: [[1140, 1020, 1240, 'spitter'], [1910, 1810, 2010, 'sentinel'], [2690, 2580, 2870, 'stalker']],
      loot: { sword: [2650, 310], power: ['shield', 1890, 305] },
    },
    {
      name: 'Fortaleza do Eclipse', width: 3200, theme: 'eclipse', boss: true,
      ground: [[0, 650], [775, 1710], [1835, 3200]],
      platforms: [[270, 400, 140], [520, 350, 120], [900, 390, 150], [1230, 345, 140], [1510, 390, 130], [2030, 380, 140]],
      stars: [[150, 450], [330, 350], [580, 300], [715, 365], [970, 340], [1290, 295], [1570, 340], [1770, 365], [2100, 330], [2300, 450], [2950, 450]],
      spikes: [[440, 464], [1100, 464], [1440, 464], [2420, 464]],
      enemies: [[290, 140, 400, 105], [990, 840, 1080, 110], [1530, 1480, 1630, 115]],
      bonusEnemies: [[1290, 1210, 1390, 'sentinel'], [2150, 2000, 2230, 'spitter']],
      loot: { sword: [2090, 340], power: ['heart', 1570, 350] },
    },
  ];

  LEVELS.forEach((design, index) => {
    const oldWidth = design.width;
    design.width += index === 4 ? 2800 : 2200;
    design.objects = [{ type: 'sign', x: 150, y: GROUND - 48, w: 26, h: 48, text: 'Mobs dão XP e moedas. No nível 3 você aprende sua habilidade. E interage; L/Q usa a habilidade.' }];
    design.crates = [];
    design.objects.push({ type: 'lever', x: oldWidth - 150, y: GROUND - 38, w: 24, h: 38, bridge: [oldWidth, 130] });
    for (let section = 0; section < 3; section++) {
      const start = oldWidth + [130, 875, 1610][section];
      const end = section === 2 ? design.width : start + 620;
      design.ground.push([start, end]);
      design.platforms.push([start + 100, 400, 110], [start + 320, 350, 100], [start + 440, 290, 90]);
      design.stars.push([start + 155, 355], [start + 370, 305], [start + 485, 245], [start + 555, 450]);
      design.spikes.push([start + 265, 464], [start + 490, 464]);
      design.bonusEnemies.push([start + 210, start + 140, start + 390, section === 1 ? 'sentinel' : 'stalker']);
      design.bonusEnemies.push([start + 540, start + 400, Math.min(end - 55, start + 580), section === 2 ? 'sentinel' : 'spitter']);
      design.crates.push({ x: start + 170, y: GROUND - 30, w: 28, h: 30, hp: 2 });
      if (section === 1) {
        design.objects.push({ type: 'chest', x: start + 465, y: 263, w: 34, h: 27, guardIndex: design.enemies.length + design.bonusEnemies.length - 2 });
        design.objects.push({ type: 'shrine', x: start + 80, y: GROUND - 54, w: 30, h: 54 });
      }
    }
    design.loot.sword = [oldWidth + 875 + 370, 310];
    design.loot.power[1] = oldWidth + 1610 + 485;
    design.loot.power[2] = 255;
  });

  let state = 'menu';
  let levelIndex = 0;
  let lives = 3;
  let totalStars = 0;
  let levelStars = 0;
  let elapsed = 0;
  let level;
  let player;
  let camera = 0;
  let jumpQueued = false;
  let attackQueued = false;
  let dodgeQueued = false;
  let skillQueued = false;
  let interactQueued = false;
  let weaponTier = 0;
  let particles = [];
  let lastFrame = 0;
  let accumulator = 0;
  let checkpoint;
  let levelStartStars = 0;
  let messageTime = 0;
  let floaters = [];
  let afterimages = [];
  let screenShake = 0;
  let nearestObject = null;
  function notify(message) { gameMessage.textContent = message; messageTime = 4; }
  function floatText(text, x, y, color = '#fff') { floaters.push({ text, x, y, color, life: 1.3 }); }
  function rewardXp(amount, claimId) {
    if (progress.claims.has(claimId)) return;
    progress.claims.add(claimId);
    progress.kills++;
    progress.gold += 5 + levelIndex;
    if (progress.level === MAX_LEVEL) { updateHud(); return; }
    progress.xp += amount;
    floatText(`+${amount} XP`, player.x + 15, player.y - 22, '#ffdf8a');
    while (progress.level < MAX_LEVEL && progress.xp >= xpNeeded()) {
      progress.xp -= xpNeeded();
      progress.level++;
      const lv = progress.level;
      let reward;
      if (lv === 3) reward = `${heroClass().skill} desbloqueado (L/Q)`;
      else if (lv === 5) reward = 'Esquiva recarrega 20% mais rápido';
      else if (lv === 9) reward = 'Habilidade recarrega 20% mais rápido';
      else if (lv % 4 === 0) { progress.bonusDamage++; reward = '+1 de dano permanente'; }
      else if (lv % 3 === 0) { progress.bonusEnergy += 20; reward = '+20 de energia máxima'; }
      else { progress.bonusHp++; reward = '+1 de HP máximo'; }
      player.hp = Math.min(maxHp(), player.hp + 2);
      player.energy = maxEnergy();
      progress.rewards.unshift(`Nível ${lv}: ${reward}`);
      progress.rewards = progress.rewards.slice(0, 5);
      notify(`NÍVEL ${lv}! ${reward}`);
      floatText(`NÍVEL ${lv}`, player.x + 15, player.y - 55, heroClass().color);
      burst(player.x + 15, player.y + 21, heroClass().color, 22);
      sound('equip');
    }
    if (progress.level === MAX_LEVEL) progress.xp = 0;
    updateHud();
  }
  function makePlayer(x = 70) {
    return { x, y: GROUND - 42, w: 30, h: 42, vx: 0, vy: 0, onGround: true, coyote: .1, invulnerable: 0, facing: 1, shield: 0, jump: 0, attackTime: 0, attackCooldown: 0, attackHits: new Set(), dashTime: 0, dashCooldown: 0, hp: maxHp(), energy: maxEnergy(), skillCooldown: 0, skillTime: 0, shadow: 0, anim: 0, hurtTime: 0 };
  }

  function makeEnemy([x, min, max, speedOrType], index) {
    const type = typeof speedOrType === 'string' ? speedOrType : ['stalker', 'sentinel', 'spitter'][index % 3];
    const speed = typeof speedOrType === 'number' ? speedOrType : type === 'stalker' ? 120 : 85;
    const hp = (type === 'sentinel' ? 3 : 2) + Math.floor(levelIndex / 2);
    return { id: `${levelIndex}:${index}`, x, y: GROUND - 32, min, max, speed, type, hp, maxHp: hp, dir: 1, alive: true, w: 34, h: 32, stun: 0, windup: 0, charge: 0, attackCooldown: 1.4 + index * .2, guard: 0, alert: false };
  }

  function loadLevel(index) {
    levelIndex = index;
    const design = LEVELS[index];
    level = {
      ...design,
      solids: [
        ...design.ground.map(([start, end]) => ({ x: start, y: GROUND, w: end - start, h: H - GROUND })),
        ...design.platforms.map(([x, y, w]) => ({ x, y, w, h: 20 })),
      ],
      stars: design.stars.map(([x, y]) => ({ x, y, taken: false })),
      spikes: design.spikes.map(([x, y]) => ({ x, y, w: 35, h: 35 })),
      enemyLayout: [...design.enemies, ...design.bonusEnemies],
      enemies: [...design.enemies, ...design.bonusEnemies].map(makeEnemy),
      powers: [{ type: design.loot.power[0], x: design.loot.power[1] - 15, y: design.loot.power[2], w: 30, h: 30, taken: false }],
      weapon: { tier: index + 1, x: design.loot.sword[0] - 15, y: design.loot.sword[1], w: 30, h: 38, taken: false },
      objects: design.objects.map(object => ({ ...object, used: false })),
      crates: design.crates.map(crate => ({ ...crate, broken: false })),
      heroShots: [],
      checkpoints: design.ground.slice(1).map(([x]) => ({ x: x + 55, y: GROUND - 60, w: 24, h: 60, active: false })),
      boss: design.boss ? { x: design.width - 550, y: GROUND - 78, w: 80, h: 78, hp: 32, maxHp: 32, cooldown: 0, attack: 2.4, dir: -1, active: false, volley: 0, lunge: 0 } : null,
      projectiles: [],
      portal: { x: design.width - 100, y: GROUND - 89, w: 50, h: 89 },
    };
    player = makePlayer();
    checkpoint = { x: 70, stars: [] };
    levelStartStars = totalStars;
    jumpQueued = false;
    attackQueued = false;
    dodgeQueued = false;
    skillQueued = interactQueued = false;
    floaters = []; afterimages = []; nearestObject = null;
    messageTime = 0;
    gameMessage.textContent = design.boss ? 'O portal abre quando você derrotar o Guardião do Eclipse.' : 'Equipamentos nas plataformas. J/Z ataca; K/Shift esquiva; E interage.';
    levelStars = 0;
    camera = 0;
    particles = [];
    updateHud();
  }

  function updateHud() {
    const setText = (element, value) => { if (element.textContent !== value) element.textContent = value; };
    setText(levelLabel, `${levelIndex + 1} / ${LEVELS.length}`);
    setText(coinLabel, `${levelStars} / ${level.stars.length}`);
    setText(livesLabel, Array.from({ length: MAX_LIVES }, (_, i) => i < lives ? '♥' : '♡').join(' '));
    const active = ['shield', 'jump'].filter(type => player[type] > 0).map(type => `${POWER_TYPES[type].icon} ${POWER_TYPES[type].name}: ${Math.ceil(player[type])}s`);
    const gear = `${equippedName()} · ${attackDamage()} dano`;
    const dodge = player.dashCooldown <= 0 ? 'Esquiva pronta' : `Esquiva ${Math.ceil(player.dashCooldown * 10) / 10}s`;
    setText(powerLabel, [gear, dodge, ...active].join(' · '));
    setText(classLabel, `${heroClass().name} · Nível ${progress.level}`);
    setText(hpLabel, `${player.hp}/${maxHp()} HP · ${progress.gold} moedas`);
    setText(energyLabel, `${Math.floor(player.energy)}/${maxEnergy()} energia · ${progress.level < 3 ? 'Habilidade no nível 3' : player.skillCooldown > 0 ? `${heroClass().skill}: ${Math.ceil(player.skillCooldown)}s` : `${heroClass().skill} pronta (L/Q)`}`);
    setText(xpLabel, progress.level === MAX_LEVEL ? 'Nível máximo' : `${progress.xp}/${xpNeeded()} XP`);
    xpBar.style.width = `${progress.level === MAX_LEVEL ? 100 : progress.xp / xpNeeded() * 100}%`;
    setText(rewardList, progress.rewards.join(' · ') || 'Próximos prêmios: nível 2 +HP · nível 3 habilidade · nível 4 +dano · nível 5 esquiva mais rápida');
  }

  function showOverlay(icon, eyebrow, title, message, button, action) {
    overlayIcon.textContent = icon;
    overlayEyebrow.textContent = eyebrow;
    overlayTitle.innerHTML = title;
    overlayText.textContent = message;
    overlayButton.innerHTML = `${button} <span>→</span>`;
    overlayButton.onclick = action;
    overlay.classList.remove('hidden');
    pauseButton.disabled = state === 'menu' || state === 'won' || state === 'gameOver';
    document.getElementById('classPicker').classList.toggle('hidden', !['menu', 'won', 'gameOver'].includes(state));
  }

  function hideOverlay() {
    overlay.classList.add('hidden');
    pauseButton.disabled = false;
    document.getElementById('classPicker').classList.add('hidden');
  }

  function startGame() {
    enableAudio();
    weaponTier = 0;
    progress = { level: 1, xp: 0, gold: 0, bonusHp: 0, bonusDamage: 0, bonusEnergy: 0, kills: 0, claims: new Set(), rewards: [] };
    lives = 3;
    totalStars = 0;
    elapsed = 0;
    loadLevel(0);
    state = 'playing';
    hideOverlay();
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      showOverlay('Ⅱ', 'UMA PAUSA NA AVENTURA', 'Jogo pausado', 'Respire fundo. As estrelas esperam por você.', 'Continuar', togglePause);
    } else if (state === 'paused') {
      state = 'playing';
      hideOverlay();
    }
  }

  function burst(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 90 + Math.random() * 150;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 80, life: .55, maxLife: .55, color });
    }
  }

  function die(falling = false, damage = 1) {
    if (state !== 'playing' || (!falling && (player.invulnerable > 0 || player.shield > 0))) return false;
    sound('hurt');
    screenShake = .18;
    burst(player.x + 15, player.y + 21, '#ff8ba6', 15);
    player.hp = falling ? 0 : Math.max(0, player.hp - damage);
    if (player.hp > 0) {
      player.invulnerable = .9;
      player.hurtTime = .16;
      player.vy = -180;
      floatText(`-${damage} HP`, player.x + 15, player.y - 10, '#ff92ae');
      updateHud();
      return true;
    }
    lives--;
    if (lives <= 0) {
      state = 'gameOver';
      updateHud();
      showOverlay('♡', 'TENTE MAIS UMA VEZ', 'Fim de jogo', 'As estrelas ainda estão esperando. Você consegue!', 'Recomeçar', startGame);
    } else {
      player = makePlayer(checkpoint.x);
      player.invulnerable = 2;
      level.stars.forEach((star, i) => { star.taken = checkpoint.stars.includes(i); });
      levelStars = checkpoint.stars.length;
      totalStars = levelStartStars + levelStars;
      level.enemies = level.enemyLayout.map(makeEnemy);
      level.projectiles = [];
      level.heroShots = [];
      if (level.boss) Object.assign(level.boss, { x: level.width - 550, hp: 32, cooldown: 0, attack: 2.4, active: false, volley: 0, lunge: 0 });
      camera = Math.max(0, Math.min(level.width - W, player.x - W * .38));
      jumpQueued = false;
      attackQueued = false;
      dodgeQueued = false;
      skillQueued = interactQueued = false;
      updateHud();
      notify(checkpoint.x > 70 ? 'De volta ao checkpoint!' : 'Tente de novo!');
    }
    return true;
  }

  function finishLevel() {
    if (state !== 'playing') return;
    if (level.boss && level.boss.hp > 0) { notify('Derrote o Guardião com a espada ou golpes na cabeça!'); return; }
    sound('portal');
    burst(level.portal.x + 25, level.portal.y + 38, '#ffe08a', 24);
    if (levelIndex === LEVELS.length - 1) {
      state = 'won';
      const seconds = Math.round(elapsed);
      let record = '';
      try {
        const previous = Number(localStorage.getItem(`salto-recorde-v4-${selectedClass}`)) || Infinity;
        if (seconds < previous) {
          localStorage.setItem(`salto-recorde-v4-${selectedClass}`, String(seconds));
          record = ' Novo recorde!';
        } else {
          record = ` Recorde: ${previous}s.`;
        }
      } catch { /* O jogo também funciona sem armazenamento local. */ }
      showOverlay('✦', 'AVENTURA CONCLUÍDA', 'Você venceu!', `${totalStars} estrelas coletadas em ${seconds}s.${record}`, 'Jogar novamente', startGame);
    } else {
      state = 'levelComplete';
      showOverlay('✦', 'PORTAL ALCANÇADO', 'Fase completa!', `Você coletou ${levelStars} de ${level.stars.length} estrelas em ${level.name}.`, 'Próxima fase', () => {
        loadLevel(levelIndex + 1);
        state = 'playing';
        hideOverlay();
      });
    }
  }

  function intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function meleeBox() {
    const reach = WEAPONS[weaponTier].reach + (selectedClass === 'warrior' ? 10 : -5);
    return { x: player.facing > 0 ? player.x + player.w - 2 : player.x - reach + 2, y: player.y + 2, w: reach, h: player.h - 2 };
  }

  function damageEnemy(enemy, damage, fromAbove = false) {
    if (!enemy.alive) return false;
    const frontalGuard = enemy.type === 'sentinel' && enemy.guard > 0 && !fromAbove && Math.sign(player.x - enemy.x) === enemy.dir;
    if (frontalGuard) {
      sound('block'); burst(enemy.x + enemy.w / 2, enemy.y + 15, '#b8d9ff', 6);
      notify('Guarda bloqueada! Acerte por trás ou após a investida.');
      return false;
    }
    enemy.hp -= damage;
    floatText(`-${damage}`, enemy.x + 17, enemy.y - 10, '#fff1b3');
    screenShake = .06;
    enemy.stun = .32;
    enemy.windup = enemy.charge = 0;
    enemy.x = Math.max(enemy.min, Math.min(enemy.max, enemy.x + player.facing * 24));
    sound('hit'); burst(enemy.x + 17, enemy.y + 15, '#f4b5ff', 12);
    if (enemy.hp <= 0) {
      enemy.alive = false; burst(enemy.x + 17, enemy.y + 15, '#db9eff', 16);
      rewardXp((enemy.type === 'sentinel' ? 40 : enemy.type === 'spitter' ? 35 : 25) + levelIndex * 5, enemy.id);
    }
    return true;
  }

  function damageBoss(damage) {
    const boss = level.boss;
    if (!boss?.active || boss.hp <= 0 || boss.cooldown > 0) return false;
    boss.hp = Math.max(0, boss.hp - damage);
    boss.cooldown = .45; boss.lunge = 0;
    floatText(`-${damage}`, boss.x + 40, boss.y - 24, '#ffcf9b');
    burst(boss.x + 40, boss.y + 35, '#ffc46e', 22); sound('hit');
    screenShake = .12;
    if (boss.hp === 0) {
      level.projectiles = [];
      rewardXp(250, `${levelIndex}:boss`);
      notify('Guardião derrotado! O portal está aberto.'); sound('portal');
    }
    return true;
  }

  function breakCrate(crate, damage) {
    if (crate.broken) return;
    crate.hp -= damage;
    burst(crate.x + 14, crate.y + 10, '#caa779', 8);
    if (crate.hp <= 0) {
      crate.broken = true; progress.gold += 4;
      player.energy = Math.min(maxEnergy(), player.energy + 10);
      floatText('+4 moedas', crate.x + 14, crate.y - 10, '#ffe39a');
      sound('hit'); updateHud();
    }
  }

  function fireShot(kind, damage, angle = 0) {
    const speed = kind === 'magic' ? 520 : 700;
    level.heroShots.push({ kind, x: player.x + 15 + player.facing * 15, y: player.y + 19, w: kind === 'magic' ? 15 : 25, h: kind === 'magic' ? 15 : 8, vx: player.facing * speed * Math.cos(angle), vy: speed * Math.sin(angle), damage, life: 1.5 + weaponTier * .12, dead: false });
  }

  function updateHeroShots(dt) {
    for (const shot of level.heroShots) {
      if (shot.dead) continue;
      shot.x += shot.vx * dt; shot.y += shot.vy * dt; shot.life -= dt;
      if (level.solids.some(block => intersects(shot, block))) shot.dead = true;
      if (!shot.dead) for (const enemy of level.enemies) {
        if (!enemy.alive || !intersects(shot, enemy)) continue;
        damageEnemy(enemy, shot.damage, shot.kind === 'magic'); shot.dead = true; break;
      }
      if (!shot.dead && level.boss?.active && level.boss.hp > 0 && intersects(shot, level.boss)) { damageBoss(shot.damage); shot.dead = true; }
      if (!shot.dead) for (const crate of level.crates) {
        if (crate.broken || !intersects(shot, crate)) continue;
        breakCrate(crate, shot.damage); shot.dead = true; break;
      }
      if (shot.dead) burst(shot.x, shot.y, shot.kind === 'magic' ? '#bd9dff' : '#d9f4ad', 5);
    }
    level.heroShots = level.heroShots.filter(shot => !shot.dead && shot.life > 0);
  }

  function areaAttack(radius, damage) {
    const x = player.x + 15, y = player.y + 21;
    const close = target => Math.hypot(target.x + target.w / 2 - x, target.y + target.h / 2 - y) < radius;
    for (const enemy of level.enemies) if (enemy.alive && close(enemy)) damageEnemy(enemy, damage, true);
    if (level.boss && close(level.boss)) damageBoss(damage);
    for (const crate of level.crates) if (!crate.broken && close(crate)) breakCrate(crate, damage);
    for (const shot of level.projectiles) if (close(shot)) shot.dead = true;
  }

  function useSkill() {
    if (progress.level < 3) { notify('A habilidade da classe desbloqueia no nível 3. Derrote mobs para ganhar XP.'); return; }
    if (player.skillCooldown > 0) return;
    if (player.energy < heroClass().skillCost) { notify('Energia insuficiente para a habilidade.'); return; }
    player.energy -= heroClass().skillCost;
    player.skillCooldown = (selectedClass === 'mage' ? 7 : 6) * (progress.level >= 9 ? .8 : 1);
    player.skillTime = .55;
    if (selectedClass === 'warrior') areaAttack(110, attackDamage() + 2);
    if (selectedClass === 'mage') areaAttack(175, attackDamage() + 3);
    if (selectedClass === 'rogue') { player.shadow = 4; player.invulnerable = Math.max(player.invulnerable, .4); }
    if (selectedClass === 'archer') for (const angle of [-.16, 0, .16]) fireShot('arrow', attackDamage() + 1, angle);
    burst(player.x + 15, player.y + 21, heroClass().color, 24);
    sound('power'); notify(`${heroClass().skill}!`);
  }

  function strike() {
    if (player.attackTime <= 0 || heroClass().attack !== 'melee') return;
    const hit = meleeBox();
    for (const enemy of level.enemies) {
      if (!enemy.alive || player.attackHits.has(enemy) || !intersects(hit, enemy)) continue;
      player.attackHits.add(enemy);
      const critical = player.shadow > 0;
      if (damageEnemy(enemy, attackDamage() * (critical ? 2 : 1))) player.shadow = 0;
    }
    const boss = level.boss;
    if (boss?.active && boss.hp > 0 && !player.attackHits.has(boss) && intersects(hit, boss)) {
      player.attackHits.add(boss);
      if (damageBoss(attackDamage() * (player.shadow > 0 ? 2 : 1))) player.shadow = 0;
      else sound('block');
    }
    for (const shot of level.projectiles) {
      if (!shot.dead && intersects(hit, shot)) {
        shot.dead = true; sound('hit'); burst(shot.x + 10, shot.y + 10, '#ffc46e', 8);
      }
    }
    for (const crate of level.crates) {
      if (!crate.broken && !player.attackHits.has(crate) && intersects(hit, crate)) { player.attackHits.add(crate); breakCrate(crate, attackDamage()); }
    }
  }

  function updateEnemy(enemy, dt) {
    if (!enemy.alive) return;
    enemy.stun = Math.max(0, enemy.stun - dt);
    enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
    enemy.guard = Math.max(0, enemy.guard - dt);
    if (enemy.stun > 0) return;
    const distance = player.x - enemy.x;
    const near = player.shadow <= 0 && Math.abs(distance) < (enemy.type === 'spitter' ? 460 : 330) && Math.abs(player.y - enemy.y) < 140;
    enemy.alert = near;
    if (!near) {
      enemy.windup = enemy.charge = 0;
      enemy.x += enemy.speed * .55 * enemy.dir * dt;
      if (enemy.x <= enemy.min || enemy.x >= enemy.max) enemy.dir *= -1;
      enemy.x = Math.max(enemy.min, Math.min(enemy.max, enemy.x));
      return;
    }
    if (enemy.charge > 0) {
      enemy.charge = Math.max(0, enemy.charge - dt);
      enemy.x += enemy.dir * (enemy.type === 'sentinel' ? 340 : 460) * dt;
    } else if (enemy.windup > 0) {
      enemy.windup = Math.max(0, enemy.windup - dt);
      if (enemy.windup === 0) {
        enemy.attackCooldown = enemy.type === 'spitter' ? 2.4 : 2.1;
        if (enemy.type === 'spitter') {
          level.projectiles.push({ x: enemy.x + 17, y: enemy.y + 5, w: 18, h: 18, vx: enemy.dir * 285, life: 3, owner: 'mob' });
          sound('shot');
        } else enemy.charge = enemy.type === 'sentinel' ? .3 : .34;
      }
    } else {
      enemy.dir = Math.sign(distance) || enemy.dir;
      if (enemy.type === 'sentinel' && enemy.attackCooldown < .8) enemy.guard = Math.max(enemy.guard, .14);
      if (enemy.type !== 'spitter' && Math.abs(distance) > 58) enemy.x += enemy.dir * enemy.speed * (enemy.type === 'stalker' ? 1.5 : 1.1) * dt;
      if (enemy.attackCooldown === 0 && Math.abs(distance) < (enemy.type === 'spitter' ? 390 : 155)) {
        enemy.windup = enemy.type === 'sentinel' ? .55 : .42;
        if (enemy.type === 'sentinel') enemy.guard = 0;
      }
    }
    enemy.x = Math.max(enemy.min, Math.min(enemy.max, enemy.x));
  }

  function updateProjectiles(dt) {
    for (const shot of level.projectiles) {
      if (shot.dead) continue;
      shot.x += shot.vx * dt;
      shot.life -= dt;
      if (intersects(player, shot)) {
        shot.dead = true;
        if (die()) return true;
      }
    }
    level.projectiles = level.projectiles.filter(shot => !shot.dead && shot.life > 0);
    return false;
  }

  function objectDescription(object) {
    if (object.type === 'sign') return 'E · Ler placa';
    if (object.type === 'lever') return object.used ? 'Atalho aberto' : 'E · Abrir ponte do atalho';
    if (object.type === 'shrine') return object.used ? 'Santuário já utilizado' : 'E · Restaurar HP e energia (30 moedas)';
    if (object.type === 'chest') {
      if (object.used) return 'Baú aberto';
      const guard = level.enemies.find(enemy => enemy.id === `${levelIndex}:${object.guardIndex}`);
      return guard?.alive ? 'Baú selado · derrote o guarda' : 'E · Abrir baú raro';
    }
    return '';
  }

  function interact() {
    const object = nearestObject;
    if (!object) return;
    if (object.type === 'sign') { notify(object.text); return; }
    if (object.used) return;
    if (object.type === 'chest') {
      const guard = level.enemies.find(enemy => enemy.id === `${levelIndex}:${object.guardIndex}`);
      if (guard?.alive) { notify('O guarda mantém o baú selado. Derrote-o primeiro.'); return; }
      progress.gold += 25; progress.bonusEnergy += 5;
      player.energy = maxEnergy();
      notify('Baú raro: +25 moedas e +5 de energia máxima permanente!');
      floatText('+25 moedas · +5 energia', object.x + 17, object.y - 20, '#ffe39a');
    }
    if (object.type === 'shrine') {
      if (progress.gold < 30) { notify('Você precisa de 30 moedas. Derrote mobs ou quebre caixas.'); return; }
      progress.gold -= 30; player.hp = maxHp(); player.energy = maxEnergy();
      notify('Santuário ativado: HP e energia restaurados.');
    }
    if (object.type === 'lever') {
      const [x, w] = object.bridge;
      level.solids.push({ x, y: GROUND, w, h: 18, bridge: true });
      notify('Atalho aberto! A ponte permanece aberta ao perder uma vida.');
    }
    object.used = true; sound('power');
    burst(object.x + object.w / 2, object.y + 15, '#f7d695', 18);
    updateHud();
  }

  function updateInteraction() {
    nearestObject = null;
    let nearestDistance = 75;
    for (const object of level.objects) {
      const distance = Math.hypot(player.x + 15 - object.x - object.w / 2, player.y + 21 - object.y - object.h / 2);
      if (distance < nearestDistance) { nearestObject = object; nearestDistance = distance; }
    }
    const message = nearestObject ? objectDescription(nearestObject) : 'E interage com placas, alavancas, baús e santuários.';
    if (interactionLabel.textContent !== message) interactionLabel.textContent = message;
  }

  function update(dt) {
    if (state !== 'playing') return;
    elapsed += dt;
    const previousMessageTime = messageTime;
    messageTime = Math.max(0, messageTime - dt);
    if (messageTime === 0 && previousMessageTime > 0) gameMessage.textContent = level.boss?.hp > 0 ? 'Guardião: ataque com J/Z, esquive com K/Shift e desvie das esferas.' : 'As bandeiras salvam seu ponto de retorno. O escudo não protege contra quedas.';
    player.shield = Math.max(0, player.shield - dt);
    player.jump = Math.max(0, player.jump - dt);
    player.attackTime = Math.max(0, player.attackTime - dt);
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    player.dashCooldown = Math.max(0, player.dashCooldown - dt);
    player.dashTime = Math.max(0, player.dashTime - dt);
    player.skillCooldown = Math.max(0, player.skillCooldown - dt);
    player.skillTime = Math.max(0, player.skillTime - dt);
    player.shadow = Math.max(0, player.shadow - dt);
    player.hurtTime = Math.max(0, player.hurtTime - dt);
    player.energy = Math.min(maxEnergy(), player.energy + dt * (selectedClass === 'mage' ? 14 : 18));
    player.anim += dt * (Math.abs(player.vx) > 10 ? 11 : 3);
    if (attackQueued && player.attackCooldown === 0) {
      if (player.energy >= heroClass().cost) {
        player.energy -= heroClass().cost;
        player.attackTime = .2;
        player.attackCooldown = heroClass().interval;
        player.attackHits = new Set();
        if (heroClass().attack !== 'melee') fireShot(heroClass().attack, attackDamage());
        sound(heroClass().attack === 'melee' ? 'slash' : 'shot');
      } else notify('Energia baixa. Aguarde a recuperação.');
    }
    if (dodgeQueued && player.dashCooldown === 0) {
      player.dashTime = .18;
      player.dashCooldown = heroClass().dodge * (progress.level >= 5 ? .8 : 1);
      player.invulnerable = Math.max(player.invulnerable, .24);
      if (controls.left !== controls.right) player.facing = controls.right ? 1 : -1;
      burst(player.x + 15, player.y + 21, '#ade9ff', 12);
      sound('dodge');
    }
    attackQueued = dodgeQueued = false;
    if (skillQueued) useSkill();
    skillQueued = false;
    updateHud();
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.vx = player.hurtTime > 0 ? -player.facing * 170 : player.dashTime > 0 ? player.facing * 760 : (Number(controls.right) - Number(controls.left)) * heroClass().speed;
    if (player.vx && player.dashTime === 0 && player.hurtTime === 0) player.facing = Math.sign(player.vx);
    if (player.onGround) player.coyote = .1;
    else player.coyote = Math.max(0, player.coyote - dt);
    if (jumpQueued && player.coyote > 0 && player.dashTime === 0) {
      player.vy = JUMP * (player.jump > 0 ? 1.3 : 1);
      sound('jump');
      player.onGround = false;
      player.coyote = 0;
      burst(player.x + player.w / 2, player.y + player.h, '#ffffff', 5);
    }
    jumpQueued = false;

    player.x += player.vx * dt;
    player.x = Math.max(0, Math.min(level.width - player.w, player.x));
    for (const block of level.solids) {
      if (!intersects(player, block)) continue;
      if (player.vx > 0) player.x = block.x - player.w;
      else if (player.vx < 0) player.x = block.x + block.w;
      player.dashTime = 0;
    }

    const wasGrounded = player.onGround;
    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;
    player.onGround = false;
    for (const block of level.solids) {
      if (!intersects(player, block)) continue;
      if (player.vy >= 0) {
        player.y = block.y - player.h;
        player.onGround = true;
      } else player.y = block.y + block.h;
      player.vy = 0;
    }
    if (!wasGrounded && player.onGround) burst(player.x + 15, player.y + 42, '#9cc5b8', 5);
    if (player.dashTime > 0 && afterimages.length < 9) afterimages.push({ x: player.x, y: player.y, life: .18, color: heroClass().color });

    for (const star of level.stars) {
      if (star.taken) continue;
      const dx = player.x + player.w / 2 - star.x;
      const dy = player.y + player.h / 2 - star.y;
      if (dx * dx + dy * dy < 33 * 33) {
        star.taken = true;
        levelStars++;
        totalStars++;
        sound('star');
        burst(star.x, star.y, '#ffdb73', 9);
        updateHud();
      }
    }

    for (const power of level.powers) {
      if (power.taken || !intersects(player, power)) continue;
      if (power.type === 'heart' && lives >= MAX_LIVES) continue;
      power.taken = true;
      const type = POWER_TYPES[power.type];
      if (power.type === 'heart') lives++;
      else player[power.type] = type.duration;
      burst(power.x + 15, power.y + 15, type.color, 18);
      sound('power'); updateHud();
      notify(power.type === 'heart' ? 'Vida extra! ♥' : `${type.name} por ${type.duration} segundos!`);
    }
    if (!level.weapon.taken && intersects(player, level.weapon)) {
      level.weapon.taken = true;
      weaponTier = Math.max(weaponTier, level.weapon.tier);
      sound('equip'); burst(level.weapon.x + 15, level.weapon.y + 19, WEAPONS[weaponTier].color, 20);
      notify(`${equippedName()} equipado! Alcance e dano aumentaram.`);
      updateHud();
    }
    for (const flag of level.checkpoints) {
      if (flag.active || flag.x + 30 <= checkpoint.x || player.x < flag.x || player.x > flag.x + 70 || !player.onGround) continue;
      flag.active = true;
      checkpoint = { x: flag.x + 30, stars: level.stars.flatMap((star, i) => star.taken ? [i] : []) };
      sound('checkpoint'); burst(flag.x + 12, flag.y + 12, '#9fffab', 18);
      notify('Checkpoint ativado! Sua coleta de estrelas foi salva.');
    }

    updateInteraction();
    if (interactQueued) interact();
    interactQueued = false;
    strike(); updateHeroShots(dt);
    for (const enemy of level.enemies) {
      if (!enemy.alive) continue;
      updateEnemy(enemy, dt);
      if (intersects(player, enemy)) {
        if (player.vy > 90 && player.y + player.h - player.vy * dt <= enemy.y + 12) {
          player.y = enemy.y - player.h;
          player.vy = -440;
          sound('stomp');
          damageEnemy(enemy, 1, true);
        } else if (enemy.stun <= 0 && die(false, enemy.charge > 0 ? 2 : 1)) return;
      }
      if (state !== 'playing') return;
    }

    for (const spike of level.spikes) {
      if (intersects(player, { x: spike.x + 5, y: spike.y + 12, w: spike.w - 10, h: spike.h - 12 }) && die()) return;
      if (state !== 'playing') return;
    }
    if (player.y > H + 70 && die(true)) return;
    if (state !== 'playing') return;
    if (updateBoss(dt)) return;
    if (updateProjectiles(dt)) return;
    if (intersects(player, level.portal)) finishLevel();

    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 350 * dt;
      p.life -= dt;
    }
    particles = particles.filter(p => p.life > 0);
    for (const text of floaters) { text.y -= dt * 24; text.life -= dt; }
    floaters = floaters.filter(text => text.life > 0);
    for (const ghost of afterimages) ghost.life -= dt;
    afterimages = afterimages.filter(ghost => ghost.life > 0);
    screenShake = Math.max(0, screenShake - dt);
    const target = Math.max(0, Math.min(level.width - W, player.x - W * .38));
    camera += (target - camera) * Math.min(1, dt * 7);
  }

  function updateBoss(dt) {
    const boss = level.boss;
    if (!boss || boss.hp <= 0) return false;
    boss.cooldown = Math.max(0, boss.cooldown - dt);
    if (!boss.active && player.x > level.width - 1000) {
      boss.active = true; notify('Guardião do Eclipse! Ataque com a espada ou pule na cabeça. Desvie das esferas.');
    }
    if (!boss.active) return false;
    boss.lunge = Math.max(0, boss.lunge - dt);
    boss.x += boss.dir * (boss.lunge > 0 ? 390 : 65 + (boss.maxHp - boss.hp) * 9) * dt;
    if (boss.x < level.width - 850) { boss.x = level.width - 850; boss.dir = 1; }
    if (boss.x > level.width - 350) { boss.x = level.width - 350; boss.dir = -1; }
    boss.attack -= dt;
    if (boss.attack <= 0) {
      const direction = player.x + player.w / 2 < boss.x + boss.w / 2 ? -1 : 1;
      boss.volley++;
      if (boss.volley % 3 === 0) {
        boss.dir = direction;
        boss.lunge = .45;
        sound('dodge');
      } else {
        const count = boss.hp <= boss.maxHp / 2 ? 2 : 1;
        for (let i = 0; i < count; i++) level.projectiles.push({ x: boss.x + boss.w / 2, y: GROUND - 26 - i * 43, w: 20, h: 20, vx: direction * (240 + (boss.maxHp - boss.hp) * 12), life: 4, owner: 'boss' });
        sound('shot');
      }
      boss.attack = boss.hp <= boss.maxHp / 2 ? 1.65 : 2.2;
    }
    if (intersects(player, boss)) {
      if (player.vy > 90 && player.y + player.h - player.vy * dt <= boss.y + 16) {
        player.y = boss.y - player.h; player.vy = -620;
        if (boss.cooldown === 0) {
          damageBoss(1); sound('stomp');
          if (boss.hp === 0) return false;
        }
      } else if (die()) return true;
    }
    return false;
  }

  function roundedRect(x, y, w, h, radius, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
  }

  function drawStar(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      const radius = i % 2 === 0 ? size : size * .46;
      const sx = x + Math.cos(angle) * radius;
      const sy = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawBackground(time) {
    const palettes = [
      ['#172238', '#475c72', '#aa939b', '#202e45', '#273d52', '#345468'],
      ['#172838', '#41596b', '#83a5aa', '#1b3241', '#284a54', '#36676b'],
      ['#161f3e', '#3d4e7c', '#959dc5', '#20264e', '#303964', '#45587f'],
      ['#211c3f', '#565075', '#aa8ba8', '#2a254b', '#41365d', '#64527a'],
      ['#23192f', '#63405c', '#b47e8a', '#321f3e', '#56324f', '#754760'],
    ];
    const colors = palettes[levelIndex];
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, colors[0]);
    sky.addColorStop(.64, colors[1]);
    sky.addColorStop(1, colors[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.shadowColor = '#d9d9ff'; ctx.shadowBlur = 36;
    ctx.fillStyle = level.theme === 'eclipse' ? '#f1b3ad' : '#d5def6';
    ctx.beginPath(); ctx.arc(790 - camera * .06, 110, 43, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (level.theme === 'eclipse') {
      ctx.fillStyle = colors[0];
      ctx.beginPath(); ctx.arc(785 - camera * .06, 106, 38, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 34; i++) drawStar((i * 131 + 30 - camera * .03 + W * 10) % W, 25 + (i * 53) % 220, 1.5 + i % 3, '#e6e8fc');
    for (let i = 0; i < 8; i++) {
      const x = ((i * 315 + 80 - camera * .15) % 1300 + 1300) % 1300 - 130;
      const y = 100 + (i % 3) * 63 + Math.sin(time * .4 + i) * 3;
      ctx.fillStyle = '#c5cde157';
      ctx.beginPath(); ctx.ellipse(x, y, 62, 19, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 29, y - 13, 34, 20, 0, 0, Math.PI * 2); ctx.fill();
    }
    for (let layer = 0; layer < 3; layer++) {
      const base = 370 + layer * 52;
      const parallax = .12 + layer * .12;
      const shift = (camera * parallax) % 300;
      ctx.fillStyle = colors[3 + layer];
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = -400; x < W + 400; x += 300) {
        ctx.quadraticCurveTo(x + 80 - shift, base - 100 + (x % 3) * 12, x + 170 - shift, base);
        ctx.quadraticCurveTo(x + 240 - shift, base + 35, x + 300 - shift, base);
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    }
    for (let i = 0; i < 7; i++) {
      const x = ((i * 278 - camera * .42) % 1370 + 1370) % 1370 - 130;
      ctx.fillStyle = '#18273b7c';
      ctx.fillRect(x, 320 + i % 2 * 38, 26, 220);
      ctx.fillRect(x - 8, 313 + i % 2 * 38, 42, 12);
      drawStar(x + 13, 310 + i % 2 * 38, 5, '#a9bde0');
    }
    for (let i = 0; i < 8; i++) {
      const x = ((i * 255 - camera * .32) % 1550 + 1550) % 1550 - 180;
      const sway = Math.sin(time * .8 + i) * 6;
      ctx.fillStyle = '#17213765';
      if (levelIndex === 1 || levelIndex === 3) {
        ctx.fillRect(x + 34, 235, 18, 285);
        for (let tier = 0; tier < 3; tier++) {
          ctx.beginPath(); ctx.moveTo(x - 38 + sway, 345 - tier * 48); ctx.lineTo(x + 44 + sway, 205 - tier * 35); ctx.lineTo(x + 126 + sway, 345 - tier * 48); ctx.fill();
        }
      } else {
        ctx.fillRect(x, 325, 19, 160); ctx.fillRect(x + 94, 325, 19, 160);
        ctx.strokeStyle = '#25344b85'; ctx.lineWidth = 17;
        ctx.beginPath(); ctx.arc(x + 56, 330, 47, Math.PI, 0); ctx.stroke();
        if (levelIndex === 4) {
          ctx.beginPath(); ctx.moveTo(x - 12, 295); ctx.lineTo(x + 9, 255); ctx.lineTo(x + 31, 295); ctx.fill();
        }
      }
    }
    ctx.save();
    for (let i = 0; i < 30; i++) {
      const x = ((i * 173 - camera * .65 + time * 8) % 1300 + 1300) % 1300 - 100;
      const y = 220 + (i * 41) % 280 + Math.sin(time + i) * 12;
      ctx.globalAlpha = .15 + (Math.sin(time * 1.2 + i) + 1) * .18;
      ctx.fillStyle = levelIndex === 4 ? '#ffb78a' : '#bfebf1';
      ctx.beginPath(); ctx.arc(x, y, 1.5 + i % 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawGround(block, time) {
    if (block.bridge) {
      ctx.fillStyle = '#826652'; ctx.fillRect(block.x, block.y, block.w, 12);
      ctx.strokeStyle = '#c4a57c'; ctx.lineWidth = 2;
      for (let x = block.x + 4; x < block.x + block.w; x += 14) { ctx.beginPath(); ctx.moveTo(x, block.y); ctx.lineTo(x, block.y + 12); ctx.stroke(); }
      return;
    }
    ctx.fillStyle = '#394153';
    ctx.fillRect(block.x, block.y, block.w, block.h);
    ctx.fillStyle = '#557d7d';
    ctx.fillRect(block.x, block.y, block.w, 10);
    ctx.fillStyle = '#9cc5b8';
    ctx.fillRect(block.x, block.y, block.w, 4);
    for (let x = block.x + 25; x < block.x + block.w; x += 73) {
      ctx.fillStyle = '#4b5966';
      ctx.fillRect(x, block.y + 26 + (x % 3) * 6, 16, 5);
      if (block.y === GROUND && x + 20 < block.x + block.w) {
        ctx.fillStyle = '#609b99';
        ctx.fillRect(x, block.y - 7, 2, 7);
        drawStar(x + 1, block.y - 9, 4, x % 2 ? '#ffb7c5' : '#fff1a3');
        ctx.strokeStyle = '#79a7a4'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x + 15, block.y); ctx.quadraticCurveTo(x + 14, block.y - 10, x + 17 + Math.sin(time * 2 + x) * 4, block.y - 14); ctx.stroke();
      }
    }
  }

  function drawPortal(time) {
    const p = level.portal;
    const locked = level.boss && level.boss.hp > 0;
    const pulse = Math.sin(time * 3) * 3;
    ctx.fillStyle = '#384975';
    ctx.beginPath(); ctx.roundRect(p.x - 7, p.y - 6, p.w + 14, p.h + 6, [30, 30, 4, 4]); ctx.fill();
    ctx.fillStyle = '#e7d1ff';
    ctx.beginPath(); ctx.roundRect(p.x, p.y, p.w, p.h, [25, 25, 2, 2]); ctx.fill();
    const glow = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y);
    glow.addColorStop(0, '#8d86e9'); glow.addColorStop(.5, '#f7c6e6'); glow.addColorStop(1, '#897ee3');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.roundRect(p.x + 7 + pulse / 2, p.y + 9, p.w - 14 - pulse, p.h - 9, [20, 20, 2, 2]); ctx.fill();
    drawStar(p.x + p.w / 2, p.y - 25 + Math.sin(time * 4) * 4, 13, '#ffe58d');
    if (locked) {
      roundedRect(p.x - 5, p.y + 22, p.w + 10, 44, 7, '#27304ade');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 23px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('×', p.x + p.w / 2, p.y + 50); ctx.textAlign = 'left';
    }
  }

  function drawExtras(time) {
    for (const [start] of level.ground) {
      const x = start + 35;
      if (x < camera - 50 || x > camera + W + 50) continue;
      roundedRect(x, GROUND - 44, 5, 42, 2, '#4d3d3b');
      ctx.save(); ctx.shadowColor = '#ffbc77'; ctx.shadowBlur = 22;
      ctx.fillStyle = '#ffc789'; ctx.beginPath(); ctx.ellipse(x + 2, GROUND - 48, 5 + Math.sin(time * 11 + x), 10 + Math.sin(time * 8) * 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    for (const crate of level.crates) {
      if (crate.broken || crate.x < camera - 50 || crate.x > camera + W + 50) continue;
      roundedRect(crate.x, crate.y, crate.w, crate.h, 3, '#836447');
      ctx.strokeStyle = '#c7a16a'; ctx.lineWidth = 2;
      ctx.strokeRect(crate.x + 3, crate.y + 3, crate.w - 6, crate.h - 6);
      ctx.beginPath(); ctx.moveTo(crate.x + 3, crate.y + 3); ctx.lineTo(crate.x + 25, crate.y + 27); ctx.moveTo(crate.x + 25, crate.y + 3); ctx.lineTo(crate.x + 3, crate.y + 27); ctx.stroke();
    }
    for (const object of level.objects) {
      if (object.x < camera - 60 || object.x > camera + W + 60) continue;
      const { x, y } = object;
      if (object.type === 'sign') {
        roundedRect(x + 10, y + 18, 6, 30, 2, '#82664c'); roundedRect(x - 6, y, 38, 26, 4, '#ad8860');
        ctx.fillStyle = '#f4e5c5'; ctx.font = 'bold 17px sans-serif'; ctx.fillText('?', x + 8, y + 20);
      }
      if (object.type === 'lever') {
        roundedRect(x - 2, y + 27, 28, 11, 4, '#9fa5ad');
        ctx.strokeStyle = object.used ? '#97dcbf' : '#e2ba90'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 12, y + 30); ctx.lineTo(x + (object.used ? 23 : 1), y + 5); ctx.stroke();
      }
      if (object.type === 'chest') {
        roundedRect(x, y + 5, 34, 22, 5, '#8e6553'); roundedRect(x - 1, y + (object.used ? -8 : 0), 36, 11, 4, '#bf955f');
        ctx.fillStyle = '#ffe1a0'; ctx.fillRect(x + 15, y + 9, 5, 9);
        if (!object.used) drawStar(x + 17, y - 12 + Math.sin(time * 3) * 3, 6, '#ffc98b');
      }
      if (object.type === 'shrine') {
        roundedRect(x - 4, y + 35, 38, 19, 5, '#737b8e'); roundedRect(x + 7, y + 14, 16, 30, 5, '#959aaf');
        ctx.save(); ctx.shadowColor = object.used ? '#999' : '#96e9ff'; ctx.shadowBlur = 25;
        drawStar(x + 15, y + 10 + Math.sin(time * 2) * 2, 13, object.used ? '#818f9b' : '#b3f0ff'); ctx.restore();
      }
      if (object === nearestObject && state === 'playing') {
        roundedRect(x - 4, y - 33, 38, 20, 5, '#172238dc'); ctx.fillStyle = '#fff2be'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('E', x + 10, y - 18);
      }
    }
    for (const flag of level.checkpoints) {
      ctx.fillStyle = '#465674'; ctx.fillRect(flag.x, flag.y, 5, 60);
      ctx.fillStyle = flag.active ? '#94ffa8' : '#e2deef';
      ctx.beginPath(); ctx.moveTo(flag.x + 5, flag.y);
      ctx.lineTo(flag.x + 37, flag.y + 11 + Math.sin(time * 4) * 3);
      ctx.lineTo(flag.x + 5, flag.y + 24); ctx.fill();
      roundedRect(flag.x - 6, GROUND - 5, 18, 5, 2, '#465674');
    }
    for (const power of level.powers) {
      if (power.taken) continue;
      const type = POWER_TYPES[power.type];
      const x = power.x + 15, y = power.y + 15 + Math.sin(time * 3 + power.x) * 4;
      ctx.save(); ctx.shadowColor = type.color; ctx.shadowBlur = 16;
      roundedRect(x - 15, y - 15, 30, 30, 10, type.color);
      ctx.shadowBlur = 0; ctx.fillStyle = '#24354c'; ctx.font = 'bold 23px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(type.icon, x, y + 8); ctx.restore();
    }
    if (!level.weapon.taken) {
      const blade = level.weapon;
      const y = blade.y + Math.sin(time * 3) * 4;
      ctx.save(); ctx.shadowColor = WEAPONS[blade.tier].color; ctx.shadowBlur = 18;
      ctx.strokeStyle = WEAPONS[blade.tier].color; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(blade.x + 15, y + 31); ctx.lineTo(blade.x + 15, y + 2); ctx.stroke();
      ctx.strokeStyle = '#344260'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(blade.x + 5, y + 25); ctx.lineTo(blade.x + 25, y + 25); ctx.stroke();
      if (selectedClass === 'mage') drawStar(blade.x + 15, y + 1, 7, heroClass().color);
      if (selectedClass === 'archer') { ctx.strokeStyle = heroClass().color; ctx.beginPath(); ctx.arc(blade.x + 14, y + 18, 17, -1.1, 1.1); ctx.stroke(); }
      ctx.restore();
    }
    const boss = level.boss;
    if (boss?.hp > 0) {
      ctx.save();
      const warning = boss.active && boss.attack < .5;
      roundedRect(boss.x, boss.y, boss.w, boss.h, [24, 24, 12, 12], boss.cooldown > 0 ? '#e8b8ff' : warning ? '#cd625f' : '#67508d');
      drawStar(boss.x + 40, boss.y - 6, 20, '#ffc46e');
      ctx.fillStyle = '#fbe8ff'; ctx.fillRect(boss.x + 14, boss.y + 23, 15, 15); ctx.fillRect(boss.x + 51, boss.y + 23, 15, 15);
      ctx.fillStyle = '#2b2744'; ctx.fillRect(boss.x + 18, boss.y + 27, 7, 10); ctx.fillRect(boss.x + 55, boss.y + 27, 7, 10);
      roundedRect(boss.x + 23, boss.y + 53, 34, 9, 4, '#2b2744');
      roundedRect(boss.x - 10, boss.y - 48, 100, 9, 4, '#252448');
      roundedRect(boss.x - 10, boss.y - 48, 100 * boss.hp / boss.maxHp, 9, 4, '#ff8ea4');
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 13px sans-serif';
      ctx.fillText('GUARDIÃO', boss.x + 40, boss.y - 58);
      if (warning) ctx.fillText(boss.volley % 3 === 2 ? '⇢' : '!', boss.x + 40, boss.y + 72);
      ctx.restore();
    }
    for (const shot of level.projectiles) {
      ctx.save(); ctx.shadowColor = '#ffa273'; ctx.shadowBlur = 16;
      drawStar(shot.x + 10, shot.y + 10, 13, shot.owner === 'mob' ? '#b4afff' : '#ff996e'); ctx.restore();
    }
    for (const shot of level.heroShots) {
      ctx.save(); ctx.strokeStyle = heroClass().color; ctx.fillStyle = heroClass().color;
      ctx.shadowColor = heroClass().color; ctx.shadowBlur = 14;
      if (shot.kind === 'magic') {
        drawStar(shot.x + 7, shot.y + 7, 9 + Math.sin(time * 16) * 2, '#d5bdff');
        ctx.globalAlpha = .35; ctx.fillRect(shot.x - Math.sign(shot.vx) * 22, shot.y + 4, 23, 6);
      } else {
        ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(shot.x, shot.y + 4); ctx.lineTo(shot.x + Math.sign(shot.vx) * 25, shot.y + 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(shot.x + Math.sign(shot.vx) * 25, shot.y + 4); ctx.lineTo(shot.x + Math.sign(shot.vx) * 17, shot.y - 1); ctx.lineTo(shot.x + Math.sign(shot.vx) * 17, shot.y + 9); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawPlayer(time) {
    const color = heroClass().color;
    if (player.invulnerable > 0 && Math.floor(time * 14) % 2 === 0) return;
    ctx.save();
    if (player.shadow > 0) ctx.globalAlpha = .48;
    const bob = player.onGround ? Math.sin(player.anim * 2) * (player.vx ? 1.8 : .7) : 0;
    const x = player.x, y = player.y + bob;
    const swing = player.onGround && player.vx ? Math.sin(player.anim) * 5 : player.onGround ? 0 : -3;
    const cloth = Math.sin(time * 6) * 2 - player.vx / 100;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(x + 5, y + 14); ctx.lineTo(x + 27, y + 14);
    ctx.lineTo(x + 30 + cloth, y + 35); ctx.lineTo(x - 2 + cloth, y + 35); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#23314b'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + 9, y + 29); ctx.lineTo(x + 9 + swing, y + 40);
    ctx.moveTo(x + 22, y + 29); ctx.lineTo(x + 22 - swing, y + 40); ctx.stroke();
    roundedRect(x + 7, y + 15, 17, 19, 5, selectedClass === 'warrior' ? '#6b7188' : '#31425b');
    roundedRect(x + 3, y + 2, 26, 22, 9, '#e2e3e7');
    ctx.fillStyle = '#293550';
    ctx.beginPath(); ctx.arc(x + 16, y + 13, 16, Math.PI, 0); ctx.fill();
    if (selectedClass === 'mage') {
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x - 1, y + 7); ctx.lineTo(x + 15, y - 13); ctx.lineTo(x + 33, y + 7); ctx.fill();
      ctx.fillRect(x - 3, y + 6, 38, 4);
    } else if (selectedClass === 'warrior') {
      ctx.fillStyle = '#8291a6'; ctx.fillRect(x + 1, y + 5, 30, 6);
      ctx.fillStyle = color; ctx.fillRect(x + 12, y - 4, 7, 10);
    } else {
      ctx.fillStyle = color; ctx.fillRect(x + 2, y + 7, 29, 4);
      ctx.beginPath(); ctx.moveTo(x + 6, y + 9); ctx.lineTo(x - 9 + cloth, y + 13); ctx.lineTo(x + 5, y + 14); ctx.fill();
    }
    ctx.fillStyle = '#24334c';
    ctx.fillRect(x + (player.facing > 0 ? 18 : 7), y + 14, 6, 6);
    ctx.fillStyle = '#fff'; ctx.fillRect(x + (player.facing > 0 ? 21 : 8), y + 15, 2, 3);
    const handX = x + (player.facing > 0 ? 29 : 1);
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    if (heroClass().attack === 'melee') {
      const angle = player.attackTime > 0 ? -1.1 + (1 - player.attackTime / .2) * 2.2 : -.8;
      const reach = player.attackTime > 0 ? WEAPONS[weaponTier].reach : 24;
      ctx.strokeStyle = WEAPONS[weaponTier].color;
      ctx.beginPath(); ctx.moveTo(handX, y + 25); ctx.lineTo(handX + player.facing * Math.cos(angle) * reach, y + 25 + Math.sin(angle) * reach); ctx.stroke();
      if (player.attackTime > 0) {
        ctx.shadowColor = color; ctx.shadowBlur = 16; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(handX, y + 22, reach, player.facing > 0 ? angle - .6 : Math.PI - angle - .6, player.facing > 0 ? angle + .3 : Math.PI - angle + .3); ctx.stroke();
      }
    } else if (selectedClass === 'mage') {
      ctx.strokeStyle = '#b9a382'; ctx.beginPath(); ctx.moveTo(handX, y + 38); ctx.lineTo(handX + player.facing * 8, y + 1); ctx.stroke();
      ctx.shadowColor = color; ctx.shadowBlur = 16;
      drawStar(handX + player.facing * 8, y, player.attackTime > 0 ? 9 : 6, color);
    } else {
      ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(handX, y + 22, 17, player.facing > 0 ? -1.1 : Math.PI - 1.1, player.facing > 0 ? 1.1 : Math.PI + 1.1); ctx.stroke();
      ctx.strokeStyle = '#ede5cb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(handX + player.facing * 7, y + 7); ctx.lineTo(handX + player.facing * (player.attackTime > 0 ? -4 : 7), y + 22); ctx.lineTo(handX + player.facing * 7, y + 37); ctx.stroke();
    }
    if (player.shield > 0 || player.jump > 0) {
      ctx.shadowBlur = 12; ctx.strokeStyle = player.shield > 0 ? '#71e4ff' : '#b6ff8a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(x + 15, y + 21, 27, 33, 0, 0, Math.PI * 2); ctx.stroke();
    }
    if (player.skillTime > 0) {
      ctx.globalAlpha = player.skillTime / .55; ctx.strokeStyle = color; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(x + 15, y + 21, 20 + (1 - player.skillTime / .55) * (selectedClass === 'mage' ? 150 : 95), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function draw(time) {
    drawBackground(time);
    ctx.save();
    ctx.translate(-Math.round(camera) + (screenShake > 0 ? Math.sin(time * 80) * 3 : 0), screenShake > 0 ? Math.cos(time * 73) * 2 : 0);
    for (const block of level.solids) {
      if (block.x + block.w >= camera - 50 && block.x < camera + W + 50) drawGround(block, time);
    }
    for (const spike of level.spikes) {
      ctx.fillStyle = '#f5e4e2';
      ctx.beginPath();
      ctx.moveTo(spike.x, spike.y + spike.h);
      ctx.lineTo(spike.x + spike.w / 2, spike.y);
      ctx.lineTo(spike.x + spike.w, spike.y + spike.h);
      ctx.fill();
      ctx.fillStyle = '#d68d9a';
      ctx.fillRect(spike.x + 3, spike.y + spike.h - 6, spike.w - 6, 6);
    }
    for (const star of level.stars) {
      if (star.taken) continue;
      ctx.shadowBlur = 18; ctx.shadowColor = '#ffe280';
      drawStar(star.x, star.y + Math.sin(time * 4 + star.x) * 4, 15, '#ffdc70');
      ctx.shadowBlur = 0;
      drawStar(star.x, star.y + Math.sin(time * 4 + star.x) * 4, 7, '#fff6c8');
    }
    for (const enemy of level.enemies) {
      if (!enemy.alive) continue;
      if (enemy.x < camera - 70 || enemy.x > camera + W + 70) continue;
      ctx.save();
      ctx.translate(enemy.x + 17, enemy.y + 32);
      ctx.scale(enemy.stun > 0 ? 1.14 : 1, enemy.stun > 0 ? .84 : enemy.windup > 0 ? .91 : 1);
      ctx.translate(-enemy.x - 17, -enemy.y - 32);
      const colors = { stalker: '#8f66b5', sentinel: '#668caf', spitter: '#a77d9e' };
      roundedRect(enemy.x, enemy.y + Math.sin(time * 8 + enemy.x) * 2, enemy.w, enemy.h, [15, 15, 5, 5], enemy.stun > 0 ? '#eecbff' : colors[enemy.type]);
      ctx.fillStyle = '#e6dcff';
      ctx.fillRect(enemy.x + 8, enemy.y + 11, 6, 7); ctx.fillRect(enemy.x + 21, enemy.y + 11, 6, 7);
      ctx.fillStyle = '#3c385b';
      ctx.fillRect(enemy.x + 10, enemy.y + 13, 3, 5); ctx.fillRect(enemy.x + 23, enemy.y + 13, 3, 5);
      if (enemy.type === 'sentinel' && enemy.guard > 0) roundedRect(enemy.x + (enemy.dir > 0 ? 32 : -6), enemy.y + 4, 8, 26, 4, '#b8d9ff');
      if (enemy.type === 'spitter') drawStar(enemy.x + 17, enemy.y - 8, 8, '#e1aaff');
      if (enemy.windup > 0) {
        ctx.fillStyle = '#ffdf8a'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('!', enemy.x + 17, enemy.y - 10); ctx.textAlign = 'left';
      }
      if (enemy.hp < enemy.maxHp) {
        roundedRect(enemy.x, enemy.y - 10, enemy.w, 4, 2, '#26324b');
        roundedRect(enemy.x, enemy.y - 10, enemy.w * enemy.hp / enemy.maxHp, 4, 2, '#ffb0b8');
      }
      ctx.restore();
    }
    drawExtras(time);
    drawPortal(time);
    for (const ghost of afterimages) {
      ctx.save(); ctx.globalAlpha = ghost.life / .18 * .3;
      roundedRect(ghost.x + 2, ghost.y + 5, 28, 34, 10, ghost.color); ctx.restore();
    }
    drawPlayer(time);
    for (const p of particles) {
      ctx.globalAlpha = p.life / p.maxLife;
      drawStar(p.x, p.y, 5, p.color);
    }
    ctx.globalAlpha = 1;
    for (const text of floaters) {
      ctx.save(); ctx.globalAlpha = Math.min(1, text.life * 2);
      ctx.fillStyle = text.color; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      ctx.shadowColor = '#142034'; ctx.shadowBlur = 4;
      ctx.fillText(text.text, text.x, text.y); ctx.restore();
    }
    ctx.restore();
    if (state === 'playing') {
      roundedRect(22, 22, 258, 39, 12, '#19234298');
      ctx.fillStyle = '#fff';
      ctx.font = '700 17px Outfit, sans-serif';
      ctx.fillText(level.name, 37, 48);
      roundedRect(W - 196, 22, 174, 39, 12, '#19234298');
      ctx.fillStyle = '#dfeaff'; ctx.font = '600 13px sans-serif';
      ctx.fillText(`Explorado: ${Math.min(100, Math.round(player.x / (level.width - 100) * 100))}%`, W - 182, 40);
      roundedRect(W - 182, 46, 146, 4, 2, '#465673');
      roundedRect(W - 182, 46, 146 * Math.min(1, player.x / (level.width - 100)), 4, 2, heroClass().color);
    }
  }

  function frame(timestamp) {
    const dt = Math.min((timestamp - lastFrame) / 1000 || 0, .05);
    lastFrame = timestamp;
    accumulator += dt;
    while (accumulator >= 1 / 120) {
      update(1 / 120);
      accumulator -= 1 / 120;
    }
    draw(timestamp / 1000);
    requestAnimationFrame(frame);
  }

  document.addEventListener('keydown', event => {
    if (event.code === 'KeyP') { event.preventDefault(); if (!event.repeat) togglePause(); return; }
    if (event.code === 'KeyR' && (state === 'gameOver' || state === 'won')) { startGame(); return; }
    const control = keyMap[event.code];
    if (!control) return;
    event.preventDefault();
    if (state === 'playing' && !controls[control]) {
      if (control === 'jump') jumpQueued = true;
      if (control === 'attack') attackQueued = true;
      if (control === 'dodge') dodgeQueued = true;
      if (control === 'skill') skillQueued = true;
      if (control === 'interact') interactQueued = true;
    }
    controls[control] = true;
  });
  document.addEventListener('keyup', event => {
    const control = keyMap[event.code];
    if (control) { event.preventDefault(); controls[control] = false; }
  });
  window.addEventListener('blur', () => {
    Object.keys(controls).forEach(key => { controls[key] = false; });
    if (state === 'playing') togglePause();
  });
  document.querySelectorAll('[data-control]').forEach(button => {
    const control = button.dataset.control;
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      controls[control] = true;
      if (state === 'playing') {
        if (control === 'jump') jumpQueued = true;
        if (control === 'attack') attackQueued = true;
        if (control === 'dodge') dodgeQueued = true;
        if (control === 'skill') skillQueued = true;
        if (control === 'interact') interactQueued = true;
      }
      button.classList.add('active');
    });
    const release = () => { controls[control] = false; button.classList.remove('active'); };
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
  });
  pauseButton.addEventListener('click', togglePause);
  document.querySelectorAll('[data-hero]').forEach(button => {
    button.addEventListener('click', () => {
      if (!['menu', 'won', 'gameOver'].includes(state)) return;
      selectedClass = button.dataset.hero;
      document.querySelectorAll('[data-hero]').forEach(card => card.setAttribute('aria-pressed', String(card.dataset.hero === selectedClass)));
      if (state === 'menu') { player = makePlayer(); updateHud(); }
      document.getElementById('classHint').textContent = `${heroClass().name} selecionado · habilidade no nível 3: ${heroClass().skill}.`;
    });
  });
  loadLevel(0);
  showOverlay('✦', '4 CLASSES · XP · EXPLORAÇÃO', 'Salto das<br>Estrelas', 'Escolha sua classe, evolua nos combates e explore ruínas, baús e atalhos até o Guardião do Eclipse.', 'Começar aventura', startGame);
  requestAnimationFrame(frame);
})();
