import execa from 'execa';
import path from 'path';

import type { OverallResults } from '../types';
import { artifactDir, getFilename, programsFiles } from './paths';

export function runAndTimePrograms(overallResults: OverallResults) {
	for (const programPath of programsFiles) {
		const filename = getFilename(programPath);
		const artifactPath = programPath.endsWith('.rs')
			? path.join(artifactDir, `${path.parse(programPath).name}-rust`)
			: path.join(artifactDir, `${path.parse(programPath).name}-cpp`);

		const startTime = process.hrtime.bigint();
		execa.sync(artifactPath);
		const diff = process.hrtime.bigint() - startTime;

		if (filename.endsWith('.rs')) {
			if (filename.includes('mut')) {
				(overallResults.runTime.mutableState.rust[filename] ??= []).push(diff);
			} else {
				(overallResults.runTime.immutableState.rust[filename] ??= []).push(
					diff
				);
			}
		} else if (filename.endsWith('.cpp')) {
			if (filename.includes('mut')) {
				(overallResults.runTime.mutableState.cpp[filename] ??= []).push(diff);
			} else {
				(overallResults.runTime.immutableState.cpp[filename] ??= []).push(diff);
			}
		}
	}
}
