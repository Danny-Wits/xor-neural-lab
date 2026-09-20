/**
 * Loss Functions
 */

/**
 * Mean Squared Error (MSE) for a single sample
 * @param {number} prediction - The predicted value (0 to 1)
 * @param {number} target - The true target value (0 or 1)
 * @returns {number}
 */
export function calculateLoss(prediction, target) {
    const error = target - prediction;
    return 0.5 * error * error;
}
