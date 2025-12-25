// Variables globales
let currentUser = null;
let projects = [];
let currentProjectId = null;
let currentEditProjectId = null;
let currentEditTaskId = null;
let currentFilters = { client: '', status: '' };

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserData();
    displayUserInfo();
    updateClientFilter();
    renderProjects();
    updateDashboard();
});

// AUTENTICACIÓN
function checkAuth() {
    const userStr = sessionStorage.getItem('trelopptech-current-user');
    if (!userStr) {
        window.location.href = 'index.html';
        return;
    }
    currentUser = JSON.parse(userStr);
}

function logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        sessionStorage.removeItem('trelopptech-current-user');
        window.location.href = 'index.html';
    }
}

function displayUserInfo() {
    if (currentUser) {
        document.getElementById('companyName').textContent = currentUser.companyName;
    }
}

// GESTIÓN DE DATOS POR USUARIO
function getUserStorageKey() {
    return `trelopptech-projects-${currentUser.id}`;
}

function loadUserData() {
    const data = localStorage.getItem(getUserStorageKey());
    projects = data ? JSON.parse(data) : [];
}

function saveToStorage() {
    localStorage.setItem(getUserStorageKey(), JSON.stringify(projects));
}

// FILTROS
function updateClientFilter() {
    const allProjects = getAllProjects();
    const clients = [...new Set(allProjects.map(p => p.client).filter(c => c))];
    const clientFilter = document.getElementById('clientFilter');
    const currentValue = clientFilter.value;
    clientFilter.innerHTML = '<option value="">Todos los clientes</option>';
    clients.sort().forEach(client => {
        const option = document.createElement('option');
        option.value = client;
        option.textContent = client;
        clientFilter.appendChild(option);
    });
    if (currentValue) clientFilter.value = currentValue;
}

function applyFilters() {
    currentFilters.client = document.getElementById('clientFilter').value;
    currentFilters.status = document.getElementById('statusFilter').value;
    renderProjects();
}

function clearFilters() {
    currentFilters = { client: '', status: '' };
    document.getElementById('clientFilter').value = '';
    document.getElementById('statusFilter').value = '';
    renderProjects();
}

function passesFilters(project) {
    if (currentFilters.client && project.client !== currentFilters.client) return false;
    if (currentFilters.status && getProjectStatus(project) !== currentFilters.status) return false;
    return true;
}

// PROYECTOS
function openProjectModal(mode, projectId = null) {
    const modal = document.getElementById('projectModal');
    const title = document.getElementById('projectModalTitle');
    if (mode === 'add') {
        title.textContent = 'Nuevo proyecto';
        document.getElementById('projectForm').reset();
        document.getElementById('isSubproject').value = '';
        currentEditProjectId = null;
    } else {
        title.textContent = 'Editar proyecto';
        const project = findProject(projectId);
        if (project) {
            currentEditProjectId = projectId;
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectClient').value = project.client || '';
            document.getElementById('projectDescription').value = project.description || '';
            document.getElementById('projectStartDate').value = project.startDate;
            document.getElementById('projectEndDate').value = project.endDate;
            document.getElementById('projectNotes').value = project.notes || '';
            document.getElementById('projectRestrictions').value = project.restrictions || '';
        }
    }
    modal.classList.add('active');
}

function openSubprojectModal() {
    if (!currentProjectId) {
        showNotification('Error', 'Selecciona un proyecto primero');
        return;
    }
    const modal = document.getElementById('projectModal');
    const title = document.getElementById('projectModalTitle');
    title.textContent = 'Nuevo subproyecto';
    document.getElementById('projectForm').reset();
    document.getElementById('isSubproject').value = 'true';
    currentEditProjectId = null;
    modal.classList.add('active');
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
    currentEditProjectId = null;
}

