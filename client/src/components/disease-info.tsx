import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Bug, Eye, Shield, Info, Loader2 } from "lucide-react";
import { type DiseaseInformation, type GeminiAnalysisResult, type CNNAnalysisResult } from "@shared/schema";

interface DiseaseInfoProps {
  disease: string;
  diseaseData?: DiseaseInformation | null;
  isLoading?: boolean;
  geminiResult?: GeminiAnalysisResult;
  cnnResult?: CNNAnalysisResult;
  careRequirements?: any;
}

export function DiseaseInfo({ disease, diseaseData: propData = null, isLoading: propLoading = false, geminiResult, cnnResult, careRequirements }: DiseaseInfoProps) {
  const [diseaseData, setDiseaseData] = useState<DiseaseInformation | null>(propData);
  const [isLoading, setIsLoading] = useState<boolean>(propLoading || (propData === null));

  useEffect(() => {
    // If parent already provided diseaseData, don't refetch from the API.
    if (propData) {
      setDiseaseData(propData);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const fetchDiseaseInfo = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/disease/${encodeURIComponent(disease)}`);
        if (!response.ok) throw new Error('Failed to fetch disease information');
        const data = await response.json();
        if (!cancelled) setDiseaseData(data);
      } catch (error) {
        console.error('Error fetching disease info:', error);
        if (!cancelled) {
          setDiseaseData({
            name: disease,
            causes: ['Information not available'],
            symptoms: ['Information not available'],
            prevention: ['Information not available'],
            treatment: [],
            careRequirements: {
              waterFrequency: 'Not specified',
              waterAmount: 'Not specified',
              soilType: 'Not specified',
              soilPH: 'Not specified',
              nutrients: [],
              sunlight: 'Not specified',
              temperature: 'Not specified',
              humidity: 'Not specified'
            }
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchDiseaseInfo();
    return () => { cancelled = true; };
  }, [disease, propData]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!diseaseData && !isLoading) return null;
  const dd = diseaseData || {
    name: disease,
    scientificName: undefined,
    causes: [] as string[],
    symptoms: [] as string[],
    prevention: [] as string[],
    treatment: [] as any[],
    careRequirements: {
      waterFrequency: '',
      waterAmount: '',
      soilType: '',
      soilPH: '',
      nutrients: [],
      sunlight: '',
      temperature: '',
      humidity: ''
    }
  };

  const care = careRequirements || (propData && propData.careRequirements) || dd.careRequirements;

  // Detect whether the disease DB returned a generic placeholder (no real matching data).
  const isGeneric = (diseaseData && (
    diseaseData.causes.length === 0 ||
    diseaseData.causes.some(c => c.toLowerCase().includes('information not available') || c.toLowerCase().includes('environmental stress')) ||
    diseaseData.name.toLowerCase() === disease.toLowerCase()
  ));

  // Build a more realistic overview using Gemini's description if available.
  const overview = geminiResult?.description
    ? (geminiResult.scientificName
      ? `${geminiResult.disease} (${geminiResult.scientificName}) — ${geminiResult.description}`
      : `${geminiResult.disease} — ${geminiResult.description}`)
    : (diseaseData && diseaseData.name === 'Healthy Plant'
      ? "Your plant appears to be healthy! Continue with your current care routine to maintain its good health."
      : "This is a plant disease that requires attention. Early detection and proper treatment are important for plant recovery and preventing spread to other plants.");

  // If the DB entry is generic, synthesize causes/symptoms/prevention from the AI analysis.
  const synthesizedCauses: string[] = [];
  const synthesizedSymptoms: string[] = [];
  const synthesizedPrevention: string[] = [];

  if (isGeneric) {
    // Derive from Gemini description and CNN predictions
    if (geminiResult?.description) {
      // Split description into sentences and treat the first few as symptoms/causes
      const sentences = geminiResult.description.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(Boolean);
      synthesizedSymptoms.push(...sentences.slice(0, 3));
      // Also add a severity-driven cause/suggestion
      if (geminiResult.severity === 'critical' || geminiResult.severity === 'high') {
        synthesizedCauses.push('Likely aggressive pathogen or heavily favorable environmental conditions (high humidity, warm temperatures)');
      } else {
        synthesizedCauses.push('Environmental stress or early-stage pathogen presence');
      }
    }

    if (cnnResult && Array.isArray(cnnResult.predictions)) {
      const top = cnnResult.predictions.slice(0, 3).map(p => `${p.disease} (${Math.round(p.confidence * 100)}%)`);
      if (top.length) synthesizedSymptoms.push(`Top alternative matches: ${top.join(', ')}`);
    }

    // Generic prevention derived from severity
    synthesizedPrevention.push('Improve air circulation and avoid overhead watering');
    if (geminiResult?.severity === 'critical' || geminiResult?.severity === 'high') {
      synthesizedPrevention.push('Consider targeted fungicide/bactericide after verification');
    } else {
      synthesizedPrevention.push('Monitor closely and adjust watering and nutrition');
    }
  }
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="border-2">
        <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Info className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle>{dd.name}</CardTitle>
                {dd.scientificName && (
                  <CardDescription className="mt-1 italic">{dd.scientificName}</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{overview}</p>
        </CardContent>
      </Card>

      {/* Care Requirements (either from DB or from parent-supplied merged care) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Care Requirements</CardTitle>
            <CardDescription>Water, soil, environment and nutrient guidance</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
              <div>
              <p className="text-xs text-muted-foreground">Water</p>
              <p className="text-sm text-foreground">{(care && care.waterFrequency) || '—'}</p>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-sm text-foreground">{(care && care.waterAmount) || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Soil</p>
              <p className="text-sm text-foreground">{(care && care.soilType) || '—'}</p>
              <p className="text-xs text-muted-foreground">pH</p>
              <p className="text-sm text-foreground">{(care && care.soilPH) || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sunlight</p>
              <p className="text-sm text-foreground">{(care && care.sunlight) || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Temperature / Humidity</p>
              <p className="text-sm text-foreground">{(care && care.temperature) || '—'} / {(care && care.humidity) || '—'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground">Nutrients</p>
              <p className="text-sm text-foreground">{Array.isArray((care && care.nutrients)) ? (care.nutrients.join(', ')) : '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="causes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="causes" data-testid="info-tab-causes">Causes</TabsTrigger>
          <TabsTrigger value="symptoms" data-testid="info-tab-symptoms">Symptoms</TabsTrigger>
          <TabsTrigger value="prevention" data-testid="info-tab-prevention">Prevention</TabsTrigger>
        </TabsList>

        <TabsContent value="causes" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Root Causes</CardTitle>
              </div>
              <CardDescription>Conditions and factors that lead to this disease</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(isGeneric ? synthesizedCauses : dd.causes).map((cause, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-xs font-semibold mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-foreground flex-1 pt-0.5">{cause}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Visible Symptoms</CardTitle>
              </div>
              <CardDescription>Signs to look for when identifying this disease</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(isGeneric ? synthesizedSymptoms : dd.symptoms).map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-md bg-muted/50 border">
                    <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                    <p className="text-foreground flex-1">{symptom}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prevention" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Prevention Strategies</CardTitle>
              </div>
              <CardDescription>Best practices to prevent disease occurrence</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(isGeneric ? synthesizedPrevention : dd.prevention).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold mt-0.5">
                      ✓
                    </div>
                    <p className="text-foreground flex-1 pt-0.5">{item}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
