let abortController = new AbortController();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "stopAutomation") {
    console.log("[Content] Received STOP command");
    abortController.abort();
    return;
  }

  if (message.command === "startAutomation") {
    console.log("[Content] Starting automation");
    runAutomation(message.tasks, message.loop);
  }
});

async function runAutomation(tasks, loop) {
  abortController = new AbortController();
  const signal = abortController.signal;

  try {
    for (let i = 0; i < loop && !signal.aborted; i++) {
      console.log(`Starting loop ${i + 1}/${loop}`);
      
      for (const task of tasks) {
        if (signal.aborted) break;

        if (task.action === "wait") {
          await waitWithAbort(parseInt(task.actionValue) || 500, signal);
          continue;
        }

        const el = await findElement(task.locatorType, task.locatorValue, signal);
        if (!el || signal.aborted) continue;

        await performAction(el, task.action, task.actionValue, signal);
        await waitWithAbort(300, signal);
      }
    }
  } catch (err) {
    if (!signal.aborted) {
      console.error("Automation error:", err);
    }
  }
}

async function findElement(type, value, signal) {
  for (let retry = 0; retry < 10 && !signal.aborted; retry++) {
    const el = getElement(type, value);
    if (el) return el;
    await waitWithAbort(300, signal);
  }
  return null;
}

function getElement(type, value) {
  if (!value?.trim()) return null;
  try {
    switch (type) {
      case "css": return document.querySelector(value);
      case "id": return document.getElementById(value.replace(/^#/, ""));
      case "name": return document.getElementsByName(value)[0];
      case "xpath": 
        return document.evaluate(value, document, null, 
          XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      default: return null;
    }
  } catch (err) {
    console.error("Selector error:", err);
    return null;
  }
}

async function performAction(el, action, value, signal) {
  if (signal.aborted) return;

  switch (action) {
    case "click":
      el.click();
      break;
    case "input":
      await typeText(el, value || "", signal);
      break;
    case "random_string":
      await typeText(el, generateRandomString(), signal);
      break;
    case "select":
      el.value = value || "";
      el.dispatchEvent(new Event("change", { bubbles: true }));
      break;
  }
}

async function typeText(el, text, signal) {
  el.focus();
  el.value = "";
  for (const char of text) {
    if (signal.aborted) return;
    el.value += char;
    el.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await waitWithAbort(50, signal); // Simulate typing speed
  }
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function generateRandomString() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({length: 5}, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

function waitWithAbort(ms, signal) {
  return new Promise(resolve => {
    if (signal.aborted) return resolve();
    
    const timeout = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}