const storageKey = 'veterinaria-data';
const sessionKey = 'veterinaria-session';

const defaultServices = [
	{ id: 1, name: 'Consulta general', description: 'Evaluación completa de salud', price: 35000, duration: 30, category: 'Consulta', active: true },
	{ id: 2, name: 'Vacunación', description: 'Protección y prevención', price: 25000, duration: 20, category: 'Consulta', active: true },
	{ id: 3, name: 'Limpieza dental', description: 'Higiene bucal profesional', price: 60000, duration: 60, category: 'Otro', active: true },
	{ id: 4, name: 'Baño y peluquería', description: 'Cuidado e higiene', price: 30000, duration: 45, category: 'Otro', active: true }
];

const initialData = {
	clients: [{ id: 1, document: '1023456789', firstName: 'Laura', lastName: 'Gómez', phone: '3001234567', email: 'laura.gomez@correo.com', address: 'Calle 10 #5-20, Bogotá', active: true }, { id: 2, document: '1034567890', firstName: 'Carlos', lastName: 'Ruiz', phone: '3012345678', email: 'carlos.ruiz@correo.com', address: 'Carrera 7 #45-10, Medellín', active: true }],
	vets: [{ id: 1, name: 'Dra. Ana Pérez', license: 'VET-1024', specialty: 'Medicina general', phone: '3100000001', active: true }, { id: 2, name: 'Dr. Jorge Mora', license: 'VET-2048', specialty: 'Cirugía', phone: '3100000002', active: true }],
	pets: [{ id: 1, clientId: 1, name: 'Milo', species: 'Perro', breed: 'Beagle', sex: 'Macho', age: 4, weight: 12.4, color: 'Tricolor', notes: 'Sin observaciones', badge: 'teal', documents: [{ name: 'Hemograma_Milo.pdf', url: '#' }] }, { id: 2, clientId: 2, name: 'Luna', species: 'Gato', breed: 'Siamés', sex: 'Hembra', age: 2, weight: 4.1, color: 'Gris', notes: 'Sin observaciones', badge: 'coral', documents: [] }],
	consultations: [{ id: 1, pet: 'Milo', service: 'Consulta general', date: '2024-08-12', time: '09:30', status: 'En curso', payment: 'Tarjeta', vet: 'Dra. Ana Pérez', motivo: 'Revisión anual y control de peso', diagnostico: '', recomendaciones: '', medicamentos: '', notes: '' }],
	vaccines: [{ id: 1, pet: 'Milo', vaccine: 'Rabia anual', dose: '1 ml', date: '2026-08-01', nextDate: '2026-10-15', vet: 'Dra. Ana Pérez' }],
	payments: [{ id: 1, consultId: 1, date: '2024-08-12', method: 'Tarjeta', concepts: [{ desc: 'Consulta general', value: 35000 }], total: 35000 }],
	users: [{ id: 1, username: 'admin', password: 'admin123', name: 'Administración General', role: 'Administrador', active: true }, { id: 2, username: 'secre', password: 'secre123', name: 'Secretaría Recepción', role: 'Secretaria', active: true }, { id: 3, username: 'vet', password: 'vet123', name: 'Dra. Ana Pérez', role: 'Veterinario', active: true }],
	employees: [{ id: 1, document: '1020304050', name: 'Camila Torres', phone: '3101112233', email: 'camila.torres@vet.com', position: 'Secretaria', hireDate: '2023-02-01', active: true }],
	services: defaultServices.map((s) => ({ ...s })),
	stays: [{ id: 1, pet: 'Milo', checkIn: '2026-09-30T08:00', checkOut: '', rate: 5000, status: 'Activa' }],
	surgeries: [{ id: 1, pet: 'Milo', vet: 'Dra. Ana Pérez', procedure: 'Esterilización', date: '2026-09-15', time: '08:00', cost: 250000, status: 'Finalizada' }],
	products: [{ id: 1, name: 'Alimento premium perros', category: 'Alimento', quantity: 20, minStock: 5, cost: 85000 }, { id: 2, name: 'Vacuna antirrábica', category: 'Medicamento', quantity: 3, minStock: 5, cost: 25000 }]
};

const serviceCategories = ['Consulta', 'Urgencia', 'Guardería', 'Cirugía', 'Otro'];
const employeePositions = ['Veterinario', 'Secretaria', 'Auxiliar', 'Administrativo', 'Guardería'];
const productCategories = ['Alimento', 'Medicamento', 'Higiene', 'Accesorio', 'Otro'];

const rolePermissions = {
	'Administrador': ['overview', 'clients', 'pets', 'appointments', 'services', 'staff', 'vaccines', 'payments', 'settings', 'guarderia', 'cirugias', 'inventario', 'reportes'],
	'Secretaria': ['overview', 'clients', 'pets', 'appointments', 'services', 'vaccines', 'payments', 'guarderia', 'cirugias'],
	'Veterinario': ['overview', 'pets', 'appointments', 'services', 'vaccines', 'guarderia', 'cirugias']
};

function migrateData(raw) {
	const data = { clients: [], vets: [], pets: [], consultations: [], vaccines: [], payments: [], users: [], employees: [], services: [], stays: [], surgeries: [], products: [], movements: [], notifications: true, ...raw };
	data.pets = data.pets.map((pet) => ({ notes: '', badge: 'teal', documents: [], ...pet }));
	return data;
}

let data = migrateData(JSON.parse(localStorage.getItem(storageKey)) || initialData);
let editingPetId = null;
let editingClientId = null;
let editingVetId = null;
let editingUserId = null;
let editingServiceId = null;
let editingEmployeeId = null;
let editingProductId = null;
let editingStayId = null;
let editingSurgeryId = null;
let selectedConsultationStatus = 'Todas';
let currentUser = null;

const $ = (selector) => document.querySelector(selector);
const formatDate = (date) => date ? new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '') : 'Sin fecha';
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch (e) { showToast('Almacenamiento lleno: elimina documentos adjuntos'); } };
const petInitial = (name) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
const clientById = (id) => data.clients.find((c) => c.id === Number(id));
const clientName = (id) => { const c = clientById(id); return c ? `${c.firstName} ${c.lastName}` : 'Sin propietario'; };
const vetById = (id) => data.vets.find((v) => v.id === Number(id));
const userById = (id) => data.users.find((u) => u.id === Number(id));
const employeeById = (id) => data.employees.find((e) => e.id === Number(id));
const serviceById = (id) => data.services.find((s) => s.id === Number(id));
const servicePrice = (name) => data.services.find((s) => s.name === name)?.price || 0;
const activeServices = () => data.services.filter((s) => s.active);
const showToast = (message) => { $('#toast span').textContent = message; $('#toast').classList.add('show'); setTimeout(() => $('#toast').classList.remove('show'), 2800); };
const ensureSelectOption = (select, value, label) => { if (value && ![...select.options].some((o) => o.value === String(value))) select.insertAdjacentHTML('beforeend', `<option value="${value}">${label}</option>`); };

function serviceDuration(name) { return data.services.find((s) => s.name === name)?.duration || 30; }

function autoFinalizeConsultations() {
	const now = new Date();
	let changed = false;
	data.consultations.forEach((c) => {
		if (c.status === 'Cancelado' || c.status === 'Finalizado') return;
		const end = new Date(new Date(`${c.date}T${c.time}:00`).getTime() + serviceDuration(c.service) * 60000);
		if (now >= end) { c.status = 'Finalizado'; changed = true; }
	});
	if (changed) save();
}

const SURGERY_MIN = 60;
function vetConflict(vet, date, time, duration, skip = {}) {
	if (!vet || !date || !time) return false;
	const start = new Date(`${date}T${time}:00`);
	const end = new Date(start.getTime() + duration * 60000);
	const hit = (d, t, mins) => { const s = new Date(`${d}T${t}:00`); return start < new Date(s.getTime() + mins * 60000) && end > s; };
	const consult = data.consultations.some((c) => c.vet === vet && c.status !== 'Cancelado' && c.id !== skip.consultId && hit(c.date, c.time, serviceDuration(c.service)));
	const surgery = data.surgeries.some((s) => s.vet === vet && s.id !== skip.surgeryId && hit(s.date, s.time || '08:00', SURGERY_MIN));
	return consult || surgery;
}
const vetIsBusy = (vet, date, time, duration = 30, excludeId = null) => vetConflict(vet, date, time, duration, { consultId: excludeId });
const vetIsBusySurgery = (vet, date, time, duration = 60, excludeId = null) => vetConflict(vet, date, time, duration, { surgeryId: excludeId });

function loadSession() {
	try {
		const session = JSON.parse(sessionStorage.getItem(sessionKey));
		if (session) {
			const user = userById(session.userId);
			if (user && user.active) currentUser = user;
		}
	} catch (error) { currentUser = null; }
}

