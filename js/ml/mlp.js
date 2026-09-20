import { sigmoid, sigmoidDerivative } from './activations.js';
import { calculateLoss } from './loss.js';

/**
 * Multilayer Perceptron (2 -> 2 -> 1)
 */
export class MLP {
    constructor() {
        this.reset();
    }

    /**
     * Propagates inputs forward through the network.
     * @param {number[]} inputs - [x1, x2]
     * @returns {number} - The predicted output
     */
    forward(inputs) {
        this.state.inputs = inputs;
        
        // 1. Calculate Hidden Layer Activations
        this.state.hidden = [0, 0];
        for (let i = 0; i < 2; i++) {
            let sum = 0;
            for (let j = 0; j < 2; j++) {
                sum += inputs[j] * this.w_ih[i][j];
            }
            sum += this.b_h[i];
            this.state.hidden[i] = sigmoid(sum);
        }

        // 2. Calculate Output Layer Activation
        let outputSum = 0;
        for (let i = 0; i < 2; i++) {
            outputSum += this.state.hidden[i] * this.w_ho[0][i];
        }
        outputSum += this.b_o[0];
        this.state.output = sigmoid(outputSum);

        return this.state.output;
    }

    /**
     * Calculates gradients using backpropagation.
     * Must be called immediately after forward().
     * @param {number} target - The true target value
     */
    backward(target) {
        // Output Layer Error
        const outputError = target - this.state.output;
        // Gradient = error * derivative of activation
        const outputGradient = outputError * sigmoidDerivative(this.state.output);

        // Store gradients for Output Layer
        this.gradients.w_ho = [
            [
                outputGradient * this.state.hidden[0],
                outputGradient * this.state.hidden[1]
            ]
        ];
        this.gradients.b_o = [outputGradient];

        // Hidden Layer Errors
        const hiddenErrors = [0, 0];
        hiddenErrors[0] = this.w_ho[0][0] * outputError;
        hiddenErrors[1] = this.w_ho[0][1] * outputError;

        // Hidden Layer Gradients
        const hiddenGradients = [
            hiddenErrors[0] * sigmoidDerivative(this.state.hidden[0]),
            hiddenErrors[1] * sigmoidDerivative(this.state.hidden[1])
        ];

        // Store gradients for Hidden Layer
        this.gradients.w_ih = [
            [
                hiddenGradients[0] * this.state.inputs[0],
                hiddenGradients[0] * this.state.inputs[1]
            ],
            [
                hiddenGradients[1] * this.state.inputs[0],
                hiddenGradients[1] * this.state.inputs[1]
            ]
        ];
        this.gradients.b_h = [hiddenGradients[0], hiddenGradients[1]];
        
        return outputError; // Return pure error for metrics
    }

    /**
     * Applies the calculated gradients to update weights and biases.
     * @param {number} learningRate 
     */
    updateWeights(learningRate) {
        // Update Hidden -> Output weights
        this.w_ho[0][0] += this.gradients.w_ho[0][0] * learningRate;
        this.w_ho[0][1] += this.gradients.w_ho[0][1] * learningRate;
        this.b_o[0] += this.gradients.b_o[0] * learningRate;

        // Update Input -> Hidden weights
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                this.w_ih[i][j] += this.gradients.w_ih[i][j] * learningRate;
            }
            this.b_h[i] += this.gradients.b_h[i] * learningRate;
        }
    }

    predict(inputs) {
        return this.forward(inputs);
    }
    
    getLoss(prediction, target) {
        return calculateLoss(prediction, target);
    }

    reset() {
        // Initialize weights and biases randomly between -1 and 1
        const randomWeight = () => Math.random() * 2 - 1;
        
        this.w_ih = [
            [randomWeight(), randomWeight()], // Weights for Hidden Node 1
            [randomWeight(), randomWeight()]  // Weights for Hidden Node 2
        ];
        
        this.w_ho = [
            [randomWeight(), randomWeight()]  // Weights for Output Node
        ];
        
        this.b_h = [randomWeight(), randomWeight()]; // Biases for Hidden Nodes
        this.b_o = [randomWeight()];                 // Bias for Output Node
        
        // State storage for backprop
        this.state = {
            inputs: [0, 0],
            hidden: [0, 0],
            output: 0
        };

        this.gradients = {
            w_ih: [[0, 0], [0, 0]],
            w_ho: [[0, 0]],
            b_h: [0, 0],
            b_o: [0]
        };
    }
}
