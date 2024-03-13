const startButton = document.getElementById("generate")
const mazeContainer = document.getElementById("container")
const currentAction = document.getElementById("current-action")
const usedAlgorithm = document.getElementById("algo-selector")
startButton.addEventListener("click", generateCells)

let usedAlgo = null

class Node {
	constructor(element) {
		this.element = element
		this.visited = false
		this.className = "wall"
		this.goal = false
	}

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

async function generateCells() {
	usedAlgorithm.disabled = true
	startButton.disabled = true
	usedAlgo = usedAlgorithm.value
	const matrice = []
	for (let i = 0; i < 20; i++) {
		const subArray = []
		updateText(`Generating row ${i + 1}`)
		for (let j = 0; j < 20; j++) {
			const div = document.createElement("div")
			div.classList.add("wall", "cell")
			mazeContainer.append(div)
			const node = new Node(div)
			node.type = "wall"
			node.position = { x: i, y: j }
			subArray.push(node)
			await sleep(10)
		}
		matrice.push(subArray)
	}

	const randomFinish =
		matrice[Math.floor(Math.random() * 20)][Math.floor(Math.random() * 20)]
	randomFinish.goal = true

	updateText("generated all the cells...")
	await sleep(1000)
	updateText("Need to create that maze now...")
	await sleep(1000)

	for (let i = 0; i < 3; i++) {
		setTimeout(() => {
			updateText(`Starting in ${3 - i}`)
		}, i * 1000)
	}

	await sleep(3000)
	updateText("Starting.")
	await sleep(200)
	generateMaze(matrice)
}

async function generateMaze(matrice) {
	const row = 0
	const col = 0
	const stack = []
	const startingPoint = matrice[row][col]
	stack.push(startingPoint)
	startingPoint.isVisited = true
	startingPoint.type = "start"
	updateText("exploring")
	while (stack.length > 0) {
		const currentNode = usedAlgo === "bfs" ? stack.shift() : stack.pop()
		const neighbors = getUnvisitedNeighbors(matrice, currentNode)
		// console.log(neighbors)
		if (neighbors.length > 0) {
			// push back the current node in stack if it has neighbors
			stack.push(currentNode)
			const rand = Math.floor(Math.random() * neighbors.length)
			const { cell: nextNode, direction } = neighbors[rand]
			currentNode.removeBorder(direction)
			nextNode.removeOppositeBorder(direction)
			nextNode.isVisited = true
			if (nextNode.goal) {
				nextNode.type = "end"
			} else {
				nextNode.type = "path"
			}
			await sleep(100)
			stack.push(nextNode)
		}
	}
	// selectRandomNeighbor(matrice, row, col)
}

function getUnvisitedNeighbors(matrice, node) {
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
			neighbors.push({ cell: matrice[row][col], direction: key })
		}
	}
	return neighbors
}

function nodeIsAccessible(matrice, row, col) {
	try {
		return matrice[row] && matrice[row][col]
	} catch (error) {
		console.log(error.message)
		return false
	}
}

function nodeIsVisited(matrice, row, col) {
	return matrice[row][col].isVisited
}

function sleep(time = 200) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, time)
	})
}
