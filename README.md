# Krishi Rakshak: AI-Powered Crop Disease Detection

Krishi Rakshak is a web application designed to assist farmers by providing AI-powered analysis of plant leaf images to detect potential diseases. It aims to offer quick, accessible preliminary diagnoses and basic treatment advice.

## Core Features

-   **Disease Detection**: Users can upload an image of an affected plant leaf and select the crop type. The application sends this data to a backend for analysis.
-   **AI-Driven Analysis**:
    -   A Machine Learning model (intended to be served via TensorFlow Serving) analyzes the image.
    -   A Flask backend handles image preprocessing and communication with the TensorFlow Serving model.
    -   A Genkit AI flow reasons about the model's output (especially in low-confidence scenarios) to provide suggestions and guidance.
-   **Result Presentation**: Displays the detected disease name, confidence level (from the model), an AI-generated suggestion, example images of the disease, and basic treatment advice.
-   **Crop Selection**: Supports a variety of crops, allowing the analysis to be more targeted.
-   **Offline Scan History**: Stores past scan results locally in the browser, allowing farmers to review them without a network connection.

## Tech Stack

-   **Frontend**: Next.js, React, TypeScript, ShadCN UI components, Tailwind CSS
-   **Backend (Image Preprocessing & Model Orchestration)**: Flask (Python)
-   **Machine Learning Model Serving**: TensorFlow Serving (run via Docker)
-   **AI-Powered Reasoning/Suggestions**: Genkit (Google AI)
-   **Styling**: Tailwind CSS, ShadCN UI theme

## Prerequisites

Before you begin, ensure you have the following installed:
-   Node.js (v18 or later recommended)
-   npm or yarn
-   Python (v3.8 or later recommended)
-   pip (Python package installer)
-   Docker Desktop

## Setup Instructions

### 1. Frontend (Next.js App - This project)

1.  **Clone the repository (if you haven't already).**
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### 2. Flask Backend (Image Preprocessing)

*This assumes you have a Flask application similar to the one discussed.*

1.  **Create a directory for your Flask app** (e.g., `flask_backend` at the root of this project or elsewhere).
2.  **Place your Flask app file (e.g., `app.py`) inside this directory.**
3.  **Create `requirements.txt` for your Flask app:**
    ```txt
    Flask
    Flask-CORS
    requests
    numpy
    Pillow
    # Add any other Python dependencies your Flask app needs
    ```
4.  **Create `crop_name_to_index.txt` and `disease_labels.txt` in the Flask app directory.**
    *   `crop_name_to_index.txt` should map crop names (strings) to integer indices used by your model. Example:
        ```
        Apple:0
        Corn_(maize):3
        Tomato:13
        ```
    *   `disease_labels.txt` should list all 38 disease class names, one per line, in the exact order your model outputs probabilities.
5.  **Create a Python virtual environment (recommended):**
    ```bash
    cd path/to/your/flask_backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
6.  **Install Flask app dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

### 3. TensorFlow Serving (ML Model)

1.  **Prepare your `SavedModel`:**
    *   Ensure you have your trained TensorFlow model exported in the `SavedModel` format.
    *   It should typically have a structure like:
        ```
        your_model_directory_name/
        └── 1/  (or other version number)
            ├── saved_model.pb
            └── variables/
                ├── variables.data-00000-of-00001
                └── variables.index
        ```
2.  **Run TensorFlow Serving using Docker:**
    *   Replace `/path/to/your_model_directory_name` with the absolute path to your model directory.
    *   Replace `plant_disease_detector` with the `MODEL_NAME` you want TensorFlow Serving to use. This name must match the one in `TF_SERVING_URL` in your Flask app.
    ```bash
    docker run -t --rm -p 8501:8501 \
        -v "/path/to/your_model_directory_name:/models/plant_disease_detector" \
        -e MODEL_NAME="plant_disease_detector" \
        tensorflow/serving
    ```
    *   **Note on model path for Docker:** The `-v` flag mounts your local model directory into the Docker container. Ensure the path *before* the colon is the correct absolute path on your host machine, and the path *after* the colon ends with the `MODEL_NAME` you've chosen.

## Running the Application

You need to start all three services: TensorFlow Serving, the Flask Backend, and the Next.js Frontend.

1.  **Start TensorFlow Serving:**
    *   Open a terminal and run the Docker command from the "TensorFlow Serving" setup section.
    *   Ensure it starts without errors and indicates it's ready to serve your model.

2.  **Start the Flask Backend:**
    *   Open a new terminal.
    *   Navigate to your Flask app's directory.
    *   Activate your Python virtual environment (if you created one).
    *   Run the Flask app (e.g., if your file is `app.py`):
        ```bash
        flask run --host=0.0.0.0 --port=5000
        # or python app.py if you have app.run() configured
        ```
    *   Ensure it starts without errors and is listening on port 5000.

3.  **Start the Next.js Frontend:**
    *   Open a new terminal.
    *   Navigate to the root of *this* Next.js project.
    *   Run the development server:
        ```bash
        npm run dev
        # or
        yarn dev
        ```