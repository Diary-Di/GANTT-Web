const tasks = JSON.parse(document.getElementById('tasks-data').textContent);

document.addEventListener('DOMContentLoaded', () => {
  if (typeof tasks !== 'undefined' && tasks.length > 0) {
    renderAxis();
  }
});

function renderAxis() {
  const marginLeft   = 160;
  const marginRight  = 50;
  const marginTop    = 60;   // espace au-dessus de l'origine pour la flèche Y
  const marginBottom = 50;
  const rowHeight    = 50;
  const yArrowLen    = 40;
  const chartWidth   = 750;

  const totalDuration = tasks.reduce((sum, t) => sum + parseInt(t.duration), 0);
  const maxDays       = Math.max(totalDuration, 10);
  const chartHeight   = tasks.length * rowHeight;

  const svgWidth  = marginLeft + chartWidth + marginRight;
  const svgHeight = marginTop + chartHeight + marginBottom;

  const originX = marginLeft;
  const originY = marginTop;   // origine en haut à gauche

  const scale = chartWidth / maxDays;

  let html = '';

  // ── Axe Y (vers le haut) ──
  html += `<line x1="${originX}" y1="${originY}" x2="${originX}" y2="${originY - yArrowLen}"
           stroke="#2c3e50" stroke-width="1.5"/>`;
  html += `<polygon points="${originX},${originY - yArrowLen - 8}
           ${originX - 5},${originY - yArrowLen}
           ${originX + 5},${originY - yArrowLen}" fill="#2c3e50"/>`;
  html += `<text x="${originX}" y="${originY - yArrowLen - 16}"
           text-anchor="middle" font-size="13" font-weight="bold" fill="#2c3e50">Y</text>`;

  // ── Axe Y' (vers le bas — direction des tâches) ──
  const yPrimeEnd = originY + chartHeight + 20;
  html += `<line x1="${originX}" y1="${originY}" x2="${originX}" y2="${yPrimeEnd}"
           stroke="#2c3e50" stroke-width="1.5"/>`;
  html += `<polygon points="${originX},${yPrimeEnd + 8}
           ${originX - 5},${yPrimeEnd}
           ${originX + 5},${yPrimeEnd}" fill="#2c3e50"/>`;
  html += `<text x="${originX}" y="${yPrimeEnd + 22}"
           text-anchor="middle" font-size="13" font-weight="bold" fill="#2c3e50">Y'</text>`;

  // ── Axe X (vers la droite — direction du temps) ──
  const xAxisEnd = originX + chartWidth + 20;
  html += `<line x1="${originX}" y1="${originY}" x2="${xAxisEnd}" y2="${originY}"
           stroke="#2c3e50" stroke-width="1.5"/>`;
  html += `<polygon points="${xAxisEnd + 8},${originY}
           ${xAxisEnd},${originY - 5}
           ${xAxisEnd},${originY + 5}" fill="#2c3e50"/>`;
  html += `<text x="${xAxisEnd + 14}" y="${originY + 4}"
           font-size="13" font-weight="bold" fill="#2c3e50">X</text>`;

  // ── Origine O ──
  html += `<text x="${originX - 14}" y="${originY + 5}"
           font-size="12" fill="#7f8c9a">O</text>`;

  // ── Graduations axe X (jours) ──
  const tickInterval = maxDays <= 15 ? 1 : maxDays <= 40 ? 2 : maxDays <= 80 ? 5 : 10;

  for (let d = 0; d <= maxDays; d += tickInterval) {
    const x = originX + d * scale;
    html += `<line x1="${x}" y1="${originY - 4}" x2="${x}" y2="${originY + 4}"
             stroke="#2c3e50" stroke-width="1"/>`;
    if (d > 0) {
      html += `<text x="${x}" y="${originY - 9}"
               font-size="10" fill="#7f8c9a" text-anchor="middle">${d}</text>`;
      html += `<line x1="${x}" y1="${originY}" x2="${x}" y2="${originY + chartHeight}"
               stroke="#eef1f4" stroke-width="1" stroke-dasharray="4,3"/>`;
    }
  }

  // Label axe X
  html += `<text x="${originX + chartWidth / 2}" y="${originY + chartHeight + 40}"
           font-size="11" fill="#7f8c9a" text-anchor="middle">Durée (jours)</text>`;

  // ── Graduations axe Y' (tâches) ──
  tasks.forEach((task, i) => {
    const y = originY + (i + 1) * rowHeight;

    // Trait horizontal de grille
    html += `<line x1="${originX}" y1="${y}" x2="${originX + chartWidth}" y2="${y}"
             stroke="#eef1f4" stroke-width="1" stroke-dasharray="4,3"/>`;

    // Graduation sur Y'
    html += `<line x1="${originX - 6}" y1="${y}" x2="${originX + 6}" y2="${y}"
             stroke="#2c3e50" stroke-width="1"/>`;

    // Nom de la tâche
    html += `<text x="${originX - 12}" y="${y + 4}"
             font-size="12" fill="#2c3e50" text-anchor="end">${task.name}</text>`;
  });

  const svg = document.getElementById('ganttAxis');
  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', svgHeight);
  svg.innerHTML = html;
}