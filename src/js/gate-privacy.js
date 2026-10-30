/* Login de Privacy AI Studio (estética de la marca).
   Mismas credenciales que ZLT-WEB-V2 / ZLT-WEB-PRESENTACIONES: SALT y USERS copiados tal cual de gate.js.
   Si cambian los usuarios allá, copiar gate.js de nuevo y reemplazar SALT y USERS acá (o correr tools/sync_gate.py).
   Client-side sobre un sitio estático: frena a quien entra por la URL, no a quien lea el repo.
   Ni los mails ni la clave viajan en claro: sha256(salt+mail+":"+clave). */
(function () {
  var SALT = "zlt-gate-v1-2026";
  var USERS = [
    "df08d8ce0b3e5cc4a02a8a75d5f8459512e02183001d65dd7d64864f66e4bdbb",
    "ebcba71f4ffdd4b8a250dd8fc2ee6e550910a1bea2359fdcdbe0593ce6eb4245",
    "04337204d3c2067b342c52edf3f9c5aba1618d2e2c2e815964552599eaceddf5",
    "fc5dde996f7c480eb025478f7e0a9b8988b16bbf3f6f8837e7da0f586bb3354c",
    "7655a20b7bffe0750c2207be8cad0fb872102078c86ef605d04948e98492c85d",
    "00dfd62886f061cf6fd17606a3ac26f2bbf7fbcd605af4915da99fe7f94e0efd",
    "2de7532ce50b12d616d2ab74dea6e64ac20ac214c050b898b8521a7d6dd09eae"
  ];
  var KEY = "privacy_gate_ok";
  var LOGO = "__LOGO__", BG = "__BG__", SHAPE = "__SHAPE__";
  var root = document.documentElement;
  try { if (sessionStorage.getItem(KEY) === "1") return; } catch (e) {}
  root.style.visibility = "hidden";

  var lang = "es";
  try { lang = localStorage.getItem("privacy-lang") || ((navigator.language || "es").slice(0, 2) === "en" ? "en" : "es"); } catch (e) {}
  var T = {
    es: { tag: "On-premise · Trazable · Auditable", h: "Acceso privado", p: "Ingresá con tu cuenta para ver el sitio.", mail: "Email", pass: "Contraseña",
          go: "Ingresar", show: "Mostrar contraseña", hide: "Ocultar contraseña", empty: "Completá los dos campos.", bad: "Email o contraseña incorrectos.",
          foot: "Diseñado por IALAB · Facultad de Derecho, UBA · Desarrollado por Puzzle AI" },
    en: { tag: "On-premise · Traceable · Auditable", h: "Private access", p: "Sign in with your account to view the site.", mail: "Email", pass: "Password",
          go: "Sign in", show: "Show password", hide: "Hide password", empty: "Please fill in both fields.", bad: "Wrong email or password.",
          foot: "Designed by IALAB · University of Buenos Aires School of Law · Developed by Puzzle AI" }
  }[lang === "en" ? "en" : "es"];

  async function sha256(txt) {
    var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }

  var F = "'Causten',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
  var B = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
  var CSS = [
    "#pgate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;overflow:auto;",
      "background:#010D33 url(" + BG + ") 70% 50%/cover no-repeat;font-family:" + B + ";color:#E9ECF5;-webkit-font-smoothing:antialiased}",
    "#pgate::before{content:'';position:absolute;inset:0;background:radial-gradient(900px 600px at 30% 50%,rgba(1,10,38,.35),rgba(1,10,38,.88) 70%)}",
    "#pgate *{box-sizing:border-box}",
    "#pgate .pg-shape{position:absolute;width:min(520px,60vw);right:-120px;top:-80px;opacity:.38;pointer-events:none;animation:pgFloat 14s ease-in-out infinite}",
    "#pgate .pg-shape.b{right:auto;left:-170px;top:auto;bottom:-160px;width:min(440px,50vw);opacity:.22;transform:rotate(160deg);animation-duration:18s}",
    "@keyframes pgFloat{50%{translate:0 -18px;rotate:4deg}}",
    "#pgate .pg-wrap{position:relative;width:100%;max-width:410px;text-align:center;animation:pgIn 1s cubic-bezier(.16,.84,.44,1) both}",
    "@keyframes pgIn{from{opacity:0;transform:translateY(16px)}}",
    "#pgate .pg-logo{width:236px;height:auto;display:block;margin:0 auto 14px}",
    "#pgate .pg-tag{font:600 11px/1 " + F + ";letter-spacing:.3em;text-transform:uppercase;color:rgba(233,236,245,.6);margin:0 0 34px}",
    "#pgate .pg-card{position:relative;text-align:left;padding:34px 32px 28px;border-radius:24px;",
      "background:linear-gradient(160deg,rgba(255,255,255,.14),rgba(255,255,255,.04) 55%,rgba(255,255,255,.06));",
      "border:1px solid rgba(255,255,255,.16);box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 40px 80px -30px rgba(0,0,0,.7);",
      "backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%)}",
    "#pgate h1{margin:0 0 6px;font:500 26px/1.15 " + F + ";letter-spacing:-.01em;color:#fff}",
    "#pgate .pg-sub{margin:0 0 26px;font-size:14.5px;line-height:1.5;color:rgba(233,236,245,.66)}",
    "#pgate label{display:block;font:600 11px/1 " + F + ";letter-spacing:.2em;text-transform:uppercase;color:rgba(233,236,245,.6);margin:0 0 9px}",
    "#pgate .pg-field{position:relative;display:flex;align-items:center;margin:0 0 18px;border-radius:14px;background:rgba(1,10,38,.45);",
      "border:1px solid rgba(255,255,255,.16);transition:border-color .2s,box-shadow .2s}",
    "#pgate .pg-field:focus-within{border-color:#C9D4FF;box-shadow:0 0 0 4px rgba(120,150,255,.18)}",
    "#pgate .pg-ico{width:44px;flex:none;display:flex;align-items:center;justify-content:center}",
    "#pgate .pg-ico svg,#pgate .pg-eye svg{width:18px;height:18px;stroke:rgba(233,236,245,.7);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}",
    "#pgate input{flex:1;min-width:0;height:48px;border:0;background:transparent;color:#fff;font:400 15.5px/1 " + B + ";padding:0 12px 0 0;outline:0}",
    "#pgate input:-webkit-autofill{-webkit-text-fill-color:#fff;-webkit-box-shadow:0 0 0 40px #0A1B55 inset;caret-color:#fff}",
    "#pgate .pg-eye{width:44px;height:48px;flex:none;border:0;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}",
    "#pgate .pg-eye:hover svg{stroke:#fff}",
    "#pgate button[type=submit]{width:100%;height:52px;margin-top:6px;border:0;border-radius:999px;background:#F9F9F7;color:#021444;cursor:pointer;",
      "font:600 15px/1 " + F + ";letter-spacing:.02em;box-shadow:0 14px 34px -12px rgba(120,150,255,.6);transition:transform .25s cubic-bezier(.16,.84,.44,1),box-shadow .25s}",
    "#pgate button[type=submit]:hover{transform:translateY(-2px);box-shadow:0 20px 40px -12px rgba(120,150,255,.75)}",
    "#pgate button[type=submit]:disabled{opacity:.6;cursor:default;transform:none}",
    "#pgate .pg-err{color:#FF9E8F;font-size:13px;margin:14px 0 0;min-height:18px;text-align:center}",
    "#pgate .pg-card.shake{animation:pgShake .45s}",
    "@keyframes pgShake{20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}",
    "#pgate .pg-foot{font-size:12.5px;line-height:1.6;color:rgba(233,236,245,.5);margin:26px 0 0}",
    "@media(max-width:440px){#pgate .pg-card{padding:28px 22px 24px}#pgate .pg-logo{width:200px}}",
    "@media(prefers-reduced-motion:reduce){#pgate *{animation:none!important;transition:none!important}}"
  ].join("");

  var ICO_USER = '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/></svg>';
  var ICO_LOCK = '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7"/></svg>';
  var ICO_EYE = '<svg viewBox="0 0 24 24"><path d="M1.8 12S5.6 5.5 12 5.5 22.2 12 22.2 12 18.4 18.5 12 18.5 1.8 12 1.8 12z"/><circle cx="12" cy="12" r="3"/><path d="M3.5 3.5l17 17"/></svg>';
  var ICO_EYE_ON = '<svg viewBox="0 0 24 24"><path d="M1.8 12S5.6 5.5 12 5.5 22.2 12 22.2 12 18.4 18.5 12 18.5 1.8 12 1.8 12z"/><circle cx="12" cy="12" r="3"/></svg>';

  function build() {
    var hidden = [].slice.call(document.body.children);
    hidden.forEach(function (n) { n.style.display = "none"; });
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    var ov = document.createElement("div"); ov.id = "pgate";
    ov.innerHTML =
      '<img class="pg-shape" src="' + SHAPE + '" alt="" aria-hidden="true"><img class="pg-shape b" src="' + SHAPE + '" alt="" aria-hidden="true">' +
      '<div class="pg-wrap">' +
        '<img class="pg-logo" src="' + LOGO + '" alt="Privacy AI Studio by Puzzle AI">' +
        '<p class="pg-tag">' + T.tag + '</p>' +
        '<form class="pg-card" novalidate>' +
          '<h1>' + T.h + '</h1><p class="pg-sub">' + T.p + '</p>' +
          '<label for="pgu">' + T.mail + '</label>' +
          '<div class="pg-field"><span class="pg-ico">' + ICO_USER + '</span>' +
            '<input id="pgu" type="email" autocomplete="username" autocapitalize="off" spellcheck="false" required></div>' +
          '<label for="pgp">' + T.pass + '</label>' +
          '<div class="pg-field"><span class="pg-ico">' + ICO_LOCK + '</span>' +
            '<input id="pgp" type="password" autocomplete="current-password" required>' +
            '<button type="button" class="pg-eye" id="pge" aria-label="' + T.show + '">' + ICO_EYE + '</button></div>' +
          '<button type="submit">' + T.go + '</button>' +
          '<p class="pg-err" id="pgerr" role="alert" aria-live="polite"></p>' +
        '</form>' +
        '<p class="pg-foot">' + T.foot + '</p>' +
      '</div>';
    document.body.appendChild(ov);
    root.style.visibility = "visible";
    ov.querySelector("#pgu").focus();

    var pw = ov.querySelector("#pgp"), eye = ov.querySelector("#pge"), card = ov.querySelector(".pg-card");
    eye.addEventListener("click", function () {
      var show = pw.type === "password";
      pw.type = show ? "text" : "password";
      eye.innerHTML = show ? ICO_EYE_ON : ICO_EYE;
      eye.setAttribute("aria-label", show ? T.hide : T.show);
      pw.focus();
    });
    function fail(msg) { var err = ov.querySelector("#pgerr"); err.textContent = msg; card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake"); }
    card.addEventListener("submit", async function (e) {
      e.preventDefault();
      var btn = ov.querySelector("button[type=submit]");
      var mail = ov.querySelector("#pgu").value.trim().toLowerCase();
      if (!mail || !pw.value) return fail(T.empty);
      btn.disabled = true;
      var h = await sha256(SALT + mail + ":" + pw.value);
      btn.disabled = false;
      if (USERS.indexOf(h) === -1) { pw.value = ""; pw.focus(); return fail(T.bad); }
      try { sessionStorage.setItem(KEY, "1"); } catch (e2) {}
      ov.style.transition = "opacity .6s"; ov.style.opacity = "0";
      hidden.forEach(function (n) { n.style.display = ""; });
      setTimeout(function () { st.remove(); ov.remove(); }, 620);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
