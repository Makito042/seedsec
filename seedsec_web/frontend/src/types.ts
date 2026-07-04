export interface Box {
  t: number;
  l: number;
  w: number;
  h: number;
  label: string;
}

export interface Metric {
  label: string;
  class: string;
  confidence: string;
  latency: string;
  size: string;
  advisory: string;
  boxes?: Box[];
  faunaDensity?: string;
  bioticIndex?: string;
  acousticActivity?: string;
  dominantFauna?: string;
  waveformSeed?: number;
}

export interface Sample {
  image: string;
  online: Metric;
  offline: Metric;
  audioUrl?: string; // Optional simulated audio file or preset descriptor
}

export interface Samples {
  [key: string]: Sample;
}
