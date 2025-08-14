
/****************************
 * Almacenamiento (localStorage)
 ****************************/
const LS_KEYS = {
  sucursales: 'sucursales',
  codigos: 'codigos_permitidos'
};

function loadJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return fallback;
    return JSON.parse(raw);
  }catch(e){
    console.warn('JSON inválido en', key, e);
    return fallback;
  }
}
function saveJSON(key, data){
  localStorage.setItem(key, JSON.stringify(data));
}

function ensureDefaults(){
  // Códigos permitidos (admin) por defecto: ["0031"]
  if(!localStorage.getItem(LS_KEYS.codigos)){
    saveJSON(LS_KEYS.codigos, ["0031"]);
  }
  // Sucursales por defecto: []
  if(!localStorage.getItem(LS_KEYS.sucursales)){
    saveJSON(LS_KEYS.sucursales, []);
  }
}

/****************************
 * Modelo de datos
 ****************************/
function getSucursales(){ return loadJSON(LS_KEYS.sucursales, []); }
function setSucursales(arr){ saveJSON(LS_KEYS.sucursales, arr); }
function getCodigos(){ return loadJSON(LS_KEYS.codigos, ["0031"]); }
function setCodigos(arr){ saveJSON(LS_KEYS.codigos, arr); }

function findSucursalByCodigo(codigo){
  return getSucursales().find(s=>s.codigo===codigo);
}

/****************************
 * Utilidades UI
 ****************************/
const $ = sel => document.querySelector(sel);
function show(id){ document.querySelectorAll('section').forEach(s=>s.classList.add('hidden')); $(id).classList.remove('hidden'); }
function toast(msg){
  const div = document.createElement('div');
  div.textContent = msg;
  div.style.position='fixed'; div.style.bottom='16px'; div.style.left='50%'; div.style.transform='translateX(-50%)';
  div.style.background='#0b1220'; div.style.border='1px solid #22304a'; div.style.padding='10px 14px'; div.style.borderRadius='10px';
  div.style.boxShadow='0 10px 30px #0007';
  document.body.appendChild(div); setTimeout(()=>div.remove(),2000);
}

/****************************
 * LOGIN
 ****************************/
$('#btnLogin').addEventListener('click', onLogin);
$('#inpCodigo').addEventListener('keydown', e=>{ if(e.key==='Enter') onLogin(); });

function onLogin(){
  const codigo = $('#inpCodigo').value.trim();
  if(!codigo) return toast('Ingresá un código.');
  if(codigo.toUpperCase()==='FIN'){ location.reload(); return; }

  // Rol nacional especial: 3214
  if(codigo==='3214'){
    renderNacional();
    show('#view-nacional');
    return;
  }

  // Si coincide con sucursal → vista sucursal
  const suc = findSucursalByCodigo(codigo);
  if(suc){
    currentSucursalCodigo = codigo;
    renderSucursal();
    show('#view-sucursal');
    return;
  }

  // Si está en lista de códigos permitidos (admin)
  const codigos = getCodigos();
  if(codigos.includes(codigo)){
    renderAdmin();
    show('#view-admin');
    return;
  }

  toast('❌ Acceso denegado');
}

/****************************
 * ADMIN MENU (equivalente a menú principal con códigos permitidos)
 ****************************/
let adminOutput = $('#adminOutput');
$('#btnAdminLogout').addEventListener('click', ()=>{ location.reload(); });

$('#btnListCodigos').addEventListener('click', ()=>{
  const sucs = getSucursales();
  if(!sucs.length){ adminOutput.innerHTML = 'No hay sucursales registradas.'; return; }
  const lista = sucs.map((s,i)=>`<li>${i+1}. <b>${s.nombre}</b>: <span class="tag">${s.codigo}</span></li>`).join('');
  adminOutput.innerHTML = `<ul style="margin:0 0 0 16px;">${lista}</ul>`;
});
$('#btnListSucursales').addEventListener('click', ()=>{
  const sucs = getSucursales();
  if(!sucs.length){ adminOutput.innerHTML = 'No hay sucursales registradas.'; return; }
  adminOutput.innerHTML = renderSucursalesDetalleHTML(sucs);
});
$('#btnAddSucursal').addEventListener('click', () => {
  $('#sucNombre').focus();
});
$('#btnDeleteSucursal').addEventListener('click', ()=>{
  const sucs = getSucursales();
  if(!sucs.length){ adminOutput.innerHTML = 'No hay sucursales.'; return; }
  const nombre = prompt('Escribí el nombre EXACTO de la sucursal a eliminar:');
  if(!nombre) return;
  const before = sucs.length;
  const filtered = sucs.filter(s=>s.nombre!==nombre);
  if(filtered.length===before){ toast('No se encontró esa sucursal.'); return; }
  setSucursales(filtered);
  adminOutput.innerHTML = 'Sucursal eliminada.';
});
$('#btnEditSucursal').addEventListener('click', ()=>{
  const sucs = getSucursales(); if(!sucs.length){ adminOutput.textContent='No hay sucursales.'; return; }
  const nombre = prompt('Nombre actual de la sucursal a editar:'); if(!nombre) return;
  const s = sucs.find(x=>x.nombre===nombre); if(!s){ toast('No encontrada'); return; }
  const nuevoNombre = prompt('Nuevo nombre (ENTER para mantener):', s.nombre) || s.nombre;
  const nuevaUbic = prompt('Nueva ubicación (ENTER para mantener):', s.ubicacion) || s.ubicacion;
  s.nombre = nuevoNombre; s.ubicacion = nuevaUbic; setSucursales(sucs);
  adminOutput.innerHTML = 'Datos actualizados.';
});

