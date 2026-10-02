(function () {
  var cur = "0", prev = null, op = null, fresh = false, expr = "", err = false, hist = [];
  var out = document.getElementById("out"), exprEl = document.getElementById("expr"), histEl = document.getElementById("hist");

  function fmt(s) {
    var n = parseFloat(s);
    if (!isFinite(n)) return s;
    if (/\.$/.test(s) || /\.\d*0$/.test(s)) return Number(s.split(".")[0]).toLocaleString("en-US") + "." + s.split(".")[1];
    var r = parseFloat(n.toPrecision(12));
    if (Math.abs(r) >= 1e15 || (r !== 0 && Math.abs(r) < 1e-9)) return r.toExponential(6);
    return r.toLocaleString("en-US", { maximumFractionDigits: 10 });
  }
  function calc(a, b, o) {
    a = parseFloat(a); b = parseFloat(b);
    if (o === "+") return a + b;
    if (o === "−") return a - b;
    if (o === "×") return a * b;
    if (o === "÷") return b === 0 ? null : a / b;
  }
  function render() {
    out.classList.toggle("err", err);
    out.textContent = err ? "Can't divide by zero" : fmt(cur);
    out.style.fontSize = err ? "" : (out.textContent.length > 14 ? "24px" : out.textContent.length > 10 ? "32px" : "");
    exprEl.textContent = expr;
    histEl.textContent = hist.length ? hist.slice(-2).join("   |   ") : "Your last results appear here";
  }
  function reset() { cur = "0"; prev = null; op = null; fresh = false; expr = ""; err = false; }
  function digit(d) {
    if (err) reset();
    if (fresh) { cur = d; fresh = false; if (!op) expr = ""; }
    else if (cur.replace(/[-.]/g, "").length < 15) cur = cur === "0" ? d : cur + d;
    render();
  }
  function dot() {
    if (err) reset();
    if (fresh) { cur = "0."; fresh = false; if (!op) expr = ""; }
    else if (cur.indexOf(".") === -1) cur += ".";
    render();
  }
  function setOp(o) {
    if (err) return;
    if (op && !fresh) {
      var r = calc(prev, cur, op);
      if (r === null) { reset(); err = true; return render(); }
      cur = String(parseFloat(r.toPrecision(12)));
    }
    prev = cur; op = o; fresh = true; expr = fmt(prev) + " " + o;
    render();
  }
  function equals() {
    if (err || !op) return;
    var r = calc(prev, cur, op);
    if (r === null) { reset(); err = true; return render(); }
    var res = String(parseFloat(r.toPrecision(12)));
    expr = fmt(prev) + " " + op + " " + fmt(cur) + " =";
    hist.push(fmt(res)); if (hist.length > 5) hist.shift();
    cur = res; prev = null; op = null; fresh = true;
    render();
  }
  function neg() { if (err) return; if (cur !== "0") cur = cur[0] === "-" ? cur.slice(1) : "-" + cur; render(); }
  function pct() { if (err) return; cur = String(parseFloat((parseFloat(cur) / 100).toPrecision(12))); fresh = true; render(); }
  function back() {
    if (err) { reset(); return render(); }
    if (fresh) return;
    cur = cur.length > 1 && !(cur.length === 2 && cur[0] === "-") ? cur.slice(0, -1) : "0";
    render();
  }

  document.querySelector(".keys").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.d) digit(b.dataset.d);
    else if (b.dataset.o) setOp(b.dataset.o);
    else switch (b.dataset.a) {
      case "clear": reset(); render(); break;
      case "neg": neg(); break;
      case "pct": pct(); break;
      case "dot": dot(); break;
      case "back": back(); break;
      case "eq": equals(); break;
    }
  });

  document.addEventListener("keydown", function (e) {
    var k = e.key;
    if (/^\d$/.test(k)) digit(k);
    else if (k === "." || k === ",") dot();
    else if (k === "+") setOp("+");
    else if (k === "-") setOp("−");
    else if (k === "*" || k === "x") setOp("×");
    else if (k === "/") { e.preventDefault(); setOp("÷"); }
    else if (k === "%") pct();
    else if (k === "Enter" || k === "=") { e.preventDefault(); equals(); }
    else if (k === "Backspace") back();
    else if (k === "Escape" || k === "c" || k === "C") { reset(); render(); }
  });

  var themeBtn = document.getElementById("theme");
  themeBtn.addEventListener("click", function () {
    var root = document.documentElement;
    var dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    themeBtn.textContent = dark ? "Dark mode" : "Light mode";
  });
  if (matchMedia("(prefers-color-scheme: dark)").matches) themeBtn.textContent = "Light mode";

  render();
})();
