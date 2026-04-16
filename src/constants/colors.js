export const COLORS = [
  { name: 'red',    hex: '#e74c3c', text: '#ffffff', shape: '▲' },
  { name: 'blue',   hex: '#3498db', text: '#ffffff', shape: '■' },
  { name: 'green',  hex: '#2ecc71', text: '#1a1a2e', shape: '●' },
  { name: 'yellow', hex: '#f1c40f', text: '#1a1a2e', shape: '◆' },
  { name: 'purple', hex: '#9b59b6', text: '#ffffff', shape: '★' },
];

export function randomColor(excludeName = null) {
  const pool = excludeName
    ? COLORS.filter(c => c.name !== excludeName)
    : COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}
