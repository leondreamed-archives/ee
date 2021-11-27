import fs from 'fs';

import { programsDir } from './paths';

export function cleanProgramsFolder() {
	fs.rmdirSync(programsDir);
	fs.mkdirSync(programsDir);
}
