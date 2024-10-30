import React from 'react'

const Board = ({
    heading, board, handleInputChange, readOnly
}) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-bold text-center mb-4 text-gray-700">{heading}</h1>
            <div className="grid grid-cols-5 gap-2">
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <input
                            readOnly={readOnly}
                            key={`${rowIndex}-${colIndex}`}
                            id={`${rowIndex}-${colIndex}`}
                            type="number"
                            min="1"
                            max="25"
                            value={cell || ''} // Display generated value or user input
                            className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-center border bg-slate-900 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-white text-lg md:text-xl appearance-none"
                            onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

export default Board
