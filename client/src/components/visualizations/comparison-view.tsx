import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type GeminiAnalysisResult, type CNNAnalysisResult } from "@shared/schema";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface ComparisonViewProps {
  geminiResult: GeminiAnalysisResult;
  cnnResult: CNNAnalysisResult;
}

export function ComparisonView({ geminiResult, cnnResult }: ComparisonViewProps) {
  const agreement = geminiResult.disease.toLowerCase() === cnnResult.disease.toLowerCase();
  const confidenceDiff = Math.abs(geminiResult.confidence - cnnResult.confidence) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Agreement Analysis</CardTitle>
        <CardDescription>Comparing predictions from both AI models</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agreement Status */}
        <div className="flex items-center justify-between p-4 rounded-md bg-muted/50 border">
          <div className="flex items-center gap-3">
            {agreement ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Models Agree</p>
                  <p className="text-sm text-muted-foreground">Both identified: {geminiResult.disease}</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Different Predictions</p>
                  <p className="text-sm text-muted-foreground">Models identified different diseases</p>
                </div>
              </>
            )}
          </div>
          <Badge variant={agreement ? "default" : "destructive"}>
            {agreement ? "High Reliability" : "Review Needed"}
          </Badge>
        </div>

        {/* Side by Side Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <h4 className="font-semibold text-foreground">AI Model</h4>
            </div>
            <div className="space-y-2 pl-5">
              <div>
                <p className="text-xs text-muted-foreground">Disease</p>
                <p className="font-medium text-foreground">{geminiResult.disease}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="font-medium text-foreground">{(geminiResult.confidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Severity</p>
                <Badge variant="outline" className="capitalize">{geminiResult.severity}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-2" />
              <h4 className="font-semibold text-foreground">CNN Model</h4>
            </div>
            <div className="space-y-2 pl-5">
              <div>
                <p className="text-xs text-muted-foreground">Disease</p>
                <p className="font-medium text-foreground">{cnnResult.disease}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="font-medium text-foreground">{(cnnResult.confidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Model Version</p>
                <Badge variant="outline">{cnnResult.modelVersion}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Difference */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Confidence Difference</span>
            <span className="text-sm font-semibold text-foreground">{confidenceDiff.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-chart-2 transition-all duration-500"
              style={{ width: `${Math.min(confidenceDiff, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {confidenceDiff < 5 ? "Very similar confidence levels" : confidenceDiff < 15 ? "Moderately similar confidence" : "Significantly different confidence levels"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
