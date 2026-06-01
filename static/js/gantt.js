const tasks = JSON.parse(document.getElementById('tasks-data').textContent);

document.addEventListener('DOMContentLoaded', () => {
  if (tasks.length > 0) renderAxis();
});

function renderAxis() {
  const leftMargin   = 130;
  const topMargin    = 55;  // espace pour numéros X + flèche Y
  const rightMargin  = 50;
  const bottomMargin = 55;  // espace pour flèche Y' + label
  const rowHeight    = 36;
  const yArrowExtra  = 32;

  const totalDuration = tasks.reduce((sum, t) => sum + parseInt(t.duration), 0);
  const maxDays       = Math.max(totalDuration, 10);

  // Largeur d'une cellule (colonne = 1 jour)
  const cellWidth  = Math.max(20, Math.min(38, Math.floor(800 / maxDays)));
  const chartW     = cellWidth * maxDays;
  const chartH     = tasks.length * rowHeight;

  const svgW  = leftMargin + chartW + rightMargin;
  const svgH  = topMargin + chartH + bottomMargin;

  const ox = leftMargin;   // origine X
  const oy = topMargin;    // origine Y (coin haut-gauche de la grille)

  // Intervalle des graduations selon le nombre de jours
  const tick = maxDays <= 10 ? 1 : maxDays <= 30 ? 2 : maxDays <= 60 ? 5 : 10;

  let s = '';

  // ── Fond de grille : colonnes alternées ──────────────────────────────
  for (let d = 0; d < maxDays; d++) {
    const x = ox + d * cellWidth;
    s += `<rect x="${x}" y="${oy}" width="${cellWidth}" height="${chartH}"
          fill="${d % 2 === 0 ? '#f4f8fc' : '#ffffff'}"/>`;
  }

  // ── Lignes verticales de la grille ───────────────────────────────────
  for (let d = 0; d <= maxDays; d++) {
    const x    = ox + d * cellWidth;
    const main = d % tick === 0;
    s += `<line x1="${x}" y1="${oy}" x2="${x}" y2="${oy + chartH}"
          stroke="${main ? '#b8d0e4' : '#ddeaf3'}"
          stroke-width="${main ? '1' : '0.5'}"/>`;
  }

  // ── Lignes horizontales de la grille ─────────────────────────────────
  for (let i = 0; i <= tasks.length; i++) {
    const y    = oy + i * rowHeight;
    const main = true;
    s += `<line x1="${ox}" y1="${y}" x2="${ox + chartW}" y2="${y}"
          stroke="#b8d0e4" stroke-width="1"/>`;
  }

  // ── Bordures extérieures de la grille ────────────────────────────────
  s += `<rect x="${ox}" y="${oy}" width="${chartW}" height="${chartH}"
        fill="none" stroke="#5d8aaa" stroke-width="1.5"/>`;

  // ── Axe X (ligne du haut, direction du temps) ────────────────────────
  const xEnd = ox + chartW + 20;
  s += `<line x1="${ox}" y1="${oy}" x2="${xEnd}" y2="${oy}"
        stroke="#2c3e50" stroke-width="2"/>`;
  s += `<polygon points="${xEnd + 9},${oy} ${xEnd},${oy - 5} ${xEnd},${oy + 5}"
        fill="#2c3e50"/>`;
  s += `<text x="${xEnd + 16}" y="${oy + 5}"
        font-size="13" font-weight="bold" fill="#2c3e50" font-family="sans-serif">X</text>`;

  // ── Axe Y (flèche vers le haut au-dessus de l'origine) ───────────────
  s += `<line x1="${ox}" y1="${oy}" x2="${ox}" y2="${oy - yArrowExtra}"
        stroke="#2c3e50" stroke-width="2"/>`;
  s += `<polygon points="${ox},${oy - yArrowExtra - 9} ${ox - 5},${oy - yArrowExtra} ${ox + 5},${oy - yArrowExtra}"
        fill="#2c3e50"/>`;
  s += `<text x="${ox}" y="${oy - yArrowExtra - 16}"
        text-anchor="middle" font-size="13" font-weight="bold" fill="#2c3e50" font-family="sans-serif">Y</text>`;

  // ── Axe Y' (flèche vers le bas sous la grille) ───────────────────────
  const yBot = oy + chartH;
  s += `<line x1="${ox}" y1="${yBot}" x2="${ox}" y2="${yBot + 28}"
        stroke="#2c3e50" stroke-width="2"/>`;
  s += `<polygon points="${ox},${yBot + 37} ${ox - 5},${yBot + 28} ${ox + 5},${yBot + 28}"
        fill="#2c3e50"/>`;
  s += `<text x="${ox}" y="${yBot + 50}"
        text-anchor="middle" font-size="13" font-weight="bold" fill="#2c3e50" font-family="sans-serif">Y'</text>`;

  // ── Point et label Origine O ─────────────────────────────────────────
  s += `<circle cx="${ox}" cy="${oy}" r="3" fill="#2c3e50"/>`;
  s += `<text x="${ox - 16}" y="${oy - 10}"
        font-size="11" fill="#5d8aaa" font-family="sans-serif">O</text>`;

  // ── Numéros sur l'axe X (au-dessus de la grille) ─────────────────────
  for (let d = 0; d <= maxDays; d++) {
    if (d % tick === 0 && d > 0) {
      const x = ox + d * cellWidth;
      s += `<line x1="${x}" y1="${oy - 4}" x2="${x}" y2="${oy + 4}"
            stroke="#2c3e50" stroke-width="1.2"/>`;
      s += `<text x="${x}" y="${oy - 10}"
            text-anchor="middle" font-size="11" fill="#2c3e50" font-family="sans-serif">${d}</text>`;
    }
  }

  // ── Noms des tâches sur l'axe Y' (à gauche de chaque ligne) ──────────
  tasks.forEach((task, i) => {
    const y = oy + i * rowHeight + rowHeight / 2;
    s += `<line x1="${ox - 6}" y1="${y}" x2="${ox}" y2="${y}"
          stroke="#2c3e50" stroke-width="1.2"/>`;
    s += `<text x="${ox - 12}" y="${y + 4}"
          text-anchor="end" font-size="12" fill="#2c3e50" font-family="sans-serif">${task.name}</text>`;
  });

  // ── Rendu ─────────────────────────────────────────────────────────────
  const svg = document.getElementById('ganttAxis');
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', svgH);
  svg.innerHTML = s;
}