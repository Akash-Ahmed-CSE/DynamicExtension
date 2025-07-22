# 🔁 Locator Action Automator - Chrome Extension

A lightweight Chrome extension to automate form interactions and generate data on any webpage using CSS, ID, Name, or XPath selectors.

## ✨ Features

- Supports **looped automation** for repeated input
- Supports locator types: **CSS**, **ID**, **Name**, and **XPath**
- Performs actions: **Click**, **Input**, **Random String**, and **Select**
- Includes **Start**, **Stop**, and **Reset** controls
- Keeps extension popup open during page interactions
- Works across all standard websites

## 🚀 Getting Started

1. **Clone or Download** this repo.
2. Open **Chrome** and navigate to:
chrome://extensions/
3. Enable **Developer Mode**.
4. Click **"Load unpacked"** and select the folder containing the extension.

## 🔧 Usage

1. Open the popup.
2. Add locator details:
- **Locator Type**: css / id / name / xpath
- **Locator Value**: e.g., `#username`, `//input[@type='text']`
- **Action**: click / input / random_string / select
- **Action Value**: (Optional) Text or value to input/select
3. Set the **loop count** (how many times to repeat).
4. Click **Start** to begin automation.
5. Use **Stop** to halt it anytime.
6. **Reset** clears your inputs.

## 🛑 Limitations

- Best suited for **small forms** and **simple input workflows**
- Not designed to replace full-featured automation frameworks like Selenium or Playwright

## 🧠 Notes

- Extension does not close automatically on page interaction
- You can test it on any form-based webpage
- Uses localStorage to persist stop flags and prevent loop continuation

## 💡 Roadmap (Planned)

- Support for dynamic delays
- Validation and result status per step
- Export/Import task sets
- Dark mode UI

## 🙋 Feedback

https://github.com/user-attachments/assets/4c071ac9-760e-4f90-bc89-0e954d64a90f



This was built in a day as a prototype. I'm actively improving it.  
**Suggestions, bug reports, and contributions are very welcome!**

---

**Made with 💻 by [Akash Ahmed]**
