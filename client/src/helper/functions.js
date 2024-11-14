import { winningPositions } from "../constants/config";

export const convertToCoordinates = (positions) => {
    return positions.map(index => {
        const row = Math.floor(index / 5);
        const col = index % 5;
        return `${row}-${col}`;
    });
};

// Function to check if clickedCells contain a new winning position
export const checkWinningCondition = (
    winningLetters,
    clickedCells,
    winningLettersArray,
    setWinningLettersArray,
    completedWinningPositions,
    setCompletedWinningPositions

) => {
    for (let i = 0; i < winningPositions.length; i++) {
        const winPos = winningPositions[i];
        const convertedWinPos = convertToCoordinates(winPos);
        const isWinningLine = convertedWinPos.every(pos => clickedCells.includes(pos));

        if (isWinningLine && !completedWinningPositions.includes(i)) {
            // Add next letter if a new winning line is found
            if (winningLettersArray.length < 5) {
                setWinningLettersArray((prev) => [...prev, winningLetters[prev.length]]);
            }
            setCompletedWinningPositions((prev) => [...prev, i]);
            return true;
        }
    }
    return false;
};