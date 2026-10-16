import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { verifyUbotEvidence } from './verify-ubot-rea.mjs';

// This is deliberately a hard build prerequisite. Missing, changed, or failed
// analysis must never be silently replaced with a guessed reference UI.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function requireFact(condition, message) { if (!condition) throw new Error(message); }
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/rea/analysis.json'), 'utf8'));
  requireFact(manifest.target === 'https://app.u-topia.com/dashboard', 'Unexpected REA analysis target');
  requireFact(sha256(fs.readFileSync(path.join(root, manifest.source_path))) === manifest.source_sha256, 'Shipped dashboard source differs from analyzed bytes');
  const bundles = {};
  for (const [name, digest] of Object.entries(manifest.archives)) {
    const bytes = fs.readFileSync(path.join(root, 'docs/rea', name));
    requireFact(sha256(bytes) === digest, `REA evidence archive changed: ${name}`);
    bundles[name] = JSON.parse(zlib.gunzipSync(bytes).toString('utf8'));
  }
  const analysis = bundles['static-evidence.json.gz'].records.find(record => record.evidence_id === manifest.analysis_evidence_id);
  requireFact(analysis?.operation === 'analyze_javascript_application', 'Successful REA static analysis record missing');
  const statistics = analysis.normalized_result.statistics;
  requireFact(statistics.parsed_javascript_files === 1 && statistics.parse_failures === 0 && statistics.text_bytes_read > 0, 'REA did not successfully parse the selected shipped dashboard');
  requireFact(analysis.normalized_result.integrity_contradictions.length === 0, 'REA reported artifact integrity contradictions');
  const runtime = bundles['runtime-evidence.json.gz'].records;
  requireFact(runtime.some(record => record.operation === 'inspect_web_page' && record.normalized_result?.target?.url === manifest.target), 'Authenticated dashboard REA inspection missing');
  requireFact(runtime.some(record => record.operation === 'capture_web_screenshot' && record.normalized_result?.target?.url === manifest.target && record.normalized_result.completeness.status === 'complete_within_window'), 'Complete dashboard REA screenshot missing');
  requireFact(runtime.some(record => record.operation === 'capture_browser_scenario' && record.parameters?.start_url?.url === manifest.target && record.normalized_result?.steps?.some(step => step.step_id === 'open-receive' && step.status === 'completed')), 'Successful REA Receive scenario missing');
  verifyUbotEvidence(root);
  console.log(`REA prerequisite passed: ${statistics.parsed_javascript_files} shipped dashboard source parsed; ${statistics.parse_failures} parse failures; authenticated runtime and screenshot evidence verified.`);
} catch (error) {
  console.error(`HARD FAIL — REA analysis prerequisite: ${error.message}`);
  process.exit(1);
}
