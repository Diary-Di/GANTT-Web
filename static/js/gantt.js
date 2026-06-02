// ====================== DONNÉES DES TÂCHES ======================
const tasks = JSON.parse(document.getElementById('tasks-data').textContent);

// ====================== COULEURS ======================
const taskColor = '#3498db';           // Bleu uniforme
const criticalColor = '#e74c3c';       // Rouge pour chemin critique

document.addEventListener('DOMContentLoaded', () => {
    // Rendu initial
});

function renderAxis(viewMode = 'basic') {
    const leftMargin = 140;
    const topMargin = 35;
    const rightMargin = 25;
    const bottomMargin = 25;
    const rowHeight = 42;

    const totalDuration = tasks.reduce((sum, t) => sum + parseInt(t.duration), 0);
    const maxDays = Math.max(totalDuration, 12);

    const cellWidth = Math.max(24, Math.min(45, Math.floor(1100 / maxDays)));

    const chartW = cellWidth * maxDays;
    const chartH = tasks.length * rowHeight;

    const svgW = leftMargin + chartW + rightMargin;
    const svgH = topMargin + chartH + bottomMargin;

    const ox = leftMargin;
    const oy = topMargin;

    const tick = maxDays <= 15 ? 1 : maxDays <= 40 ? 2 : maxDays <= 80 ? 5 : 10;

    let s = '';

    // Fond alterné
    for (let d = 0; d < maxDays; d++) {
        const x = ox + d * cellWidth;
        s += `<rect x="${x}" y="${oy}" width="${cellWidth}" height="${chartH}" fill="${d % 2 === 0 ? '#f8fbff' : '#ffffff'}"/>`;
    }

    // Lignes verticales
    for (let d = 0; d <= maxDays; d++) {
        const x = ox + d * cellWidth;
        const main = d % tick === 0;
        s += `<line x1="${x}" y1="${oy}" x2="${x}" y2="${oy + chartH}" stroke="${main ? '#b8d0e4' : '#ddeaf3'}" stroke-width="${main ? '1' : '0.5'}"/>`;
    }

    // Lignes horizontales
    for (let i = 0; i <= tasks.length; i++) {
        const y = oy + i * rowHeight;
        s += `<line x1="${ox}" y1="${y}" x2="${ox + chartW}" y2="${y}" stroke="#b8d0e4" stroke-width="1"/>`;
    }

    // Bordure extérieure
    s += `<rect x="${ox}" y="${oy}" width="${chartW}" height="${chartH}" fill="none" stroke="#5d8aaa" stroke-width="2.5"/>`;

    // Graduations en haut
    for (let d = 0; d <= maxDays; d++) {
        if (d % tick === 0 && d > 0) {
            const x = ox + d * cellWidth;
            s += `<line x1="${x}" y1="${oy-6}" x2="${x}" y2="${oy+6}" stroke="#2c3e50" stroke-width="1.5"/>`;
            s += `<text x="${x}" y="${oy-11}" text-anchor="middle" font-size="12" fill="#2c3e50" font-weight="500">${d}</text>`;
        }
    }

    // Noms des tâches à gauche (repère)
    tasks.forEach((task, i) => {
        const y = oy + i * rowHeight + rowHeight / 2;
        s += `<line x1="${ox-8}" y1="${y}" x2="${ox}" y2="${y}" stroke="#2c3e50" stroke-width="1.3"/>`;
        s += `<text x="${ox-18}" y="${y+5}" text-anchor="end" font-size="13.5" fill="#2c3e50" font-weight="500">${task.name}</text>`;
    });

    // ====================== BARRES DES TÂCHES ======================
    tasks.forEach((task, i) => {
        const y = oy + i * rowHeight + 9;
        const height = rowHeight - 18;

        const es = parseInt(task.start) || 0;
        const ef = parseInt(task.end) || 0;
        const ls = parseInt(task.late_start) || 0;
        const lf = parseInt(task.late_end) || 0;

        const isCritical = task.is_critical === true || task.is_critical === "true";

        let x, width;

        if (viewMode === 'basic' || viewMode === 'early') {
            x = ox + es * cellWidth;
            width = (ef - es) * cellWidth;

            s += `<rect 
                x="${x.toFixed(1)}" y="${y}" 
                width="${width.toFixed(1)}" height="${height}" 
                rx="5" 
                fill="${isCritical ? criticalColor : taskColor}" 
                stroke="none"/>`;

        } else if (viewMode === 'late' || viewMode === 'slack') {
            // Barre au plus tard (grise)
            const xLate = ox + ls * cellWidth;
            const wLate = (lf - ls) * cellWidth;
            s += `<rect 
                x="${xLate.toFixed(1)}" y="${y}" 
                width="${wLate.toFixed(1)}" height="${height}" 
                rx="5" fill="#e0e6ed" stroke="none"/>`;

            // Barre au plus tôt
            x = ox + es * cellWidth;
            width = (ef - es) * cellWidth;
            s += `<rect 
                x="${x.toFixed(1)}" y="${y}" 
                width="${width.toFixed(1)}" height="${height}" 
                rx="5" 
                fill="${isCritical ? criticalColor : taskColor}" 
                stroke="none"/>`;
        }
    });

    // ====================== AFFICHAGE FINAL ======================
    const svg = document.getElementById('ganttAxis');
    svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', svgH);
    svg.innerHTML = s;
}