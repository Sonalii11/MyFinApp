// ── shared nav helper ──────────────────────────────────────────────────────
// Include this file in every page. Call renderShell(pageId, title) once DOM ready.

const NAV_PAGES = [
  { id:'dashboard',    href:'dashboard.html',    icon:'⊞', label:'Dashboard' },
  { id:'expenses',     href:'expenses.html',     icon:'☰', label:'Expenses' },
  { id:'wallet',       href:'wallet.html',       icon:'◈', label:'Wallet' },
  { id:'investments',  href:'investments.html',  icon:'📈', label:'Investments' },
  { id:'subscriptions',href:'subscriptions.html',icon:'⊙', label:'Subscriptions' },
  { id:'ai-chat',      href:'ai-chat.html',      icon:'✦', label:'AI Assistant' },
];

function renderShell(activeId, title) {
  // Sidebar
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = `
    <a class="sidebar-logo" href="dashboard.html">F</a>
    ${NAV_PAGES.map(p => `
      <a href="${p.href}" class="nav-btn ${p.id === activeId ? 'active' : ''}">
        ${p.icon}
        <span class="nav-tooltip">${p.label}</span>
      </a>
    `).join('')}
    <div class="nav-spacer"></div>
    <a href="#" class="nav-btn"><span>⚙</span><span class="nav-tooltip">Settings</span></a>
  `;

  // Topbar
  document.getElementById('topbar').innerHTML = `
    <div>
      <div class="page-title">${title}</div>
      <div style="font-size:12px;color:var(--text2);margin-top:2px;">March 18, 2026 · Mumbai, IN</div>
    </div>
    <div class="topbar-right">
      <button class="btn btn-ghost btn-sm" style="position:relative;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text2);">
        🔔
        <span style="position:absolute;top:4px;right:4px;background:var(--red);color:#fff;font-size:8px;font-weight:700;padding:1px 4px;border-radius:20px;">3</span>
      </button>
      <div class="avatar">AM</div>
    </div>
  `;

  // Glow bg
  document.getElementById('bg-glow').innerHTML = `
    <div class="glow-dot glow-1"></div>
    <div class="glow-dot glow-2"></div>
    <div class="glow-dot glow-3"></div>
  `;
}
