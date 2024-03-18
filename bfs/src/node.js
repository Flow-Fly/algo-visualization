/**
 * The Node class receives an HTML element as argument.
 * It will start as being unvisited, this is important for later.
 */
export default class Node {
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
