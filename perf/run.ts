import fs from 'fs';

import type { OverallResults } from './types';
import {
	compileAndTimePrograms,
	compileOptimizedPrograms,
} from './utils/compile';
import { cleanArtifactsFolder } from './utils/remove';
import { runAndTimePrograms } from './utils/runtime';

async function main() {
	const overallResults: OverallResults = {
		compilationTime: {
			immutableState: {
				cpp: {},
				rust: {},
			},
			mutableState: {
				cpp: {},
				rust: {},
			},
			paramless: {
				cpp: {},
				rust: {},
			},
		},
		runTime: {
			immutableState: {
				cpp: {},
				rust: {},
			},
			mutableState: {
				cpp: {},
				rust: {},
			},
		},
	};

	cleanArtifactsFolder();

	compileAndTimePrograms(overallResults);
	cleanArtifactsFolder();

	compileOptimizedPrograms();

	runAndTimePrograms(overallResults);

	// write results to file
	fs.writeFileSync(
		'results.json',
		JSON.stringify(
			overallResults,
			(key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
		)
	);
}

void main();
