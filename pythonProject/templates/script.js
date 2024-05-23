const form = document.getElementById('game-settings');
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
let gameState = {};

form.addEventListener('submit', function (event) {
    event.preventDefault();
    const playerName = document.getElementById('player-name').value;
    const boardSize = document.getElementById('board-size').value;
    fetch('http://localhost:5000/start_game', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: playerName, board_size: boardSize})
    })
        .then(response => response.json())
        .then(data => {
            gameState = data;
            startGame();
        });
});

function startGame() {
    const boardSize = gameState.board_size;
    canvas.width = canvas.height = boardSize * 20;

    document.addEventListener('keydown', function (event) {
        let direction = gameState.direction;
        if (event.key === 'ArrowUp') direction = 'UP';
        if (event.key === 'ArrowDown') direction = 'DOWN';
        if (event.key === 'ArrowLeft') direction = 'LEFT';
        if (event.key === 'ArrowRight') direction = 'RIGHT';

        fetch('http://localhost:5000/update_game', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({direction: direction})
        })
            .then(response => response.json())
            .then(data => {
                gameState = data;
                draw();
            });
    });

    function draw() {
        if (gameState.game_over) {
            alert('Game Over! Your score: ' + gameState.score);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'green';
        gameState.snake.forEach(segment => {
            ctx.fillRect(segment[0], segment[1], 20, 20);
        });
        ctx.fillStyle = 'red';
        ctx.fillRect(gameState.food[0], gameState.food[1], 20, 20);
    }
}