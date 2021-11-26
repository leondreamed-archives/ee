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

const programsDir = path.join(__dirname, '../generated/programs');
const programsFiles = fs
	.readdirSync(programsDir)
	.map((filename) => path.join(programsDir, filename));

const artifactDir = path.join(rootPath, 'artifacts');
for (const programPath of programsFiles) {
	const artifactPath = programPath.endsWith('.rs')
		? path.join(artifactDir, `${path.parse(programPath).name}-rust`)
		: path.join(artifactDir, `${path.parse(programPath).name}-cpp`);

	for (let i = 0; i < 5; i += 1) {
		const startTime = process.hrtime.bigint();
		execa.sync(artifactPath);
		const diff = process.hrtime.bigint() - startTime;
		console.log(`${programPath}`, convertHrtime(diff).nanoseconds);
	}
}
