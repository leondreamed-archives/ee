import fs from 'fs';

import { artifactDir, programsDir } from './paths';

export function cleanArtifactsFolder() {
	fs.rmSync(artifactDir, { recursive: true, force: true });
	fs.mkdirSync(artifactDir);
}

export function cleanProgramsFolder() {
	fs.rmSync(programsDir, { recursive: true, force: true });
	fs.mkdirSync(programsDir);
}
