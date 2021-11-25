import { defineConfig } from 'vite';

import callTreeLoader from './plugins/call-tree';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
	resolve: {
		alias: {
			'~': '../../..',
		},
	},
	plugins: [callTreeLoader()],
});
