import { XOR_DATA } from './data/xor.js';
import { Perceptron } from './ml/perceptron.js';
import { MLP } from './ml/mlp.js';
import { Trainer } from './training/trainer.js';
import { drawXorPlot } from './visualization/xorPlot.js';
import { drawPerceptronNetwork, drawMLPNetwork } from './visualization/network.js';
import { drawDecisionBoundary } from './visualization/decisionBoundary.js';
import { updateLossChart, initLossChart, resetLossChart } from './visualization/lossChart.js';
import { drawTrainingAnimation, drawLinearSeparabilityDemo, drawXorProblemHighlight } from './visualization/animations.js';

// Application State
const state = {
    perceptron: new Perceptron(),
    perceptronEpoch: 0,
    perceptronIsTraining: false,
    perceptronLoopId: null,

    mlp: new MLP(),
    trainer: new Trainer(),
    dataset: XOR_DATA,
    mlpLoopId: null
};

const get = (id) => document.getElementById(id);

function init() {
    const canvas = get('lossChart');
    if (canvas) initLossChart(canvas.getContext('2d'));

    setupVisualizations();
    connectPerceptronControls();
    connectMLPControls();
    
    updateMLPUI();
    updatePerceptronUI();
}

// ==========================================
// SINGLE PERCEPTRON LOGIC
// ==========================================
function connectPerceptronControls() {
    get('btn-perceptron-step').addEventListener('click', () => {
        pausePerceptron();
        stepPerceptron();
    });
    get('btn-perceptron-train').addEventListener('click', () => {
        if (!state.perceptronIsTraining) startPerceptron();
    });
    get('btn-perceptron-pause').addEventListener('click', pausePerceptron);
    get('btn-perceptron-reset').addEventListener('click', () => {
        pausePerceptron();
        state.perceptron.reset();
        state.perceptronEpoch = 0;
        updatePerceptronUI();
    });
}

function stepPerceptron() {
    // Train one epoch
    for (const sample of state.dataset) {
        state.perceptron.train(sample.input, sample.target, 0.1);
    }
    state.perceptronEpoch++;
    updatePerceptronUI();
}

function startPerceptron() {
    state.perceptronIsTraining = true;
    function loop() {
        if (!state.perceptronIsTraining) return;
        stepPerceptron();
        state.perceptronLoopId = requestAnimationFrame(loop);
    }
    loop();
}

function pausePerceptron() {
    state.perceptronIsTraining = false;
    if (state.perceptronLoopId) cancelAnimationFrame(state.perceptronLoopId);
}

function updatePerceptronUI() {
    const cards = document.querySelectorAll('#sec-04 .status-value');
    if (cards.length >= 4) {
        cards[0].innerText = `[${state.perceptron.weights[0].toFixed(2)}, ${state.perceptron.weights[1].toFixed(2)}]`;
        cards[1].innerText = state.perceptron.bias.toFixed(2);
        cards[2].innerText = state.perceptronEpoch;
        
        // Calculate accuracy
        let correct = 0;
        for (const sample of state.dataset) {
            if (state.perceptron.predict(sample.input) === sample.target) correct++;
        }
        cards[3].innerText = (correct / 4 * 100).toFixed(0) + '%';
    }
}

// ==========================================
// MLP EXPERIMENT LOGIC
// ==========================================
function connectMLPControls() {
    get('exp-step').addEventListener('click', () => { pauseMLP(); stepMLP(); });
    get('btn-mlp-step').addEventListener('click', () => { pauseMLP(); stepMLP(); }); // Connect section 8 too

    get('exp-train').addEventListener('click', () => { if (!state.trainer.isTraining) startMLP(); });
    get('btn-mlp-train').addEventListener('click', () => { if (!state.trainer.isTraining) startMLP(); });

    get('exp-pause').addEventListener('click', pauseMLP);
    get('btn-mlp-pause').addEventListener('click', pauseMLP);

    const doReset = () => {
        pauseMLP();
        state.mlp.reset();
        state.trainer.reset();
        resetLossChart();
        updateMLPUI();
    };
    get('exp-reset').addEventListener('click', doReset);
    get('btn-mlp-reset').addEventListener('click', doReset);
    
    get('lr-slider').disabled = false;

    const lrSlider = get('lr-slider');
    const lrDisplay = get('lr-display');
    if (lrSlider && lrDisplay) {
        lrSlider.addEventListener('input', (e) => {
            lrDisplay.innerText = parseFloat(e.target.value).toFixed(2);
            // Update Section 08 label too
            const sec8Stats = document.querySelectorAll('#sec-08 .status-value');
            if (sec8Stats.length >= 4) sec8Stats[3].innerText = e.target.value;
        });
    }

    get('epoch-input').disabled = false;
}

