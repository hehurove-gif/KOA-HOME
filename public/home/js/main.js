"use strict";

/**
 * KOA HUB — comportamiento de la página.
 *
 * - Idioma (es / en / ja): textos en js/i18n.js, marcados en el HTML con
 *   data-i18n, data-i18n-html y data-i18n-attr.
 * - Tema claro/oscuro, con favicon y logotipos que siguen al tema.
 * - Tarjetas de las fuerzas, revelado, paralaje y órbita ligada al scroll.
 *
 * Rutas previstas, aún no publicadas: /sports/, /wellness/.
 * KOA eSPORTS vive en https://esports.koa-hub.com/ y KOA XHOCK en /tickets/.
 */

const IDIOMAS = ["es", "en", "ja"];
let idiomaActual = "es";

/**
 * Devuelve el texto de una clave en el idioma actual (o en español).
 * @param {string} clave Clave del diccionario.
 * @returns {string}
 */
function t(clave) {
  const diccionario = window.KOA_I18N || {};
  const actual = diccionario[idiomaActual] || {};
  const base = diccionario.es || {};

  if (actual[clave] !== undefined) {
    return actual[clave];
  }

  return base[clave] !== undefined ? base[clave] : clave;
}

/**
 * Indica si una clave existe en el diccionario (en el idioma actual o en es).
 * @param {string} clave Clave del diccionario.
 * @returns {boolean}
 */
function tieneTexto(clave) {
  const diccionario = window.KOA_I18N || {};
  return Boolean(
    (diccionario[idiomaActual] && diccionario[idiomaActual][clave] !== undefined) ||
    (diccionario.es && diccionario.es[clave] !== undefined)
  );
}

/**
 * Configuración centralizada de las fuerzas de KOA.
 * Los textos son claves de js/i18n.js; los nombres de marca no se traducen.
 */
const RAMAS = [
  {
    id: "rama-esports",
    numero: "01",
    tema: "esports",
    nombre: "KOA eSPORTS",
    descripcion: "unit.esports.desc",
    frase: { texto: "Play. Compete. Belong.", clave: null, idioma: "en" },
    etiquetas: ["tag.community", "tag.tournaments", "tag.competition"],
    enlaceExterno: {
      texto: "link.esports",
      aria: "link.esports.aria",
      url: "https://esports.koa-hub.com/"
    }
    // Pendiente: Equipo representativo de KOA eSPORTS.
  },
  {
    id: "rama-sports",
    numero: "02",
    tema: "sports",
    nombre: "KOA SPORTS",
    descripcion: "unit.sports.desc",
    frase: { texto: "Tú después de tu límite.", clave: "claim.sports", idioma: null },
    etiquetas: ["tag.performance", "tag.discipline", "tag.team"]
    // Pendiente: KOA Fútbol (disciplina de KOA SPORTS).
  },
  {
    id: "rama-wellness",
    numero: "03",
    tema: "wellness",
    nombre: "KOA WELLNESS",
    descripcion: "unit.wellness.desc",
    frase: { texto: "Become More of You.", clave: null, idioma: "en" },
    etiquetas: ["tag.wellbeing", "tag.presence", "tag.transformation"]
  }
];

/**
 * Crea un elemento con texto traducible.
 * @param {string} etiqueta Nombre de la etiqueta HTML.
 * @param {string} clase Clase CSS.
 * @param {string} clave Clave de i18n.
 * @returns {HTMLElement}
 */
function crearTexto(etiqueta, clase, clave) {
  const elemento = document.createElement(etiqueta);
  elemento.className = clase;
  elemento.setAttribute("data-i18n", clave);
  elemento.textContent = t(clave);
  return elemento;
}

/**
 * Crea las etiquetas de enfoque de una rama.
 * @param {string[]} claves Claves de i18n de las etiquetas.
 * @returns {HTMLUListElement}
 */
function crearEtiquetas(claves) {
  const lista = document.createElement("ul");
  lista.className = "unit-card__tags";

  claves.forEach(function (clave) {
    const elemento = document.createElement("li");
    elemento.setAttribute("data-i18n", clave);
    elemento.textContent = t(clave);
    lista.appendChild(elemento);
  });

  return lista;
}

/**
 * Crea el bloque semántico de una rama (dentro de una columna Bootstrap).
 * @param {object} rama Datos de la rama.
 * @returns {HTMLElement}
 */
