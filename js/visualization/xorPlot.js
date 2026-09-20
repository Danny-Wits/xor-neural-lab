export function drawXorPlot(p, dataset) {
    p.stroke(17);
    p.strokeWeight(2);
    
    for (const data of dataset) {
        const x = p.map(data.input[0], -0.2, 1.2, 0, p.width);
        const y = p.map(data.input[1], -0.2, 1.2, p.height, 0); 
        
        if (data.target === 1) {
            p.fill('#111111'); // Ink Black
            p.circle(x, y, 16);
        } else {
            p.fill('#C62828'); // Editorial Red
            p.rectMode(p.CENTER);
            p.rect(x, y, 14, 14);
            p.rectMode(p.CORNER);
        }
    }
}
