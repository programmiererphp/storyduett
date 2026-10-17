export interface SafeUseCase {
  id: string;
  name: string;
  version: number;
  enabled: boolean;
  language: string;
}

export interface CatalogResponse {
  schemaVersion: string;
  delivery: string;
  useCases: SafeUseCase[];
}

export interface HealthResponse {
  status: 'ok' | 'error';
  version: string;
  delivery: string;
  timestamp: string;
  catalogUseCasesCount: number;
}

export type Locale = 'de' | 'en' | 'ru';
