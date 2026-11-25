"use strict";

/**
 * Pruebas de la landing KOA HUB (Fase 1 + Fase 2).
 *
 * Uso (con el sitio corriendo, por ejemplo `npx wrangler dev --port 8794`):
 *   BASE_URL=http://localhost:8794/home/ NODE_PATH=$(npm root -g) node tests/run.js
 *
 * Requiere Playwright instalado aparte (no es dependencia del proyecto para no
 * alargar el build de Workers Builds). Plan de pruebas: docs/PLAN_DE_PRUEBAS.md
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { chromium } = require("playwright");

const BASE = (process.env.BASE_URL || "http://localhost:8794/home/").replace(/\/?$/, "/");
const ORIGIN = new URL(BASE).origin;
const ROOT = path.join(__dirname, "..", "public", "home");

const resultados = [];

function norm(texto) {
  return String(texto).replace(/\s+/g, " ").trim();
}

function cargarDiccionario() {
  const contexto = { window: {} };
  vm.createContext(contexto);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js", "i18n.js"), "utf8"), contexto);
  return contexto.window.KOA_I18N;
}

async function prueba(id, nombre, fn) {
  try {
    const detalle = await fn();
    resultados.push({ id, nombre, ok: true, detalle: detalle || "" });
  } catch (error) {
    resultados.push({ id, nombre, ok: false, detalle: error.message });
  }
}

function afirmar(condicion, mensaje) {
  if (!condicion) {
    throw new Error(mensaje);
  }
}

async function nuevaPagina(browser, opciones, inicial) {
  const contexto = await browser.newContext(
    Object.assign({ viewport: { width: 1440, height: 900 }, locale: "es-MX" }, opciones || {})
  );
  const pagina = await contexto.newPage();
  const errores = [];
  pagina.on("pageerror", (e) => errores.push(e.message));

  if (inicial) {
    await pagina.addInitScript((datos) => {
      try {
        /* Solo en la primera carga: así se comprueba la persistencia al recargar. */
        if (!sessionStorage.getItem("__koa_init")) {
          Object.keys(datos).forEach((k) => localStorage.setItem(k, datos[k]));
          sessionStorage.setItem("__koa_init", "1");
        }
      } catch (e) {
        /* sin almacenamiento */
      }
    }, inicial);
  }

  await pagina.goto(BASE, { waitUntil: "load" });
  await pagina.waitForTimeout(400);
  return { contexto, pagina, errores };
}

