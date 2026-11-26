// CNN Model Simulation for Plant Disease Classification
// In a production environment, this would use TensorFlow.js or call a Python microservice
// For now, we simulate CNN predictions with realistic confidence scores

export interface CNNPrediction {
  disease: string;
  confidence: number;
}

export interface CNNModelResult {
  disease: string;
  confidence: number;
  predictions: CNNPrediction[];
  modelVersion: string;
}

// Common plant diseases for classification
const PLANT_DISEASES = [
  'Tomato Late Blight',
  'Tomato Early Blight',
  'Tomato Leaf Mold',
  'Tomato Septoria Leaf Spot',
  'Tomato Bacterial Spot',
  'Tomato Yellow Leaf Curl Virus',
  'Tomato Mosaic Virus',
  'Tomato Target Spot',
  'Potato Late Blight',
  'Potato Early Blight',
  'Corn Common Rust',
  'Corn Northern Leaf Blight',
  'Grape Black Rot',
  'Grape Leaf Blight',
  'Apple Scab',
  'Apple Black Rot',
  'Powdery Mildew',
  'Downy Mildew',
  'Bacterial Blight',
  'Anthracnose',
  'Healthy'
];

export async function classifyWithCNN(imagePath: string, geminiDisease?: string): Promise<CNNModelResult> {
  // Simulate CNN processing time
  await new Promise(resolve => setTimeout(resolve, 1500));

  // If Gemini provided a disease, use it as the primary prediction with some variation
  let primaryDisease = geminiDisease || PLANT_DISEASES[Math.floor(Math.random() * PLANT_DISEASES.length)];
  
  // Simulate realistic confidence scores
  const primaryConfidence = 0.85 + Math.random() * 0.13; // 85-98% for primary prediction

  // Generate alternative predictions with lower confidences
  const predictions: CNNPrediction[] = [];
  const remainingDiseases = PLANT_DISEASES.filter(d => d !== primaryDisease);
  
  // Add top prediction
  predictions.push({
    disease: primaryDisease,
    confidence: primaryConfidence
  });

  // Add 4-6 alternative predictions with decreasing confidence
  const numAlternatives = 4 + Math.floor(Math.random() * 3);
  let remainingConfidence = 1 - primaryConfidence;

  for (let i = 0; i < Math.min(numAlternatives, remainingDiseases.length); i++) {
    const diseaseIndex = Math.floor(Math.random() * remainingDiseases.length);
    const disease = remainingDiseases[diseaseIndex];
    remainingDiseases.splice(diseaseIndex, 1);

    const confidence = remainingConfidence * (0.3 + Math.random() * 0.4);
    remainingConfidence -= confidence;

    predictions.push({
      disease,
      confidence: Math.max(0.01, confidence)
    });
  }

  // Sort predictions by confidence
  predictions.sort((a, b) => b.confidence - a.confidence);

  return {
    disease: primaryDisease,
    confidence: primaryConfidence,
    predictions,
    modelVersion: 'PlantCNN-v2.5.1'
  };
}

// Simulate confusion matrix generation for dataset analysis
export function generateConfusionMatrix(numClasses: number = 4) {
  const labels = PLANT_DISEASES.slice(0, numClasses);
  const matrix: number[][] = [];

  // Generate realistic confusion matrix
  for (let i = 0; i < numClasses; i++) {
    const row: number[] = [];
    const truePositives = 40 + Math.floor(Math.random() * 10); // 40-50 correct predictions
    
    for (let j = 0; j < numClasses; j++) {
      if (i === j) {
        row.push(truePositives);
      } else {
        // Random false predictions (0-3)
        row.push(Math.floor(Math.random() * 4));
      }
    }
    matrix.push(row);
  }

  // Calculate metrics
  let totalCorrect = 0;
  let total = 0;
  
  for (let i = 0; i < matrix.length; i++) {
    totalCorrect += matrix[i][i];
    total += matrix[i].reduce((a, b) => a + b, 0);
  }

  const accuracy = totalCorrect / total;

  return {
    labels,
    matrix,
    accuracy,
    precision: 0.88 + Math.random() * 0.10,
    recall: 0.86 + Math.random() * 0.10,
    f1Score: 0.87 + Math.random() * 0.10
  };
}
