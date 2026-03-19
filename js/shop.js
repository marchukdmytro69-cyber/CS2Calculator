/* ═══════════════════════════════════════════════════════════════════════════
   shop.js  —  Item Shop panel + Kills tab
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/** Items that are mutually exclusive (only one can be in cart at a time). */
const ARMOR_MUTEX = ['kevlar', 'kevlarhelm'];

/** Special tab id for the kills sub-panel. */
const KILLS_TAB = 'kills';

let activeShopTab = 'rifles';

/* ─── TABS ───────────────────────────────────────────────────────────────── */

function renderShopTabs() {
  const tabsEl = document.getElementById('shopTabs');

  const weaponTabs = WEAPON_CATEGORIES.map(cat => `
    <button class="shop-tab ${cat.id === activeShopTab ? 'active' : ''}"
            data-tab="${cat.id}">${cat.label}</button>
  `).join('');

  const killsActive = activeShopTab === KILLS_TAB;
  const killsTab = `<button class="shop-tab kills-tab ${killsActive ? 'active' : ''}"
                            data-tab="${KILLS_TAB}">💀 Кіли</button>`;

  tabsEl.innerHTML = weaponTabs + killsTab;

  tabsEl.querySelectorAll('.shop-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeShopTab = btn.dataset.tab;
      renderShopTabs();
      renderShopBody();
    });
  });
}

/* ─── BODY ROUTER ────────────────────────────────────────────────────────── */

function renderShopBody() {
  if (activeShopTab === KILLS_TAB) {
    renderKillsPanel();
  } else {
    renderShopItems();
  }
}

/* ─── ITEM CHIPS ─────────────────────────────────────────────────────────── */

function renderShopItems() {
  const rowEl = document.getElementById('shopItemsRow');
  rowEl.className = 'shop-items-row chip-mode';

  const cat = WEAPON_CATEGORIES.find(c => c.id === activeShopTab);
  if (!cat) { rowEl.innerHTML = ''; return; }

  rowEl.innerHTML = cat.items.map(item => {
    const forThisSide = item.sides.includes(state.side);
    const count       = cart[item.id] || 0;
    const maxCount    = item.maxCount || 1;

    // Balance guard
    const currentSpend = cartTotal();
    const cantAfford   = count === 0 && (currentSpend + item.price) > state.balance;

    const badge = count > 1 ? `<span class="chip-badge">${count}</span>` : '';

    const classes = [
      'shop-chip',
      count > 0    ? 'selected'      : '',
      !forThisSide ? 'disabled-side' : '',
      cantAfford   ? 'cant-afford'   : '',
    ].filter(Boolean).join(' ');

    return `
      <div class="${classes}" data-item-id="${item.id}"
           title="${item.name} — $${item.price.toLocaleString()}${cantAfford ? ' ⚠ не вистачає коштів' : ''}">
        ${badge}
        <div class="chip-name">${item.name}</div>
        <div class="chip-price">$${item.price.toLocaleString()}</div>
        <div class="chip-cat">${item.cat}${maxCount > 1 ? ' ×' + maxCount : ''}</div>
      </div>
    `;
  }).join('');

  rowEl.querySelectorAll('.shop-chip:not(.disabled-side)').forEach(chip => {
    chip.addEventListener('click', () => {
      const id  = chip.dataset.itemId;
      const w   = findWeapon(id);
      if (!w) return;

      const max = w.maxCount || 1;
      const cur = cart[id] || 0;

      if (cur >= max) {
        // Deselect – always allowed
        delete cart[id];
      } else {
        // Balance guard
        if (cartTotal() + w.price > state.balance) {
          chip.classList.add('flash-deny');
          setTimeout(() => chip.classList.remove('flash-deny'), 500);
          return;
        }
        // Armor mutex: pick one of kevlar / kevlar+helm
        if (ARMOR_MUTEX.includes(id)) {
          for (const other of ARMOR_MUTEX) {
            if (other !== id) delete cart[other];
          }
        }
        cart[id] = cur + 1;
      }

      renderShopItems();
      renderShopSummary();
      renderIncomeDisplay();
    });
  });
}

/* ─── KILLS PANEL ────────────────────────────────────────────────────────── */

function killTotalCount() {
  return state.kills.reduce((s, e) => s + e.count, 0);
}

function killTotalBonus() {
  let sum = 0;
  for (const e of state.kills) {
    const def = KILL_REWARDS.find(k => k.id === e.killId);
    if (def) sum += def.reward * e.count;
  }
  return sum;
}

function getKillCount(killId) {
  return (state.kills.find(e => e.killId === killId) || { count: 0 }).count;
}

