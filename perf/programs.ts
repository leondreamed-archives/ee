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

/* Round 1 data:
/Users/leonzalion/projects/ee/generated/programs/calls-10.cpp 377941230n
/Users/leonzalion/projects/ee/generated/programs/calls-10.rs 197402758n
/Users/leonzalion/projects/ee/generated/programs/calls-100.cpp 418298254n
/Users/leonzalion/projects/ee/generated/programs/calls-100.rs 617677191n
/Users/leonzalion/projects/ee/generated/programs/calls-1000.cpp 766454353n
/Users/leonzalion/projects/ee/generated/programs/calls-1000.rs 6515855282n
/Users/leonzalion/projects/ee/generated/programs/calls-10000.cpp 4539374005n
/Users/leonzalion/projects/ee/generated/programs/calls-10000.rs 72342627631n
/Users/leonzalion/projects/ee/generated/programs/calls-20.cpp 385625733n
/Users/leonzalion/projects/ee/generated/programs/calls-20.rs 189098355n
/Users/leonzalion/projects/ee/generated/programs/calls-200.cpp 462081421n
/Users/leonzalion/projects/ee/generated/programs/calls-200.rs 652569111n
/Users/leonzalion/projects/ee/generated/programs/calls-2000.cpp 1170206725n
/Users/leonzalion/projects/ee/generated/programs/calls-2000.rs 13125409954n
/Users/leonzalion/projects/ee/generated/programs/calls-300.cpp 490339842n
/Users/leonzalion/projects/ee/generated/programs/calls-300.rs 2016741178n
/Users/leonzalion/projects/ee/generated/programs/calls-3000.cpp 1583092688n
/Users/leonzalion/projects/ee/generated/programs/calls-3000.rs 20142200522n
/Users/leonzalion/projects/ee/generated/programs/calls-400.cpp 540598909n
/Users/leonzalion/projects/ee/generated/programs/calls-400.rs 2631556244n
/Users/leonzalion/projects/ee/generated/programs/calls-4000.cpp 1992346162n
/Users/leonzalion/projects/ee/generated/programs/calls-4000.rs 27131373360n
/Users/leonzalion/projects/ee/generated/programs/calls-50.cpp 392650774n
/Users/leonzalion/projects/ee/generated/programs/calls-50.rs 446131235n
/Users/leonzalion/projects/ee/generated/programs/calls-500.cpp 580889190n
/Users/leonzalion/projects/ee/generated/programs/calls-500.rs 3298473288n
/Users/leonzalion/projects/ee/generated/programs/calls-5000.cpp 2385355373n
/Users/leonzalion/projects/ee/generated/programs/calls-5000.rs 34253578535n
/Users/leonzalion/projects/ee/generated/programs/calls-600.cpp 629612487n
/Users/leonzalion/projects/ee/generated/programs/calls-600.rs 3954273173n
/Users/leonzalion/projects/ee/generated/programs/calls-6000.cpp 2836653047n
/Users/leonzalion/projects/ee/generated/programs/calls-6000.rs 41355368335n
/Users/leonzalion/projects/ee/generated/programs/calls-700.cpp 653799495n
/Users/leonzalion/projects/ee/generated/programs/calls-700.rs 4576202852n
/Users/leonzalion/projects/ee/generated/programs/calls-7000.cpp 3213594817n
/Users/leonzalion/projects/ee/generated/programs/calls-7000.rs 49104493132n
/Users/leonzalion/projects/ee/generated/programs/calls-800.cpp 694759670n
/Users/leonzalion/projects/ee/generated/programs/calls-800.rs 5222856557n
/Users/leonzalion/projects/ee/generated/programs/calls-8000.cpp 3680293819n
/Users/leonzalion/projects/ee/generated/programs/calls-8000.rs 56686350124n
/Users/leonzalion/projects/ee/generated/programs/calls-900.cpp 732797750n
/Users/leonzalion/projects/ee/generated/programs/calls-900.rs 5877794098n
/Users/leonzalion/projects/ee/generated/programs/calls-9000.cpp 4078930871n
/Users/leonzalion/projects/ee/generated/programs/calls-9000.rs 68772486469n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-10.cpp 401387943n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-10.rs 211258667n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-100.cpp 447660346n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-100.rs 623895009n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-1000.cpp 780440900n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-1000.rs 6716082992n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-10000.cpp 4519140902n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-10000.rs 74693114861n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-20.cpp 395690742n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-20.rs 194475783n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-200.cpp 468925247n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-200.rs 637207947n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-2000.cpp 1144544343n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-2000.rs 13561326887n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-300.cpp 515216330n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-300.rs 2076212928n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-3000.cpp 1578451919n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-3000.rs 20532759913n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-400.cpp 547878344n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-400.rs 2731087804n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-4000.cpp 1977968887n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-4000.rs 27822927903n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-50.cpp 449514224n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-50.rs 465790082n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-500.cpp 734258236n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-500.rs 3429394576n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-5000.cpp 2267160051n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-5000.rs 34447670947n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-600.cpp 601665136n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-600.rs 3848906478n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-6000.cpp 2627943187n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-6000.rs 40331188344n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-700.cpp 625091640n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-700.rs 4484257896n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-7000.cpp 3027708604n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-7000.rs 47495896508n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-800.cpp 659992623n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-800.rs 5080618351n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-8000.cpp 3412335692n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-8000.rs 55385700773n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-900.cpp 694986246n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-900.rs 5711942431n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-9000.cpp 3788342411n
/Users/leonzalion/projects/ee/generated/programs/calls-mut-9000.rs 62791874345n
 */
