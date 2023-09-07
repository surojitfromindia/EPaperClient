interface APIService {
  readonly urlFragment: string;
  abortGetRequest: () => void;
}

export type { APIService };