function saveProject() {
    const name = document.getElementById('projectName').value.trim();
    const client = document.getElementById('projectClient').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const startDate = document.getElementById('projectStartDate').value;
    const endDate = document.getElementById('projectEndDate').value;
    const notes = document.getElementById('projectNotes').value.trim();
    const restrictions = document.getElementById('projectRestrictions').value.trim();
    const isSubproject = document.getElementById('isSubproject').value === 'true';

    if (!name || !startDate || !endDate) {
        showNotification('Error', 'Por favor completa los campos requeridos');
        return;
    }

    if (currentEditProjectId) {
        const project = findProject(currentEditProjectId);
        if (project) {
            project.name = name;
            project.client = client;
            project.description = description;
            project.startDate = startDate;
            project.endDate = endDate;
            project.notes = notes;
            project.restrictions = restrictions;
            project.updatedAt = new Date().toISOString();
            if (!project.history) project.history = [];
            project.history.unshift({
                timestamp: new Date().toISOString(),
                action: 'Proyecto actualizado'
            });
        }
    } else {
        const newProject = {
            id: Date.now(),
            name, client, description, startDate, endDate, notes, restrictions,
            tasks: [],
            subprojects: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            history: [{
                timestamp: new Date().toISOString(),
                action: isSubproject ? 'Subproyecto creado' : 'Proyecto creado'
            }]
        };

        if (isSubproject && currentProjectId) {
            const parentProject = findProject(currentProjectId);
            if (parentProject) {
                if (!parentProject.subprojects) parentProject.subprojects = [];
                parentProject.subprojects.push(newProject);
            }
        } else {
            projects.push(newProject);
        }
    }

    saveToStorage();
    closeProjectModal();
    updateClientFilter();
    renderProjects();
    updateDashboard();
    if (currentProjectId) renderProjectInfo();
    showNotification('Éxito', `${isSubproject ? 'Subproyecto' : 'Proyecto'} "${name}" ${currentEditProjectId ? 'actualizado' : 'creado'} correctamente`);
}

function deleteProject(id) {
    if (confirm('¿Estás seguro de eliminar este proyecto y todas sus tareas?')) {
        const project = findProject(id);
        if (project) {
            removeProject(id);
            saveToStorage();
            if (currentProjectId === id) showDashboard();
            updateClientFilter();
            renderProjects();
            updateDashboard();
            showNotification('Proyecto eliminado', `"${project.name}" ha sido eliminado`);
        }
    }
}

function selectProject(id) {
    currentProjectId = id;
    const project = findProject(id);
    if (!project) return;
    
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('taskBoard').classList.add('active');
    
    const clientInfo = project.client ? ` • Cliente: ${project.client}` : '';
    document.getElementById('currentProjectName').textContent = project.name;
    document.getElementById('currentProjectInfo').textContent = 
        `${project.description || 'Sin descripción'}${clientInfo} • Entrega: ${formatDate(project.endDate)}`;
    
    renderProjects();
    renderTasks();
    renderProjectInfo();
}

function editCurrentProject() {
    if (currentProjectId) openProjectModal('edit', currentProjectId);
}

function renderProjects() {
    const container = document.getElementById('projectsList');
    if (projects.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📁</div><div class="empty-state-text">No hay proyectos</div><div class="empty-state-subtext">Crea tu primer proyecto</div></div>';
        return;
    }

    const filteredProjects = projects.filter(p => passesFilters(p) || hasFilteredSubprojects(p));
    if (filteredProjects.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">No hay proyectos con estos filtros</div><div class="empty-state-subtext">Intenta con otros criterios</div></div>';
        return;
    }

    container.innerHTML = filteredProjects.map(project => renderProjectItem(project)).join('');
}

function hasFilteredSubprojects(project) {
    if (!project.subprojects || project.subprojects.length === 0) return false;
    return project.subprojects.some(sub => passesFilters(sub) || hasFilteredSubprojects(sub));
}

function renderProjectItem(project, isSubproject = false) {
    const status = getProjectStatus(project);
    const progress = calculateProjectProgress(project);
    const hasSubprojects = project.subprojects && project.subprojects.length > 0;
    
    let html = `
        <div class="${isSubproject ? 'subproject-item' : 'project-item'} ${status} ${currentProjectId === project.id ? 'active' : ''}" 
             onclick="selectProject(${project.id})">
            <div class="project-name">
                ${project.name}
                ${project.client ? `<span class="client-badge">${project.client}</span>` : ''}
            </div>
            <div class="project-meta">
                <span>${formatDate(project.endDate)}</span>
                <span>${progress}%</span>
            </div>
            <div class="project-progress-mini">
                <div class="project-progress-fill" style="width: ${progress}%"></div>
            </div>
        </div>
    `;

    if (hasSubprojects && !isSubproject) {
        const filteredSubs = project.subprojects.filter(sub => passesFilters(sub) || hasFilteredSubprojects(sub));
        if (filteredSubs.length > 0) {
            html += '<div class="subprojects-container">';
            html += filteredSubs.map(sub => renderProjectItem(sub, true)).join('');
            html += '</div>';
        }
    }

    return html;
}

