const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
  retries = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Accept: "application/json",
          "User-Agent": DEFAULT_UA,
          ...(options.headers ?? {}),
        },
        next: { revalidate: 0 },
      });

      if (response.status === 429) {
        await sleep(2000 * (attempt + 1));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }

      const payload = (await response.json()) as T & {
        error?: string;
        status?: number;
      };

      if (payload?.status === 429) {
        await sleep(2000 * (attempt + 1));
        continue;
      }

      return payload;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries - 1) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }

  throw lastError ?? new Error(`Nepavyko gauti ${url}`);
}

export async function fetchText(
  url: string,
  options: RequestInit = {}
): Promise<string> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "text/html,application/json",
      "User-Agent": DEFAULT_UA,
      ...(options.headers ?? {}),
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.text();
}
