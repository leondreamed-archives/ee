import fs from 'fs';
import path from 'path';
import type { Plugin } from 'rollup';

import { callTreesDir } from '../../../shared/constants/paths';

// eslint-disable-next-line import/no-default-export
export default function callTreeLoader(): Plugin {
	return {
		name: 'clubs-loader',
		resolveId(source) {
			if (source.includes('generated/call-trees/')) {
				return source;
			}
			return undefined;
		},
		load(id) {
			if (id.includes('generated/call-trees/')) {
				const idParts = id.split('/');
				const callTreeLength = idParts[idParts.length - 1];

				const callTree = fs
					.readFileSync(path.join(callTreesDir, `${callTreeLength}.json`))
					.toString();

				return `export default ${callTree}`;
			}
			return undefined;
		},
	};
}
