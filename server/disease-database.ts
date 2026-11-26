import { type DiseaseInformation } from "@shared/schema";

// Comprehensive disease information database
export const diseaseDatabase: Record<string, DiseaseInformation> = {
  'Tomato Late Blight': {
    name: 'Tomato Late Blight',
    scientificName: 'Phytophthora infestans',
    causes: [
      'Fungal pathogen spread through air and water',
      'High humidity (>90%) and moderate temperatures (60-70°F)',
      'Poor air circulation around plants',
      'Infected plant debris or contaminated soil',
      'Overhead watering that keeps foliage wet'
    ],
    symptoms: [
      'Dark brown or black spots on leaves with white fungal growth',
      'Water-soaked lesions on stems and fruit',
      'Yellowing and rapid wilting of affected leaves',
      'Gray-white mold on leaf undersides during humid conditions',
      'Rapid disease spread, especially after rain or heavy dew'
    ],
    prevention: [
      'Plant disease-resistant tomato varieties',
      'Ensure proper spacing (24-36 inches) for air circulation',
      'Water at soil level early in the morning',
      'Apply preventive copper-based fungicides before disease appears',
      'Remove and destroy infected plant material immediately',
      'Practice crop rotation, avoid planting tomatoes in same location'
    ],
    treatment: [
      {
        priority: 'critical',
        action: 'Remove Infected Parts',
        description: 'Immediately prune and destroy all infected leaves, stems, and fruit. Do not compost.',
        timeline: 'Within 24 hours'
      },
      {
        priority: 'critical',
        action: 'Apply Fungicide',
        description: 'Use copper-based fungicide or chlorothalonil. Spray thoroughly, including undersides of leaves.',
        timeline: 'Immediately, repeat every 7-10 days'
      },
      {
        priority: 'important',
        action: 'Improve Drainage',
        description: 'Ensure proper soil drainage and avoid waterlogged conditions.',
        timeline: 'Within 2-3 days'
      }
    ],
    careRequirements: {
      waterFrequency: '2-3 times per week',
      waterAmount: '1-1.5 inches per week',
      soilType: 'Well-draining loamy soil rich in organic matter',
      soilPH: '6.0 - 6.8',
      nutrients: ['Balanced NPK (10-10-10)', 'Calcium for cell wall strength', 'Potassium for disease resistance'],
      sunlight: '6-8 hours of direct sunlight daily',
      temperature: '65-85°F (18-29°C) optimal',
      humidity: 'Below 85% to prevent fungal spread'
    }
  },
  'Tomato Early Blight': {
    name: 'Tomato Early Blight',
    scientificName: 'Alternaria solani',
    causes: [
      'Fungal pathogen that survives in soil and plant debris',
      'Warm temperatures (75-85°F) with high humidity',
      'Stressed plants due to nutrient deficiency or drought',
      'Splash from rain or irrigation spreading spores',
      'Lack of crop rotation'
    ],
    symptoms: [
      'Dark brown spots with concentric rings (target-like pattern)',
      'Lower leaves affected first, progressing upward',
      'Yellowing around lesions, eventual leaf drop',
      'Stem lesions with similar concentric rings',
      'Fruit spots near stem end with dark, leathery texture'
    ],
    prevention: [
      'Use disease-resistant varieties when possible',
      'Mulch around plants to prevent soil splash',
      'Space plants adequately for air circulation',
      'Remove lower leaves to reduce contact with soil',
      'Rotate crops every 2-3 years'
    ],
    treatment: [
      {
        priority: 'important',
        action: 'Remove Affected Foliage',
        description: 'Prune lower infected leaves and dispose properly.',
        timeline: 'As soon as symptoms appear'
      },
      {
        priority: 'important',
        action: 'Apply Fungicide',
        description: 'Use copper-based or chlorothalonil fungicide on healthy tissue.',
        timeline: 'Weekly applications'
      }
    ],
    careRequirements: {
      waterFrequency: '2-3 times per week',
      waterAmount: '1-2 inches per week',
      soilType: 'Well-draining with organic compost',
      soilPH: '6.2 - 6.8',
      nutrients: ['Balanced fertilizer', 'Extra potassium for resistance', 'Avoid excess nitrogen'],
      sunlight: '6-8 hours daily',
      temperature: '70-80°F (21-27°C)',
      humidity: 'Moderate, below 80%'
    }
  },
  'Powdery Mildew': {
    name: 'Powdery Mildew',
    scientificName: 'Various species (Erysiphales)',
    causes: [
      'Fungal disease thriving in warm, dry days and cool nights',
      'Poor air circulation and crowded plant spacing',
      'Shade and high humidity levels',
      'Stressed plants from drought or poor nutrition',
      'Overhead watering creating moist leaf surfaces'
    ],
    symptoms: [
      'White powdery spots on leaves and stems',
      'Growth starts on upper leaf surfaces',
      'Leaves may curl, yellow, and become distorted',
      'Reduced photosynthesis and plant vigor',
      'Eventual leaf drop and reduced fruit quality'
    ],
    prevention: [
      'Plant in full sun with good air flow',
      'Space plants properly (follow variety guidelines)',
      'Water at base of plants in morning',
      'Apply sulfur or potassium bicarbonate preventively',
      'Choose resistant plant varieties'
    ],
    treatment: [
      {
        priority: 'important',
        action: 'Remove Affected Parts',
        description: 'Prune heavily infected leaves and improve air circulation.',
        timeline: 'Immediately upon detection'
      },
      {
        priority: 'important',
        action: 'Apply Fungicide',
        description: 'Use sulfur-based spray or neem oil. Apply to all plant surfaces.',
        timeline: 'Every 7-14 days until controlled'
      },
      {
        priority: 'suggested',
        action: 'Baking Soda Spray',
        description: 'Mix 1 tbsp baking soda + 1 tsp dish soap in 1 gallon water. Spray weekly.',
        timeline: 'Weekly preventive treatment'
      }
    ],
    careRequirements: {
      waterFrequency: '2-3 times per week',
      waterAmount: '1 inch per week',
      soilType: 'Well-draining, amended with compost',
      soilPH: '6.0 - 7.0',
      nutrients: ['Moderate nitrogen', 'Adequate phosphorus and potassium'],
      sunlight: '6-8 hours of direct sun',
      temperature: '60-80°F (15-27°C)',
      humidity: 'Below 70% ideal'
    }
  },
  'Bacterial Spot': {
    name: 'Bacterial Spot',
    scientificName: 'Xanthomonas species',
    causes: [
      'Bacterial pathogen spread by water splash and wind',
      'Warm, wet weather conditions',
      'Contaminated seeds or transplants',
      'Wounds from insects or mechanical damage',
      'Poor sanitation and infected plant debris'
    ],
    symptoms: [
      'Small, dark brown spots with yellow halos on leaves',
      'Spots may have water-soaked appearance',
      'Severe infection causes leaf yellowing and drop',
      'Fruit spots that are raised with white halos',
      'Reduced fruit quality and yield'
    ],
    prevention: [
      'Use certified disease-free seeds and transplants',
      'Avoid overhead irrigation',
      'Practice crop rotation (3-year minimum)',
      'Remove and destroy infected plants',
      'Disinfect tools between plants'
    ],
    treatment: [
      {
        priority: 'critical',
        action: 'Remove Infected Plants',
        description: 'Pull and destroy severely infected plants to prevent spread.',
        timeline: 'Immediately'
      },
      {
        priority: 'important',
        action: 'Apply Copper Spray',
        description: 'Use copper-based bactericide. Apply before rain events.',
        timeline: 'Every 7-10 days during wet periods'
      }
    ],
    careRequirements: {
      waterFrequency: '2-3 times per week',
      waterAmount: '1-1.5 inches per week',
      soilType: 'Well-draining with good organic content',
      soilPH: '6.0 - 6.8',
      nutrients: ['Balanced NPK', 'Calcium for cell walls', 'Avoid excess nitrogen'],
      sunlight: '6-8 hours daily',
      temperature: '75-85°F (24-29°C)',
      humidity: 'Keep below 80%'
    }
  },
  'Healthy': {
    name: 'Healthy Plant',
    causes: [],
    symptoms: [
      'Vibrant green foliage',
      'Strong, upright growth',
      'No visible spots, lesions, or discoloration',
      'Active new growth'
    ],
    prevention: [
      'Maintain consistent watering schedule',
      'Provide balanced nutrition',
      'Ensure adequate sunlight',
      'Monitor regularly for early signs of stress',
      'Practice good garden hygiene'
    ],
    treatment: [
      {
        priority: 'suggested',
        action: 'Maintain Current Care',
        description: 'Continue your current care routine as it is working well.',
        timeline: 'Ongoing'
      }
    ],
    careRequirements: {
      waterFrequency: '2-3 times per week',
      waterAmount: '1-1.5 inches per week',
      soilType: 'Well-draining, nutrient-rich',
      soilPH: '6.0 - 7.0',
      nutrients: ['Balanced fertilizer (10-10-10)', 'Organic compost'],
      sunlight: '6-8 hours daily',
      temperature: '65-80°F (18-27°C)',
      humidity: '40-70%'
    }
  }
};

