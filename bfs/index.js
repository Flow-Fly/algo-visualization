const startButton = document.getElementById("generate")
const mazeContainer = document.getElementById("container")
const currentAction = document.getElementById("current-action")
const generationSelect = document.getElementById("generation-select")
const solvingSelect = document.getElementById("solving-select")
const modeButton = document.getElementById("switch-mode")
const modeText = modeButton.querySelector("span")
const colRange = document.getElementById("cols")
const rowRange = document.getElementById("rows")
startButton.addEventListener("click", generateCells)
modeButton.addEventListener("click", switchMode)
let fastMode = false

/**
 * The Node class receives an HTML element as argument.
 * It will start as being unvisited, this is important for later.
 */
class Node {
	constructor(element) {
		this.element = element
		this.visited = false
		this.className = "none"
		this.goal = false
	}

	/**
	 * Using getter and setter.
	 * Those are handy to hide away some behaviours (look at the type setter)
	 */

	get position() {
		return this.coordinates
	}

	set position(obj) {
		this.coordinates = obj
	}

	get type() {
		return this.className
	}

	set type(str) {
		this.element.classList.remove(this.className)
		this.className = str
		this.element.classList.add(this.className)
	}

	get isVisited() {
		return this.visited
	}
	set isVisited(state) {
		this.visited = state
	}

	removeBorder(direction) {
		switch (direction) {
			case "up":
				this.element.style.borderTop = 0
				break
			case "down":
				this.element.style.borderBottom = 0
				break
			case "right":
				this.element.style.borderRight = 0
				break
			case "left":
				this.element.style.borderLeft = 0
				break
		}
	}
	removeOppositeBorder(direction) {
		switch (direction) {
			case "up":
				this.element.style.borderBottom = 0
				break
			case "down":
				this.element.style.borderTop = 0
				break
			case "right":
				this.element.style.borderLeft = 0
				break
			case "left":
				this.element.style.borderRight = 0
				break
		}
	}
}

function updateText(string) {
	currentAction.textContent = string
}

function generateMatrice() {
	const matrice = []
	const [maxRow, maxCol] = getMatriceDimensions()
	for (let i = 0; i < maxCol; i++) {
		const subArray = []
		for (let j = 0; j < maxRow; j++) {
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

async function generateCells() {
	const [maxRow, maxCol] = getMatriceDimensions()
	generationSelect.disabled = true
	startButton.disabled = true
	const matrice = []
	for (let i = 0; i < maxRow; i++) {
		const subArray = []
		updateText(`Generating row ${i + 1}`)
		for (let j = 0; j < maxCol; j++) {
			const div = document.createElement("div")
			// All cells starts as "walls" that will need to be explored
			div.classList.add("wall", "cell")
			div.dataset.row = i
			div.dataset.col = j
			mazeContainer.append(div)
			// We then create a node instance, pushing it into a subArray and then in the matrice.
			const node = new Node(div)
			node.type = "wall"
			node.position = { x: i, y: j }
			subArray.push(node)
			// Little bit of sleeping here in order to have some visualisation
			await sleep(10)
		}
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

async function solveMaze() {
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
		console.log(neighbors)
		if (neighbors.length > 0) {
			stack.push(currentNode)
			const rand = Math.floor(Math.random() * neighbors.length)
			const { cell: nextNode, direction } = neighbors[rand]
			nextNode.isVisited = true
			nextNode.type = "explore"

			await sleep(100)
			stack.push(nextNode)
		}
	}
}

function getCoordinates(str) {
	const cell = document.querySelector(`.cell.${str}`)
	const row = Number(cell.dataset.row)
	const col = Number(cell.dataset.col)
	return [row, col]
}

async function generateMaze(matrice) {
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

			await sleep(100)
			stack.push(nextNode)
		}
	}
	// selectRandomNeighbor(matrice, row, col)
}

function getUnvisitedNeighbors(matrice, node, solving = false) {
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
function thereIsNoBorder(node, direction) {
	const style = getComputedStyle(node.element)
	let value = ""
	switch (direction) {
		case "left":
			value = parseInt(style.borderLeft)
			break
		case "right":
			value = parseInt(style.borderRight)
			break
		case "up":
			value = parseInt(style.borderTop)
			break
		case "down":
			value = parseInt(style.borderBottom)
			break
	}
	return value === 0
}

function nodeIsAccessible(matrice, row, col) {
	try {
		return matrice[row] && matrice[row][col]
	} catch (error) {
		console.log(error.message)
		return false
	}
}

function generateListeners() {
	document.querySelectorAll(".cell").forEach((cell) => {
		cell.addEventListener("click", pickCell)
	})
}
function removeListeners() {
	document.querySelectorAll(".cell").forEach((cell) => {
		cell.removeEventListener("click", pickCell)
	})
}

async function pickCell(event) {
	if (thereIsNoStartingCell()) {
		event.target.classList.add("start")
		updateText("Now select a cell to be the the exit of the maze")
	} else {
		event.target.classList.add("end")
		updateText("Removing listeners...")
		removeListeners()
		await sleep(1000)
		solveMaze()
	}
}

function thereIsNoStartingCell() {
	return !Boolean(document.querySelector(".start"))
}

function nodeIsVisited(matrice, row, col) {
	return matrice[row][col].isVisited
}

function sleep(time = 200) {
	return new Promise((resolve) => {
		if (fastMode) return resolve()
		setTimeout(() => {
			resolve()
		}, time)
	})
}

function getMatriceDimensions() {
	const rows = Number(rowRange.value)
	const cols = Number(colRange.value)
	return [rows, cols]
}

function switchMode() {
	fastMode = !fastMode
	modeText.textContent = fastMode ? "Slow" : "Fast"
}
