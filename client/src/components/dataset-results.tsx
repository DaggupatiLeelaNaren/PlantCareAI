import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, TrendingUp, PieChart, CheckCircle2 } from "lucide-react";

interface DatasetResultsProps {
  data: any;
  onReset: () => void;
}

export function DatasetResults({ data, onReset }: DatasetResultsProps) {
  const { totalImages, diseaseDistribution, performanceMetrics, analyses } = data;

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-2xl">Dataset Analysis Complete</CardTitle>
              <p className="text-muted-foreground">
                Analyzed {totalImages} images across multiple disease categories
              </p>
            </div>
            <Button variant="outline" onClick={onReset} data-testid="button-new-dataset-analysis">
              <Upload className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Images</p>
              <p className="text-3xl font-bold text-foreground">{totalImages}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Overall Accuracy</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground">
                  {(data.overallAccuracy * 100).toFixed(1)}%
                </p>
                <Badge variant="default" className="h-6">
                  Excellent
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Model Agreement</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground">
                  {(performanceMetrics.agreementRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disease Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Disease Distribution</CardTitle>
          </div>
          <CardDescription>Breakdown of diseases found across the dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {diseaseDistribution.map((item: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{item.disease}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{item.count} images</span>
                    <span className="text-sm font-semibold text-foreground">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Performance</CardTitle>
            <CardDescription>Average confidence across all images</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {(performanceMetrics.geminiAccuracy * 100).toFixed(1)}%
                </span>
                <Badge variant="default">High Accuracy</Badge>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${performanceMetrics.geminiAccuracy * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CNN Model Performance</CardTitle>
            <CardDescription>Average confidence across all images</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {(performanceMetrics.cnnAccuracy * 100).toFixed(1)}%
                </span>
                <Badge variant="default">High Accuracy</Badge>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-2 transition-all duration-700"
                  style={{ width: `${performanceMetrics.cnnAccuracy * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Results */}
      {analyses && analyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Image Results</CardTitle>
            <CardDescription>Detailed analysis for each image in the dataset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analyses.map((analysis: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-md border bg-card hover-elevate"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{analysis.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {analysis.geminiResult.disease}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Confidence</p>
                      <p className="text-sm font-semibold text-foreground">
                        {(analysis.geminiResult.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    {analysis.geminiResult.disease.toLowerCase() === 
                     analysis.cnnResult.disease.toLowerCase() && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
