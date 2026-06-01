const tasks = JSON.parse(document.getElementById('tasks-data').textContent);
const taskColors = ['#3498db','#e74c3c','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22','#34495e'];

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
  // Dans renderAxis(), remplace la partie des barres par :

tasks.forEach((task, i) => {
    const y = oy + i * rowHeight + 8;
    const height = rowHeight - 16;

    const startDay = parseInt(task.start) || 0;
    const duration = parseInt(task.duration);

    const x = ox + startDay * cellWidth;
    const width = duration * cellWidth;

    const color = taskColors[i % taskColors.length];

    s += `
      <rect
        x="${x.toFixed(1)}"
        y="${y}"
        width="${width.toFixed(1)}"
        height="${height}"
        rx="4"
        fill="${color}"
        stroke="#2c3e50"
        stroke-width="2"
      />
    `;

    // Texte sur la barre
    const textX = x + width / 2;
    if (width > 70) {
      s += `
        <text
          x="${textX.toFixed(1)}"
          y="${y + height/2 + 5}"
          text-anchor="middle"
          font-size="12.5"
          fill="white"
          font-weight="600"
        >${task.name}</text>
      `;
    }
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