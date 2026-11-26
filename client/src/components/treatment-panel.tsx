import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Sprout, Sun, Thermometer, Wind, AlertTriangle } from "lucide-react";
import { type GeminiAnalysisResult, type CNNAnalysisResult } from "@shared/schema";

interface TreatmentPanelProps {
  disease: string;
  severity: string;
  diseaseData?: {
    treatment?: {
      priority: 'critical' | 'important' | 'suggested';
      action: string;
      description: string;
      timeline?: string;
    }[];
    careRequirements?: any;
  } | null;
  geminiConfidence?: number;
  cnnConfidence?: number;
  modelsAgree?: boolean;
  geminiResult?: GeminiAnalysisResult;
  cnnResult?: CNNAnalysisResult;
  careRequirements?: any;
}

export function TreatmentPanel({ disease, severity, diseaseData = null, careRequirements: propCareRequirements = undefined, geminiConfidence = 0, cnnConfidence = 0, modelsAgree = true, geminiResult, cnnResult }: TreatmentPanelProps) {
  
  // Helper: detect likely pathogen type from AI description/name/predictions
  const detectType = (): 'fungal' | 'bacterial' | 'viral' | 'physiological' | 'unknown' => {
    const text = `${geminiResult?.description || ''} ${disease || ''} ${cnnResult?.predictions?.map(p => p.disease).join(' ') || ''}`.toLowerCase();
    if (/fung|mildew|blight|spor|powdery|rust|phytophthora/.test(text)) return 'fungal';
    if (/bacteri|bacterial|xanthomonas|pseudomonas|erwinia/.test(text)) return 'bacterial';
    if (/virus|viral|mosaic|tospovirus|tobacco/.test(text)) return 'viral';
    if (/nutrient|water stress|overwater|underwater|temperature stress|sunburn|salt/.test(text)) return 'physiological';
    return 'unknown';
  };
  const diseaseType = detectType();
  const baseTreatments = diseaseData && diseaseData.treatment && diseaseData.treatment.length > 0
    ? diseaseData.treatment
    : [
    {
      priority: 'critical' as const,
      action: 'Remove Infected Parts',
      description: 'Immediately prune and destroy all infected leaves, stems, and plant parts. Do not compost infected material.',
      timeline: 'Within 24 hours'
    },
    {
      priority: 'critical' as const,
      action: 'Apply Fungicide',
      description: 'Use copper-based or organic fungicide spray on remaining healthy parts. Reapply as directed on product label.',
      timeline: 'Start immediately, repeat every 7-10 days'
    },
    {
      priority: 'important' as const,
      action: 'Improve Air Circulation',
      description: 'Thin out dense foliage and ensure plants have adequate spacing. Consider using fans for indoor plants.',
      timeline: 'Within 2-3 days'
    },
    {
      priority: 'important' as const,
      action: 'Adjust Watering',
      description: 'Water only at the base of plants in early morning. Avoid overhead watering that keeps foliage wet.',
      timeline: 'Ongoing change'
    },
    {
      priority: 'suggested' as const,
      action: 'Boost Plant Immunity',
      description: 'Apply balanced fertilizer and consider organic immunity boosters like compost tea or seaweed extract.',
      timeline: 'Weekly application'
    }
  ];

  const baseCareRequirements: any = propCareRequirements || (diseaseData && diseaseData.careRequirements) || {};

  // Synthesize care requirements when DB doesn't provide useful details
  const synthesizeCare = () => {
    const synth: any = {};
    // Watering
    if (diseaseType === 'fungal') {
      synth.waterFrequency = 'Reduce to 1 time per week; water at soil level in morning';
      synth.waterAmount = 'Enough to moisten root zone; avoid wet foliage';
      synth.humidity = 'Below 60% if possible';
    } else if (diseaseType === 'bacterial') {
      synth.waterFrequency = '2 times per week, avoid overhead watering';
      synth.waterAmount = 'Moderate amounts to keep soil moist but not waterlogged';
    } else if (diseaseType === 'viral') {
      synth.waterFrequency = 'Maintain consistent moderate watering';
      synth.waterAmount = 'Avoid water stress';
    } else {
      synth.waterFrequency = '2-3 times per week';
      synth.waterAmount = '1-2 inches per week';
    }

    // Soil
    synth.soilType = diseaseType === 'fungal' ? 'Well-draining, sandy-loam with good organic matter' : 'Well-draining loamy soil';
    synth.soilPH = diseaseType === 'fungal' ? '5.8 - 6.5' : '6.0 - 7.0';

    // Environment
    synth.sunlight = diseaseType === 'viral' ? 'Indirect bright light, avoid heat stress' : '6-8 hours of indirect to partial sun';
    synth.temperature = diseaseType === 'bacterial' ? 'Avoid high humidity and prolonged warm wet conditions' : '65-75°F (18-24°C)';
    synth.humidity = synth.humidity || (diseaseType === 'fungal' ? '40-60%' : '40-70%');

    // Nutrients
    synth.nutrients = [] as string[];
    if (diseaseType === 'physiological') {
      synth.nutrients.push('Correct specific deficiencies based on soil test (N, P, K as needed)');
    } else {
      synth.nutrients.push('Balanced NPK to support recovery');
      if (diseaseType === 'fungal') synth.nutrients.push('Reduce nitrogen; moderate phosphorus and potassium');
      synth.nutrients.push('Consider calcium supplements to strengthen tissue');
    }

    return synth;
  };

  const synthesizedCare = Object.assign({}, synthesizeCare(), baseCareRequirements);

  // Additional, analysis-driven treatment recommendations
  const extraTreatments: any[] = [];
  // Quarantine & sanitation
  extraTreatments.push({
    priority: 'critical',
    action: 'Quarantine Affected Plant',
    description: 'Move the plant away from healthy plants to reduce spread. Sanitize tools after handling.',
    timeline: 'Immediately'
  });

  // If fungal and confidence high, recommend fungicide options and organic alternatives
  if (diseaseType === 'fungal') {
    extraTreatments.push({
      priority: 'critical',
      action: 'Targeted Fungicide Treatment',
      description: 'Consider copper or biological fungicides (Bacillus subtilis). Follow label directions and wear PPE.',
      timeline: 'Start immediately if high confidence'
    });
    extraTreatments.push({
      priority: 'important',
      action: 'Improve Air Flow & Drying',
      description: 'Thin canopy, increase spacing and air movement; prune to improve drying.',
      timeline: 'Within 2-3 days'
    });
  }

  if (diseaseType === 'bacterial') {
    extraTreatments.push({
      priority: 'critical',
      action: 'Remove Severely Infected Tissue',
      description: 'Pull and destroy heavily infected plants or parts; do not compost.',
      timeline: 'Immediately'
    });
    extraTreatments.push({
      priority: 'important',
      action: 'Copper/Bactericide Sprays',
      description: 'Apply copper-based bactericide as recommended; timing is important before wet periods.',
      timeline: 'Every 7-10 days during outbreaks'
    });
  }

  if (diseaseType === 'viral') {
    extraTreatments.push({
      priority: 'critical',
      action: 'Remove and Destroy Viral-Infected Plants',
      description: 'Viral infections are not curable; remove infected plants to prevent vector spread.',
      timeline: 'Immediately'
    });
    extraTreatments.push({
      priority: 'important',
      action: 'Vector Control',
      description: 'Control insect vectors (aphids, thrips) using appropriate measures and monitor regularly.',
      timeline: 'Ongoing'
    });
  }

  // If low confidence, recommend monitoring and verification instead of aggressive chemical controls
  if ((geminiConfidence ?? 0) < 0.75 && (cnnConfidence ?? 0) < 0.75) {
    extraTreatments.unshift({
      priority: 'important',
      action: 'Verify Before Aggressive Treatment',
      description: 'Consider re-taking photos under better lighting, checking symptoms over 3-7 days, or seeking expert advice.',
      timeline: 'Within 3-7 days'
    });
  }

  // Build final treatments list: extra-driven recommendations first, then DB/default ones
  const treatments = [...extraTreatments, ...(baseTreatments || [])];
  const careRequirements: any = {
    water: {
      frequency: synthesizedCare.waterFrequency || baseCareRequirements.waterFrequency || '2-3 times per week',
      amount: synthesizedCare.waterAmount || baseCareRequirements.waterAmount || '1-2 inches per week',
      note: baseCareRequirements.waterNote || synthesizedCare.waterNote || 'Reduce frequency during treatment to prevent fungal spread'
    },
    soil: {
      type: baseCareRequirements.soilType || synthesizedCare.soilType || 'Well-draining loamy soil',
      ph: baseCareRequirements.soilPH || synthesizedCare.soilPH || '6.0 - 7.0',
      note: baseCareRequirements.soilNote || synthesizedCare.soilNote || 'Add perlite or sand if drainage is poor'
    },
    nutrients: baseCareRequirements.nutrients || synthesizedCare.nutrients || [
      'Nitrogen (N): Moderate levels for recovery',
      'Phosphorus (P): Boost for root strength',
      'Potassium (K): Enhanced for disease resistance',
      'Calcium: Prevents secondary infections'
    ],
    environment: {
      sunlight: baseCareRequirements.sunlight || synthesizedCare.sunlight || '6-8 hours of indirect light',
      temperature: baseCareRequirements.temperature || synthesizedCare.temperature || '65-75°F (18-24°C)',
      humidity: baseCareRequirements.humidity || synthesizedCare.humidity || 'Below 60% to inhibit fungal growth'
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'important': return 'default';
      case 'suggested': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    return priority === 'critical' ? <AlertTriangle className="h-4 w-4" /> : null;
  };

  // Recommended supplies/tooling per disease type (used to give users actionable next steps)
  const suppliesByType: Record<string, string[]> = {
    fungal: ['Gloves', 'Pruning shears', 'Copper fungicide / Bacillus subtilis spray', 'Disposable bags', 'Isopropyl alcohol (tool disinfectant)'],
    bacterial: ['Gloves', 'Pruning shears', 'Copper bactericide', 'Disposable bags', 'Isopropyl alcohol (tool disinfectant)'],
    viral: ['Gloves', 'Disposable bags', 'Sticky traps or insect controls', 'Sharp disposal tools'],
    physiological: ['Soil test kit', 'pH meter', 'Balanced fertilizer', 'Mulch', 'Moisture meter'],
    unknown: ['Gloves', 'Pruning shears', 'Hand lens / magnifier', 'Notebook to record symptoms']
  };

  const getSuppliesFor = (treatment: any) => {
    const base = suppliesByType[diseaseType] || suppliesByType.unknown;
    // Add treatment-specific suggestions
    if (/fungicide|fungal|fungus/i.test(treatment.action || '')) {
      const arr = base.concat(['Sprayer', 'PPE (mask/goggles)']);
      return arr.filter((v, i, a) => a.indexOf(v) === i);
    }
    if (/remove|prune|pull|destroy/i.test(treatment.action || '')) {
      const arr = base.concat(['Sharp pruners', 'Thick gloves', 'Disposable bags']);
      return arr.filter((v, i, a) => a.indexOf(v) === i);
    }
    if (/vector|insect|aphid|thrips/i.test(treatment.action || '')) {
      const arr = base.concat(['Insecticidal soap', 'Sticky traps']);
      return arr.filter((v, i, a) => a.indexOf(v) === i);
    }
    return base;
  };

  return (
    <div className="space-y-6">
      {/* If models disagree or confidence is low, show actionable guidance */}
      {(!modelsAgree || (geminiConfidence < 0.7 && cnnConfidence < 0.7)) && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Verification Recommended</CardTitle>
            <CardDescription>Models either disagree or confidence is low — consider re-taking the photo or getting a second opinion.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">Because the analysis is uncertain, start with non-destructive checks first: re-photograph the plant in good light, compare symptoms to the listed ones, and consider consulting a local extension service before aggressive treatments.</p>
          </CardContent>
        </Card>
      )}

      {/* Treatment Actions */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Treatment Recommendations</CardTitle>
          <CardDescription>Prioritized action plan for disease management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {treatments
              .slice()
              .sort((a, b) => {
                const rank = (p: string) => p === 'critical' ? 0 : p === 'important' ? 1 : 2;
                return rank(a.priority) - rank(b.priority);
              })
              .map((treatment, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-md border-l-4 ${
                  treatment.priority === 'critical' 
                    ? 'border-l-destructive bg-destructive/5' 
                    : treatment.priority === 'important'
                    ? 'border-l-primary bg-primary/5'
                    : 'border-l-muted bg-muted/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    {getPriorityIcon(treatment.priority)}
                    {treatment.action}
                  </h4>
                  <Badge variant={getPriorityColor(treatment.priority)} className="shrink-0 capitalize">
                    {treatment.priority}
                  </Badge>
                </div>
                <p className="text-sm text-foreground mb-2">{treatment.description}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="font-medium">Timeline:</span> {treatment.timeline}
                  </p>
                  {/* Recommended supplies/tools */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {getSuppliesFor(treatment).slice(0,6).map((supply, si) => (
                      <span key={si} className="text-xs bg-muted/30 px-2 py-1 rounded-md">{supply}</span>
                    ))}
                  </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Care Requirements Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Watering Requirements */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Droplets className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Water Requirements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Frequency</p>
              <p className="text-sm font-semibold text-foreground">{careRequirements.water.frequency}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Amount</p>
              <p className="text-sm font-semibold text-foreground">{careRequirements.water.amount}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">{careRequirements.water.note}</p>
            </div>
          </CardContent>
        </Card>

        {/* Soil Requirements */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sprout className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Soil Requirements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <p className="text-sm font-semibold text-foreground">{careRequirements.soil.type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">pH Level</p>
              <p className="text-sm font-semibold text-foreground">{careRequirements.soil.ph}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">{careRequirements.soil.note}</p>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Conditions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sun className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Environment</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Sun className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Sunlight</p>
                <p className="text-sm font-medium text-foreground">{careRequirements.environment.sunlight}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Thermometer className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Temperature</p>
                <p className="text-sm font-medium text-foreground">{careRequirements.environment.temperature}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Wind className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Humidity</p>
                <p className="text-sm font-medium text-foreground">{careRequirements.environment.humidity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrient Requirements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Nutrients Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Array.isArray(careRequirements.nutrients) && careRequirements.nutrients.map((nutrient: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="text-foreground">{nutrient}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
