import {
	getMatriceDimensions,
	updateText,
	sleep,
	generateListeners,
} from "./helpers.js"
import Node from "./node.js"
import { generateMaze } from "./dfs-bfs-generation.js"
import { generationSelect, startButton, mazeContainer } from "./selectors.js"

export function generateMatrice() {
	const matrice = []
	const [maxRow, maxCol] = getMatriceDimensions()
	for (let i = 0; i < maxRow; i++) {
		const subArray = []
		for (let j = 0; j < maxCol; j++) {
			// console.log(`i: ${i}, j: ${j}, rows: ${maxRow}, cols: ${maxCol}`)
			const div = document.querySelector(
				`.cell[data-row="${i}"][data-col="${j}"]`
			)
			const isStart = div.classList.contains("start")
			const isEnd = div.classList.contains("end")
			const node = new Node(div)
			node.position = { x: i, y: j }
			if (isStart) {
				node.type = "start"
			} else if (isEnd) {
				node.type = "end"
				node.goal = true
			}
			subArray.push(node)
		}
		matrice.push(subArray)
	}
	return matrice
}

export async function generateCells() {
	const [maxRow, maxCol] = getMatriceDimensions()
	generationSelect.disabled = true
	startButton.disabled = true
	const matrice = []
	for (let i = 0; i < maxRow; i++) {
		const subArray = []
		const wrapper = document.createElement("div")
		updateText(`Generating row ${i + 1}`)
		for (let j = 0; j < maxCol; j++) {
			const div = document.createElement("div")
			// All cells starts as "walls" that will need to be explored
			div.classList.add("wall", "cell")
			div.dataset.row = i
			div.dataset.col = j
			wrapper.append(div)
			// We then create a node instance, pushing it into a subArray and then in the matrice.
			const node = new Node(div)
			node.type = "wall"
			node.position = { x: i, y: j }
			subArray.push(node)
			// Little bit of sleeping here in order to have some visualisation
			await sleep(10)
		}
		mazeContainer.append(wrapper)
		matrice.push(subArray)
	}

	const randomFinish =
		matrice[Math.floor(Math.random() * matrice.length)][
			Math.floor(Math.random() * matrice[0].length)
		]
	randomFinish.goal = true
	// Get a random finish. This is totally unecessary.

	updateText("generated all the cells...")
	await sleep(1000)
	updateText("Need to create that maze now...")
	await sleep(1000)
	updateText("Starting.")
	await sleep(200)
	await generateMaze(matrice)
	updateText("Click a cell in order to select a starting point")
	generateListeners()
}
