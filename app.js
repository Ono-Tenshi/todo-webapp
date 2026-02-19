if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
        console.log("通知許可:", permission);
    });
}
navigator.serviceWorker.getRegistration().then(reg => {
    alert("SW登録状態: " + (reg ? "あり" : "なし"));
});

window.addEventListener("load", () => {
    alert("通知状態: " + Notification.permission);
});

const enableBtn = document.getElementById("enableNotificationBtn");

enableBtn.addEventListener("click", () => {
    if (!("Notification" in window)) {
        alert("このブラウザは通知に対応していません");
        return;
    }

    Notification.requestPermission().then(permission => {
        alert("通知状態: " + permission);
    });
});


const input = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("todoList");
const deadlineInput = document.getElementById("deadlineInput");

function updateSummary() {
    const total = list.children.length; // liの総数
    const done = list.querySelectorAll("span.done").length; // 完了済みの数
    const notDone = total - done; // 未完了の数

    document.getElementById("summary").textContent = `合計:${total} 完了:${done} 未完了:${notDone}`;
}

function saveTodos() {
    const todos = [];
    list.querySelectorAll("li").forEach(li => {
        const span = li.querySelector("span");
        todos.push({
            text: span.textContent,
            done: span.classList.contains("done"),
            deadline: li.dataset.deadline || null
        });
    });
    localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
    // 保存していたタスクを取得
    const todos = JSON.parse(localStorage.getItem("todos")) || [];

    // 配列を順番に処理して画面に表示
    todos.forEach(todo => {
        // createTodoElement に文字と完了状態を渡す
        createTodoElement(todo.text, todo.done, todo.deadline);
    });

    // 日数表示も更新
    updateSummary();
}

window.addEventListener("load", loadTodos);

function createTodoElement(text, doneState = false, deadline = null) {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = text;
    if (doneState) {
        span.classList.add("done");
        span.style.textDecoration = "line-through";
    }

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "完了";
    doneBtn.addEventListener("click", function () {
        span.classList.toggle("done");
        span.style.textDecoration = span.classList.contains("done") ? "line-through" : "none";
        updateSummary();
        saveTodos();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", function () {
        list.removeChild(li);
        updateSummary();
        saveTodos();
    });

    if (deadline) {
        li.dataset.deadline = deadline;

        const deadlineSpan = document.createElement("small");
        deadlineSpan.textContent = "期限:" + new Date(deadline).toLocaleString();
        li.appendChild(deadlineSpan);
    }

    li.appendChild(span);
    li.appendChild(doneBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);
}

addBtn.addEventListener("click", function () {
    const text = input.value.trim();
    const deadline = deadlineInput.value;
    if (!text) return;

    createTodoElement(text, false, deadline);
    updateSummary();
    saveTodos();
    input.value = "";
    deadlineInput.value = "";
});

setInterval(() => {
    console.log("チェック中");
    const now = new Date();

    document.querySelectorAll("li").forEach(li => {
        const deadline = li.dataset.deadline;
        const span = li.querySelector("span");

        if (!deadline) return;
        if (span.classList.contains("done")) return;

        const deadlineDate = new Date(deadline);

        if (deadlineDate <= now) {
            console.log("期限到達！");
        }

        if (deadlineDate <= now && !li.dataset.notified) {

            new Notification("⏰ 期限です！", {
                body: span.textContent
            });

            li.dataset.notified = "true";
        }
    });

}, 10000);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
        .then(reg => console.log("SW registered"))
        .catch(err => console.log("SW error", err));
}
