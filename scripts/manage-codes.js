// ORF-Butler Code Manager (CLI)
// npm run codes generate -- --count 5
// npm run codes list
// npm run codes revoke <CODE>
// npm run codes reset <CODE>

import fs from 'fs';
import { createInterface } from 'readline';

const CODES_PATH = 'data/codes.json';
const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateCode(length = 8) {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

function readStore() {
    try {
        const data = JSON.parse(fs.readFileSync(CODES_PATH, 'utf-8'));
        if (!data.nextAnonId) data.nextAnonId = 1;
        return data;
    } catch {
        return { codes: {}, nextAnonId: 1 };
    }
}

function writeStore(store) {
    fs.writeFileSync(CODES_PATH, JSON.stringify(store, null, 2) + '\n');
}

async function cmdGenerate(args) {
    const count = parseInt(args[0]) || 1;
    const maxUses = parseInt(args[1]) || 10;
    const store = readStore();
    if (!store.nextAnonId) store.nextAnonId = 1;
    const generated = [];
    for (let i = 0; i < count; i++) {
        let code = generateCode();
        while (store.codes[code]) code = generateCode();
        const anonId = 'anon' + String(store.nextAnonId).padStart(3, '0');
        store.nextAnonId += 1;
        store.codes[code] = {
            anonId,
            maxUses,
            uses: 0,
            active: true,
            createdAt: new Date().toISOString()
        };
        generated.push(code);
    }
    writeStore(store);
    console.log(`\n  ${'='.repeat(40)}`);
    console.log(`  ${generated.length} Codes generiert (max. ${maxUses} Nutzungen):`);
    console.log(`  ${'='.repeat(40)}`);
    generated.forEach(c => console.log(`  ${c}`));
    console.log(`  ${'='.repeat(40)}\n`);
}

async function cmdList() {
    const store = readStore();
    const entries = Object.entries(store.codes);
    if (entries.length === 0) {
        console.log('\n  Keine Codes vorhanden.\n');
        return;
    }
    console.log(`\n  ${'='.repeat(95)}`);
    console.log(`  ${entries.length} Codes gefunden:`);
    console.log(`  ${'='.repeat(95)}`);
    console.log(`  CODE       | NUTZER    | GENUTZT | AKTIV | ERSTELLT`);
    console.log(`  ${'-'.repeat(95)}`);
    entries.forEach(([code, data]) => {
        const anon = (data.anonId || '-').padEnd(9);
        const used = `${data.uses}/${data.maxUses}`.padStart(7);
        const active = data.active ? 'ja  ' : 'nein';
        const created = new Date(data.createdAt).toLocaleDateString('de-DE');
        console.log(`  ${code.padEnd(10)} | ${anon} | ${used.padEnd(7)} | ${active} | ${created}`);
    });
    console.log(`  ${'='.repeat(95)}`);
    console.log(`\n  ${'Kopierbereit:'}`);
    entries.forEach(([code, data]) => {
        if (data.anonId) console.log(`  ${code} - ${data.anonId}`);
    });
    console.log();
}

async function cmdRevoke(code) {
    if (!code) {
        console.log('\n  Fehler: Gib einen Code an.\n');
        return;
    }
    const c = code.toUpperCase().trim();
    const store = readStore();
    if (!store.codes[c]) {
        console.log(`\n  Code ${c} nicht gefunden.\n`);
        return;
    }
    store.codes[c].active = false;
    writeStore(store);
    console.log(`\n  Code ${c} wurde deaktiviert.\n`);
}

async function cmdReset(code) {
    if (!code) {
        console.log('\n  Fehler: Gib einen Code an.\n');
        return;
    }
    const c = code.toUpperCase().trim();
    const store = readStore();
    if (!store.codes[c]) {
        console.log(`\n  Code ${c} nicht gefunden.\n`);
        return;
    }
    store.codes[c].uses = 0;
    store.codes[c].active = true;
    writeStore(store);
    console.log(`\n  Code ${c} wurde zurückgesetzt (0/${store.codes[c].maxUses}).\n`);
}

async function main() {
    const args = process.argv.slice(2);
    const cmd = args[0] || 'help';

    switch (cmd) {
        case 'generate':
        case 'gen':
        case 'g':
            await cmdGenerate(args.slice(1));
            break;
        case 'list':
        case 'ls':
        case 'l':
            await cmdList();
            break;
        case 'revoke':
        case 'rev':
            await cmdRevoke(args[1]);
            break;
        case 'reset':
            await cmdReset(args[1]);
            break;
        default:
            console.log(`
  ORF-Butler Code Manager

  Verwendung:
    npm run codes generate [anzahl] [maxNutzungen]
    npm run codes list
    npm run codes revoke <CODE>
    npm run codes reset <CODE>

  Beispiele:
    npm run codes generate 5
    npm run codes generate 10 5
    npm run codes list
    npm run codes revoke ABC12345
    npm run codes reset ABC12345
`);
    }
    rl.close();
}

main().catch(e => { console.error(e); rl.close(); process.exit(1); });
