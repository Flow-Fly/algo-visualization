import { generateCells } from "./src/matrice-generation.js"
import { switchMode } from "./src/helpers.js"
import { startButton, modeButton } from "./src/selectors.js"
startButton.addEventListener("click", generateCells)
modeButton.addEventListener("click", switchMode)
