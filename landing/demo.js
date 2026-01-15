/**
 * ReactRecall Landing Page - Interactive Demo
 * Windows are draggable, user interacts with the chat to trigger the demo
 */

// ============================================
// STATE
// ============================================
let counts = { event: 0, log: 0, error: 0, network: 0 };
let selectedLogs = new Set();
let logEntries = [];
let hasTriggeredDemo = false;
let claudeIsTyping = false;

// ============================================
// DOM ELEMENTS
// ============================================
const desktop = document.getElementById('desktop');
const browserWindow = document.getElementById('browserWindow');
const terminalWindow = document.getElementById('terminalWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const errorToast = document.getElementById('errorToast');
const recallTimeline = document.getElementById('recallTimeline');
const terminalOutput = document.getElementById('terminalOutput');
const recallActionBar = document.getElementById('recallActionBar');
const copyLogsBtn = document.getElementById('copyLogsBtn');

// ============================================
// WINDOW DRAGGING
// ============================================
let activeWindow = null;
let dragOffset = { x: 0, y: 0 };

function initDragging() {
  const windows = document.querySelectorAll('.window');

  windows.forEach(win => {
    const titlebar = win.querySelector('.window-titlebar');

    titlebar.addEventListener('mousedown', (e) => {
      // Don't drag if clicking controls
      if (e.target.closest('.window-controls')) return;

      // Only on desktop
      if (window.innerWidth <= 768) return;

      activeWindow = win;
      const rect = win.getBoundingClientRect();
      const desktopRect = desktop.getBoundingClientRect();

      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;

      win.classList.add('dragging');
      bringToFront(win);

      e.preventDefault();
    });

    // Click to focus
    win.addEventListener('mousedown', () => {
      bringToFront(win);
    });
  });

  document.addEventListener('mousemove', (e) => {
    if (!activeWindow) return;

    const desktopRect = desktop.getBoundingClientRect();
    let newX = e.clientX - desktopRect.left - dragOffset.x;
    let newY = e.clientY - desktopRect.top - dragOffset.y;

    // Constrain to desktop bounds
    const winRect = activeWindow.getBoundingClientRect();
    const maxX = desktopRect.width - winRect.width;
    const maxY = desktopRect.height - winRect.height;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    activeWindow.style.left = newX + 'px';
    activeWindow.style.top = newY + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (activeWindow) {
      activeWindow.classList.remove('dragging');
      activeWindow = null;
    }
  });
}

function bringToFront(win) {
  document.querySelectorAll('.window').forEach(w => {
    w.classList.remove('focused');
    w.style.zIndex = '1';
  });
  win.classList.add('focused');
  win.style.zIndex = '50';
}

// ============================================
// UTILITIES
// ============================================
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function updateCount(type) {
  counts[type]++;
  const el = document.getElementById(`${type}Count`);
  if (el) el.textContent = counts[type];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// CHAT UI
// ============================================
function addUserMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'message message-user';
  msg.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoadingSpinner() {
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  spinner.id = 'loadingSpinner';
  chatMessages.appendChild(spinner);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeLoadingSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) spinner.remove();
}

function showErrorToast() {
  errorToast.classList.add('visible');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}

// ============================================
// REACTRECALL TIMELINE
// ============================================
function clearTimeline() {
  recallTimeline.innerHTML = '<div class="timeline-empty"><span>Interact with the app to see events</span></div>';
  logEntries = [];
  selectedLogs.clear();
  updateActionBar();
}

function addLogEntry(type, label, details, extra = {}) {
  // Remove empty state
  const empty = recallTimeline.querySelector('.timeline-empty');
  if (empty) empty.remove();

  const time = getCurrentTime();
  const dotColor = {
    event: 'blue',
    log: 'gray',
    error: 'red',
    network: 'purple'
  }[type];

  let statusHtml = '';
  if (extra.status) {
    const statusClass = extra.status >= 400 ? 'error' : 'success';
    statusHtml = `<span class="log-status ${statusClass}">${extra.status}</span>`;
  }

  let durationHtml = '';
  if (extra.duration) {
    durationHtml = `<span class="log-duration">${extra.duration}ms</span>`;
  }

  const index = logEntries.length;
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.dataset.index = index;
  entry.innerHTML = `
    <input type="checkbox" class="log-checkbox" data-index="${index}">
    <span class="log-dot ${dotColor}"></span>
    <div class="log-content">
      <div class="log-header">
        <span class="log-type">${label}</span>
        ${statusHtml}
        ${durationHtml}
        <span class="log-time">${time}</span>
      </div>
      <div class="log-details">${escapeHtml(details)}</div>
    </div>
  `;

  const logData = { type, label, details, time, extra };
  logEntries.push(logData);

  recallTimeline.appendChild(entry);
  recallTimeline.scrollTop = recallTimeline.scrollHeight;

  updateCount(type);

  return entry;
}

function highlightLogEntry(index) {
  const entries = recallTimeline.querySelectorAll('.log-entry');
  entries.forEach((e, i) => {
    if (i === index) {
      e.classList.add('highlight');
    } else {
      e.classList.remove('highlight');
    }
  });
}

function clearHighlights() {
  recallTimeline.querySelectorAll('.log-entry').forEach(e => {
    e.classList.remove('highlight');
  });
}

// ============================================
// LOG SELECTION
// ============================================
function initLogSelection() {
  recallTimeline.addEventListener('click', (e) => {
    const checkbox = e.target.closest('.log-checkbox');
    const entry = e.target.closest('.log-entry');

    if (checkbox) {
      const index = parseInt(checkbox.dataset.index);
      if (checkbox.checked) {
        selectedLogs.add(index);
        entry.classList.add('selected');
      } else {
        selectedLogs.delete(index);
        entry.classList.remove('selected');
      }
      updateActionBar();
    } else if (entry && !e.target.closest('.log-checkbox')) {
      // Click on entry (not checkbox) toggles selection
      const index = parseInt(entry.dataset.index);
      const checkbox = entry.querySelector('.log-checkbox');
      if (selectedLogs.has(index)) {
        selectedLogs.delete(index);
        entry.classList.remove('selected');
        checkbox.checked = false;
      } else {
        selectedLogs.add(index);
        entry.classList.add('selected');
        checkbox.checked = true;
      }
      updateActionBar();
    }
  });

  copyLogsBtn.addEventListener('click', copySelectedLogs);
}

function updateActionBar() {
  const count = selectedLogs.size;
  document.getElementById('selectedCount').textContent = count;
  if (count > 0) {
    recallActionBar.classList.add('visible');
  } else {
    recallActionBar.classList.remove('visible');
  }
}

async function copySelectedLogs() {
  const selected = Array.from(selectedLogs).sort((a, b) => a - b);
  const text = selected.map(i => {
    const log = logEntries[i];
    return `[${log.time}] ${log.label}: ${log.details}`;
  }).join('\n');

  await navigator.clipboard.writeText(text);

  copyLogsBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    Copied!
  `;

  setTimeout(() => {
    copyLogsBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      Copy
    `;
  }, 1500);
}

