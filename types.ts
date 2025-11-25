import React from 'react';

export type View = 'dashboard' | 'config' | 'integration' | 'billing';

export interface NavItem {
  id: View;
  label: string;
  icon: React.ElementType;
}

export interface ChartData {
  name: string;
  visitors: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface LinkItem {
  id: string;
  url: string;
}

export interface QnAItem {
  id: string;
  question: string;
  answer: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'txt' | 'other';
}

export interface ConfigState {
  id: string;
  active: boolean;
  name: string;
  welcomeMessage: string;
  role: string;
  knowledgeBaseText: string;
  qna: QnAItem[];
  links: LinkItem[];
  files: FileItem[];
}