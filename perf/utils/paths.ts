import fs from 'fs';
import path from 'path';

import { rootPath } from '../../shared/constants/paths';

export const artifactDir = path.join(rootPath, 'artifacts');
export const programsDir = path.join(rootPath, 'generated/programs');
export const programsFiles = fs
	.readdirSync(programsDir)
	.map((filename) => path.join(programsDir, filename))
	.filter((p) => ['-20.', '-50.', '-100.', '-200.', '-500.'].some((n) => p.includes(n)));

export function getFilename(pathString: string) {
	return path.basename(pathString);
}
