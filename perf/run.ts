import fs from 'fs';

import type { OverallResults } from './types';
import {
	compileAndTimePrograms,
	compileOptimizedPrograms,
} from './utils/compile';
import { cleanProgramsFolder } from './utils/remove';
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

	// Run and track compilation time of programs 3 times
	for (let i = 0; i < 3; i += 1) {
		compileAndTimePrograms(overallResults);
		cleanProgramsFolder();
	}

	compileOptimizedPrograms();

	// Run and track runtime of programs 3 times
	for (let i = 0; i < 3; i += 1) {
		runAndTimePrograms(overallResults);
	}

	// write results to file
	fs.writeFileSync('results.json', JSON.stringify(overallResults));
}

void main();
