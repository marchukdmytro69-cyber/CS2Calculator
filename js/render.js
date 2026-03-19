/* ═══════════════════════════════════════════════════════════════════════════
   render.js  —  DOM rendering functions
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── INCOME DISPLAY ─────────────────────────────────────────────────────── */

function renderIncomeDisplay() {
  const { spend, afterSpend, roundBonus, lossBonus, bombBonus, defuseBonus, killBonus, totalIncome, newBalance } = calcIncome();

  // Income panel — step 1: spend
  document.getElementById('incSpend').textContent  = spend > 0 ? `-$${spend.toLocaleString()}` : '$0';
  document.getElementById('incAfterSpend').textContent = `$${afterSpend.toLocaleString()}`;

  // Step 2: income sources
  document.getElementById('incRound').textContent  = roundBonus  ? `+$${roundBonus.toLocaleString()}`  : '$0';
  document.getElementById('incLoss').textContent   = lossBonus   ? `+$${lossBonus.toLocaleString()}`   : '$0';
  document.getElementById('incBomb').textContent   = bombBonus   ? `+$${bombBonus.toLocaleString()}`   : '$0';
  document.getElementById('incDefuse').textContent = defuseBonus ? `+$${defuseBonus.toLocaleString()}` : '$0';
  document.getElementById('incKills').textContent  = killBonus   ? `+$${killBonus.toLocaleString()}`   : '$0';

  // Final result
  document.getElementById('incTotal').textContent  = `$${newBalance.toLocaleString()}`;

  // Step 1 display (balance may change while user edits)
  document.getElementById('incBalance').textContent    = `$${state.balance.toLocaleString()}`;
  document.getElementById('incSpend').textContent      = spend > 0 ? `-$${spend.toLocaleString()}` : '$0';
  document.getElementById('incAfterSpend').textContent = `$${afterSpend.toLocaleString()}`;

  // Stats bar
  document.getElementById('statBalance').textContent   = `$${state.balance.toLocaleString()}`;
  document.getElementById('statNextRound').textContent = state.result ? `$${newBalance.toLocaleString()}` : '—';
  document.getElementById('statLossBonus').textContent =
    `$${(LOSS_BONUS[Math.min(state.lossStreak, LOSS_BONUS.length - 1)] || 0).toLocaleString()}`;

  // "Після закупу" stat — shows newBalance (= after spend + income)
  const afterBuyEl = document.getElementById('statAfterBuy');
  if (state.result) {
    afterBuyEl.textContent = `$${newBalance.toLocaleString()}`;
    afterBuyEl.className   = `stat-val ${newBalance < state.balance ? 'red' : 'green'}`;
  } else if (spend > 0) {
    // result not selected yet but cart has items → show balance after spend only
    afterBuyEl.textContent = `$${afterSpend.toLocaleString()}`;
    afterBuyEl.className   = 'stat-val blue';
  } else {
    afterBuyEl.textContent = '—';
    afterBuyEl.className   = 'stat-val blue';
  }

  // Round badge
  document.getElementById('roundBadge').textContent = `ROUND ${state.round}`;
}

/* ─── LOSS STREAK DOTS ───────────────────────────────────────────────────── */

function renderLossDots() {
  document.querySelectorAll('.loss-dot').forEach(dot => {
    const n = parseInt(dot.dataset.loss, 10);
    dot.classList.toggle('active',
      state.lossStreak === 0 ? n === 0 : n <= state.lossStreak
    );
  });

  const hintEl = document.getElementById('lossHint');
  const bonus  = LOSS_BONUS[Math.min(state.lossStreak, LOSS_BONUS.length - 1)];
  hintEl.textContent = state.lossStreak === 0
    ? 'Немає бонусу поразки'
    : `Серія ${state.lossStreak}: +$${bonus.toLocaleString()} наступного раунду`;
}

/* ─── BOMB UI ────────────────────────────────────────────────────────────── */

function renderBombUI() {
  const tagEl  = document.getElementById('bombBonusTag');
  const indEl  = document.getElementById('sideIndicator');
  const subEl  = document.getElementById('bombSubHint');

  indEl.textContent = state.side;
  indEl.className   = `side-indicator ${state.side.toLowerCase()}`;

  if (state.side === 'T') {
    tagEl.textContent = '+$800 за плент (T)';
    tagEl.className   = `bomb-bonus-tag${state.bombPlanted ? ' active' : ''}`;
    if (subEl) subEl.textContent = '';
  } else {
    // CT side
    tagEl.textContent = 'CT: +$300 тільки при розмінуванні';
    tagEl.className   = 'bomb-bonus-tag';

    if (subEl) {
      if (state.bombPlanted && state.result === 'win') {
        subEl.textContent = '✓ CT виграли після плента → +$300 defuse bonus';
        subEl.style.color = 'var(--green)';
      } else if (state.bombPlanted && state.result === 'loss') {
        subEl.textContent = '✗ CT програли після плента → +$0';
        subEl.style.color = 'var(--text-dim)';
      } else if (state.bombPlanted) {
        subEl.textContent = 'Оберіть результат раунду';
        subEl.style.color = 'var(--text-dim)';
      } else {
        subEl.textContent = '';
      }
    }
  }
}

/* ─── RECOMMENDATION ─────────────────────────────────────────────────────── */

function renderLoadoutItems(items) {
  return items.map((item, i) => `
    <div class="loadout-item ${item.essential ? 'essential' : ''}"
         style="animation-delay:${0.04 + i * 0.04}s">
      <div>
        <div class="li-name">${item.name}</div>
        <div class="li-cat">${item.cat}${item.essential ? ' ★' : ''}</div>
      </div>
      <div class="li-price">${item.price > 0 ? '$' + item.price.toLocaleString() : 'СТАНДАРТ'}</div>
    </div>
  `).join('');
}

