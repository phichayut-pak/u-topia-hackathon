import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function requireFact(condition, message) { if (!condition) throw new Error(`Ubot: ${message}`); }

export function verifyUbotEvidence(root) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/rea/ubot/analysis.json'), 'utf8'));
  requireFact(manifest.target === 'https://u.bot/', 'unexpected analysis target');
  requireFact(manifest.archive === 'docs/rea/ubot/evidence.json.gz', 'unexpected evidence archive path');
  requireFact(manifest.screenshot_path === 'docs/rea/ubot/reference.png', 'unexpected screenshot path');
  const archive = fs.readFileSync(path.join(root, manifest.archive));
  requireFact(sha256(archive) === manifest.archive_sha256, 'evidence archive digest mismatch');
  const bundle = JSON.parse(zlib.gunzipSync(archive).toString('utf8'));
  requireFact(Array.isArray(bundle.records), 'evidence records missing');
  const find = (id, operation) => bundle.records.find(record => record.evidence_id === id && record.operation === operation);
  const analysis = find(manifest.analysis_evidence_id, 'analyze_web_bundle');
  requireFact(analysis?.normalized_result?.capture?.target_url === manifest.target, 'successful analysis of u.bot missing');
  const { capture, completeness } = analysis.normalized_result;
  requireFact(completeness?.status === 'complete' && completeness.parse_failures === 0 && completeness.parsed_scripts > 0 && completeness.visited_ast_nodes > 0, 'bundle analysis incomplete or failed');
  requireFact(capture.scripts_analyzed === completeness.parsed_scripts && capture.scripts_observed === capture.scripts_analyzed, 'captured scripts were not all analyzed');
  requireFact(capture.source_artifacts?.length === capture.scripts_analyzed && capture.source_artifacts.every(a => a.bytes > 0 && /^[a-f0-9]{64}$/.test(a.sha256)), 'analyzed source identities missing');
  const page = find(manifest.page_evidence_id, 'inspect_web_page');
  requireFact(page?.normalized_result?.target?.url === manifest.target, 'public-page inspection missing');
  const scripts = page.normalized_result.scripts?.items?.filter(script => script.source?.included && script.source.artifact?.text) ?? [];
  requireFact(scripts.length > 0, 'captured source text missing');
  for (const script of scripts) {
    const artifact = script.source.artifact;
    const bytes = Buffer.from(artifact.text, 'utf8');
    requireFact(sha256(bytes) === artifact.sha256 && bytes.length === artifact.bytes, 'captured source integrity mismatch');
    requireFact(capture.source_artifacts.some(source => source.sha256 === artifact.sha256 && source.bytes === artifact.bytes), 'captured source not bound to successful analysis');
  }
  requireFact(scripts.some(s => s.source.artifact.text.includes('/api/chat') && s.source.artifact.text.includes('/api/transcribe')), 'relevant Ubot application source missing');
  const screenshot = find(manifest.screenshot_evidence_id, 'capture_web_screenshot');
  requireFact(screenshot?.normalized_result?.target?.url === manifest.target && screenshot.normalized_result.completeness?.status === 'complete_within_window', 'complete public-page screenshot missing');
  const artifact = screenshot.normalized_result.artifact;
  const png = Buffer.from(artifact.data_base64, 'base64');
  requireFact(png.length === artifact.bytes && sha256(png) === artifact.sha256, 'archived screenshot integrity mismatch');
  requireFact(artifact.sha256 === manifest.screenshot_sha256 && sha256(fs.readFileSync(path.join(root, manifest.screenshot_path))) === artifact.sha256, 'reference screenshot differs from captured bytes');
  console.log(`Ubot REA prerequisite passed: ${completeness.parsed_scripts} captured scripts parsed; 0 parse failures; ${scripts.length} source digests and reference screenshot verified.`);
}
