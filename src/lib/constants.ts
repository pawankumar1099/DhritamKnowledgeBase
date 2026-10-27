import { CategoryMeta, DhritamCategory, KnowledgeDocument } from '@/types/knowledgeBase';

export const DHRITAM_COMPANY = {
  name: 'Dhritam',
  devanagari: 'धृतम्',
  meaning: 'That which is held steady',
  tagline: 'Healthier minds. Brighter lives.',
  flagship: 'Kavach X — Smart Daily-Wear Sensing Undergarment',
  domain: 'dhritam.com',
  grant: 'MeitY GENESIS EiR 3.0 (MEIT-695596)',
  awards: [
    'Best AI Innovation Prize — Future AI Conclave, Ministry of MSME (June 2026)',
    'First Prize — Global AI Summit, Noida (August 2026)',
  ],
};

export const TEAM_MEMBERS = [
  'Sahil Chaudhary',
  'Shubham Jain',
  'Suhani Sikarwar',
  'Nikhil Singh',
  'Pawan Kumar Sharma',
  'Ritika Rawat',
  'Yashashvi Chaudhary',
  'Mayank Agarwal',
];

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'all',
    name: 'All Categories',
    description: 'Universal repository of all uploaded documents and specifications',
    icon: 'Layers',
    accentColor: '#171717',
  },
  {
    id: 'hardware',
    name: 'Hardware & Sensors',
    description: 'Kavach X PCB schematics, dry ECG electrodes, BLE firmware, EDA, battery & packet protocols',
    icon: 'Cpu',
    accentColor: '#0070f3',
  },
  {
    id: 'strategy',
    name: 'Market Strategy & Pitch',
    description: 'Urban professional beachhead, ₹1 Cr deck flow, investor docs, ₹7,000 price hypothesis',
    icon: 'TrendingUp',
    accentColor: '#7928ca',
  },
  {
    id: 'product',
    name: 'Product & Software V1',
    description: 'App V1 engineering baseline, local-first data integrity, signal validation, Skiin benchmark',
    icon: 'Smartphone',
    accentColor: '#50e3c2',
  },
  {
    id: 'clinical',
    name: 'Clinical & Physiological',
    description: '7 ECG trial protocols, HR/HRV baselines, motion artifact handling, reference comparisons',
    icon: 'Activity',
    accentColor: '#eb367f',
  },
  {
    id: 'regulatory',
    name: 'Regulatory & IP',
    description: 'Neurocardiosync provisional patent draft, safety claims guardrails, medical device roadmap',
    icon: 'ShieldCheck',
    accentColor: '#f5a623',
  },
  {
    id: 'brand',
    name: 'Brand & Design Assets',
    description: 'Logo vectors, Pitch Playbook (16:9 canvas, deep navy #0A1020), typography & media',
    icon: 'Palette',
    accentColor: '#ff0080',
  },
  {
    id: 'operations',
    name: 'Operations & Roadmap',
    description: 'MeitY GENESIS grant filings, MSME award certificates, 12-month engineering roadmap',
    icon: 'Briefcase',
    accentColor: '#4d4d4d',
  },
];

export const INITIAL_DOCUMENTS: KnowledgeDocument[] = [];
