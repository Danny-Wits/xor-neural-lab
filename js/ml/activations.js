/**
 * Activation Functions
 */

/**
 * Sigmoid activation function
 * Squeezes any value into a range between 0 and 1.
 * @param {number} x 
 * @returns {number}
 */
export function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

/**
 * Derivative of the sigmoid function
 * Used during backpropagation to calculate gradients.
 * Expects the output of the sigmoid function (y = sigmoid(x)) as input.
 * @param {number} y 
 * @returns {number}
 */
export function sigmoidDerivative(y) {
    return y * (1 - y);
}
