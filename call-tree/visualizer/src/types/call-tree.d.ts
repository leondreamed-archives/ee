declare module '~generated/call-trees/*' {
	import type { TreeNode } from 'types';

	const treeNode: { tree: TreeNode; childrenMap: Record<string, number[]> };

	export = treeNode;
}

