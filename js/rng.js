(function (root) {
  function rng(seed) {
    let s = seed >>> 0;
    if (!s) s = 1;
    return function next() {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function seedFrom() {
    const a = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    return a || 1;
  }

  function shuffle(arr, rand) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function rollD6(rand) {
    return 1 + Math.floor(rand() * 6);
  }

  root.AF_RNG = { rng, seedFrom, shuffle, rollD6 };
})(typeof window !== "undefined" ? window : globalThis);
