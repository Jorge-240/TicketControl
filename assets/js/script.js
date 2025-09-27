// SISTEMA DE ALMACENAMIENTO LOCAL (localStorage)
class DataManager {
    static STORAGE_KEYS = {
        USERS: 'ticketSystem_users',
        TICKETS: 'ticketSystem_tickets',
        COUNTER: 'ticketSystem_counter'
    };

    static saveUsers(users) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
        } catch (error) {
            console.error('Error guardando usuarios:', error);
        }
    }

    static loadUsers() {
        try {
            const storedUsers = localStorage.getItem(this.STORAGE_KEYS.USERS);
            if (storedUsers) return JSON.parse(storedUsers);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        }

        const defaultUsers = {
            admin: { password: 'admin123', role: 'admin', fullName: 'Administrador Principal', email: 'admin@sistema.com' },
            usuario: { password: 'user123', role: 'user', fullName: 'Usuario de Prueba', email: 'usuario@test.com' }
        };
        this.saveUsers(defaultUsers);
        return defaultUsers;
    }

    static saveTickets(tickets) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
        } catch (error) {
            console.error('Error guardando tickets:', error);
        }
    }

    static loadTickets() {
        try {
            const storedTickets = localStorage.getItem(this.STORAGE_KEYS.TICKETS);
            if (storedTickets) return JSON.parse(storedTickets);
        } catch (error) {
            console.error('Error cargando tickets:', error);
        }

        const defaultTickets = [
            {
                id: 1001,
                clientName: 'Juan Pérez',
                clientEmail: 'juan.perez@email.com',
                clientPhone: '300-123-4567',
                issueType: 'tecnico',
                description: 'El equipo no enciende después del corte de luz',
                status: 'pendiente',
                date: '2025-08-20',
                createdBy: 'usuario'
            },
            {
                id: 1002,
                clientName: 'María García',
                clientEmail: 'maria.garcia@email.com',
                clientPhone: '300-987-6543',
                issueType: 'software',
                description: 'Error en la aplicación de contabilidad',
                status: 'completado',
                date: '2025-08-19',
                createdBy: 'usuario'
            }
        ];
        this.saveTickets(defaultTickets);
        return defaultTickets;
    }

    static saveCounter(counter) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.COUNTER, counter.toString());
        } catch (error) {
            console.error('Error guardando contador:', error);
        }
    }

    static loadCounter() {
        try {
            const storedCounter = localStorage.getItem(this.STORAGE_KEYS.COUNTER);
            if (storedCounter) return parseInt(storedCounter);
        } catch (error) {
            console.error('Error cargando contador:', error);
        }
        const defaultCounter = 1003;
        this.saveCounter(defaultCounter);
        return defaultCounter;
    }
}

// Datos en memoria
let users = DataManager.loadUsers();
let tickets = DataManager.loadTickets();
let ticketCounter = DataManager.loadCounter();
let currentUser = null;
let ticketsChart = null;

// Guardar datos
function saveAllData() {
    DataManager.saveUsers(users);
    DataManager.saveTickets(tickets);
    DataManager.saveCounter(ticketCounter);
}

// ------------------- Autenticación -------------------
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.toLowerCase();
    const password = document.getElementById('password').value;

    if (users[username] && users[username].password === password) {
        currentUser = {
            username,
            role: users[username].role,
            fullName: users[username].fullName,
            email: users[username].email
        };

        Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: `Hola ${currentUser.fullName}`,
            showConfirmButton: false,
            timer: 900
        }).then(() => {
            if (currentUser.role === 'admin') showAdminDashboard();
            else showUserInterface();
        });
    } else {
        Swal.fire({ icon: 'error', title: 'Error de acceso', text: 'Credenciales incorrectas' });
    }
});

