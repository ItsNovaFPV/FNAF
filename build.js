const fs = require('fs');
const path = require('path');

// Define the src and dist directories
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Log the current working directory
console.log('Current working directory:', __dirname);

// Remove the dist directory if it exists
if (fs.existsSync(distDir)) {
  console.log('Removing existing dist directory...');
  fs.rmSync(distDir, { recursive: true, force: true });
  console.log('Removed existing dist directory.');
}

// Create the dist directory
console.log('Creating dist directory...');
fs.mkdirSync(distDir);
console.log('Created dist directory.');

// Function to copy a file or directory
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy all files from src to dist
console.log('Copying files from src to dist...');
copyRecursiveSync(srcDir, distDir);
console.log('Copied files from src to dist.');

// Create package.json in the dist directory
console.log('Creating package.json in dist directory...');
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
console.log('Created package.json in dist directory.');

// Log the contents of the dist directory
console.log('Contents of dist directory:', fs.readdirSync(distDir));

console.log('Build completed.');