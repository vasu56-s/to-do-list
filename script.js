/* =========================================
   DOM ELEMENTS
========================================= */

const taskInput = document.getElementById("taskInput");

const addTaskButton = document.getElementById("addTaskButton");

const prioritySelect =
    document.getElementById("prioritySelect");

const dueDate =
    document.getElementById("dueDate");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const emptyTitle =
    document.getElementById("emptyTitle");

const emptyMessage =
    document.getElementById("emptyMessage");

const totalTasks =
    document.getElementById("totalTasks");

const activeTasks =
    document.getElementById("activeTasks");

const completedTasks =
    document.getElementById("completedTasks");

const searchInput =
    document.getElementById("searchInput");

const clearCompleted =
    document.getElementById("clearCompleted");

const clearAll =
    document.getElementById("clearAll");

const themeToggle =
    document.getElementById("themeToggle");

const toast =
    document.getElementById("toast");

const filterButtons =
    document.querySelectorAll(".filter-button");


/* =========================================
   APPLICATION STATE
========================================= */

let tasks =
    JSON.parse(
        localStorage.getItem("taskflow_tasks")
    ) || [];

let currentFilter = "all";

let searchTerm = "";


/* =========================================
   SAVE TASKS
========================================= */

function saveTasks() {

    localStorage.setItem(
        "taskflow_tasks",
        JSON.stringify(tasks)
    );
}


/* =========================================
   CREATE UNIQUE ID
========================================= */

function createId() {

    return Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 9);
}


/* =========================================
   ADD TASK
========================================= */

function addTask() {

    const text =
        taskInput.value.trim();

    if (text === "") {

        showToast("Please enter a task.");

        taskInput.focus();

        return;
    }


    const task = {

        id: createId(),

        text: text,

        completed: false,

        priority:
            prioritySelect.value,

        dueDate:
            dueDate.value || null,

        createdAt:
            new Date().toISOString()
    };


    tasks.unshift(task);


    saveTasks();


    taskInput.value = "";

    dueDate.value = "";

    prioritySelect.value = "medium";


    renderTasks();

    showToast("Task added successfully.");

    taskInput.focus();
}


/* =========================================
   DELETE TASK
========================================= */

function deleteTask(id) {

    const confirmed =
        confirm("Delete this task?");

    if (!confirmed) {
        return;
    }


    tasks =
        tasks.filter(
            task => task.id !== id
        );


    saveTasks();

    renderTasks();

    showToast("Task deleted.");
}


/* =========================================
   TOGGLE TASK
========================================= */

function toggleTask(id) {

    tasks =
        tasks.map(task => {

            if (task.id === id) {

                return {
                    ...task,
                    completed:
                        !task.completed
                };
            }

            return task;
        });


    saveTasks();

    renderTasks();
}


/* =========================================
   EDIT TASK
========================================= */

function editTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );

    if (!task) {
        return;
    }


    const newText =
        prompt(
            "Edit your task:",
            task.text
        );


    if (newText === null) {
        return;
    }


    const cleanedText =
        newText.trim();


    if (cleanedText === "") {

        showToast(
            "Task cannot be empty."
        );

        return;
    }


    task.text =
        cleanedText;


    saveTasks();

    renderTasks();

    showToast("Task updated.");
}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================
   CHECK IF TASK IS OVERDUE
========================================= */

function isOverdue(task) {

    if (
        !task.dueDate ||
        task.completed
    ) {
        return false;
    }


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const due =
        new Date(
            task.dueDate + "T00:00:00"
        );


    return due < today;
}


/* =========================================
   FILTER TASKS
========================================= */

