let fieldCount = 0;
const locatorSection = document.getElementById("locator-section");
const addField = document.getElementById("add-field");
const resetButton = document.getElementById("reset");

addField.onclick = () => addLocatorRow();
resetButton.onclick = () => {
  locatorSection.innerHTML = "";
  fieldCount = 0;
  addLocatorRow();
};

function addLocatorRow() {
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
    </select>
    <input class="actionValue" placeholder="Value (for input/select)" style="display:none;">
    <button class="add-field-button">+</button>
    <button class="remove-field-button">-</button>
  `;

  const actionDropdown = row.querySelector(".action");
  const actionValueInput = row.querySelector(".actionValue");

  function toggleActionValueVisibility() {
    // Show actionValue input for "input" and "select" actions only
    actionValueInput.style.display =
      actionDropdown.value === "input" || actionDropdown.value === "select"
        ? "inline-block"
        : "none";
  }

  toggleActionValueVisibility();
  actionDropdown.addEventListener("change", toggleActionValueVisibility);

  row.querySelector(".add-field-button").onclick = () => addLocatorRow();
  row.querySelector(".remove-field-button").onclick = () => {
    if (locatorSection.children.length > 1) {
      locatorSection.removeChild(row);
      fieldCount--;
    }
  };

  locatorSection.appendChild(row);
  fieldCount++;
}

addLocatorRow();

document.getElementById("start").onclick = async () => {
  const loop = parseInt(document.getElementById("loopCount").value || "1");
  const tasks = [];
  document.querySelectorAll(".row").forEach((row) => {
    const locatorTypeEl = row.querySelector(".locatorType");
    const locatorValueEl = row.querySelector(".locatorValue");
    const actionEl = row.querySelector(".action");
    const actionValueEl = row.querySelector(".actionValue");

    if (!locatorTypeEl || !locatorValueEl || !actionEl || !actionValueEl) return;

    const locatorType = locatorTypeEl.value;
    const locatorValue = locatorValueEl.value;
    const action = actionEl.value;

    // For both "input" and "select", take the value from actionValue input
    const actionValue =
      action === "input" || action === "select" ? actionValueEl.value : "";

    if (locatorValue.trim()) {
      tasks.push({ locatorType, locatorValue, action, actionValue });
    }
  });

  if (tasks.length === 0) {
    alert("Please provide at least one valid locator.");
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => localStorage.setItem("__automationStopped__", "false"),
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [tasks, loop],
    func: (tasks, loop) => {
      const getElement = (type, value) => {
        try {
          switch (type) {
            case "css":
              return document.querySelector(value);
            case "id":
              return document.getElementById(value);
            case "name":
              return document.getElementsByName(value)[0];
            case "xpath":
              return document.evaluate(
                value,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              ).singleNodeValue;
            default:
              return null;
          }
        } catch (e) {
          console.error("Invalid selector:", value);
          return null;
        }
      };

      const simulateTyping = (el, value) => {
        el.focus();
        el.value = "";
        for (const char of value) {
          el.value += char;
          el.dispatchEvent(new InputEvent("input", { bubbles: true, data: char }));
        }
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };

      const generateRandomString = () =>
        Math.random()
          .toString(36)
          .substring(2, 7);
      const delay = (ms) => new Promise((r) => setTimeout(r, ms));

      (async () => {
        for (let i = 0; i < loop; i++) {
          if (localStorage.getItem("__automationStopped__") === "true") break;
          for (const task of tasks) {
            if (localStorage.getItem("__automationStopped__") === "true") return;
            const el = getElement(task.locatorType, task.locatorValue);
            if (!el) continue;
            switch (task.action) {
              case "click":
                el.click();
                break;
              case "input":
                simulateTyping(el, task.actionValue);
                break;
              case "random_string":
                simulateTyping(el, generateRandomString());
                break;
              case "select":
                el.value = task.actionValue;
                el.dispatchEvent(new Event("change", { bubbles: true }));
                break;
            }
            await delay(300);
          }
        }
      })();
    },
  });
};

document.getElementById("stop").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => localStorage.setItem("__automationStopped__", "true"),
  });
};
