/**
 * Renders the Neural Networks using p5.js
 */

export function drawPerceptronNetwork(p, model) {
    p.clear();
    
    const nodeRadius = 25;
    const w = p.width;
    const h = p.height;
    
    // Positions
    const x1Pos = { x: w * 0.2, y: h * 0.3 };
    const x2Pos = { x: w * 0.2, y: h * 0.7 };
    const outPos = { x: w * 0.8, y: h * 0.5 };
    
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    p.textFont('JetBrains Mono');

    // Draw Connections
    drawConnection(p, x1Pos, outPos, model.weights[0]);
    drawConnection(p, x2Pos, outPos, model.weights[1]);
    
    // Draw Bias Connection
    const biasPos = { x: w * 0.5, y: h * 0.2 };
    drawConnection(p, biasPos, outPos, model.bias, true);
    
    // Draw Nodes
    drawNode(p, x1Pos.x, x1Pos.y, 'x₁', nodeRadius);
    drawNode(p, x2Pos.x, x2Pos.y, 'x₂', nodeRadius);
    drawNode(p, biasPos.x, biasPos.y, 'b', nodeRadius, true);
    drawNode(p, outPos.x, outPos.y, 'ŷ', nodeRadius);
}

export function drawMLPNetwork(p, model) {
    p.clear();
    
    const nodeRadius = 25;
    const w = p.width;
    const h = p.height;
    
    // Positions
    const in1 = { x: w * 0.15, y: h * 0.3 };
    const in2 = { x: w * 0.15, y: h * 0.7 };
    
    const h1 = { x: w * 0.5, y: h * 0.3 };
    const h2 = { x: w * 0.5, y: h * 0.7 };
    
    const out = { x: w * 0.85, y: h * 0.5 };
    
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    p.textFont('JetBrains Mono');

    // Input -> Hidden Connections
    if (model.w_ih) {
        drawConnection(p, in1, h1, model.w_ih[0][0]);
        drawConnection(p, in2, h1, model.w_ih[0][1]);
        drawConnection(p, in1, h2, model.w_ih[1][0]);
        drawConnection(p, in2, h2, model.w_ih[1][1]);
    }
    
    // Hidden -> Output Connections
    if (model.w_ho) {
        drawConnection(p, h1, out, model.w_ho[0][0]);
        drawConnection(p, h2, out, model.w_ho[0][1]);
    }
    
    // Biases
    if (model.b_h) {
        const bh1 = { x: w * 0.35, y: h * 0.15 };
        const bh2 = { x: w * 0.35, y: h * 0.85 };
        drawConnection(p, bh1, h1, model.b_h[0], true);
        drawConnection(p, bh2, h2, model.b_h[1], true);
        drawNode(p, bh1.x, bh1.y, 'b', 15, true);
        drawNode(p, bh2.x, bh2.y, 'b', 15, true);
    }
    
    if (model.b_o) {
        const bo = { x: w * 0.7, y: h * 0.2 };
        drawConnection(p, bo, out, model.b_o[0], true);
        drawNode(p, bo.x, bo.y, 'b', 15, true);
    }

    // Nodes
    drawNode(p, in1.x, in1.y, 'x₁', nodeRadius);
    drawNode(p, in2.x, in2.y, 'x₂', nodeRadius);
    
    drawNode(p, h1.x, h1.y, 'h₁', nodeRadius);
    drawNode(p, h2.x, h2.y, 'h₂', nodeRadius);
    
    drawNode(p, out.x, out.y, 'ŷ', nodeRadius);
}

function drawConnection(p, start, end, weight, isBias = false) {
    if (weight === undefined) return;
    
    const weightVal = parseFloat(weight);
    const absW = Math.abs(weightVal);
    
    // Thickness based on weight magnitude
    const thickness = p.map(p.constrain(absW, 0, 5), 0, 5, 0.5, 6);
    
    // Color: Ink for positive, Red for negative
    if (weightVal >= 0) {
        p.stroke(17, 17, 17, 180); // Ink
    } else {
        p.stroke(198, 40, 40, 180); // Red
    }
    
    if (isBias) p.drawingContext.setLineDash([5, 5]); // Dashed line for bias
    else p.drawingContext.setLineDash([]);
    
    p.strokeWeight(thickness);
    p.line(start.x, start.y, end.x, end.y);
    
    p.drawingContext.setLineDash([]); // Reset
    
    // Draw weight value text
    p.noStroke();
    p.fill(17);
    
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // Offset slightly so it doesn't overlap perfectly with line
    p.push();
    p.translate(midX, midY - 10);
    p.fill(244, 240, 230, 200); // Paper bg for readability
    p.rectMode(p.CENTER);
    p.rect(0, 0, 36, 14);
    p.fill(17);
    p.text(weightVal.toFixed(2), 0, 0);
    p.pop();
}

function drawNode(p, x, y, label, radius, isSmall = false) {
    p.stroke(17);
    p.strokeWeight(2);
    p.fill(244, 240, 230); // Paper background
    
    if (isSmall) {
        p.rectMode(p.CENTER);
        p.rect(x, y, radius*1.5, radius*1.5);
    } else {
        p.circle(x, y, radius * 2);
    }
    
    p.noStroke();
    p.fill(17);
    p.text(label, x, y);
}
