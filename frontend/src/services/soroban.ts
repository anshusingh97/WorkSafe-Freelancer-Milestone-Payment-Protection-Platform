import {
  Contract,
  nativeToScVal,
  xdr,
  rpc,
  TransactionBuilder,
  Networks,
  Address,
} from "@stellar/stellar-sdk";
import { signTransaction, connectWallet } from "./freighter";

export const CONTRACT_ID = "CAUEWAQAAARNEWO6GPEY6PUH3XVFJG47IVXY7MEAFTYLTYVVMJSUVWEZ";
export const TOKEN_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

const server = new rpc.Server("https://soroban-testnet.stellar.org");

async function buildAndSubmit(method: string, args: xdr.ScVal[]): Promise<string> {
  // Use connectWallet to explicitly ensure Freighter is unlocked and authorized
  const pubKey = await connectWallet();
  if (!pubKey) throw new Error("Freighter wallet not connected");

  // Fetch account sequence
  const account = await server.getAccount(pubKey);

  const contract = new Contract(CONTRACT_ID);
  const operation = contract.call(method, ...args);

  let tx = new TransactionBuilder(account, {
    fee: "1000", // baseline fee, simulated will update it
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  // Simulate to populate footprint and exact fee
  const simulated = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) {
    console.error("Simulation failed:", simulated);
    throw new Error(simulated.error || "Simulation failed");
  }

  // Assemble the final tx with footprint
  tx = rpc.assembleTransaction(tx, simulated as rpc.Api.SimulateTransactionSuccessResponse).build();

  // Sign with Freighter
  const signedXdr = await signTransaction(tx.toXDR(), Networks.TESTNET);
  const signedTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);

  // Submit to Soroban
  const response = await server.sendTransaction(signedTx as any);
  if (response.status === "ERROR") {
    throw new Error(`Submission failed: ${(response as any).errorResultXdr || "unknown error"}`);
  }

  // Wait for confirmation
  let statusResponse = await server.getTransaction(response.hash);
  while (statusResponse.status === "NOT_FOUND") {
    await new Promise((r) => setTimeout(r, 2000));
    statusResponse = await server.getTransaction(response.hash);
  }

  if (statusResponse.status === "FAILED") {
    throw new Error(`Transaction failed on chain: ${(statusResponse as any).resultXdr}`);
  }

  return response.hash;
}

export async function invokeCreateMilestone(
  milestoneId: number,
  clientAddress: string,
  freelancerAddress: string,
  amountXlm: number
): Promise<string> {
  // amount in stroops (1 XLM = 10_000_000 stroops)
  const amountStroops = Math.floor(amountXlm * 10000000);
  
  return buildAndSubmit("create_milestone", [
    nativeToScVal(milestoneId, { type: "u64" }),
    new Address(clientAddress).toScVal(),
    new Address(freelancerAddress).toScVal(),
    new Address(TOKEN_ID).toScVal(),
    nativeToScVal(amountStroops, { type: "i128" }),
  ]);
}

export async function invokeFundMilestone(milestoneId: number): Promise<string> {
  return buildAndSubmit("fund_milestone", [
    nativeToScVal(milestoneId, { type: "u64" }),
  ]);
}

export async function invokeSubmitWork(milestoneId: number): Promise<string> {
  return buildAndSubmit("submit_work", [
    nativeToScVal(milestoneId, { type: "u64" }),
  ]);
}

export async function invokeApproveAndRelease(milestoneId: number): Promise<string> {
  return buildAndSubmit("approve_and_release", [
    nativeToScVal(milestoneId, { type: "u64" }),
  ]);
}
