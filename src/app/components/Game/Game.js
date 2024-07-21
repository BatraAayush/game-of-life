"use client"
import React, { useState, useCallback, useRef } from "react";
import {produce} from "immer"; // Changed import from "immer" directly
import { characterPatterns } from "../patterns";

import "./Game.css";
import { COLUMNS, ROWS } from "@/app/constants";

const numRows = ROWS;
const numCols = COLUMNS;

const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0],
];

const generateEmptyGrid = () => {
  return Array.from({ length: numRows }, () => Array(numCols).fill(0));
};

const placeCharacter = (grid, char, startX, startY) => {
  const pattern = characterPatterns[char];
  if (!pattern) return grid;

  return produce(grid, (gridCopy) => {
    for (let i = 0; i < pattern.length; i++) {
      for (let j = 0; j < pattern[i].length; j++) {
        const x = startX + i;
        const y = startY + j;
        if (x >= 0 && x < numRows && y >= 0 && y < numCols) {
          gridCopy[x][y] = pattern[i][j];
        }
      }
    }
  });
};

const placeName = (grid, name, startX, startY) => {
  let currentX = startX;
  let currentY = startY;

  return name.split("").reduce((newGrid, char) => {
    const pattern = characterPatterns[char];
    if (!pattern) return newGrid;

    // Check if the character fits in the current row, else move to the next row
    if (currentY + pattern[0].length > numCols) {
      currentX += pattern.length + 1; // Move to the next row
      currentY = startY; // Reset to startY
    }

    const updatedGrid = placeCharacter(newGrid, char, currentX, currentY);
    currentY += pattern[0].length + 1; // Move to the next position, 1 space in between characters
    return updatedGrid;
  }, grid);
};

const Game = () => {
  const [grid, setGrid] = useState(generateEmptyGrid());
  const [running, setRunning] = useState(false);
  const [name, setName] = useState("");
  const runningRef = useRef(running);
  runningRef.current = running;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }
    setGrid((g) => {
      return produce(g, (gridCopy) => {
        for (let i = 0; i < numRows; i++) {
          for (let k = 0; k < numCols; k++) {
            let neighbors = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newK = k + y;
              if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
                neighbors += g[newI][newK];
              }
            });
            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][k] = 0;
            } else if (g[i][k] === 0 && neighbors === 3) {
              gridCopy[i][k] = 1;
            }
          }
        }
      });
    });
    setTimeout(runSimulation, 100);
  }, []);

  const handleClearGrid = () => {
    setGrid(generateEmptyGrid()); // Reset the grid
    setRunning(false); // Stop the simulation
  };

  const handlePlaceName = () => {
    const newGrid = placeName(generateEmptyGrid(), name, 2, 2);
    setGrid(newGrid);
    setName(""); // Clear the name input field
  };

  return (
    <>
      <div className="grid w-max m-auto grid-cols-xs-30 sm:grid-cols-sm-30 xl:grid-cols-xl-30">
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <div
              key={`${i}-${k}`}
              onClick={() => {
                const newGrid = produce(grid, (gridCopy) => {
                  gridCopy[i][k] = grid[i][k] ? 0 : 1;
                });
                setGrid(newGrid);
              }}
              className="w-[10px] h-[10px] sm:w-[15px] sm:h-[15px] xl:w-[20px] xl:h-[20px] border-solid border border-gray-300"
              style={{
                backgroundColor: grid[i][k] ? "white" : undefined,
              }}
            />
          ))
        )}
      </div>
      <div className="flex flex-col w-[40%] sm:w-full m-auto sm:flex-row sm:text-sm gap-4 sm:gap-2 md:gap-4 mt-4 justify-center">
        <button
          onClick={() => {
            setRunning(!running);
            if (!running) {
              runningRef.current = true;
              runSimulation();
            }
          }}
          className="border border-white text-white text-base px-4 py-1 rounded-lg hover:bg-white hover:text-black"
        >
          {running ? "Stop" : "Start"}
        </button>
        <button
          onClick={handleClearGrid}
          className="border border-white text-white text-base px-4 py-1 rounded-lg hover:bg-white hover:text-black"
        >
          Clear
        </button>
        <button
          className="border border-white text-white text-base px-4 py-1 rounded-lg hover:bg-white hover:text-black"
          onClick={() => {
            const newGrid = generateEmptyGrid();
            for (let i = 0; i < numRows; i++) {
              for (let k = 0; k < numCols; k++) {
                if (Math.random() > 0.7) {
                  newGrid[i][k] = 1;
                }
              }
            }
            setGrid(newGrid);
          }}
        >
          Random
        </button>
        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          className="bg-black border border-white text-base px-4 py-1 text-white sm:w-[10rem] md:w-max rounded"
        />
        <button
          className={`border border-white text-white text-base px-4 py-1 rounded-lg ${!name ? 'hidden' : 'hover:bg-white hover:text-black'}`}
          onClick={handlePlaceName}
        >
          Place Name
        </button>
      </div>
    </>
  );
};

export default Game;
