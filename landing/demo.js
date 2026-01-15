/**
 * ReactRecall Landing Page - Interactive Demo
 * Windows are draggable, user interacts with the chat to trigger the demo
 */

// ============================================
// STATE
// ============================================
let counts = { event: 4, log: 1, error: 0, network: 1 };
let selectedLogs = new Set();
let activeFilters = new Set(['event', 'log', 'error', 'network']);
// Pre-populate with initial dummy entries
let logEntries = [
  { type: 'event', label: 'Toggle', details: '"Reasoning" enabled', time: '14:22:45', extra: {} },
  { type: 'event', label: 'Click', details: '"Send" (ChatInput > SendButton)', time: '14:22:47', extra: {} },
  { type: 'event', label: 'Input', details: 'value: "Hi, I heard about ReactRecall..."', time: '14:22:47', extra: {} },
  {
    type: 'network',
    label: 'POST',
    details: '/api/chat',
    time: '14:22:48',
    extra: {
      status: 200,
      duration: 312,
      started: '14:22:47.623',
      completed: '14:22:47.935',
      requestHeaders: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-...a8f2'
      },
      responseHeaders: {
        'content-type': 'application/json',
        'x-request-id': 'req_abc123'
      },
      requestBody: {
        messages: [{ role: 'user', content: 'Hi, I heard about ReactRecall...' }],
        model: 'gpt-4'
      },
      responseBody: {
        id: 'chatcmpl-abc123',
        choices: [{ message: { role: 'assistant', content: 'ReactRecall is a debug...' } }]
      }
    }
  },
  { type: 'log', label: 'Log', details: 'Response received, rendering message', time: '14:22:48', extra: {} },
  { type: 'event', label: 'Copy', details: '"npm install react-recall" (CodeBlock)', time: '14:22:52', extra: {} }
];
let hasTriggeredDemo = false;
let claudeIsTyping = false;

// ============================================
// DOM ELEMENTS
// ============================================
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
// WINDOW DRAGGING & PERSISTENCE
// ============================================
let activeWindow = null;
let dragOffset = { x: 0, y: 0 };

function saveWindowPositions() {
  const windows = document.querySelectorAll('.window');
  const positions = {};

  windows.forEach(win => {
    const rect = win.getBoundingClientRect();
    positions[win.id] = {
      left: rect.left,
      top: rect.top
    };
  });

  localStorage.setItem('reactrecall-window-positions', JSON.stringify(positions));
}

function loadWindowPositions() {
  const saved = localStorage.getItem('reactrecall-window-positions');
  if (!saved) return;

  try {
    const positions = JSON.parse(saved);

    Object.keys(positions).forEach(id => {
      const win = document.getElementById(id);
      if (win && positions[id]) {
        win.style.left = positions[id].left + 'px';
        win.style.top = positions[id].top + 'px';
        win.style.right = 'auto';
        win.style.bottom = 'auto';
      }
    });
  } catch (e) {
    console.warn('Could not restore window positions:', e);
  }
}

function saveToggleStates() {
  const states = {};
  document.querySelectorAll('.chat-action-btn').forEach(btn => {
    states[btn.title] = btn.classList.contains('active');
  });
  localStorage.setItem('reactrecall-toggle-states', JSON.stringify(states));
}

