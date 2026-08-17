const contenedorCarrito = document.getElementById("contenedor-carrito");
const seccionCheckout = document.getElementById("seccion-checkout");

function cargarCarrito() {
    let carrito = JSON.parse(localStorage.getItem("carrito3d")) || [];

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = "<p style='padding: 20px; background: white; border-radius: 4px;'>Tu carrito está vacío.</p>";
        if (seccionCheckout) seccionCheckout.style.display = "none";
        actualizarContadorCarrito();
        return;
    }

    if (seccionCheckout) seccionCheckout.style.display = "block";
    contenedorCarrito.innerHTML = "";

    let tablaHtml = `
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 4px; overflow: hidden; border: 1px solid #ddd;">
            <thead>
                <tr style="background: #f4f4f4; text-align: left; border-bottom: 1px solid #ddd;">
                    <th style="padding: 12px;">Producto</th>
                    <th style="padding: 12px;">Precio</th>
                    <th style="padding: 12px;">Cantidad</th>
                    <th style="padding: 12px;">Subtotal</th>
                    <th style="padding: 12px;">Acción</th>
                </tr>
            </thead>
            <tbody>
    `;

    let totalGeneral = 0;

    carrito.forEach((item, index) => {
        let subtotal = item.precio * item.cantidad;
        totalGeneral += subtotal;

        tablaHtml += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px;">${item.nombre}</td>
                <td style="padding: 12px;">$${item.precio}</td>
                <td style="padding: 12px;">${item.cantidad}</td>
                <td style="padding: 12px; font-weight: bold;">$${subtotal}</td>
                <td style="padding: 12px;">
                    <button class="btn-eliminar" data-index="${index}" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Eliminar</button>
                </td>
            </tr>
        `;
    });

    tablaHtml += `
            </tbody>
        </table>
        <div style="text-align: right; margin-top: 15px; font-size: 1.2rem; font-weight: bold;">
            Total a Pagar: <span style="color: #27ae60;">$${totalGeneral}</span>
        </div>
    `;

    contenedorCarrito.innerHTML = tablaHtml;
    activarBotonesEliminar();
    actualizarContadorCarrito();
}

function activarBotonesEliminar() {
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.onclick = (e) => {
            const index = e.target.dataset.index;
            let carrito = JSON.parse(localStorage.getItem("carrito3d")) || [];
            carrito.splice(index, 1);
            localStorage.setItem("carrito3d", JSON.stringify(carrito));
            cargarCarrito();
        };
    });
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito3d")) || [];
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const contadorEl = document.getElementById("contador-carrito");
    if (contadorEl) contadorEl.textContent = totalItems;
}

document.addEventListener("DOMContentLoaded", () => {
    cargarCarrito();
});