function crearRama(rama) {
  const columna = document.createElement("div");
  columna.className = "col";

  const articulo = document.createElement("article");
  articulo.className = "unit-card unit-card--" + rama.tema + " h-100";
  articulo.id = rama.id;
  articulo.setAttribute("aria-labelledby", rama.id + "-titulo");

  const cabecera = document.createElement("div");
  cabecera.className = "unit-card__top";

  const numero = document.createElement("span");
  numero.className = "unit-card__index";
  numero.setAttribute("aria-hidden", "true");
  numero.textContent = rama.numero;
  cabecera.appendChild(numero);

  const titulo = document.createElement("h3");
  titulo.className = "unit-card__title";
  titulo.id = rama.id + "-titulo";
  titulo.textContent = rama.nombre;

  const descripcion = crearTexto("p", "unit-card__desc", rama.descripcion);

  const frase = document.createElement("p");
  frase.className = "unit-card__claim";
  const enfasis = document.createElement("em");

  if (rama.frase.clave) {
    enfasis.setAttribute("data-i18n", rama.frase.clave);
    enfasis.setAttribute("data-i18n-setlang", "");
    enfasis.textContent = t(rama.frase.clave);
  } else {
    frase.lang = rama.frase.idioma;
    enfasis.textContent = rama.frase.texto;
  }

  frase.appendChild(enfasis);

  articulo.appendChild(cabecera);
  articulo.appendChild(titulo);
  articulo.appendChild(descripcion);
  articulo.appendChild(frase);

  if (rama.etiquetas && rama.etiquetas.length > 0) {
    articulo.appendChild(crearEtiquetas(rama.etiquetas));
  }

  const acciones = document.createElement("div");
  acciones.className = "unit-card__actions";

  if (rama.enlaceExterno) {
    const externo = document.createElement("a");
    externo.className = "unit-card__external";
    externo.href = rama.enlaceExterno.url;
    externo.target = "_blank";
    externo.rel = "noopener noreferrer";
    externo.setAttribute("data-i18n-attr", "aria-label:" + rama.enlaceExterno.aria);
    externo.setAttribute("aria-label", t(rama.enlaceExterno.aria));

    const externoTexto = document.createElement("span");
    externoTexto.setAttribute("data-i18n", rama.enlaceExterno.texto);
    externoTexto.textContent = t(rama.enlaceExterno.texto);

    const externoFlecha = document.createElement("span");
    externoFlecha.setAttribute("aria-hidden", "true");
    externoFlecha.textContent = "\u2197";

    externo.appendChild(externoTexto);
    externo.appendChild(document.createTextNode(" "));
    externo.appendChild(externoFlecha);
    acciones.appendChild(externo);
  }

  const acceso = document.createElement("a");
  acceso.className = "unit-card__cta";
  acceso.href = "#detalle-" + rama.tema;
  acceso.setAttribute("data-rama-nombre", rama.nombre);

  const accesoTexto = document.createElement("span");
  accesoTexto.setAttribute("data-i18n", "unit.explore");
  accesoTexto.textContent = t("unit.explore");

  const accesoFlecha = document.createElement("span");
  accesoFlecha.className = "unit-card__cta-arrow";
  accesoFlecha.setAttribute("aria-hidden", "true");
  accesoFlecha.textContent = "\u2197";

  acceso.appendChild(accesoTexto);
  acceso.appendChild(accesoFlecha);
  acciones.appendChild(acceso);
  articulo.appendChild(acciones);
  columna.appendChild(articulo);

  return columna;
}

/**
 * Genera y añade las ramas dentro de su contenedor.
 */
function renderizarRamas() {
  const contenedor = document.getElementById("fuerzas-lista");

  if (!contenedor) {
    return;
  }

  const fragmento = document.createDocumentFragment();

  RAMAS.forEach(function (rama) {
    fragmento.appendChild(crearRama(rama));
  });

  contenedor.appendChild(fragmento);
}

/**
 * Escribe el año actual en el pie de página.
 */
function actualizarAnio() {
  const anio = document.getElementById("anio-actual");

  if (!anio) {
    return;
  }

  anio.textContent = String(new Date().getFullYear());
}

/* ------------------------------------------------------------------ */
/* Idioma                                                              */
/* ------------------------------------------------------------------ */

