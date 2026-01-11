"use client";

import { useEffect, useState } from "react";
import {
  TokenMetadata,
  TokenValidation,
  fetchTokenMetadata,
  validateTokenContract,
  getKnownTokens,
  searchKnownTokens,
} from "@/lib/token-utils";

export interface TokenSelectorProps {
  value?: TokenMetadata;
  onChange: (token: TokenMetadata | null) => void;
  placeholder?: string;
  disabled?: boolean;
  excludeTokens?: string[]; // contract addresses to exclude
}

export function TokenSelector({
  value,
  onChange,
  placeholder = "Enter token contract address",
  disabled = false,
  excludeTokens = [],
}: TokenSelectorProps) {
  const [inputValue, setInputValue] = useState(value?.contractAddress || "");
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<TokenValidation | null>(null);
  const [metadata, setMetadata] = useState<TokenMetadata | null>(value || null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [knownTokens, setKnownTokens] = useState<TokenMetadata[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<TokenMetadata[]>([]);

  useEffect(() => {
    // Load known tokens
    const tokens = getKnownTokens().filter(
      (token) => !excludeTokens.includes(token.contractAddress)
    );
    setKnownTokens(tokens);
    setFilteredTokens(tokens);
  }, [excludeTokens]);

  useEffect(() => {
    if (value) {
      setInputValue(value.contractAddress);
      setMetadata(value);
      setValidation({ isValid: true, implementsSip010: true });
    }
  }, [value]);

  const handleInputChange = async (contractAddress: string) => {
    setInputValue(contractAddress);
    setValidation(null);
    setMetadata(null);
    onChange(null);

    if (!contractAddress.trim()) {
      setFilteredTokens(knownTokens);
      setShowDropdown(true);
      return;
    }

    // Filter known tokens
    const filtered = searchKnownTokens(contractAddress).filter(
      (token) => !excludeTokens.includes(token.contractAddress)
    );
    setFilteredTokens(filtered);
    setShowDropdown(true);

    // Validate contract
    if (contractAddress.includes(".")) {
      setIsValidating(true);
      try {
        const validationResult = await validateTokenContract(contractAddress);
        setValidation(validationResult);

        if (validationResult.isValid) {
          const tokenMetadata = await fetchTokenMetadata(contractAddress);
          setMetadata(tokenMetadata);
          onChange(tokenMetadata);
        }
      } catch (error) {
        setValidation({
          isValid: false,
          implementsSip010: false,
          error: "Failed to validate token",
        });
      } finally {
        setIsValidating(false);
      }
    }
  };

  const handleTokenSelect = (token: TokenMetadata) => {
    setInputValue(token.contractAddress);
    setMetadata(token);
    setValidation({ isValid: true, implementsSip010: true });
    setShowDropdown(false);
    onChange(token);
  };

  const getValidationColor = () => {
    if (isValidating) return "border-yellow-500";
    if (validation?.isValid) return "border-green-500";
    if (validation && !validation.isValid) return "border-red-500";
    return "border-gray-500";
  };

  const getValidationMessage = () => {
    if (isValidating) return "Validating...";
    if (validation?.isValid) return "Valid SIP-010 token";
    if (validation?.error) return validation.error;
    return "";
  };

  return (
    <div className="relative">
      <div className="flex flex-col gap-1">
        <input
          type="text"
          className={`border-2 rounded-lg px-4 py-2 text-black ${getValidationColor()} ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          disabled={disabled}
        />

        {metadata && (
          <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-sm">
            <span className="font-semibold">{metadata.symbol}</span>
            <span className="text-gray-600">{metadata.name}</span>
            <span className="text-gray-500">({metadata.decimals} decimals)</span>
          </div>
        )}

        {validation && (
          <div
            className={`text-sm px-2 ${
              validation.isValid ? "text-green-600" : "text-red-600"
            }`}
          >
            {getValidationMessage()}
          </div>
        )}

        {showDropdown && filteredTokens.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
            {filteredTokens.map((token) => (
              <div
                key={token.contractAddress}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleTokenSelect(token)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-sm text-gray-600">{token.name}</div>
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-32">
                    {token.contractAddress}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}