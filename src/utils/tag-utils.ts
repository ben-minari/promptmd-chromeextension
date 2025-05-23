// Utility for tag categorization and normalization
import type { Tool } from '../services/tools-service'

export function categorizeTag(tag: string): { category: keyof Tool['tags'], tag: string } {
  // Define tag mappings (human-readable, as in AVAILABLE_TAGS)
  const specialtyTags = [
    'Allergy & Immunology',
    'Cardiology',
    'Dermatology',
    'Emergency Medicine',
    'Endocrinology',
    'Gastroenterology',
    'Geriatrics',
    'Hematology/Oncology',
    'Hospitalist Medicine',
    'Infectious Diseases',
    'Internal Medicine',
    'Nephrology',
    'Neurology',
    'OB/GYN',
    'Ophthalmology',
    'Orthopedics',
    'Otolaryngology (ENT)',
    'Pediatrics',
    'Physical Medicine & Rehab',
    'Psychiatry',
    'Pulmonology/Critical Care',
    'Primary Care',
    'Radiology',
    'Rheumatology',
    'Surgery'
  ];
  const useCaseTags = [
    'Patient Education',
    'Clinical Documentation',
    'Decision Support',
    'Workflow Automation',
    'Triage',
    'Medication Management',
    'Discharge Planning',
    'Quality & Safety Monitoring',
    'Population Health Analytics',
    'Care Coordination',
    'Billing & Coding Assistance',
    'Consultation',
    'Referral',
    'Assessment'
  ];
  const userTypeTags = [
    'physician',
    'nurse',
    'resident',
    'student',
    'admin'
  ];
  const appModelTags = [
    'ChatGPT',
    'Claude',
    'Gemini',
    'LLaMA',
    'Med-PaLM',
    'Perplexity',
    'Doximity GPT',
    'OpenEvidence',
    'Mistral'
  ];

  // Normalize for comparison: lowercase, trim, remove extra spaces
  const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, ' ').trim();
  const normalizedTag = normalize(tag);

  // Find the original tag from each list if it matches
  const findOriginal = (arr: string[]) => arr.find(t => normalize(t) === normalizedTag);

  if (findOriginal(specialtyTags)) {
    return { category: 'specialty', tag: findOriginal(specialtyTags)! };
  }
  if (findOriginal(useCaseTags)) {
    return { category: 'useCase', tag: findOriginal(useCaseTags)! };
  }
  if (findOriginal(userTypeTags)) {
    return { category: 'userType', tag: findOriginal(userTypeTags)! };
  }
  if (findOriginal(appModelTags)) {
    return { category: 'appModel', tag: findOriginal(appModelTags)! };
  }

  // Default to useCase if no match found, return original input
  return { category: 'useCase', tag };
}

export function getTagColor(category: string) {
  switch (category) {
    case 'specialty':
      return 'bg-blue-100 text-blue-800';
    case 'useCase':
      return 'bg-teal-100 text-teal-800';
    case 'appModel':
      return 'bg-purple-100 text-purple-800';
    case 'userType':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-slate-100 text-slate-600';
  }
} 