$('#btnCrearSucursal').addEventListener('click', ()=>{
  const nombre = $('#sucNombre').value.trim();
  const ubic = $('#sucUbicacion').value.trim();
  const codigo = $('#sucCodigo').value.trim();
  if(!nombre || !codigo){ toast('Nombre y código son obligatorios'); return; }
  const sucs = getSucursales();
  if(sucs.some(s=>s.codigo===codigo)){ toast('Ese código ya existe'); return; }
  sucs.push({ nombre, ubicacion: ubic, codigo, miembros: [] });
  setSucursales(sucs);
  $('#sucNombre').value = $('#sucUbicacion').value = $('#sucCodigo').value = '';
  toast('Sucursal agregada');
});

function renderAdmin(){
  adminOutput.innerHTML = 'Elegí una acción…';
}

function renderSucursalesDetalleHTML(sucs){
  return `
  <table>
    <thead>
      <tr><th>#</th><th>Nombre</th><th>Ubicación</th><th>Código</th><th>Miembros</th></tr>
    </thead>
    <tbody>
      ${sucs.map((s,i)=>`<tr><td>${i+1}</td><td>${s.nombre}</td><td>${s.ubicacion||'-'}</td><td><span class="tag">${s.codigo}</span></td><td>${s.miembros.length}</td></tr>`).join('')}
    </tbody>
  </table>`;
}

/****************************
 * ROL NACIONAL
 ****************************/
let nacionalSeleccion = null; // índice seleccionado
$('#btnNacionalLogout').addEventListener('click', ()=>{ location.reload(); });
$('#btnNacAgregar').addEventListener('click', ()=>{
  const nombre = $('#nacNombre').value.trim();
  const ubic = $('#nacUbicacion').value.trim();
  const codigo = $('#nacCodigo').value.trim();
  if(!nombre || !codigo){ toast('Nombre y código son obligatorios'); return; }
  const sucs = getSucursales();
  if(sucs.some(s=>s.codigo===codigo)){ toast('Ese código ya existe'); return; }
  sucs.push({ nombre, ubicacion: ubic, codigo, miembros: [] }); setSucursales(sucs);
  $('#nacNombre').value = $('#nacUbicacion').value = $('#nacCodigo').value = '';
  renderNacional(); toast('Sucursal agregada');
});
$('#btnNacEditar').addEventListener('click', ()=>{
  const sucs = getSucursales(); if(nacionalSeleccion==null){ toast('Seleccioná una sucursal en la lista'); return; }
  const s = sucs[nacionalSeleccion];
  s.nombre = $('#nacNombre').value.trim() || s.nombre;
  s.ubicacion = $('#nacUbicacion').value.trim() || s.ubicacion;
  s.codigo = $('#nacCodigo').value.trim() || s.codigo;
  setSucursales(sucs); renderNacional(); toast('Sucursal editada');
});
$('#btnNacEliminar').addEventListener('click', ()=>{
  const sucs = getSucursales(); if(nacionalSeleccion==null){ toast('Seleccioná una sucursal'); return; }
  if(!confirm('¿Eliminar sucursal seleccionada?')) return;
  sucs.splice(nacionalSeleccion,1); setSucursales(sucs); nacionalSeleccion=null; renderNacional(); toast('Eliminada');
});