function renderProjectInfo() {
    const project = findProject(currentProjectId);
    if (!project) return;

    const observationsList = document.getElementById('observationsList');
    const restrictionsList = document.getElementById('restrictionsList');

    if (project.notes && project.notes.trim()) {
        observationsList.innerHTML = `
            <div class="info-card observation">
                <div class="info-card-title">Observaciones del proyecto</div>
                <div class="info-card-content">${project.notes}</div>
            </div>
        `;
    } else {
        observationsList.innerHTML = '<div class="empty-state" style="padding: 40px 20px;"><div class="empty-state-icon" style="font-size: 48px;">📝</div><div class="empty-state-text" style="font-size: 14px;">Sin observaciones</div></div>';
    }

    if (project.restrictions && project.restrictions.trim()) {
        restrictionsList.innerHTML = `
            <div class="info-card restriction">
                <div class="info-card-title">Restricciones del proyecto</div>
                <div class="info-card-content">${project.restrictions}</div>
            </div>
        `;
    } else {
        restrictionsList.innerHTML = '<div class="empty-state" style="padding: 40px 20px;"><div class="empty-state-icon" style="font-size: 48px;">⚠️</div><div class="empty-state-text" style="font-size: 14px;">Sin restricciones</div></div>';
    }
}

// TAREAS
function openTaskModal(mode, taskId = null) {
    if (!currentProjectId) {
        showNotification('Error', 'Selecciona un proyecto primero');
        return;
    }

    const modal = document.getElementById('taskModal');
    const title = document.getElementById('taskModalTitle');
    
    if (mode === 'add') {
        title.textContent = 'Nueva tarea';
        document.getElementById('taskForm').reset();
        currentEditTaskId = null;
    } else {
        title.textContent = 'Editar tarea';
        const project = findProject(currentProjectId);
        const task = project.tasks.find(t => t.id === taskId);
        if (task) {
            currentEditTaskId = taskId;
            document.getElementById('taskName').value = task.name;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskStatus').value = task.status;
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskPriority').value = task.priority || 'medium';
            document.getElementById('taskNotes').value = task.notes || '';
        }
    }
    modal.classList.add('active');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
    currentEditTaskId = null;
}

function saveTask() {
    const project = findProject(currentProjectId);
    if (!project) return;

    const name = document.getElementById('taskName').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const status = document.getElementById('taskStatus').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;
    const notes = document.getElementById('taskNotes').value.trim();

    if (!name) {
        showNotification('Error', 'El nombre de la tarea es requerido');
        return;
    }

    if (currentEditTaskId) {
        const index = project.tasks.findIndex(t => t.id === currentEditTaskId);
        if (index !== -1) {
            const oldTask = project.tasks[index];
            project.tasks[index] = {
                ...oldTask,
                name, description, status, dueDate, priority, notes,
                updatedAt: new Date().toISOString()
            };
            if (oldTask.status !== status) {
                if (!project.history) project.history = [];
                project.history.unshift({
                    timestamp: new Date().toISOString(),
                    action: `Tarea "${name}" cambió de "${getStatusLabel(oldTask.status)}" a "${getStatusLabel(status)}"`
                });
            }
        }
    } else {
        const newTask = {
            id: Date.now(),
            name, description, status, dueDate, priority, notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        if (!project.tasks) project.tasks = [];
        project.tasks.push(newTask);
        if (!project.history) project.history = [];
        project.history.unshift({
            timestamp: new Date().toISOString(),
            action: `Tarea "${name}" creada`
        });
    }

    project.updatedAt = new Date().toISOString();
    saveToStorage();
    closeTaskModal();
    renderTasks();
    updateDashboard();
    renderProjects();
    showNotification('Éxito', `Tarea "${name}" ${currentEditTaskId ? 'actualizada' : 'creada'} correctamente`);
}

function deleteTask(taskId) {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
        const project = findProject(currentProjectId);
        if (!project) return;
        const task = project.tasks.find(t => t.id === taskId);
        if (!task) return;
        project.tasks = project.tasks.filter(t => t.id !== taskId);
        if (!project.history) project.history = [];
        project.history.unshift({
            timestamp: new Date().toISOString(),
            action: `Tarea "${task.name}" eliminada`
        });
        saveToStorage();
        renderTasks();
        updateDashboard();
        renderProjects();
        showNotification('Tarea eliminada', `"${task.name}" ha sido eliminada`);
    }
}

