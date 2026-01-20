export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReactRecall</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      /* === MISSION CONTROL DESIGN SYSTEM === */

      /* Background hierarchy - deep space blacks with blue undertone */
      --bg-void: #08090a;
      --bg-base: #0c0d0f;
      --bg-surface: #111214;
      --bg-elevated: #16181b;
      --bg-hover: #1c1e22;
      --bg-active: #22252a;

      /* Border colors - subtle definition */
      --border-subtle: #1a1c20;
      --border-default: #252830;
      --border-strong: #333842;
      --border-glow: rgba(0, 212, 255, 0.3);

      /* Text hierarchy */
      --text-primary: #e8eaed;
      --text-secondary: #9aa0a9;
      --text-muted: #5f6670;
      --text-disabled: #3d424a;

      /* Accent - electric cyan */
      --accent: #00d4ff;
      --accent-bright: #5de8ff;
      --accent-dim: #0099bb;
      --accent-subtle: rgba(0, 212, 255, 0.08);
      --accent-glow: rgba(0, 212, 255, 0.4);

      /* Semantic colors */
      --color-success: #00e57a;
      --color-success-dim: rgba(0, 229, 122, 0.15);
      --color-error: #ff4d6a;
      --color-error-dim: rgba(255, 77, 106, 0.12);
      --color-warning: #ffb800;
      --color-info: #3b8bff;
      --color-network: #a855f7;

      /* Type indicators */
      --dot-event: #3b8bff;
      --dot-log: #5f6670;
      --dot-error: #ff4d6a;
      --dot-network: #a855f7;
      --dot-server: #f59e0b;

      /* Typography */
      --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', 'SF Mono', monospace;

      /* Font sizes */
      --text-2xs: 10px;
      --text-xs: 11px;
      --text-sm: 12px;
      --text-base: 13px;
      --text-md: 14px;
      --text-lg: 15px;

      /* Spacing  */
      --space-1: 2px;
      --space-2: 4px;
      --space-3: 7px;
      --space-4: 9px;
      --space-5: 11px;
      --space-6: 13px;
      --space-8: 18px;

      /* Radii */
      --radius-sm: 3px;
      --radius-md: 6px;
      --radius-lg: 9px;

      /* Shadows & Glows */
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
      --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.6);
      --glow-accent: 0 0 20px rgba(0, 212, 255, 0.15);
      --glow-success: 0 0 12px rgba(0, 229, 122, 0.3);
      --glow-error: 0 0 12px rgba(255, 77, 106, 0.3);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-sans);
      font-size: var(--text-base);
      font-weight: 400;
      background: var(--bg-void);
      color: var(--text-primary);
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Subtle scan line effect for that CRT monitor feel */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.03) 2px,
        rgba(0, 0, 0, 0.03) 4px
      );
      pointer-events: none;
      z-index: 9999;
    }

    .card {
      width: 100%;
      max-width: 64rem; /* 5xl - 1024px */
      height: 100%;
      margin: 0 auto;
      background: var(--bg-base);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* === HEADER === */
    .header {
      padding: var(--space-4) var(--space-6);
      background: linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-surface) 100%);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      min-height: 44px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .header-logo {
      width: 16px;
      height: 16px;
      color: var(--accent);
      filter: drop-shadow(0 0 4px var(--accent-glow));
    }

    .header h1 {
      font-size: var(--text-md);
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: 0.02em;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--space-6);
    }

    .status {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-success);
      box-shadow: var(--glow-success);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .status-dot.disconnected {
      background: var(--color-error);
      box-shadow: var(--glow-error);
      animation: none;
    }

    .btn-clear {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-default);
      padding: var(--space-2) var(--space-5);
      border-radius: var(--radius-md);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-clear:hover {
      background: var(--bg-hover);
      border-color: var(--border-strong);
      color: var(--text-primary);
    }

    /* === CONTENT AREA === */
    .content-area {
      background: var(--bg-surface);
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    /* === TOOLBAR === */
    .toolbar {
      padding: var(--space-4) var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }

    .filter-chips {
      display: flex;
      gap: var(--space-2);
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      margin: 0 calc(-1 * var(--space-6));
      padding: 0 var(--space-6);
    }

    .filter-chips::-webkit-scrollbar {
      display: none;
    }

    .filter-chip {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      border: 1px solid var(--border-default);
      background: var(--bg-elevated);
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .filter-chip:hover {
      border-color: var(--border-strong);
      color: var(--text-secondary);
    }

    .filter-chip.active {
      background: var(--accent-subtle);
      color: var(--accent);
      border-color: rgba(0, 212, 255, 0.3);
    }

    .filter-chip.active:hover {
      background: rgba(0, 212, 255, 0.12);
      border-color: rgba(0, 212, 255, 0.4);
    }

    .filter-chip .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      transition: opacity 0.15s ease;
    }

    .filter-chip:not(.active) .dot {
      opacity: 0.4;
    }

    .filter-chip .dot.blue { background: var(--dot-event); }
    .filter-chip .dot.gray { background: var(--dot-log); }
    .filter-chip .dot.red { background: var(--dot-error); }
    .filter-chip .dot.purple { background: var(--dot-network); }
    .filter-chip .dot.orange { background: var(--dot-server); }

    .filter-chip .count {
      background: var(--bg-active);
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      padding: 1px 5px;
      border-radius: var(--radius-sm);
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .filter-chip.active .count {
      background: rgba(0, 212, 255, 0.2);
      color: var(--accent-bright);
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .time-filter {
      padding: var(--space-2) var(--space-8) var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      border: 1px solid var(--border-default);
      background: var(--bg-elevated);
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%235f6670' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      transition: all 0.15s ease;
    }

    .time-filter:hover {
      border-color: var(--border-strong);
      color: var(--text-primary);
    }

    .time-filter:focus {
      outline: none;
      border-color: var(--accent-dim);
    }

    .time-filter option {
      background: var(--bg-elevated);
      color: var(--text-primary);
    }

    .select-all {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      border: 1px solid var(--border-default);
      background: var(--bg-elevated);
      transition: all 0.15s ease;
    }

    .select-all:hover {
      color: var(--text-secondary);
      border-color: var(--border-strong);
    }

    .select-all.active {
      background: var(--accent-subtle);
      color: var(--accent);
      border-color: rgba(0, 212, 255, 0.2);
    }

    /* === TIMELINE === */
    .timeline {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      scrollbar-width: thin;
      scrollbar-color: var(--border-default) transparent;
    }

    .timeline::-webkit-scrollbar {
      width: 6px;
    }

    .timeline::-webkit-scrollbar-track {
      background: transparent;
    }

    .timeline::-webkit-scrollbar-thumb {
      background: var(--border-default);
      border-radius: 3px;
    }

    .timeline::-webkit-scrollbar-thumb:hover {
      background: var(--border-strong);
    }

    .entry {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-6);
      border-bottom: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: background 0.1s ease;
      user-select: none;
      -webkit-user-select: none;
    }

    .entry:last-child {
      border-bottom: none;
    }

    .entry:hover {
      background: var(--bg-hover);
    }

    .entry.selected {
      background: var(--accent-subtle);
      border-bottom-color: rgba(0, 212, 255, 0.1);
    }

    .entry-checkbox {
      margin-top: 2px;
      width: 14px;
      height: 14px;
      accent-color: var(--accent);
      cursor: pointer;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 0.1s ease;
    }

    .entry:hover .entry-checkbox,
    .entry.selected .entry-checkbox {
      opacity: 1;
    }

    .entry-main {
      flex: 1;
      min-width: 0;
    }

    .entry-header {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-1);
    }

    .entry-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .entry-dot.blue { background: var(--dot-event); }
    .entry-dot.gray { background: var(--dot-log); }
    .entry-dot.red { background: var(--dot-error); box-shadow: 0 0 6px rgba(255, 77, 106, 0.4); }
    .entry-dot.purple { background: var(--dot-network); }
    .entry-dot.orange { background: var(--dot-server); }

    /* Pending network request */
    .entry.pending .entry-dot {
      animation: pendingDot 2s ease-in-out infinite;
    }

    @keyframes pendingDot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .pending-badge {
      font-size: var(--text-2xs);
      font-weight: 500;
      color: var(--color-warning);
      background: rgba(255, 184, 0, 0.12);
      padding: 1px 6px;
      border-radius: var(--radius-sm);
      margin-left: var(--space-2);
    }

    .count-badge {
      background: var(--bg-active);
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      padding: 1px 5px;
      border-radius: var(--radius-sm);
      margin-left: var(--space-2);
    }

    .network-status {
      font-size: var(--text-2xs);
      font-weight: 500;
      font-family: var(--font-mono);
      padding: 1px 5px;
      border-radius: var(--radius-sm);
      margin-left: var(--space-2);
    }

    .network-status.success {
      color: var(--color-success);
      background: var(--color-success-dim);
    }

    .network-status.error {
      color: var(--color-error);
      background: var(--color-error-dim);
    }

    .network-status.redirect {
      color: var(--color-info);
      background: rgba(59, 139, 255, 0.12);
    }

    .network-duration {
      font-size: var(--text-2xs);
      font-family: var(--font-mono);
      color: var(--text-muted);
      margin-left: var(--space-2);
    }

    .entry.pending {
      opacity: 0.85;
    }

    .entry-type {
      font-weight: 500;
      font-size: var(--text-sm);
      color: var(--text-primary);
      letter-spacing: 0.01em;
    }

    .entry-time {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .entry-details {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.4;
      word-break: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .stack-trace {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--text-muted);
      white-space: pre-wrap;
      margin-top: var(--space-2);
      max-height: 80px;
      overflow-y: auto;
      line-height: 1.5;
    }

    /* === NETWORK DETAILS === */
    .network-details {
      margin-top: var(--space-3);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
      display: none;
    }

    .network-details.expanded {
      display: block;
    }

    .network-section {
      border-bottom: 1px solid var(--border-subtle);
    }

    .network-section:last-child {
      border-bottom: none;
    }

    .network-section-header {
      padding: var(--space-3) var(--space-4);
      background: var(--bg-elevated);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--text-secondary);
      transition: background 0.1s ease;
    }

    .network-section-header:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .network-section-header .chevron {
      transition: transform 0.15s ease;
      opacity: 0.5;
    }

    .network-section.open .network-section-header .chevron {
      transform: rotate(90deg);
    }

    .network-section-header .badge {
      margin-left: auto;
      font-size: var(--text-2xs);
      font-family: var(--font-mono);
      color: var(--text-muted);
      background: var(--bg-active);
      padding: 1px 6px;
      border-radius: var(--radius-sm);
    }

    .network-section-content {
      display: none;
      padding: var(--space-3) var(--space-4);
      background: var(--bg-surface);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--text-secondary);
      max-height: 200px;
      overflow-y: auto;
    }

    .network-section.open .network-section-content {
      display: block;
    }

    .network-section-content pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
      line-height: 1.5;
    }

    .network-headers-table {
      width: 100%;
      border-collapse: collapse;
    }

    .network-headers-table td {
      padding: var(--space-1) 0;
      vertical-align: top;
    }

    .network-headers-table td:first-child {
      color: var(--accent);
      padding-right: var(--space-3);
      white-space: nowrap;
    }

    .network-headers-table td:last-child {
      color: var(--text-secondary);
      word-break: break-all;
    }

    .network-timing {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .timing-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .timing-label {
      width: 70px;
      font-size: var(--text-xs);
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .timing-bar-container {
      flex: 1;
      height: 8px;
      background: var(--bg-active);
      border-radius: 4px;
      overflow: hidden;
    }

    .timing-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .timing-bar.dns { background: #3b82f6; }
    .timing-bar.tcp { background: #f59e0b; }
    .timing-bar.ssl { background: #8b5cf6; }
    .timing-bar.ttfb { background: #22c55e; }
    .timing-bar.download { background: #00d4ff; }

    .timing-value {
      width: 50px;
      text-align: right;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      font-family: var(--font-mono);
    }

    .expand-btn {
      background: none;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-size: var(--text-2xs);
      padding: 2px 6px;
      cursor: pointer;
      margin-left: var(--space-2);
      transition: all 0.1s ease;
    }

    .expand-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
      border-color: var(--border-strong);
    }

    .expand-btn.expanded {
      background: var(--accent-subtle);
      color: var(--accent);
      border-color: rgba(0, 212, 255, 0.3);
    }

    /* === BUTTONS === */
    .btn {
      padding: var(--space-2) var(--space-5);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      background: var(--bg-elevated);
      color: var(--text-secondary);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
      border-color: var(--border-strong);
    }

    .btn-primary {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--bg-void);
    }

    .btn-primary:hover {
      background: var(--accent-bright);
      border-color: var(--accent-bright);
    }

    .btn-text {
      border: none;
      background: transparent;
      color: var(--text-muted);
      padding: var(--space-2) var(--space-4);
    }

    .btn-text:hover {
      color: var(--text-primary);
      background: var(--bg-hover);
    }

    .keybind {
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      color: var(--text-muted);
      opacity: 0.7;
    }

    .btn-primary .keybind {
      color: var(--bg-void);
      opacity: 0.6;
    }

    .btn.copied {
      background: var(--color-success);
      border-color: var(--color-success);
      color: var(--bg-void);
    }

    /* === ACTION BAR === */
    .action-bar {
      position: fixed;
      bottom: var(--space-4);
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-3) var(--space-6);
      display: none;
      align-items: center;
      gap: var(--space-4);
      box-shadow: var(--shadow-lg), var(--glow-accent);
      z-index: 100;
    }

    .action-bar.visible {
      display: flex;
    }

    .action-bar-count {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      white-space: nowrap;
      font-weight: 500;
    }

    .action-bar-count strong {
      color: var(--accent);
      font-family: var(--font-mono);
    }

    .action-bar-buttons {
      display: flex;
      gap: var(--space-2);
    }

    /* === EMPTY STATE === */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      color: var(--text-muted);
      text-align: center;
    }

    .empty-state-text {
      font-size: var(--text-md);
      color: var(--text-secondary);
      margin-bottom: var(--space-2);
      font-weight: 500;
    }

    .empty-state-subtext {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }

    /* === TOAST === */
    .toast {
      position: fixed;
      bottom: 72px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-elevated);
      border: 1px solid var(--accent-dim);
      color: var(--text-primary);
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: 500;
      z-index: 1001;
      box-shadow: var(--shadow-md), var(--glow-accent);
    }

    /* === RESPONSIVE: WIDE SCREENS === */
    @media (min-width: 768px) {
      body {
        padding: var(--space-4);
      }

      .card {
        border-radius: var(--radius-lg);
        height: calc(100vh - var(--space-8));
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-lg);
      }

      .toolbar {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }

      .filter-chips {
        margin: 0;
        padding: 0;
        overflow: visible;
      }


      .entry-checkbox {
        opacity: 0.3;
      }

      .entry:hover .entry-checkbox {
        opacity: 1;
      }
    }

    /* === RESPONSIVE: NARROW SCREENS === */
    @media (max-width: 479px) {
      .header h1 {
        font-size: var(--text-sm);
      }

      #statusText {
        display: none;
      }

      .btn-clear {
        padding: var(--space-2) var(--space-3);
        font-size: var(--text-xs);
      }

      .entry {
        padding: var(--space-3) var(--space-4);
      }

      .entry-checkbox {
        display: none;
      }

      .toolbar {
        padding: var(--space-3) var(--space-4);
      }

      .filter-chips {
        margin: 0 calc(-1 * var(--space-4));
        padding: 0 var(--space-4);
      }

      .toast {
        left: var(--space-4);
        right: var(--space-4);
        transform: none;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <header class="header">
      <div class="header-title">
        <svg class="header-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
          <line x1="16" y1="8" x2="2" y2="22"></line>
          <line x1="17.5" y1="15" x2="9" y2="15"></line>
        </svg>
        <h1>ReactRecall</h1>
      </div>
      <div class="header-right">
        <div class="status">
          <div class="status-dot" id="statusDot"></div>
          <span id="statusText">Connected</span>
        </div>
        <button class="btn-clear" onclick="clearLogs()">Clear</button>
      </div>
    </header>

    <div class="content-area">
      <div class="toolbar">
        <div class="filter-chips">
          <button class="filter-chip active" data-filter="event" onclick="toggleFilter('event')">
            <span class="dot blue"></span> Events <span class="count" id="countEvents">0</span>
          </button>
          <button class="filter-chip active" data-filter="log" onclick="toggleFilter('log')">
            <span class="dot gray"></span> Logs <span class="count" id="countLogs">0</span>
          </button>
          <button class="filter-chip active" data-filter="error" onclick="toggleFilter('error')" id="errorTab">
            <span class="dot red"></span> Errors <span class="count" id="countErrors">0</span>
          </button>
          <button class="filter-chip active" data-filter="network" onclick="toggleFilter('network')">
            <span class="dot purple"></span> Network <span class="count" id="countNetwork">0</span>
          </button>
        </div>
        <div class="toolbar-right">
          <select class="time-filter" id="timeFilter" onchange="setTimeFilter(this.value)">
            <option value="">All time</option>
            <option value="15">Past 15 seconds</option>
            <option value="30">Past 30 seconds</option>
            <option value="60">Past minute</option>
            <option value="300">Past 5 minutes</option>
            <option value="1800">Past 30 minutes</option>
          </select>
          <button class="select-all" id="selectAll" onclick="toggleSelectAll()">
            Select all
          </button>
        </div>
      </div>

      <div class="timeline" id="timeline">
        <div class="empty-state" id="emptyState">
          <div class="empty-state-text">No events captured yet</div>
          <div class="empty-state-subtext">Events will appear here when your app sends them</div>
        </div>
      </div>
    </div>
  </div>

  <div class="action-bar" id="actionBar">
    <span class="action-bar-count"><strong id="selectedCount">0</strong> selected</span>
    <div class="action-bar-buttons">
      <button class="btn" id="copyBtn" onclick="copySelected()">Copy <span class="keybind" id="copyKeybind"></span></button>
      <button class="btn btn-text" onclick="clearSelection()">Cancel <span class="keybind">Esc</span></button>
    </div>
  </div>

  <script>
    let entries = [];
    let selectedIndices = new Set();
    let lastClickedIndex = null;
    let activeFilters = new Set(['event', 'log', 'error', 'network']);
    let currentTimeFilter = '';
    let eventSource = null;

    function connect() {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        document.getElementById('statusDot').classList.remove('disconnected');
        document.getElementById('statusText').textContent = 'Connected';
      };

      eventSource.onerror = () => {
        document.getElementById('statusDot').classList.add('disconnected');
        document.getElementById('statusText').textContent = 'Disconnected';
      };

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'init') {
          // Filter out pending entries from init (they should be replaced)
          entries = data.entries.filter(e => e.type !== 'network' || !e.pending);
          renderTimeline();
        } else {
          // For network entries, merge by requestId
          if (data.type === 'network' && data.requestId) {
            const existingIdx = entries.findIndex(e =>
              e.type === 'network' && e.requestId === data.requestId
            );
            if (existingIdx >= 0) {
              // Merge: preserve start time from pending, add completion data
              const existing = entries[existingIdx];
              entries[existingIdx] = {
                ...data,
                startTs: existing.ts,  // Original timestamp becomes start time
                startMs: existing.ms,
              };
            } else {
              // First time seeing this request (pending entry)
              entries.push(data);
            }
          } else {
            entries.push(data);
          }
          renderTimeline();
          scrollToBottom();
        }

        updateCounts();
      };
    }

    function getFilteredEntries() {
      let filtered = entries;

      // Filter by active type filters
      if (activeFilters.size < 4) {
        filtered = filtered.filter(e => {
          if (e.type === 'server-log') {
            // Server errors go under Errors filter
            if (e.level === 'error') {
              return activeFilters.has('error');
            }
            // Other server logs go under Logs filter
            return activeFilters.has('log');
          }
          return activeFilters.has(e.type);
        });
      }

      if (currentTimeFilter) {
        const cutoff = Date.now() - (parseInt(currentTimeFilter) * 1000);
        filtered = filtered.filter(e => e.ms >= cutoff);
      }

      return filtered;
    }

    function toggleFilter(filter) {
      const chip = document.querySelector(\`.filter-chip[data-filter="\${filter}"]\`);

      if (activeFilters.has(filter)) {
        // Don't allow deselecting if it's the last active filter
        if (activeFilters.size > 1) {
          activeFilters.delete(filter);
          chip.classList.remove('active');
        }
      } else {
        activeFilters.add(filter);
        chip.classList.add('active');
      }

      selectedIndices.clear();
      lastClickedIndex = null;
      document.getElementById('selectAll').classList.remove('active');
      renderTimeline();
    }

    function setTimeFilter(seconds) {
      currentTimeFilter = seconds;
      selectedIndices.clear();
      lastClickedIndex = null;
      document.getElementById('selectAll').classList.remove('active');
      renderTimeline();
    }

    function updateCounts() {
      const all = entries.length;
      const events = entries.filter(e => e.type === 'event').length;
      const logs = entries.filter(e => e.type === 'log' || (e.type === 'server-log' && e.level !== 'error')).length;
      const errors = entries.filter(e => e.type === 'error' || (e.type === 'server-log' && e.level === 'error')).length;
      const network = entries.filter(e => e.type === 'network').length;

      document.getElementById('countEvents').textContent = events;
      document.getElementById('countLogs').textContent = logs;
      document.getElementById('countErrors').textContent = errors;
      document.getElementById('countNetwork').textContent = network;

      const errorTab = document.getElementById('errorTab');
      if (errors > 0) {
        errorTab.classList.add('has-errors');
      } else {
        errorTab.classList.remove('has-errors');
      }
    }

    // Create a signature for an entry to determine if two entries are identical
    function getEntrySignature(entry) {
      if (entry.type === 'event') {
        return \`event:\${entry.event}:\${entry.text || ''}:\${entry.selector || ''}:\${entry.component || ''}:\${entry.value || ''}\`;
      } else if (entry.type === 'log' || entry.type === 'server-log') {
        return \`\${entry.type}:\${entry.level}:\${entry.message}:\${JSON.stringify(entry.args || [])}\`;
      } else if (entry.type === 'error') {
        return \`error:\${entry.message}\`;
      } else if (entry.type === 'network') {
        return \`network:\${entry.method}:\${entry.url}:\${entry.status || 'pending'}\`;
      }
      return JSON.stringify(entry);
    }

    // Group consecutive identical entries
    function groupConsecutiveEntries(entries) {
      if (entries.length === 0) return [];

      const grouped = [];
      let currentGroup = { entry: entries[0], count: 1, indices: [0] };

      for (let i = 1; i < entries.length; i++) {
        const prevSig = getEntrySignature(currentGroup.entry);
        const currSig = getEntrySignature(entries[i]);

        // Check if same signature AND within 2 seconds of each other
        const prevTime = new Date(currentGroup.entry.ts).getTime();
        const currTime = new Date(entries[i].ts).getTime();
        const timeDiff = Math.abs(currTime - prevTime);

        if (prevSig === currSig && timeDiff <= 2000) {
          currentGroup.count++;
          currentGroup.indices.push(i);
        } else {
          grouped.push(currentGroup);
          currentGroup = { entry: entries[i], count: 1, indices: [i] };
        }
      }
      grouped.push(currentGroup);

      return grouped;
    }

    function renderTimeline() {
      const timeline = document.getElementById('timeline');
      const emptyState = document.getElementById('emptyState');
      const filtered = getFilteredEntries();
      const grouped = groupConsecutiveEntries(filtered);

      if (filtered.length === 0) {
        emptyState.style.display = 'flex';
        timeline.innerHTML = '';
        timeline.appendChild(emptyState);
        updateActionBar();
        return;
      }

      emptyState.style.display = 'none';

      const html = grouped.map((group, groupIndex) => {
        const entry = group.entry;
        const count = group.count;
        const realIndex = entries.indexOf(entry);
        // For grouped entries, store all indices for selection
        const groupIndices = group.indices.map(i => entries.indexOf(filtered[i]));

        // For completed network entries, show start time; otherwise show entry time
        const displayTs = (entry.type === 'network' && entry.startTs) ? entry.startTs : entry.ts;
        const time = new Date(displayTs).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        let className, typeLabel, dotColor;

        if (entry.type === 'event') {
          className = 'event';
          dotColor = 'blue';
          if (entry.event === 'click') {
            typeLabel = 'Click';
          } else if (entry.event === 'input') {
            typeLabel = 'Input';
          } else if (entry.event === 'navigation') {
            typeLabel = 'Navigation';
          } else if (entry.event === 'submit') {
            typeLabel = 'Submit';
            dotColor = 'green';
          } else if (entry.event === 'change') {
            typeLabel = 'Change';
          } else if (entry.event === 'keypress') {
            typeLabel = entry.key || 'Key';
            dotColor = 'blue';
          } else {
            typeLabel = entry.event || 'Event';
          }
        } else if (entry.type === 'log') {
          className = entry.level === 'warn' ? 'warn' : 'log';
          dotColor = 'gray';
          if (entry.level === 'warn') {
            typeLabel = 'Warning';
          } else if (entry.level === 'info') {
            typeLabel = 'Info';
          } else if (entry.level === 'debug') {
            typeLabel = 'Debug';
          } else {
            typeLabel = 'Log';
          }
        } else if (entry.type === 'error') {
          className = 'error';
          dotColor = 'red';
          typeLabel = 'Error';
        } else if (entry.type === 'network') {
          className = 'network';
          if (entry.pending) className += ' pending';
          dotColor = 'purple';
          typeLabel = entry.method || 'Request';
        } else if (entry.type === 'server-log') {
          className = 'server-log';
          if (entry.level === 'error') {
            dotColor = 'red';
            typeLabel = 'Server Error';
          } else if (entry.level === 'warn') {
            dotColor = 'gray';
            typeLabel = 'Server Warn';
          } else {
            dotColor = 'gray';
            typeLabel = 'Server Log';
          }
        }

        let details = '';
        let networkBadgesHtml = '';
        if (entry.type === 'event') {
          // Prefer component stack over selector for better context
          const location = entry.component || entry.selector;

          if (entry.event === 'submit') {
            // Form submit: show action and method
            details = \`\${entry.formMethod || 'POST'} \${entry.formAction || ''}\`;
            if (location) details += \` (\${location})\`;
          } else if (entry.event === 'change') {
            // Select change: show selected value
            if (entry.text) details = \`"\${entry.text}"\`;
            if (entry.value && entry.value !== entry.text) details += \` (\${entry.value})\`;
            if (location) details += \` (\${location})\`;
          } else if (entry.event === 'click' && entry.checked !== undefined) {
            // Checkbox/radio: show checked state
            if (entry.text) details = \`"\${entry.text}" \`;
            details += entry.checked ? '[checked]' : '[unchecked]';
            if (location) details += \` (\${location})\`;
          } else if (entry.event === 'keypress') {
            // Keypress: show the value that was submitted
            if (entry.value) {
              const truncated = entry.value.length > 50 ? entry.value.substring(0, 50) + '...' : entry.value;
              details = \`"\${truncated}"\`;
            }
            if (location) details += \` (\${location})\`;
          } else {
            // Standard click/input/navigation
            if (entry.text) details = \`"\${entry.text}" \`;
            if (location) details += \`(\${location})\`;
            if (entry.url) details = entry.url;
            if (entry.value) details = \`value: "\${entry.value}"\`;
          }
        } else if (entry.type === 'log') {
          details = entry.message || '';
          if (entry.args && entry.args.length > 0) {
            details += ' ' + entry.args.map(a => JSON.stringify(a)).join(' ');
          }
        } else if (entry.type === 'error') {
          details = entry.message || '';
        } else if (entry.type === 'server-log') {
          // Server log: show source and message
          if (entry.source) {
            details = \`[\${entry.source}] \${entry.message || ''}\`;
          } else {
            details = entry.message || '';
          }
          if (entry.args && entry.args.length > 0) {
            details += ' ' + entry.args.map(a => JSON.stringify(a)).join(' ');
          }
        } else if (entry.type === 'network') {
          // URL only in details
          details = entry.url;
          if (entry.error) details += \` - \${entry.error}\`;

          // Status and duration as badges in header
          if (!entry.pending && entry.status) {
            const statusClass = entry.status >= 400 ? 'error' : entry.status >= 300 ? 'redirect' : 'success';
            networkBadgesHtml += \`<span class="network-status \${statusClass}">\${entry.status}</span>\`;
          }
          if (!entry.pending && entry.duration) {
            networkBadgesHtml += \`<span class="network-duration">\${entry.duration}ms</span>\`;
          }
        }

        // For grouped entries, check if any of the group indices are selected
        const isSelected = groupIndices.some(idx => selectedIndices.has(idx));
        const selectedClass = isSelected ? 'selected' : '';

        // Count badge for grouped entries
        const countBadgeHtml = count > 1
          ? \`<span class="count-badge">×\${count}</span>\`
          : '';

        const stackHtml = entry.stack
          ? \`<div class="stack-trace">\${escapeHtml(entry.stack)}</div>\`
          : '';

        // Network details for network entries
        let networkDetailsHtml = '';
        let expandBtnHtml = '';
        let pendingBadgeHtml = '';
        if (entry.type === 'network') {
          if (entry.pending) {
            pendingBadgeHtml = '<span class="pending-badge">Pending</span>';
          } else {
            const hasDetails = entry.requestHeaders || entry.responseHeaders || entry.requestBody || entry.responseBody || entry.timing || entry.initiator;
            if (hasDetails) {
              expandBtnHtml = \`<button class="expand-btn" onclick="toggleNetworkDetails(\${realIndex}, event)" data-index="\${realIndex}">Details</button>\`;
              networkDetailsHtml = renderNetworkDetails(entry, realIndex);
            }
          }
        }

        // Store group indices as data attribute for selection handling
        const groupIndicesAttr = JSON.stringify(groupIndices);

        return \`
          <div class="entry \${className} \${selectedClass}" onclick="toggleEntryGroup(\${realIndex}, \${groupIndicesAttr.replace(/"/g, '&quot;')}, event)">
            <div class="entry-main">
              <div class="entry-header">
                <span class="entry-dot \${dotColor}"></span>
                <span class="entry-type">\${typeLabel}</span>
                \${countBadgeHtml}
                \${networkBadgesHtml}
                \${pendingBadgeHtml}
                \${expandBtnHtml}
                <span class="entry-time">\${time}</span>
              </div>
              <div class="entry-details">\${escapeHtml(details)}</div>
              \${stackHtml}
              \${networkDetailsHtml}
            </div>
          </div>
        \`;
      }).join('');

      timeline.innerHTML = '<div class="empty-state" id="emptyState" style="display:none"></div>' + html;
      updateActionBar();
    }

    function toggleEntry(index, event) {
      event.stopPropagation();
      event.preventDefault();

      if (event.shiftKey && lastClickedIndex !== null) {
        const start = Math.min(lastClickedIndex, index);
        const end = Math.max(lastClickedIndex, index);
        for (let i = start; i <= end; i++) {
          selectedIndices.add(i);
        }
      } else {
        if (selectedIndices.has(index)) {
          selectedIndices.delete(index);
        } else {
          selectedIndices.add(index);
        }
        lastClickedIndex = index;
      }

      renderTimeline();
    }

    function toggleEntryGroup(primaryIndex, groupIndices, event) {
      event.stopPropagation();
      event.preventDefault();

      // Check if any in group are selected
      const anySelected = groupIndices.some(idx => selectedIndices.has(idx));

      if (anySelected) {
        // Deselect all in group
        groupIndices.forEach(idx => selectedIndices.delete(idx));
      } else {
        // Select all in group
        groupIndices.forEach(idx => selectedIndices.add(idx));
      }
      lastClickedIndex = primaryIndex;

      renderTimeline();
    }

    function toggleSelectAll() {
      const selectAll = document.getElementById('selectAll');
      const filtered = getFilteredEntries();
      const allSelected = filtered.length > 0 && filtered.every(entry => selectedIndices.has(entries.indexOf(entry)));

      if (allSelected) {
        selectedIndices.clear();
        selectAll.classList.remove('active');
      } else {
        filtered.forEach(entry => {
          const realIndex = entries.indexOf(entry);
          selectedIndices.add(realIndex);
        });
        selectAll.classList.add('active');
      }
      renderTimeline();
    }

    function clearSelection() {
      selectedIndices.clear();
      lastClickedIndex = null;
      document.getElementById('selectAll').classList.remove('active');
      renderTimeline();
    }

    function updateActionBar() {
      const actionBar = document.getElementById('actionBar');
      const count = selectedIndices.size;
      document.getElementById('selectedCount').textContent = count;

      if (count > 0) {
        actionBar.classList.add('visible');
      } else {
        actionBar.classList.remove('visible');
      }

      const filtered = getFilteredEntries();
      const selectAll = document.getElementById('selectAll');
      const allFilteredSelected = filtered.length > 0 && filtered.every(entry => selectedIndices.has(entries.indexOf(entry)));
      if (allFilteredSelected) {
        selectAll.classList.add('active');
      } else {
        selectAll.classList.remove('active');
      }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
    }

    function formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // === NETWORK DETAILS FUNCTIONS ===

    function renderNetworkDetails(entry, index) {
      const sections = [];
      const chevron = '▸';

      // General info with timestamps
      if (entry.startTs || entry.ts) {
        const startTime = entry.startTs || entry.ts;
        const endTime = entry.ts;
        const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', {
          hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3
        });

        let rows = \`<tr><td>Started</td><td>\${formatTime(startTime)}</td></tr>\`;
        if (entry.startTs) {
          rows += \`<tr><td>Completed</td><td>\${formatTime(endTime)}</td></tr>\`;
        }
        rows += \`<tr><td>Duration</td><td>\${entry.duration}ms</td></tr>\`;
        if (entry.status) {
          rows += \`<tr><td>Status</td><td>\${entry.status}</td></tr>\`;
        }

        sections.push(\`
          <div class="network-section open" onclick="toggleNetworkSection(event)">
            <div class="network-section-header">
              <span class="chevron">\${chevron}</span>
              General
            </div>
            <div class="network-section-content">
              <table class="network-headers-table">\${rows}</table>
            </div>
          </div>
        \`);
      }

      // Request Headers
      if (entry.requestHeaders && Object.keys(entry.requestHeaders).length > 0) {
        const count = Object.keys(entry.requestHeaders).length;
        const rows = Object.entries(entry.requestHeaders)
          .map(([k, v]) => \`<tr><td>\${escapeHtml(k)}</td><td>\${escapeHtml(v)}</td></tr>\`)
          .join('');
        sections.push(\`
          <div class="network-section" onclick="toggleNetworkSection(event)">
            <div class="network-section-header">
              <span class="chevron">\${chevron}</span>
              Request Headers
              <span class="badge">\${count}</span>
            </div>
            <div class="network-section-content">
              <table class="network-headers-table">\${rows}</table>
            </div>
          </div>
        \`);
      }

      // Response Headers
      if (entry.responseHeaders && Object.keys(entry.responseHeaders).length > 0) {
        const count = Object.keys(entry.responseHeaders).length;
        const rows = Object.entries(entry.responseHeaders)
          .map(([k, v]) => \`<tr><td>\${escapeHtml(k)}</td><td>\${escapeHtml(v)}</td></tr>\`)
          .join('');
        sections.push(\`
          <div class="network-section" onclick="toggleNetworkSection(event)">
            <div class="network-section-header">
              <span class="chevron">\${chevron}</span>
              Response Headers
              <span class="badge">\${count}</span>
            </div>
            <div class="network-section-content">
              <table class="network-headers-table">\${rows}</table>
            </div>
          </div>
        \`);
      }

      // Request Body
      if (entry.requestBody) {
        const formatted = formatBody(entry.requestBody, entry.requestHeaders?.['content-type']);
        sections.push(\`
          <div class="network-section" onclick="toggleNetworkSection(event)">
            <div class="network-section-header">
              <span class="chevron">\${chevron}</span>
              Request Body
            </div>
            <div class="network-section-content">
              <pre>\${escapeHtml(formatted)}</pre>
            </div>
          </div>
        \`);
      }

      // Response Body
      if (entry.responseBody) {
        const formatted = formatBody(entry.responseBody, entry.responseHeaders?.['content-type']);
        sections.push(\`
          <div class="network-section" onclick="toggleNetworkSection(event)">
            <div class="network-section-header">
              <span class="chevron">\${chevron}</span>
              Response Body
            </div>
            <div class="network-section-content">
              <pre>\${escapeHtml(formatted)}</pre>
            </div>
          </div>
        \`);
      }

      // Timing
      if (entry.timing) {
        const timingHtml = renderTimingBars(entry.timing, entry.duration);
        sections.push(\`
          <div class="network-section" onclick="toggleNetworkSection(event)">
            <div class="network-section-header">
              <span class="chevron">\${chevron}</span>
              Timing
              <span class="badge">\${entry.duration}ms</span>
            </div>
            <div class="network-section-content">
              \${timingHtml}
            </div>
          </div>
        \`);
      }

      // Initiator
      if (entry.initiator) {
        sections.push(\`
          <div class="network-section" onclick="toggleNetworkSection(event)">
            <div class="network-section-header">
              <span class="chevron">\${chevron}</span>
              Initiator
            </div>
            <div class="network-section-content">
              <pre>\${escapeHtml(entry.initiator)}</pre>
            </div>
          </div>
        \`);
      }

      if (sections.length === 0) return '';

      return \`<div class="network-details" id="network-details-\${index}">\${sections.join('')}</div>\`;
    }

    function formatBody(body, contentType) {
      if (!body) return '';

      // Try to pretty-print JSON
      if (contentType && contentType.includes('application/json') || body.trim().startsWith('{') || body.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(body);
          return JSON.stringify(parsed, null, 2);
        } catch {
          // Not valid JSON, return as-is
        }
      }

      return body;
    }

    function renderTimingBars(timing, totalDuration) {
      const maxTime = Math.max(
        timing.dns || 0,
        timing.tcp || 0,
        timing.ssl || 0,
        timing.ttfb || 0,
        timing.download || 0,
        1
      );

      const bars = [];

      if (timing.dns !== undefined) {
        const pct = (timing.dns / maxTime) * 100;
        bars.push(\`
          <div class="timing-row">
            <span class="timing-label">DNS</span>
            <div class="timing-bar-container">
              <div class="timing-bar dns" style="width: \${pct}%"></div>
            </div>
            <span class="timing-value">\${timing.dns}ms</span>
          </div>
        \`);
      }

      if (timing.tcp !== undefined) {
        const pct = (timing.tcp / maxTime) * 100;
        bars.push(\`
          <div class="timing-row">
            <span class="timing-label">TCP</span>
            <div class="timing-bar-container">
              <div class="timing-bar tcp" style="width: \${pct}%"></div>
            </div>
            <span class="timing-value">\${timing.tcp}ms</span>
          </div>
        \`);
      }

      if (timing.ssl !== undefined) {
        const pct = (timing.ssl / maxTime) * 100;
        bars.push(\`
          <div class="timing-row">
            <span class="timing-label">SSL</span>
            <div class="timing-bar-container">
              <div class="timing-bar ssl" style="width: \${pct}%"></div>
            </div>
            <span class="timing-value">\${timing.ssl}ms</span>
          </div>
        \`);
      }

      if (timing.ttfb !== undefined) {
        const pct = (timing.ttfb / maxTime) * 100;
        bars.push(\`
          <div class="timing-row">
            <span class="timing-label">TTFB</span>
            <div class="timing-bar-container">
              <div class="timing-bar ttfb" style="width: \${pct}%"></div>
            </div>
            <span class="timing-value">\${timing.ttfb}ms</span>
          </div>
        \`);
      }

      if (timing.download !== undefined) {
        const pct = (timing.download / maxTime) * 100;
        bars.push(\`
          <div class="timing-row">
            <span class="timing-label">Download</span>
            <div class="timing-bar-container">
              <div class="timing-bar download" style="width: \${pct}%"></div>
            </div>
            <span class="timing-value">\${timing.download}ms</span>
          </div>
        \`);
      }

      return \`<div class="network-timing">\${bars.join('')}</div>\`;
    }

    function toggleNetworkDetails(index, event) {
      event.stopPropagation();
      const details = document.getElementById(\`network-details-\${index}\`);
      const btn = document.querySelector(\`.expand-btn[data-index="\${index}"]\`);

      if (details) {
        details.classList.toggle('expanded');
        if (btn) {
          btn.classList.toggle('expanded');
          btn.textContent = details.classList.contains('expanded') ? 'Hide' : 'Details';
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

    function scrollToBottom() {
      const timeline = document.getElementById('timeline');
      timeline.scrollTop = timeline.scrollHeight;
    }

    function formatEntryForExport(entry) {
      const time = entry.ts.split('T')[1].split('.')[0];

      if (entry.type === 'event') {
        const location = entry.component || entry.selector;
        let details = '';

        if (entry.event === 'submit') {
          details = \`: \${entry.formMethod || 'POST'} \${entry.formAction || ''}\`;
          if (location) details += \` (\${location})\`;
        } else if (entry.event === 'change') {
          if (entry.text) details = \`: "\${entry.text}"\`;
          if (entry.value && entry.value !== entry.text) details += \` [value: \${entry.value}]\`;
          if (location) details += \` (\${location})\`;
        } else if (entry.event === 'click' && entry.checked !== undefined) {
          if (entry.text) details = \`: "\${entry.text}"\`;
          details += \` [\${entry.checked ? 'checked' : 'unchecked'}]\`;
          if (location) details += \` (\${location})\`;
        } else if (entry.event === 'keypress') {
          if (entry.value) {
            const truncated = entry.value.length > 100 ? entry.value.substring(0, 100) + '...' : entry.value;
            details = \`: "\${truncated}"\`;
          }
          if (location) details += \` (\${location})\`;
        } else {
          if (entry.text) details = \`: "\${entry.text}"\`;
          if (location) details += \` (\${location})\`;
          if (entry.url) details = \`: \${entry.url}\`;
          if (entry.value) details = \`: value="\${entry.value}"\`;
        }
        return \`[\${time}] \${entry.event.toUpperCase()}\${details}\`;
      } else if (entry.type === 'log') {
        return \`[\${time}] \${entry.level.toUpperCase()}: \${entry.message}\`;
      } else if (entry.type === 'error') {
        let str = \`[\${time}] ERROR: \${entry.message}\`;
        if (entry.stack) str += '\\n    ' + entry.stack.split('\\n').slice(0, 3).join('\\n    ');
        return str;
      } else if (entry.type === 'network') {
        return formatNetworkEntryForExport(entry);
      } else if (entry.type === 'server-log') {
        let str = \`[\${time}] SERVER \${entry.level.toUpperCase()}\`;
        if (entry.source) str += \` [\${entry.source}]\`;
        str += \`: \${entry.message}\`;
        if (entry.args && entry.args.length > 0) {
          str += ' ' + entry.args.map(a => JSON.stringify(a)).join(' ');
        }
        return str;
      }
      return '';
    }

    function formatNetworkEntryForExport(entry) {
      const lines = [];
      const status = entry.status || 'ERR';
      const startTime = entry.startTs ? entry.startTs.split('T')[1].split('.')[0] : entry.ts.split('T')[1].split('.')[0];

      // Header line
      lines.push(\`[\${startTime}] \${entry.method} \${status} \${entry.url} (\${entry.duration}ms)\`);

      // Timing info
      if (entry.startTs) {
        const endTime = entry.ts.split('T')[1].split('.')[0];
        lines.push(\`  Started: \${startTime} | Completed: \${endTime} | Duration: \${entry.duration}ms\`);
      }

      // Request headers
      if (entry.requestHeaders && Object.keys(entry.requestHeaders).length > 0) {
        lines.push('  Request Headers:');
        Object.entries(entry.requestHeaders).forEach(([k, v]) => {
          lines.push(\`    \${k}: \${v}\`);
        });
      }

      // Request body
      if (entry.requestBody) {
        lines.push('  Request Body:');
        entry.requestBody.split('\\n').forEach(line => {
          lines.push(\`    \${line}\`);
        });
      }

      // Response headers
      if (entry.responseHeaders && Object.keys(entry.responseHeaders).length > 0) {
        lines.push('  Response Headers:');
        Object.entries(entry.responseHeaders).forEach(([k, v]) => {
          lines.push(\`    \${k}: \${v}\`);
        });
      }

      // Response body
      if (entry.responseBody) {
        lines.push('  Response Body:');
        entry.responseBody.split('\\n').forEach(line => {
          lines.push(\`    \${line}\`);
        });
      }

      // Timing breakdown
      if (entry.timing) {
        const t = entry.timing;
        const parts = [];
        if (t.dns !== undefined) parts.push(\`DNS: \${t.dns}ms\`);
        if (t.tcp !== undefined) parts.push(\`TCP: \${t.tcp}ms\`);
        if (t.ssl !== undefined) parts.push(\`SSL: \${t.ssl}ms\`);
        if (t.ttfb !== undefined) parts.push(\`TTFB: \${t.ttfb}ms\`);
        if (t.download !== undefined) parts.push(\`Download: \${t.download}ms\`);
        if (parts.length > 0) {
          lines.push(\`  Timing: \${parts.join(' | ')}\`);
        }
      }

      // Initiator
      if (entry.initiator) {
        lines.push('  Initiator:');
        entry.initiator.split('\\n').forEach(line => {
          lines.push(\`    \${line}\`);
        });
      }

      // Error
      if (entry.error) {
        lines.push(\`  Error: \${entry.error}\`);
      }

      return lines.join('\\n');
    }

    function getSelectedEntries() {
      return Array.from(selectedIndices)
        .sort((a, b) => a - b)
        .map(i => entries[i]);
    }

    async function copySelected() {
      const selected = getSelectedEntries();
      if (selected.length === 0) return;

      const md = selected.map(e => formatEntryForExport(e)).join('\\n');
      const output = 'from .react-recall/logs.jsonl\\n\\n' + md;

      await navigator.clipboard.writeText(output);

      const copyBtn = document.getElementById('copyBtn');
      copyBtn.classList.add('copied');
      setTimeout(() => copyBtn.classList.remove('copied'), 1000);
    }

    function showToast(message) {
      const existing = document.querySelector('.toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }

    async function clearLogs() {
      if (!confirm('Clear all logs?')) return;

      await fetch('/api/logs', { method: 'DELETE' });
      entries = [];
      selectedIndices.clear();
      renderTimeline();
      updateCounts();
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (selectedIndices.size > 0) {
          clearSelection();
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && selectedIndices.size > 0) {
        e.preventDefault();
        copySelected();
      }
    });

    // Set platform-specific keybind hint
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    document.getElementById('copyKeybind').textContent = isMac ? '⌘C' : 'Ctrl+C';

    connect();
    updateCounts();
  </script>
</body>
</html>`;
}
