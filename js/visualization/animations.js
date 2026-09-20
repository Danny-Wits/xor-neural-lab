/**
 * Handles visual transitions and forward/backward signal animations
 */

let animState = {
    phase: 0,
    progress: 0
};

export function drawTrainingAnimation(p, isTraining) {
    p.background('#F4F0E6');
    
    const w = p.width;
    const h = p.height;
    
    const in1 = p.createVector(w * 0.2, h * 0.3);
    const in2 = p.createVector(w * 0.2, h * 0.7);
    const h1 = p.createVector(w * 0.5, h * 0.3);
    const h2 = p.createVector(w * 0.5, h * 0.7);
    const out = p.createVector(w * 0.8, h * 0.5);
    
    // Draw base connections (faint)
    p.stroke('#C8C2B5');
    p.strokeWeight(2);
    p.line(in1.x, in1.y, h1.x, h1.y);
    p.line(in2.x, in2.y, h1.x, h1.y);
    p.line(in1.x, in1.y, h2.x, h2.y);
    p.line(in2.x, in2.y, h2.x, h2.y);
    p.line(h1.x, h1.y, out.x, out.y);
    p.line(h2.x, h2.y, out.x, out.y);
    
    // Animate signals
    if (isTraining) {
        animState.progress += 0.04; // Animation speed
        if (animState.progress > 1) {
            animState.progress = 0;
            animState.phase = (animState.phase + 1) % 4;
        }
        
        p.noStroke();
        p.textFont('JetBrains Mono');
        p.textSize(14);
        p.textAlign(p.CENTER, p.CENTER);

        let p1, p2, p3, p4;

        if (animState.phase === 0) {
            p.fill('#111111'); // Forward signals (Black)
            p1 = p5.Vector.lerp(in1, h1, animState.progress);
            p2 = p5.Vector.lerp(in2, h1, animState.progress);
            p3 = p5.Vector.lerp(in1, h2, animState.progress);
            p4 = p5.Vector.lerp(in2, h2, animState.progress);
            p.circle(p1.x, p1.y, 12);
            p.circle(p2.x, p2.y, 12);
            p.circle(p3.x, p3.y, 12);
            p.circle(p4.x, p4.y, 12);
            
            p.text("1. FORWARD PASS", w * 0.5, h * 0.9);
            
        } else if (animState.phase === 1) {
            p.fill('#111111');
            p1 = p5.Vector.lerp(h1, out, animState.progress);
            p2 = p5.Vector.lerp(h2, out, animState.progress);
            p.circle(p1.x, p1.y, 12);
            p.circle(p2.x, p2.y, 12);
            
            p.text("2. PREDICTION & LOSS", w * 0.5, h * 0.9);
            
        } else if (animState.phase === 2) {
            p.fill('#C62828'); // Backward signals (Red)
            p1 = p5.Vector.lerp(out, h1, animState.progress);
            p2 = p5.Vector.lerp(out, h2, animState.progress);
            p.circle(p1.x, p1.y, 12);
            p.circle(p2.x, p2.y, 12);
            
            p.text("3. BACKPROPAGATION", w * 0.5, h * 0.9);
            
        } else if (animState.phase === 3) {
            p.fill('#C62828');
            p1 = p5.Vector.lerp(h1, in1, animState.progress);
            p2 = p5.Vector.lerp(h1, in2, animState.progress);
            p3 = p5.Vector.lerp(h2, in1, animState.progress);
            p4 = p5.Vector.lerp(h2, in2, animState.progress);
            p.circle(p1.x, p1.y, 12);
            p.circle(p2.x, p2.y, 12);
            p.circle(p3.x, p3.y, 12);
            p.circle(p4.x, p4.y, 12);
            
            p.text("4. WEIGHT UPDATE", w * 0.5, h * 0.9);
        }
    } else {
        p.fill('#5A5A5A');
        p.noStroke();
        p.textFont('JetBrains Mono');
        p.textSize(14);
        p.textAlign(p.CENTER, p.CENTER);
        p.text("READY TO TRAIN", w * 0.5, h * 0.9);
    }
    
    // Draw Nodes over lines
    p.stroke('#111111');
    p.strokeWeight(2);
    p.fill('#F4F0E6');
    
    const r = 40;
    p.circle(in1.x, in1.y, r);
    p.circle(in2.x, in2.y, r);
    p.circle(h1.x, h1.y, r);
    p.circle(h2.x, h2.y, r);
    p.circle(out.x, out.y, r);
    
    // Node Labels
    p.noStroke();
    p.fill('#111111');
    p.textSize(12);
    p.text("x₁", in1.x, in1.y);
    p.text("x₂", in2.x, in2.y);
    p.text("h₁", h1.x, h1.y);
    p.text("h₂", h2.x, h2.y);
    p.text("ŷ", out.x, out.y);
}

