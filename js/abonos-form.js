// Lógica del formulario de Abonos (Club Baloncesto Tomelloso)
(function () {
  var CONFIG = window.ABONOS_CONFIG || { appsScriptUrl: "PENDIENTE" };
  var backendActivo = CONFIG.appsScriptUrl && CONFIG.appsScriptUrl !== "PENDIENTE";

  var aviso = document.getElementById('aviso-backend-pendiente');
  var formulario = document.getElementById('form-abono');
  if (!formulario) return;

  if (backendActivo) {
    if (aviso) aviso.style.display = 'none';
    formulario.style.display = 'block';
  }
  // Si el backend sigue pendiente, el formulario permanece oculto (display:none
  // por defecto en el HTML) y solo se ve el aviso con las vías de contacto.

  // ----- Selección de abono desde las tarjetas de precio -----
  var selectCategoria = document.getElementById('ab-categoria');
  document.querySelectorAll('.boton-elegir-abono').forEach(function (boton) {
    boton.addEventListener('click', function () {
      if (!backendActivo) return; // deja que el enlace #reservar lleve al aviso normal
      var base = boton.getAttribute('data-base');
      var comboId = base === 'Individual' ? 'combo-individual' : 'combo-familiar';
      var checkboxCombo = document.getElementById(comboId);
      var conCombo = checkboxCombo && checkboxCombo.checked;
      var valor = conCombo ? base + ' + combo' : base;
      if (selectCategoria) selectCategoria.value = valor;
    });
  });

  // ----- Envío del formulario -----
  var estado = document.getElementById('ab-estado');
  var botonEnviar = document.getElementById('ab-enviar');

  function mostrarEstado(mensaje, esError) {
    if (!estado) return;
    estado.textContent = mensaje;
    estado.style.color = esError ? '#b3261e' : 'var(--verde-oscuro)';
  }

  if (formulario) {
    formulario.addEventListener('submit', function (evento) {
      evento.preventDefault();
      if (!backendActivo) return;

      var categoriaSeleccionada = selectCategoria ? selectCategoria.options[selectCategoria.selectedIndex] : null;
      var precio = categoriaSeleccionada ? Number(categoriaSeleccionada.getAttribute('data-precio')) : 0;

      var datos = {
        nombre: document.getElementById('ab-nombre').value.trim(),
        apellidos: document.getElementById('ab-apellidos').value.trim(),
        categoria: selectCategoria.value,
        precio: precio,
        email: document.getElementById('ab-email').value.trim(),
        telefono: document.getElementById('ab-telefono').value.trim(),
        direccion: document.getElementById('ab-direccion').value.trim(),
        autorizaComunicaciones: document.getElementById('ab-comunicaciones').checked
      };

      if (!document.getElementById('ab-privacidad').checked) {
        mostrarEstado('Debes aceptar la política de privacidad para continuar.', true);
        return;
      }
      if (!datos.categoria) {
        mostrarEstado('Elige un tipo de abono.', true);
        return;
      }

      botonEnviar.disabled = true;
      mostrarEstado('Enviando tus datos…', false);

      fetch(CONFIG.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // evita pre-flight CORS con Apps Script
        body: JSON.stringify(datos)
      })
        .then(function (resp) { return resp.json(); })
        .then(function (respuesta) {
          if (respuesta.ok && respuesta.checkoutUrl) {
            mostrarEstado('¡Datos guardados! Te llevamos a la pasarela de pago…', false);
            window.location.href = respuesta.checkoutUrl;
          } else {
            throw new Error(respuesta.error || 'Respuesta inesperada del servidor');
          }
        })
        .catch(function (error) {
          console.error('Error al enviar el formulario de abono:', error);
          mostrarEstado('No hemos podido procesar tu solicitud. Escríbenos a basketcbt@gmail.com y lo resolvemos.', true);
          botonEnviar.disabled = false;
        });
    });
  }
})();
