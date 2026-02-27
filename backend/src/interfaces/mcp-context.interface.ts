export interface MCPContext {
    projectInfo: ProjectInfo;
    features: Feature[];
    userStories: UserStory[];
    technicalStack: TechnicalStack;
}

interface ProjectInfo {
    name: string;
    botName: string;
    descriptionBotName: string;
    description: string;
    mission: string;
    vision: string;
    targetAudience: string[];
}

interface Feature {
    id: string;
    name: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
}

interface UserStory {
    id: string;
    title: string;
    description: string;
    sprint: number;
}

interface TechnicalStack {
    frontend: string[];
    backend: string[];
    apis: string[];
}