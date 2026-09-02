// ===========================================================
// Club Baloncesto Tomelloso — script compartido
// ===========================================================

// Si el logo de un patrocinador no carga (enlace roto, hotlink bloqueado...),
// lo sustituye por el nombre en texto para que nunca se vea un icono roto.
function handleSponsorImgError(imgEl) {
  var span = document.createElement('span');
  span.className = 'patro-texto';
  span.textContent = imgEl.getAttribute('alt') || '';
  imgEl.replaceWith(span);
}

// Si la foto de un jugador/a o entrenador/a no carga, la sustituye por
// un círculo con sus iniciales para que nunca se vea un icono roto.
function handlePersonImgError(imgEl) {
  var nombre = imgEl.getAttribute('alt') || '';
  var iniciales = nombre.split(' ').filter(Boolean).map(function (p) { return p[0]; }).slice(0, 2).join('').toUpperCase();
  var div = document.createElement('div');
  div.className = imgEl.className;
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.justifyContent = 'center';
  div.style.fontWeight = '700';
  div.style.color = '#fff';
  div.style.background = 'var(--verde, #0f7a45)';
  div.textContent = iniciales;
  imgEl.replaceWith(div);
}

document.addEventListener('DOMContentLoaded', function () {

  // --- Menú móvil (hamburguesa) ---
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.querySelector('.menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('abierto');
      var expandido = menu.classList.contains('abierto');
      toggle.setAttribute('aria-expanded', expandido ? 'true' : 'false');
    });

    // Cierra el menú al pulsar un enlace (útil en móvil)
    menu.querySelectorAll('a').forEach(function (enlace) {
      enlace.addEventListener('click', function () {
        menu.classList.remove('abierto');
      });
    });
  }

  // --- Pestañas de categoría (Equipos y Calendario) ---
  var botonesPestana = document.querySelectorAll('.pestanas button');
  if (botonesPestana.length) {
    var activarCategoria = function (categoria) {
      var botonCoincide = document.querySelector('.pestanas button[data-categoria="' + categoria + '"]');
      if (!botonCoincide) return false;

      botonesPestana.forEach(function (b) { b.classList.remove('activa'); });
      botonCoincide.classList.add('activa');

      document.querySelectorAll('.panel-categoria').forEach(function (panel) {
        panel.classList.remove('activo');
      });
      var panelActivo = document.querySelector('.panel-categoria[data-categoria="' + categoria + '"]');
      if (panelActivo) panelActivo.classList.add('activo');
      return true;
    };

    botonesPestana.forEach(function (boton) {
      boton.addEventListener('click', function () {
        activarCategoria(boton.getAttribute('data-categoria'));
      });
    });

    // Si se llega con un enlace tipo calendario.html#senior-masculino
    // (por ejemplo desde el botón "Ver calendario" de cada equipo),
    // abre directamente la pestaña de esa categoría.
    if (window.location.hash) {
      activarCategoria(window.location.hash.substring(1));
    }
  }

  // --- Formularios (.formulario) ---
  // Los que ya tienen un atributo action apuntando a un servicio real (Formspree, etc.)
  // se envían de verdad por fetch. Los que aún no lo tienen (p.ej. Abónate) siguen
  // mostrando el aviso de "esto es una demo" hasta que se conecten.
  var formulario = document.querySelector('.formulario');
  var esFormularioReal = formulario && formulario.hasAttribute('action') && formulario.getAttribute('action').indexOf('http') === 0;

  if (formulario && esFormularioReal) {
    formulario.addEventListener('submit', function (e) {
      e.preventDefault();
      var aviso = formulario.querySelector('.aviso-envio');
      var boton = formulario.querySelector('button[type="submit"]');
      var textoOriginalBoton = boton ? boton.textContent : '';

      if (boton) {
        boton.disabled = true;
        boton.textContent = 'Enviando…';
      }

      fetch(formulario.action, {
        method: 'POST',
        body: new FormData(formulario),
        headers: { 'Accept': 'application/json' }
      }).then(function (respuesta) {
        if (respuesta.ok) {
          if (aviso) {
            aviso.style.color = '#0f7a45';
            aviso.textContent = '¡Gracias! Tu mensaje se ha enviado correctamente, te responderemos lo antes posible.';
            aviso.style.display = 'block';
          }
          formulario.reset();
        } else {
          return respuesta.json().then(function (datos) {
            throw new Error((datos && datos.errors) ? datos.errors.map(function (er) { return er.message; }).join(', ') : 'Error al enviar');
          });
        }
      }).catch(function () {
        if (aviso) {
          aviso.style.color = '#a33';
          aviso.textContent = 'No se ha podido enviar el mensaje. Inténtalo de nuevo o escríbenos directamente a basketcbt@gmail.com.';
          aviso.style.display = 'block';
        }
      }).finally(function () {
        if (boton) {
          boton.disabled = false;
          boton.textContent = textoOriginalBoton;
        }
      });
    });
  } else if (formulario) {
    formulario.addEventListener('submit', function (e) {
      e.preventDefault();
      var aviso = formulario.querySelector('.aviso-envio');
      if (aviso) {
        aviso.style.color = '#a33';
        aviso.textContent = 'Este formulario es una plantilla de ejemplo: para que los mensajes lleguen de verdad hay que conectarlo a un correo o servicio real (por ejemplo Formspree, EmailJS o un backend propio).';
        aviso.style.display = 'block';
      }
    });
  }

  // --- Marca el enlace de navegación activo según la página actual ---
  var pagina = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu a[data-pagina]').forEach(function (enlace) {
    if (enlace.getAttribute('data-pagina') === pagina) {
      enlace.classList.add('activo');
    }
  });

  // --- Galería fotográfica: lightbox al hacer clic en una foto ---
  var overlay = document.querySelector('.lightbox-overlay');
  if (overlay) {
    var overlayImg = overlay.querySelector('img');
    var overlayLeyenda = overlay.querySelector('.lightbox-leyenda');
    var botonCerrar = overlay.querySelector('.lightbox-cerrar');

    var abrirLightbox = function (item) {
      var img = item.querySelector('img');
      overlayImg.src = item.getAttribute('data-full') || img.src;
      overlayImg.alt = img.alt;
      overlayLeyenda.textContent = item.getAttribute('data-leyenda') || img.alt;
      overlay.classList.add('abierto');
    };

    var cerrarLightbox = function () {
      overlay.classList.remove('abierto');
      overlayImg.src = '';
    };

    document.querySelectorAll('.galeria-item').forEach(function (item) {
      item.addEventListener('click', function () { abrirLightbox(item); });
    });

    if (botonCerrar) botonCerrar.addEventListener('click', cerrarLightbox);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) cerrarLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') cerrarLightbox();
    });
  }

  // --- Compartir noticia (WhatsApp, Facebook, X y copiar enlace) ---
  var compartirContenedor = document.querySelector('.compartir-noticia');
  if (compartirContenedor) {
    var urlActual = encodeURIComponent(window.location.href);
    var tituloActual = encodeURIComponent(document.title.replace(/\s*·\s*Club Baloncesto Tomelloso\s*$/, ''));

    var enlaceWhatsapp = compartirContenedor.querySelector('.compartir-whatsapp');
    if (enlaceWhatsapp) enlaceWhatsapp.href = 'https://wa.me/?text=' + tituloActual + '%20' + urlActual;

    var enlaceFacebook = compartirContenedor.querySelector('.compartir-facebook');
    if (enlaceFacebook) enlaceFacebook.href = 'https://www.facebook.com/sharer/sharer.php?u=' + urlActual;

    var enlaceX = compartirContenedor.querySelector('.compartir-x');
    if (enlaceX) enlaceX.href = 'https://twitter.com/intent/tweet?url=' + urlActual + '&text=' + tituloActual;

    // Copia el enlace al portapapeles y muestra una confirmación temporal
    // en el propio botón (usado tanto por "Copiar enlace" como por Instagram,
    // que no admite compartir un enlace externo directamente desde la web).
    var copiarEnlaceConAviso = function (boton, tituloCopiado, ariaCopiado, tituloOriginal, ariaOriginal) {
      var restaurar = function () {
        boton.classList.remove('copiado');
        boton.setAttribute('title', tituloOriginal);
        boton.setAttribute('aria-label', ariaOriginal);
      };
      var marcarCopiado = function () {
        boton.classList.add('copiado');
        boton.setAttribute('title', tituloCopiado);
        boton.setAttribute('aria-label', ariaCopiado);
        setTimeout(restaurar, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).then(marcarCopiado).catch(function () {});
      } else {
        var campo = document.createElement('textarea');
        campo.value = window.location.href;
        campo.style.position = 'fixed';
        campo.style.opacity = '0';
        document.body.appendChild(campo);
        campo.select();
        try { document.execCommand('copy'); marcarCopiado(); } catch (err) {}
        document.body.removeChild(campo);
      }
    };

    var botonCopiar = compartirContenedor.querySelector('.compartir-copiar');
    if (botonCopiar) {
      botonCopiar.addEventListener('click', function () {
        copiarEnlaceConAviso(botonCopiar, '¡Enlace copiado!', 'Enlace copiado', 'Copiar enlace', 'Copiar enlace');
      });
    }

    var botonInstagram = compartirContenedor.querySelector('.compartir-instagram');
    if (botonInstagram) {
      botonInstagram.addEventListener('click', function () {
        copiarEnlaceConAviso(
          botonInstagram,
          'Enlace copiado: pégalo en tu historia o publicación de Instagram',
          'Enlace copiado para Instagram',
          'Copiar enlace para Instagram',
          'Copiar enlace para Instagram'
        );
      });
    }
  }
});
