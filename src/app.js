import { db } from "./firebase.js";
import { ref, onValue } from "firebase/database";

const contenedorProductos = document.getElementById("contenedor-productos");

let productosGlobales = [];

function cargarProductosTiempoReal() {
    contenedorProductos.innerHTML = "<p style='padding: 20px;'>Cargando inventario en tiempo real...</p>";

    const productosRef = ref(db, "productos");

    onValue(productosRef, (snapshot) => {
        const data = snapshot.val();

        if (!data) {
            contenedorProductos.innerHTML = "<p style='padding: 20px;'>No hay productos registrados todavía.</p>";
            return;
        }

        contenedorProductos.innerHTML = "";
        productosGlobales = [];

        Object.entries(data).forEach(([id, producto]) => {
            productosGlobales.push({ id, ...producto });

            const imagenSrc = producto.urlImagen && producto.urlImagen.trim() !== "" 
                ? producto.urlImagen 
                : "assets/imagen no encontrada.jpg";

            const tarjeta = document.createElement("div");
            tarjeta.classList.add("tarjeta-producto");

            tarjeta.innerHTML = `
                <div>
                    <span style="font-size: 0.7rem; background: #eee; padding: 2px 6px; border-radius: 4px; color: #555;">Cód: ${producto.codigo || id}</span>
                    <h3>${producto.nombre}</h3>
                    <div class="contenedor-imagen">
                        <img src="${imagenSrc}" alt="${producto.nombre}">
                    </div>
                    <p style="font-size: 0.8rem; color: #666; margin-bottom: 10px;">${producto.descripcion || ''}</p>
                </div>
                <div>
                    <p class="precio">$${producto.precio}</p>
                    <button class="btn-comprar" data-id="${id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}">
                        Añadir al carrito
                    </button>
                </div>
            `;

            contenedorProductos.appendChild(tarjeta);
        });

        activarBotonesAgregar();
    }, (error) => {
        console.error("Error al leer la base de datos: ", error);
        contenedorProductos.innerHTML = "<p style='padding: 20px;'>Error al conectar con la base de datos.</p>";
    });
}

// Nueva función: Generar Excel simplificado exclusivamente para etiquetas (Código, Nombre y Precio)
function generarExcelEtiquetas() {
    if (productosGlobales.length === 0) {
        alert("No hay productos para generar etiquetas.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Codigo,Nombre,Precio\n";
    
    productosGlobales.forEach(p => {
        const codigo = p.codigo || p.id;
        const nombre = `"${(p.nombre || "").replace(/"/g, '""')}"`;
        const precio = p.precio || 0;

        csvContent += `${codigo},${nombre},${precio}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "etiquetas_productos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Función general para descargar todo el inventario completo
function exportarAExcel() {
    if (productosGlobales.length === 0) {
        alert("No hay productos para exportar.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Codigo,Nombre,Categoria,Precio,Descripcion\n";
    productosGlobales.forEach(p => {
        const codigo = p.codigo || p.id;
        const nombre = `"${(p.nombre || "").replace(/"/g, '""')}"`;
        const categoria = `"${(p.categoria || "").replace(/"/g, '""')}"`;
        const precio = p.precio || 0;
        const descripcion = `"${(p.descripcion || "").replace(/"/g, '""')}"`;
        csvContent += `${codigo},${nombre},${categoria},${precio},${descripcion}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventario_tienda_3d_tech.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Crear botones superiores
function crearBotonesHerramientas() {
    const mainEl = document.querySelector("main");
    if (document.getElementById("barra-herramientas-admin")) return;

    const barra = document.createElement("div");
    barra.id = "barra-herramientas-admin";
    barra.style.cssText = "margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;";

    const btnExportar = document.createElement("button");
    btnExportar.textContent = "📊 Descargar Inventario (Excel)";
    btnExportar.style.cssText = "background: #27ae60; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;";
    btnExportar.onclick = exportarAExcel;

    const btnEtiquetas = document.createElement("button");
    btnEtiquetas.textContent = "🏷️ Descargar Excel para Etiquetas";
    btnEtiquetas.style.cssText = "background: #e67e22; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;";
    btnEtiquetas.onclick = generarExcelEtiquetas;

    barra.appendChild(btnExportar);
    barra.appendChild(btnEtiquetas);

    mainEl.insertBefore(barra, contenedorProductos);
}

function activarBotonesAgregar() {
    const botones = document.querySelectorAll(".btn-comprar");
    botones.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            const nombre = e.target.dataset.nombre;
            const precio = parseFloat(e.target.dataset.precio);

            let carrito = JSON.parse(localStorage.getItem("carrito3d")) || [];
            const index = carrito.findIndex(item => item.id === id);
            if (index > -1) {
                carrito[index].cantidad += 1;
            } else {
                carrito.push({ id, nombre, precio, cantidad: 1 });
            }

            localStorage.setItem("carrito3d", JSON.stringify(carrito));
            actualizarContadorCarrito();
            alert(`¡${nombre} agregado al carrito!`);
        });
    });
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito3d")) || [];
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const contadorEl = document.getElementById("contador-carrito");
    if (contadorEl) contadorEl.textContent = totalItems;
}

document.addEventListener("DOMContentLoaded", () => {
    crearBotonesHerramientas();
    cargarProductosTiempoReal();
    actualizarContadorCarrito();
});