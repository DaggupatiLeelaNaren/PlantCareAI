import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Brain, Network, CheckCircle2 } from "lucide-react";

export function AnalysisProgress() {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<'upload' | 'gemini' | 'cnn' | 'processing'>('upload');

  useEffect(() => {
    const stages = [
      { name: 'upload', duration: 1000, progress: 25 },
      { name: 'gemini', duration: 3000, progress: 50 },
      { name: 'cnn', duration: 3000, progress: 75 },
      { name: 'processing', duration: 2000, progress: 100 },
    ];

    let currentIndex = 0;

    const advanceStage = () => {
      if (currentIndex < stages.length) {
        const stage = stages[currentIndex];
        setCurrentStage(stage.name as any);
        
        let currentProgress = currentIndex === 0 ? 0 : stages[currentIndex - 1].progress;
        const targetProgress = stage.progress;
        const increment = (targetProgress - currentProgress) / (stage.duration / 50);

        const progressInterval = setInterval(() => {
          currentProgress += increment;
          if (currentProgress >= targetProgress) {
            currentProgress = targetProgress;
            clearInterval(progressInterval);
          }
          setProgress(currentProgress);
        }, 50);

        currentIndex++;
        if (currentIndex < stages.length) {
          setTimeout(advanceStage, stage.duration);
        }
      }
    };

    advanceStage();
  }, []);

  const stages = [
    {
      id: 'upload',
      name: 'Image Upload',
      description: 'Processing image data',
      icon: CheckCircle2,
      active: currentStage === 'upload',
      complete: progress > 25,
    },
    {
      id: 'gemini',
      name: 'AI Model Analysis',
      description: 'Analyzing with multimodal AI',
      icon: Brain,
      active: currentStage === 'gemini',
      complete: progress > 50,
    },
    {
      id: 'cnn',
      name: 'CNN Model Processing',
      description: 'Deep learning classification',
      icon: Network,
      active: currentStage === 'cnn',
      complete: progress > 75,
    },
    {
      id: 'processing',
      name: 'Finalizing Results',
      description: 'Generating comprehensive report',
      icon: CheckCircle2,
      active: currentStage === 'processing',
      complete: progress === 100,
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Analyzing Plant Disease
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-analysis" />
          </div>

          <div className="space-y-4 pt-4">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.id}
                  className={`flex items-start gap-4 p-4 rounded-md transition-all ${
                    stage.active 
                      ? 'bg-primary/10 border border-primary/20' 
                      : stage.complete 
                      ? 'bg-muted/50' 
                      : 'opacity-50'
                  }`}
                  data-testid={`stage-${stage.id}`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    stage.complete 
                      ? 'bg-primary text-primary-foreground' 
                      : stage.active
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {stage.active ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : stage.complete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">{stage.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          This typically takes 10-15 seconds. Please wait while we analyze your plant image.
        </p>
      </div>
    </div>
  );
}