function stepMLP() {
    const lr = parseFloat(get('lr-slider').value) || 0.1;
    const metrics = state.trainer.trainEpoch(state.mlp, state.dataset, lr);
    updateLossChart(metrics.epoch, metrics.loss);
    updateMLPUI();
}

function startMLP() {
    state.trainer.isTraining = true;
    const targetEpoch = parseInt(get('epoch-input').value) || 10000;
    const lr = parseFloat(get('lr-slider').value) || 0.1;

    function loop() {
        if (!state.trainer.isTraining) return;
        if (state.trainer.epoch >= targetEpoch) { pauseMLP(); return; }

        for (let i = 0; i < 50; i++) {
            if (state.trainer.epoch >= targetEpoch) break;
            const metrics = state.trainer.trainEpoch(state.mlp, state.dataset, lr);
            if (state.trainer.epoch % 10 === 0) updateLossChart(metrics.epoch, metrics.loss);
        }
        
        updateMLPUI();
        state.mlpLoopId = requestAnimationFrame(loop);
    }
    loop();
}

function pauseMLP() {
    state.trainer.isTraining = false;
    if (state.mlpLoopId) cancelAnimationFrame(state.mlpLoopId);
}

function updateMLPUI() {
    const metrics = state.trainer.evaluate(state.mlp, state.dataset);
    
    // Experiment Stats
    const statsDivs = document.querySelectorAll('.panel-stats .stat .val');
    if (statsDivs.length >= 3) {
        statsDivs[0].innerText = metrics.loss.toFixed(4);
        statsDivs[1].innerText = (metrics.accuracy * 100).toFixed(1) + '%';
        statsDivs[2].innerText = state.trainer.epoch;
    }

    // Section 8 Stats
    const sec8Stats = document.querySelectorAll('#sec-08 .status-value');
    if (sec8Stats.length >= 4) {
        sec8Stats[0].innerText = state.trainer.epoch;
        sec8Stats[1].innerText = metrics.loss.toFixed(4);
        sec8Stats[2].innerText = (metrics.accuracy * 100).toFixed(1) + '%';
        sec8Stats[3].innerText = get('lr-slider').value;
    }

    // Results Table
    const tbody = document.querySelector('#sec-10 tbody');
    if (tbody && metrics.predictions) {
        metrics.predictions.forEach((p, idx) => {
            const tr = tbody.children[idx];
            tr.children[2].innerText = p.prediction.toFixed(4);
            tr.children[3].innerText = p.rounded === p.target ? '✓ Pass' : '✕ Fail';
            tr.children[3].style.color = p.rounded === p.target ? 'var(--success-green)' : 'var(--accent-red)';
        });
    }

    
    // Final Metrics
    const finalMetrics = document.querySelectorAll('.final-metrics .val');
    if (finalMetrics.length >= 2) {
        finalMetrics[0].innerText = (metrics.accuracy * 100).toFixed(1) + '%';
        finalMetrics[1].innerText = metrics.loss.toFixed(4);
    }
}

