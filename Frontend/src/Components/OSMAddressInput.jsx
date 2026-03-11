import { useEffect, useMemo, useRef, useState } from "react";

export default function OSMAddressInput({
  value,
  onChange,
  placeholder = "Address",
  className = "",
  required = false,
  disabled = false,
  multiline = false,
  rows = 3,
}) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const onDocumentClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const shouldSearch = useMemo(() => query.trim().length >= 3, [query]);

  useEffect(() => {
    if (!shouldSearch || disabled) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
            query.trim()
          )}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [query, shouldSearch, disabled]);

  const notifyChange = (nextValue) => {
    if (typeof onChange === "function") {
      onChange(nextValue);
    }
  };

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    setQuery(nextValue);
    notifyChange(nextValue);
  };

  const handleSelectSuggestion = (displayName) => {
    setQuery(displayName);
    notifyChange(displayName);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const inputProps = {
    value: query,
    onChange: handleInputChange,
    placeholder,
    required,
    disabled,
    className,
  };

  return (
    <div className="relative" ref={containerRef}>
      {multiline ? <textarea {...inputProps} rows={rows} /> : <input type="text" {...inputProps} />}

      {isLoading && (
        <p className="mt-1 text-xs text-gray-500">Searching OpenStreetMap...</p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={`${suggestion.place_id}-${suggestion.osm_id}`}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion.display_name)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <p className="text-sm text-gray-800">{suggestion.display_name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
