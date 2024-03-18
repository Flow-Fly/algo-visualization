import { sleep, updateText, getCoordinates } from "../helpers.js"
import { generateMatrice } from "../matrice-generation.js"
import { getUnvisitedNeighbors } from "../dfs-bfs-generation.js"
import { solvingSelect } from "../selectors.js"

export async function solveMaze() {
	const [startRow, startCol] = getCoordinates("start")
	const [endRow, endCol] = getCoordinates("end")
	const matrice = generateMatrice(startRow, startCol, endRow, endCol)
	const usedAlgo = solvingSelect.value
	let count = 1
	const stack = []
	const startingPoint = matrice[startRow][startCol]
	stack.push(startingPoint)
	startingPoint.isVisited = true
	updateText("exploring")
	while (stack.length > 0) {
		count++
		updateText(`Explored ${count} cells`)
		const currentNode = usedAlgo === "bfs" ? stack.shift() : stack.pop()
		if (currentNode.goal) {
			break
		}
		const neighbors = getUnvisitedNeighbors(matrice, currentNode, true)
		if (neighbors.length > 0) {
			stack.push(currentNode)
			const rand = Math.floor(Math.random() * neighbors.length)
			const { cell: nextNode } = neighbors[rand]
			nextNode.isVisited = true
			nextNode.type = "explore"

			await sleep(100)
			stack.push(nextNode)
		}
	}
}