// Register (igual comportamiento que antes)
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.toLowerCase();
    const fullName = document.getElementById('regFullName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
        Swal.fire({ icon: 'error', title: 'Error de validación', text: 'Las contraseñas no coinciden' });
        return;
    }
    if (users[username]) {
        Swal.fire({ icon: 'error', title: 'Usuario existente', text: 'Este nombre de usuario ya existe' });
        return;
    }
    if (password.length < 6) {
        Swal.fire({ icon: 'error', title: 'Contraseña débil', text: 'La contraseña debe tener al menos 6 caracteres' });
        return;
    }
    const emailExists = Object.values(users).some(user => user.email === email);
    if (emailExists) {
        Swal.fire({ icon: 'error', title: 'Email existente', text: 'Este correo electrónico ya está registrado' });
        return;
    }

    users[username] = { password, role: 'user', fullName, email };
    saveAllData();
    Swal.fire({ icon: 'success', title: '¡Cuenta creada!', text: 'Ya puedes iniciar sesión' });
    document.getElementById('registerForm').reset();
    showLoginForm();
});

// ------------------- Vistas -------------------
function showLoginForm() {
    document.getElementById('registerFormContainer').classList.add('hidden');
    document.getElementById('loginFormContainer').classList.remove('hidden');
}
function showRegisterForm() {
    document.getElementById('loginFormContainer').classList.add('hidden');
    document.getElementById('registerFormContainer').classList.remove('hidden');
}

// Mostrar dashboard admin
function showAdminDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('userInterface').classList.add('hidden');
    document.getElementById('usersManagement').classList.add('hidden');
    document.getElementById('casesManagement').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');

    document.getElementById('headerTitle').textContent = 'Panel de Administración';
    document.getElementById('headerSubtitle').textContent = 'Gestión de Solicitudes de Soporte';
    document.getElementById('adminFullName').textContent = currentUser?.fullName || 'Administrador';

    updateAdminStats();
    renderAdminTickets();
    // Delay para asegurar que el canvas esté visible antes de renderizar
    setTimeout(() => {
        renderChart();
    }, 100);
}

// Mostrar gestión usuarios
function showUsersManagement() {
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('usersManagement').classList.remove('hidden');
    renderUsersTable();
}

// Mostrar gestión de casos
function showCasesManagement() {
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('casesManagement').classList.remove('hidden');
    renderCasesTable();
}

// Mostrar interfaz usuario
function showUserInterface() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('userInterface').classList.remove('hidden');

    document.getElementById('headerTitle').textContent = 'Portal de Usuario';
    document.getElementById('headerSubtitle').textContent = 'Sistema de Solicitudes';
    document.getElementById('userFullName').textContent = currentUser.fullName;
    document.getElementById('userDisplayName').textContent = currentUser.fullName;
    document.getElementById('clientName').value = currentUser.fullName;
    document.getElementById('clientEmail').value = currentUser.email;

    renderUserTickets();
}

// ------------------- Estadísticas y Gráfico -------------------
function updateAdminStats() {
    const total = tickets.length;
    const pending = tickets.filter(t => t.status === 'pendiente').length;
    const completed = tickets.filter(t => t.status === 'completado').length;
    const rejected = tickets.filter(t => t.status === 'rechazado').length;
    const totalUsers = Object.keys(users).length;

    document.getElementById('totalTickets').textContent = total;
    document.getElementById('pendingTickets').textContent = pending;
    document.getElementById('completedTickets').textContent = completed;
    document.getElementById('rejectedTickets').textContent = rejected;
    document.getElementById('totalUsers').textContent = totalUsers;
}

