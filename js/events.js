/* ═══════════════════════════════════════════════════════════════════════════
   events.js  —  Event listeners
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

function bindEvents() {

  /* ── Balance input ──────────────────────────────────────────────────────── */
  document.getElementById('balanceInput').addEventListener('input', function () {
    state.balance = Math.min(parseInt(this.value) || 0, MAX_MONEY);
    renderIncomeDisplay();
    renderShopSummary();
  });

  /* ── ±$50 adjuster buttons ──────────────────────────────────────────────── */
  document.getElementById('balanceDec').addEventListener('click', () => {
    state.balance = Math.max(state.balance - 50, 0);
    document.getElementById('balanceInput').value = state.balance;
    renderIncomeDisplay();
    renderShopSummary();
  });

  document.getElementById('balanceInc').addEventListener('click', () => {
    state.balance = Math.min(state.balance + 50, MAX_MONEY);
    document.getElementById('balanceInput').value = state.balance;
    renderIncomeDisplay();
    renderShopSummary();
  });

  /* ── Preset balance buttons ─────────────────────────────────────────────── */
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.balance = parseInt(btn.dataset.val, 10);
      document.getElementById('balanceInput').value = state.balance;
      renderIncomeDisplay();
      renderShopSummary();
    });
  });

  /* ── Side selector ──────────────────────────────────────────────────────── */
  document.querySelectorAll('.side-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.side = btn.dataset.side;

      document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // CT cannot plant the bomb – clear the flag
      if (state.side === 'CT') {
        state.bombPlanted = false;
        document.getElementById('bombPlanted').checked = false;
      }

      renderBombUI();
      renderIncomeDisplay();
      refreshShop(); // reload items filtered by new side
    });
  });

  /* ── Round result buttons ───────────────────────────────────────────────── */
  document.querySelectorAll('.result-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.result = btn.dataset.result;
      document.querySelectorAll('.result-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderIncomeDisplay();
      renderBombUI();
      renderNoBuyHint();
    });
  });

  /* ── Bomb planted checkbox ──────────────────────────────────────────────── */
  document.getElementById('bombPlanted').addEventListener('change', function () {
    state.bombPlanted = this.checked;
    renderBombUI();
    renderIncomeDisplay();
    renderShopSummary();
  });

  /* ── No-buy checkbox ────────────────────────────────────────────────────── */
  document.getElementById('noBuyCheck').addEventListener('change', function () {
    state.noBuy = this.checked;
    renderNoBuyHint();
    renderIncomeDisplay();
  });

  /* ── Loss streak dots ───────────────────────────────────────────────────── */
  document.querySelectorAll('.loss-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      state.lossStreak = parseInt(dot.dataset.loss, 10);
      renderLossDots();
      renderIncomeDisplay();
    });
  });

  /* ── Calculate button ───────────────────────────────────────────────────── */
  document.getElementById('calcBtn').addEventListener('click', handleCalculate);

  /* ── Reset button → open modal ──────────────────────────────────────────── */
  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('modalOverlay').classList.add('open');
  });

  document.getElementById('modalCancel').addEventListener('click', () => {
    document.getElementById('modalOverlay').classList.remove('open');
  });

  document.getElementById('modalConfirm').addEventListener('click', () => {
    document.getElementById('modalOverlay').classList.remove('open');
    handleReset();
  });

  // Close modal on backdrop click
  document.getElementById('modalOverlay').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });

  /* ── Shop collapse toggle ───────────────────────────────────────────────── */
  document.getElementById('shopCollapseBtn').addEventListener('click', () => {
    document.getElementById('shopPanel').classList.toggle('collapsed');
    renderCollapseBtn();
  });

  /* ── Shop clear cart ────────────────────────────────────────────────────── */
  document.getElementById('shopClearBtn').addEventListener('click', clearCart);
}