function renderNacional(){
  const sucs = getSucursales();
  if(!sucs.length){ $('#nacionalLista').innerHTML = '<div class="notice">No hay sucursales</div>'; return; }
  const html = `
    <table>
      <thead><tr><th>#</th><th>Nombre</th><th>Ubicación</th><th>Código</th><th>Miembros</th><th>Sel.</th></tr></thead>
      <tbody>
        ${sucs.map((s,i)=>`<tr>
          <td>${i+1}</td>
          <td>${s.nombre}</td>
          <td>${s.ubicacion||'-'}</td>
          <td><span class="tag">${s.codigo}</span></td>
          <td>${s.miembros.length}</td>
          <td><button class="link" data-idx="${i}">Seleccionar</button></td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  $('#nacionalLista').innerHTML = html;
  $('#nacionalLista').querySelectorAll('button[data-idx]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      nacionalSeleccion = parseInt(e.currentTarget.getAttribute('data-idx'));
      const s = sucs[nacionalSeleccion];
      $('#nacNombre').value = s.nombre;
      $('#nacUbicacion').value = s.ubicacion||'';
      $('#nacCodigo').value = s.codigo;
      toast(`Seleccionada: ${s.nombre}`);
    });
  });
}

/****************************
 * VISTA SUCURSAL + miembros
 ****************************/
let currentSucursalCodigo = null;
$('#btnSucLogout').addEventListener('click', ()=>{ location.reload(); });
$('#btnGuardarSucursal').addEventListener('click', ()=>{
  const sucs = getSucursales();
  const s = sucs.find(x=>x.codigo===currentSucursalCodigo); if(!s) return;
  s.nombre = $('#editNombre').value.trim() || s.nombre;
  s.ubicacion = $('#editUbicacion').value.trim() || s.ubicacion;
  setSucursales(sucs); renderSucursal(); toast('Datos guardados');
});
$('#btnMiembroAgregar').addEventListener('click', ()=>{
  const sucs = getSucursales();
  const s = sucs.find(x=>x.codigo===currentSucursalCodigo); if(!s) return;
  const nombre = prompt('Nombre:'); if(!nombre) return;
  const apellido = prompt('Apellido:'); if(!apellido) return;
  const edad = prompt('Edad:')||'';
  const ministerio = prompt('Ministerio:')||'';
  s.miembros.push({nombre, apellido, edad, ministerio});
  setSucursales(sucs); renderSucursal();
});

function renderSucursal(){
  const s = findSucursalByCodigo(currentSucursalCodigo); if(!s) return;
  $('#sucTitle').textContent = `Sucursal: ${s.nombre}`;
  $('#sucSub').textContent = `${s.ubicacion||'-'} • ${s.miembros.length} miembros`;
  $('#editNombre').value = s.nombre; $('#editUbicacion').value = s.ubicacion||'';

  const html = `
    <table>
      <thead><tr><th>#</th><th>Nombre</th><th>Apellido</th><th>Edad</th><th>Ministerio</th><th>Acciones</th></tr></thead>
      <tbody>
        ${s.miembros.map((m,i)=>`<tr>
          <td>${i+1}</td>
          <td>${m.nombre}</td>
          <td>${m.apellido}</td>
          <td>${m.edad||'-'}</td>
          <td>${m.ministerio||'-'}</td>
          <td>
            <button class="link" data-edit="${i}">Editar</button>
            <button class="link" data-del="${i}">Eliminar</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  $('#miembrosTabla').innerHTML = html;
  // acciones
  $('#miembrosTabla').querySelectorAll('button[data-edit]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const idx = parseInt(e.currentTarget.getAttribute('data-edit'));
      const sucs = getSucursales(); const suc = sucs.find(x=>x.codigo===currentSucursalCodigo);
      const m = suc.miembros[idx];
      const nombre = prompt('Nombre:', m.nombre) || m.nombre;
      const apellido = prompt('Apellido:', m.apellido) || m.apellido;
      const edad = prompt('Edad:', m.edad||'') || m.edad;
      const ministerio = prompt('Ministerio:', m.ministerio||'') || m.ministerio;
      suc.miembros[idx] = {nombre, apellido, edad, ministerio}; setSucursales(sucs); renderSucursal();
    });
  });
  $('#miembrosTabla').querySelectorAll('button[data-del]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const idx = parseInt(e.currentTarget.getAttribute('data-del'));
      if(!confirm('¿Eliminar miembro?')) return;
      const sucs = getSucursales(); const suc = sucs.find(x=>x.codigo===currentSucursalCodigo);
      suc.miembros.splice(idx,1); setSucursales(sucs); renderSucursal();
    });
  });
}

/****************************
 * Init
 ****************************/
ensureDefaults();
function renderOnLoad(){
  // nada: arrancamos en login
}
renderOnLoad();
