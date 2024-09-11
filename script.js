const addTaskBtn = document.getElementById('add-task-btn');
const addTaskDesktop = document.getElementById('btn-desktop');
const taskModal = document.getElementById('task-modal');
const closeModalBtns = taskModal.querySelectorAll('.delete, #cancel-task-btn');
const saveTaskBtn = document.getElementById('save-task-btn');
const taskForm = document.getElementById('task-form');
const darkMode = document.getElementById('modo-oscuro');
let editingTask = null;
let mode = "Light";

// Cargar tareas iniciales
fetch('http://localhost:3000/api/tasks')
    .then(response => response.json())
    .then(data => {
        data.forEach(task => {
            createTask(task);
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
        updateTaskOnServer(editingTask, taskData);
    } else {
        createTaskOnServer(taskData);
    }
    taskModal.classList.remove('is-active');
});

// Enviar datos al servidor para crear una nueva tarea
function createTaskOnServer(taskData) {
    fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    })
    .then(response => response.json())
    .then(createdTask => {
        createTask(createdTask);  // Refleja la nueva tarea en la UI solo si el servidor la crea con éxito
    })
    .catch(error => {
        console.error('Error al crear la tarea:', error);
    });
}

// Actualización de la tarea en el servidor y UI
function updateTaskOnServer(taskCard, taskData) {
    const taskId = taskCard.id.split('-')[1]; // Obtiene el ID de la tarea

    fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    })
    .then(response => response.json())
    .then(updatedTask => {
        updateTask(taskCard, updatedTask);  // Refleja los cambios en la UI solo si el servidor actualiza con éxito
    })
    .catch(error => {
        console.error('Error al actualizar la tarea:', error);
    });
}

// Enviar solicitud para eliminar una tarea
function deleteTaskOnServer(taskCard) {
    const taskId = taskCard.id.split('-')[1]; // Obtiene el ID de la tarea

    fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            taskCard.remove();  // Elimina la tarea del DOM si el servidor la elimina con éxito
        } else {
            console.error('Error al eliminar la tarea.');
        }
    })
    .catch(error => {
        console.error('Error al eliminar la tarea:', error);
    });
}

// Agregamos un event listener para el botón de modo oscuro
document.getElementById("modo-oscuro").addEventListener("click", function () {
    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
        this.classList.add("light-mode");  // Cambia la imagen del botón para modo claro
    } else {
        this.classList.remove("light-mode");  // Cambia la imagen del botón para modo oscuro
    }
});

// Actualización de la tarea en la UI
function updateTask(taskCard, taskData) {
    taskCard.querySelector('.task-title').textContent = taskData.title;
    taskCard.querySelector('.task-description').textContent = `Descripción: ${taskData.description}`;
    taskCard.querySelector('.task-assigned').textContent = `Asignado a: ${taskData.assignedTo}`;
    taskCard.querySelector('.task-priority').textContent = `Prioridad: ${taskData.priority}`;
    taskCard.querySelector('.task-due-date').textContent = `Fecha límite: ${taskData.endDate}`;

    const currentColumn = taskCard.parentNode;
    const targetColumn = getTargetColumn(taskData.status);

    if (currentColumn !== targetColumn && targetColumn) {
        targetColumn.appendChild(taskCard);
    }
}

// Abrir modal para editar tarea
function openTaskModalForEditing(taskCard, taskData) {
    const [year, month, day] = taskData.endDate.split("-");
    const dueDate = `${year}-${month}-${day}`;  // Ajustamos el formato de la fecha a AAAA-MM-DD para el input date
    editingTask = taskCard;

    taskModal.classList.add('is-active');
    document.querySelector('.modal-card-title').textContent = 'Editar Tarea';
    document.getElementById('task-title').value = taskData.title;
    document.getElementById('task-description').value = taskData.description;
    document.getElementById('task-assigned').value = taskData.assignedTo;
    document.getElementById('task-priority').value = taskData.priority;
    document.getElementById('task-status').value = taskData.status;
    document.getElementById('task-due-date').value = dueDate;
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
        document.documentElement.style.setProperty("--create-task-hover", "#7bbcc4");

        mode = "Dark";
    } else {
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

// Función para generar una tarjeta de tarea (task card)
function generateTaskCard(taskData) {
    const taskCard = document.createElement('div');
    taskCard.className = 'task';
    taskCard.id = `task-${taskData.id}`;  // Asigna el ID de la tarea desde los datos

    taskCard.innerHTML = `
        <div class="task-title">${taskData.title}</div>
        <p class="task-description">Descripción: ${taskData.description}</p>
        <p class="task-assigned">Asignado a: ${taskData.assignedTo}</p>
        <p class="task-priority">Prioridad: ${taskData.priority}</p>
        <p class="task-due-date">Fecha límite: ${taskData.endDate}</p>
        <button class="deleteButton"></button>
    `;

    // Evento de clic para abrir el modal de edición
    taskCard.addEventListener('click', function () {
        updateTaskOnServer(taskCard, taskData);
        openTaskModalForEditing(taskCard, taskData);
    });

    // Evento de clic para eliminar la tarea
    taskCard.querySelector('.deleteButton').addEventListener('click', function (event) {
        event.stopPropagation(); // Prevenir que se dispare el evento de editar tarea
        deleteTaskOnServer(taskCard); // Llama a la función de eliminación
    });

    return taskCard;
}

// Permitir que los elementos se puedan soltar en los contenedores
document.querySelectorAll('.box').forEach(box => {
    box.addEventListener('dragover', (ev) => ev.preventDefault());
    box.addEventListener('drop', () => {
        if (currentDragItem) {
            box.appendChild(currentDragItem);
        }
    });
});

// Función para crear una nueva tarea en la UI
function createTask(taskData) {
    const taskCard = generateTaskCard(taskData);
    const targetColumn = getTargetColumn(taskData.status);
    if (targetColumn) {
        targetColumn.appendChild(taskCard);
    }
}

// Función para obtener la columna objetivo
function getTargetColumn(status) {
    const columns = document.querySelectorAll('.column .box');
    for (let box of columns) {
        if (box.querySelector('h2.subtitle').textContent === status) {
            return box;
        }
    }
    return null;
}