/**
 * Ethereum utilities powered by ethers.js and viem
 * OpenZeppelin contracts available for Solidity reference
 */
import { ethers } from "ethers";
import { formatEther, parseEther, isAddress, getAddress } from "viem";

// Get a read-only provider for Ethereum mainnet
export function getMainnetProvider() {
  return new ethers.JsonRpcProvider("https://eth.llamarpc.com");
}

// Fetch ETH balance for an address
export async function getEthBalance(address: string): Promise<string> {
  const provider = getMainnetProvider();
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

// Fetch current block number
export async function getBlockNumber(): Promise<number> {
  const provider = getMainnetProvider();
  return provider.getBlockNumber();
}

// Validate and checksum an Ethereum address
export function checksumAddress(address: string): string | null {
  if (!isAddress(address)) return null;
  return getAddress(address);
}

// Format wei to ETH (viem)
export function weiToEth(wei: bigint): string {
  return formatEther(wei);
}

// Parse ETH to wei (viem)
export function ethToWei(eth: string): bigint {
  return parseEther(eth);
}

// ERC-20 ABI subset (OpenZeppelin standard)
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

// Read ERC-20 token info
export async function getTokenInfo(tokenAddress: string) {
  const provider = getMainnetProvider();
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const [name, symbol, decimals] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
  ]);
  return { name, symbol, decimals: Number(decimals) };
}
