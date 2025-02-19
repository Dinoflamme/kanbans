document.addEventListener("DOMContentLoaded", () => {
    loadBoard(); // Charger les colonnes et les tâches existantes
    loadSuccessBoard(); // Charger le tableau de succès
});

// Ajouter une nouvelle tâche dans une colonne
function addTask(columnId) {
    let taskText = prompt("Entrez votre tâche :");
    if (!taskText) return;

    let task = createTaskElement(taskText);
    document.getElementById(columnId).appendChild(task);
    saveBoard();
}

// Crée un élément de tâche
function createTaskElement(text) {
    let task = document.createElement("div");
    task.className = "task";
    task.textContent = text;
    task.draggable = true;
    task.addEventListener("dragstart", dragStart);
    task.addEventListener("dragend", dragEnd);
    return task;
}

let draggedTask = null;

function dragStart(event) {
    draggedTask = event.target;
    setTimeout(() => event.target.style.display = "none", 0);
}

function dragEnd(event) {
    event.target.style.display = "block";
    draggedTask = null;
    saveBoard();
}

// Ajouter une nouvelle colonne
document.getElementById("add-column").addEventListener("click", () => {
    let columnName = prompt("Nom de la nouvelle colonne :");
    if (!columnName) return;

    let columnId = columnName.toLowerCase().replace(/\s+/g, "-");
    let columnColor = prompt("Choisissez une couleur (ex: #FF6347 ou red) :");

    if (!columnColor) {
        columnColor = "#FFFFFF"; // Valeur par défaut si aucune couleur n'est donnée
    }

    let column = document.createElement("div");
    column.className = "column";
    column.setAttribute("data-id", columnId);
    column.style.backgroundColor = columnColor;
    column.innerHTML = `        
        <h2>${columnName}</h2>
        <div class="task-list" id="${columnId}" ondrop="drop(event)" ondragover="allowDrop(event)"></div>
        <button class="add-task" onclick="addTask('${columnId}')">+ Ajouter</button>
        <button class="remove-column" onclick="removeColumn('${columnId}')">Supprimer</button>
    `;

    document.getElementById("kanban-board").appendChild(column);
    addDragAndDropEvents();
    saveBoard();
});

// Fonction pour supprimer une colonne
function removeColumn(columnId) {
    let column = document.querySelector(`[data-id="${columnId}"]`);
    if (column) {
        column.remove(); // Supprimer la colonne
        addDragAndDropEvents(); // Réapplique les événements de drag and drop
        saveBoard(); // Sauvegarder l'état après suppression
    }
}

// Réinitialiser le tableau à son état par défaut
document.getElementById("reset-board").addEventListener("click", () => {
    resetBoard();
});

// Fonction pour réinitialiser le tableau avec les 4 colonnes de base
function resetBoard() {
    let boardContainer = document.getElementById("kanban-board");
    boardContainer.innerHTML = ""; // Supprimer toutes les colonnes

    let defaultColumns = [
        { id: "todo", name: "À faire", color: "#FF6B6B" },
        { id: "in-progress", name: "En cours", color: "#FFD93D" },
        { id: "done", name: "Terminé", color: "#6BCB77" },
        { id: "archived", name: "Archivé", color: "#1E90FF" },
        { id: "success", name: "Succès", color: "#4CAF50" } // Ajouter la colonne "Succès" si besoin
    ];

    defaultColumns.forEach(col => {
        let column = document.createElement("div");
        column.className = "column";
        column.setAttribute("data-id", col.id);
        column.style.backgroundColor = col.color;
        column.innerHTML = `
            <h2>${col.name}</h2>
            <div class="task-list" id="${col.id}" ondrop="drop(event)" ondragover="allowDrop(event)"></div>
            <button class="add-task" onclick="addTask('${col.id}')">+ Ajouter</button>
            <button class="remove-column" onclick="removeColumn('${col.id}')">Supprimer</button>
        `;
        boardContainer.appendChild(column);
    });

    addDragAndDropEvents();
    saveBoard();
}

// Fonction de gestion du drag and drop
function addDragAndDropEvents() {
    let tasks = document.querySelectorAll(".task");
    tasks.forEach(task => {
        task.addEventListener("dragstart", dragStart);
        task.addEventListener("dragend", dragEnd);
    });

    let columns = document.querySelectorAll(".task-list");
    columns.forEach(col => {
        col.addEventListener("drop", drop);
        col.addEventListener("dragover", allowDrop);
    });
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    let column = event.target;
    if (!column.classList.contains("task-list")) return;

    column.appendChild(draggedTask);
    saveBoard();
    updateSuccessBoard(draggedTask, column);
}

// Fonction pour ajouter les tâches dans le tableau "Succès"
function updateSuccessBoard(taskElement, column) {
    const successBoard = document.getElementById("success-board");
    const taskText = taskElement.textContent;

    // Ajouter la tâche uniquement si elle provient des colonnes "À faire" ou "Terminé"
    if (column.id === "todo" || column.id === "done") {
        let successItem = document.createElement("li");
        successItem.textContent = taskText;
        successBoard.appendChild(successItem);
    }
}

// Sauvegarder le tableau dans LocalStorage
function saveBoard() {
    let columns = [];
    document.querySelectorAll(".column").forEach(col => {
        let tasks = [];
        col.querySelectorAll(".task").forEach(task => {
            tasks.push(task.textContent);
        });
        columns.push({ id: col.getAttribute("data-id"), tasks: tasks });
    });
    localStorage.setItem("kanbanBoard", JSON.stringify(columns));
}

// Charger l'état du tableau depuis LocalStorage
function loadBoard() {
    let boardData = JSON.parse(localStorage.getItem("kanbanBoard"));
    if (!boardData) return;
    
    boardData.forEach(colData => {
        let column = document.createElement("div");
        column.className = "column";
        column.setAttribute("data-id", colData.id);
        column.innerHTML = `
            <h2>${colData.id}</h2>
            <div class="task-list" id="${colData.id}" ondrop="drop(event)" ondragover="allowDrop(event)"></div>
            <button class="add-task" onclick="addTask('${colData.id}')">+ Ajouter</button>
            <button class="remove-column" onclick="removeColumn('${colData.id}')">Supprimer</button>
        `;
        document.getElementById("kanban-board").appendChild(column);
        colData.tasks.forEach(taskText => {
            let task = createTaskElement(taskText);
            column.querySelector(".task-list").appendChild(task);
        });
    });

    addDragAndDropEvents();
    loadSuccessBoard();
}

// Charger le tableau "Succès" depuis LocalStorage
function loadSuccessBoard() {
    const successBoard = document.getElementById("success-board");
    let successData = JSON.parse(localStorage.getItem("successBoard"));
    
    if (successData) {
        successData.forEach(taskText => {
            let successItem = document.createElement("li");
            successItem.textContent = taskText;
            successBoard.appendChild(successItem);
        });
    }
}