const fs = require('fs');
const path = require('path');
const exts = ['.ts','.tsx','.js','.jsx','.json','.md','.sql','.txt','.html','.css','.mjs','.cjs','.env','.env.local'];
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.next', 'tools'].includes(entry.name)) return [];
      return walk(full);
    }
    return exts.includes(path.extname(entry.name).toLowerCase()) ? [full] : [];
  });
}

function isValidUtf8(buffer) {
  let i = 0;
  while (i < buffer.length) {
    const byte = buffer[i];
    if (byte <= 0x7f) {
      i += 1;
      continue;
    }
    if (byte >= 0xc2 && byte <= 0xdf) {
      if (i + 1 >= buffer.length) return false;
      if ((buffer[i + 1] & 0xc0) !== 0x80) return false;
      i += 2;
      continue;
    }
    if (byte >= 0xe0 && byte <= 0xef) {
      if (i + 2 >= buffer.length) return false;
      if ((buffer[i + 1] & 0xc0) !== 0x80 || (buffer[i + 2] & 0xc0) !== 0x80) return false;
      if (byte === 0xe0 && buffer[i + 1] < 0xa0) return false;
      if (byte === 0xed && buffer[i + 1] >= 0xa0) return false;
      i += 3;
      continue;
    }
    if (byte >= 0xf0 && byte <= 0xf4) {
      if (i + 3 >= buffer.length) return false;
      if ((buffer[i + 1] & 0xc0) !== 0x80 || (buffer[i + 2] & 0xc0) !== 0x80 || (buffer[i + 3] & 0xc0) !== 0x80) return false;
      if (byte === 0xf0 && buffer[i + 1] < 0x90) return false;
      if (byte === 0xf4 && buffer[i + 1] >= 0x90) return false;
      i += 4;
      continue;
    }
    return false;
  }
  return true;
}

const root = process.cwd();
const files = walk(root);
const invalid = files.filter((file) => {
  const buffer = fs.readFileSync(file);
  return !isValidUtf8(buffer);
});
console.log('checked', files.length, 'files');
if (invalid.length) {
  console.log('invalid utf8 files:');
  invalid.forEach((file) => console.log(file));
  process.exit(1);
}
console.log('all valid utf8');
