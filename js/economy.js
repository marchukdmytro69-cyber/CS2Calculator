/* ═══════════════════════════════════════════════════════════════════════════
   economy.js  —  Economy calculation logic
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/**
 * Calculate the full money flow for the current round.
 *
 * CORRECT ORDER (matches CS2 behaviour and user intuition):
 *   Step 1 — Spend:  afterPurchase = balance - cartCost
 *   Step 2 — Earn:   newBalance    = afterPurchase + roundIncome
 *
 * BOMB RULES:
 *   T side  → +$800 (BOMB_PLANT_BONUS) whenever bomb is planted, win or lose.
 *   CT side → +$300 (CT_DEFUSE_BONUS) ONLY when bomb was planted AND CT won.
 *
 * @returns {{
 *   spend:        number,   cost of cart items
 *   afterSpend:   number,   balance after deducting purchases
 *   roundBonus:   number,
 *   lossBonus:    number,
 *   bombBonus:    number,
 *   defuseBonus:  number,
 *   totalIncome:  number,   sum of all income sources
 *   newBalance:   number    final balance carried to next round
 * }}
 */
function calcIncome() {
  const { balance, side, result, bombPlanted, lossStreak } = state;

  // ── Step 1: purchases ────────────────────────────────────────────────────
  const spend      = state.noBuy ? 0 : cartTotal();
  const afterSpend = Math.max(balance - spend, 0);

  // ── Step 2: income sources ───────────────────────────────────────────────
  let roundBonus  = 0;
  let lossBonus   = 0;
  let bombBonus   = 0;
  let defuseBonus = 0;

  if (result === 'win') {
    roundBonus = WIN_INCOME[side];

  } else if (result === 'loss') {
    lossBonus = LOSS_BONUS[Math.min(lossStreak, LOSS_BONUS.length - 1)];
  }
  // result === null → not selected yet, income = $0

  // T bomb plant bonus (always, regardless of win/loss)
  if (bombPlanted && side === 'T') {
    bombBonus = BOMB_PLANT_BONUS;
  }

  // CT defuse bonus: only when CT won AND bomb was planted
  if (bombPlanted && side === 'CT' && result === 'win') {
    defuseBonus = CT_DEFUSE_BONUS;
  }

  // Kill bonuses: sum rewards for all recorded kills
  let killBonus = 0;
  for (const entry of state.kills) {
    const def = KILL_REWARDS.find(k => k.id === entry.killId);
    if (def) killBonus += def.reward * entry.count;
  }

  const totalIncome = roundBonus + lossBonus + bombBonus + defuseBonus + killBonus;
  const newBalance  = Math.min(afterSpend + totalIncome, MAX_MONEY);

  return { spend, afterSpend, roundBonus, lossBonus, bombBonus, defuseBonus, killBonus, totalIncome, newBalance };
}

/**
 * Determine the primary recommended strategy plus up to 2 alternatives.
 * Uses newBalance (after spend + income) to decide the strategy.
 *
 * @param {number} nextBalance
 * @returns {{ primary: object, alternatives: object[] }}
 */
function getStrategies(nextBalance) {
  const all = buildStrategies(state.side);

  const primaryIdx = all.findIndex(s => nextBalance >= s.minBalance);
  const primary    = all[primaryIdx] ?? all[all.length - 1];
  const idx        = all.indexOf(primary);

  const alternatives = [];

  if (idx > 0) {
    const s       = all[idx - 1];
    const deficit = Math.max(0, s.minBalance - nextBalance);
    alternatives.push({ ...s, deficit, affordable: deficit === 0 });
  }

  if (idx < all.length - 1) {
    alternatives.push({ ...all[idx + 1], deficit: 0, affordable: true });
  }

  return { primary, alternatives: alternatives.slice(0, 2) };
}

/**
 * Advance loss streak after a round completes.
 * Called AFTER recording history, BEFORE clearing state.result.
 */
function advanceLossStreak() {
  if (state.result === 'loss') {
    state.lossStreak = Math.min(state.lossStreak + 1, 5);
  } else if (state.result === 'win') {
    state.lossStreak = 0;
  }
}
