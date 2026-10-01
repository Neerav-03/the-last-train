// Read-only static scanning of src/ for facts that live in scene components
// (not exported data), e.g. flags set by inline choices or clues awarded by
// literal store.awardClue('...') calls. Used so data-integrity tests build
// their whitelists from source instead of guessing.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SRC_DIR = fileURLToPath(new URL('../../src', import.meta.url));

export interface SourceFile {
  /** Path relative to src/, forward slashes. */
  path: string;
  text: string;
}

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
}

export function readSourceFiles(subdir = ''): SourceFile[] {
  const files: string[] = [];
  walk(join(SRC_DIR, subdir), files);
  return files.map((full) => ({
    path: relative(SRC_DIR, full).replace(/\\/g, '/'),
    text: readFileSync(full, 'utf8'),
  }));
}

export function readSource(pathFromSrc: string): string {
  return readFileSync(join(SRC_DIR, pathFromSrc), 'utf8');
}

/** Strip // line comments and block comments so commented-out code is not counted. */
export function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

const STRING_LITERAL = /['"]([A-Za-z0-9_.]+)['"]/g;

function literalsIn(listBody: string): string[] {
  return [...listBody.matchAll(STRING_LITERAL)].map((m) => m[1]);
}

export interface Occurrence {
  id: string;
  file: string;
}

/** Every string literal inside `<key>: [ ... ]` array literals, e.g. setFlags: ['a', 'b']. */
export function arrayLiteralValues(files: SourceFile[], key: string): Occurrence[] {
  const re = new RegExp(`\\b${key}\\s*:\\s*\\[([^\\]]*)\\]`, 'g');
  const out: Occurrence[] = [];
  for (const f of files) {
    for (const m of stripComments(f.text).matchAll(re)) {
      for (const id of literalsIn(m[1])) out.push({ id, file: f.path });
    }
  }
  return out;
}

/** First string-literal argument of every `<fn>('literal'...)` call, e.g. setFlag('x', true). */
export function callLiteralArgs(files: SourceFile[], fn: string): Occurrence[] {
  const re = new RegExp(`\\b${fn}\\(\\s*['"]([A-Za-z0-9_.]+)['"]`, 'g');
  const out: Occurrence[] = [];
  for (const f of files) {
    for (const m of stripComments(f.text).matchAll(re)) out.push({ id: m[1], file: f.path });
  }
  return out;
}

/** Literal flag reads in scenes: flags['x'], flags["x"], flags.x (not flags.x(...) method calls). */
export function flagReads(files: SourceFile[]): Occurrence[] {
  const out: Occurrence[] = [];
  for (const f of files) {
    const text = stripComments(f.text);
    for (const m of text.matchAll(/\bflags\[\s*['"]([A-Za-z0-9_.]+)['"]\s*\]/g)) out.push({ id: m[1], file: f.path });
    for (const m of text.matchAll(/\bflags\.([A-Za-z_][A-Za-z0-9_]*)\b(?!\s*\()/g)) out.push({ id: m[1], file: f.path });
  }
  return out;
}

export function ids(occ: Occurrence[]): Set<string> {
  return new Set(occ.map((o) => o.id));
}