(async () => {
  const dic = cargarDiccionario();
  const browser = await chromium.launch();

  /* ============================ FASE 1 ============================ */

  await prueba("P1", "Carga sin errores de JS (oscuro, claro, móvil)", async () => {
    for (const [vp, esquema] of [
      [{ width: 1440, height: 900 }, "dark"],
      [{ width: 1440, height: 900 }, "light"],
      [{ width: 390, height: 844 }, "dark"]
    ]) {
      const { contexto, errores } = await nuevaPagina(browser, { viewport: vp, colorScheme: esquema });
      afirmar(errores.length === 0, "pageerror: " + errores.join(" | "));
      await contexto.close();
    }
  });

  await prueba("P2", "Sin scroll horizontal en 1440, 820 y 390 px (es, en, ja)", async () => {
    for (const ancho of [1440, 820, 390]) {
      for (const lang of ["es", "en", "ja"]) {
        const { contexto, pagina } = await nuevaPagina(
          browser,
          { viewport: { width: ancho, height: 900 } },
          { "koa-lang": lang }
        );
        const m = await pagina.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
        afirmar(m[0] === m[1], `${ancho}px/${lang}: scrollWidth ${m[0]} ≠ ${m[1]}`);
        await contexto.close();
      }
    }
  });

  await prueba("P3", "JS genera 3 tarjetas en #fuerzas-lista", async () => {
    const { contexto, pagina } = await nuevaPagina(browser);
    const n = await pagina.locator("#fuerzas-lista .unit-card").count();
    afirmar(n === 3, "tarjetas: " + n);
    await contexto.close();
  });

  await prueba("P4", "Un solo h1 y todas las imágenes con alt", async () => {
    const { contexto, pagina } = await nuevaPagina(browser);
    const r = await pagina.evaluate(() => [
      document.querySelectorAll("h1").length,
      [...document.images].filter((i) => !i.hasAttribute("alt")).length,
      [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length
    ]);
    afirmar(r[0] === 1 && r[1] === 0 && r[2] === 0, JSON.stringify(r));
    await contexto.close();
  });

  await prueba("P5", "El tema persiste tras recargar y cambia el logo", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, { colorScheme: "dark" }, { "koa-lang": "es" });
    await pagina.click("#theme-toggle");
    const t1 = await pagina.getAttribute("html", "data-theme");
    await pagina.reload();
    await pagina.waitForTimeout(300);
    const t2 = await pagina.getAttribute("html", "data-theme");
    const logo = await pagina.getAttribute(".site-header .brand__logo", "src");
    afirmar(t1 === "light" && t2 === "light", `${t1}/${t2}`);
    afirmar(/negro/.test(logo), "logo: " + logo);
    await contexto.close();
  });

  await prueba("P6", "Todas las anclas internas existen", async () => {
    const { contexto, pagina } = await nuevaPagina(browser);
    const faltan = await pagina.evaluate(() =>
      [...new Set([...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute("href")))]
        .filter((h) => h.length > 1 && !document.querySelector(h))
    );
    afirmar(faltan.length === 0, "faltan: " + faltan.join(","));
    await contexto.close();
  });

  await prueba("P7", "Enlaces externos con noopener; eSPORTS → esports.koa-hub.com; sin vercel", async () => {
    const { contexto, pagina } = await nuevaPagina(browser);
    const r = await pagina.evaluate(() => ({
      malos: [...document.querySelectorAll("a[target=_blank]")].filter((a) => !/noopener/.test(a.rel)).length,
      esports: [...document.querySelectorAll("a")].filter((a) => a.href === "https://esports.koa-hub.com/").length,
      vercel: document.documentElement.outerHTML.includes("vercel")
    }));
    afirmar(r.malos === 0 && r.esports >= 2 && !r.vercel, JSON.stringify(r));
    await contexto.close();
  });

  await prueba("P8", "prefers-reduced-motion desactiva el revelado y el giro automático (parte de 0°)", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, { reducedMotion: "reduce" });
    const r = await pagina.evaluate(() => [
      document.querySelectorAll(".reveal").length,
      getComputedStyle(document.querySelector(".orbit")).getPropertyValue("--orbit-spin").trim()
    ]);
    afirmar(r[0] === 0 && Math.abs(parseFloat(r[1])) < 1, JSON.stringify(r));
    await contexto.close();
  });

  await prueba("P9", "Sin JS se ve el <noscript> con 3 fuerzas", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, { javaScriptEnabled: false });
    const r = [await pagina.locator(".noscript").isVisible(), await pagina.locator(".noscript__unit").count()];
    afirmar(r[0] && r[1] === 3, JSON.stringify(r));
    await contexto.close();
  });

  await prueba("P12", "Rutas: /home/, css, js, logos = 200; inexistente = 404; PDFs no publicados", async () => {
    const pedir = async (ruta) => (await fetch(ORIGIN + ruta)).status;
    const ok = await Promise.all(
      ["/home/", "/home/css/styles.css", "/home/js/main.js", "/home/js/i18n.js",
        "/home/vendor/bootstrap/bootstrap-grid.min.css", "/home/assets/brand/koa-logo-blanco.png"].map(pedir)
    );
    afirmar(ok.every((c) => c === 200), "códigos: " + ok.join(","));
    afirmar((await pedir("/home/nope")) === 404, "404 esperado");
    afirmar((await pedir("/home/assets/docs/koa-dex.pdf")) === 404, "PDF público");
  });

  await prueba("P13", "Encabezados de seguridad y caché", async () => {
    const r = await fetch(ORIGIN + "/home/");
    const h = (n) => r.headers.get(n);
    afirmar(h("x-content-type-options") === "nosniff" && h("x-frame-options") === "SAMEORIGIN" &&
      h("referrer-policy") && h("permissions-policy"), "faltan encabezados");
    const logo = await fetch(ORIGIN + "/home/assets/brand/koa-logo-blanco.png");
    afirmar(/max-age=3600/.test(logo.headers.get("cache-control") || ""), "cache de assets");
  });

  /* ============================ FASE 2 ============================ */

  await prueba("F2-1", "Bootstrap cargado: .container, .row y columnas funcionan", async () => {
    const { contexto, pagina } = await nuevaPagina(browser);
    const r = await pagina.evaluate(() => {
      const hojas = [...document.styleSheets].map((s) => s.href || "").filter((h) => /bootstrap/.test(h));
      const fila = getComputedStyle(document.querySelector(".hero__grid")).display;
      const c7 = document.querySelector(".hero__content").getBoundingClientRect().width;
      const c5 = document.querySelector(".hero__visual").getBoundingClientRect().width;
      return { hojas: hojas.length, fila, ratio: +(c7 / c5).toFixed(2) };
    });
    afirmar(r.hojas === 2, "hojas bootstrap: " + r.hojas);
    afirmar(r.fila === "flex", "row no es flex: " + r.fila);
    afirmar(r.ratio > 1.2 && r.ratio < 1.6, "proporción 7/5 esperada, fue " + r.ratio);
    await contexto.close();
  });

  await prueba("F2-2", "Grid responsive: 3 columnas ≥992 px y 1 columna en móvil (fuerzas, pilares, valores 5/1)", async () => {
    const cols = async (vp, sel) => {
      const { contexto, pagina } = await nuevaPagina(browser, { viewport: vp });
      const n = await pagina.evaluate((s) => new Set([...document.querySelectorAll(s)].map((e) => Math.round(e.getBoundingClientRect().left))).size, sel);
      await contexto.close();
      return n;
    };
    const d = [await cols({ width: 1440, height: 900 }, "#fuerzas-lista > .col"), await cols({ width: 1440, height: 900 }, ".pillars > .col"), await cols({ width: 1440, height: 900 }, ".values > .col")];
    const m = [await cols({ width: 390, height: 844 }, "#fuerzas-lista > .col"), await cols({ width: 390, height: 844 }, ".pillars > .col"), await cols({ width: 390, height: 844 }, ".values > .col")];
    afirmar(d.join() === "3,3,5", "escritorio " + d.join());
    afirmar(m.join() === "1,1,1", "móvil " + m.join());
  });

  await prueba("F2-3", "Diccionario completo: mismas claves en es/en/ja y todas las del HTML existen", async () => {
    const claves = Object.keys(dic.es);
    for (const l of ["en", "ja"]) {
      const faltan = claves.filter((k) => !(k in dic[l]));
      const sobran = Object.keys(dic[l]).filter((k) => !(k in dic.es));
      afirmar(faltan.length === 0 && sobran.length === 0, `${l}: faltan ${faltan} sobran ${sobran}`);
      const vacias = claves.filter((k) => !norm(dic[l][k]));
      afirmar(vacias.length === 0, `${l} vacías: ${vacias}`);
    }
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    const usadas = new Set();
    for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) usadas.add(m[1]);
    for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) m[1].split(";").forEach((p) => usadas.add(p.split(":")[1].trim()));
    const js = fs.readFileSync(path.join(ROOT, "js", "main.js"), "utf8");
    for (const m of js.matchAll(/"((?:[a-z]+\.){1,2}[a-zA-Z0-9]+)"/g)) if (m[1] in dic.es) usadas.add(m[1]);
    const huerfanas = [...usadas].filter((k) => !(k in dic.es));
    afirmar(huerfanas.length === 0, "claves sin diccionario: " + huerfanas);
    return `${claves.length} claves × 3 idiomas; ${usadas.size} usadas`;
  });

  await prueba("F2-4", "El español del HTML (sin JS) coincide con el diccionario es", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, { javaScriptEnabled: false });
    const difs = await pagina.evaluate(() =>
      [...document.querySelectorAll("[data-i18n]")].map((e) => [e.getAttribute("data-i18n"), e.textContent])
    );
    const malos = difs.filter(([k, v]) => norm(v) !== norm(dic.es[k])).map(([k]) => k);
    afirmar(malos.length === 0, "difieren: " + [...new Set(malos)].join(", "));
    await contexto.close();
    return difs.length + " elementos";
  });

  await prueba("F2-5", "Selector de idioma: cambia textos, html[lang], título, aria-pressed y persiste", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, {}, { "koa-lang": "es" });
    for (const lang of ["en", "ja", "es"]) {
      await pagina.click(`.lang-switch__btn[data-lang="${lang}"]`);
      await pagina.waitForTimeout(100);
      const r = await pagina.evaluate((l) => ({
        lang: document.documentElement.lang,
        titulo: document.title,
        pressed: document.querySelector(`.lang-switch__btn[data-lang="${l}"]`).getAttribute("aria-pressed"),
        otros: [...document.querySelectorAll(".lang-switch__btn")].filter((b) => b.getAttribute("aria-pressed") === "true").length,
        h2: document.querySelector("#ecosistema-titulo").textContent,
        cards: [...document.querySelectorAll(".unit-card__desc")].map((e) => e.textContent),
        aria: document.querySelector(".unit-card__cta").getAttribute("aria-label"),
        crudos: [...document.querySelectorAll("[data-i18n]")].filter((e) => /^[a-z0-9]+(\.[a-zA-Z0-9]+)+$/.test(e.textContent.trim())).length
      }), lang);
      afirmar(r.lang === lang && r.pressed === "true" && r.otros === 1, `${lang}: ${JSON.stringify(r)}`);
      afirmar(r.titulo === dic[lang]["meta.title"], `${lang}: título`);
      afirmar(r.h2 === dic[lang]["eco.title"], `${lang}: h2 ${r.h2}`);
      afirmar(r.cards[0] === dic[lang]["unit.esports.desc"], `${lang}: tarjeta generada por JS no traducida`);
      afirmar(r.aria === dic[lang]["unit.exploreAria"].replace("{name}", "KOA eSPORTS"), `${lang}: aria ${r.aria}`);
      afirmar(r.crudos === 0, `${lang}: claves visibles`);
    }
    await pagina.click('.lang-switch__btn[data-lang="ja"]');
    await pagina.reload();
    await pagina.waitForTimeout(300);
    const guardado = await pagina.evaluate(() => document.documentElement.lang);
    afirmar(guardado === "ja", "no persistió: " + guardado);
    await contexto.close();
  });

  await prueba("F2-6", "El HTML trae las frases de marca en inglés con lang=en y la de SPORTS sigue al idioma", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, {}, { "koa-lang": "ja" });
    const r = await pagina.evaluate(() => ({
      marca: [...document.querySelectorAll('em[lang="en"], p[lang="en"]')].map((e) => e.textContent.trim()),
      sports: document.querySelector('[data-i18n="claim.sports"]').lang
    }));
    afirmar(r.marca.includes("Play. Compete. Belong.") && r.marca.includes("Become More of You."), JSON.stringify(r));
    afirmar(r.sports === "ja", "lang de claim.sports: " + r.sports);
    await contexto.close();
  });

  await prueba("F2-7", "Favicon cambia con el tema (oscuro ↔ claro) y persiste al recargar", async () => {
    const href = (p) => p.evaluate(() => [...document.querySelectorAll('link[rel="icon"]')].map((l) => l.getAttribute("href")));
    const { contexto, pagina } = await nuevaPagina(browser, { colorScheme: "dark" }, { "koa-theme": "dark" });
    let h = await href(pagina);
    afirmar(h.length === 3 && h.every((x) => /favicon-dark-/.test(x)), "oscuro: " + h);
    await pagina.click("#theme-toggle");
    h = await href(pagina);
    afirmar(h.length === 3 && h.every((x) => /favicon-(32|192|512)\.png$/.test(x)), "claro: " + h);
    await pagina.reload();
    h = await href(pagina);
    afirmar(h.every((x) => /favicon-(32|192|512)\.png$/.test(x)), "persistencia: " + h);
    for (const f of ["32", "192", "512"]) {
      for (const v of ["", "dark-"]) {
        const c = (await fetch(`${ORIGIN}/home/assets/brand/favicon-${v}${f}.png`)).status;
        afirmar(c === 200, `favicon ${v}${f}: ${c}`);
      }
    }
    await contexto.close();
  });

  await prueba("F2-8", "Órbita: el scroll hace girar etiquetas y esfera (bajar suma, subir resta)", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, { viewport: { width: 1440, height: 1400 } });
    const spin = () => pagina.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".orbit")).getPropertyValue("--orbit-spin")));
    await pagina.waitForTimeout(600);
    // fijar la deriva: medir la diferencia respecto a un periodo sin scroll
    const a0 = await spin();
    await pagina.waitForTimeout(500);
    const a1 = await spin();
    const deriva = Math.abs(a1 - a0);
    await pagina.mouse.wheel(0, 300);
    await pagina.waitForTimeout(900);
    const b = await spin();
    const bajar = b - a1;
    await pagina.mouse.wheel(0, -300);
    await pagina.waitForTimeout(900);
    const c = await spin();
    const subir = c - b;
    afirmar(bajar > 80, `bajar 300 px giró solo ${bajar.toFixed(1)}° (deriva ${deriva.toFixed(1)}°)`);
    afirmar(subir < bajar - 80, `subir no revirtió: ${subir.toFixed(1)}°`);
    await contexto.close();
    return `bajar 300 px = +${bajar.toFixed(0)}°, subir 300 px = ${subir.toFixed(0)}°`;
  });

  await prueba("F2-9", "Móvil 390 px: idioma y tema visibles y tocables, sin desbordar", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, { viewport: { width: 390, height: 844 } });
    const r = await pagina.evaluate(() => {
      const caja = (s) => document.querySelector(s).getBoundingClientRect();
      const l = caja(".lang-switch"), t = caja("#theme-toggle");
      return { l: [l.left, l.right, l.height], t: [t.left, t.right, t.height], w: innerWidth };
    });
    afirmar(r.l[0] >= 0 && r.l[1] <= r.w && r.t[0] >= 0 && r.t[1] <= r.w, JSON.stringify(r));
    afirmar(r.l[1] <= r.t[0] + 1, "el selector de idioma se solapa con el botón de tema");
    await pagina.click('.lang-switch__btn[data-lang="en"]');
    afirmar((await pagina.evaluate(() => document.documentElement.lang)) === "en", "no cambió en móvil");
    await contexto.close();
  });

  await prueba("F2-10", "Japonés: usa fuente CJK de respaldo y no recorta títulos", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, {}, { "koa-lang": "ja" });
    const r = await pagina.evaluate(() => ({
      fuente: getComputedStyle(document.body).fontFamily,
      recortados: [...document.querySelectorAll("h1,h2,h3")].filter((e) => e.scrollWidth > e.clientWidth + 1).length
    }));
    afirmar(/Noto Sans JP/.test(r.fuente) && r.recortados === 0, JSON.stringify(r));
    await contexto.close();
  });

  /* ============================ FASE 3 ============================ */

  await prueba("F3-1", "Pie: 4 redes con logo (Instagram, WhatsApp, TikTok, Discord), enlaces seguros e imágenes cargadas (es, en, ja)", async () => {
    for (const lang of ["es", "en", "ja"]) {
      const { contexto, pagina } = await nuevaPagina(browser, { viewport: { width: 1440, height: 900 } }, { "koa-lang": lang });
      await pagina.locator(".footer__social").scrollIntoViewIfNeeded();
      await pagina.waitForTimeout(500);
      const r = await pagina.evaluate(() => ({
        filas: [...document.querySelectorAll(".footer__social-row")].map((a) => ({
          href: a.getAttribute("href"),
          rel: a.rel,
          texto: a.textContent.trim(),
          aria: a.getAttribute("aria-label"),
          ok: [...a.querySelectorAll("img")].every((i) => i.complete && i.naturalWidth > 0)
        })),
        titulo: document.querySelector(".footer__contact .footer__heading").textContent.trim(),
        tarjetasViejas: document.querySelectorAll(".footer__sites, .footer__logo-card").length,
        crudos: [...document.querySelectorAll(".site-footer *")].filter((e) => e.children.length === 0 && /^[a-z0-9]+(\.[a-zA-Z0-9]+)+$/.test(e.textContent.trim())).length
      }));
      afirmar(r.filas.map((f) => f.texto).join() === "Instagram,WhatsApp,TikTok,Discord", lang + ": " + r.filas.map((f) => f.texto));
      afirmar(r.filas.every((f) => f.ok && /noopener/.test(f.rel) && /^https:\/\//.test(f.href)), lang + ": imagen o enlace");
      afirmar(r.filas[3].href === "https://discord.gg/rsghdX4Vf", lang + ": Discord");
      afirmar(r.filas.every((f) => f.aria && !/^ch\./.test(f.aria)), lang + ": aria-label");
      afirmar(r.titulo === dic[lang]["footer.contact.h"], lang + ": título " + r.titulo);
      afirmar(r.tarjetasViejas === 0 && r.crudos === 0, lang + ": " + JSON.stringify({ v: r.tarjetasViejas, c: r.crudos }));
      await contexto.close();
    }
  });

  await prueba("F3-2", "Azulejo de red: 34 px, esquinas cortadas, icono de 22 px (igual que el sitio de eSPORTS)", async () => {
    const { contexto, pagina } = await nuevaPagina(browser);
    const r = await pagina.evaluate(() => {
      const t = document.querySelector(".social-tile"), i = t.querySelector("img");
      const rt = t.getBoundingClientRect(), ri = i.getBoundingClientRect();
      return { w: Math.round(rt.width), h: Math.round(rt.height), icono: Math.round(ri.width), clip: getComputedStyle(t).clipPath !== "none" };
    });
    afirmar(r.w === 34 && r.h === 34 && r.icono <= 22 && r.clip, JSON.stringify(r));
    await contexto.close();
  });

  await prueba("F3-3", "Pie en móvil 390 px: sin desbordar y la palabra HUB en una sola línea", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, { viewport: { width: 390, height: 844 } });
    const r = await pagina.evaluate(() => ({
      palabra: Math.round(document.querySelector(".site-header .brand__word").getBoundingClientRect().height),
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth
    }));
    afirmar(r.sw === r.cw && r.palabra < 40, JSON.stringify(r));
    await contexto.close();
  });

  await prueba("F3-5", "Caché: HTML/CSS/JS se revalidan y las versiones (?v=) de CSS y JS están al día", async () => {
    const css = await fetch(ORIGIN + "/home/css/styles.css");
    const js = await fetch(ORIGIN + "/home/js/main.js");
    afirmar(/must-revalidate/.test(css.headers.get("cache-control") || "") && /must-revalidate/.test(js.headers.get("cache-control") || ""), "css/js deben revalidarse");
    const html = await (await fetch(BASE)).text();
    const versiones = [...html.matchAll(/(?:styles\.css|main\.js|i18n\.js)\?v=([0-9a-z]+)/g)].map((m) => m[1]);
    afirmar(versiones.length === 3 && new Set(versiones).size === 1, "versiones: " + versiones);
  });

  await prueba("F3-4", "Cabecera móvil en japonés: la palabra HUB no se parte en letras", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, { viewport: { width: 390, height: 844 } }, { "koa-lang": "ja" });
    const h = await pagina.evaluate(() => Math.round(document.querySelector(".site-header .brand__word").getBoundingClientRect().height));
    afirmar(h < 40, "alto de HUB: " + h);
    await contexto.close();
  });

  await prueba("F4-1", "Escritorio: la órbita queda fija mientras se baja y gira con el scroll (ida y vuelta)", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, { viewport: { width: 1440, height: 900 } });
    const leer = () => pagina.evaluate(() => ({ top: Math.round(document.querySelector(".orbit").getBoundingClientRect().top), spin: parseFloat(document.querySelector(".orbit").style.getPropertyValue("--orbit-spin")) }));
    const a = await leer();
    await pagina.evaluate(() => window.scrollTo(0, 500));
    await pagina.waitForTimeout(900);
    const b = await leer();
    afirmar(Math.abs(b.top - a.top) < 20, "la órbita debe quedarse fija: " + a.top + " → " + b.top);
    afirmar(b.spin - a.spin > 200, "debe girar al bajar: " + a.spin + " → " + b.spin);
    await pagina.evaluate(() => window.scrollTo(0, 0));
    await pagina.waitForTimeout(900);
    const c = await leer();
    afirmar(c.spin < b.spin - 200, "debe girar al revés al subir: " + b.spin + " → " + c.spin);
    await contexto.close();
  });

  await prueba("F4-2", "La cinta de palabras avanza al bajar y regresa al subir", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, { viewport: { width: 1440, height: 900 } });
    const x = () => pagina.evaluate(() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector(".marquee__track")).transform).m41);
    const a = await x();
    await pagina.evaluate(() => window.scrollTo(0, 400));
    await pagina.waitForTimeout(1200);
    const b = await x();
    afirmar(b < a - 150, "debe moverse a la izquierda al bajar: " + a + " → " + b);
    await pagina.evaluate(() => window.scrollTo(0, 0));
    await pagina.waitForTimeout(1200);
    const c = await x();
    afirmar(c > b + 150, "debe regresar al subir: " + b + " → " + c);
    afirmar(await pagina.evaluate(() => getComputedStyle(document.querySelector(".marquee__track")).animationName === "none"), "sin animación CSS cuando hay JS");
    await contexto.close();
  });

  await prueba("F4-3", "Con movimiento reducido, órbita y cinta siguen girando con el scroll pero no solas", async () => {
    const { contexto, pagina } = await nuevaPagina(browser, { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const leer = () => pagina.evaluate(() => ({ spin: parseFloat(document.querySelector(".orbit").style.getPropertyValue("--orbit-spin")) || 0, x: new DOMMatrixReadOnly(getComputedStyle(document.querySelector(".marquee__track")).transform).m41 }));
    const a = await leer();
    await pagina.waitForTimeout(1500);
    const quieto = await leer();
    afirmar(Math.abs(quieto.spin - a.spin) < 1 && Math.abs(quieto.x - a.x) < 1, "no debe moverse solo");
    await pagina.evaluate(() => window.scrollTo(0, 400));
    await pagina.waitForTimeout(1200);
    const b = await leer();
    afirmar(b.spin - a.spin > 100, "la órbita debe girar con el scroll: " + a.spin + " → " + b.spin);
    afirmar(b.x < a.x - 150, "la cinta debe avanzar con el scroll: " + a.x + " → " + b.x);
    await contexto.close();
  });

  await browser.close();

  const ancho = Math.max(...resultados.map((r) => r.id.length));
  resultados.forEach((r) =>
    console.log(`${r.ok ? "PASA " : "FALLA"}  ${r.id.padEnd(ancho)}  ${r.nombre}${r.detalle ? "  →  " + r.detalle : ""}`)
  );
  const fallas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - fallas}/${resultados.length} pruebas pasan`);
  process.exit(fallas ? 1 : 0);
})();
