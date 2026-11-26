import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type GeminiAnalysisResult, type CNNAnalysisResult } from "@shared/schema";
import { Brain, Network } from "lucide-react";

interface ConfidenceChartProps {
  geminiResult: GeminiAnalysisResult;
  cnnResult: CNNAnalysisResult;
}

export function ConfidenceChart({ geminiResult, cnnResult }: ConfidenceChartProps) {
  const data = [
    {
      model: 'AI Model',
      confidence: geminiResult.confidence * 100,
      color: 'bg-primary',
      icon: Brain,
    },
    {
      model: 'CNN Model',
      confidence: cnnResult.confidence * 100,
      color: 'bg-chart-2',
      icon: Network,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confidence Comparison</CardTitle>
        <CardDescription>AI model confidence scores side-by-side</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.model} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{item.model}</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">{item.confidence.toFixed(1)}%</span>
                </div>
                <div className="relative h-8 bg-muted rounded-md overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-700 ease-out flex items-center justify-end pr-3`}
                    style={{ width: `${item.confidence}%` }}
                  >
                    {item.confidence > 15 && (
                      <span className="text-xs font-semibold text-white">{item.confidence.toFixed(1)}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Confidence</span>
              <span className="text-xl font-bold text-foreground">
                {((geminiResult.confidence + cnnResult.confidence) / 2 * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
