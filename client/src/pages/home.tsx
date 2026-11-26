import { useState } from "react";
import { Upload, Droplets, Leaf, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UploadZone } from "@/components/upload-zone";
import { AnalysisProgress } from "@/components/analysis-progress";
import { ResultsDashboard } from "@/components/results-dashboard";
import { DatasetResults } from "@/components/dataset-results";
import { useToast } from "@/hooks/use-toast";
import { type DiseaseAnalysis } from "@shared/schema";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [analysisData, setAnalysisData] = useState<DiseaseAnalysis | null>(null);
  const [datasetData, setDatasetData] = useState<any>(null);
  const [uploadMode, setUploadMode] = useState<'single' | 'dataset'>('single');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setIsAnalyzing(true);
    setCurrentStep('analyzing');

    try {
      const formData = new FormData();
      
      if (uploadMode === 'single') {
        formData.append('image', files[0]);
        
        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Analysis failed');
        }

        const result = await response.json();
        setAnalysisData(result);
        setDatasetData(null);
      } else {
        files.forEach(file => {
          formData.append('images', file);
        });

        const response = await fetch('/api/analyze-dataset', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Dataset analysis failed');
        }

        const result = await response.json();
        setDatasetData(result);
        setAnalysisData(null);
      }

      setCurrentStep('results');
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${files.length} image${files.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive",
      });
      setCurrentStep('upload');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setAnalysisData(null);
    setDatasetData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Plant Disease Detection</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Analysis System</p>
              </div>
            </div>
            {currentStep === 'results' && (
              <Button onClick={handleReset} variant="outline" data-testid="button-analyze-another">
                <Upload className="mr-2 h-4 w-4" />
                Analyze Another
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      {currentStep !== 'upload' && (
        <div className="border-b bg-card/50 sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep === 'analyzing' || currentStep === 'results' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Upload</span>
              </div>
              
              <div className="h-px flex-1 bg-border mx-4" />
              
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep === 'analyzing' 
                    ? 'bg-primary text-primary-foreground animate-pulse' 
                    : currentStep === 'results'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">AI Analysis</span>
              </div>
              
              <div className="h-px flex-1 bg-border mx-4" />
              
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep === 'results' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium">Results</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {currentStep === 'upload' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-semibold text-foreground">
                Detect Plant Diseases with AI
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Upload plant images for instant disease detection using advanced AI models. 
                Get detailed analysis, confidence scores, and treatment recommendations.
              </p>
            </div>

            {/* Mode Selection */}
            <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as 'single' | 'dataset')} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="single" data-testid="tab-single-image">Single Image</TabsTrigger>
                <TabsTrigger value="dataset" data-testid="tab-dataset">Dataset Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="single" className="mt-8">
                <UploadZone 
                  mode="single" 
                  onUpload={handleFileUpload}
                />
              </TabsContent>
              
              <TabsContent value="dataset" className="mt-8">
                <UploadZone 
                  mode="dataset" 
                  onUpload={handleFileUpload}
                />
              </TabsContent>
            </Tabs>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <Card>
                <CardHeader className="space-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary mb-2">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Dual AI Analysis</CardTitle>
                  <CardDescription>
                    Combines AI and CNN models for highly accurate disease detection
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="space-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary mb-2">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Detailed Insights</CardTitle>
                  <CardDescription>
                    Get comprehensive analysis with causes, symptoms, and prevention strategies
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="space-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary mb-2">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Care Recommendations</CardTitle>
                  <CardDescription>
                    Receive specific water, soil, and nutrient requirements for treatment
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}

        {currentStep === 'analyzing' && (
          <div className="max-w-4xl mx-auto">
            <AnalysisProgress />
          </div>
        )}

        {currentStep === 'results' && (
          <>
            {analysisData && (
              <ResultsDashboard analysis={analysisData} onReset={handleReset} />
            )}
            {datasetData && (
              <DatasetResults data={datasetData} onReset={handleReset} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