/**
 * Elige el idioma inicial: el guardado, o el del navegador si es ja/en.
 * @returns {"es"|"en"|"ja"}
 */
function detectarIdioma() {
  try {
    const guardado = localStorage.getItem("koa-lang");

    if (IDIOMAS.indexOf(guardado) !== -1) {
      return guardado;
    }
  } catch (error) {
    /* Sin almacenamiento: se usa el idioma del navegador. */
  }

  const navegador = String(navigator.language || "es").toLowerCase();

  if (navegador.indexOf("ja") === 0) {
    return "ja";
  }

  if (navegador.indexOf("en") === 0) {
    return "en";
  }

  return "es";
}

/**
 * Aplica el idioma a todos los textos marcados de la página.
 * @param {"es"|"en"|"ja"} idioma Idioma que se va a mostrar.
 * @param {boolean} persistir Indica si debe guardarse en localStorage.
 */
function aplicarIdioma(idioma, persistir) {
  idiomaActual = IDIOMAS.indexOf(idioma) !== -1 ? idioma : "es";
  document.documentElement.setAttribute("lang", idiomaActual);

  if (persistir) {
    try {
      localStorage.setItem("koa-lang", idiomaActual);
    } catch (error) {
      /* El idioma sigue funcionando aunque no se pueda guardar. */
    }
  }

  document.querySelectorAll("[data-i18n]").forEach(function (elemento) {
    const clave = elemento.getAttribute("data-i18n");

    /* Sin traducción disponible se conserva el texto que ya trae el HTML. */
    if (tieneTexto(clave)) {
      elemento.textContent = t(clave);
    }
  });

  document.querySelectorAll("[data-i18n-html]").forEach(function (elemento) {
    elemento.innerHTML = t(elemento.getAttribute("data-i18n-html"));
  });

  document.querySelectorAll("[data-i18n-attr]").forEach(function (elemento) {
    elemento
      .getAttribute("data-i18n-attr")
      .split(";")
      .forEach(function (par) {
        const partes = par.split(":");

        if (partes.length === 2) {
          elemento.setAttribute(partes[0].trim(), t(partes[1].trim()));
        }
      });
  });

  document.querySelectorAll("[data-i18n-setlang]").forEach(function (elemento) {
    elemento.setAttribute("lang", idiomaActual);
  });

  document.querySelectorAll("[data-rama-nombre]").forEach(function (enlace) {
    enlace.setAttribute(
      "aria-label",
      t("unit.exploreAria").replace("{name}", enlace.getAttribute("data-rama-nombre"))
    );
  });

  document.title = t("meta.title");

  const descripcion = document.querySelector('meta[name="description"]');

  if (descripcion) {
    descripcion.setAttribute("content", t("meta.desc"));
  }

  document.querySelectorAll(".lang-switch__btn").forEach(function (boton) {
    boton.setAttribute(
      "aria-pressed",
      boton.getAttribute("data-lang") === idiomaActual ? "true" : "false"
    );
  });

  actualizarBotonTema();
}

/**
 * Inicializa el selector de idioma.
 */
function iniciarIdioma() {
  document.querySelectorAll(".lang-switch__btn").forEach(function (boton) {
    boton.addEventListener("click", function () {
      aplicarIdioma(boton.getAttribute("data-lang"), true);
    });
  });

  aplicarIdioma(detectarIdioma(), false);
}

/* ------------------------------------------------------------------ */
/* Tema                                                                */
/* ------------------------------------------------------------------ */

/**
 * Actualiza el texto y la etiqueta del botón de tema según tema e idioma.
 */
function actualizarBotonTema() {
  const boton = document.getElementById("theme-toggle");

  if (!boton) {
    return;
  }

  const esClaro = document.documentElement.getAttribute("data-theme") === "light";
  const etiqueta = boton.querySelector(".theme-toggle__label");

  boton.setAttribute(
    "aria-label",
    t(esClaro ? "theme.ariaToDark" : "theme.ariaToLight")
  );

  if (etiqueta) {
    etiqueta.textContent = t(esClaro ? "theme.toDark" : "theme.toLight");
  }
}

/**
 * Cambia los favicons al del tema. Se reemplaza el nodo <link> porque algunos
 * navegadores no repintan el icono si solo cambia el atributo href.
 * @param {boolean} esClaro Indica si el tema es el claro.
 */
