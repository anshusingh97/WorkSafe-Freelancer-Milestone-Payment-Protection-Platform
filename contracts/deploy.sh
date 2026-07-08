#!/usr/bin/env bash
# Build and deploy the WorkSafe escrow contract to Stellar Testnet.
# Requires: rustup target add wasm32-unknown-unknown, and the `stellar` CLI
# (https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli).
set -euo pipefail

CONTRACT_DIR="worksafe_escrow_contract"
NETWORK="testnet"
SOURCE_ACCOUNT="${1:-worksafe-admin}"

echo "==> Building contract"
cd "$CONTRACT_DIR"
stellar contract build

WASM_PATH="target/wasm32-unknown-unknown/release/worksafe_escrow_contract.wasm"

echo "==> Optimizing wasm"
stellar contract optimize --wasm "$WASM_PATH"

OPTIMIZED_WASM="target/wasm32-unknown-unknown/release/worksafe_escrow_contract.optimized.wasm"

echo "==> Deploying to $NETWORK"
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$OPTIMIZED_WASM" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK")

echo "==> Deployed contract ID: $CONTRACT_ID"
echo "Save this as ESCROW_CONTRACT_ID in backend/.env"

echo "==> Initializing contract with admin"
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  -- initialize --admin "$(stellar keys address "$SOURCE_ACCOUNT")"

echo "==> Done. Contract initialized and ready."
