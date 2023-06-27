# electron build script for win
# tested on wsl
npm init -y
npm install electron --save-dev
npm install --platform=win32
npm install --save-dev @electron-forge/cli
npx electron-forge import
npx electron-builder --win --x64