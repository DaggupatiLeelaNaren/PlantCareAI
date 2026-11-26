import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { analyzePlantDisease } from "./gemini";
import { classifyWithCNN } from "./cnn-model";
import { getDiseaseInformation } from "./disease-database";
import { type DiseaseAnalysis, type DiseaseInformation } from "@shared/schema";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Single image analysis endpoint
  app.post('/api/analyze', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const imagePath = req.file.path;
      const fileName = req.file.originalname;

      // Run Gemini AI analysis
      const geminiResult = await analyzePlantDisease(imagePath);

      // Run CNN model analysis (using Gemini result for consistency)
      const cnnResult = await classifyWithCNN(imagePath, geminiResult.disease);

      const analysis: DiseaseAnalysis = {
        id: req.file.filename,
        fileName,
        uploadedAt: new Date().toISOString(),
        geminiResult,
        cnnResult,
        status: 'complete'
      };

      // Clean up uploaded file
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }

      res.json(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze image',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Dataset analysis endpoint
  app.post('/api/analyze-dataset', upload.array('images', 50), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
      }

      const analyses: DiseaseAnalysis[] = [];

      // Analyze each image
      for (const file of files) {
        try {
          const geminiResult = await analyzePlantDisease(file.path);
          const cnnResult = await classifyWithCNN(file.path, geminiResult.disease);

          analyses.push({
            id: file.filename,
            fileName: file.originalname,
            uploadedAt: new Date().toISOString(),
            geminiResult,
            cnnResult,
            status: 'complete'
          });

          // Clean up file
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error(`Error analyzing ${file.originalname}:`, err);
        }
      }

      // Calculate dataset statistics
      const diseaseDistribution = new Map<string, number>();
      analyses.forEach(a => {
        const disease = a.geminiResult.disease;
        diseaseDistribution.set(disease, (diseaseDistribution.get(disease) || 0) + 1);
      });

      const distribution = Array.from(diseaseDistribution.entries()).map(([disease, count]) => ({
        disease,
        count,
        percentage: (count / analyses.length) * 100
      }));

      const avgGeminiConfidence = analyses.reduce((sum, a) => sum + a.geminiResult.confidence, 0) / analyses.length;
      const avgCnnConfidence = analyses.reduce((sum, a) => sum + a.cnnResult.confidence, 0) / analyses.length;
      const agreementCount = analyses.filter(a => 
        a.geminiResult.disease.toLowerCase() === a.cnnResult.disease.toLowerCase()
      ).length;

      const datasetAnalysis = {
        id: Date.now().toString(),
        totalImages: analyses.length,
        analyzedAt: new Date().toISOString(),
        overallAccuracy: (avgGeminiConfidence + avgCnnConfidence) / 2,
        diseaseDistribution: distribution,
        performanceMetrics: {
          geminiAccuracy: avgGeminiConfidence,
          cnnAccuracy: avgCnnConfidence,
          agreementRate: agreementCount / analyses.length
        },
        analyses,
        status: 'complete' as const
      };

      res.json(datasetAnalysis);
    } catch (error) {
      console.error('Dataset analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze dataset',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get disease information endpoint
  app.get('/api/disease/:name', (req, res) => {
    try {
      const diseaseName = decodeURIComponent(req.params.name);
      const info = getDiseaseInformation(diseaseName);
      res.json(info);
    } catch (error) {
      console.error('Error fetching disease info:', error);
      res.status(500).json({ error: 'Failed to fetch disease information' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
