#!/usr/bin/env node
/**
 * Rebuild static/js/data_aug_json.js from samples/data_aug_pairs/*.json
 * so the materials page works with file:// (fetch cannot load local JSON).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pairsDir = path.join(root, 'samples', 'data_aug_pairs');
const outFile = path.join(root, 'static', 'js', 'data_aug_json.js');

const files = fs.readdirSync(pairsDir).filter((f) => f.endsWith('.json')).sort();
const obj = {};
for (const f of files) {
  const key = f.replace(/\.json$/, '');
  obj[key] = JSON.parse(fs.readFileSync(path.join(pairsDir, f), 'utf8'));
}

const header =
  '/* Built from samples/data_aug_pairs/*.json — run: node scripts/build_data_aug_json.js */\n';
const body = 'window.DATA_AUG_JSON = ' + JSON.stringify(obj, null, 2) + ';\n';
fs.writeFileSync(outFile, header + body);
console.log('Wrote', outFile, '(' + files.length + ' files)');
