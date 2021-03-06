/* eslint-disable @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require */
import { promises as fs } from 'fs';
import path from 'path';
import _ from 'lodash';
import { MaybePromise } from './types';

type Parser = (input: string) => unknown;
type Solver = (input: unknown) => MaybePromise<string | number>;

const DAYS_DIR = path.join(__dirname, 'days');

const getInput = async (dir: string) => {
  const buffer = await fs.readFile(path.join(dir, 'input.txt'));

  return buffer.toString().trim();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSoleExport = (module: any) => {
  const keys = Object.keys(module);

  if (keys.length === 0) {
    throw new Error('Expected a single export, found none');
  }

  if (keys.length > 1) {
    throw new Error(`Expected a single export, found: ${keys.join(',')}`);
  }

  return module[keys[0]];
};

const getParser = (dir: string): ((input: string) => unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let module: any;

  try {
    module = require(path.join(dir, 'parse.ts'));
  } catch (e) {
    return (input) => input;
  }

  return getSoleExport(module);
};

const isDirectory = async (source: string) => {
  const stats = await fs.lstat(source);

  return stats.isDirectory();
};

const getDirectories = async (source: string) => {
  const dirs = await fs.readdir(source);

  return dirs
    .map((name) => path.join(source, name))
    .filter(isDirectory)
    .map((dir) => path.basename(dir));
};

const getLatestDay = async () => {
  const dirs = await getDirectories(DAYS_DIR);

  if (!dirs.length) {
    throw new Error('No directories found');
  }

  const dir = _.maxBy(dirs, _.unary(parseInt));

  return dir;
};

const PART_FILENAMES = ['b.ts', 'a.ts'];

const getLatestPart = async (dayDir: string) => {
  const files = new Set(await fs.readdir(dayDir));
  const filename = PART_FILENAMES.find((part) => files.has(part));

  return filename && path.basename(filename, '.ts');
};

const getParsedInput = async (dayDir: string) => {
  const inputString = await getInput(dayDir);
  const parse = getParser(dayDir) as Parser;
  const input = parse(inputString);

  return input;
};

export const getLatestChallenge = async (dayArg?: string, partArg?: string) => {
  const day = dayArg || (await getLatestDay());

  if (!day) {
    throw new Error('Missing day');
  }

  const dayDir = path.join(DAYS_DIR, day);
  const part = partArg || (await getLatestPart(dayDir));

  if (!part) {
    throw new Error('Missing part');
  }

  return [day, part] as [string, string];
};

export const getSolver = async (day: string | number, part: string) => {
  const dayDir = path.join(DAYS_DIR, day.toString());
  const partPath = path.join(dayDir, part);
  const solve = getSoleExport(require(partPath)) as Solver;
  const input = await getParsedInput(dayDir);

  return () => solve(input);
};
