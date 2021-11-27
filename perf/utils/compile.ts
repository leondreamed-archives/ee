import execa from 'execa';
import path from 'path';

import type { OverallResults } from '../types';
import { convertHrtime } from './hrtime';
import { artifactDir, getFilename, programsFiles } from './paths';

function compileCpp({
	filePath,
	optimized,
}: {
	filePath: string;
	optimized: boolean;
}): bigint {
	const artifactPath = path.join(
		artifactDir,
		`${path.parse(filePath).name}-cpp`
	);
	const startTime = process.hrtime.bigint();
	if (optimized) {
		execa.sync('g++', ['-std=c++17', filePath, '-o', artifactPath]);
	} else {
		execa.sync('g++', ['-std=c++17', filePath, '-o', artifactPath]);
	}
	const diff = process.hrtime.bigint() - startTime;
	return convertHrtime(diff).nanoseconds;
}

function compileRust({
	filePath,
	optimized,
}: {
	filePath: string;
	optimized: boolean;
}): bigint {
	const artifactPath = path.join(
		artifactDir,
		`${path.parse(filePath).name}-rust`
	);
	const startTime = process.hrtime.bigint();
	if (optimized) {
		execa.sync('rustc', [filePath, '-o', artifactPath]);
	} else {
		execa.sync('rustc', [filePath, '-o', artifactPath]);
	}
	const diff = process.hrtime.bigint() - startTime;
	return convertHrtime(diff).nanoseconds;
}

export function compileAndTimePrograms(overallResults: OverallResults) {
	for (const programPath of programsFiles) {
		const filename = getFilename(programPath);
		console.log(`Compiling and timing ${filename}...`);
		if (programPath.endsWith('.rs')) {
			const time = compileRust({ filePath: programPath, optimized: false });
			if (filename.includes('mut')) {
				(overallResults.compilationTime.mutableState.rust[filename] ??=
					[]).push(time);
			} else if (filename.includes('paramless')) {
				(overallResults.compilationTime.paramless.rust[filename] ??= []).push(
					time
				);
			} else {
				(overallResults.compilationTime.immutableState.rust[filename] ??=
					[]).push(time);
			}
		} else if (programPath.endsWith('.cpp')) {
			const time = compileCpp({ filePath: programPath, optimized: false });
			if (filename.includes('mut')) {
				(overallResults.compilationTime.mutableState.cpp[filename] ??= []).push(
					time
				);
			} else if (filename.includes('paramless')) {
				(overallResults.compilationTime.paramless.cpp[filename] ??= []).push(
					time
				);
			} else {
				(overallResults.compilationTime.immutableState.cpp[filename] ??=
					[]).push(time);
			}
		}
	}
}

export function compileOptimizedPrograms() {
	for (const programPath of programsFiles) {
		const filename = getFilename(programPath);
		console.log(`Compiling optimized ${filename}...`);
		if (programPath.endsWith('.rs')) {
			compileRust({ filePath: programPath, optimized: true });
		} else if (programPath.endsWith('.cpp')) {
			compileCpp({ filePath: programPath, optimized: true });
		}
	}
}
