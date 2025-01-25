from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/data', methods=['POST'])
def receive_data():
    try:
        # Parse incoming JSON data
        data = request.get_json()
        print(f"Received data: {data}")

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)