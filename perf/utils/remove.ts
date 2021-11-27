import fs from 'fs';

import { programsDir } from './paths';

export function cleanProgramsFolder() {
	fs.rmSync(programsDir, { recursive: true, force: true });
	fs.mkdirSync(programsDir);
}
