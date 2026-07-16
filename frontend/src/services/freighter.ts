import {
  isConnected,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import { Horizon } from "@stellar/stellar-sdk";

export const EXPECTED_NETWORK = "TESTNET";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export async function isFreighterInstalled(): Promise<boolean> {
  const result = await isConnected();
  return result.isConnected;
}

export async function connectWallet(): Promise<string> {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new Error(
      "Freighter wallet not found. Install the Freighter browser extension to continue."
    );
  }
  const result = await requestAccess();
  if ("error" in result) {
    throw new Error(result.error);
  }
  return result.address;
}

export async function getPublicKey(): Promise<string | null> {
  const installed = await isFreighterInstalled();
  if (!installed) return null;
  const result = await getAddress();
  if ("error" in result) return null;
  return result.address || null;
}

export async function checkNetwork(): Promise<{ ok: boolean; network: string }> {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new Error("Freighter wallet not found.");
  }
  const { network } = await getNetwork();
  return { ok: network === EXPECTED_NETWORK, network };
}

export async function signTransaction(
  xdr: string,
  networkPassphrase: string
): Promise<string> {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new Error("Freighter wallet not found.");
  }
  const result = await freighterSignTransaction(xdr, { networkPassphrase });
  if ("error" in result) {
    throw new Error(result.error);
  }
  return result.signedTxXdr;
}

export async function getNativeBalance(address: string): Promise<string> {
  try {
    const account = await server.loadAccount(address);
    const nativeBalance = account.balances.find((b) => b.asset_type === "native");
    return nativeBalance ? nativeBalance.balance : "0.0000000";
  } catch (error) {
    console.error("Failed to fetch balance:", error);
    return "0.0000000";
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
