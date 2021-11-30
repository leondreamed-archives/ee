import './style.css';

import * as d3 from 'd3';

import { NUM_FUNCTIONS } from '~/shared/constants/gen';
import type { TreeNode } from '~/types';
import adjList from '~generated/call-trees/50';

function convertAdjListNodeToTreeNode(node: number): TreeNode {
	const treeNodeChildren = adjList[node].map((childNode) =>
		convertAdjListNodeToTreeNode(childNode)
	);
	const treeNode: TreeNode = {
		node,
		children: treeNodeChildren,
	};
	return treeNode;
}

const callTree = convertAdjListNodeToTreeNode(0);
console.log(callTree);

const treeMargin = 30;
const nodeRadius = 20;

const treeHeight = NUM_FUNCTIONS * 10;
const treeWidth = NUM_FUNCTIONS * 15;

const tree = d3.tree<TreeNode>().size([treeWidth, treeHeight]);
const treeData = tree(d3.hierarchy(callTree, (node) => node.children));

const nodes = treeData.descendants();
const links = treeData.links();

const callTreeSvg = document.querySelector<SVGElement>('#call-tree')!;
callTreeSvg.setAttribute('width', '100vw');
callTreeSvg.setAttribute('height', '100vh');
callTreeSvg.setAttribute('margin', `${treeMargin}px`);

function createSvgElement<K extends keyof SVGElementTagNameMap>(tag: K) {
	return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

const treeG = createSvgElement('g');
treeG.setAttribute('transform', `translate(${treeMargin}, ${treeMargin})`);

const linkVertical = d3.linkVertical();
for (const link of links) {
	const linkPath = createSvgElement('path');
	linkPath.classList.add('link');
	linkPath.setAttribute(
		'd',
		linkVertical({
			source: [link.source.x, link.source.y],
			target: [link.target.x, link.target.y],
		})!
	);
	treeG.append(linkPath);
}

for (const node of nodes) {
	const nodeG = createSvgElement('g');
	nodeG.setAttribute('transform', `translate(${node.x}, ${node.y})`);
	nodeG.classList.add('node');

	// Creating the circle for the node
	const nodeCircle = createSvgElement('circle');
	nodeCircle.setAttribute('r', nodeRadius.toString());
	nodeG.append(nodeCircle);

	// Creating the text for the node
	const nodeText = createSvgElement('text');
	nodeText.setAttribute('text-anchor', 'middle');
	nodeText.setAttribute('font-size', '20px');
	nodeText.setAttribute('y', '6');
	nodeText.innerHTML = `f${node.data.node}`;
	nodeG.append(nodeText);

	treeG.append(nodeG);
}

callTreeSvg.append(treeG);
