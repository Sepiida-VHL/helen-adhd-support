#!/usr/bin/env node
/**
 * Firestore export transformer -> per-table JSON array files for Supabase REST insert.
 * Usage:
 *   node migrate-transformer.cjs --input ./tmp/firestore-export --namespace "(default)" --tableMap ./scripts/table-map.json --outDir ./tmp/firestore-export/out
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    out[args[i].replace(/^--/, '')] = args[i + 1];
  }
  return out;
}

function loadTableMap(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function decodeFirestoreValue(field) {
  // Map Firestore value object to JS
  const key = Object.keys(field)[0];
  const val = field[key];
  switch (key) {
    case 'stringValue': return val;
    case 'integerValue': return parseInt(val, 10);
    case 'doubleValue': return Number(val);
    case 'booleanValue': return Boolean(val);
    case 'nullValue': return null;
    case 'timestampValue': return new Date(val).toISOString();
    case 'arrayValue': return (val.values || []).map(decodeFirestoreValue);
    case 'mapValue':
      const obj = {};
      const fields = val.fields || {};
      for (const [k, v] of Object.entries(fields)) {
        obj[k] = decodeFirestoreValue(v);
      }
      return obj;
    case 'referenceValue': return val; // keep as string
    case 'geoPointValue': return { lat: val.latitude, lng: val.longitude };
    default:
      return val;
  }
}

function transformEntity(entity, mapping) {
  // entity.document.name like: projects/{project}/databases/(default)/documents/{collection}/{docId}
  const name = entity.document.name;
  const parts = name.split('/');
  const docId = parts[parts.length - 1];
  const fields = entity.document.fields || {};
  const out = {};

  // Apply field_map renames
  for (const [k, v] of Object.entries(fields)) {
    const supaKey = (mapping.field_map && mapping.field_map[k]) || k;
    out[supaKey] = decodeFirestoreValue(v);
  }

  // Attach id field if requested
  if (mapping.id_field) {
    out[mapping.id_field] = out[mapping.id_field] ?? docId;
  }

  return out;
}

function main() {
  const { input, namespace, tableMap, outDir } = parseArgs();
  if (!input || !tableMap || !outDir) {
    console.error('Missing required args.');
    process.exit(1);
  }

  const map = loadTableMap(tableMap);
  ensureDir(outDir);

  // Firestore export format: a folder with a metadata file and one or more .export_metadata files plus per-collection .overall_export_metadata and shard files.
  // We expect per-collection export shards under input/**/all_namespaces/kind_{collection}.export_metadata and related .overall_export_metadata
  // But gcloud Firestore export for native mode uses Google Datastore export format with LevelDB-like sharded files; parsing them is non-trivial.
  // Simpler approach: expect a previously produced JSON dump per collection (entities.json). If not present, instruct user.

  // For practical purposes, look for input/**/{collection}.json (array of entities in Firestore REST format) and transform them.
  for (const mapping of map) {
    const candidates = [
      path.join(input, `${mapping.collection}.json`),
      path.join(input, 'json', `${mapping.collection}.json`)
    ];
    const source = candidates.find(p => fs.existsSync(p));
    if (!source) {
      console.warn(`Skipping ${mapping.collection}: no JSON dump found at ${candidates.join(' or ')}`);
      continue;
    }
    const raw = JSON.parse(fs.readFileSync(source, 'utf8'));
    const rows = raw.map(e => transformEntity(e, mapping));
    const outPath = path.join(outDir, `${mapping.supabase_table}.json`);
    fs.writeFileSync(outPath, JSON.stringify(rows));
    console.log(`Wrote ${rows.length} rows to ${outPath}`);
  }
}

main();

