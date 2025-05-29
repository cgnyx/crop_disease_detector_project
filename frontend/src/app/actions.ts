
'use server';

import { reasonAboutLowConfidence } from '@/ai/flows/reason-about-low-confidence';
import type { ReasonAboutLowConfidenceInput, ReasonAboutLowConfidenceOutput } from '@/ai/flows/reason-about-low-confidence';
import { FLASK_API_URL, DISEASE_LABELS, CROP_OPTIONS } from '@/lib/constants'; // Using FLASK_API_URL

export async function getAIDrivenSuggestion(input: ReasonAboutLowConfidenceInput): Promise<ReasonAboutLowConfidenceOutput> {
  console.log("[getAIDrivenSuggestion] Start. Input:", input);
  try {
    const result = await reasonAboutLowConfidence(input);
    if (!result || !result.suggestion) {
        console.error("[getAIDrivenSuggestion] Error: AI suggestion output is invalid. Result:", result);
        throw new Error("AI suggestion output is invalid.");
    }
    console.log("[getAIDrivenSuggestion] Success. Suggestion:", result.suggestion);
    return result;
  } catch (error) {
    console.error("[getAIDrivenSuggestion] Error in AI suggestion flow:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred while fetching AI suggestion.";
    throw new Error(`Failed to get AI suggestion: ${message}`);
  }
}

export interface DiseaseDetectionInput {
  imageDataUri: string;
  cropType: string; // This will be the string value like "maize", "apple"
}

export interface DiseaseDetectionOutput {
  diseaseName: string;
  confidence: number;
}

export async function performDiseaseDetection(input: DiseaseDetectionInput): Promise<DiseaseDetectionOutput> {
  console.log(`[performDiseaseDetection] Start. Calling Flask API for Crop: ${input.cropType}. Image URI length: ${input.imageDataUri?.length || 'N/A'}`);

  if (!input.imageDataUri) {
    console.error("[performDiseaseDetection] Error: imageDataUri is missing.");
    throw new Error("Image data is missing. Cannot perform detection.");
  }

  if (!FLASK_API_URL) {
    console.error("[performDiseaseDetection] CRITICAL ERROR: FLASK_API_URL is not configured or is undefined/empty.");
    throw new Error("Flask API endpoint is not configured. Please check server settings (src/lib/constants.ts).");
  }
  console.log(`[performDiseaseDetection] Flask API URL: ${FLASK_API_URL}`);

  // The Flask app will handle:
  // 1. Decoding base64 imageDataUri.
  // 2. Preprocessing the image (resize to 224x224, normalize, convert to float array).
  // 3. Mapping cropType string to an integer index if needed for TF Serving.
  // 4. Constructing the specific payload for TensorFlow Serving (e.g., {"instances": [{"inputs": ..., "inputs_1": ...}]}).
  // 5. Calling TensorFlow Serving.
  // 6. Returning the predictions to this Next.js app.

  const requestPayloadToFlask = {
    imageDataUri: input.imageDataUri,
    cropType: input.cropType,
  };

  console.log("[performDiseaseDetection] Sending payload to Flask API:", JSON.stringify({ cropType: input.cropType, imageDataUriLength: input.imageDataUri.length }));


  try {
    const response = await fetch(FLASK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayloadToFlask),
    });

    if (!response.ok) {
      let errorBody = "Could not retrieve error body from Flask API response.";
      try {
        errorBody = await response.text(); // Try to get text for more detailed error
      } catch (e) {
        console.error("[performDiseaseDetection] Error reading non-JSON error body from Flask API:", e);
      }
      console.error(`[performDiseaseDetection] Flask API request failed. Status: ${response.status}, Body: ${errorBody}`);
      throw new Error(`Model API (Flask) request failed with status ${response.status}: ${errorBody}. Check Flask server console for details and ensure it is running and accessible at ${FLASK_API_URL}.`);
    }

    const data = await response.json();
    console.log("[performDiseaseDetection] Received data from Flask API (first 500 chars):", JSON.stringify(data).substring(0, 500) + "...");

    // Assuming Flask returns the same structure as TensorFlow Serving: {"predictions": [[...probabilities...]]}
    if (!data.predictions || !Array.isArray(data.predictions) || data.predictions.length === 0 || !Array.isArray(data.predictions[0])) {
      console.error("[performDiseaseDetection] Invalid response format from Flask API. Data received:", data);
      throw new Error('Invalid response format from Flask API. Expected { "predictions": [[...probabilities...]] }.');
    }

    const probabilities: number[] = data.predictions[0];

    if (DISEASE_LABELS.length === 0) {
        console.error("[performDiseaseDetection] CRITICAL CONFIGURATION ERROR: DISEASE_LABELS array is empty. Please populate it in src/lib/constants.ts");
        throw new Error("Configuration error: DISEASE_LABELS is empty. Cannot map model output to names.");
    }
    if (probabilities.length !== DISEASE_LABELS.length) {
        console.error(
            `[performDiseaseDetection] CRITICAL CONFIGURATION ERROR: Mismatch between probabilities received from model via Flask (${probabilities.length}) and DISEASE_LABELS defined in src/lib/constants.ts (${DISEASE_LABELS.length}).` +
            ` Ensure DISEASE_LABELS matches your model's output classes exactly.`
        );
        throw new Error(
            'Configuration error: Model output classes count does not match defined labels count.'
        );
    }

    let highestConfidence = 0;
    let predictedIndex = -1;

    probabilities.forEach((prob, index) => {
      if (prob > highestConfidence) {
        highestConfidence = prob;
        predictedIndex = index;
      }
    });

    if (predictedIndex === -1) {
      console.error("[performDiseaseDetection] Could not determine prediction from model output (all probabilities might be zero or invalid). Probabilities:", probabilities);
      throw new Error('Could not determine prediction from model output.');
    }

    const predictedDiseaseName = DISEASE_LABELS[predictedIndex];

    console.log(`[performDiseaseDetection] Flask API Prediction: ${predictedDiseaseName}, Confidence: ${highestConfidence}`);

    return {
      diseaseName: predictedDiseaseName,
      confidence: highestConfidence,
    };

  } catch (error: any) {
    console.error("[performDiseaseDetection] CRITICAL ERROR in disease detection (Flask API call or processing) block:", error);

    let message = "An unknown error occurred during the disease detection process via Flask API.";
    if (error instanceof Error) {
      message = error.message;
      if (error.name === 'TypeError' && (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('networkerror'))) {
        message = `Network error or issue connecting to the Flask API at ${FLASK_API_URL}. Ensure the Flask server is running, accessible, and there are no CORS issues if applicable. Original error: ${message}`;
      }
    } else if (typeof error === 'string') {
      message = error;
    }
    throw new Error(`Disease detection failed: ${message}`);
  }
}
