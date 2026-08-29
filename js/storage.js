(function (root) {
  const KEYS = {
    active: "af.v1.active",
    used: "af.v1.used",
    archive: "af.v1.archive",
    settings: "af.v1.settings"
  };

  function emptyUsed() {
    return {
      worlds: [],
      quests: [],
      villains: [],
      treasures: [],
      npcs: [],
      roles: [],
      locations: [],
      challenges: [],
      climax: []
    };
  }

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  const storage = {
    keys: KEYS,
    emptyUsed,
    getActive() {
      return read(KEYS.active, null);
    },
    setActive(game) {
      if (game) write(KEYS.active, game);
      else localStorage.removeItem(KEYS.active);
    },
    getUsed() {
      const used = read(KEYS.used, emptyUsed());
      const base = emptyUsed();
      for (const k of Object.keys(base)) {
        if (!Array.isArray(used[k])) used[k] = [];
      }
      return used;
    },
    setUsed(used) {
      write(KEYS.used, used);
    },
    markUsed(idsByPool) {
      const used = storage.getUsed();
      for (const [pool, ids] of Object.entries(idsByPool)) {
        if (!used[pool]) used[pool] = [];
        for (const id of ids) {
          if (!used[pool].includes(id)) used[pool].push(id);
        }
      }
      storage.setUsed(used);
      return used;
    },
    getArchive() {
      return read(KEYS.archive, []);
    },
    pushArchive(entry) {
      const list = storage.getArchive();
      list.unshift(entry);
      write(KEYS.archive, list.slice(0, 40));
    },
    getSettings() {
      return read(KEYS.settings, { lastMaster: "", lastPlayers: ["", "", ""] });
    },
    setSettings(s) {
      write(KEYS.settings, s);
    },
    resetUsed() {
      storage.setUsed(emptyUsed());
    }
  };

  root.AF_STORAGE = storage;
})(typeof window !== "undefined" ? window : globalThis);
