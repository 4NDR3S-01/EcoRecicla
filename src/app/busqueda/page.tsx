"use client";
import { useState, useEffect, useMemo } from "react";
import { useAppContext } from "@/components/AppProvider";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabaseClient";

const searchTranslations = {
  es: {
    title: "Búsqueda",
    subtitle: "Encuentra información, recursos o preguntas frecuentes",
    placeholder: "¿Qué deseas buscar?",
    button: "Buscar",
    noResults: "No se encontraron resultados para tu búsqueda.",
    results: "Resultados de búsqueda",
    filters: {
      title: "Filtros",
      all: "Todos",
      faq: "Preguntas Frecuentes",
    },
    categories: {
      faq: "Preguntas Frecuentes",
    },
    recentSearches: "Búsquedas Recientes",
    clearHistory: "Limpiar Historial",
    searchHistory: "Historial de Búsquedas",
  },
  en: {
    title: "Search",
    subtitle: "Find information, resources or FAQs",
    placeholder: "What are you looking for?",
    button: "Search",
    noResults: "No results found for your search.",
    results: "Search results",
    filters: {
      title: "Filters",
      all: "All",
      faq: "FAQ",
    },
    categories: {
      faq: "Frequently Asked Questions",
    },
    recentSearches: "Recent Searches",
    clearHistory: "Clear History",
    searchHistory: "Search History",
  },
} as const;

export default function SearchPage() {
  const { lang } = useAppContext();
  const t = searchTranslations[lang];
  const [query, setQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [faqs, setFaqs] = useState<{ id: number; question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar historial desde localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("search-history");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Guardar historial en localStorage
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem("search-history", JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  // Cargar FAQs desde Supabase
  useEffect(() => {
    async function fetchFaqs() {
      setLoading(true);
      const { data, error } = await supabase.from("faqs").select("id, question, answer").order("id");
      setFaqs(data || []);
      setLoading(false);
    }
    fetchFaqs();
  }, []);

  // Función de búsqueda real solo sobre FAQs
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return [];
    const searchTerms = searchQuery.toLowerCase().split(" ");
    return faqs.filter(item => {
      const searchableText = `${item.question} ${item.answer}`.toLowerCase();
      return searchTerms.every(term => searchableText.includes(term));
    });
  };

  // Resultados de búsqueda
  const searchResults = useMemo(() => {
    return performSearch(query);
  }, [query, faqs]);

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Agregar a historial si no existe
      if (!searchHistory.includes(query.trim())) {
        const newHistory = [query.trim(), ...searchHistory.slice(0, 9)]; // Mantener solo 10 elementos
        setSearchHistory(newHistory);
      }
      setShowHistory(false);
    }
  };

  // Limpiar historial
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("search-history");
  };

  // Seleccionar búsqueda del historial
  const selectFromHistory = (historyItem: string) => {
    setQuery(historyItem);
    setShowHistory(false);
  };

  const filters = [
    { key: "all", label: t.filters.all },
    { key: "faq", label: t.filters.faq },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 dark:from-primary/10 dark:via-background dark:to-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Barra de búsqueda */}
          <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t.placeholder}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowHistory(e.target.value === "");
                    }}
                    onFocus={() => setShowHistory(true)}
                    className="w-full pr-12"
                  />
                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3"
                    size="sm"
                  >
                    {t.button}
                  </Button>
                </div>

                {/* Historial de búsquedas */}
                {showHistory && searchHistory.length > 0 && (
                  <div className="absolute z-10 w-full bg-card border rounded-lg shadow-lg mt-1">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-foreground">{t.recentSearches}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearHistory}
                          className="text-xs"
                        >
                          {t.clearHistory}
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {searchHistory.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => selectFromHistory(item)}
                            className="w-full text-left p-2 hover:bg-muted rounded text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Resultados */}
          {query.trim() && (
            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {t.results} ({searchResults.length})
                </h2>
              </div>

              {loading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Cargando...
                    </h3>
                  </CardContent>
                </Card>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <Card key={result.id} className="hover-lift transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground text-lg mb-2">
                              {result.question}
                            </h3>
                          </div>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {t.categories.faq}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground">
                            <p className="line-clamp-3">{result.answer}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {t.noResults}
                    </h3>
                    <p className="text-muted-foreground">
                      Intenta con términos diferentes
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Sugerencias cuando no hay búsqueda */}
          {!query.trim() && (
            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <Card>
                <CardHeader>
                  <CardTitle>💡 Sugerencias de búsqueda</CardTitle>
                  <CardDescription>
                    Busca preguntas frecuentes sobre reciclaje
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={() => {
                        setQuery("");
                      }}
                    >
                      <div className="text-left">
                        <div className="font-medium">{t.categories.faq}</div>
                        <div className="text-xs text-muted-foreground">
                          Explora preguntas frecuentes
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 