function applyPermissions() {
	const allowed = rolePermissions[currentUser.role] || ['overview'];
	document.body.dataset.role = currentUser.role;
	document.querySelectorAll('.nav-item[data-view]').forEach((item) => {
		item.style.display = allowed.includes(item.dataset.view) ? '' : 'none';
	});
	const activeSection = document.querySelector('.view-section.active');
	if (activeSection && !allowed.includes(activeSection.id.replace('view-', ''))) switchView('overview', 'Resumen');
	$('#profileName').textContent = currentUser.name;
	$('#profileRole').textContent = currentUser.role;
	const canManageServices = currentUser.role === 'Administrador';
	if ($('#addServiceBtn')) $('#addServiceBtn').style.display = canManageServices ? '' : 'none';
}

function switchView(view, label) {
	const allowed = rolePermissions[currentUser?.role] || [];
	if (!allowed.includes(view)) { showToast('Tu rol no tiene permiso para acceder a esta sección'); return; }
	document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
	document.querySelectorAll('.view-section').forEach((section) => section.classList.toggle('active', section.id === `view-${view}`));
	$('#breadcrumbPage').textContent = label || document.querySelector(`.nav-item[data-view="${view}"]`)?.dataset.label || 'Resumen';
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

function enterApp() {
	$('#loginScreen').classList.remove('show');
	$('#todayLabel').textContent = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
	applyPermissions();
	render();
}

function logout() {
	currentUser = null;
	sessionStorage.removeItem(sessionKey);
	closeModals();
	$('#loginScreen').classList.add('show');
}

document.addEventListener('input', (event) => {
	if (event.target.matches('[data-digits-only]')) event.target.value = event.target.value.replace(/\D/g, '');
});

function render() {
	autoFinalizeConsultations();
	$('#statPets').textContent = data.pets.length;
	const ym = todayStr().slice(0, 7), d30 = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
	$('#statConsults').textContent = data.consultations.filter((c) => (c.date || '').startsWith(ym)).length;
	$('#statVaccines').textContent = data.vaccines.filter((v) => v.date >= d30).length;
	$('#statRevenue').textContent = `$${data.payments.filter((p) => (p.date || '').startsWith(ym)).reduce((t, p) => t + p.total, 0).toLocaleString('es-ES')}`;
	$('#petNavCount').textContent = data.pets.length;
	$('#allConsultCount').textContent = data.consultations.length;
	$('#recentPets').innerHTML = data.pets.slice(-3).reverse().map((pet) => `<div class="pet-row"><span class="pet-avatar ${pet.badge || 'teal'}">${petInitial(pet.name)}</span><div><strong>${pet.name}</strong><small>${pet.species} · ${pet.breed}</small></div><span class="row-arrow"></span></div>`).join('');
	$('#scheduleList').innerHTML = data.consultations.filter((c) => c.date === todayStr() && c.status !== 'Cancelado').sort((a, b) => a.time.localeCompare(b.time)).slice(0, 6).map((item) => `<div class="schedule-row"><span class="time">${item.time}</span><span class="schedule-line"></span><span class="pet-avatar small ${data.pets.find((pet) => pet.name === item.pet)?.badge || 'teal'}">${petInitial(item.pet)}</span><div class="schedule-details"><strong>${item.pet}</strong><small>${item.service}${item.vet ? ` · ${item.vet}` : ''}</small></div><span class="status ${item.status.toLowerCase().replace(' ', '-')}">${item.status}</span></div>`).join('') || '<div class="empty-state">No hay servicios programados para hoy.</div>';
	renderClients($('#clientSearch').value); renderPets($('#petSearch').value); renderConsultations(); renderServices(); renderVaccines(); renderStaff(); renderPayments(); renderStays(); renderSurgeries(); renderProducts(); renderReminders(); fillPetOptions(); renderDailySummary(); renderReports();
}

function renderDailySummary() {
	const today = todayStr();
	const todays = data.consultations.filter((c) => c.date === today);
	const done = todays.filter((c) => c.status === 'Finalizado').length;
	const pct = todays.length ? Math.round((done / todays.length) * 100) : 0;
	const income = data.payments.filter((p) => p.date === today).reduce((t, p) => t + p.total, 0);
	$('#dailySummaryText').textContent = `Servicios finalizados hoy: ${done} de ${todays.length} · Ingresos de hoy: $${income.toLocaleString('es-ES')}`;
	$('#dailySummaryPct').textContent = `${pct}%`;
	$('#dailySummaryBar').style.width = `${pct}%`;
}

function renderClients(filter = '') {
	const term = filter.toLowerCase();
	const rows = data.clients.filter((c) => `${c.document} ${c.firstName} ${c.lastName} ${c.phone}`.toLowerCase().includes(term));
	$('#clientsTable').innerHTML = rows.map((c) => {
		const petsCount = data.pets.filter((p) => p.clientId === c.id).length;
		return `<tr><td><strong>${c.document}</strong></td><td>${c.firstName} ${c.lastName}</td><td>${c.phone || '—'}</td><td>${c.email || '—'}</td><td>${petsCount} ${petsCount === 1 ? 'mascota' : 'mascotas'}</td><td><span class="status ${c.active ? 'activo' : 'inactivo'}">${c.active ? 'Activo' : 'Inactivo'}</span></td><td><button class="row-menu" data-edit-client="${c.id}">Editar</button> <button class="row-menu" data-toggle-client="${c.id}">${c.active ? 'Desactivar' : 'Activar'}</button></td></tr>`;
	}).join('') || '<tr><td colspan="7" class="empty-state">No encontramos clientes.</td></tr>';
}

function renderStaff() {
	$('#employeesTable').innerHTML = data.employees.map((e) => `<tr><td><strong>${e.document}</strong></td><td>${e.name}</td><td>${e.phone || '—'}</td><td>${e.email || '—'}</td><td>${e.position}</td><td>${formatDate(e.hireDate)}</td><td><span class="status ${e.active ? 'activo' : 'inactivo'}">${e.active ? 'Activo' : 'Inactivo'}</span></td><td><button class="row-menu" data-edit-employee="${e.id}">Editar</button> <button class="row-menu" data-toggle-employee="${e.id}">${e.active ? 'Desactivar' : 'Activar'}</button></td></tr>`).join('') || '<tr><td colspan="8" class="empty-state">No hay empleados registrados.</td></tr>';
	$('#vetsTable').innerHTML = data.vets.map((v) => `<tr><td><strong>${v.name}</strong></td><td>${v.license}</td><td>${v.specialty || '—'}</td><td>${v.phone || '—'}</td><td><span class="status ${v.active ? 'activo' : 'inactivo'}">${v.active ? 'Activo' : 'Inactivo'}</span></td><td><button class="row-menu" data-edit-vet="${v.id}">Editar</button> <button class="row-menu" data-toggle-vet="${v.id}">${v.active ? 'Desactivar' : 'Activar'}</button></td></tr>`).join('') || '<tr><td colspan="6" class="empty-state">No hay veterinarios registrados.</td></tr>';
	$('#usersTable').innerHTML = data.users.map((u) => `<tr><td><strong>${u.username}</strong></td><td>${u.name}</td><td>${u.role}</td><td><span class="status ${u.active ? 'activo' : 'inactivo'}">${u.active ? 'Activo' : 'Inactivo'}</span></td><td><button class="row-menu" data-edit-user="${u.id}">Editar</button> <button class="row-menu" data-toggle-user="${u.id}">${u.active ? 'Desactivar' : 'Activar'}</button></td></tr>`).join('') || '<tr><td colspan="5" class="empty-state">No hay usuarios registrados.</td></tr>';
}

function renderPets(filter = '') {
	const term = filter.toLowerCase();
	const rows = data.pets.filter((pet) => `${pet.name} ${pet.breed} ${pet.color || ''} ${clientName(pet.clientId)}`.toLowerCase().includes(term));
	$('#petsTable').innerHTML = rows.map((pet) => {
		const client = clientById(pet.clientId);
		return `<tr><td><div class="table-pet"><span class="pet-avatar ${pet.badge || 'teal'}">${petInitial(pet.name)}</span><strong>${pet.name}</strong></div></td><td>${pet.species}<small class="cell-sub">${pet.breed}</small></td><td>${pet.sex}<small class="cell-sub">${pet.age} ${pet.age == 1 ? 'año' : 'años'}</small></td><td>${pet.weight} kg</td><td>${pet.color || '—'}${pet.notes ? `<small class="cell-sub">${pet.notes}</small>` : ''}</td><td>${clientName(pet.clientId)}</td><td><button class="row-menu view-btn" data-view-pet="${pet.id}">Ver</button> <button class="row-menu edit-btn" data-edit-pet="${pet.id}">Editar</button> <button class="row-menu admin-only" data-delete-pet="${pet.id}">Eliminar</button></td></tr>`;
	}).join('') || '<tr><td colspan="7" class="empty-state">No encontramos mascotas.</td></tr>';
}

function openPetDetail(petId) {
	const pet = data.pets.find((p) => p.id === Number(petId));
	if (!pet) return;
	const client = clientById(pet.clientId);
	const consults = data.consultations.filter((c) => c.pet === pet.name);
	const vaccs = data.vaccines.filter((v) => v.pet === pet.name);
	const docs = pet.documents || [];
	$('#petDetailBody').innerHTML = `
		<div class="detail-section"><h3>Datos de la mascota</h3><div class="detail-grid">
			<div class="detail-item"><strong>Nombre</strong><span>${pet.name}</span></div>
			<div class="detail-item"><strong>Especie / raza</strong><span>${pet.species} · ${pet.breed}</span></div>
			<div class="detail-item"><strong>Sexo / edad</strong><span>${pet.sex} · ${pet.age} ${pet.age == 1 ? 'año' : 'años'}</span></div>
			<div class="detail-item"><strong>Peso</strong><span>${pet.weight} kg</span></div>
			<div class="detail-item"><strong>Color</strong><span>${pet.color || '—'}</span></div>
			<div class="detail-item"><strong>Observaciones</strong><span>${pet.notes || '—'}</span></div>
		</div></div>
		<div class="detail-section"><h3>Documentos y Exámenes Adjuntos</h3>
			${docs.length ? docs.map((d, idx) => `<div class="document-item"><a href="${d.url}" download="${d.name}" target="_blank">📄 ${d.name}</a><button class="row-menu" data-remove-doc="${pet.id}" data-doc-index="${idx}">Eliminar</button></div>`).join('') : '<p class="empty-note">No hay documentos o exámenes adjuntos.</p>'}
		</div>
		<div class="detail-section"><h3>Propietario</h3><div class="detail-grid">
			<div class="detail-item"><strong>Nombre</strong><span>${clientName(pet.clientId)}</span></div>
			<div class="detail-item"><strong>Documento</strong><span>${client ? client.document : '—'}</span></div>
			<div class="detail-item"><strong>Teléfono</strong><span>${client?.phone || '—'}</span></div>
			<div class="detail-item"><strong>Correo</strong><span>${client?.email || '—'}</span></div>
		</div></div>
		<div class="detail-section"><h3>Historial clínico</h3>
			<div class="toolbar history-filters">
				<select id="phType"><option value="Todos">Todos los tipos</option>${[...serviceCategories, 'Vacunación'].map((t) => `<option>${t}</option>`).join('')}</select>
				<input id="phFrom" type="date" title="Desde"><input id="phTo" type="date" title="Hasta">
			</div>
			<div id="petHistoryBody" data-pet="${pet.id}"></div>
		</div>`;
	renderPetHistory(pet.id);
	openModal('#petDetailModal');
}

function renderPetHistory(petId) {
	const pet = data.pets.find((p) => p.id === Number(petId)); if (!pet) return;
	const type = $('#phType')?.value || 'Todos', from = $('#phFrom')?.value || '', to = $('#phTo')?.value || '';
	const cat = (name) => data.services.find((s) => s.name === name)?.category || 'Otro';
	const hideClinical = currentUser?.role === 'Secretaria';
	const items = [
		...data.consultations.filter((c) => c.pet === pet.name).map((c) => ({ date: c.date, type: cat(c.service), time: c.time, title: `${c.service} · ${c.vet || 'Sin veterinario'}`, status: c.status, detail: hideClinical ? '' : [c.motivo && `Motivo: ${c.motivo}`, c.diagnostico && `Diagnóstico: ${c.diagnostico}`, c.medicamentos && `Medicamentos: ${c.medicamentos}`, c.recomendaciones && `Recomendaciones: ${c.recomendaciones}`].filter(Boolean).join(' · '), docs: c.documents || [] })),
		...data.surgeries.filter((s) => s.pet === pet.name).map((s) => ({ date: s.date, type: 'Cirugía', time: s.time, title: `${s.procedure} · ${s.vet}`, status: s.status, detail: '', docs: [] })),
		...data.stays.filter((s) => s.pet === pet.name).map((s) => ({ date: s.checkIn.slice(0, 10), type: 'Guardería', time: s.checkIn.slice(11), title: `Estancia de ${stayHours(s)} h`, status: s.status, detail: '', docs: [] })),
		...data.vaccines.filter((v) => v.pet === pet.name).map((v) => ({ date: v.date, type: 'Vacunación', time: '', title: `${v.vaccine}${v.dose ? ` (${v.dose})` : ''} · ${v.vet}`, status: v.nextDate ? `Próxima: ${formatDate(v.nextDate)}` : '', detail: '', docs: [] }))
	].filter((i) => (type === 'Todos' || i.type === type) && (!from || i.date >= from) && (!to || i.date <= to)).sort((a, b) => b.date.localeCompare(a.date));
	$('#petHistoryBody').innerHTML = items.map((i) => `<div class="history-row"><div class="history-main"><strong>${formatDate(i.date)}${i.time ? ` · ${i.time}` : ''}</strong> — <em>${i.type}</em> · ${i.title} ${i.status ? `<small>(${i.status})</small>` : ''}${i.detail ? `<small class="cell-sub">${i.detail}</small>` : ''}${i.docs.map((d) => ` <a href="${d.url}" download="${d.name}">📎 ${d.name}</a>`).join('')}</div></div>`).join('') || '<p class="empty-note">Sin registros para el filtro seleccionado.</p>';
}
document.addEventListener('change', (e) => { if (e.target.matches('#phType, #phFrom, #phTo')) renderPetHistory($('#petHistoryBody').dataset.pet); });

// RF-31: lectura real de archivos adjuntos (máx. 1.5 MB c/u por el límite de localStorage)
const MAX_FILE = 1.5 * 1024 * 1024;
function readFiles(input) {
	const files = [...(input?.files || [])];
	return Promise.all(files.map((f) => new Promise((resolve) => {
		if (f.size > MAX_FILE) { showToast(`"${f.name}" supera 1.5 MB y no se adjuntó`); return resolve(null); }
		const r = new FileReader(); r.onload = () => resolve({ name: f.name, url: r.result }); r.onerror = () => resolve(null); r.readAsDataURL(f);
	}))).then((list) => list.filter(Boolean));
}

function renderConsultations() {
	const vetFilter = $('#agendaVetFilter')?.value || 'Todos';
	const dateFilter = $('#agendaDateFilter')?.value || '';
	const serviceFilter = $('#agendaServiceFilter')?.value || 'Todos';
	const fromFilter = $('#agendaFromFilter')?.value || '';
	const toFilter = $('#agendaToFilter')?.value || '';
	let consultations = selectedConsultationStatus === 'Todas' ? data.consultations : data.consultations.filter((item) => item.status === selectedConsultationStatus);
	if (vetFilter !== 'Todos') consultations = consultations.filter((item) => item.vet === vetFilter);
	if (dateFilter) consultations = consultations.filter((item) => item.date === dateFilter);
	if (serviceFilter !== 'Todos') consultations = consultations.filter((item) => item.service === serviceFilter);
	if (fromFilter) consultations = consultations.filter((item) => item.date >= fromFilter);
	if (toFilter) consultations = consultations.filter((item) => item.date <= toFilter);
	$('#appointmentList').innerHTML = consultations.map((item) => `
		<article class="appointment-card">
			<div class="appointment-date"><strong>${new Date(`${item.date}T12:00:00`).getDate()}</strong><small>${new Date(`${item.date}T12:00:00`).toLocaleDateString('es-ES', { month: 'short' })}</small></div>
			<div class="appointment-main">
				<div><h3>${item.service}</h3><p><span class="pet-dot"></span>${item.pet} · ${item.time}${item.vet ? ` · ${item.vet}` : ''}</p></div>
				<span class="status ${item.status.toLowerCase().replace(' ', '-')}">${item.status}</span>
			</div>
			<div class="appointment-meta">
				<span>${item.payment}</span>
				<button class="row-menu edit-btn" data-edit-consult="${item.id}">Editar</button>
				${item.status !== 'Cancelado' ? `<button class="row-menu cancel-btn" data-cancel-consult="${item.id}">Cancelar</button>` : ''}
				${item.status !== 'Cancelado' ? `<button class="row-menu pay-btn no-vet" data-pay-consult="${item.id}">Pagar</button>` : ''}
				<button class="row-menu admin-only" data-delete-consult="${item.id}">Eliminar</button>
			</div>
		</article>`).join('') || '<div class="empty-state">No hay consultas.</div>';
}

function renderServices() {
	const canManage = currentUser?.role === 'Administrador';
	$('#servicesGrid').innerHTML = data.services.map((service) => `
		<article class="service-card ${service.active ? '' : 'unavailable'}">
			<div class="service-card-top"><span class="service-category">${service.category}</span><span class="status ${service.active ? 'available' : 'no-disponible'}">${service.active ? 'Disponible' : 'No disponible'}</span></div>
			<h3>${service.name}</h3><p>${service.description}</p>
			<div class="service-price"><strong>$${service.price.toLocaleString('es-ES')}</strong><small>por atención · ${service.duration} min</small></div>
			<div class="service-actions">
				${service.active ? `<button class="outline-button" data-modal="consultModal" data-service="${service.name}">Agendar servicio</button>` : ''}
				${canManage ? `<button class="row-menu edit-btn" data-edit-service="${service.id}">Editar servicio</button>` : ''}
			</div>
		</article>`).join('') || '<div class="empty-state">No hay servicios.</div>';
}

function renderVaccines() {
	const petFilter = $('#vaccinePetFilter')?.value || 'Todas';
	const rows = petFilter === 'Todas' ? data.vaccines : data.vaccines.filter((item) => item.pet === petFilter);
	$('#vaccinesTable').innerHTML = rows.map((item) => `<tr><td><div class="table-pet"><span class="pet-avatar lavender">${petInitial(item.pet)}</span><strong>${item.pet}</strong></div></td><td>${item.vaccine}</td><td>${item.dose || '—'}</td><td>${formatDate(item.date)}</td><td>${formatDate(item.nextDate)}</td><td>${item.vet}</td><td><button class="row-menu admin-only" data-delete-vaccine="${item.id}">Eliminar</button></td></tr>`).join('') || '<tr><td colspan="7" class="empty-state">No hay vacunas.</td></tr>';
}

function renderPayments() {
	$('#paymentsTable').innerHTML = data.payments.map((p) => {
		const c = data.consultations.find((x) => x.id === p.consultId);
		const concepts = p.concepts.map((x) => `${x.desc} ($${x.value})`).join(', ');
		return `<tr><td>${formatDate(p.date)}</td><td>${c ? c.service : '—'}</td><td>${c ? c.pet : '—'}</td><td>${concepts}</td><td>${p.method}</td><td><strong>$${p.total.toLocaleString('es-ES')}</strong></td><td><button class="row-menu edit-btn" data-receipt-payment="${p.id}">Comprobante</button> <button class="row-menu admin-only" data-delete-payment="${p.id}">Eliminar</button></td></tr>`;
	}).join('') || '<tr><td colspan="7" class="empty-state">No hay pagos.</td></tr>';
	$('#paymentsTotal').textContent = `$${data.payments.reduce((t, p) => t + p.total, 0).toLocaleString('es-ES')}`;
}

// RF-45: Generar comprobante con cliente, mascota y servicio cobrado
function openReceipt(paymentId) {
	const p = data.payments.find((x) => x.id === paymentId);
	if (!p) return;
	const c = data.consultations.find((x) => x.id === p.consultId);
	const pet = c ? data.pets.find((pet) => pet.name === c.pet) : null;
	const client = pet ? clientById(pet.clientId) : null;
	$('#receiptBody').innerHTML = `
		<div class="receipt-head">
			<div class="brand"><span>Veterinaria</span><span class="brand-dot">.</span></div>
			<small>Comprobante de pago · N.º ${String(p.id).padStart(6, '0')}</small>
		</div>
		<div class="receipt-row"><span>Fecha</span><strong>${formatDate(p.date)}</strong></div>
		<div class="receipt-row"><span>Cliente</span><strong>${client ? `${client.firstName} ${client.lastName}` : '—'}</strong></div>
		<div class="receipt-row"><span>Documento</span><strong>${client ? client.document : '—'}</strong></div>
		<div class="receipt-row"><span>Mascota</span><strong>${c ? c.pet : '—'}</strong></div>
		<div class="receipt-row"><span>Servicio</span><strong>${c ? c.service : '—'}</strong></div>
		<div class="receipt-row"><span>Método de pago</span><strong>${p.method}</strong></div>
		${p.concepts.map((x) => `<div class="receipt-row"><span>${x.desc}</span><span>$${x.value.toLocaleString('es-ES')}</span></div>`).join('')}
		<div class="receipt-total"><span>TOTAL</span><strong>$${p.total.toLocaleString('es-ES')}</strong></div>`;
	openModal('#receiptModal');
}

const ownerPhone = (petName) => { const p = data.pets.find((x) => x.name === petName); return clientById(p?.clientId)?.phone || ''; };
const notifyBtn = (petName, text) => { const ph = ownerPhone(petName); return ph ? `<a class="row-menu edit-btn" href="https://wa.me/57${ph}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">Avisar</a>` : ''; };
function renderReminders() {
	if (!data.notifications) { $('#remindersList').innerHTML = '<div class="empty-state">Recordatorios desactivados en Configuración.</div>'; return; }
	const today = new Date(`${todayStr()}T00:00:00`); const limit = new Date(today); limit.setDate(limit.getDate() + 30);
	const due = (d) => d && new Date(`${d}T00:00:00`) <= limit;
	const late = (d) => new Date(`${d}T00:00:00`) < today;
	const row = (pet, cls, title, sub, tag, action = '') => `<div class="reminder-row"><span class="pet-avatar small ${cls}">${petInitial(pet)}</span><div class="schedule-details"><strong>${title}</strong><small>${sub}</small></div>${tag}${action}</div>`;
	const stays = data.stays.filter((s) => s.status === 'Activa').map((s) => row(s.pet, 'yellow', `${s.pet} · Guardería activa`, `Ingresó: ${formatDate(s.checkIn.slice(0, 10))} ${s.checkIn.slice(11)}`, '', `<button class="row-menu edit-btn" data-checkout-stay="${s.id}">Salida</button>`));
	const vacs = data.vaccines.filter((v) => due(v.nextDate)).map((v) => row(v.pet, 'lavender', `${v.pet} · ${v.vaccine}`, `${late(v.nextDate) ? 'Venció' : 'Próxima dosis'}: ${formatDate(v.nextDate)} · ${v.vet}`, `<span class="trend ${late(v.nextDate) ? 'overdue' : 'neutral'}">${late(v.nextDate) ? 'Vencida' : 'Vacuna'}</span>`, notifyBtn(v.pet, `Hola, le recordamos la próxima dosis de ${v.vaccine} de ${v.pet} (${v.nextDate}).`)));
	const checks = data.consultations.filter((c) => c.status !== 'Cancelado' && due(c.nextCheckup)).map((c) => row(c.pet, 'teal', `${c.pet} · Chequeo`, `${late(c.nextCheckup) ? 'Venció' : 'Programado'}: ${formatDate(c.nextCheckup)} · ${c.vet}`, `<span class="trend ${late(c.nextCheckup) ? 'overdue' : 'neutral'}">Chequeo</span>`, notifyBtn(c.pet, `Hola, le recordamos el chequeo de ${c.pet} programado para ${c.nextCheckup}.`)));
	$('#remindersList').innerHTML = [...stays, ...vacs, ...checks].join('') || '<div class="empty-state">Sin recordatorios próximos.</div>';
}

// RF-46 / RF-48: Reporte de ingresos por período y servicios más solicitados
function renderReports() {
	const from = $('#reportFromFilter').value || '0000-01-01';
	const to = $('#reportToFilter').value || '9999-12-31';
	const pays = data.payments.filter((p) => p.date >= from && p.date <= to);
	const total = pays.reduce((t, p) => t + p.total, 0);
	$('#reportIncome').textContent = `$${total.toLocaleString('es-ES')}`;
	$('#reportPaymentsCount').textContent = pays.length;
	$('#reportAvgTicket').textContent = pays.length ? `$${Math.round(total / pays.length).toLocaleString('es-ES')}` : '$0';

	const consults = data.consultations.filter((c) => c.date >= from && c.date <= to && c.status !== 'Cancelado');
	$('#reportServicesCount').textContent = consults.length;

	$('#reportIncomeTable').innerHTML = pays.slice().reverse().map((p) => {
		const c = data.consultations.find((x) => x.id === p.consultId);
		return `<tr><td>${formatDate(p.date)}</td><td>${c ? c.pet : '—'}</td><td>${c ? c.service : '—'}</td><td>${p.method}</td><td><strong>$${p.total.toLocaleString('es-ES')}</strong></td></tr>`;
	}).join('') || '<tr><td colspan="5" class="empty-state">No hay ingresos en el período seleccionado.</td></tr>';

	const counts = {};
	consults.forEach((c) => { counts[c.service] = (counts[c.service] || 0) + 1; });
	data.surgeries.filter((s) => s.date >= from && s.date <= to).forEach(() => { counts['Cirugía'] = (counts['Cirugía'] || 0) + 1; });
	data.stays.filter((s) => s.checkIn.slice(0, 10) >= from && s.checkIn.slice(0, 10) <= to).forEach(() => { counts['Guardería'] = (counts['Guardería'] || 0) + 1; });
	const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
	const max = sorted.length ? sorted[0][1] : 1;
	$('#reportTopServices').innerHTML = sorted.map(([name, count]) => `
		<div class="report-bar-row">
			<div class="report-bar-label"><strong>${name}</strong><small>${count} atención(es)</small></div>
			<div class="report-bar-track"><i style="width:${Math.round((count / max) * 100)}%"></i></div>
		</div>`).join('') || '<div class="empty-state">Sin datos en el período.</div>';

	// RF-49: motivos de consulta más recurrentes
	const reasons = {};
	consults.forEach((c) => { const m = (c.motivo || '').trim().replace(/\s+/g, ' '); if (!m) return; const k = m.toLowerCase(); reasons[k] = reasons[k] || { label: m, n: 0 }; reasons[k].n++; });
	const rs = Object.values(reasons).sort((a, b) => b.n - a.n).slice(0, 10);
	$('#reportTopReasons').innerHTML = rs.map((r) => `<div class="report-bar-row"><div class="report-bar-label"><strong>${r.label}</strong><small>${r.n} consulta(s)</small></div><div class="report-bar-track"><i style="width:${Math.round((r.n / rs[0].n) * 100)}%"></i></div></div>`).join('') || '<div class="empty-state">Sin motivos registrados en el período.</div>';
	// RF-50: compensaciones por veterinario
	const comp = {};
	data.surgeries.filter((s) => s.status === 'Finalizada' && s.date >= from && s.date <= to).forEach((s) => { const e = comp[s.vet] = comp[s.vet] || { n: 0, cost: 0, pay: 0 }; e.n++; e.cost += s.cost; e.pay += surgeryComp(s); });
	const money = (v) => `$${v.toLocaleString('es-ES')}`;
	$('#reportCompTable').innerHTML = Object.entries(comp).map(([vet, e]) => `<tr><td>${vet}</td><td>${e.n}</td><td>${money(e.cost)}</td><td><strong>${money(e.pay)}</strong></td></tr>`).join('') || '<tr><td colspan="4" class="empty-state">Sin cirugías finalizadas en el período.</td></tr>';
	$('#reportCompTotal').textContent = money(Object.values(comp).reduce((t, e) => t + e.pay, 0));
	$('#reportDailySummary').textContent = $('#dailySummaryText').textContent;
}

function stayHours(stay) {
	const start = new Date(stay.checkIn);
	const end = stay.checkOut ? new Date(stay.checkOut) : new Date();
	return Math.max(0, Math.round(((end - start) / 3600000) * 100) / 100);
}
function stayValue(stay) { return Math.round(stayHours(stay) * (stay.rate || 0)); }

function renderStays() {
	const total = data.stays.reduce((t, s) => t + stayValue(s), 0);
	$('#staysTotal').textContent = `$${total.toLocaleString('es-ES')}`;
	$('#staysTable').innerHTML = data.stays.map((stay) => `<tr><td><strong>${stay.pet}</strong></td><td>${formatDate(stay.checkIn.slice(0, 10))} · ${stay.checkIn.slice(11)}</td><td>${stay.checkOut ? `${formatDate(stay.checkOut.slice(0, 10))} · ${stay.checkOut.slice(11)}` : '—'}</td><td>${stayHours(stay)} h</td><td>$${(stay.rate || 0).toLocaleString('es-ES')}/h</td><td><strong>$${stayValue(stay).toLocaleString('es-ES')}</strong></td><td><span class="status ${stay.status === 'Activa' ? 'en-curso' : 'finalizado'}">${stay.status}</span></td><td>${stay.status === 'Activa' ? `<button class="row-menu edit-btn" data-checkout-stay="${stay.id}">Registrar salida</button>` : ''} <button class="row-menu admin-only" data-delete-stay="${stay.id}">Eliminar</button></td></tr>`).join('') || '<tr><td colspan="8" class="empty-state">No hay estancias registradas.</td></tr>';
}

function surgeryComp(surgery) { return surgery.status === 'Finalizada' ? Math.round(surgery.cost * 0.35) : 0; }

function renderSurgeries() {
	const totalComp = data.surgeries.reduce((t, s) => t + surgeryComp(s), 0);
	$('#surgeryCompTotal').textContent = `$${totalComp.toLocaleString('es-ES')}`;
	$('#surgeriesTable').innerHTML = data.surgeries.map((sg) => `
		<tr>
			<td><strong>${sg.pet}</strong></td>
			<td>${sg.vet}</td>
			<td>${sg.procedure}</td>
			<td>${formatDate(sg.date)} · ${sg.time || '08:00'}</td>
			<td>$${sg.cost.toLocaleString('es-ES')}</td>
			<td><span class="status ${sg.status === 'Finalizada' ? 'finalizado' : 'programado'}">${sg.status}</span></td>
			<td><strong>$${surgeryComp(sg).toLocaleString('es-ES')}</strong></td>
			<td>
				${sg.status !== 'Finalizada' ? `<button class="row-menu edit-btn" data-edit-surgery="${sg.id}">Editar</button>` : ''}
				${sg.status !== 'Finalizada' ? `<button class="row-menu edit-btn" data-finish-surgery="${sg.id}">Finalizar</button>` : ''}
				<button class="row-menu admin-only" data-delete-surgery="${sg.id}">Eliminar</button>
			</td>
		</tr>`).join('') || '<tr><td colspan="8" class="empty-state">No hay cirugías registradas.</td></tr>';
}

// RF-42: Alerta cuando existencias <= stock mínimo
function renderMovements() {
	$('#movementsTable').innerHTML = data.movements.slice(-15).reverse().map((m) => `<tr><td>${m.date}</td><td>${m.name}</td><td><span class="status ${m.type === 'Entrada' ? 'activo' : 'inactivo'}">${m.type}</span></td><td>${m.quantity}</td><td>${m.balance}</td></tr>`).join('') || '<tr><td colspan="5" class="empty-state">Aún no hay movimientos.</td></tr>';
}
function renderProducts() {
	renderMovements();
	const lowCount = data.products.filter((p) => p.quantity <= p.minStock).length;
	$('#lowStockCount').textContent = `${lowCount} producto${lowCount === 1 ? '' : 's'} en alerta de stock mínimo`;
	$('#productsTable').innerHTML = data.products.map((p) => {
		const low = p.quantity <= p.minStock;
		return `<tr><td><strong>${p.name}</strong></td><td>${p.category}</td><td class="${low ? 'low-stock' : ''}">${p.quantity}${low ? ' · Stock bajo' : ''}</td><td>${p.minStock}</td><td>$${p.cost.toLocaleString('es-ES')}</td><td>$${(p.quantity * p.cost).toLocaleString('es-ES')}</td><td><button class="row-menu edit-btn" data-movement-product="${p.id}" data-type="Entrada">Entrada</button> <button class="row-menu" data-movement-product="${p.id}" data-type="Salida">Salida</button> <button class="row-menu" data-edit-product="${p.id}">Editar</button> <button class="row-menu admin-only" data-delete-product="${p.id}">Eliminar</button></td></tr>`;
	}).join('') || '<tr><td colspan="7" class="empty-state">No hay productos registrados.</td></tr>';
}

function fillPetOptions() {
	const activeClients = data.clients.filter((c) => c.active);
	$('#petClient').innerHTML = activeClients.length ? activeClients.map((c) => `<option value="${c.id}">${c.firstName} ${c.lastName} · ${c.document}</option>`).join('') : '<option value="">Registra un cliente</option>';
	['#consultPet', '#vaccinePet'].forEach((selector) => { $(selector).innerHTML = data.pets.map((pet) => `<option>${pet.name}</option>`).join(''); });
	['#stayPet', '#surgeryPet'].forEach((selector) => { $(selector).innerHTML = data.pets.map((pet) => `<option>${pet.name}</option>`).join(''); });
	$('#consultService').innerHTML = activeServices().map((service) => `<option>${service.name}</option>`).join('');
	$('#agendaServiceFilter').innerHTML = '<option value="Todos">Todos los servicios</option>' + data.services.map((service) => `<option>${service.name}</option>`).join('');
	const activeVets = data.vets.filter((v) => v.active);
	const vetOptions = activeVets.length ? activeVets.map((v) => `<option>${v.name}</option>`).join('') : '<option value="">Registra un veterinario</option>';
	['#consultVet', '#editConsultVet', '#vaccineVet', '#surgeryVet'].forEach((selector) => { $(selector).innerHTML = vetOptions; });
	$('#agendaVetFilter').innerHTML = '<option value="Todos">Todos los veterinarios</option>' + data.vets.filter((v) => v.active).map((v) => `<option>${v.name}</option>`).join('');
	$('#vaccinePetFilter').innerHTML = '<option value="Todas">Todas las mascotas</option>' + data.pets.map((p) => `<option>${p.name}</option>`).join('');
	$('#serviceCategory').innerHTML = serviceCategories.map((c) => `<option>${c}</option>`).join('');
	$('#employeePosition').innerHTML = employeePositions.map((p) => `<option>${p}</option>`).join('');
	$('#productCategory').innerHTML = productCategories.map((c) => `<option>${c}</option>`).join('');
	const payable = data.consultations.filter((c) => c.status !== 'Cancelado');
	$('#paymentConsult').innerHTML = payable.length ? payable.map((c) => `<option value="${c.id}">${c.pet} · ${c.service} · ${c.date} ${c.time}</option>`).join('') : '<option value="">No hay consultas por pagar</option>';
}

function openModal(id) {
	$(id).classList.add('open');
	fillPetOptions();
	if (id === '#surgeryModal') {
		const form = $('#surgeryForm');
		if (!form.elements['id'].value) {
			form.reset();
			form.elements['id'].value = '';
			form.elements['time'].value = '08:00';
		}
	}
}
function closeModals() {
	document.querySelectorAll('.modal-backdrop').forEach((modal) => modal.classList.remove('open'));
	editingPetId = editingClientId = editingVetId = editingUserId = editingServiceId = editingEmployeeId = editingProductId = editingStayId = editingSurgeryId = null;
	document.querySelectorAll('.modal form').forEach((f) => f.reset());
	$('#conceptRows').innerHTML = '';
}

function addConceptRow(desc = '', value = '') {
	const row = document.createElement('div');
	row.className = 'concept-row';
	row.innerHTML = `<input class="concept-desc" placeholder="Concepto" value="${desc}"><input class="concept-value" type="number" min="0" step="0.01" placeholder="Valor" value="${value}"><button type="button" class="row-menu" data-remove-concept>Quitar</button>`;
	$('#conceptRows').appendChild(row);
	updatePaymentTotal();
}
function updatePaymentTotal() {
	const total = [...document.querySelectorAll('#conceptRows .concept-value')].reduce((t, input) => t + (Number(input.value) || 0), 0);
	$('#paymentTotal').textContent = `$${total.toLocaleString('es-ES')}`;
}
function buildConceptsFromConsult(consultId) {
	$('#conceptRows').innerHTML = '';
	const consult = data.consultations.find((c) => c.id === Number(consultId));
	if (consult) addConceptRow(consult.service, servicePrice(consult.service));
	else updatePaymentTotal();
}

document.addEventListener('click', (event) => {
	if (event.target.closest('.admin-only') && currentUser?.role !== 'Administrador') { showToast('Acción reservada al Administrador'); return; }
	const nav = event.target.closest('[data-view]'); if (nav) switchView(nav.dataset.view, nav.dataset.label || nav.textContent.trim());
	const modalTrigger = event.target.closest('[data-modal]'); if (modalTrigger) { openModal(`#${modalTrigger.dataset.modal}`); if (modalTrigger.dataset.modal === 'paymentModal') { $('#paymentForm').elements.date.value = todayStr(); buildConceptsFromConsult($('#paymentConsult').value); } if (modalTrigger.dataset.service) $('#consultService').value = modalTrigger.dataset.service; }
	const statusTab = event.target.closest('[data-status]'); if (statusTab) { selectedConsultationStatus = statusTab.dataset.status; document.querySelectorAll('[data-status]').forEach((tab) => tab.classList.toggle('active', tab === statusTab)); renderConsultations(); }
	if (event.target.closest('.modal-close, .modal-cancel')) closeModals();

	const editClient = event.target.closest('[data-edit-client]'); if (editClient) { const client = clientById(editClient.dataset.editClient); if (client) { editingClientId = client.id; const form = $('#clientForm'); Object.entries(client).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; }); openModal('#clientModal'); } }
	const toggleClient = event.target.closest('[data-toggle-client]'); if (toggleClient) { const client = clientById(toggleClient.dataset.toggleClient); if (client) { client.active = !client.active; save(); render(); showToast(client.active ? 'Cliente activado' : 'Cliente desactivado'); } }

	const editVet = event.target.closest('[data-edit-vet]'); if (editVet) { const vet = vetById(editVet.dataset.editVet); if (vet) { editingVetId = vet.id; const form = $('#vetForm'); Object.entries(vet).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; }); openModal('#vetModal'); } }
	const toggleVet = event.target.closest('[data-toggle-vet]'); if (toggleVet) { const vet = vetById(toggleVet.dataset.toggleVet); if (vet) { vet.active = !vet.active; save(); render(); showToast(vet.active ? 'Veterinario activado' : 'Veterinario desactivado'); } }

	const editEmployee = event.target.closest('[data-edit-employee]'); if (editEmployee) { const employee = employeeById(editEmployee.dataset.editEmployee); if (employee) { editingEmployeeId = employee.id; const form = $('#employeeForm'); Object.entries(employee).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; }); openModal('#employeeModal'); } }
	const toggleEmployee = event.target.closest('[data-toggle-employee]'); if (toggleEmployee) { const employee = employeeById(toggleEmployee.dataset.toggleEmployee); if (employee) { employee.active = !employee.active; save(); render(); showToast('Estado de empleado actualizado'); } }

	const editUser = event.target.closest('[data-edit-user]'); if (editUser) { const user = userById(editUser.dataset.editUser); if (user) { editingUserId = user.id; const form = $('#userForm'); Object.entries(user).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; }); openModal('#userModal'); } }
	const toggleUser = event.target.closest('[data-toggle-user]'); if (toggleUser) { const user = userById(toggleUser.dataset.toggleUser); if (user && user.id !== currentUser.id) { user.active = !user.active; save(); render(); showToast('Estado de usuario actualizado'); } }

	const editService = event.target.closest('[data-edit-service]'); if (editService) { const service = serviceById(editService.dataset.editService); if (service) { editingServiceId = service.id; const form = $('#serviceForm'); Object.entries(service).forEach(([k, v]) => { if (form.elements[k]) form.elements[k].value = v; }); form.elements['active'].checked = service.active; openModal('#serviceModal'); } }

	const viewPet = event.target.closest('[data-view-pet]'); if (viewPet) openPetDetail(viewPet.dataset.viewPet);
	const editPet = event.target.closest('[data-edit-pet]'); if (editPet) { const pet = data.pets.find((item) => item.id === Number(editPet.dataset.editPet)); if (pet) { editingPetId = pet.id; const form = $('#petForm'); openModal('#petModal'); const select = $('#petClient'); ensureSelectOption(select, pet.clientId, clientName(pet.clientId)); Object.entries(pet).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; }); select.value = pet.clientId; } }
	const deletePet = event.target.closest('[data-delete-pet]'); if (deletePet) { data.pets = data.pets.filter((pet) => pet.id !== Number(deletePet.dataset.deletePet)); save(); render(); showToast('Mascota eliminada'); }

	const removeDoc = event.target.closest('[data-remove-doc]');
	if (removeDoc) {
		const petId = Number(removeDoc.dataset.removeDoc);
		const docIdx = Number(removeDoc.dataset.docIndex);
		const pet = data.pets.find((p) => p.id === petId);
		if (pet && pet.documents) {
			pet.documents.splice(docIdx, 1);
			save();
			openPetDetail(petId);
			showToast('Documento eliminado');
		}
	}

	const editConsult = event.target.closest('[data-edit-consult]'); if (editConsult) { const consult = data.consultations.find((c) => c.id === Number(editConsult.dataset.editConsult)); if (consult) { const form = $('#editConsultForm'); openModal('#editConsultModal'); $('#editConsultPet').innerHTML = data.pets.map((pet) => `<option ${pet.name === consult.pet ? 'selected' : ''}>${pet.name}</option>`).join(''); $('#editConsultService').innerHTML = data.services.map((service) => `<option ${service.name === consult.service ? 'selected' : ''}>${service.name}</option>`).join(''); const vetSelect = $('#editConsultVet'); ensureSelectOption(vetSelect, consult.vet, consult.vet); form.elements['id'].value = consult.id; form.elements['date'].value = consult.date; form.elements['time'].value = consult.time; form.elements['status'].value = consult.status; form.elements['payment'].value = consult.payment; form.elements['motivo'].value = consult.motivo || ''; form.elements['diagnostico'].value = consult.diagnostico || ''; form.elements['medicamentos'].value = consult.medicamentos || ''; form.elements['recomendaciones'].value = consult.recomendaciones || ''; form.elements['notes'].value = consult.notes || ''; form.elements['nextCheckup'].value = consult.nextCheckup || ''; vetSelect.value = consult.vet || ''; form.elements['status'].innerHTML = ['Programado', 'En curso', 'Finalizado'].map((s) => `<option ${s === consult.status ? 'selected' : ''}>${s}</option>`).join('') + (consult.status === 'Cancelado' ? '<option selected>Cancelado</option>' : ''); } }
	const payConsult = event.target.closest('[data-pay-consult]'); if (payConsult) { openModal('#paymentModal'); $('#paymentForm').elements.date.value = todayStr(); $('#paymentConsult').value = payConsult.dataset.payConsult; buildConceptsFromConsult(payConsult.dataset.payConsult); }
	const cancelConsult = event.target.closest('[data-cancel-consult]'); if (cancelConsult) { const consult = data.consultations.find((c) => c.id === Number(cancelConsult.dataset.cancelConsult)); if (consult) { $('#cancelConsultForm').elements['id'].value = consult.id; $('#cancelSummary').textContent = `${consult.pet} · ${consult.service} · ${formatDate(consult.date)} ${consult.time}`; openModal('#cancelConsultModal'); } }
	const deleteConsult = event.target.closest('[data-delete-consult]'); if (deleteConsult) { data.consultations = data.consultations.filter((item) => item.id !== Number(deleteConsult.dataset.deleteConsult)); save(); render(); showToast('Consulta eliminada'); }
	const deleteVaccine = event.target.closest('[data-delete-vaccine]'); if (deleteVaccine) { data.vaccines = data.vaccines.filter((item) => item.id !== Number(deleteVaccine.dataset.deleteVaccine)); save(); render(); showToast('Vacuna eliminada'); }
	const deletePayment = event.target.closest('[data-delete-payment]'); if (deletePayment) { data.payments = data.payments.filter((item) => item.id !== Number(deletePayment.dataset.deletePayment)); save(); render(); showToast('Pago eliminado'); }

	// RF-45: abrir comprobante de pago
	const receiptPayment = event.target.closest('[data-receipt-payment]');
	if (receiptPayment) openReceipt(Number(receiptPayment.dataset.receiptPayment));

	const checkoutStay = event.target.closest('[data-checkout-stay]');
	if (checkoutStay) {
		const stay = data.stays.find((s) => s.id === Number(checkoutStay.dataset.checkoutStay));
		if (stay && stay.status === 'Activa') {
			stay.checkOut = new Date().toISOString().slice(0, 16);
			stay.status = 'Finalizada';
			save(); render();
			showToast(`Salida registrada · Valor de estancia: $${stayValue(stay).toLocaleString('es-ES')}`);
		}
	}
	const deleteStay = event.target.closest('[data-delete-stay]');
	if (deleteStay) { data.stays = data.stays.filter((s) => s.id !== Number(deleteStay.dataset.deleteStay)); save(); render(); showToast('Estancia eliminada'); }

	const editSurgery = event.target.closest('[data-edit-surgery]');
	if (editSurgery) {
		const surgery = data.surgeries.find((s) => s.id === Number(editSurgery.dataset.editSurgery));
		if (surgery) {
			const form = $('#surgeryForm');
			form.elements['id'].value = surgery.id;
			form.elements['pet'].value = surgery.pet;
			form.elements['vet'].value = surgery.vet;
			form.elements['date'].value = surgery.date;
			form.elements['time'].value = surgery.time || '08:00';
			form.elements['cost'].value = surgery.cost;
			form.elements['status'].value = surgery.status;
			form.elements['procedure'].value = surgery.procedure;
			openModal('#surgeryModal');
		}
	}

	const finishSurgery = event.target.closest('[data-finish-surgery]');
	if (finishSurgery) {
		const surgery = data.surgeries.find((s) => s.id === Number(finishSurgery.dataset.finishSurgery));
		if (surgery && surgery.status !== 'Finalizada') {
			surgery.status = 'Finalizada';
			save(); render();
			showToast(`Cirugía finalizada · Compensación veterinario (35%): $${surgeryComp(surgery).toLocaleString('es-ES')}`);
		}
	}
	const deleteSurgery = event.target.closest('[data-delete-surgery]');
	if (deleteSurgery) { data.surgeries = data.surgeries.filter((s) => s.id !== Number(deleteSurgery.dataset.deleteSurgery)); save(); render(); showToast('Cirugía eliminada'); }

	const movementProduct = event.target.closest('[data-movement-product]');
	if (movementProduct) {
		const product = data.products.find((p) => p.id === Number(movementProduct.dataset.movementProduct));
		if (product) {
			$('#movementForm').elements['productId'].value = product.id;
			$('#movementForm').elements['type'].value = movementProduct.dataset.type;
			$('#movementSummary').textContent = `${product.name} · Existencias actuales: ${product.quantity}`;
			openModal('#movementModal');
		}
	}
	const editProduct = event.target.closest('[data-edit-product]');
	if (editProduct) {
		const product = data.products.find((p) => p.id === Number(editProduct.dataset.editProduct));
		if (product) {
			editingProductId = product.id;
			const form = $('#productForm');
			Object.entries(product).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
			openModal('#productModal');
		}
	}
	const deleteProduct = event.target.closest('[data-delete-product]');
	if (deleteProduct) { data.products = data.products.filter((p) => p.id !== Number(deleteProduct.dataset.deleteProduct)); save(); render(); showToast('Producto eliminado'); }

	if (event.target.closest('#addConceptBtn')) addConceptRow();
	const removeConcept = event.target.closest('[data-remove-concept]'); if (removeConcept) { removeConcept.closest('.concept-row').remove(); updatePaymentTotal(); }
});

