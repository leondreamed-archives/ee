export type TreeNode = { node: number; children: TreeNode[] };
export type CallTreeInfo = {
	tree: TreeNode;
	childrenMap: Record<string, number[]>;
};