function renderTasks() {
    if (!currentProjectId) return;
    const project = findProject(currentProjectId);
    if (!project) return;

    document.getElementById('todoList').innerHTML = '';
    document.getElementById('inProgressList').innerHTML = '';
    document.getElementById('completedList').innerHTML = '';

    if (!project.tasks) project.tasks = [];

    project.tasks.forEach(task => {
        const card = createTaskCard(task);
        const listElement = document.getElementById(getTaskListId(task.status));
        if (listElement) listElement.appendChild(card);
    });

    updateTaskCounts(project.tasks);
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.ondragstart = drag;
    card.dataset.id = task.id;

    const priorityColors = { low: '🟢', medium: '🟡', high: '🔴' };
    const priorityLabels = { low: 'Baja', medium: 'Media', high: 'Alta' };

    card.innerHTML = `
        <div class="task-title">${task.name}</div>
        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
        ${task.notes ? `<div class="task-description" style="margin-top: 8px;">📝 ${task.notes}</div>` : ''}
        <div class="task-meta">
            <span>${priorityColors[task.priority]} ${priorityLabels[task.priority]}</span>
            ${task.dueDate ? `<span>📅 ${formatDate(task.dueDate)}</span>` : '<span>Sin fecha</span>'}
        </div>
        <div class="task-actions">
            <button class="icon-btn" onclick="event.stopPropagation(); openTaskModal('edit', ${task.id})">✏️ Editar</button>
            <button class="icon-btn" onclick="event.stopPropagation(); deleteTask(${task.id})">🗑️ Eliminar</button>
        </div>
    `;

    return card;
}

function getTaskListId(status) {
    const mapping = { 'todo': 'todoList', 'in-progress': 'inProgressList', 'completed': 'completedList' };
    return mapping[status] || 'todoList';
}

function getStatusLabel(status) {
    const labels = { 'todo': 'Por hacer', 'in-progress': 'En curso', 'completed': 'Completada' };
    return labels[status] || status;
}

function updateTaskCounts(tasks) {
    const counts = { todo: 0, 'in-progress': 0, completed: 0 };
    tasks.forEach(task => { if (counts.hasOwnProperty(task.status)) counts[task.status]++; });
    document.getElementById('todoCount').textContent = counts.todo;
    document.getElementById('inProgressCount').textContent = counts['in-progress'];
    document.getElementById('completedCount').textContent = counts.completed;
}

// Drag and Drop
function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) { ev.dataTransfer.setData("taskId", ev.target.dataset.id); }
function drop(ev) {
    ev.preventDefault();
    const taskId = parseInt(ev.dataTransfer.getData("taskId"));
    const targetList = ev.target.closest('.task-list');
    if (!targetList) return;

    const newStatus = getStatusFromListId(targetList.id);
    const project = findProject(currentProjectId);
    if (!project) return;
    
    const task = project.tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
        const oldStatus = task.status;
        task.status = newStatus;
        task.updatedAt = new Date().toISOString();
        if (!project.history) project.history = [];
        project.history.unshift({
            timestamp: new Date().toISOString(),
            action: `Tarea "${task.name}" movida de "${getStatusLabel(oldStatus)}" a "${getStatusLabel(newStatus)}"`
        });
        saveToStorage();
        renderTasks();
        updateDashboard();
        renderProjects();
        showNotification('Tarea actualizada', `"${task.name}" movida a ${getStatusLabel(newStatus)}`);
    }
}

function getStatusFromListId(listId) {
    const mapping = { 'todoList': 'todo', 'inProgressList': 'in-progress', 'completedList': 'completed' };
    return mapping[listId] || 'todo';
}

// DASHBOARD
function showDashboard() {
    currentProjectId = null;
    document.getElementById('taskBoard').classList.remove('active');
    document.getElementById('dashboard').classList.remove('hidden');
    renderProjects();
    updateDashboard();
}

