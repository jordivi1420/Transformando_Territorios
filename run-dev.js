const { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const nodeCmd = process.execPath;

console.log('\x1b[36m%s\x1b[0m', '🚀 Iniciando Transformando Territorios en modo desarrollo...');

// Backend (Express en puerto 4000)
const backend = spawn(nodeCmd, ['--watch', 'backend/server.js'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { ...process.env, PORT: '4000' },
});

// Frontend (Vite en puerto 3000)
const frontend = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'frontend'),
  env: process.env,
});

function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', 'Cerrando servicios...');
  try { backend.kill(); } catch (_) {}
  try { frontend.kill(); } catch (_) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
