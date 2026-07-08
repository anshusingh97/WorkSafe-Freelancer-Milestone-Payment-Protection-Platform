// Thin wrapper around the Freighter browser extension's injected API.
// Freighter injects `window.freighterApi` (via @stellar/freighter-api under
// the hood in newer versions). We feature-detect rather than hard-import,
// so the app doesn't crash for users without the extension installed.

interface FreighterApi {
  isConnected(): Promise<{ isConnected: boolean }>;
  requestAccess(): Promise<{ address: string } | { error: string }>;
  getAddress(): Promise<{ address: string } | { error: string }>;
  getNetwork(): Promise<{ network: string; networkPassphrase: string }>;
  signTransaction(
    xdr: string,
    opts: { networkPassphrase: string }
  ): Promise<{ signedTxXdr: string } | { error: string }>;
}

declare global {
  interface Window {
    freighterApi?: FreighterApi;
  }
}

export const EXPECTED_NETWORK = "TESTNET";

export function isFreighterInstalled(): boolean {
  return typeof window !== "undefined" && !!window.freighterApi;
}

export async function connectWallet(): Promise<string> {
  if (!isFreighterInstalled()) {
    throw new Error(
      "Freighter wallet not found. Install the Freighter browser extension to continue."
    );
  }
  const result = await window.freighterApi!.requestAccess();
  if ("error" in result) {
    throw new Error(result.error);
  }
  return result.address;
}

export async function getPublicKey(): Promise<string | null> {
  if (!isFreighterInstalled()) return null;
  const result = await window.freighterApi!.getAddress();
  if ("error" in result) return null;
  return result.address || null;
}

export async function checkNetwork(): Promise<{ ok: boolean; network: string }> {
  if (!isFreighterInstalled()) {
    throw new Error("Freighter wallet not found.");
  }
  const { network } = await window.freighterApi!.getNetwork();
  return { ok: network === EXPECTED_NETWORK, network };
}

export async function signTransaction(
  xdr: string,
  networkPassphrase: string
): Promise<string> {
  if (!isFreighterInstalled()) {
    throw new Error("Freighter wallet not found.");
  }
  const result = await window.freighterApi!.signTransaction(xdr, { networkPassphrase });
  if ("error" in result) {
    throw new Error(result.error);
  }
  return result.signedTxXdr;
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