// ==========================================
// VISUALIZATIONS
// ==========================================
function setupVisualizations() {
    document.querySelectorAll('.placeholder-label').forEach(el => el.style.display = 'none');

    // 1. Static XOR Plot (Section 01)
    new p5((p) => {
        p.setup = () => {
            const c = get('xor-vis-placeholder');
            c.innerHTML = '';
            p.createCanvas(c.clientWidth, c.clientHeight);
            p.noLoop();
        };
        p.windowResized = () => { const c = get('xor-vis-placeholder'); if (c) p.resizeCanvas(c.clientWidth, c.clientHeight); };
        p.draw = () => { p.background('#F4F0E6'); drawXorPlot(p, state.dataset); };
    }, 'xor-vis-placeholder');

    // 2. Perceptron Decision Boundary (Section 04)
    new p5((p) => {
        p.setup = () => {
            const c = get('perceptron-boundary-vis');
            c.innerHTML = '';
            p.createCanvas(c.clientWidth, c.clientHeight);
        };
        p.windowResized = () => { const c = get('perceptron-boundary-vis'); if (c) p.resizeCanvas(c.clientWidth, c.clientHeight); };
        p.draw = () => {
            p.background('#F4F0E6');
            drawDecisionBoundary(p, state.perceptron, 15);
            drawXorPlot(p, state.dataset);
        };
    }, 'perceptron-boundary-vis');

    // 3. MLP Decision Boundary (Section 10)
    new p5((p) => {
        p.setup = () => {
            const c = get('decision-regions-container');
            c.innerHTML = '';
            p.createCanvas(c.clientWidth, c.clientHeight);
        };
        p.windowResized = () => { const c = get('decision-regions-container'); if (c) p.resizeCanvas(c.clientWidth, c.clientHeight); };
        p.draw = () => {
            p.background('#F4F0E6');
            drawDecisionBoundary(p, state.mlp, 15);
            drawXorPlot(p, state.dataset);
        };
    }, 'decision-regions-container');
    // 4. Perceptron Network Architecture (Section 03)
    new p5((p) => {
        p.setup = () => {
            const c = get('perceptron-vis-placeholder');
            c.innerHTML = '';
            p.createCanvas(c.clientWidth, c.clientHeight);
        };
        p.windowResized = () => { const c = get('perceptron-vis-placeholder'); if (c) p.resizeCanvas(c.clientWidth, c.clientHeight); };
        p.draw = () => {
            p.background('#F4F0E6');
            drawPerceptronNetwork(p, state.perceptron);
        };
    }, 'perceptron-vis-placeholder');

    // 5. MLP Network Architecture (Section 07)
    new p5((p) => {
        p.setup = () => {
            const c = get('mlp-vis-placeholder');
            c.innerHTML = '';
            p.createCanvas(c.clientWidth, c.clientHeight);
        };
        p.windowResized = () => { const c = get('mlp-vis-placeholder'); if (c) p.resizeCanvas(c.clientWidth, c.clientHeight); };
        p.draw = () => {
            p.background('#F4F0E6');
            drawMLPNetwork(p, state.mlp);
        };
    }, 'mlp-vis-placeholder');

    // 6. Training Process Animation (Section 08)
    new p5((p) => {
        p.setup = () => {
            const c = get('animation-container');
            c.innerHTML = '';
            p.createCanvas(c.clientWidth, c.clientHeight);
        };
        p.windowResized = () => { const c = get('animation-container'); if (c) p.resizeCanvas(c.clientWidth, c.clientHeight); };
        p.draw = () => {
            drawTrainingAnimation(p, state.trainer.isTraining);
        };
    }, 'animation-container');

    // 7. Linear Separability Demo (Section 05)
    new p5((p) => {
        p.setup = () => {
            const c = get('linear-separability-vis');
            c.innerHTML = '';
            p.createCanvas(c.clientWidth, c.clientHeight);
        };
        p.windowResized = () => { const c = get('linear-separability-vis'); if (c) p.resizeCanvas(c.clientWidth, c.clientHeight); };
        p.draw = () => {
            drawLinearSeparabilityDemo(p);
        };
    }, 'linear-separability-vis');

    

    // 8. XOR Problem Highlight (Section 02)
    new p5((p) => {
        p.setup = () => {
            const c = get('xor-boundary-placeholder');
            c.innerHTML = '';
            p.createCanvas(c.clientWidth, c.clientHeight);
        };
        p.windowResized = () => { const c = get('xor-boundary-placeholder'); if (c) p.resizeCanvas(c.clientWidth, c.clientHeight); };
        p.draw = () => {
            drawXorProblemHighlight(p);
        };
    }, 'xor-boundary-placeholder');

}

document.addEventListener('DOMContentLoaded', init);
