"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";
import { AdministrativeAddress } from "@/types/address";
import { AddressService } from "@/lib/address-service";

interface AddressSuggestion {
  address: string;
  displayName: string;
  lat: number;
  lng: number;
}

interface AddressAutoCompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: string, lat?: number, lng?: number) => void;
  administrativeArea?: AdministrativeAddress;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function AddressAutoComplete({
  value,
  onChange,
  onAddressSelect,
  administrativeArea,
  placeholder = "Nhập địa chỉ cụ thể...",
  disabled = false,
  className = "",
}: AddressAutoCompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      await searchAddresses(value);
    }, 300); // 300ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, administrativeArea]);

  const searchAddresses = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // Build search query with administrative context
      let searchQuery = query;

      if (administrativeArea) {
        // Add administrative context to improve search accuracy
        const addressParts = [];

        if (administrativeArea.ward?.name) {
          addressParts.push(administrativeArea.ward.name);
        }
        if (administrativeArea.district?.name) {
          addressParts.push(administrativeArea.district.name);
        }
        if (administrativeArea.province?.name) {
          addressParts.push(administrativeArea.province.name);
        }

        if (addressParts.length > 0) {
          searchQuery = `${query}, ${addressParts.join(", ")}`;
        }
      }

      // Use local API proxy to search for addresses (avoids CORS issues)
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `/api/address/search?q=${encodedQuery}&limit=5`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();

      const formattedSuggestions: AddressSuggestion[] = data.map(
        (item: any) => {
          // Extract meaningful address parts
          const address = item.address || {};
          const parts = [];

          if (address.house_number) parts.push(address.house_number);
          if (address.road) parts.push(address.road);
          if (address.suburb || address.neighbourhood) {
            parts.push(address.suburb || address.neighbourhood);
          }

          const mainAddress = parts.join(" ");
          const fullAddress = mainAddress || item.display_name.split(",")[0];

          return {
            address: fullAddress,
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          };
        }
      );

      setSuggestions(formattedSuggestions);
      setShowSuggestions(formattedSuggestions.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Address search error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    console.log("handleSuggestionClick called with:", suggestion);
    onChange(suggestion.address);
    onAddressSelect(suggestion.address, suggestion.lat, suggestion.lng);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleAddClick = () => {
    if (value.trim()) {
      onAddressSelect(value.trim());
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddClick();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleAddClick();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        // Check if click is inside suggestion dropdown
        const suggestionContainer = document.querySelector(
          ".suggestion-dropdown"
        );
        if (
          suggestionContainer &&
          suggestionContainer.contains(event.target as Node)
        ) {
          return; // Don't close if clicking inside suggestions
        }
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-8"
          />

          {isLoading && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        <Button
          onClick={handleAddClick}
          disabled={!value.trim() || disabled}
          size="default"
        >
          Thêm địa chỉ
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="suggestion-dropdown absolute top-full left-0 right-14 z-50 mt-1 p-0 shadow-lg border">
          <div className="max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                ref={(el) => (suggestionRefs.current[index] = el)}
                className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                  selectedIndex === index ? "bg-blue-50 border-blue-200" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Suggestion clicked:", suggestion);
                  handleSuggestionClick(suggestion);
                }}
                onMouseDown={(e) => {
                  // Prevent input blur when clicking on suggestion
                  e.preventDefault();
                }}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {suggestion.address}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.displayName}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Show administrative context hint */}
      {administrativeArea && (
        <div className="mt-2 text-xs text-gray-500">
          <span className="font-medium">Khu vực tìm kiếm:</span>{" "}
          {AddressService.formatFullAddress(
            administrativeArea.province,
            administrativeArea.district,
            administrativeArea.ward
          )}
        </div>
      )}
    </div>
  );
}
