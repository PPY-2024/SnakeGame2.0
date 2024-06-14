/**
 * @jest-environment jsdom
 */

const { createCanvas } = require('canvas');
const { JSDOM } = require('jsdom');

describe('Snake Game Tests', () => {
    let window, document, canvas, ctx;
    let SPACE_SIZE, GAME_WIDTH, GAME_HEIGHT, BODY_PARTS, SNAKE_COLOR;
    let snake, direction, directionQueue;

    beforeEach(() => {
        // Mock the DOM and get the canvas context
        const dom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="gameCanvas"></canvas></body></html>`);
        window = dom.window;
        document = window.document;

        // Replace the original canvas with the canvas created by the 'canvas' package
        canvas = createCanvas(500, 500);
        ctx = canvas.getContext('2d');

        document.getElementById = jest.fn().mockImplementation((id) => {
            if (id === 'gameCanvas') {
                return canvas;
            }
        });

        // Constants
        SPACE_SIZE = 50;
        BODY_PARTS = 3;
        SNAKE_COLOR = "#0fbcf9";
        const gridSize = 10; // Example grid size for testing
        GAME_WIDTH = gridSize * SPACE_SIZE;
        GAME_HEIGHT = gridSize * SPACE_SIZE;

        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;

        // Game state variables
        direction = 'down';
        directionQueue = [];

        // Snake class from the game code
        class Snake {
            constructor() {
                this.bodySize = BODY_PARTS;
                this.coordinates = [];
                for (let i = 0; i < BODY_PARTS; i++) {
                    this.coordinates.push([0, 0]);
                }
                for (const [x, y] of this.coordinates) {
                    this.createSquare(x, y, SNAKE_COLOR, false);
                }
            }
            createSquare(x, y, color, drawGridLine = false) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x + SPACE_SIZE / 2, y + SPACE_SIZE / 2, SPACE_SIZE / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            }
            grow() {
                this.coordinates.push([...this.coordinates[this.coordinates.length - 1]]);
            }
        }

        snake = new Snake();
    });

    function changeDirection(newDirection) {
        directionQueue.push(newDirection);
    }

    function processDirectionQueue() {
        const oppositeDirections = {
            up: 'down',
            down: 'up',
            left: 'right',
            right: 'left'
        };
        if (directionQueue.length > 0) {
            const newDirection = directionQueue.shift();
            if (newDirection !== oppositeDirections[direction]) {
                direction = newDirection;
            }
        }
    }

    function nextTurn(snake) {
        processDirectionQueue();
        let [x, y] = snake.coordinates[0];
        switch (direction) {
            case 'up': y -= SPACE_SIZE; break;
            case 'down': y += SPACE_SIZE; break;
            case 'left': x -= SPACE_SIZE; break;
            case 'right': x += SPACE_SIZE; break;
        }
        snake.coordinates.unshift([x, y]);
        snake.coordinates.pop();
    }

    it('should initialize the snake with correct number of body parts', () => {
        expect(snake.coordinates.length).toBe(BODY_PARTS);
    });

    it('should change direction correctly when a new direction is given', () => {
        changeDirection('up');
        processDirectionQueue();
        expect(direction).toBe('down');

        changeDirection('left');
        processDirectionQueue();
        expect(direction).toBe('left');

        // Test invalid direction change (opposite direction)
        changeDirection('right');
        processDirectionQueue();
        expect(direction).toBe('left');  // Should remain 'left' because 'right' is the opposite direction
    });

    it('should move the snake in the correct direction', () => {
        // Initial position
        snake.coordinates = [[0, 0], [0, SPACE_SIZE], [0, SPACE_SIZE * 2]];

        // Move snake down
        direction = 'down';
        nextTurn(snake);
        expect(snake.coordinates[0]).toEqual([0, SPACE_SIZE]);

        // Move snake right
        direction = 'right';
        nextTurn(snake);
        expect(snake.coordinates[0]).toEqual([SPACE_SIZE, SPACE_SIZE]);
        expect(snake.coordinates[1]).toEqual([0, SPACE_SIZE]);
    });

    it('should grow the snake correctly', () => {
        const initialLength = snake.coordinates.length;

        // Simulate snake eating food and growing
        snake.grow();

        // Check if the snake has grown by one part
        expect(snake.coordinates.length).toBe(initialLength + 1);

        // Verify the new part is at the same position as the last part (since it's a simple grow simulation)
        expect(snake.coordinates[snake.coordinates.length - 1]).toEqual(snake.coordinates[snake.coordinates.length - 2]);
    });

    it('should not change to the opposite direction', () => {
        // Initial direction
        direction = 'left';

        // Change to the opposite direction
        changeDirection('right');
        processDirectionQueue();

        // Check that the direction did not change
        expect(direction).toBe('left');
    });
});
