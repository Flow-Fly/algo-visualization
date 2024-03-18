import { generationSelect } from "./selectors.js"
import {
	updateText,
	sleep,
	nodeIsAccessible,
	nodeIsVisited,
	thereIsNoBorder,
} from "./helpers.js"

export async function generateMaze(matrice) {
	const usedAlgo = generationSelect.value
	const row = 0
	const col = 0
	let count = 1
	/**
	 * In DFS we use something called a stack with a LIFO order
	 * LIFO: Last In, First Out. (think of a crowded subway, you're the last in: you're the first out.)
	 * We push in the stack and then get the last element, leading to LIFO.
	 *
	 * In BFS, we use a FIFO order
	 * FIFO: First In, First Out
	 */
	const stack = []
	const startingPoint = matrice[row][col]

	// Add the starting point to our stack and visit it.
	stack.push(startingPoint)
	startingPoint.isVisited = true
	startingPoint.type = "path"
	updateText("exploring")
	// We will run as long as there is something to do.
	while (stack.length > 0) {
		count++
		updateText(`Explored ${count} cells`)
		// Here we switch between the FIFO or LIFO order using shift / pop
		const currentNode = usedAlgo === "bfs" ? stack.shift() : stack.pop()
		// Get all the valid neighbor of the current node
		// Out of the matrice is unvalid and already visited are not valid aswell.
		const neighbors = getUnvisitedNeighbors(matrice, currentNode)
		// console.log(neighbors)
		if (neighbors.length > 0) {
			// push back the current node in stack if it has neighbors

			stack.push(currentNode)
			// Get a random node from the neighbors
			const rand = Math.floor(Math.random() * neighbors.length)
			const { cell: nextNode, direction } = neighbors[rand]
			currentNode.removeBorder(direction)
			nextNode.removeOppositeBorder(direction)
			nextNode.isVisited = true

			nextNode.type = "path"

			await sleep(25)
			stack.push(nextNode)
		}
	}
	// selectRandomNeighbor(matrice, row, col)
}

export function getUnvisitedNeighbors(matrice, node, solving = false) {
	const { x, y } = node.position
	const directions = {
		left: [0, -1],
		right: [0, 1],
		down: [1, 0],
		up: [-1, 0],
	}
	const neighbors = []
	for (const key in directions) {
		const [dx, dy] = directions[key]
		const row = x + dx
		const col = y + dy
		if (
			nodeIsAccessible(matrice, row, col) &&
			!nodeIsVisited(matrice, row, col)
		) {
			if (!solving) {
				neighbors.push({ cell: matrice[row][col], direction: key })
			}
			if (solving && thereIsNoBorder(node, key)) {
				neighbors.push({ cell: matrice[row][col], direction: key })
			}
			// console.log(
			// 	matrice[row][col].element.style.borderRight,
			// 	matrice[row][col].element.style.borderTop
			// )
		}
	}
	return neighbors
}
