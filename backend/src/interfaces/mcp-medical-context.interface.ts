export interface Guideline {
  title: string;
  content: string;
  severity: string;
}

export interface MCPMedicalContext {
  id: string;
  name: string;
  keywords: string[];
  priority?: number | string;
  content: {
    description: string;
    mainTopics?: string[];
    guidelines?: Guideline[];
    titles?: string[];
    content?: string[];
    severity?: string[];
    symptoms?: string[];
    riskFactors?: string[];
    treatments?: string[];
    recommendations?: string[];
    prevention?: string[];
    sources?: string[];
  };
}