function loadToggleStates() {
  const saved = localStorage.getItem('reactrecall-toggle-states');
  if (!saved) return;

  try {
    const states = JSON.parse(saved);
    document.querySelectorAll('.chat-action-btn').forEach(btn => {
      if (states[btn.title] !== undefined) {
        btn.classList.toggle('active', states[btn.title]);
      }
    });
  } catch (e) {
    console.warn('Could not restore toggle states:', e);
  }
}

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

    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;

    // Keep at least 100px of window visible on screen
    const winRect = activeWindow.getBoundingClientRect();
    const minVisible = 100;

    const maxX = window.innerWidth - minVisible;
    const maxY = window.innerHeight - minVisible;
    const minX = -(winRect.width - minVisible);
    const minY = 0; // Don't let title bar go above viewport

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    activeWindow.style.left = newX + 'px';
    activeWindow.style.top = newY + 'px';
    // Clear right/bottom positioning when dragging
    activeWindow.style.right = 'auto';
    activeWindow.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (activeWindow) {
      activeWindow.classList.remove('dragging');
      saveWindowPositions();
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

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    errorToast.classList.remove('visible');
  }, 3000);
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
  entry.dataset.type = type;

  // Hide if this type is filtered out
  if (!activeFilters.has(type)) {
    entry.style.display = 'none';
  }

  // Generate network details HTML if we have detailed network info
  let detailsButtonHtml = '';
  let networkDetailsHtml = '';
  if (type === 'network' && extra.requestHeaders) {
    detailsButtonHtml = `<button class="expand-btn" onclick="toggleNetworkDetails(${index}, event)" data-index="${index}">Details</button>`;
    networkDetailsHtml = generateNetworkDetailsHtml(index, extra);
  }

  entry.innerHTML = `
    <span class="log-dot ${dotColor}"></span>
    <div class="log-content">
      <div class="log-header">
        <span class="log-type">${label}</span>
        ${statusHtml}
        ${durationHtml}
        ${detailsButtonHtml}
        <span class="log-time">${time}</span>
      </div>
      <div class="log-details">${escapeHtml(details)}</div>
      ${networkDetailsHtml}
    </div>
  `;

  const logData = { type, label, details, time, extra };
  logEntries.push(logData);

  recallTimeline.appendChild(entry);
  recallTimeline.scrollTop = recallTimeline.scrollHeight;

  updateCount(type);

  return entry;
}

function generateNetworkDetailsHtml(index, extra) {
  const reqHeaderCount = extra.requestHeaders ? Object.keys(extra.requestHeaders).length : 0;
  const resHeaderCount = extra.responseHeaders ? Object.keys(extra.responseHeaders).length : 0;

  let reqHeadersRows = '';
  if (extra.requestHeaders) {
    for (const [key, value] of Object.entries(extra.requestHeaders)) {
      reqHeadersRows += `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td></tr>`;
    }
  }

  let resHeadersRows = '';
  if (extra.responseHeaders) {
    for (const [key, value] of Object.entries(extra.responseHeaders)) {
      resHeadersRows += `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td></tr>`;
    }
  }

  const reqBody = extra.requestBody ? JSON.stringify(extra.requestBody, null, 2) : '';
  const resBody = extra.responseBody || '';

  return `
    <div class="network-details" id="network-details-${index}">
      <div class="network-section open" onclick="toggleNetworkSection(event)">
        <div class="network-section-header">
          <span class="chevron">▶</span>
          General
        </div>
        <div class="network-section-content">
          <table class="network-headers-table">
            <tr><td>Started</td><td>${extra.started || 'N/A'}</td></tr>
            <tr><td>Completed</td><td>${extra.completed || 'N/A'}</td></tr>
            <tr><td>Duration</td><td>${extra.duration}ms</td></tr>
            <tr><td>Status</td><td>${extra.status}</td></tr>
          </table>
        </div>
      </div>
      <div class="network-section" onclick="toggleNetworkSection(event)">
        <div class="network-section-header">
          <span class="chevron">▶</span>
          Request Headers
          <span class="badge">${reqHeaderCount}</span>
        </div>
        <div class="network-section-content">
          <table class="network-headers-table">
            ${reqHeadersRows}
          </table>
        </div>
      </div>
      <div class="network-section" onclick="toggleNetworkSection(event)">
        <div class="network-section-header">
          <span class="chevron">▶</span>
          Response Headers
          <span class="badge">${resHeaderCount}</span>
        </div>
        <div class="network-section-content">
          <table class="network-headers-table">
            ${resHeadersRows}
          </table>
        </div>
      </div>
      <div class="network-section" onclick="toggleNetworkSection(event)">
        <div class="network-section-header">
          <span class="chevron">▶</span>
          Request Body
        </div>
        <div class="network-section-content">
          <pre>${escapeHtml(reqBody)}</pre>
        </div>
      </div>
      <div class="network-section" onclick="toggleNetworkSection(event)">
        <div class="network-section-header">
          <span class="chevron">▶</span>
          Response Body
        </div>
        <div class="network-section-content">
          <pre>${escapeHtml(resBody)}</pre>
        </div>
      </div>
    </div>
  `;
}

