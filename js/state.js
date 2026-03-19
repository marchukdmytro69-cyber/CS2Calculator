/* ═══════════════════════════════════════════════════════════════════════════
   state.js  —  Central application state
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/**
 * Mutable game state.
 * All modules read/write this object directly.
 * Use resetState() to restore defaults.
 */
const state = {
  /** Current money balance ($). */
  balance: 800,

  /** Active side: 'CT' | 'T'. */
  side: 'CT',

  /**
   * Result of the PREVIOUS round.
   * 'win' | 'loss' | 'pistol' | null (not selected yet)
   */
  result: null,

  /**
   * Whether the bomb was planted this round (T side only).
   * Grants +$800 regardless of win/loss.
   */
  bombPlanted: false,

  /**
   * If true, the player skips buying entirely this round.
   * The full projected balance carries over without any deduction.
   */
  noBuy: false,

  /**
   * Kill bonuses this round.  Array of { killId, count }.
   * e.g. [{ killId:'knife', count:1 }, { killId:'smg_sg', count:2 }]
   */
  kills: [],

  /**
   * Number of consecutive losses (0–5).
   * Used to index into LOSS_BONUS.
   */
  lossStreak: 0,

  /** Current round number (display only). */
  round: 1,

  /**
   * Round history for the ticker (newest first).
   * Each entry: { round, rk, strat, next }
   */
  history: [],
};

/**
 * Shopping cart: { itemId: count }.
 * Separate from round state so it persists across UI refreshes.
 */
const cart = {};

/** Reset all state fields to default values. */
function resetState() {
  state.balance     = 800;
  state.side        = 'CT';
  state.result      = null;
  state.bombPlanted = false;
  state.noBuy       = false;
  state.kills       = [];
  state.lossStreak  = 0;
  state.round       = 1;
  state.history     = [];

  // Clear cart
  for (const key of Object.keys(cart)) {
    delete cart[key];
  }
}

/** Total cost of items in the cart. */
function cartTotal() {
  let sum = 0;
  for (const [id, count] of Object.entries(cart)) {
    const w = findWeapon(id);
    if (w) sum += w.price * count;
  }
  return sum;
}