$('#loginForm').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	const user = data.users.find((u) => u.username === form.get('username') && u.password === form.get('password'));
	if (!user || !user.active) { $('#loginError').textContent = 'Credenciales incorrectas o usuario inactivo.'; return; }
	currentUser = user;
	sessionStorage.setItem(sessionKey, JSON.stringify({ userId: user.id }));
	$('#loginError').textContent = '';
	event.target.reset();
	enterApp();
	showToast(`Sesión iniciada como ${user.name}`);
});

$('#logoutBtn').addEventListener('click', logout);
$('#clientSearch').addEventListener('input', (event) => renderClients(event.target.value));
$('#petSearch').addEventListener('input', (event) => renderPets(event.target.value));
$('#agendaVetFilter').addEventListener('change', renderConsultations);
$('#agendaDateFilter').addEventListener('change', renderConsultations);
$('#vaccinePetFilter').addEventListener('change', renderVaccines);
$('#conceptRows').addEventListener('input', updatePaymentTotal);
$('#paymentConsult').addEventListener('change', (event) => buildConceptsFromConsult(event.target.value));

// RF-46 / RF-48: filtros de reportes
['#reportFromFilter', '#reportToFilter'].forEach((sel) => $(sel).addEventListener('change', renderReports));
$('#reportThisMonthBtn').addEventListener('click', () => {
	const now = new Date();
	$('#reportFromFilter').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
	$('#reportToFilter').value = todayStr();
	renderReports();
});
$('#printReceiptBtn').addEventListener('click', () => window.print());

