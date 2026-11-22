"use strict";

/**
 * Configuración centralizada de las fuerzas de KOA.
 *
 * Rutas previstas, aún no publicadas: /esports/, /sports/, /wellness/.
 * KOA XHOCK se enlaza desde el detalle de KOA SPORTS y desde el pie de página.
 */
const RAMAS = [
  {
    id: "rama-esports",
    numero: "01",
    tema: "esports",
    nombre: "KOA eSPORTS",
    descripcion:
      "Momentos de conexión: convierte la partida en pertenencia. Te acerca al juego, a la competencia, a la estrategia y, sobre todo, a una comunidad donde nadie se queda fuera.",
    frase: "Play. Compete. Belong.",
    idiomaFrase: "en",
    etiquetas: ["Comunidad", "Torneos", "Competencia"],
    enlaceExterno: {
      // URL provisional: esports.koa-hub.com aún no resuelve.
      texto: "Visitar el sitio de eSPORTS",
      url: "https://koasports.vercel.app/"
    }
    // Pendiente: Equipo representativo de KOA eSPORTS.
  },
  {
    id: "rama-sports",
    numero: "02",
    tema: "sports",
    nombre: "KOA SPORTS",
    descripcion:
      "Momentos de superación: convierte el límite en punto de partida. Te lleva hasta ese instante en que descubres que puedes hacer más de lo que creías, y te devuelve con más disciplina, más carácter y más hambre.",
    frase: "Tú después de tu límite.",
    idiomaFrase: "es",
    etiquetas: ["Rendimiento", "Disciplina", "Equipo"]
    // Pendiente: KOA Fútbol (disciplina de KOA SPORTS).
  },
  {
    id: "rama-wellness",
    numero: "03",
    tema: "wellness",
    nombre: "KOA WELLNESS",
    descripcion:
      "Estados de transformación: convierte el bienestar en una práctica cotidiana. Te lleva a una versión más presente, más consciente y más plena de ti, con más energía para habitar lo que haces.",
    frase: "Become More of You.",
    idiomaFrase: "en",
    etiquetas: ["Bienestar", "Presencia", "Transformación"]
  }
];

/**
 * Crea un enlace con destino, texto y clase opcional.
 * @param {string} texto Texto visible del enlace.
 * @param {string} url Destino del enlace.
 * @param {string} [clase] Clase CSS opcional.
 * @returns {HTMLAnchorElement}
 */
function crearEnlace(texto, url, clase) {
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.textContent = texto;

  if (clase) {
    enlace.className = clase;
  }

  return enlace;
}

/**
 * Crea las etiquetas de enfoque de una rama.
 * @param {string[]} etiquetas Textos de las etiquetas.
 * @returns {HTMLUListElement}
 */
function crearEtiquetas(etiquetas) {
  const lista = document.createElement("ul");
  lista.className = "unit-card__tags";

  etiquetas.forEach(function (texto) {
    const elemento = document.createElement("li");
    elemento.textContent = texto;
    lista.appendChild(elemento);
  });

  return lista;
}

/**
 * Crea el bloque semántico de una rama.
 * @param {object} rama Datos de la rama.
 * @returns {HTMLElement}
 */
function crearRama(rama) {
  const articulo = document.createElement("article");
  articulo.className = "unit-card unit-card--" + rama.tema;
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

  const descripcion = document.createElement("p");
  descripcion.className = "unit-card__desc";
  descripcion.textContent = rama.descripcion;

  const frase = document.createElement("p");
  frase.className = "unit-card__claim";
  frase.lang = rama.idiomaFrase;
  const enfasis = document.createElement("em");
  enfasis.textContent = rama.frase;
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
    const externo = crearEnlace(
      rama.enlaceExterno.texto,
      rama.enlaceExterno.url,
      "unit-card__external"
    );
    externo.target = "_blank";
    externo.rel = "noopener noreferrer";
    externo.setAttribute(
      "aria-label",
      rama.enlaceExterno.texto + " (se abre en una pestaña nueva)"
    );

    const externoFlecha = document.createElement("span");
    externoFlecha.setAttribute("aria-hidden", "true");
    externoFlecha.textContent = "\u2197";
    externo.appendChild(externoFlecha);

    acciones.appendChild(externo);
  }

  const acceso = document.createElement("a");
  acceso.className = "unit-card__cta";
  acceso.href = "#detalle-" + rama.tema;
  acceso.setAttribute("aria-label", "Explorar " + rama.nombre);

  const accesoTexto = document.createElement("span");
  accesoTexto.textContent = "Explorar esta fuerza";

  const accesoFlecha = document.createElement("span");
  accesoFlecha.className = "unit-card__cta-arrow";
  accesoFlecha.setAttribute("aria-hidden", "true");
  accesoFlecha.textContent = "\u2197";

  acceso.appendChild(accesoTexto);
  acceso.appendChild(accesoFlecha);
  acciones.appendChild(acceso);
  articulo.appendChild(acciones);

  return articulo;
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

/**
 * Aplica el tema visual, actualiza los logotipos y el color del navegador.
 * @param {"light"|"dark"} tema Tema que se va a aplicar.
 * @param {boolean} persistir Indica si debe guardarse en localStorage.
 */
function aplicarTema(tema, persistir) {
  const esClaro = tema === "light";
  const raiz = document.documentElement;

  raiz.setAttribute("data-theme", esClaro ? "light" : "dark");

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

  const boton = document.getElementById("theme-toggle");

  if (boton) {
    const texto = esClaro ? "Modo oscuro" : "Modo claro";
    const etiqueta = boton.querySelector(".theme-toggle__label");

    boton.setAttribute("aria-label", "Cambiar a " + texto.toLowerCase());

    if (etiqueta) {
      etiqueta.textContent = texto;
    }
  }

  const meta = document.querySelector('meta[name="theme-color"]');

  if (meta) {
    meta.setAttribute("content", esClaro ? "#e7e0d2" : "#0c1219");
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
 * Gira las etiquetas de las ramas alrededor del núcleo.
 * Acelera al pasar el cursor y acompaña el scroll de la página.
 */
function iniciarOrbita() {
  const orbita = document.querySelector(".orbit");

  if (!orbita) {
    return;
  }

  const movimientoReducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let angulo = 0;
  let impulso = 0;
  let ultimo = null;
  let visible = true;
  let cuadro = 0;
  let puntero = false;

  function pintar() {
    if (movimientoReducido.matches) {
      return;
    }

    const arrastreScroll = window.scrollY * 0.12;

    orbita.style.setProperty(
      "--orbit-spin",
      (angulo + arrastreScroll).toFixed(2) + "deg"
    );
  }

  function animar(ahora) {
    if (ultimo === null) {
      ultimo = ahora;
    }

    const delta = Math.min(0.064, (ahora - ultimo) / 1000);
    ultimo = ahora;

    impulso += ((puntero ? 1 : 0) - impulso) * Math.min(1, delta * 4);

    const velocidadBase = 360 / 42;
    angulo = (angulo + velocidadBase * (1 + impulso * 6) * delta) % 360;

    pintar();

    if (visible) {
      cuadro = window.requestAnimationFrame(animar);
    }
  }

  function arrancar() {
    if (!cuadro && !movimientoReducido.matches) {
      ultimo = null;
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
  iniciarTema();
  renderizarRamas();
  iniciarRevelado();
  iniciarParalaje();
  iniciarOrbita();
  actualizarAnio();
}

iniciar();
