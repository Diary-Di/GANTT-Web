// ====================== DONNÉES DES TÂCHES ======================
const tasks = JSON.parse(document.getElementById('tasks-data').textContent);

// ====================== COULEURS ======================
const taskColor = '#3498db';
const criticalColor = '#e74c3c';
const lateColor = '#f1c40f';

document.addEventListener('DOMContentLoaded', () => {
    // Rendu initial
});

function renderAxis(viewMode = 'basic') {
    const leftMargin = 220;
    const topMargin = 35;        // Réduit de 65 à 35
    const rightMargin = 50;
    const bottomMargin = 25;     // Réduit de 50 à 25
    const rowHeight = 75;

    // === CALCUL DE LA DURÉE RÉELLE DU PROJET ===
    // Utiliser la date de fin maximale réelle, pas la somme des durées
    const maxEnd = Math.max(...tasks.map(t => Math.max(parseInt(t.end) || 0, parseInt(t.late_end) || 0)), 1);
    const maxDays = maxEnd + 2;  // Ajouter 2 colonnes supplémentaires

    // === TAILLE ADAPTÉE À LA DURÉE RÉELLE ===
    const cellWidth = Math.max(48, Math.min(75, Math.floor(1800 / maxDays)));

    const chartW = cellWidth * maxDays;
    const chartH = tasks.length * rowHeight;

    const svgW = leftMargin + chartW + rightMargin;
    const svgH = topMargin + chartH + bottomMargin;

    const ox = leftMargin;
    const oy = topMargin;

    const tick = maxDays <= 20 ? 1 : maxDays <= 60 ? 2 : maxDays <= 100 ? 5 : 10;

    let s = '';

    // Fond alterné
    for (let d = 0; d < maxDays; d++) {
        const x = ox + d * cellWidth;
        s += `<rect x="${x}" y="${oy}" width="${cellWidth}" height="${chartH}" fill="${d % 2 === 0 ? '#f6f9ff' : '#ffffff'}"/>`;
    }

    // Lignes verticales
    for (let d = 0; d <= maxDays; d++) {
        const x = ox + d * cellWidth;
        const main = d % tick === 0;
        s += `<line x1="${x}" y1="${oy}" x2="${x}" y2="${oy + chartH}" stroke="${main ? '#a8c4e0' : '#e0ebf7'}" stroke-width="${main ? '1.5' : '0.6'}"/>`;
    }

    // Lignes horizontales
    for (let i = 0; i <= tasks.length; i++) {
        const y = oy + i * rowHeight;
        s += `<line x1="${ox}" y1="${y}" x2="${ox + chartW}" y2="${y}" stroke="#b8d0e4" stroke-width="1.5"/>`;
    }

    // Bordure extérieure
    s += `<rect x="${ox}" y="${oy}" width="${chartW}" height="${chartH}" fill="none" stroke="#2c5f8a" stroke-width="4"/>`;

    // Graduations en haut
    for (let d = 0; d <= maxDays; d++) {
        if (d % tick === 0 && d > 0) {
            const x = ox + d * cellWidth;
            s += `<line x1="${x}" y1="${oy-12}" x2="${x}" y2="${oy+12}" stroke="#2c3e50" stroke-width="2.5"/>`;
            s += `<text x="${x}" y="${oy-22}" text-anchor="middle" font-size="16" font-weight="700" fill="#2c3e50">${d}</text>`;
        }
    }

    // Noms des tâches à gauche
    tasks.forEach((task, i) => {
        const y = oy + i * rowHeight + rowHeight / 2;
        s += `<line x1="${ox-15}" y1="${y}" x2="${ox}" y2="${y}" stroke="#2c3e50" stroke-width="2"/>`;
        s += `<text x="${ox-35}" y="${y+8}" text-anchor="end" font-size="16" font-weight="600" fill="#2c3e50">${task.name}</text>`;
    });

    // ====================== BARRES DES TÂCHES ======================
    tasks.forEach((task, i) => {
        const y = oy + i * rowHeight + 12;
        const height = rowHeight - 24;

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
                rx="10" 
                fill="${isCritical ? criticalColor : taskColor}" 
                stroke="none" opacity="0.95"/>`;

        } else if (viewMode === 'late' || viewMode === 'slack') {
            const xLate = ox + ls * cellWidth;
            const wLate = (lf - ls) * cellWidth;
            s += `<rect 
                x="${xLate.toFixed(1)}" y="${y}" 
                width="${wLate.toFixed(1)}" height="${height}" 
                rx="10" fill="${lateColor}" stroke="none" opacity="0.6"/>`;

            // Barre au plus tôt
            x = ox + es * cellWidth;
            width = (ef - es) * cellWidth;
            s += `<rect 
                x="${x.toFixed(1)}" y="${y}" 
                width="${width.toFixed(1)}" height="${height}" 
                rx="10" 
                fill="${isCritical ? criticalColor : taskColor}" 
                stroke="none" opacity="0.95"/>`;
        }
    });

    // ====================== AFFICHAGE FINAL ======================
    const svg = document.getElementById('ganttAxis');
    svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', svgH);
    svg.innerHTML = s;
}