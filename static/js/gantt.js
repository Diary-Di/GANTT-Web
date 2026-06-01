const tasks = JSON.parse(document.getElementById('tasks-data').textContent);

document.addEventListener('DOMContentLoaded', () => {
  if (tasks.length > 0) {
    renderAxis();
  }
});

function renderAxis() {
  const leftMargin = 130;
  const topMargin = 30;
  const rightMargin = 20;
  const bottomMargin = 20;
  const rowHeight = 36;

  const totalDuration = tasks.reduce(
    (sum, t) => sum + parseInt(t.duration),
    0
  );

  const maxDays = Math.max(totalDuration, 10);

  // Largeur d'une cellule = 1 unité de durée
  const cellWidth = Math.max(
    20,
    Math.min(38, Math.floor(800 / maxDays))
  );

  const chartW = cellWidth * maxDays;
  const chartH = tasks.length * rowHeight;

  const svgW = leftMargin + chartW + rightMargin;
  const svgH = topMargin + chartH + bottomMargin;

  const ox = leftMargin;
  const oy = topMargin;

  const tick =
    maxDays <= 10
      ? 1
      : maxDays <= 30
      ? 2
      : maxDays <= 60
      ? 5
      : 10;

  let s = '';

  // ─────────────────────────────────────────────
  // Fond alterné des colonnes
  // ─────────────────────────────────────────────
  for (let d = 0; d < maxDays; d++) {
    const x = ox + d * cellWidth;

    s += `
      <rect
        x="${x}"
        y="${oy}"
        width="${cellWidth}"
        height="${chartH}"
        fill="${d % 2 === 0 ? '#f4f8fc' : '#ffffff'}"
      />
    `;
  }

  // ─────────────────────────────────────────────
  // Lignes verticales
  // ─────────────────────────────────────────────
  for (let d = 0; d <= maxDays; d++) {
    const x = ox + d * cellWidth;
    const main = d % tick === 0;

    s += `
      <line
        x1="${x}"
        y1="${oy}"
        x2="${x}"
        y2="${oy + chartH}"
        stroke="${main ? '#b8d0e4' : '#ddeaf3'}"
        stroke-width="${main ? '1' : '0.5'}"
      />
    `;
  }

  // ─────────────────────────────────────────────
  // Lignes horizontales
  // ─────────────────────────────────────────────
  for (let i = 0; i <= tasks.length; i++) {
    const y = oy + i * rowHeight;

    s += `
      <line
        x1="${ox}"
        y1="${y}"
        x2="${ox + chartW}"
        y2="${y}"
        stroke="#b8d0e4"
        stroke-width="1"
      />
    `;
  }

  // ─────────────────────────────────────────────
  // Bordure extérieure
  // ─────────────────────────────────────────────
  s += `
    <rect
      x="${ox}"
      y="${oy}"
      width="${chartW}"
      height="${chartH}"
      fill="none"
      stroke="#5d8aaa"
      stroke-width="1.5"
    />
  `;

  // ─────────────────────────────────────────────
  // Graduations de durée
  // ─────────────────────────────────────────────
  for (let d = 0; d <= maxDays; d++) {
    if (d % tick === 0 && d > 0) {
      const x = ox + d * cellWidth;

      s += `
        <line
          x1="${x}"
          y1="${oy - 4}"
          x2="${x}"
          y2="${oy + 4}"
          stroke="#2c3e50"
          stroke-width="1.2"
        />
      `;

      s += `
        <text
          x="${x}"
          y="${oy - 10}"
          text-anchor="middle"
          font-size="11"
          fill="#2c3e50"
          font-family="sans-serif"
        >
          ${d}
        </text>
      `;
    }
  }

  // ─────────────────────────────────────────────
  // Noms des tâches
  // ─────────────────────────────────────────────
  tasks.forEach((task, i) => {
    const y = oy + i * rowHeight + rowHeight / 2;

    s += `
      <line
        x1="${ox - 6}"
        y1="${y}"
        x2="${ox}"
        y2="${y}"
        stroke="#2c3e50"
        stroke-width="1.2"
      />
    `;

    s += `
      <text
        x="${ox - 12}"
        y="${y + 4}"
        text-anchor="end"
        font-size="12"
        fill="#2c3e50"
        font-family="sans-serif"
      >
        ${task.name}
      </text>
    `;
  });

  // ─────────────────────────────────────────────
  // Affichage SVG
  // ─────────────────────────────────────────────
  const svg = document.getElementById('ganttAxis');

  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', svgH);

  svg.innerHTML = s;
}