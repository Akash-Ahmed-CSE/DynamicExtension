let fieldCount = 0;
const locatorSection = document.getElementById("locator-section");
const resetButton = document.getElementById("reset");
const importBtn = document.getElementById("import");
const exportBtn = document.getElementById("export");
const fileInput = document.getElementById("file-input");
const statusMessage = document.getElementById("status-message");

// Initialize with one empty row
addLocatorRow();

function showStatusMessage(message, isSuccess = true) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${isSuccess ? 'success' : ''}`;
  statusMessage.style.display = 'block';
  
  // Hide the message after 3 seconds
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 3000);
}

function createLocatorRow(task = {}) {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `
    <select class="locatorType">
      <option value="css">CSS</option>
      <option value="id">ID</option>
      <option value="name">Name</option>
      <option value="xpath">XPath</option>
    </select>
    <input class="locatorValue" placeholder="Locator">
    <select class="action">
      <option value="click">Click</option>
      <option value="input">Input</option>
      <option value="random_string">Random String</option>
      <option value="select">Select</option>
      <option value="wait">Wait</option>
    </select>
    <input class="actionValue" placeholder="Value (for input/select)" style="display:none; min-width: 100px;">
    <input class="waitTime" type="number" placeholder="Wait time (ms)" min="0" style="display:none; width: 90px;">
    <div class="row-actions">
      <button class="remove-field-button">-</button>
      <button class="add-field-button">+</button>
    </div>
  `;

  // Set values if task is provided
  if (task.locatorType) {
    row.querySelector(".locatorType").value = task.locatorType;
  }
  if (task.locatorValue) {
    row.querySelector(".locatorValue").value = task.locatorValue;
  }
  if (task.action) {
    row.querySelector(".action").value = task.action;
  }
  if (task.actionValue) {
    if (task.action === "wait") {
      row.querySelector(".waitTime").value = task.actionValue;
    } else if (task.action === "input" || task.action === "select") {
      row.querySelector(".actionValue").value = task.actionValue;
    }
  }

  const locatorTypeDropdown = row.querySelector(".locatorType");
  const locatorValueInput = row.querySelector(".locatorValue");
  const actionDropdown = row.querySelector(".action");
  const actionValueInput = row.querySelector(".actionValue");
  const waitTimeInput = row.querySelector(".waitTime");

  function toggleInputs() {
    const action = actionDropdown.value;

    if (action === "wait") {
      locatorTypeDropdown.disabled = true;
      locatorValueInput.disabled = true;
      locatorValueInput.style.backgroundColor = "#eee";
      actionValueInput.style.display = "none";
      waitTimeInput.style.display = "inline-block";
    } else {
      locatorTypeDropdown.disabled = false;
      locatorValueInput.disabled = false;
      locatorValueInput.style.backgroundColor = "";
      waitTimeInput.style.display = "none";

      if (action === "input" || action === "select") {
        actionValueInput.style.display = "inline-block";
      } else {
        actionValueInput.style.display = "none";
      }
    }
  }

  toggleInputs();
  actionDropdown.addEventListener("change", toggleInputs);

  return row;
}

function addLocatorRow(task = null, referenceRow = null) {
  const row = createLocatorRow(task || {});

  // Add button functionality
  row.querySelector(".add-field-button").addEventListener("click", (e) => {
    e.stopPropagation();
    addLocatorRow(null, row);
  });

  // Remove button functionality
  row.querySelector(".remove-field-button").addEventListener("click", (e) => {
    e.stopPropagation();
    if (locatorSection.children.length > 1) {
      locatorSection.removeChild(row);
      fieldCount--;
    }
  });

  if (referenceRow) {
    referenceRow.after(row);
  } else {
    locatorSection.appendChild(row);
  }
  
  fieldCount++;
}

// Import functionality
importBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const tasks = JSON.parse(text);
    loadTasks(tasks);
    showStatusMessage(`Successfully imported ${tasks.length} task(s)`);
  } catch (error) {
    console.error("Error importing file:", error);
    showStatusMessage("Error importing file. Please check the file format.", false);
  }
  
  fileInput.value = '';
});

// Export functionality
exportBtn.addEventListener("click", () => {
  const tasks = getCurrentTasks();
  if (tasks.length === 0) {
    showStatusMessage("No tasks to export!", false);
    return;
  }

  const jsonData = JSON.stringify(tasks, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "automation-tasks.json";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);

  showStatusMessage(`Successfully exported ${tasks.length} task(s)`);
});

function getCurrentTasks() {
  const tasks = [];
  document.querySelectorAll(".row").forEach((row) => {
    const locatorTypeEl = row.querySelector(".locatorType");
    const locatorValueEl = row.querySelector(".locatorValue");
    const actionEl = row.querySelector(".action");
    const actionValueEl = row.querySelector(".actionValue");
    const waitTimeEl = row.querySelector(".waitTime");

    if (!locatorTypeEl || !locatorValueEl || !actionEl) return;

    const locatorType = locatorTypeEl.value;
    const locatorValue = locatorValueEl.value;
    const action = actionEl.value;

    let actionValue = "";
    if (action === "input" || action === "select") {
      actionValue = actionValueEl.value;
    } else if (action === "wait") {
      actionValue = waitTimeEl.value;
    }

    tasks.push({ locatorType, locatorValue, action, actionValue });
  });
  return tasks;
}

function loadTasks(tasks) {
  locatorSection.innerHTML = "";
  fieldCount = 0;
  
  tasks.forEach(task => addLocatorRow(task));
  
  if (tasks.length === 0) addLocatorRow();
}

// Reset functionality
resetButton.addEventListener("click", () => {
  locatorSection.innerHTML = "";
  fieldCount = 0;
  addLocatorRow();
  document.getElementById("loop-count").value = "1";
  showStatusMessage("UI reset successfully");
});

// Start functionality
document.getElementById("start").onclick = async () => {
  const loop = parseInt(document.getElementById("loop-count").value || "1");
  const tasks = getCurrentTasks();

  if (tasks.length === 0) {
    showStatusMessage("Please provide at least one valid locator or wait action", false);
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.runtime.sendMessage({
    command: "start",
    tabId: tab.id,
    tasks,
    loop,
  });
};