
import type { CropOption, MockDiseaseInfo } from './types';

export const APP_NAME = "Krishi Rakshak";

// Updated CROP_OPTIONS based on PlantVillage-like dataset coverage
// Values now match keys expected by Flask's CROP_NAME_TO_INDEX mapping
export const CROP_OPTIONS: CropOption[] = [
  { value: 'Apple', label: 'Apple' },
  { value: 'Blueberry', label: 'Blueberry' },
  { value: 'Cherry_(including_sour)', label: 'Cherry (including sour)' },
  { value: 'Corn_(maize)', label: 'Corn (maize) (ಮೆಕ್ಕೆಜೋಳ)' },
  { value: 'Grape', label: 'Grape' },
  { value: 'Orange', label: 'Orange' },
  { value: 'Peach', label: 'Peach' },
  { value: 'Pepper,_bell', label: 'Pepper, bell' },
  { value: 'Potato', label: 'Potato' },
  { value: 'Raspberry', label: 'Raspberry' },
  { value: 'Soybean', label: 'Soybean' },
  { value: 'Squash', label: 'Squash' },
  { value: 'Strawberry', label: 'Strawberry' },
  { value: 'Tomato', label: 'Tomato' },
];

// Flask API Endpoint
export const FLASK_API_URL = 'http://localhost:5000/predict';

// IMPORTANT: Populate this array with your disease labels.
// The order MUST EXACTLY MATCH the output order of your TensorFlow model's prediction array.
export const DISEASE_LABELS: string[] = [
  "Apple___Apple_scab",
  "Apple___Black_rot",
  "Apple___Cedar_apple_rust",
  "Apple___healthy",
  "Blueberry___healthy",
  "Cherry_(including_sour)___Powdery_mildew",
  "Cherry_(including_sour)___healthy",
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
  "Corn_(maize)___Common_rust_",
  "Corn_(maize)___Northern_Leaf_Blight",
  "Corn_(maize)___healthy",
  "Grape___Black_rot",
  "Grape___Esca_(Black_Measles)",
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
  "Grape___healthy",
  "Orange___Haunglongbing_(Citrus_greening)",
  "Peach___Bacterial_spot",
  "Peach___healthy",
  "Pepper,_bell___Bacterial_spot",
  "Pepper,_bell___healthy",
  "Potato___Early_blight",
  "Potato___Late_blight",
  "Potato___healthy",
  "Raspberry___healthy",
  "Soybean___healthy",
  "Squash___Powdery_mildew",
  "Strawberry___Leaf_scorch",
  "Strawberry___healthy",
  "Tomato___Bacterial_spot",
  "Tomato___Early_blight",
  "Tomato___Late_blight",
  "Tomato___Leaf_Mold",
  "Tomato___Septoria_leaf_spot",
  "Tomato___Spider_mites Two-spotted_spider_mite",
  "Tomato___Target_Spot",
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
  "Tomato___Tomato_mosaic_virus",
  "Tomato___healthy"
];


export const MOCK_DISEASES: Record<string, MockDiseaseInfo> = {
  'Corn_(maize)': { name: 'Maize Common Rust', confidence: 0.15, imageHints: ["maize disease", "plant rust"] },
  'Apple': { name: 'Apple Scab', confidence: 0.20, imageHints: ["apple disease", "fruit tree"] },
  'Tomato': { name: 'Tomato Late Blight', confidence: 0.22, imageHints: ["tomato disease", "vegetable garden"] },
  // Add other mock diseases for new crop types as needed
};

export const TREATMENT_ADVICE: Record<string, string> = {
  general: "General advice: Ensure proper field sanitation, use disease-resistant varieties if available, and ensure balanced fertilization. For specific chemical treatments, consult a local agricultural extension office.",
  'Corn_(maize)': "For Maize Common Rust: While often not requiring chemical control in commercial maize, severe infections can be managed with fungicides like Propiconazole or Mancozeb. Plant resistant hybrids where possible.",
  'Apple': "For Apple diseases like Scab or Rust: Pruning, proper sanitation, and timely fungicide applications (e.g., myclobutanil, captan) are key. Consult local guidance for specific recommendations.",
  'Tomato': "For Tomato diseases like Blight or Spot: Ensure good air circulation, avoid overhead watering, rotate crops, and use appropriate fungicides (e.g., copper-based, chlorothalonil) if needed, following expert advice.",
  // Add other treatment advice for new crop types as needed
};

export const DISEASE_DISCLAIMER =
  "Disclaimer: This tool provides preliminary suggestions and is not a substitute for professional agricultural advice. Disease patterns can vary by location and conditions. Always consult with a local agricultural expert or extension office for an accurate diagnosis and treatment plan.";

export const IMAGE_DESCRIPTION_FOR_AI = "A close-up image of a plant leaf, potentially showing signs of disease like discoloration or spots.";
