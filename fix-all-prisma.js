const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory && !dirPath.includes('node_modules') && !dirPath.includes('.next') && !dirPath.includes('.git')) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.js') || dirPath.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

console.log('🔍 กำลังค้นหาไฟล์ที่สร้าง PrismaClient แบบผิดวิธี...');
let count = 0;

walkDir('.', function(filePath) {
  if (filePath.includes('fix-all-prisma.js') || filePath.includes('lib/prisma')) return;

  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('new PrismaClient()')) {
    console.log(`🛠 กำลังแก้ไขไฟล์: ${filePath}`);
    
    const relativePath = path.relative(path.dirname(filePath), 'lib/prisma').replace(/\\/g, '/');
    const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;

    let updatedContent = content.replace(
      /(const|import).*PrismaClient.*(\r\n|\n)/g, 
      ''
    );
    updatedContent = updatedContent.replace(
      /const\s+prisma\s*=\s*new\s+PrismaClient\s*\([^)]*\);?/g,
      `const prisma = require('${importPath}');`
    );

    fs.writeFileSync(filePath, updatedContent, 'utf8');
    count++;
  }
});

console.log(`\n🎉 เสร็จสิ้น! จัดการแก้ไขไฟล์ไปทั้งหมด ${count} ไฟล์เรียบร้อยแล้ว!`);