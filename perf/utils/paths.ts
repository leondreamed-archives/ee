import fs from 'fs';
import path from 'path';

import { rootPath } from '../../shared/constants/paths';

export const artifactDir = path.join(rootPath, 'artifacts');
export const programsDir = path.join(__dirname, '../generated/programs');
export const programsFiles = fs
	.readdirSync(programsDir)
	.map((filename) => path.join(programsDir, filename));

export function getFilename(pathString: string) {
	return path.basename(pathString);
}
