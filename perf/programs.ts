import execa from 'execa';
import fs from 'fs';
import path from 'path';

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

function compileCpp(filePath: string): bigint {
	const startTime = process.hrtime.bigint();
	execa.sync('g++', [filePath]);
	const diff = process.hrtime.bigint() - startTime;
	return convertHrtime(diff).nanoseconds;
}

function compileRust(filePath: string): bigint {
	const startTime = process.hrtime.bigint();
	execa.sync('rustc', [filePath]);
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
	} else {
		console.log(programPath, compileCpp(programPath));
	}
}

/*
Statistics (in nanoseconds):
/Users/leonzalion/projects/ee/generated/programs/calls-10.cpp 255570971n
/Users/leonzalion/projects/ee/generated/programs/calls-10.rs 138481847n
/Users/leonzalion/projects/ee/generated/programs/calls-100.cpp 266242264n
/Users/leonzalion/projects/ee/generated/programs/calls-100.rs 154352305n
/Users/leonzalion/projects/ee/generated/programs/calls-1000.cpp 392609759n
/Users/leonzalion/projects/ee/generated/programs/calls-1000.rs 392309872n
/Users/leonzalion/projects/ee/generated/programs/calls-10000.cpp 1713352914n
/Users/leonzalion/projects/ee/generated/programs/calls-10000.rs 2994808565n
/Users/leonzalion/projects/ee/generated/programs/calls-100000.cpp 17416428816n
/Users/leonzalion/projects/ee/generated/programs/calls-100000.rs 35444262774n
/Users/leonzalion/projects/ee/generated/programs/calls-1000000.cpp 341423129690n
 */