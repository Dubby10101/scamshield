// Custom build script for production
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting optimized production build...');

// 1. Run the standard build
try {
  console.log('📦 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// 2. Inject critical CSS into the HTML file
try {
  console.log('💉 Injecting critical CSS...');
  
  const indexHtmlPath = path.join(__dirname, 'dist', 'index.html');
  let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Create critical CSS
  const criticalCss = `
    /* Critical styles for immediate rendering */
    html, body {
      background-color: #121212 !important;
      color: #e0e0e0 !important;
    }
    
    body {
      background-image: linear-gradient(rgba(76, 175, 80, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(76, 175, 80, 0.03) 1px, transparent 1px) !important;
      background-size: 20px 20px !important;
    }
    
    .modal-content {
      background-color: #121212 !important;
      color: #e0e0e0 !important;
    }
    
    .modal-header, .modal-footer {
      border-color: rgba(76, 175, 80, 0.2) !important;
      background-color: rgba(0, 0, 0, 0.2) !important;
    }
    
    .modal-body {
      background-color: #121212 !important;
    }
    
    .background-3d {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      z-index: -1 !important;
    }
  `;
  
  // Inject critical CSS
  indexHtml = indexHtml.replace('</head>', `<style id="critical-css">${criticalCss}</style></head>`);
  
  // Add preload for CSS files
  const preloadLinks = `
    <link rel="preload" href="/assets/index.css" as="style">
  `;
  
  indexHtml = indexHtml.replace('</head>', `${preloadLinks}</head>`);
  
  // Write back to index.html
  fs.writeFileSync(indexHtmlPath, indexHtml);
  console.log('✅ Critical CSS injected successfully');
} catch (error) {
  console.error('❌ Failed to inject critical CSS:', error);
}

// 3. Copy the production-styles.js to the dist folder
try {
  console.log('📋 Copying production-styles.js...');
  
  const sourceFile = path.join(__dirname, 'public', 'production-styles.js');
  const targetFile = path.join(__dirname, 'dist', 'production-styles.js');
  
  fs.copyFileSync(sourceFile, targetFile);
  console.log('✅ production-styles.js copied successfully');
} catch (error) {
  console.error('❌ Failed to copy production-styles.js:', error);
}

console.log('🎉 Production build optimized successfully!');
