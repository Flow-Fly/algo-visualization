const startButton = document.getElementById("generate")
const mazeContainer = document.getElementById("container")
const currentAction = document.getElementById("current-action")
const usedAlgorithm = document.getElementById("algo-selector")
startButton.addEventListener("click", generateCells)

let usedAlgo = null

/**
 * The Node class receives an HTML element as argument.
 * It will start as being unvisited, this is important for later.
 */
class Node {
	constructor(element) {
		this.element = element
		this.visited = false
		this.className = "wall"
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
			// All cells starts as "walls" that will need to be explored
			div.classList.add("wall", "cell")
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
		matrice[Math.floor(Math.random() * 20)][Math.floor(Math.random() * 20)]
	randomFinish.goal = true
	// Get a random finish. This is totally unecessary.

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
	// A lot of fanciness for no reasons.
}

async function generateMaze(matrice) {
	const row = 0
	const col = 0
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
	startingPoint.type = "start"
	updateText("exploring")
	// We will run as long as there is something to do.
	while (stack.length > 0) {
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
