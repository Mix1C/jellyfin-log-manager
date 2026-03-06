(function () {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    .alm-toolbar {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 6px;
      width: fit-content;
    }
    .alm-toolbar-label {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      margin-right: 2px;
      font-weight: 500;
    }
    .alm-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 5px;
      border: none;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
    }
    .alm-btn svg { width: 12px; height: 12px; flex-shrink: 0; }
    .alm-btn-danger { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
    .alm-btn-danger:hover { background: rgba(239,68,68,0.25); }
    .alm-btn-backup { background: rgba(124,92,252,0.15); color: #a88cff; border: 1px solid rgba(124,92,252,0.25); }
    .alm-btn-backup:hover { background: rgba(124,92,252,0.25); }
    .alm-btn-restart { background: rgba(245,166,35,0.15); color: #fbbf24; border: 1px solid rgba(245,166,35,0.25); }
    .alm-btn-restart:hover { background: rgba(245,166,35,0.25); }
    .alm-modal-bg {
      position: fixed; inset: 0; background: rgba(0,0,0,0.75);
      z-index: 99999; display: flex; align-items: center; justify-content: center;
    }
    .alm-modal {
      background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 24px; width: 380px; max-width: 90vw;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .alm-modal h3 { font-size: 16px; font-weight: 600; color: #e8e8e8; margin-bottom: 8px; }
    .alm-modal p { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.65; margin-bottom: 16px; }
    .alm-modal-input {
      width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
      border-radius: 6px; padding: 9px 12px; color: #e8e8e8; font-size: 13px;
      font-family: monospace; outline: none; margin-bottom: 16px;
    }
    .alm-modal-input:focus { border-color: rgba(124,92,252,0.6); }
    .alm-modal-btns { display: flex; gap: 8px; justify-content: flex-end; }
    .alm-modal-btn { padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.12s; border: 1px solid rgba(255,255,255,0.1); font-family: inherit; }
    .alm-modal-btn.cancel { background: transparent; color: rgba(255,255,255,0.5); }
    .alm-modal-btn.cancel:hover { background: rgba(255,255,255,0.06); }
    .alm-modal-btn.confirm-danger { background: #ef4444; color: #fff; border-color: #ef4444; }
    .alm-modal-btn.confirm-danger:hover { background: #dc2626; }
    .alm-modal-btn.confirm-purple { background: #7c5cfc; color: #fff; border-color: #7c5cfc; }
    .alm-modal-btn.confirm-purple:hover { background: #6b4de8; }
    .alm-modal-btn.confirm-yellow { background: #f59e0b; color: #000; border-color: #f59e0b; }
    .alm-toast {
      position: fixed; bottom: 24px; right: 24px; background: #1a1a1a;
      border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 16px;
      display: flex; align-items: center; gap: 10px; font-size: 13px; color: #e8e8e8;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4); z-index: 999999; max-width: 320px;
    }
    .alm-toast svg { width: 16px; height: 16px; flex-shrink: 0; }
    .alm-toast.success svg { color: #3ecf8e; }
    .alm-toast.error svg { color: #f87171; }
    .alm-toast.info svg { color: #a88cff; }
  `;
  document.head.appendChild(style);

  const icons = {
    trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
    restart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    db: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`
  };

  function getApiKey() {
    try {
      const creds = JSON.parse(localStorage.getItem('jellyfin_credentials') || '{}');
      const servers = creds.Servers || creds.servers || [];
      for (const s of servers) {
        if (s.AccessToken || s.accessToken) return s.AccessToken || s.accessToken;
      }
    } catch {}
    if (window.ApiClient) return window.ApiClient.accessToken();
    return null;
  }

  function getServerUrl() {
    if (window.ApiClient) return window.ApiClient.serverAddress();
    return window.location.origin;
  }

  function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = `alm-toast ${type}`;
    const iconMap = { success: icons.check, error: icons.warning, info: icons.info };
    t.innerHTML = `${iconMap[type]}<span>${msg}</span>`;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 3000);
  }

  function showModal({ title, body, inputPlaceholder, confirmText, confirmClass, onConfirm }) {
    const bg = document.createElement('div');
    bg.className = 'alm-modal-bg';
    const defaultVal = inputPlaceholder ? `~/Downloads/jellyfin_db_backup_${new Date().toISOString().split('T')[0]}.db` : '';
    bg.innerHTML = `
      <div class="alm-modal">
        <h3>${title}</h3>
        <p>${body}</p>
        ${inputPlaceholder ? `<input class="alm-modal-input" id="almModalInput" placeholder="${inputPlaceholder}" value="${defaultVal}" />` : ''}
        <div class="alm-modal-btns">
          <button class="alm-modal-btn cancel" id="almCancel">Cancel</button>
          <button class="alm-modal-btn ${confirmClass}" id="almConfirm">${confirmText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(bg);
    bg.querySelector('#almCancel').onclick = () => bg.remove();
    bg.addEventListener('click', e => { if (e.target === bg) bg.remove(); });
    bg.querySelector('#almConfirm').onclick = () => {
      const val = inputPlaceholder ? bg.querySelector('#almModalInput').value : null;
      bg.remove();
      onConfirm(val);
    };
  }

  async function clearActivityLog() {
    const token = getApiKey();
    const serverUrl = getServerUrl();
    if (!token) { showToast('Could not get API token', 'error'); return; }
    try {
      const res = await fetch(`${serverUrl}/Plugins/LogManager/ClearLog`, {
        method: 'DELETE',
        headers: { 'X-Emby-Token': token, 'Authorization': `MediaBrowser Token="${token}"` }
      });
      if (res.ok || res.status === 204) {
        showToast('Activity log cleared');
        setTimeout(() => window.location.reload(), 800);
      } else {
        showToast(`Failed (${res.status})`, 'error');
      }
    } catch (e) { showToast(`Error: ${e.message}`, 'error'); }
  }

  async function backupDatabase(savePath) {
    const token = getApiKey();
    const serverUrl = getServerUrl();
    try {
      const res = await fetch(`${serverUrl}/Plugins/LogManager/DbPath`, {
        headers: { 'X-Emby-Token': token, 'Authorization': `MediaBrowser Token="${token}"` }
      });
      const info = await res.json();
      const modal = document.createElement('div');
      modal.className = 'alm-modal-bg';
      modal.innerHTML = `
        <div class="alm-modal" style="width:460px">
          <h3>Backup Database</h3>
          <p>Run this command in Terminal to back up your database:</p>
          <input class="alm-modal-input" value='cp "${info.path}" "${savePath}"' readonly onclick="this.select()" style="cursor:text;font-size:11px" />
          <div class="alm-modal-btns">
            <button class="alm-modal-btn cancel" onclick="this.closest('.alm-modal-bg').remove()">Close</button>
            <button class="alm-modal-btn confirm-purple" onclick="navigator.clipboard.writeText(this.closest('.alm-modal').querySelector('.alm-modal-input').value).then(()=>{this.textContent='Copied!';setTimeout(()=>this.textContent='Copy Command',1500)})">Copy Command</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    } catch (e) { showToast('Could not get DB path', 'error'); }
  }

  async function restartJellyfin() {
    const token = getApiKey();
    const serverUrl = getServerUrl();
    try {
      await fetch(`${serverUrl}/System/Restart`, { method: 'POST', headers: { 'X-Emby-Token': token } });
      showToast('Jellyfin is restarting...', 'info');
      setTimeout(() => window.location.reload(), 6000);
    } catch (e) { showToast(`Restart failed: ${e.message}`, 'error'); }
  }

  function waitForElement(selector, callback, maxWait = 15000) {
    const el = document.querySelector(selector);
    if (el) { callback(el); return; }
    const start = Date.now();
    const obs = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) { obs.disconnect(); callback(el); return; }
      if (Date.now() - start > maxWait) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function injectToolbar() {
    if (document.getElementById('alm-toolbar')) return;
    waitForElement('.css-wsew38 [role="group"]', (tabGroup) => {
      if (document.getElementById('alm-toolbar')) return;
      const parent = tabGroup.parentElement;
      const toolbar = document.createElement('div');
      toolbar.id = 'alm-toolbar';
      toolbar.className = 'alm-toolbar';
      toolbar.innerHTML = `
        <span class="alm-toolbar-label">Log Manager</span>
        <button class="alm-btn alm-btn-danger" id="almClearBtn">${icons.trash} Clear Log</button>
        <button class="alm-btn alm-btn-backup" id="almBackupBtn">${icons.db} Backup DB</button>
        <button class="alm-btn alm-btn-restart" id="almRestartBtn">${icons.restart} Restart</button>
      `;
      parent.style.display = 'flex';
      parent.style.alignItems = 'center';
      parent.style.gap = '12px';
      parent.style.flexWrap = 'wrap';
      tabGroup.insertAdjacentElement('afterend', toolbar);
      toolbar.querySelector('#almClearBtn').addEventListener('click', () => {
        showModal({ title: 'Clear Activity Log', body: 'This will permanently delete all activity log entries. This cannot be undone.', confirmText: 'Clear Log', confirmClass: 'confirm-danger', onConfirm: clearActivityLog });
      });
      toolbar.querySelector('#almBackupBtn').addEventListener('click', () => {
        showModal({ title: 'Backup Database', body: 'Enter where you want to save the backup.', inputPlaceholder: '~/Downloads/jellyfin_backup.db', confirmText: 'Get Command', confirmClass: 'confirm-purple', onConfirm: backupDatabase });
      });
      toolbar.querySelector('#almRestartBtn').addEventListener('click', () => {
        showModal({ title: 'Restart Jellyfin', body: 'This will restart Jellyfin. The page will reload automatically.', confirmText: 'Restart', confirmClass: 'confirm-yellow', onConfirm: restartJellyfin });
      });
    });
  }

  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(injectToolbar, 300);
    }
  }).observe(document.body, { childList: true, subtree: true });

  window.addEventListener('hashchange', () => setTimeout(injectToolbar, 300));
  document.addEventListener('viewshow', () => setTimeout(injectToolbar, 300));
  setTimeout(injectToolbar, 500);

})();