export function drawLinearSeparabilityDemo(p) {
    p.background('#F4F0E6');
    
    // Draw the 4 XOR points
    const w = p.width;
    const h = p.height;
    
    // Helper to map 0..1 to canvas coordinates (inset slightly)
    const mapX = (val) => p.map(val, -0.2, 1.2, 0, w);
    const mapY = (val) => p.map(val, -0.2, 1.2, h, 0); // invert y
    
    // Points
    const p00 = { x: mapX(0), y: mapY(0), target: 0 };
    const p11 = { x: mapX(1), y: mapY(1), target: 0 };
    const p01 = { x: mapX(0), y: mapY(1), target: 1 };
    const p10 = { x: mapX(1), y: mapY(0), target: 1 };
    
    // Time-based sweeping line parameters
    const t = p.millis() / 2000.0;
    
    // Line equation: A*x + B*y + C = 0
    // We can just rotate and sweep a line
    p.push();
    p.translate(w/2, h/2);
    p.rotate(t);
    
    // Move the line back and forth
    const offset = p.sin(t * 1.5) * (w / 4);
    p.translate(offset, 0);
    
    // Draw the failure boundary
    p.stroke('#111111');
    p.strokeWeight(2);
    p.line(0, -h, 0, h);
    
    // Draw the two regions
    p.noStroke();
    p.fill(255, 255, 255, 120); // Whitened for contrast
    p.rect(0, -h, w, h*2);
    
    p.fill(198, 40, 40, 40); // Red tint
    p.rect(-w, -h, w, h*2);
    p.pop();
    
    // Draw points on top
    p.stroke(17);
    p.strokeWeight(2);
    
    const drawPt = (pt) => {
        if (pt.target === 1) {
            p.fill('#111111'); // Ink
            p.circle(pt.x, pt.y, 16);
        } else {
            p.fill('#C62828'); // Red
            p.rectMode(p.CENTER);
            p.rect(pt.x, pt.y, 14, 14);
            p.rectMode(p.CORNER);
        }
    };
    
    drawPt(p00);
    drawPt(p11);
    drawPt(p01);
    drawPt(p10);
    
    // Draw label
    p.noStroke();
    p.fill(17);
    p.textFont('JetBrains Mono');
    p.textSize(12);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text("SWEEPING LINEAR DECISION BOUNDARY", w/2, h - 10);
}

export function drawXorProblemHighlight(p) {
    p.background('#F4F0E6');
    
    const w = p.width;
    const h = p.height;
    
    const mapX = (val) => p.map(val, -0.2, 1.2, 0, w);
    const mapY = (val) => p.map(val, -0.2, 1.2, h, 0); 
    
    const p00 = { x: mapX(0), y: mapY(0), target: 0 };
    const p11 = { x: mapX(1), y: mapY(1), target: 0 };
    const p01 = { x: mapX(0), y: mapY(1), target: 1 };
    const p10 = { x: mapX(1), y: mapY(0), target: 1 };
    
    const t = p.millis() / 1500.0;
    const phase = Math.floor(t) % 2; // alternates between 0 and 1
    const pulse = (p.sin(p.millis() / 200.0) + 1) / 2; // 0 to 1
    
    // Draw cross lines highlighting the problem
    p.strokeWeight(4);
    if (phase === 0) {
        // Highlight Class 0 (Red)
        p.stroke(198, 40, 40, 150 * pulse);
        p.line(p00.x, p00.y, p11.x, p11.y);
    } else {
        // Highlight Class 1 (Black)
        p.stroke(17, 17, 17, 150 * pulse);
        p.line(p01.x, p01.y, p10.x, p10.y);
    }
    
    // Grid lines for context
    p.stroke('#C8C2B5');
    p.strokeWeight(1);
    p.drawingContext.setLineDash([5, 5]);
    p.line(mapX(0), 0, mapX(0), h);
    p.line(mapX(1), 0, mapX(1), h);
    p.line(0, mapY(0), w, mapY(0));
    p.line(0, mapY(1), w, mapY(1));
    p.drawingContext.setLineDash([]);
    
    // Draw points
    p.stroke(17);
    p.strokeWeight(2);
    
    const drawPt = (pt) => {
        if (pt.target === 1) {
            p.fill('#111111'); 
            p.circle(pt.x, pt.y, 16);
        } else {
            p.fill('#C62828'); 
            p.rectMode(p.CENTER);
            p.rect(pt.x, pt.y, 14, 14);
            p.rectMode(p.CORNER);
        }
    };
    
    drawPt(p00);
    drawPt(p11);
    drawPt(p01);
    drawPt(p10);
    
    // Coordinate labels
    p.noStroke();
    p.fill(17);
    p.textFont('JetBrains Mono');
    p.textSize(12);
    p.text("(0,1)", p01.x - 40, p01.y);
    p.text("(1,0)", p10.x + 10, p10.y);
    p.text("(0,0)", p00.x - 40, p00.y);
    p.text("(1,1)", p11.x + 10, p11.y);
}
