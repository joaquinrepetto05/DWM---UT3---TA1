const addTaskBtn = document.getElementById('add-task-btn');
const addTaskDesktop = document.getElementById('btn-desktop');
const taskModal = document.getElementById('task-modal');
const closeModalBtns = taskModal.querySelectorAll('.delete, #cancel-task-btn');
const saveTaskBtn = document.getElementById('save-task-btn');
const taskForm = document.getElementById('task-form');
const darkMode = document.getElementById('modo-oscuro');
let editingTask = null;
let mode = "Light";

fetch('http://localhost:3000/api/tasks')
.then(response => response.json())
.then(data => {
    data.forEach(taskData => {
        createTask(taskData);
    });
});

// Abrir modal de nueva tarea
addTaskBtn.addEventListener('click', () => {
    editingTask = false;
    taskForm.reset();
    taskModal.classList.add('is-active');
});

addTaskDesktop.addEventListener('click', () => {
    editingTask = false;
    taskForm.reset();
    taskModal.classList.add('is-active');
});

// Cerrar modal
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        taskModal.classList.remove('is-active');
    });
});

// Guardar tarea
saveTaskBtn.addEventListener('click', () => {
    const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        assignedTo: document.getElementById('task-assigned').value,
        priority: document.getElementById('task-priority').value,
        status: document.getElementById('task-status').value,
        endDate: document.getElementById('task-due-date').value
    };
    if (editingTask) {
        updateTask(editingTask, taskData);
    } else {
        createTask(taskData);
    }
    taskModal.classList.remove('is-active');
});

// Agregamos un event listener para el botón de modo oscuro
document.getElementById("modo-oscuro").addEventListener("click", function () {
    // Alterna entre las clases 'light-mode' y 'dark-mode' (por defecto sin la clase es modo oscuro)
    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
        this.classList.add("light-mode");  // Cambia la imagen del botón para modo claro
    } else {
        this.classList.remove("light-mode");  // Cambia la imagen del botón para modo oscuro
    }
});

// Editar tarea existente
function updateTask(taskCard, taskData) {
    taskCard.querySelector('.task-title').textContent = taskData.title;
    taskCard.querySelector('.task-assigned').textContent = `Asignado a: ${taskData.assignedTo}`;
    taskCard.querySelector('.task-priority').textContent = `Prioridad: ${taskData.priority}`;
    taskCard.querySelector('.task-due-date').textContent = `Fecha límite: ${taskData.endDate}`;

    // Obtener todas las columnas
    const columns = document.querySelectorAll('.column');

    // Buscar la columna que contiene el subtítulo correspondiente al estado de la tarea
    let targetColumn = null;
    columns.forEach(column => {
        const subtitle = column.querySelector('.subtitle');
        if (subtitle && subtitle.textContent.trim() === taskData.status) {
            targetColumn = column.querySelector('.box');
        }
    });

    // Mover la tarjeta de la tarea a la columna encontrada
    if (targetColumn) {
        targetColumn.appendChild(taskCard);
    }
}

// Abrir modal para editar tarea
function openTaskModalForEditing(taskCard, taskData) {

    taskModal.classList.add('is-active');
    document.querySelector('.modal-card-title').textContent = 'Editar Tarea';
    document.getElementById('task-title').value = taskData.title;
    document.getElementById('task-description').value = taskData.description;
    document.getElementById('task-assigned').value = taskData.assignedTo;
    document.getElementById('task-priority').value = taskData.priority;
    document.getElementById('task-status').value = taskData.status;
    document.getElementById('task-due-date').value = taskData.endDate;
}

// Modo Oscuro
function changeMode(btnOrigin) {
    if (mode === "Light") {

        document.documentElement.style.setProperty("--background-color", "#121212");
        document.documentElement.style.setProperty("--font-color", "white");
        document.documentElement.style.setProperty("--primary-color", "rgb(52, 154, 52)");
        document.documentElement.style.setProperty("--light-background", "#1e1e1e");
        document.documentElement.style.setProperty("--very-light-background", "#333333");
        document.documentElement.style.setProperty("--create-task-button", "#99e9f2");
        document.documentElement.style.setProperty("--create-task-", "#7bbcc4");

        mode = "Dark";
    }
    else {

        document.documentElement.style.setProperty("--background-color", "#e8e8e8");
        document.documentElement.style.setProperty("--font-color", "black");
        document.documentElement.style.setProperty("--primary-color", "rgb(52, 52, 154)");
        document.documentElement.style.setProperty("--light-background", "#efefef");
        document.documentElement.style.setProperty("--very-light-background", "#f8f8f8");
        document.documentElement.style.setProperty("--create-task-button", "#99e9f2");
        document.documentElement.style.setProperty("--create-task-hover", "#7bbcc4");

        mode = "Light";
    }
}

