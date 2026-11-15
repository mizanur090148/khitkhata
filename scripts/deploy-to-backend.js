import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const frontendDist = path.join(rootDir, 'frontend', 'dist');
const backendPublic = path.join(rootDir, 'backend', 'public');
const cpanelReadyDir = path.join(rootDir, 'cpanel_ready');

console.log('🚀 Preparing KnitKhata for cPanel Deployment...\n');

// 1. Verify frontend/dist exists
if (!fs.existsSync(frontendDist) || !fs.existsSync(path.join(frontendDist, 'index.html'))) {
  console.error('❌ frontend/dist not found. Please run "npm run build" in frontend directory first.');
  process.exit(1);
}

// 2. Copy frontend/dist to backend/public
console.log('📦 1/3: Syncing React production build to backend/public...');
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(frontendDist, backendPublic);
console.log('   ✅ Copied index.html and assets into backend/public/');

// 3. Prepare cpanel_ready package
console.log('\n📦 2/3: Generating cPanel deployment bundles in cpanel_ready/...');
if (fs.existsSync(cpanelReadyDir)) {
  fs.rmSync(cpanelReadyDir, { recursive: true, force: true });
}
fs.mkdirSync(cpanelReadyDir, { recursive: true });

// Copy SQL database dump to cpanel_ready
const sqlSource = path.join(rootDir, 'backend', 'database', 'silposetu_cpanel_database.sql');
if (fs.existsSync(sqlSource)) {
  fs.copyFileSync(sqlSource, path.join(cpanelReadyDir, 'silposetu_database_import_phpmyadmin.sql'));
  console.log('   ✅ Included silposetu_database_import_phpmyadmin.sql (for 1-click phpMyAdmin import)');
}

// Create .env.cpanel template
const envCpanelTemplate = `# ==============================================================
# KnitKhata (Silposetu) - cPanel Production Environment Config
# Rename this file to '.env' inside your backend root folder on cPanel
# ==============================================================

APP_NAME="KnitKhata"
APP_ENV=production
APP_KEY=base64:kxCntj5AYK80WxC/gQVly1bpYk8v5wfh77ScMevPnlU=
APP_DEBUG=false
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

APP_LOCALE=bn
APP_FALLBACK_LOCALE=en

LOG_CHANNEL=stack
LOG_LEVEL=error

# Database Configuration (Enter credentials created in cPanel MySQL Database Wizard)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=yourcpaneluser_silposetu
DB_USERNAME=yourcpaneluser_dbuser
DB_PASSWORD=YourDatabasePasswordHere

SESSION_DRIVER=file
SESSION_LIFETIME=120
QUEUE_CONNECTION=sync
CACHE_STORE=file
FILESYSTEM_DISK=local

SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
`;
fs.writeFileSync(path.join(cpanelReadyDir, '.env.cpanel.example'), envCpanelTemplate, 'utf8');
console.log('   ✅ Generated .env.cpanel.example');

console.log('\n📦 3/3: Creating ZIP archives for direct cPanel File Manager upload...');
try {
  // Create zip of backend using PowerShell Compress-Archive
  const zipPath = path.join(cpanelReadyDir, 'khitkhata_cpanel_upload.zip');
  console.log('   Creating khitkhata_cpanel_upload.zip (this may take 20-30 seconds)...');
  
  // Use PowerShell with SilentlyContinue to suppress progress bar errors
  const psCmd = `powershell -NoProfile -Command "$ProgressPreference = 'SilentlyContinue'; Compress-Archive -Path '${path.join(rootDir, 'backend', '*')}' -DestinationPath '${zipPath}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });
  console.log('   ✅ Successfully created ' + zipPath);
} catch (e) {
  console.warn('   ⚠️ Could not automatically generate zip archive:', e.message);
}

console.log('\n🎉 ALL DONE! Your project is 100% ready for cPanel upload.');
