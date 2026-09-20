# 🧠 XOR Neural Lab: Internal Architecture Guide

This document breaks down exactly how the **XOR Neural Lab** is built from scratch without any machine learning libraries (no TensorFlow, no PyTorch). It is designed to help you understand the codebase for your own learning and Viva defense.

The project is split into three main pillars:
1. **The ML Engine** (Pure Mathematics & Algorithms)
2. **The Visualization Engine** (p5.js Graphics)
3. **The Controller** (State Management & UI)

---

## 1. The Machine Learning Engine (Vanilla JS)
All the files located in `js/ml/` and `js/training/` handle pure data manipulation. They do not know that the UI or the browser exists.

### `activations.js`
This file contains pure mathematical functions. We use the **Sigmoid** function because it squishes any input number into a range between `0` and `1` (perfect for binary classification like XOR).
- **`sigmoid(x)`**: Returns $1 / (1 + e^{-x})$.
- **`sigmoidDerivative(x)`**: Crucial for backpropagation. It tells us how much a small change in the input will affect the output. Calculated simply as `x * (1 - x)` (assuming `x` is already passed through the sigmoid).

### `loss.js`
- Calculates the **Mean Squared Error (MSE)**. 
- During training, the network makes a prediction (e.g., `0.8`) and compares it against the target (e.g., `1.0`). The loss is `(0.8 - 1.0)²`. We average this across all 4 XOR samples to get a single number representing how "wrong" the network currently is.

### `perceptron.js`
- A basic class representing a single neuron.
- Contains two weights (`w1`, `w2`) and one `bias`.
- **`predict()`**: Multiplies inputs by weights, adds the bias ($w_1x_1 + w_2x_2 + b$), and passes the result through the sigmoid function. 
- *Note:* Because it only draws a single straight line, it mathematically cannot solve XOR.

### `mlp.js` (The Multilayer Perceptron)
This is the heart of the project. It implements a $2 \rightarrow 2 \rightarrow 1$ neural network.
1. **Initialization**: Creates arrays for weights between the input/hidden layer (`w_ih`), and hidden/output layer (`w_ho`). These are initialized to random small numbers.
2. **`predict(input)` (Forward Pass)**:
   - Takes the 2 inputs.
   - Multiplies them by `w_ih`, adds hidden biases, applies sigmoid to get the 2 hidden neuron activations.
   - Multiplies the hidden activations by `w_ho`, adds the output bias, applies sigmoid to get the final prediction (`0` to `1`).
3. **`train(input, target, lr)` (Backpropagation)**:
   - **Step 1**: Runs a forward pass to get predictions.
   - **Step 2 (Output Error)**: Calculates how wrong the output was (`target - prediction`) and multiplies it by the derivative of the output. This gives the **Output Gradient**.
   - **Step 3 (Hidden Error)**: Passes the Output Gradient *backwards* through the weights (`w_ho`) to figure out how much "blame" each of the 2 hidden neurons shares for the final error. This creates the **Hidden Gradients**.
   - **Step 4 (Weight Update)**: Uses the learning rate (`lr`) and the gradients to physically shift the numbers in the weight arrays in the opposite direction of the error.

### `trainer.js`
- Orchestrates the training. Instead of manually calling `train()` 4 times, the Trainer takes the 4 XOR samples, shuffles them (Stochastic Gradient Descent), feeds them to the MLP, and calculates the total Epoch loss.

---

## 2. The Visualization Engine (p5.js)
Located in `js/visualization/`. This maps the mathematical state of the models to pixels on the screen.

### `decisionBoundary.js`
- **How it works**: It loops over every pixel (or rather, a grid of every 15 pixels) in the p5 canvas. For every single grid coordinate, it maps the X/Y pixel value to the `(0 to 1)` coordinate space and asks the live model: *"What would you predict here?"*
- It takes the model's prediction (e.g., `0.1` or `0.9`) and uses `p.lerpColor()` to smoothly blend between the Red (Class 0) and Whitened Ink (Class 1) colors. 
- *Why this is cool:* You are literally seeing the mathematical brain of the network mapped out geographically in real-time.

### `network.js`
- Draws the physical nodes and connections.
- **How it updates live**: It reads the `w_ih` and `w_ho` arrays from the live MLP object. It maps the absolute value of the weight to the `strokeWeight()` (making the line thicker if the weight is stronger) and maps the sign (positive/negative) to the color (black or red).

---

## 3. The Controller (`app.js`)
This is the glue that binds the HTML buttons to the ML logic and the p5 graphics.

- **`state` Object**: Holds the global instances of the `Perceptron`, `MLP`, `Trainer`, and the XOR `dataset`.
- **`requestAnimationFrame`**: When you click "TRAIN", `app.js` starts a loop. Inside this loop, it tells the `Trainer` to run 50 epochs of training, updates the HTML text spans (Loss/Accuracy), and then requests the next animation frame. 
- Because `p5.js` also hooks into `requestAnimationFrame` to draw its canvases natively 60 times a second, the graphs automatically re-render based on the newest mathematical weights the moment `app.js` updates them.
