// SM-2 Spaced Repetition Algorithm
// Based on the original SuperMemo SM-2 algorithm
//
// Each word has:
//   ease_factor  — how easy the word is (starts at 2.5, goes up/down)
//   interval     — days until next review
//   next_review  — the actual date of next review
//
// User rates each review as: 'easy', 'hard', or 'forgot'

const RATINGS = {
  easy: 5,    // Remembered perfectly with no hesitation
  hard: 3,    // Remembered but with difficulty
  forgot: 1,  // Did not remember
};

/**
 * Calculate new SM-2 values after a review
 * @param {number} easeFactor - current ease factor (default 2.5)
 * @param {number} interval - current interval in days
 * @param {'easy'|'hard'|'forgot'} rating - user's self-rating
 * @returns {{ easeFactor, interval, nextReview, mastered }}
 */
function calculateNextReview(easeFactor, interval, rating) {
  const q = RATINGS[rating];

  // Update ease factor using SM-2 formula
  let newEaseFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  // Ease factor must not drop below 1.3
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  let newInterval;

  if (q < 3) {
    // Forgot — reset interval back to 1
    newInterval = 1;
  } else if (interval === 1) {
    newInterval = 6; // After first success, jump to 6 days
  } else {
    newInterval = Math.round(interval * newEaseFactor);
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  const nextReviewDate = nextReview.toISOString().split('T')[0]; // YYYY-MM-DD

  // Consider mastered if interval exceeds 21 days
  const mastered = newInterval >= 21;

  return {
    easeFactor: parseFloat(newEaseFactor.toFixed(4)),
    interval: newInterval,
    nextReview: nextReviewDate,
    mastered,
  };
}

module.exports = { calculateNextReview };