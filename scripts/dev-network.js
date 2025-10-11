#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
const port = process.env.PORT || 3000;

console.log('🚀 Starting Next.js development server...');
console.log(`📱 Access from mobile devices: http://${localIP}:${port}`);
console.log('💡 Make sure your phone and computer are on the same WiFi network');
console.log('');

// Start Next.js with host 0.0.0.0 to allow external connections
const command = `next dev -H 0.0.0.0 -p ${port}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`⚠️ Warning: ${stderr}`);
  }
  console.log(stdout);
});