// ============================================
// TERMINAL / CLAUDE CODE
// ============================================
function clearTerminal() {
  terminalOutput.innerHTML = `
    <div class="claude-welcome">
      <span class="claude-logo">◆</span> <span class="claude-title">Claude Code</span> <span class="claude-version">v1.0.0</span>
    </div>
    <div class="claude-hint">
      Watching ReactRecall logs at localhost:4312...
    </div>
  `;
}

async function typeText(element, text, speed = 15) {
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  element.appendChild(cursor);

  for (let i = 0; i < text.length; i++) {
    const textNode = document.createTextNode(text[i]);
    element.insertBefore(textNode, cursor);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    await sleep(speed);
  }

  cursor.remove();
}

function addTerminalLine(html) {
  const lineEl = document.createElement('div');
  lineEl.className = 'claude-line';
  lineEl.innerHTML = html;
  terminalOutput.appendChild(lineEl);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
  return lineEl;
}

async function claudeInvestigates() {
  if (claudeIsTyping) return;
  claudeIsTyping = true;

  bringToFront(terminalWindow);

  await sleep(500);

  // Line 1
  let line = addTerminalLine('<span class="claude-bullet">●</span> ');
  await typeText(line, 'I detected an error in the ReactRecall logs. Let me investigate.', 20);

  await sleep(400);

  // Highlight error in timeline
  highlightLogEntry(logEntries.length - 1);
  bringToFront(browserWindow);

  await sleep(800);
  bringToFront(terminalWindow);

  // Line 2 - Grep
  addTerminalLine('<span class="claude-bullet">●</span> <span class="claude-tool">Grep</span>(pattern: "500|error", path: ".react-recall/logs.jsonl")');

  await sleep(300);

  addTerminalLine('<div class="claude-result">Found 2 matches in logs</div>');

  await sleep(500);

  // Highlight network entry
  highlightLogEntry(logEntries.length - 2);

  await sleep(600);

  // Line 3 - Analysis
  line = addTerminalLine('<span class="claude-bullet">●</span> ');
  await typeText(line, 'The /api/chat endpoint returned a 500 error. Checking the response body...', 18);

  await sleep(400);

  // Line 4 - Read
  addTerminalLine('<span class="claude-bullet">●</span> <span class="claude-tool">Read</span>(.react-recall/logs.jsonl)');

  await sleep(300);

  addTerminalLine('<div class="claude-result">POST 500 /api/chat (342ms)<br>Response: {"error": "Missing API key"}</div>');

  await sleep(700);

  clearHighlights();

  // Line 5 - Solution
  line = addTerminalLine('<span class="claude-bullet">●</span> ');
  await typeText(line, 'Found it! The API key is missing. Add this to your .env file:', 20);

  await sleep(200);

  addTerminalLine('<div class="claude-code">OPENAI_API_KEY=sk-...</div>');

  await sleep(300);

  line = addTerminalLine('<span class="claude-bullet">●</span> ');
  await typeText(line, 'Then restart your dev server and try again.', 20);

  claudeIsTyping = false;
}