$('#clientForm').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	const clientData = { document: form.get('document'), firstName: form.get('firstName'), lastName: form.get('lastName'), phone: form.get('phone'), email: form.get('email'), address: form.get('address') };
	if (data.clients.some((x) => x.document === clientData.document && x.id !== editingClientId)) { showToast('Ya existe un cliente con ese documento'); return; }
	if (editingClientId) { Object.assign(clientById(editingClientId), clientData); showToast('Cliente actualizado'); }
	else { data.clients.push({ id: Date.now(), ...clientData, active: true }); showToast('Cliente registrado'); }
	editingClientId = null; save(); render(); closeModals(); event.target.reset();
});

$('#vetForm').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	const vetData = { name: form.get('name'), license: form.get('license'), specialty: form.get('specialty'), phone: form.get('phone') };
	if (editingVetId) { Object.assign(vetById(editingVetId), vetData); showToast('Veterinario actualizado'); }
	else { data.vets.push({ id: Date.now(), ...vetData, active: true }); showToast('Veterinario registrado'); }
	editingVetId = null; save(); render(); closeModals(); event.target.reset();
});

$('#userForm').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	const userData = { username: form.get('username'), password: form.get('password'), name: form.get('name'), role: form.get('role') };
	if (data.users.some((x) => x.username === userData.username && x.id !== editingUserId)) { showToast('Ese nombre de usuario ya existe'); return; }
	if (editingUserId) { Object.assign(userById(editingUserId), userData); showToast('Usuario actualizado'); }
	else { data.users.push({ id: Date.now(), ...userData, active: true }); showToast('Usuario registrado'); }
	editingUserId = null; save(); render(); closeModals(); event.target.reset();
});

