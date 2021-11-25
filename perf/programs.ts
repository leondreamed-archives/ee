import execa from 'execa';
import fs from 'fs';
import path from 'path';

import { rootPath } from '../shared/constants/paths';

function convertHrtime(hrtime: bigint) {
	const nanoseconds = hrtime;
	const number = Number(nanoseconds);
	const milliseconds = number / 1_000_000;
	const seconds = number / 1_000_000_000;

	return {
		seconds,
		milliseconds,
		nanoseconds,
	};
}

const artifactDir = path.join(rootPath, 'artifacts');

function compileCpp(filePath: string): bigint {
	const artifactPath = path.join(
		artifactDir,
		`${path.parse(filePath).name}-cpp`
	);
	const startTime = process.hrtime.bigint();
	execa.sync('g++', ['-std=c++17', filePath, '-o', artifactPath]);
	const diff = process.hrtime.bigint() - startTime;
	return convertHrtime(diff).nanoseconds;
}

function compileRust(filePath: string): bigint {
	const artifactPath = path.join(
		artifactDir,
		`${path.parse(filePath).name}-rust`
	);
	const startTime = process.hrtime.bigint();
	execa.sync('rustc', [filePath, '-o', artifactPath]);
	const diff = process.hrtime.bigint() - startTime;
	return convertHrtime(diff).nanoseconds;
}

const programsDir = path.join(__dirname, '../generated/programs');
const programsFiles = fs
	.readdirSync(programsDir)
	.map((filename) => path.join(programsDir, filename));

for (const programPath of programsFiles) {
	if (programPath.endsWith('.rs')) {
		console.log(programPath, compileRust(programPath));
	} else if (programPath.endsWith('.cpp')) {
		console.log(programPath, compileCpp(programPath));
	}
}