// ============================================
// DEMO FLOW - Triggered by user clicking Send
// ============================================
async function handleSendClick() {
  const message = chatInput.value.trim();
  if (!message) return;

  // Add user message
  addUserMessage(message);
  chatInput.value = '';

  // Log the click
  addLogEntry('event', 'Click', '"Send" (ChatInput > SendButton)');

  await sleep(100);

  // Log the input
  addLogEntry('event', 'Input', `value: "${message}"`);

  // Show loading
  addLoadingSpinner();

  await sleep(800);

  // Simulate API call
  addLogEntry('network', 'POST', '/api/chat', { status: 500, duration: 342 });

  await sleep(200);

  // Error
  addLogEntry('error', 'Error', 'Failed to fetch chat response: Missing API key');

  await sleep(100);

  // Remove loading, show error toast
  removeLoadingSpinner();
  showErrorToast();

  // After a moment, Claude starts investigating
  if (!hasTriggeredDemo) {
    hasTriggeredDemo = true;
    await sleep(1200);
    claudeInvestigates();
  }
}

// ============================================
// COPY BUTTONS (for install section)
// ============================================
function initCopyButtons() {
  document.querySelectorAll('.copy-btn[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      if (text) {
        await navigator.clipboard.writeText(text);
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1500);
      }
    });
  });
}

// ============================================
// RESET DEMO
// ============================================
function resetDemo() {
  // Reset chat
  chatMessages.innerHTML = `
    <div class="message message-assistant">
      <div class="message-content">Hello! How can I help you today?</div>
    </div>
  `;
  chatInput.value = "What's the weather?";
  errorToast.classList.remove('visible');
  removeLoadingSpinner();

  // Reset counts
  counts = { event: 0, log: 0, error: 0, network: 0 };
  Object.keys(counts).forEach(type => {
    const el = document.getElementById(`${type}Count`);
    if (el) el.textContent = '0';
  });

  // Reset timeline
  clearTimeline();

  // Reset terminal
  clearTerminal();

  // Reset state
  hasTriggeredDemo = false;
  claudeIsTyping = false;
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initDragging();
  initLogSelection();
  initCopyButtons();

  // Send button click
  sendButton.addEventListener('click', handleSendClick);

  // Enter key in chat input
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  });

  // Focus input to log it (for demo realism)
  chatInput.addEventListener('focus', () => {
    if (logEntries.length > 0) return; // Only log first focus
    // Could add focus event here if desired
  });
});