$('#employeeForm').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	const empData = { document: form.get('document'), name: form.get('name'), phone: form.get('phone'), email: form.get('email'), position: form.get('position'), hireDate: form.get('hireDate') };
	if (editingEmployeeId) { Object.assign(employeeById(editingEmployeeId), empData); showToast('Empleado actualizado'); }
	else { data.employees.push({ id: Date.now(), ...empData, active: true }); showToast('Empleado registrado'); }
	editingEmployeeId = null; save(); render(); closeModals(); event.target.reset();
});

$('#serviceForm').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	const sData = { name: form.get('name'), description: form.get('description'), price: Number(form.get('price')), duration: Number(form.get('duration')), category: form.get('category'), active: form.get('active') === 'on' };
	if (editingServiceId) { Object.assign(serviceById(editingServiceId), sData); showToast('Servicio actualizado'); }
	else { data.services.push({ id: Date.now(), ...sData }); showToast('Servicio registrado'); }
	editingServiceId = null; save(); render(); closeModals(); event.target.reset();
});

$('#petForm').addEventListener('submit', async (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	const clientId = form.get('clientId');
	if (!clientId) { showToast('Registra un cliente primero'); return; }

	const newDocs = await readFiles($('#petDocFile'));

	const petData = { clientId: Number(clientId), name: form.get('name'), species: form.get('species'), breed: form.get('breed'), sex: form.get('sex'), age: Number(form.get('age')), weight: Number(form.get('weight')), color: form.get('color'), notes: form.get('notes') };

	if (editingPetId) {
		const pet = data.pets.find((item) => item.id === editingPetId);
		const oldName = pet.name;
		Object.assign(pet, petData);
		if (oldName !== pet.name) ['consultations', 'vaccines', 'stays', 'surgeries'].forEach((k) => data[k].forEach((r) => { if (r.pet === oldName) r.pet = pet.name; }));
		if (newDocs.length) pet.documents = [...(pet.documents || []), ...newDocs];
		showToast('Mascota actualizada correctamente');
	} else {
		data.pets.push({ id: Date.now(), ...petData, badge: 'teal', documents: newDocs });
		showToast('Mascota registrada correctamente');
	}
	editingPetId = null; save(); render(); closeModals(); event.target.reset();
});

