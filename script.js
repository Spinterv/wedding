(function () {
  "use strict";

  const WEDDING_AT = new Date("2026-08-05T17:00:00+03:00");
  const LOADER_MS = 5000;
  const PAW_TAIL = 4;
  const PAW_IMG = "img/" + encodeURIComponent("Ресурс 1.png");
  const PAW_IMG_FALLBACK = "img/paw-print.png";

  /* Позиции и повороты сняты с SVG/лапы полностью.png (tools/extract-paws-from-png.py) */
  const PAW_SPOTS = [
    { x: 11.48, y: 93.51, rot: 0 }, //1
    { x: 5.34, y: 88.69, rot: 0 }, //2
    { x: 16.52, y: 84.98, rot: 0 }, //3
    { x: 11.11, y: 76.8, rot: 0 }, //4
    { x: 22.36, y: 78.25, rot: 30 }, //5
    { x: 17.8, y: 67.46, rot: 40 }, //6
    { x: 28.63, y: 74.6, rot: 50 }, //7
    { x: 25.19, y: 61.75, rot: 50 }, //8
    { x: 35.13, y: 74.47, rot: 80 }, //9
    { x: 32.97, y: 60.1, rot: 60 }, //10
    { x: 41.91, y: 76.94, rot: 86 }, //11
    { x: 40.51, y: 62.03, rot: 86 }, //12
    { x: 49.03, y: 80.1, rot: 93 }, //13
    { x: 47.57, y: 65.26, rot: 80 }, //14
    { x: 56.63, y: 81.68, rot: 70 }, //15
    { x: 54.29, y: 67.46, rot: 60 }, //16
    { x: 64.32, y: 79.76, rot: 50 }, //17
    { x: 60.82, y: 66.91, rot: 40 }, //18
    { x: 71.68, y: 74.26, rot: 30 }, //19
    { x: 67.21, y: 63.33, rot: 0 }, //20
    { x: 78.43, y: 65.46, rot: 0 }, //21
    { x: 73.14, y: 56.8, rot: 0 }, //22
    { x: 84.36, y: 53.64, rot: 0 }, //23  
    { x: 78.4, y: 47.66, rot: 0 }, //24
    { x: 89.1, y: 39.21, rot: 0 }, //25
    { x: 82.78, y: 36.19, rot: 0 }, //26
    { x: 92.57, y: 25.92, rot: 0 }, //27
    { x: 86.12, y: 22.85, rot: 0 }, //28  
    { x: 94.6, y: 12.39, rot: 0 }, //29
    { x: 88.31, y: 7.28, rot: 0 }, //30

  ];

  function pawTransform(index, scale) {
    var spot = PAW_SPOTS[index];
    var rot = spot && typeof spot.rot === "number" ? spot.rot : 0;
    var s = Number(scale);
    if (!isFinite(s)) s = 1;
    return (
      "translate(-50%, -50%) rotate(" +
      rot +
      "deg) scale(" +
      s +
      ")"
    );
  }

  function initLoader() {
    const loader = document.getElementById("loader");
    const pawsRoot = document.getElementById("loaderPaws");

    if (!loader || !pawsRoot) return;

    document.body.classList.add("is-loading");

    const stepMs = LOADER_MS / PAW_SPOTS.length;
    const pawEls = [];

    PAW_SPOTS.forEach(function (spot, index) {
      const el = document.createElement("div");
      el.className = "loader__paw";
      el.style.left = spot.x + "%";
      el.style.top = spot.y + "%";

      const img = document.createElement("img");
      img.src = PAW_IMG;
      img.alt = "";
      img.decoding = "async";
      img.onerror = function () {
        img.src = PAW_IMG_FALLBACK;
      };
      el.appendChild(img);

      el.style.transform = pawTransform(index, 0.65);
      pawsRoot.appendChild(el);
      pawEls.push(el);
    });

    const startAt = performance.now() + 200;

    function tick(now) {
      const elapsed = now - startAt;
      if (elapsed < 0) {
        requestAnimationFrame(tick);
        return;
      }

      const head = Math.min(
        Math.floor(elapsed / stepMs),
        PAW_SPOTS.length - 1
      );

      pawEls.forEach(function (el, i) {
        const age = head - i;
        if (age >= 0 && age < PAW_TAIL) {
          const op = 1 - age / PAW_TAIL;
          el.classList.add("is-visible");
          el.style.opacity = String(op);
          el.style.transform = pawTransform(
            i,
            (0.65 + 0.35 * op).toFixed(2)
          );
        } else {
          el.classList.remove("is-visible");
          el.style.opacity = "0";
          el.style.transform = pawTransform(i, 0.65);
        }
      });

      if (elapsed < LOADER_MS) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);

    window.setTimeout(function () {
      loader.classList.add("is-done");
      loader.setAttribute("aria-busy", "false");
      document.body.classList.remove("is-loading");
    }, LOADER_MS);
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function initCountdown() {
    const root = document.getElementById("countdown");
    if (!root) return;

    const units = {
      days: root.querySelector('[data-unit="days"]'),
      hours: root.querySelector('[data-unit="hours"]'),
      minutes: root.querySelector('[data-unit="minutes"]'),
      seconds: root.querySelector('[data-unit="seconds"]'),
    };

    function tick() {
      const diff = WEDDING_AT.getTime() - Date.now();
      if (diff <= 0) {
        units.days.textContent = "0";
        units.hours.textContent = "00";
        units.minutes.textContent = "00";
        units.seconds.textContent = "00";
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      units.days.textContent = String(days);
      units.hours.textContent = pad2(hours);
      units.minutes.textContent = pad2(minutes);
      units.seconds.textContent = pad2(seconds);
    }

    tick();
    window.setInterval(tick, 1000);
  }

  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    els.forEach((el) => observer.observe(el));

    requestAnimationFrame(() => {
      const hero = document.querySelector(".hero");
      if (hero) hero.classList.add("is-visible");
    });
  }

  initLoader();
  initCountdown();
  initReveal();
})();
