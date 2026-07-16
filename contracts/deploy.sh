#!/bin/bash
set -e

echo "==> Building contracts..."
# The script is in the contracts directory, so we don't need to cd contracts
cargo build --target wasm32-unknown-unknown --release
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/worksafe_escrow_contract.wasm

# Ensure deployer keys exist
if ! stellar keys ls | grep -q "deployer"; then
    echo "Generating deployer keys..."
    stellar keys generate deployer --network testnet
    stellar keys fund deployer --network testnet
fi

DEPLOYER="deployer"

echo "==> Deploying WorkSafe Escrow Contract..."
CONTRACT_ID=$(stellar contract deploy --wasm target/wasm32-unknown-unknown/release/worksafe_escrow_contract.optimized.wasm --source $DEPLOYER --network testnet)
echo "Contract deployed at: $CONTRACT_ID"

echo ""
echo "=================================================="
echo " Deployment complete"
echo "=================================================="
echo " CONTRACT_ID: $CONTRACT_ID"
echo "=================================================="