function highlightLogEntry(index, clearOthers = true) {
  const entries = recallTimeline.querySelectorAll('.log-entry');
  entries.forEach((e, i) => {
    if (i === index) {
      e.classList.add('highlight');
    } else if (clearOthers) {
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
let lastClickedIndex = null;

function initLogSelection() {
  recallTimeline.addEventListener('click', (e) => {
    const entry = e.target.closest('.log-entry');

    if (entry) {
      const index = parseInt(entry.dataset.index);

      // Shift+click for range selection
      if (e.shiftKey && lastClickedIndex !== null) {
        const start = Math.min(lastClickedIndex, index);
        const end = Math.max(lastClickedIndex, index);

        for (let i = start; i <= end; i++) {
          selectedLogs.add(i);
          const el = recallTimeline.querySelector(`[data-index="${i}"]`);
          if (el) el.classList.add('selected');
        }
      } else {
        // Regular click - toggle selection
        if (selectedLogs.has(index)) {
          selectedLogs.delete(index);
          entry.classList.remove('selected');
        } else {
          selectedLogs.add(index);
          entry.classList.add('selected');
        }
        lastClickedIndex = index;
      }

      updateActionBar();
    }
  });

  copyLogsBtn.addEventListener('click', copySelectedLogs);

  const cancelBtn = document.getElementById('cancelSelectionBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', clearSelection);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Only handle if we have selected logs
    if (selectedLogs.size === 0) return;

    // Cmd+C / Ctrl+C to copy
    if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
      e.preventDefault();
      copySelectedLogs();
    }

    // Esc to cancel selection
    if (e.key === 'Escape') {
      clearSelection();
    }
  });
}

function clearSelection() {
  selectedLogs.clear();
  lastClickedIndex = null;
  recallTimeline.querySelectorAll('.log-entry.selected').forEach(entry => {
    entry.classList.remove('selected');
  });
  updateActionBar();
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

    // Format network requests with full details
    if (log.type === 'network' && log.extra) {
      const e = log.extra;
      let output = `[${log.time}] ${log.label} ${e.status} ${log.details} (${e.duration}ms)`;

      if (e.requestHeaders) {
        output += `\n  Request Headers:`;
        for (const [key, value] of Object.entries(e.requestHeaders)) {
          output += `\n    ${key}: ${value}`;
        }
      }

      if (e.requestBody) {
        output += `\n  Request Body:`;
        output += `\n    ${JSON.stringify(e.requestBody, null, 2).split('\n').join('\n    ')}`;
      }

      if (e.responseHeaders) {
        output += `\n  Response Headers:`;
        for (const [key, value] of Object.entries(e.responseHeaders)) {
          output += `\n    ${key}: ${value}`;
        }
      }

      if (e.responseBody) {
        output += `\n  Response Body:`;
        output += `\n    ${JSON.stringify(e.responseBody, null, 2).split('\n').join('\n    ')}`;
      }

      return output;
    }

    return `[${log.time}] ${log.label}: ${log.details}`;
  }).join('\n\n');

  await navigator.clipboard.writeText(text);

  copyLogsBtn.innerHTML = `Copied! <span class="keybind">⌘C</span>`;
  copyLogsBtn.classList.add('copied');

  setTimeout(() => {
    copyLogsBtn.innerHTML = `Copy <span class="keybind">⌘C</span>`;
    copyLogsBtn.classList.remove('copied');
  }, 1500);
}

