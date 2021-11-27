import fs from 'fs';
import chunk from 'lodash.chunk';
import path from 'path';
import { rootPath } from '~/shared/constants/paths';

const compileResults = fs
	.readFileSync(path.join(rootPath, 'results.json'))
	.toString()
	.split('\n')
	.map((line) => {
		const [name, time] = line.split(' ');
		const shortName = name.split('/').at(-1);
		return [shortName, Number(time.slice(0, -1)) / 1_000_000];
	});
const runtimeResults = chunk(
	fs.readFileSync('runtime-results.txt').toString().split('\n'),
	5
).map((resultChunk) => {
	const firstLine = resultChunk[0];
	const shortName = firstLine.split(' ')[0].split('/').at(-1);
	let sum = 0;
	for (const line of resultChunk) {
		sum += Number(line.split(' ')[1].slice(0, -1));
	}
	return [shortName, sum / resultChunk.length / 1_000_000];
});

type ResultRow = readonly [
	number, // num functions
	number, // immutable state compilation time (C++)
	number, // immutable state compilation time (Rust)
	number, // mutable state compilation time (C++)
	number, // mutable state compilation time (Rust)
	number, // immutable state execution time (C++)
	number, // immutable state execution time (Rust)
	number, // mutable state execution time (C++)
	number // mutable state execution time (Rust)
];
const results: ResultRow[] = [];

const callTreeFiles = fs.readdirSync(
	path.join(__dirname, '../generated/call-trees')
);
const possibleNumFunctions = callTreeFiles.map((callTreeFile) =>
	Number(path.parse(callTreeFile).name)
);

function getTimeFromCompileResults(filename: string): number {
	return Number(compileResults.find((result) => result[0] === filename)![1]);
}

function getTimeFromRuntimeResults(filename: string): number {
	return Number(runtimeResults.find((result) => result[0] === filename)![1]);
}

function generateRow(numFunctions: number) {
	const row = [
		numFunctions,
		getTimeFromCompileResults(`calls-${numFunctions}.cpp`),
		getTimeFromCompileResults(`calls-${numFunctions}.rs`),
		getTimeFromCompileResults(`calls-mut-${numFunctions}.cpp`),
		getTimeFromCompileResults(`calls-mut-${numFunctions}.rs`),
		getTimeFromRuntimeResults(`calls-${numFunctions}.cpp`),
		getTimeFromRuntimeResults(`calls-${numFunctions}.rs`),
		getTimeFromRuntimeResults(`calls-mut-${numFunctions}.cpp`),
		getTimeFromRuntimeResults(`calls-mut-${numFunctions}.rs`),
	] as const;
	results.push(row);
}

for (const numFunctions of possibleNumFunctions) {
	generateRow(numFunctions);
}

results.sort((r1, r2) => Number(r1[0]) - Number(r2[0]))

for (const resultRow of results) {
	console.log(resultRow.join(','));
}
