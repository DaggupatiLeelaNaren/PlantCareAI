import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export interface DiseaseAnalysis {
  id: string;
  fileName: string;
  uploadedAt: string;
  geminiResult: GeminiAnalysisResult;
  cnnResult: CNNAnalysisResult;
  status: 'uploading' | 'analyzing' | 'complete' | 'error';
  errorMessage?: string;
}

export interface GeminiAnalysisResult {
  disease: string;
  confidence: number;
  scientificName?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface CNNAnalysisResult {
  disease: string;
  confidence: number;
  predictions: PredictionScore[];
  modelVersion: string;
}

export interface PredictionScore {
  disease: string;
  confidence: number;
}

export interface DiseaseInformation {
  name: string;
  scientificName?: string;
  causes: string[];
  symptoms: string[];
  prevention: string[];
  treatment: TreatmentRecommendation[];
  careRequirements: CareRequirements;
}

export interface TreatmentRecommendation {
  priority: 'critical' | 'important' | 'suggested';
  action: string;
  description: string;
  timeline?: string;
}

export interface CareRequirements {
  waterFrequency: string;
  waterAmount: string;
  soilType: string;
  soilPH: string;
  nutrients: string[];
  sunlight: string;
  temperature: string;
  humidity: string;
}

export interface ConfusionMatrixData {
  labels: string[];
  matrix: number[][];
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface DatasetAnalysis {
  id: string;
  totalImages: number;
  analyzedAt: string;
  overallAccuracy: number;
  diseaseDistribution: { disease: string; count: number; percentage: number }[];
  confusionMatrix: ConfusionMatrixData;
  performanceMetrics: {
    geminiAccuracy: number;
    cnnAccuracy: number;
    agreementRate: number;
  };
  status: 'processing' | 'complete' | 'error';
}

export const analysisResultSchema = z.object({
  disease: z.string(),
  confidence: z.number().min(0).max(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  description: z.string().optional(),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