$('#consultForm').addEventListener('submit', async (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	const vet = form.get('vet'), date = form.get('date'), time = form.get('time');
	if (vetIsBusy(vet, date, time, serviceDuration(form.get('service')))) { showToast(`${vet} no está disponible: el servicio se cruza con otra atención programada.`); return; }
	data.consultations.push({ id: Date.now(), pet: form.get('pet'), service: form.get('service'), date, time, status: form.get('status'), payment: form.get('payment'), vet, motivo: form.get('motivo'), diagnostico: form.get('diagnostico'), medicamentos: form.get('medicamentos'), recomendaciones: form.get('recomendaciones'), notes: form.get('notes'), nextCheckup: form.get('nextCheckup') || '', documents: await readFiles(event.target.elements['docs']) });
	save(); render(); closeModals(); event.target.reset(); showToast('Consulta registrada');
});

$('#editConsultForm').addEventListener('submit', async (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	const consultId = Number(form.get('id'));
	const vet = form.get('vet'), date = form.get('date'), time = form.get('time');
	if (vetIsBusy(vet, date, time, serviceDuration(form.get('service')), consultId)) { showToast(`${vet} no está disponible en ese horario.`); return; }
	const idx = data.consultations.findIndex((c) => c.id === consultId);
	if (idx !== -1) {
		data.consultations[idx] = { ...data.consultations[idx], pet: form.get('pet'), service: form.get('service'), date: form.get('date'), time: form.get('time'), status: form.get('status'), payment: form.get('payment'), vet: form.get('vet'), motivo: form.get('motivo'), diagnostico: form.get('diagnostico'), medicamentos: form.get('medicamentos'), recomendaciones: form.get('recomendaciones'), notes: form.get('notes'), nextCheckup: form.get('nextCheckup') || '', documents: [...(data.consultations[idx].documents || []), ...(await readFiles(event.target.elements['docs']))] };
		save(); render(); closeModals(); showToast('Consulta actualizada');
	}
});

