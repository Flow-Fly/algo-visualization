import { currentAction, rowRange, colRange, modeText } from "./selectors.js"
import { solveMaze } from "./solver/dfs-bfs.js"

let fastMode = false

export function updateText(string) {
	currentAction.textContent = string
}

export function getCoordinates(str) {
	const cell = document.querySelector(`.cell.${str}`)
	const row = Number(cell.dataset.row)
	const col = Number(cell.dataset.col)
	return [row, col]
}

export function thereIsNoBorder(node, direction) {
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

export function nodeIsAccessible(matrice, row, col) {
	try {
		return matrice[row] && matrice[row][col]
	} catch (error) {
		console.log(error.message)
		return false
	}
}

export function generateListeners() {
	document.querySelectorAll(".cell").forEach((cell) => {
		cell.addEventListener("click", pickCell)
	})
}
export function removeListeners() {
	document.querySelectorAll(".cell").forEach((cell) => {
		cell.removeEventListener("click", pickCell)
	})
}

export async function pickCell(event) {
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

export function thereIsNoStartingCell() {
	return !Boolean(document.querySelector(".start"))
}

export function nodeIsVisited(matrice, row, col) {
	return matrice[row][col].isVisited
}

export function sleep(time = 200) {
	return new Promise((resolve) => {
		if (fastMode) return resolve()
		setTimeout(() => {
			resolve()
		}, time)
	})
}

export function getMatriceDimensions() {
	const rows = Number(rowRange.value)
	const cols = Number(colRange.value)
	return [rows, cols]
}

export function switchMode() {
	fastMode = !fastMode
	modeText.textContent = fastMode ? "Slow" : "Fast"
}