function actualizarFavicon(esClaro) {
  document
    .querySelectorAll('link[rel="icon"][data-light][data-dark]')
    .forEach(function (enlace) {
      const destino = enlace.getAttribute(esClaro ? "data-light" : "data-dark");

      if (enlace.getAttribute("href") === destino) {
        return;
      }

      const nuevo = enlace.cloneNode(false);
      nuevo.setAttribute("href", destino);
      enlace.parentNode.replaceChild(nuevo, enlace);
    });
}

/**
 * Aplica el tema visual, actualiza logotipos, favicon y color del navegador.
 * @param {"light"|"dark"} tema Tema que se va a aplicar.
 * @param {boolean} persistir Indica si debe guardarse en localStorage.
 */
function aplicarTema(tema, persistir) {
  const esClaro = tema === "light";

  document.documentElement.setAttribute("data-theme", esClaro ? "light" : "dark");

  if (persistir) {
    try {
      localStorage.setItem("koa-theme", esClaro ? "light" : "dark");
    } catch (error) {
      /* El tema sigue funcionando aunque no se pueda guardar. */
    }
  }

  document
    .querySelectorAll("[data-logo-dark][data-logo-light]")
    .forEach(function (logo) {
      const destino = esClaro
        ? logo.getAttribute("data-logo-light")
        : logo.getAttribute("data-logo-dark");

      if (destino && logo.getAttribute("src") !== destino) {
        logo.setAttribute("src", destino);
      }
    });

  actualizarFavicon(esClaro);
  actualizarBotonTema();

  const meta = document.querySelector('meta[name="theme-color"]');

  if (meta) {
    meta.setAttribute("content", esClaro ? "#f6f4f5" : "#050503");
  }
}

/**
 * Inicializa el botón de cambio de tema.
 */
function iniciarTema() {
  const boton = document.getElementById("theme-toggle");
  const actual =
    document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";

  aplicarTema(actual, false);

  if (!boton) {
    return;
  }

  boton.addEventListener("click", function () {
    const siguiente =
      document.documentElement.getAttribute("data-theme") === "light"
        ? "dark"
        : "light";

    aplicarTema(siguiente, true);
  });
}

/**
 * Revela los bloques al entrar en pantalla.
 * Solo se activa si el navegador lo soporta y no hay preferencia de movimiento reducido.
 */
function iniciarRevelado() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const selector =
    ".pillar, .unit-card, .branch, .value, .channel, .cta, .contact__intro";
  const elementos = Array.prototype.slice.call(
    document.querySelectorAll(selector)
  );

  if (elementos.length === 0) {
    return;
  }

  elementos.forEach(function (elemento, indice) {
    elemento.classList.add("reveal");
    elemento.style.setProperty("--reveal-delay", (indice % 3) * 70 + "ms");
  });

  const observador = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("is-visible");
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  elementos.forEach(function (elemento) {
    observador.observe(elemento);
  });
}

/**
 * Desplaza los bloques horizontalmente según su recorrido por el viewport.
 * Al bajar, cada bloque entra desde la derecha y sale hacia la izquierda.
 */
function iniciarParalaje() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const grupos = [
    { selector: ".hero__content", amplitud: 18 },
    { selector: ".hero__visual", amplitud: -16 },
    { selector: ".section__head", amplitud: 30 },
    { selector: ".pillar", amplitud: 22 },
    { selector: ".unit-card", amplitud: 22 },
    { selector: ".branch__aside", amplitud: 26 },
    { selector: ".branch__body", amplitud: 16 },
    { selector: ".philosophy__head", amplitud: 28 },
    { selector: ".value", amplitud: 18 },
    { selector: ".cta", amplitud: 22 },
    { selector: ".contact__intro", amplitud: 26 },
    { selector: ".channel", amplitud: 16 }
  ];

  const elementos = [];

  grupos.forEach(function (grupo) {
    document.querySelectorAll(grupo.selector).forEach(function (elemento) {
      elemento.dataset.parallax = String(grupo.amplitud);
      elementos.push(elemento);
    });
  });

  if (elementos.length === 0) {
    return;
  }

  let pendiente = false;

  function actualizar() {
    pendiente = false;
    const altura = window.innerHeight;
    const escala = Math.min(1, window.innerWidth / 1000);

    elementos.forEach(function (elemento) {
      const caja = elemento.getBoundingClientRect();

      if (caja.bottom < -160 || caja.top > altura + 160) {
        return;
      }

      const centro = caja.top + caja.height / 2;
      const recorrido = altura / 2 + caja.height / 2;
      const progreso = Math.max(
        -1,
        Math.min(1, (altura / 2 - centro) / recorrido)
      );
      const amplitud = (parseFloat(elemento.dataset.parallax) || 0) * escala;
      const desplazamiento = -progreso * amplitud;

      elemento.style.setProperty(
        "--parallax-x",
        desplazamiento.toFixed(2) + "px"
      );
    });
  }

  function solicitar() {
    if (!pendiente) {
      pendiente = true;
      window.requestAnimationFrame(actualizar);
    }
  }

  window.addEventListener("scroll", solicitar, { passive: true });
  window.addEventListener("resize", solicitar);
  actualizar();
}

