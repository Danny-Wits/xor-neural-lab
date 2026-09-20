export function drawDecisionBoundary(p, model, resolution = 15) {
    p.noStroke();
    
    // Editorial colors
    const color0 = p.color(198, 40, 40, 50);   // Red tint for Class 0
    const color1 = p.color(255, 255, 255, 180);  // Whitened for high contrast    // Ink tint for Class 1
    
    for (let i = 0; i < p.width; i += resolution) {
        for (let j = 0; j < p.height; j += resolution) {
            const x1 = p.map(i, 0, p.width, -0.2, 1.2);
            const x2 = p.map(j, p.height, 0, -0.2, 1.2); 
            
            const prediction = model.predict([x1, x2]);
            
            // Lerp between Red (0) and Black (1)
            const c = p.lerpColor(color0, color1, prediction);
            p.fill(c);
            p.rect(i, j, resolution, resolution);
        }
    }
}