function updateDashboard() {
    const allProjects = getAllProjects();
    const total = allProjects.length;
    const inProgress = allProjects.filter(p => {
        const status = getProjectStatus(p);
        return status === 'in-progress' || status === 'in-progress-delayed';
    }).length;
    const completed = allProjects.filter(p => getProjectStatus(p) === 'completed').length;
    const avgProgress = total > 0 ? Math.round(allProjects.reduce((sum, p) => sum + calculateProjectProgress(p), 0) / total) : 0;

    document.getElementById('totalProjects').textContent = total;
    document.getElementById('inProgressProjects').textContent = inProgress;
    document.getElementById('completedProjects').textContent = completed;
    document.getElementById('averageProgress').textContent = avgProgress + '%';

    const overview = document.getElementById('projectsOverview');
    if (projects.length === 0) {
        overview.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">No hay proyectos para mostrar</div><div class="empty-state-subtext">Crea tu primer proyecto para comenzar</div><button class="btn btn-primary" onclick="openProjectModal(\'add\')" style="margin-top: 20px;"><span>+</span><span>Crear proyecto</span></button></div>';
        return;
    }

    overview.innerHTML = allProjects.map(project => renderDashboardCard(project)).join('');
}

function renderDashboardCard(project) {
    const status = getProjectStatus(project);
    const progress = calculateProjectProgress(project);
    const daysRemaining = calculateDaysRemaining(project.endDate);
    const isDelayed = daysRemaining < 0;
    const totalTasks = project.tasks ? project.tasks.length : 0;
    const completedTasks = project.tasks ? project.tasks.filter(t => t.status === 'completed').length : 0;
    const inProgressTasks = project.tasks ? project.tasks.filter(t => t.status === 'in-progress').length : 0;

    return `
        <div class="project-card ${status}" onclick="selectProject(${project.id})">
            <div class="project-card-header">
                <div class="project-card-title">
                    ${project.name}
                    ${project.client ? `<span class="client-badge" style="margin-left: 10px;">${project.client}</span>` : ''}
                </div>
                <div class="project-status-badge ${status}">
                    ${status === 'delayed' ? '🔴 Retrasado' :
                      status === 'in-progress' ? '🟡 En curso' :
                      status === 'in-progress-delayed' ? '🟠 Retrasado en curso' :
                      status === 'on-track' ? '🟢 Al día' : '✅ Completado'}
                </div>
            </div>
            <div class="project-card-info">
                <div class="info-item"><div class="info-label">Tareas totales</div><div class="info-value">${totalTasks}</div></div>
                <div class="info-item"><div class="info-label">En curso</div><div class="info-value">${inProgressTasks}</div></div>
                <div class="info-item"><div class="info-label">Completadas</div><div class="info-value">${completedTasks}</div></div>
            </div>
            <div class="project-card-info" style="grid-template-columns: 1fr 1fr;">
                <div class="info-item"><div class="info-label">Inicio</div><div class="info-value">${formatDate(project.startDate)}</div></div>
                <div class="info-item"><div class="info-label">Entrega</div><div class="info-value" style="color: ${isDelayed ? 'var(--status-delayed)' : 'var(--text-primary)'}">${formatDate(project.endDate)}</div></div>
            </div>
            <div class="project-progress">
                <div class="progress-header"><span class="progress-label">Progreso del proyecto</span><span class="progress-percentage">${progress}%</span></div>
                <div class="progress-bar"><div class="progress-fill ${status}" style="width: ${progress}%"></div></div>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); openProjectModal('edit', ${project.id})">✏️ Editar</button>
                <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); deleteProject(${project.id})">🗑️ Eliminar</button>
            </div>
        </div>
    `;
}

// UTILIDADES
function findProject(id, projectList = projects) {
    for (const project of projectList) {
        if (project.id === id) return project;
        if (project.subprojects && project.subprojects.length > 0) {
            const found = findProject(id, project.subprojects);
            if (found) return found;
        }
    }
    return null;
}

function removeProject(id, projectList = projects) {
    const index = projectList.findIndex(p => p.id === id);
    if (index !== -1) {
        projectList.splice(index, 1);
        return true;
    }
    for (const project of projectList) {
        if (project.subprojects && project.subprojects.length > 0) {
            if (removeProject(id, project.subprojects)) return true;
        }
    }
    return false;
}

function getAllProjects(projectList = projects) {
    let all = [];
    for (const project of projectList) {
        all.push(project);
        if (project.subprojects && project.subprojects.length > 0) {
            all = all.concat(getAllProjects(project.subprojects));
        }
    }
    return all;
}

function calculateProjectProgress(project) {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / project.tasks.length) * 100);
}

function getProjectStatus(project) {
    const progress = calculateProjectProgress(project);
    const daysRemaining = calculateDaysRemaining(project.endDate);
    if (progress === 100) return 'completed';
    if (daysRemaining < 0 && progress === 0) return 'delayed';
    const totalDays = calculateTotalDays(project.startDate, project.endDate);
    const expectedProgress = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 0;
    if (progress >= expectedProgress - 10) return 'on-track';
    if (progress > 0 && daysRemaining < 0) return 'in-progress-delayed';
    if (progress > 0) return 'in-progress';
    return 'delayed';
}

function calculateDaysRemaining(endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
}

function calculateTotalDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function formatDate(dateString) {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<div class="notification-title">${title}</div><div class="notification-body">${message}</div>`;
    document.body.appendChild(notification);
    setTimeout(() => { if (notification.parentElement) notification.remove(); }, 3000);
}
