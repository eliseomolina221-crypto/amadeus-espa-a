// ===== Menú del celular =====
const botonMenu = document.querySelector(".nav-toggle");
const menu = document.getElementById("menu");

botonMenu.addEventListener("click", function () {
  const abierto = menu.classList.toggle("abierto");
  botonMenu.setAttribute("aria-expanded", abierto);
});

// Al elegir una opción, el menú se cierra
menu.querySelectorAll("a").forEach(function (enlace) {
  enlace.addEventListener("click", function () {
    menu.classList.remove("abierto");
    botonMenu.setAttribute("aria-expanded", "false");
  });
});

// ===== Filtro de destinos =====
const botonesFiltro = document.querySelectorAll(".filtros button");
const tarjetas = document.querySelectorAll(".dest");

botonesFiltro.forEach(function (boton) {
  boton.addEventListener("click", function () {
    const filtro = boton.dataset.filtro;

    botonesFiltro.forEach(function (b) {
      b.classList.remove("activo");
      b.setAttribute("aria-pressed", "false");
    });
    boton.classList.add("activo");
    boton.setAttribute("aria-pressed", "true");

    tarjetas.forEach(function (tarjeta) {
      const mostrar = filtro === "todos" || tarjeta.dataset.pais === filtro;
      tarjeta.hidden = !mostrar;
    });
  });
});

// ===== Lista de equipaje =====
const casillas = document.querySelectorAll("#lista input");
const progreso = document.getElementById("progreso");
const relleno = document.getElementById("relleno");

function actualizarProgreso() {
  const marcadas = document.querySelectorAll("#lista input:checked").length;
  progreso.textContent = marcadas + " de " + casillas.length + " listos";
  relleno.style.width = (marcadas / casillas.length) * 100 + "%";
}

casillas.forEach(function (casilla) {
  casilla.addEventListener("change", actualizarProgreso);
});
// ===== Cotizador de vuelos =====
const filasVuelo = document.querySelectorAll(".vuelo");
const totalBoletos = document.getElementById("totalBoletos");
const totalPagar = document.getElementById("totalPagar");
const botonLimpiar = document.getElementById("limpiar");

function formatoDinero(numero) {
  return "$" + numero.toFixed(2);
}

function calcularTotal() {
  let boletos = 0;
  let total = 0;

  filasVuelo.forEach(function (fila) {
    const precio = Number(fila.dataset.precio);
    const cantidad = Number(fila.querySelector("output").textContent);
    const subtotal = precio * cantidad;

    fila.querySelector(".subtotal").textContent = formatoDinero(subtotal);
    boletos = boletos + cantidad;
    total = total + subtotal;
  });

  totalBoletos.textContent = boletos;
  totalPagar.textContent = formatoDinero(total);
}

filasVuelo.forEach(function (fila) {
  const salida = fila.querySelector("output");

  fila.querySelector(".mas").addEventListener("click", function () {
    const cantidad = Number(salida.textContent);
    if (cantidad < 9) {
      salida.textContent = cantidad + 1;
      calcularTotal();
    }
  });

  fila.querySelector(".menos").addEventListener("click", function () {
    const cantidad = Number(salida.textContent);
    if (cantidad > 0) {
      salida.textContent = cantidad - 1;
      calcularTotal();
    }
  });
});

botonLimpiar.addEventListener("click", function () {
  filasVuelo.forEach(function (fila) {
    fila.querySelector("output").textContent = 0;
  });
  calcularTotal();
});
// ===== Registro de reservas (compras y cancelaciones) =====
const CLAVE = "reservasAmadeus";
const tablaReservas = document.getElementById("tabla-reservas");
const sinReservas = document.getElementById("sin-reservas");
const resumenReservas = document.getElementById("resumen-reservas");

function leerReservas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || [];
  } catch (error) {
    return [];
  }
}

function guardarReservas(lista) {
  localStorage.setItem(CLAVE, JSON.stringify(lista));
}

function fechaHoy() {
  return new Date().toLocaleString("es");
}