function getFilteredTasks() {

    let filtered =
        [...tasks];


    /* Status filter */

    if (currentFilter === "active") {

        filtered =
            filtered.filter(
                task => !task.completed
            );
    }


    if (currentFilter === "completed") {

        filtered =
            filtered.filter(
                task => task.completed
            );
    }


    /* Search */

    if (searchTerm) {

        filtered =
            filtered.filter(task =>
                task.text
                    .toLowerCase()
                    .includes(
                        searchTerm.toLowerCase()
                    )
            );
    }


    return filtered;
}


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

    taskList.innerHTML = "";


    const filteredTasks =
        getFilteredTasks();


    /* Empty state */

    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";


        if (tasks.length === 0) {

            emptyTitle.textContent =
                "No tasks yet";

            emptyMessage.textContent =
                "Add your first task and start being productive.";

        } else if (searchTerm) {

            emptyTitle.textContent =
                "No matching tasks";

            emptyMessage.textContent =
                "Try searching for something else.";

        } else if (currentFilter === "active") {

            emptyTitle.textContent =
                "No active tasks";

            emptyMessage.textContent =
                "Great! You have completed everything.";

        } else if (currentFilter === "completed") {

            emptyTitle.textContent =
                "No completed tasks";

            emptyMessage.textContent =
                "Completed tasks will appear here.";

        }

    } else {

        emptyState.style.display = "none";
    }


    /* Create each task */

    filteredTasks.forEach(task => {

        const li =
            document.createElement("li");


        li.className = "task-item";


        if (task.completed) {

            li.classList.add("completed");
        }


        /* Checkbox */

        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.className =
            "task-checkbox";

        checkbox.checked =
            task.completed;


        checkbox.addEventListener(
            "change",
            () => toggleTask(task.id)
        );


        /* Content */

        const content =
            document.createElement("div");

        content.className =
            "task-content";


        const text =
            document.createElement("div");

        text.className =
            "task-text";

        text.textContent =
            task.text;


        /* Metadata */

        const meta =
            document.createElement("div");

        meta.className =
            "task-meta";


        /* Priority */

        const priority =
            document.createElement("span");

        priority.className =
            `priority-badge priority-${task.priority}`;

        priority.textContent =
            task.priority;


        meta.appendChild(priority);


        /* Due date */

        if (task.dueDate) {

            const date =
                document.createElement("span");


            date.textContent =
                isOverdue(task)
                    ? `⚠ Overdue: ${formatDate(task.dueDate)}`
                    : `Due: ${formatDate(task.dueDate)}`;


            if (isOverdue(task)) {

                date.style.color =
                    "#dc2626";

                date.style.fontWeight =
                    "700";
            }


            meta.appendChild(date);
        }


        content.appendChild(text);

        content.appendChild(meta);


        /* Actions */

        const actions =
            document.createElement("div");

        actions.className =
            "task-actions";


        /* Edit */

        const editButton =
            document.createElement("button");

        editButton.className =
            "action-button edit-button";

        editButton.innerHTML =
            "✏️";

        editButton.title =
            "Edit task";

        editButton.setAttribute(
            "aria-label",
            "Edit task"
        );


        editButton.addEventListener(
            "click",
            () => editTask(task.id)
        );


        /* Delete */

        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "action-button delete-button";

        deleteButton.innerHTML =
            "🗑️";

        deleteButton.title =
            "Delete task";

        deleteButton.setAttribute(
            "aria-label",
            "Delete task"
        );


        deleteButton.addEventListener(
            "click",
            () => deleteTask(task.id)
        );


        actions.appendChild(editButton);

        actions.appendChild(deleteButton);


        /* Put everything together */

        li.appendChild(checkbox);

        li.appendChild(content);

        li.appendChild(actions);


        taskList.appendChild(li);

    });


    updateStats();
}


/* =========================================
   UPDATE STATISTICS
========================================= */

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const active =
        total - completed;


    totalTasks.textContent =
        total;

    activeTasks.textContent =
        active;

    completedTasks.textContent =
        completed;
}


/* =========================================
   FILTER BUTTONS
========================================= */

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );
            });


            button.classList.add(
                "active"
            );


            currentFilter =
                button.dataset.filter;


            renderTasks();
        }
    );
});


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    () => {

        searchTerm =
            searchInput.value.trim();

        renderTasks();
    }
);


/* =========================================
   CLEAR COMPLETED
========================================= */

clearCompleted.addEventListener(
    "click",
    () => {

        const completedCount =
            tasks.filter(
                task => task.completed
            ).length;


        if (completedCount === 0) {

            showToast(
                "There are no completed tasks."
            );

            return;
        }


        const confirmed =
            confirm(
                "Clear all completed tasks?"
            );


        if (!confirmed) {
            return;
        }


        tasks =
            tasks.filter(
                task => !task.completed
            );


        saveTasks();

        renderTasks();

        showToast(
            "Completed tasks cleared."
        );
    }
);


/* =========================================
   CLEAR ALL
========================================= */

clearAll.addEventListener(
    "click",
    () => {

        if (tasks.length === 0) {

            showToast(
                "There are no tasks to clear."
            );

            return;
        }


        const confirmed =
            confirm(
                "Delete all tasks? This cannot be undone."
            );


        if (!confirmed) {
            return;
        }


        tasks = [];


        saveTasks();

        renderTasks();

        showToast(
            "All tasks cleared."
        );
    }
);


/* =========================================
   ENTER KEY
========================================= */

taskInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            addTask();
        }
    }
);


/* =========================================
   ADD BUTTON
========================================= */

addTaskButton.addEventListener(
    "click",
    addTask
);


/* =========================================
   THEME
========================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "taskflow_theme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

        themeToggle.textContent =
            "☀️";

    } else {

        themeToggle.textContent =
            "🌙";
    }
}


themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );


        const isDark =
            document.body.classList.contains(
                "dark-mode"
            );


        localStorage.setItem(
            "taskflow_theme",
            isDark ? "dark" : "light"
        );


        themeToggle.textContent =
            isDark ? "☀️" : "🌙";
    }
);


/* =========================================
   TOAST
========================================= */

let toastTimeout;


function showToast(message) {

    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );
}


/* =========================================
   INITIALIZE APPLICATION
========================================= */

loadTheme();

renderTasks();