// Chart.js: render tickets by status with custom colors and animations
function renderChart() {
    const canvas = document.getElementById('ticketsChart');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

    // Calcular estadísticas por estado
    const byStatus = { pendiente: 0, completado: 0, rechazado: 0 };
    tickets.forEach(t => {
        if (byStatus.hasOwnProperty(t.status)) {
            byStatus[t.status]++;
        }
    });

    const labels = ['Pendientes', 'Completados', 'Rechazados'];
    const values = [byStatus.pendiente, byStatus.completado, byStatus.rechazado];
    const colors = ['#FFA500', '#28a745', '#dc3545']; // naranja, verde, rojo

    // Destruir gráfico existente si existe
    if (ticketsChart) {
        ticketsChart.destroy();
        ticketsChart = null;
    }

    // Crear nuevo gráfico
    try {
        ticketsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1200
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                layout: {
                    padding: 10
                }
            }
        });

        console.log('Gráfico creado exitosamente');
    } catch (error) {
        console.error('Error creating chart:', error);
    }
}

// ------------------- Render tablas -------------------
function renderAdminTickets() {
    const tbody = document.getElementById('ticketsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    tickets.forEach(ticket => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${ticket.id}</td>
            <td>${ticket.clientName}</td>
            <td>${ticket.clientEmail}<br><small>${ticket.clientPhone}</small></td>
            <td>${getIssueTypeLabel(ticket.issueType)}</td>
            <td><span class="status-badge status-${ticket.status}">${getStatusLabel(ticket.status)}</span></td>
            <td>${ticket.date}</td>
            <td class="ticket-actions">
                ${ticket.status === 'pendiente' ? `
                    <button class="btn btn-success btn-sm" onclick="updateTicketStatus(${ticket.id}, 'completado')">Completar</button>
                    <button class="btn btn-danger btn-sm" onclick="updateTicketStatus(${ticket.id}, 'rechazado')">Rechazar</button>
                ` : ''}
                <button class="btn btn-warning btn-sm" onclick="viewTicketDetails(${ticket.id})">Ver</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTicket(${ticket.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Usuarios: render tabla con acciones editar / eliminar / cambiar rol
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    Object.entries(users).forEach(([username, u]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>@${username}</td>
            <td>${u.fullName || ''}</td>
            <td>${u.email || ''}</td>
            <td>${u.role || ''}</td>
            <td class="ticket-actions">
                <button class="btn btn-warning btn-sm" onclick="editUser('${username}')">Editar</button>
                <button class="btn btn-info btn-sm" onclick="changeUserRolePrompt('${username}')">Cambiar Rol</button>
                <button class="btn btn-danger btn-sm" onclick="deleteUserPrompt('${username}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Casos: render con filtros
function renderCasesTable() {
    const typeFilter = document.getElementById('filterIssueType')?.value || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    const search = document.getElementById('filterSearch')?.value.toLowerCase() || '';

    const tbody = document.getElementById('casesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    tickets.filter(t => {
        if (typeFilter && t.issueType !== typeFilter) return false;
        if (statusFilter && t.status !== statusFilter) return false;
        if (search) {
            const haystack = `${t.clientName} ${t.description}`.toLowerCase();
            if (!haystack.includes(search)) return false;
        }
        return true;
    }).forEach(ticket => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${ticket.id}</td>
            <td>${ticket.clientName}</td>
            <td>${getIssueTypeLabel(ticket.issueType)}</td>
            <td><span class="status-badge status-${ticket.status}">${getStatusLabel(ticket.status)}</span></td>
            <td>${ticket.date}</td>
            <td class="ticket-actions">
                ${ticket.status === 'pendiente' ? `
                    <button class="btn btn-success btn-sm" onclick="updateTicketStatus(${ticket.id}, 'completado')">Completar</button>
                    <button class="btn btn-danger btn-sm" onclick="updateTicketStatus(${ticket.id}, 'rechazado')">Rechazar</button>
                ` : ''}
                <button class="btn btn-warning btn-sm" onclick="viewTicketDetails(${ticket.id})">Ver</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTicket(${ticket.id}); renderCasesTable();">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Render tickets for user
function renderUserTickets() {
    const tbody = document.getElementById('userTicketsTableBody');
    if (!tbody || !currentUser) return;

    tbody.innerHTML = '';
    const userTickets = tickets.filter(t => t.createdBy === currentUser.username);
    userTickets.forEach(ticket => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${ticket.id}</td>
            <td>${getIssueTypeLabel(ticket.issueType)}</td>
            <td>${ticket.description.substring(0, 50)}...</td>
            <td><span class="status-badge status-${ticket.status}">${getStatusLabel(ticket.status)}</span></td>
            <td>${ticket.date}</td>
        `;
        tbody.appendChild(row);
    });
}

// ------------------- Formularios creación -------------------
// Crear administrador (modal)
function showCreateAdminForm() {
    Swal.fire({
        title: 'Crear Administrador',
        html: `
            <input id="sw_admin_username" class="swal2-input" placeholder="username">
            <input id="sw_admin_fullname" class="swal2-input" placeholder="Nombre completo">
            <input id="sw_admin_email" class="swal2-input" placeholder="Correo electrónico">
            <input id="sw_admin_password" class="swal2-input" placeholder="Contraseña" type="password">
        `,
        focusConfirm: false,
        preConfirm: () => {
            return {
                username: document.getElementById('sw_admin_username').value.toLowerCase(),
                fullName: document.getElementById('sw_admin_fullname').value,
                email: document.getElementById('sw_admin_email').value,
                password: document.getElementById('sw_admin_password').value
            };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const { username, fullName, email, password } = result.value;
            if (!username || !fullName || !email || !password) {
                Swal.fire({ icon: 'error', title: 'Campos faltantes', text: 'Completa todos los campos' });
                return;
            }
            if (users[username]) {
                Swal.fire({ icon: 'error', title: 'Usuario existente', text: 'Ya existe ese username' }); return;
            }
            users[username] = { password, role: 'admin', fullName, email, createdBy: currentUser.username, createdDate: new Date().toISOString().split('T')[0] };
            saveAllData();
            renderUsersTable();
            updateAdminStats();
            Swal.fire({ icon: 'success', title: 'Administrador creado' });
        }
    });
}

// Crear usuario (modal)
function showCreateUserForm() {
    Swal.fire({
        title: 'Crear Usuario',
        html: `
            <input id="sw_user_username" class="swal2-input" placeholder="username">
            <input id="sw_user_fullname" class="swal2-input" placeholder="Nombre completo">
            <input id="sw_user_email" class="swal2-input" placeholder="Correo electrónico">
            <input id="sw_user_password" class="swal2-input" placeholder="Contraseña" type="password">
        `,
        focusConfirm: false,
        preConfirm: () => {
            return {
                username: document.getElementById('sw_user_username').value.toLowerCase(),
                fullName: document.getElementById('sw_user_fullname').value,
                email: document.getElementById('sw_user_email').value,
                password: document.getElementById('sw_user_password').value
            };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const { username, fullName, email, password } = result.value;
            if (!username || !fullName || !email || !password) {
                Swal.fire({ icon: 'error', title: 'Campos faltantes', text: 'Completa todos los campos' });
                return;
            }
            if (users[username]) { Swal.fire({ icon: 'error', title: 'Usuario existente' }); return; }
            users[username] = { password, role: 'user', fullName, email, createdBy: currentUser.username, createdDate: new Date().toISOString().split('T')[0] };
            saveAllData();
            renderUsersTable();
            updateAdminStats();
            Swal.fire({ icon: 'success', title: 'Usuario creado' });
        }
    });
}

// Editar usuario
function editUser(username) {
    const user = users[username];
    if (!user) { Swal.fire({ icon: 'error', title: 'Usuario no encontrado' }); return; }

    Swal.fire({
        title: 'Editar Usuario',
        html: `
            <input id="sw_edit_username" class="swal2-input" value="${username}" disabled>
            <input id="sw_edit_fullname" class="swal2-input" value="${user.fullName || ''}" placeholder="Nombre completo">
            <input id="sw_edit_email" class="swal2-input" value="${user.email || ''}" placeholder="Correo electrónico">
            <input id="sw_edit_password" class="swal2-input" placeholder="Nueva contraseña (opcional)" type="password">
        `,
        focusConfirm: false,
        preConfirm: () => {
            return {
                fullName: document.getElementById('sw_edit_fullname').value,
                email: document.getElementById('sw_edit_email').value,
                password: document.getElementById('sw_edit_password').value
            };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const { fullName, email, password } = result.value;
            user.fullName = fullName || user.fullName;
            user.email = email || user.email;
            if (password) user.password = password;
            saveAllData();
            renderUsersTable();
            updateAdminStats();
            Swal.fire({ icon: 'success', title: 'Usuario actualizado' });
        }
    });
}

// Cambiar rol desde tabla con confirmación
function changeUserRolePrompt(username) {
    const user = users[username];
    if (!user) { Swal.fire({ icon: 'error', title: 'Usuario no encontrado' }); return; }
    if (username === currentUser.username) { Swal.fire({ icon: 'warning', title: 'No puedes cambiar tu propio rol' }); return; }

    const newRole = user.role === 'admin' ? 'user' : 'admin';
    Swal.fire({
        title: 'Cambiar rol',
        text: `Cambiar rol de ${user.fullName} a ${newRole}?`,
        showCancelButton: true
    }).then(res => {
        if (res.isConfirmed) {
            user.role = newRole;
            saveAllData();
            renderUsersTable();
            updateAdminStats();
            Swal.fire({ icon: 'success', title: 'Rol actualizado' });
        }
    });
}

// Eliminar usuario con confirmación
function deleteUserPrompt(username) {
    const user = users[username];
    if (!user) { Swal.fire({ icon: 'error', title: 'Usuario no encontrado' }); return; }
    if (username === 'admin') { Swal.fire({ icon: 'warning', title: 'No puedes eliminar al administrador principal' }); return; }
    if (username === currentUser.username) { Swal.fire({ icon: 'warning', title: 'No puedes eliminarte a ti mismo' }); return; }

    Swal.fire({
        title: 'Eliminar usuario',
        html: `¿Eliminar a <strong>${user.fullName}</strong> (@${username})?`,
        icon: 'warning',
        showCancelButton: true
    }).then(res => {
        if (res.isConfirmed) {
            delete users[username];
            saveAllData();
            renderUsersTable();
            updateAdminStats();
            Swal.fire({ icon: 'success', title: 'Usuario eliminado' });
        }
    });
}

// ------------------- Tickets: acciones -------------------
function updateTicketStatus(ticketId, newStatus) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const statusLabels = { 'completado': 'Completado', 'rechazado': 'Rechazado' };
    Swal.fire({
        title: '¿Confirmar acción?',
        text: `¿Marcar ticket #${ticketId} como ${statusLabels[newStatus]}?`,
        showCancelButton: true
    }).then(result => {
        if (result.isConfirmed) {
            ticket.status = newStatus;
            saveAllData();
            updateAdminStats();
            renderAdminTickets();
            renderCasesTable();
            setTimeout(() => renderChart(), 100); // Delay para asegurar DOM actualizado
            Swal.fire({ icon: 'success', title: '¡Actualizado!' });
        }
    });
}

function viewTicketDetails(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    Swal.fire({
        title: `Detalles del ticket #${ticket.id}`,
        html: `
            <strong>Cliente:</strong> ${ticket.clientName}<br>
            <strong>Email:</strong> ${ticket.clientEmail}<br>
            <strong>Teléfono:</strong> ${ticket.clientPhone}<br>
            <strong>Tipo:</strong> ${getIssueTypeLabel(ticket.issueType)}<br>
            <strong>Estado:</strong> ${getStatusLabel(ticket.status)}<br>
            <strong>Fecha:</strong> ${ticket.date}<br><br>
            <strong>Descripción:</strong><br>${ticket.description}
        `,
        width: '600px'
    });
}

function deleteTicket(ticketId) {
    Swal.fire({
        title: 'Eliminar ticket',
        text: `¿Eliminar ticket #${ticketId}?`,
        icon: 'warning',
        showCancelButton: true
    }).then(result => {
        if (result.isConfirmed) {
            tickets = tickets.filter(t => t.id !== ticketId);
            saveAllData();
            updateAdminStats();
            renderAdminTickets();
            renderCasesTable();
            setTimeout(() => renderChart(), 100); // Delay para asegurar DOM actualizado
            Swal.fire({ icon: 'success', title: 'Ticket eliminado' });
        }
    });
}

// ------------------- Helper -------------------
function getIssueTypeLabel(type) {
    const types = { tecnico: 'Técnico', software: 'Software', hardware: 'Hardware', red: 'Red', acceso: 'Acceso', otro: 'Otro' };
    return types[type] || type;
}
function getStatusLabel(status) {
    const statuses = { pendiente: 'Pendiente', completado: 'Completado', rechazado: 'Rechazado' };
    return statuses[status] || status;
}

// ------------------- Formulario usuario crea ticket -------------------
document.getElementById('ticketForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!currentUser) { Swal.fire({ icon: 'error', title: 'Debes iniciar sesión' }); return; }
    const ticket = {
        id: ticketCounter++,
        clientName: document.getElementById('clientName').value,
        clientEmail: document.getElementById('clientEmail').value,
        clientPhone: document.getElementById('clientPhone').value,
        issueType: document.getElementById('issueType').value,
        description: document.getElementById('description').value,
        status: 'pendiente',
        date: new Date().toISOString().split('T')[0],
        createdBy: currentUser.username
    };
    tickets.push(ticket);
    saveAllData();
    updateAdminStats();
    renderUserTickets();
    renderAdminTickets();
    setTimeout(() => renderChart(), 100); // Delay para asegurar DOM actualizado
    Swal.fire({ icon: 'success', title: 'Solicitud creada', text: `Ticket #${ticket.id}` });
    document.getElementById('clientPhone').value = '';
    document.getElementById('issueType').value = '';
    document.getElementById('description').value = '';
});

// Logout
function logout() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        showCancelButton: true
    }).then(result => {
        if (result.isConfirmed) {
            currentUser = null;

            // Destruir gráfico si existe
            if (ticketsChart) {
                ticketsChart.destroy();
                ticketsChart = null;
            }

            document.getElementById('loginScreen').classList.remove('hidden');
            document.getElementById('adminDashboard').classList.add('hidden');
            document.getElementById('userInterface').classList.add('hidden');
            document.getElementById('usersManagement').classList.add('hidden');
            document.getElementById('casesManagement').classList.add('hidden');
            document.getElementById('headerTitle').textContent = 'Sistema de Gestión de Tickets';
            document.getElementById('headerSubtitle').textContent = 'Portal de Soporte Técnico';
            document.getElementById('loginForm').reset();
            document.getElementById('registerForm').reset();
            showLoginForm();
        }
    });
}

// ------------------- Menú móvil -------------------
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (navLinks && mobileToggle) {
        navLinks.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    }
}

// Función para cerrar el menú móvil
function closeMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (navLinks && mobileToggle) {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
    }
}

// Cerrar menú móvil al hacer clic en un enlace
document.addEventListener('DOMContentLoaded', function() {
    // Usar delegación de eventos para capturar clics en enlaces del menú
    document.addEventListener('click', function(e) {
        // Verificar si el clic es en un enlace del menú móvil
        if (e.target.matches('.nav-links a') || e.target.matches('.nav-links button') || e.target.closest('.nav-links a') || e.target.closest('.nav-links button')) {
            closeMobileMenu();
        }
        
        // Cerrar menú al hacer clic fuera de él
        const mobileNav = document.getElementById('navLinks');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        if (mobileNav && mobileNav.classList.contains('active')) {
            // Si el clic no es en el menú ni en el botón hamburguesa
            if (!mobileNav.contains(e.target) && !mobileToggle.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });
});