function setKillCount(killId, count) {
  const idx = state.kills.findIndex(e => e.killId === killId);
  if (count <= 0) {
    if (idx >= 0) state.kills.splice(idx, 1);
  } else {
    if (idx >= 0) state.kills[idx].count = count;
    else          state.kills.push({ killId, count });
  }
}

function renderKillsPanel() {
  const rowEl = document.getElementById('shopItemsRow');
  rowEl.className = 'shop-items-row kills-mode';

  const totalCount = killTotalCount();
  const totalBonus = killTotalBonus();

  rowEl.innerHTML = `
    <div class="kills-panel">
      <div class="kills-header">
        <span class="kills-header-label">// ВБИВСТВА ЗА РАУНД</span>
        <span class="kills-total-badge">
          ${totalCount} / ${MAX_KILLS} кілів
          &nbsp;|&nbsp;
          Бонус: <b style="color:var(--green)">+$${totalBonus.toLocaleString()}</b>
        </span>
        <button class="kills-reset-btn" id="killsResetBtn">✕ Скинути</button>
      </div>
      <div class="kills-rows">
        ${KILL_REWARDS.map(def => {
          const count  = getKillCount(def.id);
          const canAdd = totalCount < MAX_KILLS;
          return `
            <div class="kill-row">
              <span class="kill-icon">${def.icon}</span>
              <div class="kill-info">
                <div class="kill-name">${def.label}</div>
                <div class="kill-desc">${def.desc}</div>
              </div>
              <div class="kill-reward">+$${def.reward.toLocaleString()}<span>/кіл</span></div>
              <div class="kill-counter">
                <button class="kill-btn kill-dec" data-kill="${def.id}"
                        ${count === 0 ? 'disabled' : ''}>−</button>
                <span class="kill-count ${count > 0 ? 'active' : ''}">${count}</span>
                <button class="kill-btn kill-inc" data-kill="${def.id}"
                        ${!canAdd ? 'disabled' : ''}>+</button>
              </div>
              <div class="kill-subtotal">${count > 0 ? `+$${(def.reward * count).toLocaleString()}` : ''}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  rowEl.querySelectorAll('.kill-inc').forEach(btn => {
    btn.addEventListener('click', () => {
      if (killTotalCount() >= MAX_KILLS) return;
      setKillCount(btn.dataset.kill, getKillCount(btn.dataset.kill) + 1);
      renderKillsPanel(); renderShopSummary(); renderIncomeDisplay();
    });
  });

  rowEl.querySelectorAll('.kill-dec').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = getKillCount(btn.dataset.kill);
      if (cur <= 0) return;
      setKillCount(btn.dataset.kill, cur - 1);
      renderKillsPanel(); renderShopSummary(); renderIncomeDisplay();
    });
  });

  document.getElementById('killsResetBtn').addEventListener('click', () => {
    state.kills = [];
    renderKillsPanel(); renderShopSummary(); renderIncomeDisplay();
  });
}

/* ─── CART SUMMARY ───────────────────────────────────────────────────────── */

function renderShopSummary() {
  const { newBalance } = calcIncome();
  const ct = cartTotal();
  const kb = killTotalBonus();

  let cartLabel = ct > 0 ? `Кошик: $${ct.toLocaleString()}` : 'Кошик: $0';
  if (kb > 0) cartLabel += `  💀 +$${kb.toLocaleString()}`;
  document.getElementById('shopCartTotal').textContent = cartLabel;

  const afterEl = document.getElementById('shopAfterBuyLabel');
  if (ct > 0 || kb > 0) {
    afterEl.textContent = `→ Результат: $${newBalance.toLocaleString()}`;
    afterEl.className   = 'shop-after-buy positive';
  } else {
    afterEl.textContent = '';
    afterEl.className   = 'shop-after-buy';
  }
}

/* ─── COLLAPSE TOGGLE ────────────────────────────────────────────────────── */

function renderCollapseBtn() {
  const collapsed = document.getElementById('shopPanel').classList.contains('collapsed');
  document.getElementById('shopCollapseBtn').textContent = collapsed ? '▼' : '▲';
}

/* ─── CLEAR CART ─────────────────────────────────────────────────────────── */

function clearCart() {
  for (const key of Object.keys(cart)) delete cart[key];
  state.kills = [];
  renderShopBody();
  renderShopSummary();
  renderIncomeDisplay();
}

/* ─── FULL SHOP REFRESH ──────────────────────────────────────────────────── */

function refreshShop() {
  for (const key of Object.keys(cart)) delete cart[key];
  state.kills   = [];
  activeShopTab = 'rifles';
  renderShopTabs();
  renderShopBody();
  renderShopSummary();
}
