// ====================== DONNÉES DES TÂCHES ======================
const tasks = JSON.parse(document.getElementById('tasks-data').textContent);

// ====================== COULEURS ======================
const taskColors = [
    '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#e67e22', '#34495e'
];

document.addEventListener('DOMContentLoaded', () => {
    // Le rendu initial est déjà appelé depuis gantt.html
});

// ====================== FONCTION PRINCIPALE DE RENDU ======================
function renderAxis(viewMode = 'basic') {
    const leftMargin = 130;
    const topMargin = 30;
    const rightMargin = 20;
    const bottomMargin = 20;
    const rowHeight = 36;

    // Calcul des dimensions
    const totalDuration = tasks.reduce((sum, t) => sum + parseInt(t.duration), 0);
    const maxDays = Math.max(totalDuration, 10);

    const cellWidth = Math.max(20, Math.min(38, Math.floor(800 / maxDays)));

    const chartW = cellWidth * maxDays;
    const chartH = tasks.length * rowHeight;

    const svgW = leftMargin + chartW + rightMargin;
    const svgH = topMargin + chartH + bottomMargin;

    const ox = leftMargin;
    const oy = topMargin;

    const tick = maxDays <= 10 ? 1 : maxDays <= 30 ? 2 : maxDays <= 60 ? 5 : 10;

    let s = '';

    // ─────────────────────────────────────────────
    // Fond alterné + Grille
    // ─────────────────────────────────────────────
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
    s += `<rect x="${ox}" y="${oy}" width="${chartW}" height="${chartH}" fill="none" stroke="#5d8aaa" stroke-width="2"/>`;

    // Graduations en haut
    for (let d = 0; d <= maxDays; d++) {
        if (d % tick === 0 && d > 0) {
            const x = ox + d * cellWidth;
            s += `<line x1="${x}" y1="${oy-5}" x2="${x}" y2="${oy+5}" stroke="#2c3e50" stroke-width="1.5"/>`;
            s += `<text x="${x}" y="${oy-10}" text-anchor="middle" font-size="11" fill="#2c3e50">${d}</text>`;
        }
    }

    // Noms des tâches à gauche
    tasks.forEach((task, i) => {
        const y = oy + i * rowHeight + rowHeight / 2;
        s += `<line x1="${ox-8}" y1="${y}" x2="${ox}" y2="${y}" stroke="#2c3e50" stroke-width="1.2"/>`;
        s += `<text x="${ox-15}" y="${y+4}" text-anchor="end" font-size="13" fill="#2c3e50">${task.name}</text>`;
    });

    // ─────────────────────────────────────────────
    // DESSIN DES BARRES SELON LE MODE
    // ─────────────────────────────────────────────
    tasks.forEach((task, i) => {
        const y = oy + i * rowHeight + 8;
        const height = rowHeight - 16;

        const es = parseInt(task.start) || 0;
        const ef = parseInt(task.end) || 0;
        const ls = parseInt(task.late_start) || 0;
        const lf = parseInt(task.late_end) || 0;

        const isCritical = task.is_critical === true || task.is_critical === "true";
        const color = isCritical ? '#e74c3c' : taskColors[i % taskColors.length];

        let x, width;

        if (viewMode === 'basic') {
            // 1. Tâches simples
            x = ox + es * cellWidth;
            width = (ef - es) * cellWidth;
            s += `<rect x="${x.toFixed(1)}" y="${y}" width="${width.toFixed(1)}" height="${height}" rx="4" fill="${color}" stroke="#263549" stroke-width="2"/>`;

        } else if (viewMode === 'early') {
            // 2. Dates au plus tôt + mise en évidence du chemin critique
            x = ox + es * cellWidth;
            width = (ef - es) * cellWidth;
            s += `<rect x="${x.toFixed(1)}" y="${y}" width="${width.toFixed(1)}" height="${height}" rx="4" fill="${color}" stroke="#263549" stroke-width="${isCritical ? '3.5' : '2'}"/>`;

        } else if (viewMode === 'late') {
            // 3. Dates au plus tard (barre grise + barre colorée)
            const xLate = ox + ls * cellWidth;
            const wLate = (lf - ls) * cellWidth;
            s += `<rect x="${xLate.toFixed(1)}" y="${y}" width="${wLate.toFixed(1)}" height="${height}" rx="4" fill="#e0e6ed" stroke="#94a3b8" stroke-width="1.2"/>`;

            x = ox + es * cellWidth;
            width = (ef - es) * cellWidth;
            s += `<rect x="${x.toFixed(1)}" y="${y}" width="${width.toFixed(1)}" height="${height}" rx="4" fill="${color}" stroke="#263549" stroke-width="2"/>`;

        } else if (viewMode === 'slack') {
            // 4. Visualisation des marges totales
            const xLate = ox + ls * cellWidth;
            const wLate = (lf - ls) * cellWidth;
            s += `<rect x="${xLate.toFixed(1)}" y="${y}" width="${wLate.toFixed(1)}" height="${height}" rx="4" fill="#e0e6ed" stroke="#94a3b8" stroke-width="1.2"/>`;

            x = ox + es * cellWidth;
            width = (ef - es) * cellWidth;
            s += `<rect x="${x.toFixed(1)}" y="${y}" width="${width.toFixed(1)}" height="${height}" rx="4" fill="${color}" stroke="#263549" stroke-width="2"/>`;
        }

        // Texte sur la barre principale
        if (width && width > 60) {
            s += `<text x="${(x + width/2).toFixed(1)}" y="${y + height/2 + 5}" text-anchor="middle" font-size="12.8" fill="white" font-weight="600">${task.name}</text>`;
        } else if (width) {
            s += `<text x="${(x + width + 8).toFixed(1)}" y="${y + height/2 + 5}" font-size="12.5" fill="#2c3e50">${task.name}</text>`;
        }
    });

    // ====================== AFFICHAGE FINAL ======================
    const svg = document.getElementById('ganttAxis');
    svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', svgH);
    svg.innerHTML = s;
}