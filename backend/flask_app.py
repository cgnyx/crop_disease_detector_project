from flask import Flask, request, jsonify
from flask_cors import CORS 
import requests
import numpy as np
from PIL import Image
import io
import json 
import base64 

app = Flask(__name__)
CORS(app) # Enable CORS for all routes (adjust as needed for specific routes)

# Configuration for TF Serving
TF_SERVING_URL = 'http://localhost:8501/v1/models/plant_disease_detector:predict'
IMG_HEIGHT, IMG_WIDTH = 224, 224

# Load your mapping files
CROP_NAME_TO_INDEX = {}
DISEASE_LABELS = []

try:
    with open('crop_name_to_index.txt', 'r') as f:
        for line in f:
            name, idx = line.strip().split(':')
            CROP_NAME_TO_INDEX[name] = int(idx)
    with open('disease_labels.txt', 'r') as f:
        for line in f:
            DISEASE_LABELS.append(line.strip())
    print("Mapping files loaded successfully.")
except FileNotFoundError as e:
    print(f"Error loading mapping files: {e}. Make sure 'crop_name_to_index.txt' and 'disease_labels.txt' are in the same directory as app.py, or adjust the paths.")
    exit(1) # Exit if essential files are missing

@app.route('/predict', methods=['POST'])
def predict():
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400

    data = request.get_json()

    if 'imageDataUri' not in data:
        return jsonify({'error': 'No imageDataUri provided in request JSON'}), 400
    if 'cropType' not in data:
        return jsonify({'error': 'No cropType provided in request JSON'}), 400

    image_data_uri = data['imageDataUri']
    crop_type_name = data['cropType'] # e.g., 'Apple' from your frontend

    try:
        header, encoded = image_data_uri.split(',', 1)
        image_bytes = base64.b64decode(encoded)
    except Exception as e:
        return jsonify({'error': f'Failed to decode image data URI: {e}'}), 400


    try:
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image = image.resize((IMG_HEIGHT, IMG_WIDTH))
        image_array = np.array(image) / 255.0 # Normalize to 0-1
        image_array = np.expand_dims(image_array, axis=0) # Add batch dimension (1, 224, 224, 3)
    except Exception as e:
        return jsonify({'error': f'Image preprocessing failed: {e}'}), 500

    crop_type_index = CROP_NAME_TO_INDEX.get(crop_type_name)
    if crop_type_index is None:
        return jsonify({'error': f'Invalid crop type: "{crop_type_name}". Please provide one of: {list(CROP_NAME_TO_INDEX.keys())}'}), 400
    crop_type_input = np.array([[crop_type_index]]) # Needs to be 2D array: [[index]]

    request_body = {
        "instances": [
            {
                "inputs": image_array.tolist(),       
                "inputs_1": crop_type_input.tolist()  
            }
        ]
    }

    print("Request body sent to TF Serving:")
    print(json.dumps(request_body, indent=2))

    response = None 
    try:
        headers = {"content-type": "application/json"}
        response = requests.post(TF_SERVING_URL, data=json.dumps(request_body), headers=headers)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        
        tf_serving_predictions = response.json().get('predictions')
        if tf_serving_predictions is None:
            return jsonify({'error': 'TensorFlow Serving did not return "predictions" key.', 'tf_response': response.json()}), 500

    except requests.exceptions.ConnectionError:
        return jsonify({'error': 'Could not connect to TensorFlow Serving. Is it running on http://localhost:8501?'}), 503
    except requests.exceptions.RequestException as e:
        error_details = f"Request to TF Serving failed: {e}"
        if response is not None:
            error_details += f"\nStatus Code: {response.status_code}\nResponse Text: {response.text}"
        print(f"Error from TF Serving: {error_details}") # Log the full error
        return jsonify({'error': 'Error from TensorFlow Serving', 'details': error_details}), 500
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred during prediction: {e}'}), 500

    # Return Raw Predictions (probabilities) to Frontend
    # Frontend will now handle mapping to disease names and confidence
    return jsonify({
        'predictions': tf_serving_predictions # Pass the raw predictions array directly
    })

if __name__ == '__main__':
    print(f"Flask app starting. TF Serving URL: {TF_SERVING_URL}")
    app.run(host='0.0.0.0', port=5000, debug=True)