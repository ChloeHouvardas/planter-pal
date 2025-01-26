from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow CORS for all routes, simpler than the previous configuration

# Change to store coordinate history
coordinate_history = []

# TODO add a planting score endpoint
# The colour of the tree is based on the planting score 

# TODO add tree performance AI analysis

@app.route('/coordinates', methods=['GET'])
def get_coordinates():
    print("Coordinates requested:", coordinate_history)
    return jsonify(coordinate_history)

@app.route('/data', methods=['POST'])
def receive_data():
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        
        # Add new coordinates to history
        coordinate_history.append(data)

        # Extract Y value
        y_value = data.get("Y", 0)

        # Determine if the buzzer should buzz
        if y_value > 0:
            response = {"action": "buzz"}
        else:
            response = {"action": "no_buzz"}

        print(f"Sending response: {response}")
        print(f"Jsonify response{jsonify(response)}")
        return jsonify(response)  # Respond with valid JSON
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"action": "no_buzz"}), 500

@app.route('/clear', methods=['POST'])
def clear_coordinates():
    global coordinate_history
    coordinate_history = []
    return jsonify({"message": "Coordinates cleared"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)  # Added debug=True for better error messages