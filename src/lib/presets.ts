// ============================================================================
// Industry & Role Presets
// Pre-configured analysis rules for different job roles
// ============================================================================

import type { RolePreset, RoleCategory } from '@/types';

export const ROLE_PRESETS: Record<RoleCategory, RolePreset> = {
  'frontend-developer': {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    description: 'Web application development focusing on user interfaces and client-side logic',
    keySkills: [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'HTML', 'CSS',
      'SASS/SCSS', 'Tailwind CSS', 'Redux', 'Next.js', 'Webpack', 'Testing',
      'Responsive Design', 'Web Performance', 'Accessibility', 'REST APIs',
    ],
    commonTools: [
      'VS Code', 'Chrome DevTools', 'Figma', 'Git', 'npm/yarn', 'Jest',
      'Cypress', 'Storybook', 'Vite', 'ESLint', 'Prettier',
    ],
    scoringWeights: {
      skills: 0.35,
      experience: 0.30,
      projects: 0.25,
      education: 0.10,
    },
    industryKeywords: [
      'UI/UX', 'component-based', 'state management', 'SPA', 'PWA',
      'cross-browser', 'mobile-first', 'design systems', 'micro-frontends',
    ],
  },

  'backend-developer': {
    id: 'backend-developer',
    name: 'Backend Developer',
    description: 'Server-side development focusing on APIs, databases, and system architecture',
    keySkills: [
      'Node.js', 'Python', 'Java', 'Go', 'Ruby', 'SQL', 'PostgreSQL',
      'MongoDB', 'Redis', 'REST APIs', 'GraphQL', 'Microservices',
      'Docker', 'AWS/GCP/Azure', 'CI/CD', 'Testing', 'Security',
    ],
    commonTools: [
      'VS Code', 'IntelliJ', 'Postman', 'Docker', 'Git', 'Jenkins',
      'Kubernetes', 'Terraform', 'DataGrip', 'Linux',
    ],
    scoringWeights: {
      skills: 0.35,
      experience: 0.35,
      projects: 0.20,
      education: 0.10,
    },
    industryKeywords: [
      'scalability', 'API design', 'database optimization', 'caching',
      'message queues', 'authentication', 'authorization', 'monitoring',
    ],
  },

  'fullstack-developer': {
    id: 'fullstack-developer',
    name: 'Full Stack Developer',
    description: 'End-to-end development covering both frontend and backend technologies',
    keySkills: [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL',
      'NoSQL', 'REST APIs', 'GraphQL', 'Docker', 'AWS', 'Git',
      'HTML/CSS', 'Testing', 'CI/CD', 'Agile',
    ],
    commonTools: [
      'VS Code', 'Git', 'Docker', 'Postman', 'Chrome DevTools',
      'AWS Console', 'Vercel/Netlify', 'GitHub Actions',
    ],
    scoringWeights: {
      skills: 0.30,
      experience: 0.35,
      projects: 0.25,
      education: 0.10,
    },
    industryKeywords: [
      'end-to-end', 'full lifecycle', 'deployment', 'DevOps',
      'system design', 'architecture', 'integration',
    ],
  },

  'data-analyst': {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Data analysis, visualization, and business intelligence',
    keySkills: [
      'SQL', 'Python', 'R', 'Excel', 'Tableau', 'Power BI',
      'Statistics', 'Data Visualization', 'ETL', 'Data Modeling',
      'A/B Testing', 'Business Intelligence', 'Reporting',
    ],
    commonTools: [
      'Excel', 'Tableau', 'Power BI', 'Python', 'Jupyter',
      'SQL Server', 'BigQuery', 'Looker', 'dbt',
    ],
    scoringWeights: {
      skills: 0.35,
      experience: 0.30,
      projects: 0.20,
      education: 0.15,
    },
    industryKeywords: [
      'insights', 'KPIs', 'dashboards', 'metrics', 'trends',
      'forecasting', 'data-driven', 'stakeholder reporting',
    ],
  },

  'data-scientist': {
    id: 'data-scientist',
    name: 'Data Scientist',
    description: 'Machine learning, statistical modeling, and advanced analytics',
    keySkills: [
      'Python', 'R', 'Machine Learning', 'Deep Learning', 'SQL',
      'TensorFlow', 'PyTorch', 'Scikit-learn', 'Statistics',
      'NLP', 'Computer Vision', 'Feature Engineering', 'MLOps',
    ],
    commonTools: [
      'Jupyter', 'VS Code', 'Conda', 'MLflow', 'Weights & Biases',
      'SageMaker', 'Databricks', 'Spark', 'Airflow',
    ],
    scoringWeights: {
      skills: 0.30,
      experience: 0.30,
      projects: 0.25,
      education: 0.15,
    },
    industryKeywords: [
      'predictive modeling', 'model deployment', 'experimentation',
      'hypothesis testing', 'feature importance', 'model optimization',
    ],
  },

  'product-manager': {
    id: 'product-manager',
    name: 'Product Manager',
    description: 'Product strategy, roadmapping, and cross-functional leadership',
    keySkills: [
      'Product Strategy', 'Roadmapping', 'User Research', 'Data Analysis',
      'Agile/Scrum', 'Stakeholder Management', 'Market Analysis',
      'A/B Testing', 'PRD Writing', 'Go-to-Market', 'Metrics',
    ],
    commonTools: [
      'Jira', 'Confluence', 'Figma', 'Amplitude', 'Mixpanel',
      'Notion', 'Productboard', 'Miro', 'Google Analytics',
    ],
    scoringWeights: {
      skills: 0.25,
      experience: 0.40,
      projects: 0.20,
      education: 0.15,
    },
    industryKeywords: [
      'product-market fit', 'OKRs', 'sprint planning', 'backlog',
      'user stories', 'prioritization', 'cross-functional',
    ],
  },

  'devops-engineer': {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    description: 'Infrastructure automation, CI/CD, and cloud operations',
    keySkills: [
      'AWS/GCP/Azure', 'Docker', 'Kubernetes', 'Terraform', 'Ansible',
      'CI/CD', 'Jenkins', 'GitHub Actions', 'Linux', 'Bash/Python',
      'Monitoring', 'Security', 'Networking',
    ],
    commonTools: [
      'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins',
      'Prometheus', 'Grafana', 'ELK Stack', 'AWS CLI', 'Git',
    ],
    scoringWeights: {
      skills: 0.35,
      experience: 0.35,
      projects: 0.20,
      education: 0.10,
    },
    industryKeywords: [
      'infrastructure as code', 'automation', 'scalability',
      'reliability', 'SRE', 'incident response', 'observability',
    ],
  },

  'ui-ux-designer': {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    description: 'User interface design, user experience, and design systems',
    keySkills: [
      'UI Design', 'UX Design', 'User Research', 'Wireframing',
      'Prototyping', 'Design Systems', 'Figma', 'Adobe XD',
      'Usability Testing', 'Information Architecture', 'Accessibility',
    ],
    commonTools: [
      'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Principle',
      'Framer', 'Zeplin', 'Miro', 'Maze', 'Hotjar',
    ],
    scoringWeights: {
      skills: 0.30,
      experience: 0.30,
      projects: 0.30,
      education: 0.10,
    },
    industryKeywords: [
      'user-centered', 'design thinking', 'journey mapping',
      'personas', 'heuristics', 'interaction design', 'visual design',
    ],
  },

  'mobile-developer': {
    id: 'mobile-developer',
    name: 'Mobile Developer',
    description: 'iOS, Android, or cross-platform mobile application development',
    keySkills: [
      'Swift', 'Kotlin', 'React Native', 'Flutter', 'iOS', 'Android',
      'Mobile UI', 'REST APIs', 'SQLite', 'Push Notifications',
      'App Store', 'Google Play', 'Testing', 'Performance',
    ],
    commonTools: [
      'Xcode', 'Android Studio', 'VS Code', 'Simulator', 'Firebase',
      'Fastlane', 'TestFlight', 'Crashlytics', 'App Center',
    ],
    scoringWeights: {
      skills: 0.35,
      experience: 0.30,
      projects: 0.25,
      education: 0.10,
    },
    industryKeywords: [
      'native', 'cross-platform', 'app lifecycle', 'offline-first',
      'mobile-first', 'app store optimization', 'mobile security',
    ],
  },

  'qa-engineer': {
    id: 'qa-engineer',
    name: 'QA Engineer',
    description: 'Software testing, quality assurance, and test automation',
    keySkills: [
      'Test Automation', 'Selenium', 'Cypress', 'Jest', 'Manual Testing',
      'API Testing', 'Performance Testing', 'Security Testing',
      'Test Planning', 'Bug Tracking', 'CI/CD', 'Agile',
    ],
    commonTools: [
      'Selenium', 'Cypress', 'Postman', 'JMeter', 'Jira',
      'TestRail', 'BrowserStack', 'Appium', 'SonarQube',
    ],
    scoringWeights: {
      skills: 0.35,
      experience: 0.30,
      projects: 0.20,
      education: 0.15,
    },
    industryKeywords: [
      'test coverage', 'regression', 'smoke testing', 'edge cases',
      'test scenarios', 'defect tracking', 'quality metrics',
    ],
  },
};

/**
 * Get role preset by ID
 */
export function getRolePreset(roleId: RoleCategory): RolePreset | undefined {
  return ROLE_PRESETS[roleId];
}

/**
 * Get all available role presets
 */
export function getAllRolePresets(): RolePreset[] {
  return Object.values(ROLE_PRESETS);
}

/**
 * Get role preset suggestions based on resume skills
 */
export function suggestRolesFromSkills(skills: string[]): RoleCategory[] {
  const skillsLower = skills.map((s) => s.toLowerCase());
  const roleScores: { role: RoleCategory; score: number }[] = [];

  for (const [roleId, preset] of Object.entries(ROLE_PRESETS)) {
    let score = 0;
    for (const keySkill of preset.keySkills) {
      if (skillsLower.some((s) => 
        s.includes(keySkill.toLowerCase()) || 
        keySkill.toLowerCase().includes(s)
      )) {
        score++;
      }
    }
    roleScores.push({ role: roleId as RoleCategory, score });
  }

  return roleScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.role);
}