// ============================================
// TERMINAL / CLAUDE CODE
// ============================================
function clearTerminal() {
  terminalOutput.innerHTML = `
    <div class="claude-welcome">
      <span class="claude-title">Claude Code</span> <span class="claude-version">v1.0.0</span>
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

  // User asks Claude Code for help
  let line = addTerminalLine('<span class="claude-user">&gt; </span>');
  await typeText(line, 'i just sent another message and got an error', 30);

  await sleep(1000);

  // Claude immediately checks recent logs
  addTerminalLine('<span class="claude-bullet">●</span> <span class="claude-tool">Bash</span>(tail -n 5 .react-recall/logs.jsonl)');

  await sleep(500);

  // Highlight all recent entries at once (last 5)
  bringToFront(browserWindow);
  const entriesToHighlight = Math.min(5, logEntries.length);
  for (let i = 0; i < entriesToHighlight; i++) {
    highlightLogEntry(logEntries.length - 1 - i, false); // false = don't clear others
  }

  await sleep(600);
  clearHighlights();
  bringToFront(terminalWindow);

  // Claude summarizes what it sees
  line = addTerminalLine('<span class="claude-bullet">●</span> ');
  await typeText(line, 'I see a stream parse error — "Failed to parse stream string"', 20);

  await sleep(300);

  line = addTerminalLine('<span class="claude-bullet">●</span> ');
  await typeText(line, 'This happens when the backend sends a text stream instead of the data protocol.', 18);

  await sleep(400);

  clearHighlights();

  // Claude suggests the fix
  line = addTerminalLine('<span class="claude-bullet">●</span> ');
  await typeText(line, 'Add streamProtocol: \'text\' to your useChat hook:', 18);

  await sleep(300);

  addTerminalLine('<div class="claude-code">const { messages } = useChat({<br>  streamProtocol: \'text\'<br>});</div>');

  await sleep(500);

  line = addTerminalLine('<span class="claude-bullet">●</span> ');
  await typeText(line, 'Want me to update Chat.tsx?', 20);

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

  await sleep(1200);

  // Simulate API call - streaming starts successfully (200) but fails mid-stream
  addLogEntry('network', 'POST', '/api/chat (stream)', {
    status: 200,
    duration: 1847,
    started: '14:23:15.203',
    completed: '14:23:17.050',
    requestHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-...a8f2'
    },
    responseHeaders: {
      'content-type': 'text/event-stream',
      'x-request-id': 'req_xyz789'
    },
    requestBody: {
      messages: [
        { role: 'user', content: message }
      ],
      model: 'gpt-4',
      stream: true
    },
    responseBody: `Here's how to implement that feature...

(raw text stream - missing data: prefix)`
  });

  await sleep(300);

  // Stream parse error - the interesting part!
  addLogEntry('error', 'Error', 'Failed to parse stream string');

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
// FILTER CHIPS
// ============================================
function initFilters() {
  const filterChips = document.querySelectorAll('.filter-chip');

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filterType = chip.dataset.filter;

      // Toggle filter state
      if (activeFilters.has(filterType)) {
        activeFilters.delete(filterType);
        chip.classList.remove('active');
      } else {
        activeFilters.add(filterType);
        chip.classList.add('active');
      }

      // Show/hide log entries based on filters
      applyFilters();
    });
  });
}

function applyFilters() {
  const entries = recallTimeline.querySelectorAll('.log-entry');

  entries.forEach(entry => {
    const type = entry.dataset.type;
    if (activeFilters.has(type)) {
      entry.style.display = '';
    } else {
      entry.style.display = 'none';
    }
  });
}

// ============================================
// NETWORK DETAILS TOGGLE
// ============================================
function toggleNetworkDetails(index, event) {
  event.stopPropagation();

  const details = document.getElementById(`network-details-${index}`);
  const btn = document.querySelector(`.expand-btn[data-index="${index}"]`);

  if (details) {
    const isExpanded = details.classList.toggle('expanded');
    if (btn) {
      btn.classList.toggle('expanded');
      btn.textContent = isExpanded ? 'Hide' : 'Details';
    }
  }
}

function toggleNetworkSection(event) {
  event.stopPropagation();

  const section = event.target.closest('.network-section');
  if (section) {
    section.classList.toggle('open');
  }
}

// ============================================
// COPY BUTTONS (for notepad window)
// ============================================
function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      if (text) {
        await navigator.clipboard.writeText(text);
        btn.classList.add('copied');

        // Update button content for visual feedback
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;

        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = originalHTML;
        }, 1500);
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
    <div class="message message-user">
      <div class="message-content">Hi, I heard about ReactRecall. Can you tell me about it?</div>
    </div>
    <div class="message message-assistant">
      <div class="message-content">
        <p><strong>ReactRecall</strong> is a debug session recorder for AI-assisted development.</p>
        <p>It captures every click, log, and network request in your React app — so Claude Code can find bugs in seconds.</p>

        <p><strong>Install:</strong></p>
        <div class="chat-code">
          <code>npm install react-recall</code>
          <button class="copy-btn-small" data-copy="npm install react-recall">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>

        <p><strong>Setup:</strong></p>
        <div class="chat-code chat-code-multi">
          <pre><code><span class="hl-keyword">import</span> { ReactRecallProvider } <span class="hl-keyword">from</span> <span class="hl-string">'react-recall'</span>

<span class="hl-keyword">function</span> <span class="hl-function">App</span>() {
  <span class="hl-keyword">return</span> (
    <span class="hl-tag">&lt;ReactRecallProvider&gt;</span>
      <span class="hl-tag">&lt;YourApp /&gt;</span>
    <span class="hl-tag">&lt;/ReactRecallProvider&gt;</span>
  )
}</code></pre>
        </div>

        <p><strong>Run:</strong></p>
        <div class="chat-code">
          <code>npx react-recall</code>
          <button class="copy-btn-small" data-copy="npx react-recall">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>

        <p>Want to try it out? Click <strong>Send</strong> below and watch Claude Code debug an error using the logs!</p>
      </div>
    </div>
  `;
  chatInput.value = "Can I try it out?";
  errorToast.classList.remove('visible');
  removeLoadingSpinner();

  // Reset counts to initial dummy data values
  counts = { event: 4, log: 1, error: 0, network: 1 };
  document.getElementById('eventCount').textContent = '4';
  document.getElementById('logCount').textContent = '1';
  document.getElementById('errorCount').textContent = '0';
  document.getElementById('networkCount').textContent = '1';

  // Reset timeline with initial entries
  logEntries = [
    { type: 'event', label: 'Toggle', details: '"Reasoning" enabled', time: '14:22:45', extra: {} },
    { type: 'event', label: 'Click', details: '"Send" (ChatInput > SendButton)', time: '14:22:47', extra: {} },
    { type: 'event', label: 'Input', details: 'value: "Hi, I heard about ReactRecall..."', time: '14:22:47', extra: {} },
    { type: 'network', label: 'POST', details: '/api/chat', time: '14:22:48', extra: { status: 200, duration: 312 } },
    { type: 'log', label: 'Log', details: 'Response received, rendering message', time: '14:22:48', extra: {} },
    { type: 'event', label: 'Copy', details: '"npm install react-recall" (CodeBlock)', time: '14:22:52', extra: {} }
  ];
  selectedLogs.clear();
  updateActionBar();

  recallTimeline.innerHTML = `
    <div class="log-entry" data-index="0" data-type="event">
      <span class="log-dot blue"></span>
      <div class="log-content">
        <div class="log-header">
          <span class="log-type">Toggle</span>
          <span class="log-time">14:22:45</span>
        </div>
        <div class="log-details">"Reasoning" enabled</div>
      </div>
    </div>
    <div class="log-entry" data-index="1" data-type="event">
      <span class="log-dot blue"></span>
      <div class="log-content">
        <div class="log-header">
          <span class="log-type">Click</span>
          <span class="log-time">14:22:47</span>
        </div>
        <div class="log-details">"Send" (ChatInput &gt; SendButton)</div>
      </div>
    </div>
    <div class="log-entry" data-index="2" data-type="event">
      <span class="log-dot blue"></span>
      <div class="log-content">
        <div class="log-header">
          <span class="log-type">Input</span>
          <span class="log-time">14:22:47</span>
        </div>
        <div class="log-details">value: "Hi, I heard about ReactRecall..."</div>
      </div>
    </div>
    <div class="log-entry" data-index="3" data-type="network">
      <span class="log-dot purple"></span>
      <div class="log-content">
        <div class="log-header">
          <span class="log-type">POST</span>
          <span class="log-status success">200</span>
          <span class="log-duration">312ms</span>
          <span class="log-time">14:22:48</span>
        </div>
        <div class="log-details">/api/chat</div>
      </div>
    </div>
    <div class="log-entry" data-index="4" data-type="log">
      <span class="log-dot gray"></span>
      <div class="log-content">
        <div class="log-header">
          <span class="log-type">Log</span>
          <span class="log-time">14:22:48</span>
        </div>
        <div class="log-details">Response received, rendering message</div>
      </div>
    </div>
    <div class="log-entry" data-index="5" data-type="event">
      <span class="log-dot blue"></span>
      <div class="log-content">
        <div class="log-header">
          <span class="log-type">Copy</span>
          <span class="log-time">14:22:52</span>
        </div>
        <div class="log-details">"npm install react-recall" (CodeBlock)</div>
      </div>
    </div>
  `;

  // Reset terminal
  clearTerminal();

  // Reset state
  hasTriggeredDemo = false;
  claudeIsTyping = false;

  // Reinitialize copy buttons for new DOM elements
  initCopyButtons();
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadWindowPositions();
  initDragging();
  initLogSelection();
  initFilters();
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

  // Toggle brain/web action buttons
  loadToggleStates();
  document.querySelectorAll('.chat-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const isActive = btn.classList.contains('active');
      const name = btn.title === 'Reasoning' ? 'Reasoning' : 'Web Search';
      addLogEntry('event', 'Toggle', `"${name}" ${isActive ? 'enabled' : 'disabled'}`);
      saveToggleStates();
    });
  });

  // Copy buttons in chat code blocks
  document.querySelectorAll('.copy-btn-small').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.copy;
      if (code) {
        addLogEntry('event', 'Copy', `"${code}" (CodeBlock)`);
      }
    });
  });

  // Initialize bouncing screensaver
  initBouncers();
});