/**
 * Hace girar las etiquetas de las ramas alrededor del núcleo y rueda la
 * esfera. El giro sigue al scroll: cada píxel que se baja o se sube suma o
 * resta grados (con un poco de inercia), así que al detenerse el scroll la
 * órbita se frena. Además hay una deriva lenta y un impulso con el cursor.
 */
function iniciarOrbita() {
  const orbita = document.querySelector(".orbit");

  if (!orbita) {
    return;
  }

  const GRADOS_POR_PIXEL = 0.6;
  const DERIVA_GRADOS_POR_SEGUNDO = 360 / 70;

  const movimientoReducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let deriva = 0;
  let giroScroll = 0;
  let objetivoScroll = 0;
  let scrollAnterior = window.scrollY;
  let impulso = 0;
  let ultimo = null;
  let visible = true;
  let cuadro = 0;
  let puntero = false;

  function pintar() {
    if (movimientoReducido.matches) {
      return;
    }

    orbita.style.setProperty(
      "--orbit-spin",
      (deriva + giroScroll).toFixed(2) + "deg"
    );
  }

  function animar(ahora) {
    if (ultimo === null) {
      ultimo = ahora;
    }

    const delta = Math.min(0.064, (ahora - ultimo) / 1000);
    ultimo = ahora;

    impulso += ((puntero ? 1 : 0) - impulso) * Math.min(1, delta * 4);
    deriva =
      (deriva + DERIVA_GRADOS_POR_SEGUNDO * (1 + impulso * 6) * delta) % 360;
    giroScroll += (objetivoScroll - giroScroll) * Math.min(1, delta * 9);

    pintar();

    if (visible) {
      cuadro = window.requestAnimationFrame(animar);
    }
  }

  function arrancar() {
    if (!cuadro && !movimientoReducido.matches) {
      ultimo = null;
      giroScroll = objetivoScroll;
      cuadro = window.requestAnimationFrame(animar);
    }
  }

  function detener() {
    if (cuadro) {
      window.cancelAnimationFrame(cuadro);
      cuadro = 0;
    }

    ultimo = null;
  }

  window.addEventListener(
    "scroll",
    function () {
      const y = window.scrollY;
      objetivoScroll += (y - scrollAnterior) * GRADOS_POR_PIXEL;
      scrollAnterior = y;
    },
    { passive: true }
  );

  if (window.matchMedia("(hover: hover)").matches) {
    orbita.addEventListener("pointerenter", function () {
      puntero = true;
    });

    orbita.addEventListener("pointerleave", function () {
      puntero = false;
    });
  }

  const observador = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        visible = entrada.isIntersecting;

        if (visible) {
          arrancar();
        } else {
          detener();
        }
      });
    },
    { threshold: 0 }
  );

  observador.observe(orbita);

  movimientoReducido.addEventListener("change", function (evento) {
    if (evento.matches) {
      detener();
      orbita.style.setProperty("--orbit-spin", "0deg");
    } else {
      arrancar();
    }
  });

  if (movimientoReducido.matches) {
    orbita.style.setProperty("--orbit-spin", "0deg");
  } else {
    arrancar();
  }
}

function iniciar() {
  renderizarRamas();
  iniciarIdioma();
  iniciarTema();
  iniciarRevelado();
  iniciarParalaje();
  iniciarOrbita();
  actualizarAnio();
}

iniciar();
