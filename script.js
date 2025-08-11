let sucursales = JSON.parse(localStorage.getItem('sucursales') || '[]');
let editIndex = null;

const sucursalesDiv = document.getElementById('sucursales');
const btnAgregarSucursal = document.getElementById('btnAgregarSucursal');
const modalSucursal = document.getElementById('modalSucursal');
const closeModalSucursal = document.getElementById('closeModalSucursal');
const modalTitleSucursal = document.getElementById('modalTitleSucursal');
const nombreSucursal = document.getElementById('nombreSucursal');
const localidadSucursal = document.getElementById('localidadSucursal');
const btnGuardarSucursal = document.getElementById('btnGuardarSucursal');
const miembrosContainer = document.getElementById('miembrosContainer');

function renderSucursales() {
    sucursalesDiv.innerHTML = '';
    sucursales.forEach((suc, idx) => {
        const card = document.createElement('div');
        card.className = 'sucursal-card';
        card.innerHTML = `
            <div class="sucursal-header">
                <strong>${suc.nombre} - ${suc.localidad}</strong>
                <div>
                    <button onclick="editarSucursal(${idx})">Editar</button>
                    <button onclick="eliminarSucursal(${idx})">Eliminar</button>
                </div>
            </div>
            <div><em>${suc.miembros.length} miembros</em></div>
            <div class="miembros-list">
                ${suc.miembros.map((m, i) => `
                    <div class="miembro-item">
                        ${m.nombre} ${m.apellido} (${m.edad}) - ${m.ministerio}
                        <button onclick="eliminarMiembro(${idx},${i})" style="background:#e74c3c;">X</button>
                    </div>
                `).join('')}
            </div>
            <button onclick="agregarMiembro(${idx})" style="margin-top:8px;">Agregar Miembro</button>
        `;
        sucursalesDiv.appendChild(card);
    });
}
window.editarSucursal = function(idx) {
    editIndex = idx;
    modalTitleSucursal.textContent = "Editar Sucursal";
    nombreSucursal.value = sucursales[idx].nombre;
    localidadSucursal.value = sucursales[idx].localidad;
    renderMiembrosForm(sucursales[idx].miembros);
    modalSucursal.style.display = 'block';
}
window.eliminarSucursal = function(idx) {
    if (confirm('¿Eliminar sucursal?')) {
        sucursales.splice(idx, 1);
        guardarSucursales();
        renderSucursales();
    }
}
window.agregarMiembro = function(idx) {
    const nombre = prompt("Nombre:");
    const apellido = prompt("Apellido:");
    const edad = prompt("Edad:");
    const ministerio = prompt("Ministerio:");
    if (nombre && apellido && edad && ministerio) {
        sucursales[idx].miembros.push({nombre, apellido, edad, ministerio});
        guardarSucursales();
        renderSucursales();
    }
}
window.eliminarMiembro = function(idx, mIdx) {
    sucursales[idx].miembros.splice(mIdx, 1);
    guardarSucursales();
    renderSucursales();
}
btnAgregarSucursal.onclick = () => {
    editIndex = null;
    modalTitleSucursal.textContent = "Agregar Sucursal";
    nombreSucursal.value = '';
    localidadSucursal.value = '';
    renderMiembrosForm([]);
    modalSucursal.style.display = 'block';
};
closeModalSucursal.onclick = () => modalSucursal.style.display = 'none';
btnGuardarSucursal.onclick = () => {
    const nombre = nombreSucursal.value.trim();
    const localidad = localidadSucursal.value.trim();
    if (!nombre || !localidad) {
        alert('Completa todos los campos');
        return;
    }
    let miembros = [];
    document.querySelectorAll('.miembro-form').forEach(row => {
        const n = row.querySelector('.m-nombre').value.trim();
        const a = row.querySelector('.m-apellido').value.trim();
        const e = row.querySelector('.m-edad').value.trim();
        const min = row.querySelector('.m-ministerio').value.trim();
        if (n && a && e && min) miembros.push({nombre: n, apellido: a, edad: e, ministerio: min});
    });
    if (editIndex === null) {
        sucursales.push({nombre, localidad, miembros});
    } else {
        sucursales[editIndex] = {nombre, localidad, miembros};
    }
    guardarSucursales();
    renderSucursales();
    modalSucursal.style.display = 'none';
};
function guardarSucursales() {
    localStorage.setItem('sucursales', JSON.stringify(sucursales));
}
function renderMiembrosForm(miembros) {
    miembrosContainer.innerHTML = '<h4>Miembros</h4>';
    miembros.forEach((m, i) => {
        miembrosContainer.innerHTML += `
            <div class="miembro-form">
                <input class="m-nombre" type="text" placeholder="Nombre" value="${m.nombre}">
                <input class="m-apellido" type="text" placeholder="Apellido" value="${m.apellido}">
                <input class="m-edad" type="text" placeholder="Edad" value="${m.edad}">
                <input class="m-ministerio" type="text" placeholder="Ministerio" value="${m.ministerio}">
            </div>
        `;
    });
    miembrosContainer.innerHTML += `
        <button onclick="agregarCampoMiembro()" style="margin-top:8px;">Agregar Campo Miembro</button>
    `;
}
window.agregarCampoMiembro = function() {
    miembrosContainer.insertAdjacentHTML('beforeend', `
        <div class="miembro-form">
            <input class="m-nombre" type="text" placeholder="Nombre">
            <input class="m-apellido" type="text" placeholder="Apellido">
            <input class="m-edad" type="text" placeholder="Edad">
            <input class="m-ministerio" type="text" placeholder="Ministerio">
        </div>
    `);
};
window.onclick = function(event) {
    if (event.target == modalSucursal) modalSucursal.style.display = "none";
};
renderSucursales();