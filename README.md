# Locator Action Automator Chrome Extension
## Overview
A Chrome extension that automates web interactions by executing predefined actions on page elements identified by various locators (CSS, ID, Name, XPath). Supports recording, importing, and exporting test sequences.

## Features

- **Multiple Locator Types**:
  - CSS Selectors
  - Element ID
  - Name attribute
  - XPath expressions

- **Action Types**:
  - Click elements
  - Input text
  - Generate random strings
  - Select dropdown options
  - Wait/delay between actions
  - Loop entire sequences

- **Import/Export**:
  - Save test sequences as JSON
  - Load previously saved configurations
  - Share test cases with team members

- **Execution Control**:
  - Start/stop automation
  - Set loop counts
  - Real-time status feedback

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" and select the extension directory

## Usage

### Creating Test Sequences
1. Click "+" buttons to add new action rows
2. For each action:
   - Select locator type (CSS, ID, Name, XPath)
   - Enter locator value
   - Choose action type
   - Provide action value if required

### Running Tests
1. Set loop count (default: 1)
2. Click "Start" to begin execution
3. Click "Stop" to abort current execution

### Import/Export
- **Export**: Click "Export" to save current sequence as JSON
- **Import**: Click "Import" and select a JSON file

### Example Test Case
```json
[
  {
    "locatorType": "css",
    "locatorValue": "#username",
    "action": "input",
    "actionValue": "testuser"
  },
  {
    "locatorType": "css",
    "locatorValue": "#password",
    "action": "input",
    "actionValue": "secure123"
  },
  {
    "locatorType": "css",
    "locatorValue": "#login-button",
    "action": "click"
  }
]
```




https://github.com/user-attachments/assets/80fccde5-fb9e-4e5f-92f2-c9464001e118