$('#vaccineForm').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	data.vaccines.push({ id: Date.now(), pet: form.get('pet'), vaccine: form.get('vaccine'), dose: form.get('dose'), date: form.get('date'), nextDate: form.get('nextDate'), vet: form.get('vet') });
	save(); render(); closeModals(); event.target.reset(); showToast('Vacuna registrada');
});

// RF-43 / RF-44: Registrar pago y calcular total según conceptos
$('#paymentForm').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	const consultId = Number(form.get('consult'));
	const concepts = [...document.querySelectorAll('#conceptRows .concept-row')].map((row) => ({ desc: row.querySelector('.concept-desc').value.trim() || 'Servicio', value: Number(row.querySelector('.concept-value').value) || 0 }));
	const total = concepts.reduce((t, c) => t + c.value, 0);
	data.payments.push({ id: Date.now(), consultId, date: form.get('date'), method: form.get('method'), concepts, total });
	save(); render(); closeModals(); event.target.reset(); $('#conceptRows').innerHTML = ''; $('#paymentTotal').textContent = '$0';
	showToast('Pago registrado');
});

$('#cancelConsultForm').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	const consult = data.consultations.find((c) => c.id === Number(form.get('id')));
	const motive = (form.get('motive') || '').trim();
	if (consult && motive) {
		consult.status = 'Cancelado';
		consult.cancelReason = motive;
		consult.notes = [consult.notes, `Motivo de cancelación: ${motive}`].filter(Boolean).join(' · ');
		save(); render(); closeModals(); event.target.reset();
		showToast('Servicio cancelado');
	}
});