darkMode.addEventListener('click', () => {
    changeMode(darkMode);
});

changeMode(darkMode);

let currentDragItem = null;

function generateTaskCard(taskData) {
    const taskCard = document.createElement('div');
    taskCard.className = 'task';
    taskCard.id = `task-${Date.now()}`;  // id único para cada tarea
    taskCard.draggable = true;  // Hace que la tarea sea draggable
    taskCard.innerHTML = `
        <div class="task-title">${taskData.title}</div>
        <p class="task-description">Descripción: ${taskData.description}</p>
        <p class="task-assigned">Asignado a: ${taskData.assignedTo}</p>
        <p class="task-priority">Prioridad: ${taskData.priority}</p>
        <p class="task-due-date">Fecha límite: ${taskData.endDate}</p>
        <button class="deleteButton"></button>
    `;

    // Añadir evento de clic para abrir el modal de edición de la tarea
    taskCard.addEventListener('click', function () {
        openTaskModalForEditing(taskCard, taskData);
    });

    // Añadir eventos de drag and drop
    taskCard.addEventListener('dragstart', () => {
        currentDragItem = taskCard;
    });

    taskCard.addEventListener('dragend', () => {
        currentDragItem = null;
    });

    // Añadir evento de clic para eliminar la tarea
    taskCard.querySelector('.deleteButton').addEventListener('click', function (event) {
        event.stopPropagation(); // Prevenir que se dispare el evento de editar tarea
        taskCard.remove(); // Eliminar la tarjeta de tarea del DOM
    });

    return taskCard;
}

// permitir que los elementos se puedan soltar en los contenedores
document.querySelectorAll('.box').forEach(box => {
    box.addEventListener('dragover', (ev) => ev.preventDefault());
    box.addEventListener('drop', () => {
        if (currentDragItem) {
            box.appendChild(currentDragItem);
        }
    });
});

//funcion para crear una nueva tarea
function createTask(taskData) {
    const taskCard = generateTaskCard(taskData);

    const targetColumn = getTargetColumn(taskData.status);
    if (targetColumn) {
        targetColumn.appendChild(taskCard);
    }
}

// funcion para actualizar una tarea
function updateTask(taskCard, taskData) {
    taskCard.querySelector('.task-title').textContent = taskData.title;
    taskCard.querySelector('.task-description').textContent = taskData.description;
    taskCard.querySelector('.task-assigned').textContent = `Asignado a: ${taskData.assignedTo}`;
    taskCard.querySelector('.task-priority').textContent = `Prioridad: ${taskData.priority}`;
    taskCard.querySelector('.task-due-date').textContent = `Fecha límite: ${taskData.endDate}`;

    const currentColumn = taskCard.parentNode;
    const targetColumn = getTargetColumn(taskData.status);

    if (currentColumn !== targetColumn && targetColumn) {
        targetColumn.appendChild(taskCard);
    }
}

// funcion para obtener la columna objetivo
function getTargetColumn(status) {
    const columns = document.querySelectorAll('.column .box');
    for (let box of columns) {
        if (box.querySelector('h2.subtitle').textContent === status) {
            return box;
        }
    }
    return null;
}

// funcion para abrir el modal de edicion de tarea
function openTaskModalForEditing(taskCard, taskData) {
    editingTask = taskCard;

    taskModal.classList.add('is-active');
    document.querySelector('.modal-card-title').textContent = 'Editar Tarea';
    document.getElementById('task-title').value = taskData.title;
    document.getElementById('task-description').value = taskData.description;
    document.getElementById('task-assigned').value = taskData.assignedTo;
    document.getElementById('task-priority').value = taskData.priority;
    document.getElementById('task-status').value = taskData.status;
    document.getElementById('task-due-date').value = taskData.endDate;
}
