let isStopped = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "stop") {
    isStopped = true;

    if (sender.tab?.id) {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: () => localStorage.setItem("__automationStopped__", "true"),
      });
    }
    return;
  }

  if (message.command === "start") {
    isStopped = false;

    if (sender.tab?.id) {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: () => localStorage.removeItem("__automationStopped__"),
      });
    }

    chrome.scripting.executeScript({
      target: { tabId: message.tabId },
      args: [message.tasks, message.loop],
      func: (tasks, loop) => {
        const getElement = (type, value) => {
          try {
            switch (type) {
              case "css":
                return document.querySelector(value);
              case "id":
                return document.getElementById(value.replace(/^#/, ""));
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
            console.error("Selector error:", value, e);
            return null;
          }
        };

        const simulateTyping = (element, value) => {
          element.focus();
          element.value = "";
          element.dispatchEvent(new Event("input", { bubbles: true }));
          for (const char of value) {
            element.value += char;
            element.dispatchEvent(
              new InputEvent("input", { bubbles: true, data: char })
            );
          }
          element.dispatchEvent(new Event("change", { bubbles: true }));
        };

        const generateRandomString = () => {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          let result = "";
          for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        };

        const delay = (ms) => new Promise((res) => setTimeout(res, ms));
        const checkStopped = () => localStorage.getItem("__automationStopped__") === "true";

        (async () => {
          for (let i = 1; i <= loop; i++) {
            if (checkStopped()) return;

            for (const task of tasks) {
              if (checkStopped()) return;

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
                  const randomStr = generateRandomString();
                  simulateTyping(el, randomStr);
                  break;

                case "select":
                  el.value = task.actionValue;
                  el.dispatchEvent(new Event("change", { bubbles: true }));
                  break;
              }

              await delay(500); // Wait between each action
            }
          }
        })();
      }
    });
  }
});
