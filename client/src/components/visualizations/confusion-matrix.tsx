import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ConfusionMatrixProps {
  data?: {
    labels: string[];
    matrix: number[][];
    accuracy: number;
  };
}

export function ConfusionMatrix({ data }: ConfusionMatrixProps) {
  const mockData = data || {
    labels: ['Healthy', 'Blight', 'Rust', 'Mildew'],
    matrix: [
      [45, 2, 1, 0],
      [3, 42, 2, 1],
      [1, 2, 44, 1],
      [0, 1, 2, 45]
    ],
    accuracy: 0.92
  };

  const maxValue = Math.max(...mockData.matrix.flat());

  const getColorIntensity = (value: number) => {
    const intensity = value / maxValue;
    if (intensity > 0.8) return 'bg-primary text-primary-foreground';
    if (intensity > 0.5) return 'bg-primary/60 text-foreground';
    if (intensity > 0.2) return 'bg-primary/30 text-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confusion Matrix</CardTitle>
        <CardDescription>Model prediction accuracy visualization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="grid gap-1" style={{ gridTemplateColumns: `80px repeat(${mockData.labels.length}, 1fr)` }}>
                <div></div>
                {mockData.labels.map((label, idx) => (
                  <div key={idx} className="text-center text-xs font-semibold text-muted-foreground p-2">
                    {label}
                  </div>
                ))}
                
                {mockData.matrix.map((row, rowIdx) => (
                  <>
                    <div key={`label-${rowIdx}`} className="flex items-center text-xs font-semibold text-muted-foreground pr-2">
                      {mockData.labels[rowIdx]}
                    </div>
                    {row.map((value, colIdx) => (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className={`flex items-center justify-center p-3 rounded-md text-sm font-semibold transition-colors ${getColorIntensity(value)}`}
                      >
                        {value}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Overall Accuracy</p>
              <p className="text-2xl font-bold text-foreground">{(mockData.accuracy * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Samples</p>
              <p className="text-2xl font-bold text-foreground">{mockData.matrix.flat().reduce((a, b) => a + b, 0)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
