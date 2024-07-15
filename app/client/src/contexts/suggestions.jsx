import { createContext, useCallback, useContext, useState } from "react";
const SuggestionsContext = createContext(null);

export function useSuggestions() {
  return useContext(SuggestionsContext);
}

function validate(suggestion) {
  const errors = [];

  if (!suggestion.text.trim()) {
    errors.push(new Error("Please enter a suggestion."));
  }

  if (!suggestion.text.trim().length > 40) {
    errors.push(new Error("Suggestion too long (40 character limit)."));
  }

  if (errors.length) {
    throw errors;
  }

  return true;
}

export function SuggestionsProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [suggestions, setSuggestions] = useState([]);

  // NOTE: Must memoize to fix dependency warnings
  const readPage = useCallback(async (page, itemsPerPage) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/suggestion/all?page=${page}&itemsPerPage=${itemsPerPage}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      setSuggestions(data.suggestions);
      setPageCount(data.pageCount);
      setPage(page);
    } finally {
      setLoading(false);
    }
  }, []);

  async function saveSuggestion(suggestion) {
    try {
      setLoading(true);
      const response = await fetch("/api/suggestion", {
        method: suggestion.id ? "PUT" : "POST",
        body: JSON.stringify(suggestion),
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    } finally {
      setLoading(false);
    }
  }

  const deleteSuggestion = useCallback(async (suggestion) => {
    setLoading(true);

    try {
      const response = await fetch("/api/suggestion", {
        method: "DELETE",
        body: JSON.stringify(suggestion),
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SuggestionsContext.Provider
      value={{
        loading,
        suggestions,
        readPage,
        validate,
        page,
        pageCount,
        saveSuggestion,
        deleteSuggestion,
      }}
    >
      {children}
    </SuggestionsContext.Provider>
  );
}