$('#stayForm').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	data.stays.push({ id: Date.now(), pet: form.get('pet'), checkIn: form.get('checkIn'), checkOut: '', rate: Number(form.get('rate')) || 0, status: 'Activa' });
	save(); render(); closeModals(); event.target.reset();
	showToast('Estancia registrada');
});

$('#surgeryForm').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = event.target;
	const id = form.elements['id'].value;
	const vet = form.elements['vet'].value;
	const date = form.elements['date'].value;
	const time = form.elements['time'].value;

	if (vetIsBusySurgery(vet, date, time, 60, id ? Number(id) : null)) {
		showToast(`El veterinario ${vet} no está disponible: ya tiene una cirugía programada en ese horario.`);
		return;
	}

	const surgeryData = {
		pet: form.elements['pet'].value,
		vet: vet,
		date: date,
		time: time,
		cost: Number(form.elements['cost'].value) || 0,
		status: form.elements['status'].value,
		procedure: form.elements['procedure'].value
	};

	if (id) {
		const index = data.surgeries.findIndex((s) => s.id === Number(id));
		if (index !== -1) {
			data.surgeries[index] = { ...data.surgeries[index], ...surgeryData };
			showToast('Cirugía actualizada correctamente.');
		}
	} else {
		data.surgeries.push({ id: Date.now(), ...surgeryData });
		showToast('Cirugía programada exitosamente.');
	}

	save();
	render();
	closeModals();
	form.reset();
	form.elements['id'].value = '';
});

$('#productForm').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	const pData = { name: form.get('name'), category: form.get('category'), quantity: Number(form.get('quantity')) || 0, minStock: Number(form.get('minStock')) || 0, cost: Number(form.get('cost')) || 0 };
	if (editingProductId) { Object.assign(data.products.find((p) => p.id === editingProductId), pData); showToast('Producto actualizado'); }
	else { data.products.push({ id: Date.now(), ...pData }); showToast('Producto registrado'); }
	editingProductId = null; save(); render(); closeModals(); event.target.reset();
});

$('#movementForm').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = new FormData(event.target);
	const product = data.products.find((p) => p.id === Number(form.get('productId')));
	const qty = Number(form.get('quantity')) || 0;
	if (product && qty > 0) {
		const type = form.get('type');
		if (type === 'Salida' && qty > product.quantity) { showToast(`Stock insuficiente: solo hay ${product.quantity} unidades de ${product.name}`); return; }
		product.quantity += type === 'Entrada' ? qty : -qty;
		data.movements.push({ id: Date.now(), productId: product.id, name: product.name, type, quantity: qty, balance: product.quantity, date: new Date().toISOString().slice(0, 16).replace('T', ' ') });
		save(); render(); closeModals(); event.target.reset();
		showToast(`Movimiento registrado · ${product.name}: ${product.quantity} unidades`);
	}
});

$('#agendaServiceFilter').addEventListener('change', renderConsultations);
$('#agendaFromFilter').addEventListener('change', renderConsultations);
$('#agendaToFilter').addEventListener('change', renderConsultations);

save();
loadSession();
$('#notifToggle').checked = data.notifications;
$('#notifToggle').addEventListener('change', (e) => { data.notifications = e.target.checked; save(); renderReminders(); });
if (currentUser) enterApp();
else $('#loginScreen').classList.add('show');