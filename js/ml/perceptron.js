/**
 * Single Perceptron Implementation
 */
export class Perceptron {
    constructor() {
        this.reset();
    }

    /**
     * Calculates the dot product of inputs and weights, adds bias,
     * and passes it through a step function.
     */
    predict(inputs) {
        const sum = this.weights[0] * inputs[0] + this.weights[1] * inputs[1] + this.bias;
        return sum >= 0 ? 1 : 0;
    }

    /**
     * Standard perceptron learning rule.
     * Only updates if the prediction is wrong.
     */
    train(inputs, target, learningRate = 0.1) {
        const guess = this.predict(inputs);
        const error = target - guess;

        if (error !== 0) {
            this.weights[0] += error * inputs[0] * learningRate;
            this.weights[1] += error * inputs[1] * learningRate;
            this.bias += error * learningRate;
        }
        
        return Math.abs(error); // Return absolute error for tracking
    }

    reset() {
        // Initialize weights and bias randomly between -1 and 1
        this.weights = [Math.random() * 2 - 1, Math.random() * 2 - 1];
        this.bias = Math.random() * 2 - 1;
    }
}
