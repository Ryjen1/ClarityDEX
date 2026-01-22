"use client";

import { useEffect, useState } from "react";
import { KNOWN_TOKENS, TokenMetadata, validateTokenContract, fetchTokenMetadata } from "@/lib/token-utils";

export interface TokenSelectorProps {
  value?: string;
  onChange: (token: string, metadata?: TokenMetadata) => void;
  allowCustom?: boolean;
  placeholder?: string;
}

export function TokenSelector({ value, onChange, allowCustom = false, placeholder = "Select token" }: TokenSelectorProps) {
  const [selectedToken, setSelectedToken] = useState<string>(value || "");
  const [customToken, setCustomToken] = useState<string>("");
  const [customMetadata, setCustomMetadata] = useState<TokenMetadata | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  const knownTokensList = Object.values(KNOWN_TOKENS);

  const handleKnownTokenChange = (tokenKey: string) => {
    const metadata = KNOWN_TOKENS[tokenKey];
    setSelectedToken(tokenKey);
    setCustomToken("");
    setCustomMetadata(null);
    setValidationError("");
    onChange(tokenKey, metadata);
  };

  const handleCustomTokenChange = async (contractAddress: string) => {
    setCustomToken(contractAddress);
    setSelectedToken("");
    setValidationError("");
    setIsValidating(true);

    if (!contractAddress.includes(".")) {
      setValidationError("Invalid contract format. Expected: address.contract-name");
      setIsValidating(false);
      return;
    }

    const [addr, name] = contractAddress.split(".");
    if (!addr || !name) {
      setValidationError("Invalid contract format. Expected: address.contract-name");
      setIsValidating(false);
      return;
    }

    const validation = await validateTokenContract(addr, name);
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid token contract");
      setCustomMetadata(null);
      setIsValidating(false);
      return;
    }

    const metadata = await fetchTokenMetadata(addr, name);
    if (!metadata) {
      setValidationError("Failed to fetch token metadata");
      setCustomMetadata(null);
      setIsValidating(false);
      return;
    }

    setCustomMetadata(metadata);
    setValidationError("");
    setIsValidating(false);
    onChange(contractAddress, metadata);
  };

  useEffect(() => {
    if (value && KNOWN_TOKENS[value]) {
      setSelectedToken(value);
    } else if (value) {
      setCustomToken(value);
      // Optionally validate on mount
    }
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <select
        className="border-2 border-gray-500 rounded-lg px-4 py-2 text-black"
        value={selectedToken}
        onChange={(e) => handleKnownTokenChange(e.target.value)}
      >
        <option value="" disabled>{placeholder}</option>
        {knownTokensList.map((token) => (
          <option key={token.contractAddress + "." + token.contractName} value={token.contractAddress + "." + token.contractName}>
            {token.symbol} - {token.name}
          </option>
        ))}
        {allowCustom && <option value="custom">Custom Token</option>}
      </select>

      {allowCustom && selectedToken === "custom" && (
        <div className="flex flex-col gap-1">
          <input
            type="text"
            className="border-2 border-gray-500 rounded-lg px-4 py-2 text-black"
            placeholder="Enter contract address (address.contract-name)"
            value={customToken}
            onChange={(e) => handleCustomTokenChange(e.target.value)}
          />
          {isValidating && <span className="text-yellow-500">Validating...</span>}
          {validationError && <span className="text-red-500">{validationError}</span>}
          {customMetadata && (
            <div className="text-green-500">
              Valid: {customMetadata.symbol} - {customMetadata.name} ({customMetadata.decimals} decimals)
            </div>
          )}
        </div>
      )}
    </div>
  );
}