// ============================================
// BOUNCING SCREENSAVER
// ============================================

const bouncers = [];
let mousePos = { x: -1000, y: -1000 }; // Start far away

function initBouncers() {
  const githubEl = document.getElementById('bouncerGithub');
  const npmEl = document.getElementById('bouncerNpm');

  if (!githubEl || !npmEl) return;

  // GitHub starts bottom-left, moving up-right
  bouncers.push({
    el: githubEl,
    x: 40,
    y: window.innerHeight - 80,
    vx: 2,
    vy: -1.5
  });

  // npm starts top-right, moving down-left
  bouncers.push({
    el: npmEl,
    x: window.innerWidth - 120,
    y: 40,
    vx: -1.8,
    vy: 2
  });

  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  });

  // Start animation loop
  requestAnimationFrame(animateBouncers);
}

function animateBouncers() {
  const windowRects = [
    document.getElementById('browserWindow')?.getBoundingClientRect(),
    document.getElementById('terminalWindow')?.getBoundingClientRect()
  ].filter(Boolean);

  bouncers.forEach((bouncer, index) => {
    const rect = bouncer.el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate speed modifier based on cursor distance
    const centerX = bouncer.x + width / 2;
    const centerY = bouncer.y + height / 2;
    const dist = Math.hypot(mousePos.x - centerX, mousePos.y - centerY);
    const minDist = 50;
    const maxDist = 300;
    let speedMod = 1;
    if (dist < minDist) {
      speedMod = 0;
    } else if (dist < maxDist) {
      speedMod = (dist - minDist) / (maxDist - minDist);
    }

    // Move
    bouncer.x += bouncer.vx * speedMod;
    bouncer.y += bouncer.vy * speedMod;

    // Screen boundary collision
    if (bouncer.x <= 0) {
      bouncer.x = 0;
      bouncer.vx *= -1;
    }
    if (bouncer.x + width >= window.innerWidth) {
      bouncer.x = window.innerWidth - width;
      bouncer.vx *= -1;
    }
    if (bouncer.y <= 0) {
      bouncer.y = 0;
      bouncer.vy *= -1;
    }
    if (bouncer.y + height >= window.innerHeight) {
      bouncer.y = window.innerHeight - height;
      bouncer.vy *= -1;
    }

    // Window collision
    windowRects.forEach(winRect => {
      if (rectsOverlap(bouncer.x, bouncer.y, width, height, winRect)) {
        resolveWindowCollision(bouncer, width, height, winRect);
      }
    });

    // Update position
    bouncer.el.style.left = bouncer.x + 'px';
    bouncer.el.style.top = bouncer.y + 'px';
    bouncer.el.style.right = 'auto';
    bouncer.el.style.bottom = 'auto';
  });

  // Bouncer-to-bouncer collision
  if (bouncers.length === 2) {
    const b1 = bouncers[0];
    const b2 = bouncers[1];
    const r1 = b1.el.getBoundingClientRect();
    const r2 = b2.el.getBoundingClientRect();

    if (rectsOverlap(b1.x, b1.y, r1.width, r1.height, { left: b2.x, top: b2.y, right: b2.x + r2.width, bottom: b2.y + r2.height })) {
      // Swap velocities (simple elastic collision)
      const tempVx = b1.vx;
      const tempVy = b1.vy;
      b1.vx = b2.vx;
      b1.vy = b2.vy;
      b2.vx = tempVx;
      b2.vy = tempVy;

      // Push apart
      const overlapX = (r1.width + r2.width) / 2 - Math.abs((b1.x + r1.width / 2) - (b2.x + r2.width / 2));
      const overlapY = (r1.height + r2.height) / 2 - Math.abs((b1.y + r1.height / 2) - (b2.y + r2.height / 2));
      if (overlapX > 0 && overlapY > 0) {
        if (overlapX < overlapY) {
          const pushX = overlapX / 2 + 1;
          b1.x += b1.x < b2.x ? -pushX : pushX;
          b2.x += b2.x < b1.x ? -pushX : pushX;
        } else {
          const pushY = overlapY / 2 + 1;
          b1.y += b1.y < b2.y ? -pushY : pushY;
          b2.y += b2.y < b1.y ? -pushY : pushY;
        }
      }
    }
  }

  requestAnimationFrame(animateBouncers);
}

