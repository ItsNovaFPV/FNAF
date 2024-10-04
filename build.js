const fs = require('fs');
const path = require('path');

// Define the dist directory
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

// Copy index.html to the dist directory
console.log('Copying index.html to dist directory...');
fs.copyFileSync(path.join(__dirname, 'src', 'index.html'), path.join(distDir, 'index.html'));
console.log('Copied index.html to dist directory.');

// Copy other static files (e.g., CSS, JS) to the dist directory
console.log('Copying static files to dist directory...');
fs.copyFileSync(path.join(__dirname, 'src', 'style.css'), path.join(distDir, 'style.css'));
fs.copyFileSync(path.join(__dirname, 'src', 'app.js'), path.join(distDir, 'app.js'));
console.log('Copied static files to dist directory.');

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