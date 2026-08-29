(function () {
  const $ = (sel, el) => (el || document).querySelector(sel);

  const state = {
    view: "home",
    setupCount: 3,
    setupMaster: "",
    setupNames: ["", "", "", "", "", ""],
    role: "master",
    rolling: false,
    lastRoll: null,
    toast: null,
    game: null
  };

  function save(game) {
    const g = game || state.game;
    if (g) {
      state.game = g;
      AF_STORAGE.setActive(g);
    }
  }

  function activeGame() {
    if (state.game) return state.game;
    state.game = AF_STORAGE.getActive();
    return state.game;
  }

  function toast(msg) {
    state.toast = msg;
    render();
    setTimeout(() => {
      if (state.toast === msg) {
        state.toast = null;
        render();
      }
    }, 3200);
  }

  function beep(kind) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = kind === "fail" ? "sawtooth" : kind === "death" ? "square" : "triangle";
      o.frequency.value = kind === "ok" ? 660 : kind === "fail" ? 180 : kind === "death" ? 90 : 440;
      g.gain.value = 0.04;
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      o.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }

  function scene(game) {
    return game.scenes[game.sceneIndex];
  }

  function refreshActors(game) {
    const sc = scene(game);
    if (!sc || sc.who === "none" || sc.type === "intro" || sc.type === "ending") return;
    const alive = AF_GEN.alivePlayers(game);
    const valid = (sc.actors || []).filter((id) => alive.some((p) => p.id === id));
    if (valid.length) {
      sc.actors = valid;
      return;
    }
    const rand = AF_RNG.rng((game.seed + game.sceneIndex * 97) >>> 0);
    sc.actors = AF_GEN.chooseActors(game.players, sc.who === "all" || sc.type === "climax" ? "all" : sc.who, rand, game.sceneIndex);
  }

  function playerById(game, id) {
    return game.players.find((p) => p.id === id);
  }

  function namesOf(game, ids) {
    return ids.map((id) => playerById(game, id)?.name || id);
  }

  function startNew(masterName, playerNames) {
    const used = AF_STORAGE.getUsed();
    const game = AF_GEN.generate({
      masterName: masterName.trim() || "Master",
      players: playerNames.map((n) => ({ name: n })),
      used
    });
    AF_STORAGE.markUsed(game.usedIds);
    AF_STORAGE.setSettings({ lastMaster: game.masterName, lastPlayers: playerNames });
    AF_STORAGE.setActive(game);
    state.game = game;
    state.view = "play";
    state.role = "master";
    if (game.resets.length) {
      toast("Hai esaurito alcuni elementi: " + game.resets.join(", ") + ". Quei mazzi sono stati rimescolati, le combinazioni restano nuove.");
    }
    render();
  }

  function abandonActive() {
    const g = AF_STORAGE.getActive();
    if (!g) return;
    AF_STORAGE.pushArchive({
      id: g.id,
      title: g.title,
      at: Date.now(),
      result: "abbandonata",
      players: g.players.map((p) => p.name)
    });
    AF_STORAGE.setActive(null);
    state.game = null;
  }

  function finish(game, outcome) {
    game.status = outcome === "win" ? "won" : outcome === "flee" ? "fled" : "failed";
    game.outcome = outcome;
    game.phase = "end";
    const last = game.scenes[game.scenes.length - 1];
    if (outcome === "win") last.masterText = game.endings.win;
    else if (outcome === "flee") last.masterText = game.endings.flee;
    else last.masterText = game.endings.fail;
    game.sceneIndex = game.scenes.length - 1;
    AF_STORAGE.pushArchive({
      id: game.id,
      title: game.title,
      at: Date.now(),
      result: outcome === "win" ? "vittoria" : outcome === "flee" ? "fuga" : "sconfitta",
      players: game.players.map((p) => p.name + (p.hp > 0 ? "" : " ✦"))
    });
    AF_STORAGE.setActive(game);
    state.game = game;
  }

  function goNextScene(game) {
    if (game.status !== "ongoing") {
      state.view = "end";
      save(game);
      render();
      return;
    }
    const sc = scene(game);
    if (sc && sc.type === "climax" && game.phase === "result") {
      const alive = AF_GEN.alivePlayers(game);
      if (!alive.length) {
        finish(game, "tpk");
        state.view = "end";
        save(game);
        render();
        return;
      }
      const rolls = game.rolls.filter((r) => r.sceneId === sc.id);
      const successes = rolls.filter((r) => r.ok).length;
      const needed = Math.ceil(Math.max(1, rolls.length) / 2);
      if (successes >= needed) finish(game, "win");
      else finish(game, "flee");
      state.view = "end";
      save(game);
      render();
      return;
    }
    game.sceneIndex += 1;
    game.phase = "master";
    game.currentChoiceId = null;
    game.currentActorIndex = 0;
    const next = scene(game);
    if (next && next.type === "ending") {
      const alive = AF_GEN.alivePlayers(game);
      finish(game, alive.length ? "win" : "tpk");
      state.view = "end";
    } else {
      refreshActors(game);
    }
    save(game);
    render();
  }

  function resolveCurrentRolls(game) {
    const sc = scene(game);
    const choice = sc.choices.find((c) => c.id === game.currentChoiceId);
    const rolls = game.rolls.filter((r) => r.sceneId === sc.id && r.choiceId === choice.id);
    const anyOk = rolls.some((r) => r.ok);
    const allFail = rolls.length && rolls.every((r) => !r.ok);
    game.lastOutcome = {
      text: anyOk ? choice.ok : choice.fail,
      ok: anyOk,
      allFail,
      rolls
    };
    game.phase = "result";
    if (AF_GEN.checkTpk(game)) {
      finish(game, "tpk");
      state.view = "end";
    }
    save(game);
    render();
  }

  function rollForCurrentActor(game) {
    if (state.rolling) return;
    const sc = scene(game);
    refreshActors(game);
    const actorId = sc.actors[game.currentActorIndex];
    const player = playerById(game, actorId);
    const choice = sc.choices.find((c) => c.id === game.currentChoiceId);
    if (!player || !choice) return;
    state.rolling = true;
    state.lastRoll = null;
    render();
    const rand = AF_RNG.rng((game.seed ^ (Date.now() & 0xffff) ^ (game.rolls.length * 7919)) >>> 0);
    const value = AF_RNG.rollD6(rand);
    setTimeout(() => {
      const ok = value >= choice.target;
      const rec = { sceneId: sc.id, choiceId: choice.id, playerId: player.id, value, target: choice.target, ok, dmg: ok ? 0 : choice.dmg };
      game.rolls.push(rec);
      let deathText = null;
      if (!ok) {
        const res = AF_GEN.damagePlayer(game, player.id, choice.dmg, rand);
        if (res.died) deathText = player.outLine;
        beep(res.died ? "death" : "fail");
      } else {
        beep("ok");
      }
      game.log.push({
        t: Date.now(),
        kind: ok ? "ok" : "fail",
        text: player.name + " tira " + value + " (serve " + choice.target + "+): " + (ok ? "ce la fa" : "fallisce"),
        playerId: player.id
      });
      state.lastRoll = { value, ok, deathText, playerName: player.name, target: choice.target };
      state.rolling = false;
      save(game);
      render();
    }, 650);
  }

  function afterRollContinue(game) {
    const sc = scene(game);
    refreshActors(game);
    game.currentActorIndex += 1;
    state.lastRoll = null;
    const remaining = sc.actors.slice(game.currentActorIndex).filter((id) => playerById(game, id)?.hp > 0);
    if (AF_GEN.checkTpk(game)) {
      finish(game, "tpk");
      state.view = "end";
      save(game);
      render();
      return;
    }
    if (!remaining.length) {
      resolveCurrentRolls(game);
      return;
    }
    while (game.currentActorIndex < sc.actors.length && playerById(game, sc.actors[game.currentActorIndex])?.hp <= 0) {
      game.currentActorIndex += 1;
    }
    if (game.currentActorIndex >= sc.actors.length) {
      resolveCurrentRolls(game);
      return;
    }
    game.phase = "roll";
    save(game);
    render();
  }

  function hearts(n, max) {
    let s = "";
    for (let i = 0; i < max; i++) s += i < n ? "♥" : "♡";
    return s;
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderHome() {
    const active = (state.game && state.game.status === "ongoing" ? state.game : null) || AF_STORAGE.getActive();
    const archive = AF_STORAGE.getArchive();
    const used = AF_STORAGE.getUsed();
    const usedCount = Object.values(used).reduce((a, b) => a + b.length, 0);
    const pending = active && active.status === "ongoing";
    return `
      <section class="screen home">
        <div class="hero">
          <p class="eyebrow">Portale GDR per famiglie</p>
          <h1>Adventure Family</h1>
          <p class="lead">Ogni volta un'avventura nuova. Un master, i giocatori, un dado. Circa mezz'ora. Si può anche finire male.</p>
        </div>
        ${
          pending
            ? `<div class="card warn">
                <p class="card-kicker">In sospeso</p>
                <h2>${escapeHtml(active.title)}</h2>
                <p>Scena ${active.sceneIndex + 1} di ${active.scenes.length} · ${escapeHtml(active.masterName)} master · ${active.players.length} giocatori</p>
                <div class="row">
                  <button class="btn primary" data-act="continue">Continua l'avventura</button>
                  <button class="btn ghost" data-act="new-confirm">Nuova (abbandona questa)</button>
                </div>
              </div>`
            : `<div class="row">
                <button class="btn primary xl" data-act="new">Nuova avventura</button>
              </div>`
        }
        <p class="meta">Elementi già usati: ${usedCount} · Avventure in archivio: ${archive.length}</p>
        ${
          archive.length
            ? `<div class="archive">
                <h3>Ultime storie</h3>
                <ul>${archive
                  .slice(0, 6)
                  .map(
                    (a) =>
                      `<li><strong>${escapeHtml(a.title)}</strong> <span>${escapeHtml(a.result)}</span></li>`
                  )
                  .join("")}</ul>
              </div>`
            : ""
        }
        <p class="fine">Le avventure pescano sempre elementi mai usati (mondo, missione, nemico, luoghi, prove, ruoli). Quando un mazzo finisce, si rimescola da solo.</p>
      </section>`;
  }

  function renderSetup() {
    const s = AF_STORAGE.getSettings();
    if (!state.setupMaster && s.lastMaster) state.setupMaster = s.lastMaster;
    const count = state.setupCount;
    let inputs = "";
    for (let i = 0; i < count; i++) {
      inputs += `<label>Giocatore ${i + 1}
        <input type="text" maxlength="24" data-name="${i}" value="${escapeHtml(state.setupNames[i] || "")}" placeholder="Nome">
      </label>`;
    }
    return `
      <section class="screen setup">
        <button class="btn text" data-act="home">← Indietro</button>
        <h1>Chi gioca?</h1>
        <p class="lead">Un adulto (o chi se la sente) fa il <strong>master</strong>: legge, tiene i segreti, fa volare la storia. Gli altri sono i giocatori e tirano i dadi.</p>
        <label>Nome del master
          <input type="text" id="masterName" maxlength="24" value="${escapeHtml(state.setupMaster)}" placeholder="Es. Mamma, Papà, Nonna…">
        </label>
        <div class="stepper">
          <span>Giocatori (avventurieri)</span>
          <div class="step-row">
            <button class="btn icon" data-act="count-down" ${count <= 1 ? "disabled" : ""}>−</button>
            <strong>${count}</strong>
            <button class="btn icon" data-act="count-up" ${count >= 6 ? "disabled" : ""}>+</button>
          </div>
          <p class="fine">Da 1 a 6, più il master. Durata: circa 30 minuti.</p>
        </div>
        <div class="names">${inputs}</div>
        <button class="btn primary xl" data-act="create">Crea l'avventura</button>
      </section>`;
  }

  function hud(game) {
    const sc = scene(game);
    const step = Math.min(game.sceneIndex + 1, game.scenes.length);
    const left = Math.max(0, Math.round((game.scenes.length - step) * 3.5));
    return `
      <header class="play-top">
        <div>
          <p class="eyebrow">${escapeHtml(game.title)}</p>
          <p class="scene-count">Scena ${step}/${game.scenes.length} · ~${left} min</p>
        </div>
        <div class="role-toggle" role="group" aria-label="Vista">
          <button class="${state.role === "master" ? "on" : ""}" data-act="role-master">Master</button>
          <button class="${state.role === "players" ? "on" : ""}" data-act="role-players">Giocatori</button>
        </div>
      </header>
      <ul class="party">${game.players
        .map(
          (p) =>
            `<li class="${p.hp <= 0 ? "out" : ""}"><span class="pn">${escapeHtml(p.name)}</span><span class="hp" title="cuori">${hearts(p.hp, p.maxHp)}</span><span class="role">${escapeHtml(p.role.name)}</span></li>`
        )
        .join("")}</ul>
      ${sc && sc.kindLabel ? `<p class="kind-chip">${escapeHtml(sc.kindLabel)} · ${escapeHtml(sc.locationName || "")}</p>` : ""}
    `;
  }

  function renderPlay() {
    const game = activeGame();
    if (!game) return renderHome();
    if (game.status !== "ongoing") return renderEnd();
    refreshActors(game);
    const sc = scene(game);
    let body = "";
    if (state.role === "master") {
      body = `
        <article class="card parchment">
          <p class="card-kicker">Quaderno del master · ${escapeHtml(game.masterName)}</p>
          <h2>${escapeHtml(sc.title)}</h2>
          <p class="story">${escapeHtml(sc.masterText)}</p>
          ${sc.secret ? `<details class="secret"><summary>Nota segreta (solo master)</summary><p>${escapeHtml(sc.secret)}</p></details>` : ""}
          ${
            sc.actors && sc.actors.length
              ? `<p class="who">Tocca a: <strong>${escapeHtml(namesOf(game, sc.actors).join(", "))}</strong></p>`
              : ""
          }
        </article>
        ${
          sc.type === "intro"
            ? `<button class="btn primary xl" data-act="intro-next">I giocatori sono pronti — inizia</button>`
            : game.phase === "result"
              ? `<article class="card">
                  <p class="card-kicker">${game.lastOutcome && game.lastOutcome.ok ? "Esito: successo" : "Esito: insuccesso"}</p>
                  <p class="story">${escapeHtml((game.lastOutcome && game.lastOutcome.text) || "")}</p>
                </article>
                <button class="btn primary xl" data-act="scene-next">Scena successiva</button>`
              : `<button class="btn primary xl" data-act="to-players">Passa il dispositivo ai giocatori</button>`
        }
        <button class="btn ghost" data-act="home-pause">Metti in pausa</button>
      `;
    } else {
      if (sc.type === "intro") {
        body = `<article class="card"><p>Il master sta aprendo la storia. Quando ha finito, torna alla vista Master e preme inizia.</p></article>`;
      } else if (game.phase === "master" || game.phase === "choose") {
        body = `
          <article class="card parchment">
            <h2>${escapeHtml(sc.prompt || sc.title)}</h2>
            <p class="who">Toccano a <strong>${escapeHtml(namesOf(game, sc.actors).join(" e "))}</strong> scegliere. Poi si tira un dado a 6 facce.</p>
          </article>
          <div class="choices">
            ${sc.choices
              .map(
                (c) =>
                  `<button class="choice ${game.currentChoiceId === c.id ? "picked" : ""}" data-act="pick" data-id="${c.id}">
                    <span>${escapeHtml(c.label)}</span>
                    <em>serve ${c.target}+ · rischio ${c.dmg} ♥</em>
                  </button>`
              )
              .join("")}
          </div>
          <button class="btn primary xl" data-act="to-roll" ${game.currentChoiceId ? "" : "disabled"}>Tira il dado</button>
        `;
      } else if (game.phase === "roll") {
        const actor = playerById(game, sc.actors[game.currentActorIndex]);
        const choice = sc.choices.find((c) => c.id === game.currentChoiceId) || sc.choices[0];
        if (!choice) {
          body = `<article class="card">Manca la scelta. Torna indietro.</article>`;
        } else {
        body = `
          <article class="card parchment center">
            <p class="card-kicker">Dado</p>
            <h2>${escapeHtml(actor ? actor.name : "")}</h2>
            <p>Serve <strong>${choice.target}+</strong> su un d6. Se esce di meno: −${choice.dmg} cuore.</p>
            <div class="die ${state.rolling ? "spin" : ""} ${state.lastRoll ? (state.lastRoll.ok ? "ok" : "bad") : ""}" aria-live="polite">${
              state.rolling ? "?" : state.lastRoll ? state.lastRoll.value : "⚀"
            }</div>
            ${
              state.lastRoll
                ? `<p class="${state.lastRoll.ok ? "ok-text" : "bad-text"}">${
                    state.lastRoll.ok
                      ? "Ce la fai!"
                      : "Fallito…" + (state.lastRoll.deathText ? "<br>" + escapeHtml(state.lastRoll.deathText) : "")
                  }</p>
                   <button class="btn primary" data-act="roll-next">Avanti</button>`
                : `<button class="btn primary xl" data-act="do-roll">Tira!</button>`
            }
          </article>
        `;
        }
      } else if (game.phase === "result") {
        const o = game.lastOutcome || { text: "", ok: true };
        body = `
          <article class="card parchment">
            <p class="card-kicker">${o.ok ? "Ce l'avete fatta" : "Le cose si mettono male"}</p>
            <p class="story">${escapeHtml(o.text)}</p>
            <ul class="mini-log">${(o.rolls || [])
              .map((r) => {
                const p = playerById(game, r.playerId);
                return `<li>${escapeHtml(p?.name || "")}: ${r.value} ${r.ok ? "✓" : "✗"}</li>`;
              })
              .join("")}</ul>
          </article>
          <button class="btn primary xl" data-act="to-master">Mostra l'esito al master</button>
        `;
      }
    }
    return `<section class="screen play">${hud(game)}${body}</section>`;
  }

  function renderEnd() {
    const game = activeGame();
    if (!game) return renderHome();
    const sc = game.scenes[game.scenes.length - 1];
    const label = game.outcome === "win" ? "Vittoria" : game.outcome === "flee" ? "Fuga" : "Avventura fallita";
    return `
      <section class="screen end">
        <p class="eyebrow">${escapeHtml(label)}</p>
        <h1>${escapeHtml(game.title)}</h1>
        <article class="card parchment">
          <p class="story">${escapeHtml(sc.masterText || game.endings.fail)}</p>
        </article>
        <ul class="party">${game.players
          .map(
            (p) =>
              `<li class="${p.hp <= 0 ? "out" : ""}"><span class="pn">${escapeHtml(p.name)}</span><span class="hp">${hearts(p.hp, p.maxHp)}</span>${
                p.outLine ? `<span class="role">${escapeHtml(p.outLine)}</span>` : `<span class="role">${escapeHtml(p.role.name)}</span>`
              }</li>`
          )
          .join("")}</ul>
        <button class="btn primary xl" data-act="clear-end">Torna al portale</button>
      </section>`;
  }

  function render() {
    const root = $("#app");
    let html = "";
    try {
      if (state.view === "setup") html = renderSetup();
      else if (state.view === "play") html = renderPlay();
      else if (state.view === "end") html = renderEnd();
      else html = renderHome();
      if (state.toast) html += `<div class="toast" role="status">${escapeHtml(state.toast)}</div>`;
      root.innerHTML = html;
    } catch (err) {
      root.innerHTML =
        html +
        `<pre class="toast">Errore schermata: ${escapeHtml(err && err.message ? err.message : String(err))}</pre>`;
    }
  }

  function onClick(ev) {
    const btn = ev.target.closest("[data-act]");
    if (!btn) return;
    const act = btn.getAttribute("data-act");
    const game = activeGame();

    if (act === "continue") {
      if (!state.game) state.game = AF_STORAGE.getActive();
      state.view = "play";
      state.role = "master";
      render();
      return;
    }
    if (act === "new" || act === "new-confirm") {
      if (act === "new-confirm") {
        if (!confirm("Abbandonare l'avventura in sospeso? Non si potrà riprendere. Una nuova userà elementi diversi.")) return;
        abandonActive();
      }
      state.view = "setup";
      render();
      return;
    }
    if (act === "home" || act === "home-pause") {
      if (game) save(game);
      state.view = "home";
      render();
      return;
    }
    if (act === "count-up") {
      state.setupCount = Math.min(6, state.setupCount + 1);
      render();
      return;
    }
    if (act === "count-down") {
      state.setupCount = Math.max(1, state.setupCount - 1);
      render();
      return;
    }
    if (act === "create") {
      const master = ($("#masterName") && $("#masterName").value) || state.setupMaster;
      const names = [];
      document.querySelectorAll("input[data-name]").forEach((inp) => names.push(inp.value));
      while (names.length < state.setupCount) names.push("");
      startNew(master, names.slice(0, state.setupCount));
      return;
    }
    if (act === "role-master") {
      state.role = "master";
      render();
      return;
    }
    if (act === "role-players") {
      state.role = "players";
      if (game && game.phase === "master" && scene(game).type !== "intro") game.phase = "choose";
      save(game);
      render();
      return;
    }
    if (act === "intro-next") {
      goNextScene(game);
      return;
    }
    if (act === "to-players") {
      state.role = "players";
      if (game.phase === "master") game.phase = "choose";
      save(game);
      render();
      return;
    }
    if (act === "pick") {
      game.currentChoiceId = btn.getAttribute("data-id");
      save(game);
      render();
      return;
    }
    if (act === "to-roll") {
      if (!game.currentChoiceId) return;
      game.phase = "roll";
      game.currentActorIndex = 0;
      while (game.currentActorIndex < scene(game).actors.length && playerById(game, scene(game).actors[game.currentActorIndex])?.hp <= 0) {
        game.currentActorIndex += 1;
      }
      save(game);
      render();
      return;
    }
    if (act === "do-roll") {
      rollForCurrentActor(game);
      return;
    }
    if (act === "roll-next") {
      afterRollContinue(game);
      return;
    }
    if (act === "to-master") {
      state.role = "master";
      save(game);
      render();
      return;
    }
    if (act === "scene-next") {
      state.role = "master";
      goNextScene(game);
      return;
    }
    if (act === "clear-end") {
      AF_STORAGE.setActive(null);
      state.game = null;
      state.view = "home";
      render();
    }
  }

  function onInput(ev) {
    if (ev.target.id === "masterName") state.setupMaster = ev.target.value;
    if (ev.target.matches("input[data-name]")) {
      const i = Number(ev.target.getAttribute("data-name"));
      state.setupNames[i] = ev.target.value;
    }
  }

  document.addEventListener("click", onClick);
  document.addEventListener("input", onInput);

  function boot() {
    const s = AF_STORAGE.getSettings();
    state.setupMaster = s.lastMaster || "";
    state.setupNames = (s.lastPlayers || []).concat(["", "", "", "", "", ""]).slice(0, 6);
    state.setupCount = Math.min(6, Math.max(1, (s.lastPlayers || []).filter(Boolean).length || 3));
    if (state.view === "home") {
      state.game = state.game || AF_STORAGE.getActive();
      if (state.game && state.game.status !== "ongoing") state.view = "end";
    }
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.AF_APP = { state, render, startNew };
})();
