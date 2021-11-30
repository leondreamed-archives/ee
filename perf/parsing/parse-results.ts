import fs from 'fs';
import path from 'path';

import { rootPath } from '../../shared/constants/paths';
import type { OverallResults } from '../types';

const results = JSON.parse(
	fs.readFileSync(path.join(rootPath, 'results.json')).toString()
) as OverallResults;

type ResultRow = readonly [
	number, // num functions
	number, // immutable state compilation time (C++)
	number, // immutable state compilation time (Rust)
	number, // mutable state compilation time (C++)
	number, // mutable state compilation time (Rust)
	number, // paramless compilation time (C++)
	number, // paramless compilation time (Rust)
	number, // immutable state execution time (C++)
	number, // immutable state execution time (Rust)
	number, // mutable state execution time (C++)
	number // mutable state execution time (Rust)
];
const resultRows: ResultRow[] = [];

const callTreeFiles = fs.readdirSync(
	path.join(rootPath, 'generated/call-trees')
);
const possibleNumFunctions = callTreeFiles.map((callTreeFile) =>
	Number(path.parse(callTreeFile).name)
);

function getCompileTime(filename: string) {
	const isRust = filename.endsWith('.rs');
	if (filename.includes('mut')) {
		if (isRust) {
			return Number(results.compilationTime.mutableState.rust[filename][0]);
		} else {
			return Number(results.compilationTime.mutableState.cpp[filename][0]);
		}
	} else if (filename.includes('paramless')) {
		if (isRust) {
			return Number(results.compilationTime.paramless.rust[filename][0]);
		} else {
			return Number(results.compilationTime.paramless.cpp[filename][0]);
		}
	} else {
		if (isRust) {
			return Number(results.compilationTime.immutableState.rust[filename][0]);
		} else {
			return Number(results.compilationTime.immutableState.cpp[filename][0]);
		}
	}
}

function getRunTime(filename: string) {
	const isRust = filename.endsWith('.rs');
	if (filename.includes('mut')) {
		if (isRust) {
			return Number(results.runTime.mutableState.rust[filename][0]);
		} else {
			return Number(results.runTime.mutableState.cpp[filename][0]);
		}
	} else {
		if (isRust) {
			return Number(results.runTime.immutableState.rust[filename][0]);
		} else {
			return Number(results.runTime.immutableState.cpp[filename][0]);
		}
	}
}

function generateRow(numFunctions: number) {
	const row = [
		numFunctions,
		getCompileTime(`calls-${numFunctions}.cpp`) / 1_000_000,
		getCompileTime(`calls-${numFunctions}.rs`) / 1_000_000,
		getCompileTime(`calls-mut-${numFunctions}.cpp`) / 1_000_000,
		getCompileTime(`calls-mut-${numFunctions}.rs`) / 1_000_000,
		getCompileTime(`calls-paramless-${numFunctions}.cpp`) / 1_000_000,
		getCompileTime(`calls-paramless-${numFunctions}.rs`) / 1_000_000,
		getRunTime(`calls-${numFunctions}.cpp`) / 1_000_000,
		getRunTime(`calls-${numFunctions}.rs`) / 1_000_000,
		getRunTime(`calls-mut-${numFunctions}.cpp`) / 1_000_000,
		getRunTime(`calls-mut-${numFunctions}.rs`) / 1_000_000,
	] as const;

	resultRows.push(row.map((n) => n.toFixed(2)) as any);
}

for (const numFunctions of possibleNumFunctions) {
	generateRow(numFunctions);
}

resultRows.sort((r1, r2) => Number(r1[0]) - Number(r2[0]));

for (const resultRow of resultRows) {
	console.log(resultRow.join(' '));
}
