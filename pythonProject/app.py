from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from bson.json_util import dumps
import logging

app = Flask(__name__)

# Enable debug mode for detailed error messages
app.config['DEBUG'] = True

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# MongoDB configuration and comment 
try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['game_data']
    collection = db['results']
    app.logger.info("Connected to MongoDB successfully")
except Exception as e:
    app.logger.error(f"Failed to connect to MongoDB: {e}")

# Dummy game class for demonstration
class SnakeGame:
    def __init__(self):
        self.state = {}

    def start_game(self):
        self.state = {"score": 0, "snake": [(0, 0)], "food": (5, 5)}

    def move_snake(self, direction):
        self.state['score'] += 1

    def get_state(self):
        return self.state

game = SnakeGame()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start_game', methods=['POST'])
def start_game():
    try:
        game.start_game()  # Start the game
        return jsonify(game.get_state()), 200
    except Exception as e:
        app.logger.error(f"Error starting game: {e}")
        return jsonify({"error": "Failed to start game"}), 500

@app.route('/move', methods=['POST'])
def move():
    try:
        direction = request.json.get('direction')
        game.move_snake(direction)  # Move the snake in the given direction
        return jsonify(game.get_state()), 200
    except Exception as e:
        app.logger.error(f"Error moving snake: {e}")
        return jsonify({"error": "Failed to move snake"}), 500

@app.route('/submit_score', methods=['POST'])
def submit_score():
    try:
        data = request.get_json()
        name = data['name']
        map_size = data['map_size']
        score = data['score']
        collection.insert_one({'name': name, 'map_size': map_size, 'score': score})
        return jsonify({"msg": "Score submitted successfully!"}), 200
    except Exception as e:
        app.logger.error(f"Error submitting score: {e}")
        return jsonify({"error": "Failed to submit score"}), 500

@app.route('/get_scores', methods=['GET'])
def get_scores():
    try:
        scores = collection.find()
        return dumps(scores), 200
    except Exception as e:
        app.logger.error(f"Error getting scores: {e}")
        return jsonify({"error": "Failed to get scores"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
