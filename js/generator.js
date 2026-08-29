(function (root) {
  const KIND_IT = {
    danger: "Pericolo",
    puzzle: "Enigma",
    social: "Parole",
    stealth: "Furtività",
    chase: "Inseguimento",
    help: "Soccorso",
    moral: "Scelta",
    explore: "Esplorazione"
  };

  function fill(str, vars) {
    return String(str).replace(/\{([a-zA-Z0-9]+)\}/g, (_, k) => {
      return vars[k] != null ? String(vars[k]) : "{" + k + "}";
    });
  }

  function pickUnused(pool, usedIds, count, rand) {
    const used = new Set(usedIds || []);
    const unused = root.AF_RNG.shuffle(
      pool.filter((x) => !used.has(x.id)),
      rand
    );
    const reused = root.AF_RNG.shuffle(
      pool.filter((x) => used.has(x.id)),
      rand
    );
    const reset = unused.length < count;
    const picked = [];
    const seen = new Set();
    for (const item of unused.concat(reused)) {
      if (seen.has(item.id)) continue;
      picked.push(item);
      seen.add(item.id);
      if (picked.length >= count) break;
    }
    return { picked, reset, remainingFresh: Math.max(0, unused.length - picked.length) };
  }

  function playerCountForWho(who, aliveCount) {
    if (who === "all") return Math.max(1, aliveCount);
    if (who === "two") return Math.min(2, Math.max(1, aliveCount));
    return 1;
  }

  function chooseActors(players, who, rand, sceneIndex) {
    const alive = players.filter((p) => p.hp > 0);
    if (!alive.length) return [];
    const n = playerCountForWho(who, alive.length);
    const shuffled = root.AF_RNG.shuffle(alive, rand);
    // Rotate so it isn't always the same first player.
    const start = sceneIndex % shuffled.length;
    const rotated = shuffled.slice(start).concat(shuffled.slice(0, start));
    return rotated.slice(0, n).map((p) => p.id);
  }

  function interpolateAdventure(adv, extra) {
    const vars = Object.assign(
      {
        world: adv.world.name,
        worldHook: adv.world.hook,
        questName: adv.quest.name,
        questGoal: adv.quest.goal,
        villain: adv.villain.name,
        villainStyle: adv.villain.style,
        treasure: adv.treasure.name,
        npc: adv.npc.name,
        npcQuirk: adv.npc.quirk,
        master: adv.masterName,
        location: extra && extra.location ? extra.location : adv.scenes[0] ? adv.scenes[0].locationName : "la soglia"
      },
      extra || {}
    );
    return vars;
  }

  function generate(opts) {
    const C = root.AF_CONTENT;
    const used = opts.used || root.AF_STORAGE.emptyUsed();
    const seed = opts.seed || root.AF_RNG.seedFrom();
    const rand = root.AF_RNG.rng(seed);
    const resets = [];
    const session = {};
    for (const key of Object.keys(used)) session[key] = (used[key] || []).slice();

    function take(poolName, count) {
      const res = pickUnused(C[poolName], session[poolName] || [], count, rand);
      if (res.reset) resets.push(poolName);
      session[poolName] = (session[poolName] || []).concat(res.picked.map((p) => p.id));
      return res.picked;
    }

    const world = take("worlds", 1)[0];
    const quest = take("quests", 1)[0];
    const villain = take("villains", 1)[0];
    const treasure = take("treasures", 1)[0];
    const npc = take("npcs", 1)[0];
    const extraNpcs = [];
    const roles = take("roles", opts.players.length);
    const locations = take("locations", 6);
    const challenges = take("challenges", 5);
    const climax = take("climax", 1)[0];
    const opening = C.openings[Math.floor(rand() * C.openings.length)];
    const winEnding = C.winEndings[Math.floor(rand() * C.winEndings.length)];
    const failEnding = C.failEndings[Math.floor(rand() * C.failEndings.length)];
    const fleeEnding = C.fleeEndings[Math.floor(rand() * C.fleeEndings.length)];

    const players = opts.players.map((p, i) => ({
      id: "p" + (i + 1),
      name: p.name.trim() || "Giocatore " + (i + 1),
      role: roles[i % roles.length],
      hp: 3,
      maxHp: 3,
      alive: true,
      outLine: null
    }));

    const baseVars = {
      world: world.name,
      worldHook: world.hook,
      questName: quest.name,
      questGoal: quest.goal,
      villain: villain.name,
      villainStyle: villain.style,
      treasure: treasure.name,
      npc: npc.name,
      npcQuirk: npc.quirk,
      master: opts.masterName
    };

    const scenes = [];

    scenes.push({
      id: "intro",
      type: "intro",
      title: world.name,
      locationName: world.name,
      masterText: fill(opening, baseVars),
      secret: "Lascia che i giocatori si presentino (nome + ruolo). Poi inizia la prima prova. Durata prevista: circa 30 minuti, 8 scene.",
      prompt: null,
      choices: [],
      who: "none",
      actors: [],
      kind: "intro"
    });

    challenges.forEach((ch, i) => {
      const loc = locations[i] || locations[locations.length - 1];
      const vars = Object.assign({}, baseVars, { location: loc.name });
      scenes.push({
        id: ch.id,
        type: "challenge",
        title: ch.title,
        kind: ch.kind,
        kindLabel: KIND_IT[ch.kind] || ch.kind,
        locationName: loc.name,
        locationId: loc.id,
        masterText: fill(ch.master, vars),
        secret: fill(ch.secret, vars),
        prompt: fill(ch.prompt, vars),
        who: ch.who,
        actors: chooseActors(players, ch.who, rand, i + 1),
        choices: ch.choices.map((c) => ({
          id: c.id,
          label: fill(c.label, vars),
          target: c.target,
          dmg: c.dmg,
          ok: fill(c.ok, vars),
          fail: fill(c.fail, vars)
        }))
      });
    });

    const climaxLoc = locations[5] || locations[locations.length - 1];
    const cvars = Object.assign({}, baseVars, { location: climaxLoc.name });
    scenes.push({
      id: climax.id,
      type: "climax",
      title: climax.title,
      kind: "danger",
      kindLabel: "Scontro finale",
      locationName: climaxLoc.name,
      locationId: climaxLoc.id,
      masterText: fill(climax.master, cvars),
      secret: fill(climax.secret, cvars),
      prompt: fill(climax.prompt, cvars),
      who: "all",
      actors: players.map((p) => p.id),
      choices: climax.choices.map((c) => ({
        id: c.id,
        label: fill(c.label, cvars),
        target: c.target,
        dmg: c.dmg,
        ok: fill(c.ok, cvars),
        fail: fill(c.fail, cvars)
      })),
      groupSuccessNeeded: true
    });

    scenes.push({
      id: "ending",
      type: "ending",
      title: "Epilogo",
      locationName: climaxLoc.name,
      masterText: "",
      secret: "",
      prompt: null,
      choices: [],
      who: "none",
      actors: []
    });

    const title = quest.name + " · " + world.name;

    const usedIds = {
      worlds: [world.id],
      quests: [quest.id],
      villains: [villain.id],
      treasures: [treasure.id],
      npcs: [npc.id].concat(extraNpcs.map((n) => n.id)),
      roles: roles.map((r) => r.id),
      locations: locations.map((l) => l.id),
      challenges: challenges.map((c) => c.id),
      climax: [climax.id]
    };

    return {
      id: "adv-" + seed.toString(16) + "-" + Date.now().toString(36),
      seed,
      createdAt: Date.now(),
      title,
      masterName: opts.masterName || "Master",
      world,
      quest,
      villain,
      treasure,
      npc,
      extraNpcs,
      players,
      scenes,
      sceneIndex: 0,
      phase: "master",
      currentChoiceId: null,
      currentActorIndex: 0,
      rolls: [],
      log: [],
      status: "ongoing",
      outcome: null,
      endings: { win: fill(winEnding, Object.assign({}, baseVars, { location: climaxLoc.name })), fail: fill(failEnding, Object.assign({}, baseVars, { location: climaxLoc.name })), flee: fill(fleeEnding, Object.assign({}, baseVars, { location: climaxLoc.name })) },
      usedIds,
      resets,
      minutesEstimate: 30
    };
  }

  function alivePlayers(game) {
    return game.players.filter((p) => p.hp > 0);
  }

  function applyDeath(game, player, rand) {
    const C = root.AF_CONTENT;
    const line = C.deathLines[Math.floor((rand ? rand() : Math.random()) * C.deathLines.length)];
    player.hp = 0;
    player.alive = false;
    player.outLine = line.replace("{name}", player.name).replace("{villain}", game.villain.name);
    game.log.push({ t: Date.now(), kind: "death", text: player.outLine, playerId: player.id });
  }

  function damagePlayer(game, playerId, amount, rand) {
    const p = game.players.find((x) => x.id === playerId);
    if (!p || p.hp <= 0) return { died: false, player: p };
    p.hp = Math.max(0, p.hp - amount);
    if (p.hp <= 0) {
      applyDeath(game, p, rand);
      return { died: true, player: p };
    }
    return { died: false, player: p };
  }

  function checkTpk(game) {
    if (alivePlayers(game).length === 0) {
      game.status = "failed";
      game.outcome = "tpk";
      game.phase = "end";
      game.sceneIndex = game.scenes.length - 1;
      return true;
    }
    return false;
  }

  root.AF_GEN = {
    KIND_IT,
    fill,
    pickUnused,
    generate,
    alivePlayers,
    damagePlayer,
    applyDeath,
    checkTpk,
    chooseActors,
    interpolateAdventure
  };
})(typeof window !== "undefined" ? window : globalThis);
