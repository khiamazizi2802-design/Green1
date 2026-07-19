const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/text-\[8px\](?!\s+(md|lg|sm|xl):)/g, 'text-[8px] md:text-[10px] lg:text-xs');
    content = content.replace(/text-\[9px\](?!\s+(md|lg|sm|xl):)/g, 'text-[9px] md:text-[11px] lg:text-xs');
    content = content.replace(/text-\[10px\](?!\s+(md|lg|sm|xl):)/g, 'text-[10px] md:text-xs lg:text-sm');
    content = content.replace(/text-\[11px\](?!\s+(md|lg|sm|xl):)/g, 'text-[11px] md:text-sm lg:text-base');
    
    // For text-xs we have to be careful not to match md:text-xs etc.
    content = content.replace(/(?<!(md|lg|sm|xl|2xl|hover|focus|active):)text-xs(?!\s+(md|lg|sm|xl):)/g, 'text-xs md:text-sm lg:text-base');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
    }
});

console.log(`Updated typography in ${changedFiles} files.`);