export function getDiseaseInformation(diseaseName: string): DiseaseInformation {
  // Try exact match first
  if (diseaseDatabase[diseaseName]) {
    return diseaseDatabase[diseaseName];
  }

  // Try partial match
  const partialMatch = Object.keys(diseaseDatabase).find(key => 
    key.toLowerCase().includes(diseaseName.toLowerCase()) ||
    diseaseName.toLowerCase().includes(key.toLowerCase())
  );

  if (partialMatch) {
    return diseaseDatabase[partialMatch];
  }

  // Return a generic disease template if no match found
  return {
    name: diseaseName,
    causes: [
      'Environmental stress factors',
      'Pathogen infection',
      'Poor growing conditions'
    ],
    symptoms: [
      'Visible discoloration or spots',
      'Changes in plant growth pattern',
      'Leaf or stem damage'
    ],
    prevention: [
      'Maintain optimal growing conditions',
      'Practice good garden hygiene',
      'Monitor plants regularly',
      'Ensure proper spacing and air circulation'
    ],
    treatment: [
      {
        priority: 'important',
        action: 'Consult Plant Expert',
        description: 'For uncommon diseases, consult with a local agricultural extension office.',
        timeline: 'As soon as possible'
      }
    ],
    careRequirements: {
      waterFrequency: '2-3 times per week',
      waterAmount: '1-1.5 inches per week',
      soilType: 'Well-draining soil',
      soilPH: '6.0 - 7.0',
      nutrients: ['Balanced fertilizer'],
      sunlight: '6-8 hours daily',
      temperature: '65-80°F',
      humidity: 'Moderate (50-70%)'
    }
  };
}
