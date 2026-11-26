(function () {
  var canvas = document.createElement("canvas");
  canvas.id = "fire";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  var ctx = canvas.getContext("2d");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var w, h, dpr, flames = [], embers = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (still && flames.length) {
      flames = [];
      embers = [];
      draw();
    }
  }

  function flame(seed) {
    var f = {
      x: Math.random() * w,
      y: h + 30,
      r: 35 + Math.random() * 55,
      vy: 1.6 + Math.random() * 2.4,
      vx: (Math.random() - 0.5) * 0.6,
      life: 0,
      max: 45 + Math.random() * 75
    };
    if (seed) {
      f.life = Math.random() * f.max;
      f.y -= f.vy * f.life;
    }
    return f;
  }

  function ember() {
    return {
      x: Math.random() * w,
      y: h + 5,
      r: 0.8 + Math.random() * 2,
      vy: 0.6 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.8,
      phase: Math.random() * Math.PI * 2,
      life: 0,
      max: 200 + Math.random() * 300
    };
  }

  function seedEmber() {
    var e = ember();
    e.life = Math.random() * e.max * 0.8;
    e.y -= e.vy * e.life;
    return e;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    var target = Math.round(w / 9);
    while (flames.length < target) flames.push(flame(true));
    while (embers.length < Math.round(w / 18)) embers.push(seedEmber());

    flames.forEach(function (f, i) {
      f.life++;
      f.y -= f.vy;
      f.x += f.vx + Math.sin((f.life + i) * 0.08) * 0.5;
      var t = f.life / f.max;
      if (t >= 1) {
        flames[i] = flame();
        return;
      }
      var r = f.r * (1 - t * 0.75);
      var g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      var a = Math.pow(1 - t, 1.5) * 0.42;
      var green = Math.round(220 - 170 * t);
      g.addColorStop(0, "rgba(255, " + green + ", " + Math.round(90 * (1 - t)) + ", " + a + ")");
      g.addColorStop(0.4, "rgba(255, " + Math.round(green * 0.5) + ", 0, " + a * 0.7 + ")");
      g.addColorStop(1, "rgba(180, 10, 0, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    embers.forEach(function (e, i) {
      e.life++;
      e.y -= e.vy;
      e.x += e.vx + Math.sin(e.life * 0.05 + e.phase) * 0.6;
      if (e.life > e.max || e.y < -10) {
        embers[i] = ember();
        return;
      }
      var a = Math.max(0, 1 - e.life / e.max) * (0.6 + 0.4 * Math.sin(e.life * 0.3 + e.phase));
      ctx.fillStyle = "rgba(255, " + (150 + Math.round(80 * a)) + ", 60, " + a + ")";
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = "source-over";
    if (!still) requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  if (still) {
    for (var i = 0; i < 80; i++) draw();
  } else {
    requestAnimationFrame(draw);
  }
})();