function renderAltCard(alt) {
  const cost = alt.loadout.reduce((s, i) => s + i.price, 0);

  const deficitHtml = !alt.affordable
    ? `<div class="alt-deficit">Не вистачає: $${alt.deficit.toLocaleString()}</div>`
    : '';

  const items = alt.loadout.map(i => `
    <div class="alt-li">
      <span>${i.name}</span>
      <span class="alt-li-price">${i.price > 0 ? '$' + i.price.toLocaleString() : 'FREE'}</span>
    </div>
  `).join('');

  return `
    <div class="alt-card ${alt.altClass}">
      <div class="alt-card-header">
        <span class="alt-name">${alt.label}</span>
        <span class="alt-cost">~$${cost.toLocaleString()}</span>
      </div>
      <div class="alt-reason">${alt.reason}</div>
      ${deficitHtml}
      <button class="alt-expand-btn">▼ Деталі</button>
      <div class="alt-loadout-body">
        <div class="alt-loadout-items">${items}</div>
      </div>
    </div>
  `;
}

function renderRecommendation(nextBalance) {
  const { primary, alternatives } = getStrategies(nextBalance);

  const cost = primary.loadout.reduce((s, i) => s + i.price, 0);

  const altHtml = alternatives.length ? `
    <div class="alternatives-section">
      <div class="alt-section-label">// АЛЬТЕРНАТИВИ</div>
      <div class="alternatives-grid">
        ${alternatives.map(alt => renderAltCard(alt)).join('')}
      </div>
    </div>
  ` : '';

  document.getElementById('recommendationArea').innerHTML = `
    <div class="recommendation ${primary.cssClass}">
      <div class="rec-header">
        <div>
          <div class="rec-meta">// РЕКОМЕНДАЦІЯ (інформаційно)</div>
          <div class="rec-strategy">${primary.label}</div>
        </div>
        <div class="rec-budget">
          <div class="rec-budget-label">БЮДЖЕТ РАУНДУ</div>
          <div class="rec-budget-val"><span>$</span>${nextBalance.toLocaleString()}</div>
          <div class="rec-remaining" style="color:var(--text-dim)">
            орієнтовна вартість набору: ~$${cost.toLocaleString()}
          </div>
        </div>
      </div>
      <div class="rec-reason">${primary.reason}</div>
      <div class="loadout-label">// РЕКОМЕНДОВАНИЙ НАБІР</div>
      <div class="loadout-grid">${renderLoadoutItems(primary.loadout)}</div>
      <div class="cost-summary">
        <div class="cost-tag">ОРІЄНТОВНА ВАРТІСТЬ: <span style="color:var(--accent)">~$${cost.toLocaleString()}</span></div>
        <div class="cost-tag rec-info-tag">💡 Фінальний баланс визначається магазином знизу</div>
      </div>
    </div>
    ${altHtml}
  `;

  // Bind alternative card expand/collapse
  document.querySelectorAll('.alt-card').forEach(card => {
    const btn = card.querySelector('.alt-expand-btn');

    const toggle = () => {
      const expanded = card.classList.toggle('expanded');
      btn.textContent = expanded ? '▲ Сховати' : '▼ Деталі';
    };

    btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
    card.addEventListener('click', e => {
      if (e.target === btn) return;
      toggle();
    });
  });
}

/* ─── TICKER ─────────────────────────────────────────────────────────────── */

function renderTicker() {
  const el = document.getElementById('historyTicker');
  if (!state.history.length) {
    el.innerHTML = '<span class="no-history">Немає записів</span>';
    return;
  }

  const CSS_CLASS = {
    win: 'win', loss: 'loss', pistol: 'pistol',
    'bomb-win': 'bomb-win', 'bomb-loss': 'bomb-loss',
  };
  const LABEL = {
    win: 'WIN', loss: 'LOSS', pistol: 'PSTL',
    'bomb-win': 'BOMB+W', 'bomb-loss': 'BOMB+L',
  };

  el.innerHTML = state.history
    .map(h =>
      `<span class="tick ${CSS_CLASS[h.rk] || ''}">R${h.round}·${LABEL[h.rk] || '—'}·${h.strat}·$${h.next}</span>`
    )
    .join('<span class="tick-sep">|</span>');
}

/* ─── EMPTY RECOMMENDATION STATE ─────────────────────────────────────────── */

function renderEmptyRecommendation() {
  document.getElementById('recommendationArea').innerHTML = `
    <div class="recommendation rec-empty">
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <div class="empty-text">Введіть дані та натисніть "Розрахувати"</div>
        <div class="empty-hint">Оберіть сторону, результат раунду та серію поразок</div>
      </div>
    </div>
  `;
}

/* ─── NO-BUY HINT ────────────────────────────────────────────────────────── */

/**
 * Updates the hint line below the no-buy checkbox,
 * showing how much money will carry over if the option is active.
 */
function renderNoBuyHint() {
  const hintEl = document.getElementById('noBuyHint');
  if (!hintEl) return;

  if (state.noBuy && state.result) {
    const { total } = calcIncome();
    hintEl.textContent = `Весь баланс збережеться: $${total.toLocaleString()}`;
    hintEl.style.color = 'var(--green)';
  } else if (state.noBuy) {
    hintEl.textContent = 'Виберіть результат раунду щоб побачити суму';
    hintEl.style.color = 'var(--text-dim)';
  } else {
    hintEl.textContent = '';
  }
}
