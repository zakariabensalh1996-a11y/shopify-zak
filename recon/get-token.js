const fs = require('fs');
const os = require('os');
const path = require('path');

const configPath = path.join(os.homedir(), 'AppData', 'Roaming', 'shopify-cli-kit-nodejs', 'Config', 'config.json');
const d = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const s = JSON.parse(d.sessionStore);
const firstStore = Object.values(s)[0];
const firstAccount = Object.values(firstStore)[0];
const token = firstAccount.identity.accessToken;
const expires = firstAccount.identity.expiresAt;
console.log('EXPIRES:', expires);
console.log('TOKEN:', token);
