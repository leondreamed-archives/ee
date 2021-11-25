import Benchmark from 'benchmark';
import execa from 'execa';
import fs from 'fs';
import path from 'path';

import { rootPath } from '../shared/constants/paths';

const programsDir = path.join(__dirname, '../generated/programs');
const programsFiles = fs
	.readdirSync(programsDir)
	.map((filename) => path.join(programsDir, filename));

const artifactDir = path.join(rootPath, 'artifacts');
const benchmark = new Benchmark.Suite();
for (const programPath of programsFiles) {
	if (!programPath.includes('mut')) continue;
	const artifactPath = programPath.endsWith('.rs')
		? path.join(artifactDir, `${path.parse(programPath).name}-rust`)
		: path.join(artifactDir, `${path.parse(programPath).name}-cpp`);

	benchmark.add(artifactPath, () => {
		execa.sync(artifactPath);
	});
}

benchmark
	.on('cycle', (event: any) => {
		console.log(String(event.target));
	})
	.run({ async: true });
