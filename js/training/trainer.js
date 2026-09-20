/**
 * Training Orchestration
 * Coordinates the model, data, and learning parameters.
 */
export class Trainer {
    constructor() {
        this.reset();
    }

    /**
     * Train the model for a single epoch (all samples in the dataset)
     */
    trainEpoch(model, dataset, learningRate) {
        let totalLoss = 0;
        let correctCount = 0;

        // Shuffle dataset to prevent oscillation (optional but good practice)
        const shuffled = [...dataset].sort(() => Math.random() - 0.5);

        for (const sample of shuffled) {
            const { input, target } = sample;
            
            // Forward Pass
            const prediction = model.forward(input);
            
            // Track Loss
            totalLoss += model.getLoss(prediction, target);
            
            // Track Accuracy (threshold at 0.5)
            const rounded = prediction >= 0.5 ? 1 : 0;
            if (rounded === target) correctCount++;
            
            // Backward Pass & Update
            model.backward(target);
            model.updateWeights(learningRate);
        }

        this.epoch++;
        const avgLoss = totalLoss / dataset.length;
        const accuracy = correctCount / dataset.length;
        
        this.lossHistory.push(avgLoss);
        
        return {
            loss: avgLoss,
            accuracy: accuracy,
            epoch: this.epoch
        };
    }

    reset() {
        this.epoch = 0;
        this.lossHistory = [];
        this.isTraining = false;
    }

    /**
     * Evaluates the model statically without updating weights
     */
    evaluate(model, dataset) {
        let totalLoss = 0;
        let correctCount = 0;
        const predictions = [];

        for (const sample of dataset) {
            const { input, target } = sample;
            const prediction = model.predict(input);
            
            totalLoss += model.getLoss(prediction, target);
            const rounded = prediction >= 0.5 ? 1 : 0;
            if (rounded === target) correctCount++;
            
            predictions.push({
                input,
                target,
                prediction: prediction,
                rounded: rounded
            });
        }

        return {
            loss: totalLoss / dataset.length,
            accuracy: correctCount / dataset.length,
            predictions: predictions
        };
    }
}