function mostrarReservas() {
  const lista = leerReservas();
  let activas = 0;
  let canceladas = 0;
  let totalActivo = 0;
  tablaReservas.innerHTML = "";

  lista.forEach(function (r) {
    if (r.estado === "Activa") {
      activas++;
      totalActivo += r.total;
    } else {
      canceladas++;
    }

    const accion = r.estado === "Activa"
      ? '<button type="button" class="cancelar" data-id="' + r.id + '">Cancelar</button>'
      : r.fechaCancelacion;

    const fila = document.createElement("tr");
    fila.innerHTML =
      "<td>" + r.id + "</td>" +
      "<td>" + r.fecha + "</td>" +
      "<td>" + r.ruta + "</td>" +
      "<td>" + r.boletos + "</td>" +
      "<td>$" + r.total.toFixed(2) + "</td>" +
      '<td><span class="estado ' + r.estado.toLowerCase() + '">' + r.estado + "</span></td>" +
      "<td>" + accion + "</td>";
    tablaReservas.appendChild(fila);
  });

  sinReservas.hidden = lista.length > 0;
  resumenReservas.textContent =
    "Activas: " + activas + " | Canceladas: " + canceladas +
    " | Total de reservas activas: $" + totalActivo.toFixed(2);
}

// Registrar compra: guarda cada ruta que tenga boletos
document.getElementById("comprar").addEventListener("click", function () {
  const lista = leerReservas();
  let nuevas = 0;

  document.querySelectorAll(".vuelo").forEach(function (fila) {
    const boletos = Number(fila.querySelector("output").textContent);
    if (boletos > 0) {
      const precio = Number(fila.dataset.precio);
      lista.push({
        id: lista.length + 1,
        fecha: fechaHoy(),
        ruta: fila.querySelector(".ruta strong").textContent,
        boletos: boletos,
        total: precio * boletos,
        estado: "Activa",
        fechaCancelacion: ""
      });
      nuevas++;
    }
  });

  if (nuevas === 0) {
    alert("Elige al menos un boleto en el cotizador.");
    return;
  }

  guardarReservas(lista);
  document.getElementById("limpiar").click();
  mostrarReservas();
  document.getElementById("reservas").scrollIntoView();
});

// Cancelar una reserva
tablaReservas.addEventListener("click", function (evento) {
  if (!evento.target.classList.contains("cancelar")) return;
  if (!confirm("¿Seguro que quieres cancelar esta reserva?")) return;

  const lista = leerReservas();
  const reserva = lista.find(function (r) {
    return r.id === Number(evento.target.dataset.id);
  });
  reserva.estado = "Cancelada";
  reserva.fechaCancelacion = fechaHoy();
  guardarReservas(lista);
  mostrarReservas();
});

// Descargar el registro para abrirlo en Excel
document.getElementById("descargar").addEventListener("click", function () {
  const lista = leerReservas();
  const filas = [["N.º", "Fecha", "Ruta", "Boletos", "Total (USD)", "Estado", "Fecha de cancelación"]];

  lista.forEach(function (r) {
    filas.push([r.id, r.fecha, r.ruta, r.boletos, r.total.toFixed(2), r.estado, r.fechaCancelacion]);
  });

  const texto = filas.map(function (f) {
    return f.map(function (c) {
      return '"' + String(c).replace(/"/g, '""') + '"';
    }).join(",");
  }).join("\n");

  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(new Blob(["\uFEFF" + texto], { type: "text/csv;charset=utf-8" }));
  enlace.download = "reservas.csv";
  enlace.click();
});

// Borrar todo el historial
document.getElementById("borrar-todo").addEventListener("click", function () {
  if (!confirm("¿Borrar todo el historial de reservas?")) return;
  localStorage.removeItem(CLAVE);
  mostrarReservas();
});

mostrarReservas();
// ===== Aparecer al hacer scroll =====
const bloques = document.querySelectorAll("section h2, section .lead, .dest-grid, .banderas, .que-hace, .linea, .tips-grid, .cotizador, .tabla-caja");

if ("IntersectionObserver" in window) {
  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12 });

  bloques.forEach(function (bloque) {
    bloque.classList.add("reveal");
    observador.observe(bloque);
  });
}

// ===== Botón para volver arriba =====
const botonSubir = document.querySelector(".subir");

window.addEventListener("scroll", function () {
  botonSubir.classList.toggle("visible", window.scrollY > 500);
});