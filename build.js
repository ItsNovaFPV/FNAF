const fs = require('fs');
const path = require('path');

// Define the dist directory
const distDir = path.join(__dirname, 'dist');

// Remove the dist directory if it exists
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Create the dist directory
fs.mkdirSync(distDir);

// Copy index.js to the dist directory
fs.copyFileSync(path.join(__dirname, 'index.js'), path.join(distDir, 'index.js'));

// Create package.json in the dist directory
const packageJson = {
  name: "fnaf",
  version: "1.0.0",
  main: "index.js",
  scripts: {
    start: "node index.js"
  },
  dependencies: {
    express: "^4.17.1",
    "socket.io": "^4.0.0",
    "aws-serverless-express": "^3.4.0"
  }
};

fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(packageJson, null, 2));

console.log('Build completed.');