function rectsOverlap(x, y, w, h, rect) {
  return x < rect.right && x + w > rect.left && y < rect.bottom && y + h > rect.top;
}

function resolveWindowCollision(bouncer, width, height, winRect) {
  const bouncerRight = bouncer.x + width;
  const bouncerBottom = bouncer.y + height;

  // Calculate overlap on each side
  const overlapLeft = bouncerRight - winRect.left;
  const overlapRight = winRect.right - bouncer.x;
  const overlapTop = bouncerBottom - winRect.top;
  const overlapBottom = winRect.bottom - bouncer.y;

  // Find minimum overlap to determine collision side
  const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

  if (minOverlap === overlapLeft && bouncer.vx > 0) {
    bouncer.x = winRect.left - width - 1;
    bouncer.vx *= -1;
  } else if (minOverlap === overlapRight && bouncer.vx < 0) {
    bouncer.x = winRect.right + 1;
    bouncer.vx *= -1;
  } else if (minOverlap === overlapTop && bouncer.vy > 0) {
    bouncer.y = winRect.top - height - 1;
    bouncer.vy *= -1;
  } else if (minOverlap === overlapBottom && bouncer.vy < 0) {
    bouncer.y = winRect.bottom + 1;
    bouncer.vy *= -1;
  }
}
