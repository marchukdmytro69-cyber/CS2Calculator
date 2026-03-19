/* ═══════════════════════════════════════════════════════════════════════════
   main.js  —  Calculate / Reset handlers + App initialisation
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── CALCULATE ──────────────────────────────────────────────────────────── */

function handleCalculate() {
  // Guard: result must be selected
  if (!state.result) {
    const grid = document.getElementById('resultGrid');
    grid.style.outline   = '1px solid var(--accent)';
    grid.style.boxShadow = '0 0 12px rgba(245,166,35,0.3)';
    setTimeout(() => {
      grid.style.outline   = '';
      grid.style.boxShadow = '';
    }, 700);
    return;
  }

  const { newBalance } = calcIncome();

  // Build ticker key
  let rk = state.result;
  if (state.bombPlanted && state.side === 'T') {
    rk = state.result === 'win' ? 'bomb-win' : 'bomb-loss';
  }

  // Primary strategy for history label
  const { primary } = getStrategies(newBalance);

  // History strat label
  const stratLabel = state.noBuy ? 'NO-BUY' : primary.type.toUpperCase();

  // Save to history (newest first, max 10 entries)
  state.history.unshift({
    round: state.round,
    rk,
    strat: stratLabel,
    next:  newBalance,
  });
  if (state.history.length > 10) state.history.pop();

  // Render recommendation and ticker
  renderRecommendation(newBalance);
  renderTicker();

  // ── Advance state ─────────────────────────────────────────────────────────
  state.round++;
  advanceLossStreak();

  // newBalance already accounts for both spend (cart) and income
  state.balance = newBalance;
  document.getElementById('balanceInput').value = state.balance;

  // Reset per-round inputs
  state.result      = null;
  state.bombPlanted = false;
  state.noBuy       = false;
  state.kills       = [];
  document.getElementById('bombPlanted').checked = false;
  document.getElementById('noBuyCheck').checked  = false;
  document.querySelectorAll('.result-btn').forEach(b => b.classList.remove('active'));

  // Clear shop cart (fresh round)
  for (const key of Object.keys(cart)) delete cart[key];

  renderLossDots();
  renderBombUI();
  renderIncomeDisplay();
  renderNoBuyHint();
  renderShopBody();
  renderShopSummary();
}

/* ─── RESET ──────────────────────────────────────────────────────────────── */

function handleReset() {
  resetState();

  // Restore DOM inputs to defaults
  document.getElementById('balanceInput').value  = 800;
  document.getElementById('bombPlanted').checked = false;
  document.getElementById('noBuyCheck').checked  = false;

  document.querySelectorAll('.result-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.side-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.side === 'CT');
  });

  // Re-render everything
  renderEmptyRecommendation();
  renderLossDots();
  renderBombUI();
  renderIncomeDisplay();
  renderNoBuyHint();
  renderTicker();
  refreshShop();
}

/* ─── INIT ───────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Initial renders
  renderLossDots();
  renderBombUI();
  renderIncomeDisplay();
  renderNoBuyHint();
  renderTicker();
  renderShopTabs();
  renderShopBody();
  renderShopSummary();

  // Bind all event listeners
  bindEvents();
});
