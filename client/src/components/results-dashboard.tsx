import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Brain, Network, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { type DiseaseAnalysis } from "@shared/schema";
import { ConfusionMatrix } from "@/components/visualizations/confusion-matrix";
import { ConfidenceChart } from "@/components/visualizations/confidence-chart";
import { ComparisonView } from "@/components/visualizations/comparison-view";
import { DiseaseInfo } from "@/components/disease-info";
import { TreatmentPanel } from "@/components/treatment-panel";
import { type DiseaseInformation } from "@shared/schema";

interface ResultsDashboardProps {
  analysis: DiseaseAnalysis;
  onReset: () => void;
}

export function ResultsDashboard({ analysis, onReset }: ResultsDashboardProps) {
  const { geminiResult, cnnResult } = analysis;
  
  const downloadReport = () => {
    try {
      const payload = {
        analysis,
        generatedAt: new Date().toISOString(),
      };

      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `plantcare-report-${analysis.id || Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // fallback: open in new tab so user can save manually
      const html = `<pre>${escapeHtml(JSON.stringify(analysis, null, 2))}</pre>`;
      const win = window.open();
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    }
  };

  // Render a simple HTML string for printing/fallback PDF export
  const renderReportHtml = (analysisObj: any, gemini: any, cnn: any, dd: any, treatmentsLocal: any[]) => {
    const safe = (s: any) => (s === undefined || s === null) ? '' : String(s);
    const preds = (cnn && Array.isArray(cnn.predictions)) ? cnn.predictions.slice(0, 10) : [];
    const treatments = treatmentsLocal || (dd && (dd as any).treatment) || [];

    // local disease type detection (same heuristic used in TreatmentPanel)
    const text = `${gemini?.description || ''} ${gemini?.disease || ''} ${(cnn && cnn.predictions ? cnn.predictions.map((p:any) => p.disease).join(' ') : '')}`.toLowerCase();
    const diseaseType = /fung|mildew|blight|spor|powdery|rust|phytophthora/.test(text)
      ? 'fungal'
      : /bacteri|bacterial|xanthomonas|pseudomonas|erwinia/.test(text)
        ? 'bacterial'
        : /virus|viral|mosaic|tospovirus|tobacco/.test(text)
          ? 'viral'
          : /nutrient|water stress|overwater|underwater|temperature stress|sunburn|salt/.test(text)
            ? 'physiological'
            : 'unknown';

    const synthCare: any = {};
    if (diseaseType === 'fungal') {
      synthCare.waterFrequency = 'Reduce to 1 time per week; water at soil level in morning';
      synthCare.waterAmount = 'Enough to moisten root zone; avoid wet foliage';
      synthCare.humidity = 'Below 60% if possible';
      synthCare.soilType = 'Well-draining, sandy-loam with good organic matter';
      synthCare.soilPH = '5.8 - 6.5';
    } else if (diseaseType === 'bacterial') {
      synthCare.waterFrequency = '2 times per week, avoid overhead watering';
      synthCare.waterAmount = 'Moderate amounts to keep soil moist but not waterlogged';
      synthCare.soilType = 'Well-draining loamy soil';
      synthCare.soilPH = '6.0 - 7.0';
    } else {
      synthCare.waterFrequency = '2-3 times per week';
      synthCare.waterAmount = '1-2 inches per week';
      synthCare.soilType = 'Well-draining loamy soil';
      synthCare.soilPH = '6.0 - 7.0';
    }
    synthCare.sunlight = diseaseType === 'viral' ? 'Indirect bright light, avoid heat stress' : '6-8 hours of indirect to partial sun';
    synthCare.temperature = diseaseType === 'bacterial' ? 'Avoid high humidity and prolonged warm wet conditions' : '65-75°F (18-24°C)';
    synthCare.humidity = diseaseType === 'fungal' ? '40-60%' : '40-70%';

    return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>PlantCareAI Report</title>
        <style>
          @page { size: A4; margin: 24mm }
          body { font-family: Inter, system-ui, Arial; color: #0f172a; padding: 0; margin: 0 }
          .page { padding: 18mm; box-sizing: border-box; }
          h1 { font-size: 22px; margin-bottom: 6px }
          h2 { font-size: 16px; margin-top: 12px }
          p { margin: 6px 0 }
          table { width: 100%; border-collapse: collapse; margin-top: 8px }
          th, td { text-align: left; padding: 6px; border-bottom: 1px solid #eee }
          .muted { color: #6b7280 }
          .small { font-size: 12px }
        </style>
      </head>
      <body>
        <div class="page">
          <h1>PlantCareAI — Analysis Report</h1>
          <p class="small muted">Generated: ${new Date().toLocaleString()}</p>

          <h2>Summary</h2>
          <p><strong>Disease:</strong> ${safe(gemini.disease)} ${gemini.scientificName ? `(${safe(gemini.scientificName)})` : ''}</p>
          <p class="muted small">Severity: <strong class="small">${safe(gemini.severity)}</strong> • Confidence: <strong>${(gemini.confidence*100).toFixed(1)}%</strong></p>
          <h2>AI Summary</h2>
          <p>${safe(gemini.description)}</p>

          <h2>CNN Predictions</h2>
          <table>
            <thead><tr><th>Prediction</th><th style="width:110px">Confidence</th></tr></thead>
            <tbody>
              ${preds.map((p: any) => `<tr><td>${safe(p.disease)}</td><td>${(p.confidence*100).toFixed(1)}%</td></tr>`).join('')}
            </tbody>
          </table>

          <h2>Models</h2>
          <p class="muted small">Models agree: <strong>${agreement ? 'Yes' : 'No'}</strong> • Average confidence: <strong>${avgConfidence.toFixed(1)}%</strong></p>

          <h2>Treatment Recommendations</h2>
          <ol>
            ${treatments.map((t: any) => `<li><strong>${safe(t.action)}</strong>: ${safe(t.description)} <em>(${safe(t.timeline)})</em></li>`).join('')}
          </ol>

          <h2>Care Requirements</h2>
          <table>
            <tbody>
              <tr><td>Water (frequency)</td><td>${safe((dd && dd.careRequirements && dd.careRequirements.waterFrequency) || '' ) || safe(synthCare.waterFrequency)}</td></tr>
              <tr><td>Water (amount)</td><td>${safe((dd && dd.careRequirements && dd.careRequirements.waterAmount) || '' ) || safe(synthCare.waterAmount)}</td></tr>
              <tr><td>Soil</td><td>${safe((dd && dd.careRequirements && dd.careRequirements.soilType) || '' ) || safe(synthCare.soilType)}</td></tr>
              <tr><td>pH</td><td>${safe((dd && dd.careRequirements && dd.careRequirements.soilPH) || '' ) || safe(synthCare.soilPH)}</td></tr>
              <tr><td>Sunlight</td><td>${safe((dd && dd.careRequirements && dd.careRequirements.sunlight) || '') || safe(synthCare.sunlight)}</td></tr>
              <tr><td>Temperature</td><td>${safe((dd && dd.careRequirements && dd.careRequirements.temperature) || '') || safe(synthCare.temperature)}</td></tr>
              <tr><td>Humidity</td><td>${safe((dd && dd.careRequirements && dd.careRequirements.humidity) || '') || safe(synthCare.humidity)}</td></tr>
            </tbody>
          </table>

        </div>
      </body>
    </html>`;
  };

  const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  
  const agreement = geminiResult.disease.toLowerCase() === cnnResult.disease.toLowerCase();
  const avgConfidence = ((geminiResult.confidence + cnnResult.confidence) / 2) * 100;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const [diseaseData, setDiseaseData] = useState<DiseaseInformation | null>(null);
  const [diseaseLoading, setDiseaseLoading] = useState(true);

  // Synthesize care requirements from analysis when DB values are missing or generic.
  const synthesizedCare = useMemo(() => {
    const text = `${geminiResult?.description || ''} ${geminiResult?.disease || ''} ${(cnnResult?.predictions || []).map(p => p.disease).join(' ')}`.toLowerCase();
    const type = /fung|mildew|blight|spor|powdery|rust|phytophthora/.test(text)
      ? 'fungal'
      : /bacteri|bacterial|xanthomonas|pseudomonas|erwinia/.test(text)
        ? 'bacterial'
        : /virus|viral|mosaic|tospovirus|tobacco/.test(text)
          ? 'viral'
          : /nutrient|water stress|overwater|underwater|temperature stress|sunburn|salt/.test(text)
            ? 'physiological'
            : 'unknown';

    const sc: any = {};
    if (type === 'fungal') {
      sc.waterFrequency = 'Reduce to 1 time per week; water at soil level in morning';
      sc.waterAmount = 'Enough to moisten root zone; avoid wet foliage';
      sc.soilType = 'Well-draining, sandy-loam with good organic matter';
      sc.soilPH = '5.8 - 6.5';
      sc.humidity = '40-60%';
      sc.sunlight = '6-8 hours bright indirect light';
      sc.temperature = '65-75°F (18-24°C)';
      sc.nutrients = ['Reduce nitrogen; moderate P and K', 'Consider calcium supplements'];
    } else if (type === 'bacterial') {
      sc.waterFrequency = '2 times per week, avoid overhead watering';
      sc.waterAmount = 'Moderate amounts to keep soil moist but not waterlogged';
      sc.soilType = 'Well-draining loamy soil';
      sc.soilPH = '6.0 - 7.0';
      sc.humidity = 'Below 70%';
      sc.sunlight = 'Full to partial sun (6-8 hours)';
      sc.temperature = 'Avoid prolonged warm wet conditions';
      sc.nutrients = ['Balanced NPK to support recovery', 'Calcium for tissue strength'];
    } else if (type === 'viral') {
      sc.waterFrequency = 'Maintain consistent moderate watering';
      sc.waterAmount = 'Avoid water stress';
      sc.soilType = 'Well-draining, nutrient-rich soil';
      sc.soilPH = '6.0 - 7.0';
      sc.humidity = '40-70%';
      sc.sunlight = 'Indirect bright light';
      sc.temperature = 'Avoid heat stress';
      sc.nutrients = ['Supportive nutrition only; avoid over-fertilizing'];
    } else {
      sc.waterFrequency = '2-3 times per week';
      sc.waterAmount = '1-2 inches per week';
      sc.soilType = 'Well-draining, nutrient-rich';
      sc.soilPH = '6.0 - 7.0';
      sc.humidity = '40-70%';
      sc.sunlight = '6-8 hours daily';
      sc.temperature = '65-80°F (18-27°C)';
      sc.nutrients = ['Balanced fertilizer (10-10-10)', 'Organic compost'];
    }

    return sc;
  }, [geminiResult, cnnResult]);

  const mergedCareRequirements = useMemo(() => {
    return {
      ...(synthesizedCare || {}),
      ...(diseaseData && (diseaseData.careRequirements || {})),
    } as any;
  }, [synthesizedCare, diseaseData]);

  const diseaseDataForReport = diseaseData
    ? { ...diseaseData, careRequirements: mergedCareRequirements }
    : { name: geminiResult.disease, careRequirements: mergedCareRequirements };

  // Fetch disease information once and share with child components so
  // recommendations are derived from the actual matched disease entry
  // instead of falling back to generic defaults.
  useEffect(() => {
    let cancelled = false;
    const fetchInfo = async () => {
      setDiseaseLoading(true);
      try {
        const res = await fetch(`/api/disease/${encodeURIComponent(geminiResult.disease)}`);
        if (!res.ok) throw new Error("Failed to fetch disease info");
        const data = await res.json();
        if (!cancelled) setDiseaseData(data);
      } catch (err) {
        console.error("Error loading disease info:", err);
        if (!cancelled) setDiseaseData(null);
      } finally {
        if (!cancelled) setDiseaseLoading(false);
      }
    };

    fetchInfo();
    return () => { cancelled = true; };
  }, [geminiResult.disease]);

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-2xl">Disease Identified</CardTitle>
                {agreement ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Both AI models agree
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Info className="h-3 w-3" />
                    Different predictions
                  </Badge>
                )}
              </div>
              <h2 className="text-3xl font-bold text-foreground">{geminiResult.disease}</h2>
              {geminiResult.scientificName && (
                <p className="text-muted-foreground italic">{geminiResult.scientificName}</p>
              )}
            </div>
            <Button variant="outline" onClick={onReset} data-testid="button-new-analysis">
              New Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Average Confidence</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground">{avgConfidence.toFixed(1)}%</p>
                <Badge variant={avgConfidence >= 90 ? "default" : "secondary"} className="h-6">
                  {avgConfidence >= 90 ? "High" : avgConfidence >= 75 ? "Good" : "Moderate"}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Severity Level</p>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${
                  geminiResult.severity === 'critical' || geminiResult.severity === 'high' 
                    ? 'text-destructive' 
                    : 'text-primary'
                }`} />
                <p className="text-xl font-semibold text-foreground capitalize">{geminiResult.severity}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Analysis Date</p>
              <p className="text-xl font-semibold text-foreground">
                {new Date(analysis.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {geminiResult.description && (
            <div className="mt-6 p-4 rounded-md bg-muted/50 border">
              <p className="text-sm text-foreground">{geminiResult.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Model Comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Brain className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Analysis</CardTitle>
            </div>
            <CardDescription>Multimodal AI model results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Detected Disease</p>
              <p className="text-lg font-semibold text-foreground">{geminiResult.disease}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Confidence Score</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">
                    {(geminiResult.confidence * 100).toFixed(1)}%
                  </span>
                  <Badge variant={geminiResult.confidence >= 0.9 ? "default" : "secondary"}>
                    {geminiResult.confidence >= 0.9 ? "Very High" : geminiResult.confidence >= 0.75 ? "High" : "Moderate"}
                  </Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${geminiResult.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Details: show Gemini summary, model agreement and top CNN predictions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Analysis Details</CardTitle>
              <CardDescription>AI evidence and model agreement</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">AI</p>
                <h3 className="text-md font-semibold">{geminiResult.disease} <span className="text-sm text-muted-foreground">{geminiResult.scientificName ? `(${geminiResult.scientificName})` : ''}</span></h3>
                <p className="text-sm text-muted-foreground">Severity: <strong className="capitalize">{geminiResult.severity}</strong> • Confidence: <strong>{(geminiResult.confidence*100).toFixed(1)}%</strong></p>
                {geminiResult.description && (
                  <div className="mt-2 text-sm text-foreground leading-relaxed">{geminiResult.description}</div>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground">CNN Model</p>
                <div className="space-y-2">
                  {cnnResult.predictions && cnnResult.predictions.slice(0,6).map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1 text-sm">{p.disease}</div>
                      <div className="w-28 text-right text-sm font-semibold">{(p.confidence*100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">Models agree: <strong>{agreement ? 'Yes' : 'No'}</strong></div>
                <div className="text-sm text-muted-foreground">Average confidence: <strong>{avgConfidence.toFixed(1)}%</strong></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-chart-2/10 text-chart-2">
                <Network className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">CNN Model Analysis</CardTitle>
            </div>
            <CardDescription>Deep learning classification results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Detected Disease</p>
              <p className="text-lg font-semibold text-foreground">{cnnResult.disease}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Confidence Score</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">
                    {(cnnResult.confidence * 100).toFixed(1)}%
                  </span>
                  <Badge variant={cnnResult.confidence >= 0.9 ? "default" : "secondary"}>
                    {cnnResult.confidence >= 0.9 ? "Very High" : cnnResult.confidence >= 0.75 ? "High" : "Moderate"}
                  </Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-chart-2 transition-all duration-500"
                    style={{ width: `${cnnResult.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Model Version</p>
              <p className="text-sm font-medium text-foreground">{cnnResult.modelVersion}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="visualizations" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="visualizations" data-testid="tab-visualizations">Visualizations</TabsTrigger>
          <TabsTrigger value="disease-info" data-testid="tab-disease-info">Disease Information</TabsTrigger>
          <TabsTrigger value="treatment" data-testid="tab-treatment">Treatment Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="visualizations" className="space-y-6 mt-6">
          <ConfidenceChart geminiResult={geminiResult} cnnResult={cnnResult} />
          <ComparisonView geminiResult={geminiResult} cnnResult={cnnResult} />
          {/* Simple inline SVG bar chart for top CNN predictions */}
          {cnnResult.predictions && cnnResult.predictions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prediction Breakdown</CardTitle>
                <CardDescription>Top CNN predictions with confidence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <svg viewBox={`0 0 100 ${Math.max(5, cnnResult.predictions.length * 12)}`} className="w-full h-28">
                    {cnnResult.predictions.slice(0, 6).map((p, i) => {
                      const y = i * 12 + 6;
                      const width = Math.max(5, p.confidence * 90);
                      return (
                        <g key={i}>
                          <rect x={8} y={y - 5} width={width} height={8} rx={2} fill="#60A5FA" />
                          <text x={8 + width + 2} y={y + 1} fontSize={3.5} fill="#0f172a">{`${p.disease} (${(p.confidence*100).toFixed(1)}%)`}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </CardContent>
            </Card>
          )}
          {cnnResult.predictions && cnnResult.predictions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Predictions</CardTitle>
                <CardDescription>CNN model alternative classifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cnnResult.predictions.slice(0, 5).map((pred, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{pred.disease}</span>
                        <span className="text-muted-foreground">{(pred.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-chart-2 to-chart-3 transition-all duration-500"
                          style={{ width: `${pred.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="disease-info" className="mt-6">
          <DiseaseInfo
            disease={geminiResult.disease}
            diseaseData={diseaseData}
            isLoading={diseaseLoading}
            geminiResult={geminiResult}
            cnnResult={cnnResult}
            careRequirements={mergedCareRequirements}
          />
        </TabsContent>

        <TabsContent value="treatment" className="mt-6">
          <TreatmentPanel
            disease={geminiResult.disease}
            severity={geminiResult.severity}
            diseaseData={diseaseData}
            careRequirements={mergedCareRequirements}
            geminiConfidence={geminiResult.confidence}
            cnnConfidence={cnnResult.confidence}
            modelsAgree={agreement}
            geminiResult={geminiResult}
            cnnResult={cnnResult}
          />
        </TabsContent>
      </Tabs>

      {/* Download Report */}
      <div className="flex justify-center pt-4">
        <div className="flex gap-3">
          <Button size="lg" variant="outline" data-testid="button-download-report" onClick={downloadReport}>
            <Download className="mr-2 h-5 w-5" />
            Download JSON
          </Button>
          <Button size="lg" variant="default" data-testid="button-export-pdf" onClick={async () => {
            // Export a formatted PDF of the report. Try to use html2canvas + jsPDF if available;
            // otherwise open a printable HTML as a fallback.
            const reportEl = document.getElementById('pc-report-content');
            if (!reportEl) {
              // Build report HTML in new window and print
              const win = window.open('', '_blank');
              if (win) {
                const treatmentsLocal = (diseaseData && (diseaseData as any).treatment && (diseaseData as any).treatment.length > 0)
                  ? (diseaseData as any).treatment
                  : [
                    { action: 'Quarantine Affected Plant', description: 'Move away from healthy plants and sanitize tools.', timeline: 'Immediately' },
                    { action: 'Remove Infected Parts', description: 'Prune and destroy infected tissues.' , timeline: 'Within 24 hours' },
                    { action: 'Monitor and Verify', description: 'Retake photos and observe for 3-7 days before aggressive chemical control.' , timeline: '3-7 days' }
                  ];
                win.document.write(renderReportHtml(analysis, geminiResult, cnnResult, diseaseDataForReport, treatmentsLocal));
                win.document.close();
                win.focus();
                win.print();
              }
              return;
            }

            try {
              // Dynamically import html2canvas and jsPDF if available. If not, fall back.
              // @ts-ignore - dynamic import may not have types installed in the project
              const { default: html2canvas } = await import('html2canvas');
              // @ts-ignore
              const { default: jsPDF } = await import('jspdf');

              const canvas = await html2canvas(reportEl, { scale: 2 });
              const imgData = canvas.toDataURL('image/png');
              const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
              const pageWidth = pdf.internal.pageSize.getWidth();
              const pageHeight = pdf.internal.pageSize.getHeight();
              // fit image to page width
              const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
              const imgWidth = canvas.width * ratio;
              const imgHeight = canvas.height * ratio;
              pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
              pdf.save(`plantcare-report-${analysis.id || Date.now()}.pdf`);
            } catch (err) {
              console.warn('PDF export failed or html2canvas/jspdf not installed, falling back to print:', err);
              const win = window.open('', '_blank');
              if (win) {
                const treatmentsLocal = (diseaseData && (diseaseData as any).treatment && (diseaseData as any).treatment.length > 0)
                  ? (diseaseData as any).treatment
                  : [
                    { action: 'Quarantine Affected Plant', description: 'Move away from healthy plants and sanitize tools.', timeline: 'Immediately' },
                    { action: 'Remove Infected Parts', description: 'Prune and destroy infected tissues.' , timeline: 'Within 24 hours' },
                    { action: 'Monitor and Verify', description: 'Retake photos and observe for 3-7 days before aggressive chemical control.' , timeline: '3-7 days' }
                  ];

                win.document.write(renderReportHtml(analysis, geminiResult, cnnResult, diseaseDataForReport, treatmentsLocal));
                win.document.close();
                win.focus();
                win.print();
              }
            }
          }}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Hidden printable report used by PDF exporter (kept minimal and non-intrusive) */}
      {(() => {
        const reportTreatments = (diseaseData && (diseaseData as any).treatment && (diseaseData as any).treatment.length > 0)
          ? (diseaseData as any).treatment
          : [
            { action: 'Quarantine Affected Plant', description: 'Move away from healthy plants and sanitize tools.', timeline: 'Immediately' },
            { action: 'Remove Infected Parts', description: 'Prune and destroy infected tissues.' , timeline: 'Within 24 hours' },
            { action: 'Monitor and Verify', description: 'Retake photos and observe for 3-7 days before aggressive chemical control.' , timeline: '3-7 days' }
          ];

        return (
          <div id="pc-report-content" style={{ position: 'fixed', left: -9999, top: 0, width: '800px', background: '#fff', padding: '20px' }} aria-hidden>
            <div style={{ fontFamily: 'Inter, system-ui, Arial' }}>
              <h1>PlantCareAI — Analysis Report</h1>
              <p><strong>Disease:</strong> {geminiResult.disease} ({(geminiResult.confidence*100).toFixed(1)}% confidence)</p>
              <p><strong>AI Summary:</strong> {geminiResult.description}</p>
              <h2>CNN Predictions</h2>
              <ul>
                {cnnResult.predictions.slice(0, 6).map((p, i) => (
                  <li key={i}>{p.disease} — {(p.confidence*100).toFixed(1)}%</li>
                ))}
              </ul>
              <h2>Treatment Recommendations</h2>
              <ol>
                {reportTreatments.slice(0, 10).map((t: any, i: number) => (
                  <li key={i}><strong>{t.action}</strong>: {t.description} <em>({t.timeline})</em></li>
                ))}
              </ol>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
