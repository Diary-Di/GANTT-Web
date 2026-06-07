const tasks = JSON.parse(document.getElementById('tasks-data').textContent);

const taskColor = '#3498db';
const criticalColor = '#e74c3c';
const lateColor = '#f1c40f';
const freeSlackColor = '#f39c12';

document.addEventListener('DOMContentLoaded', () => {
});

function parsePredecessors(value) {
    if (!value) return [];
    return value
        .toString()
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
}

function renderAxis(viewMode = 'basic') {
    const leftMargin = 220;
    const topMargin = 10;
    const rightMargin = 50;
    const bottomMargin = 55;
    const rowHeight = 75;

    const maxEnd = Math.max(...tasks.map(t => Math.max(parseInt(t.end) || 0, parseInt(t.late_end) || 0)), 1);
    const maxDays = maxEnd + 2;

    const cellWidth = Math.max(48, Math.min(75, Math.floor(1800 / maxDays)));

    const chartW = cellWidth * maxDays;
    const chartH = tasks.length * rowHeight;

    const svgW = leftMargin + chartW + rightMargin;
    const svgH = topMargin + chartH + bottomMargin;

    const ox = leftMargin;
    const oy = topMargin;

    const tick = 1;
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

    tasks.forEach((task, i) => {
        const y = oy + i * rowHeight + rowHeight / 2;
        s += `<line x1="${ox-15}" y1="${y}" x2="${ox}" y2="${y}" stroke="#2c3e50" stroke-width="2"/>`;
        s += `<text x="${ox-35}" y="${y+8}" text-anchor="end" font-size="16" font-weight="600" fill="#2c3e50">${task.name}</text>`;
    });

    tasks.forEach((task, i) => {
        const y = oy + i * rowHeight + 12;
        const height = rowHeight - 24;

        const es = parseInt(task.start) || 0;
        const ef = parseInt(task.end) || 0;
        const ls = parseInt(task.late_start) || 0;
        const lf = parseInt(task.late_end) || 0;

        const isCritical = task.is_critical === true || task.is_critical === "true";

        let x, width;

        const barHeight = Math.max(28, (height - 8) / 2);
        const barY = y + (height - barHeight) / 2;
        const barY1 = y + (height - barHeight) / 2 - barHeight / 2 - 2;
        const barY2 = y + (height - barHeight) / 2 + barHeight / 2 + 2;

        if (viewMode === 'basic') {
            x = ox + es * cellWidth;
            width = (ef - es) * cellWidth;

            s += `<rect 
                x="${x.toFixed(1)}" y="${barY.toFixed(1)}" 
                width="${width.toFixed(1)}" height="${barHeight.toFixed(1)}" 
                rx="8" fill="${taskColor}" 
                stroke="none" opacity="0.95"/>`;

        } else if (viewMode === 'early') {
            x = ox + es * cellWidth;
            width = (ef - es) * cellWidth;

            s += `<rect 
                x="${x.toFixed(1)}" y="${barY.toFixed(1)}" 
                width="${width.toFixed(1)}" height="${barHeight.toFixed(1)}" 
                rx="8" fill="${isCritical ? criticalColor : taskColor}" 
                stroke="none" opacity="0.95"/>`;

        } else if (viewMode === 'late') {
            const xEarly = ox + es * cellWidth;
            const widthEarly = (ef - es) * cellWidth;
            const xLate = ox + ls * cellWidth;
            const widthLate = (lf - ls) * cellWidth;

            s += `<rect 
                x="${xEarly.toFixed(1)}" y="${barY1.toFixed(1)}" 
                width="${widthEarly.toFixed(1)}" height="${barHeight.toFixed(1)}" 
                rx="8" fill="${isCritical ? criticalColor : taskColor}" 
                stroke="none" opacity="0.95"/>`;

            s += `<rect 
                x="${xLate.toFixed(1)}" y="${barY2.toFixed(1)}" 
                width="${widthLate.toFixed(1)}" height="${barHeight.toFixed(1)}" 
                rx="8" fill="${lateColor}" stroke="none" opacity="0.9"/>`;

        } else if (viewMode === 'slack') {
            const xEarly = ox + es * cellWidth;
            const widthEarly = (ef - es) * cellWidth;
            const xWithSlack = ox + (es + (Math.max(0, parseInt(task.free_slack) || 0))) * cellWidth;

            // Barre 1 : tâche sans contraintes (position au plus tôt)
            s += `<rect 
                x="${xEarly.toFixed(1)}" y="${barY1.toFixed(1)}" 
                width="${widthEarly.toFixed(1)}" height="${barHeight.toFixed(1)}" 
                rx="8" fill="${isCritical ? criticalColor : taskColor}" 
                stroke="none" opacity="0.95"/>`;

            // Barre 2 : tâche décalée par la marge libre
            s += `<rect 
                x="${xWithSlack.toFixed(1)}" y="${barY2.toFixed(1)}" 
                width="${widthEarly.toFixed(1)}" height="${barHeight.toFixed(1)}" 
                rx="8" fill="${freeSlackColor}" 
                stroke="none" opacity="0.95"/>`;
        }
    });

    // ====================== AFFICHAGE FINAL ======================
    const svg = document.getElementById('ganttAxis');
    svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', Math.max(600, tasks.length * 40));

    // ====================== LÉGENDE ======================
const legends = {
    basic: [
        { color: taskColor, label: 'Tâche' }
    ],
    early: [
        { color: taskColor, label: 'Tâche normale' },
        { color: criticalColor, label: 'Tâche critique' }
    ],
    late: [
        { color: taskColor, label: 'Au plus tôt' },
        { color: criticalColor, label: 'Critique au plus tôt' },
        { color: lateColor, label: 'Au plus tard' }
    ],
    slack: [
        { color: taskColor, label: 'Tâche au plus tôt' },
        { color: criticalColor, label: 'Tâche critique' },
        { color: freeSlackColor, label: 'Tâche avec marge' }
    ]
};

const legendItems = legends[viewMode] || [];
const legendY = oy + chartH + 20;
const itemWidth = 200;
const totalLegendW = legendItems.length * itemWidth;
let lx = ox + (chartW - totalLegendW) / 2;

legendItems.forEach(item => {
    s += `<rect x="${lx}" y="${legendY}" width="18" height="18" rx="4" fill="${item.color}" opacity="0.95"/>`;
    s += `<text x="${lx + 26}" y="${legendY + 13}" font-size="14" font-weight="500" fill="#2c3e50">${item.label}</text>`;
    lx += itemWidth;
});

    svg.innerHTML = s;
}