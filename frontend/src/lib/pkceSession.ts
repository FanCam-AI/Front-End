let pkceVerifier: string | null = null;

export function setPkceVerifier(verifier: string) {
  pkceVerifier = verifier;
}

export function getPkceVerifier(): string | null {
  return pkceVerifier;
}

export function clearPkceVerifier() {
  pkceVerifier = null;
}