import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, History, Bookmark, Gavel, Calendar, Globe, 
  CheckCircle2, Loader2, ChevronRight, Info, Sparkles, ArrowRight, ArrowLeft
} from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/services/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LegalResearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Mobile UI States
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Filter states
  const [jurisdiction, setJurisdiction] = useState("");
  const [year, setYear] = useState("");
  const [regulation, setRegulation] = useState("");

  // Bookmark and Expanded state
  const [savedCases, setSavedCases] = useState([]);
  const [expandedCase, setExpandedCase] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get("/research/history");
      if (Array.isArray(response.data)) {
        setHistory(response.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to fetch search history", err);
    }
  };

  const handleSearch = async (e, overrideQuery = null, overrideFilters = null) => {
    if (e) e.preventDefault();
    const searchQuery = overrideQuery !== null ? overrideQuery : query;
    if (!searchQuery.trim()) return;

    // Use overrides if provided (for history clicks), else current state
    const currentJurisdiction = overrideFilters?.jurisdiction !== undefined ? overrideFilters.jurisdiction : jurisdiction;
    const currentYear = overrideFilters?.year !== undefined ? overrideFilters.year : year;
    const currentRegulation = overrideFilters?.regulation !== undefined ? overrideFilters.regulation : regulation;

    setLoading(true);
    // Close mobile panels
    setShowFilters(false);
    setShowHistory(false);

    try {
      const response = await api.post("/research/search", {
        query: searchQuery,
        jurisdiction: currentJurisdiction || null,
        year: currentYear ? parseInt(currentYear) : null,
        regulation: currentRegulation || null,
      });
      setResults(response.data);
      fetchHistory(); 
    } catch (err) {
      console.error("Search failed", err);
      // Fallback empty result so UI doesn't crash on error
      setResults({ cases: [], total: 0, ai_summary: "Search failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const applyHistoryItem = (h) => {
    setQuery(h.query_text);
    if (h.filters) {
      setJurisdiction(h.filters.jurisdiction || "");
      setYear(h.filters.year || "");
      setRegulation(h.filters.regulation || "");
    } else {
      clearFilters();
    }
    handleSearch(null, h.query_text, h.filters || {});
  };

  const clearFilters = () => {
    setJurisdiction("");
    setYear("");
    setRegulation("");
  };

  const handleSaveCase = async (caseId) => {
    // Optimistic UI update
    const isSaved = savedCases.includes(caseId);
    if (isSaved) {
      setSavedCases(savedCases.filter(id => id !== caseId));
    } else {
      setSavedCases([...savedCases, caseId]);
    }
    
    try {
      if (!isSaved) {
        await api.post("/research/save-case", { case_id: caseId });
      }
    } catch (err) {
      console.error("Failed to save case", err);
      // Revert on failure
      if (isSaved) {
        setSavedCases([...savedCases, caseId]);
      } else {
        setSavedCases(savedCases.filter(id => id !== caseId));
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fdfbf9] dark:bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <Gavel className="h-6 w-6 text-orange-500" />
            <span className="text-lg font-bold tracking-tight">Legal Research</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Legal Research</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">AI-powered search for case law and legal precedents.</p>
          </div>
          <div className="flex gap-3 lg:hidden">
            <Button 
              variant={showFilters ? "default" : "outline"} 
              onClick={() => { setShowFilters(!showFilters); setShowHistory(false); }} 
              className={`rounded-xl px-5 h-10 font-medium transition-all ${showFilters ? "bg-[#ff5a1f] hover:bg-[#e64a13] text-white shadow-md border-none" : "bg-white text-gray-700 border-gray-200 shadow-sm hover:bg-gray-50 dark:bg-card dark:text-gray-300 dark:border-border/50"}`}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button 
              variant={showHistory ? "default" : "outline"} 
              onClick={() => { setShowHistory(!showHistory); setShowFilters(false); }} 
              className={`rounded-xl px-5 h-10 font-medium transition-all ${showHistory ? "bg-[#ff5a1f] hover:bg-[#e64a13] text-white shadow-md border-none" : "bg-white text-gray-700 border-gray-200 shadow-sm hover:bg-gray-50 dark:bg-card dark:text-gray-300 dark:border-border/50"}`}
            >
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Filters - Desktop or Mobile Toggled */}
          <AnimatePresence>
            {(showFilters || showHistory || window.innerWidth >= 1024) && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex flex-col gap-6 w-full lg:col-span-1 ${!showFilters && !showHistory ? 'hidden lg:flex' : 'flex'}`}
              >
                <Card className={`border-gray-200 shadow-sm bg-white dark:bg-card/50 dark:border-border/50 rounded-2xl ${!showFilters && 'hidden lg:block'}`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-[0.75rem] font-bold uppercase tracking-widest text-gray-500">
                      Search Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-0">
                    <div className="space-y-1.5">
                      <label className="text-[0.85rem] font-medium text-gray-900 dark:text-gray-300">Jurisdiction</label>
                      <select 
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[0.9rem] text-gray-800 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 appearance-none"
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}
                      >
                        <option value="">All Regions</option>
                        <option value="European Union">European Union</option>
                        <option value="USA - California">USA - California</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="France">France</option>
                        <option value="Ireland">Ireland</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[0.85rem] font-medium text-gray-900 dark:text-gray-300">Regulation</label>
                      <select 
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[0.9rem] text-gray-800 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 appearance-none"
                        value={regulation}
                        onChange={(e) => setRegulation(e.target.value)}
                      >
                        <option value="">All Regulations</option>
                        <option value="GDPR">GDPR</option>
                        <option value="CCPA">CCPA</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[0.85rem] font-medium text-gray-900 dark:text-gray-300">Year</label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 2019" 
                        className="bg-white border-gray-200 rounded-xl h-[42px] px-3 text-[0.9rem] text-gray-800 focus-visible:ring-orange-500"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                      />
                    </div>
                    <Button className="w-full mt-2 rounded-xl h-[44px] font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 border-none" variant="outline" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </CardContent>
                </Card>

                <Card className={`border-gray-200 shadow-sm bg-white dark:bg-card/50 dark:border-border/50 rounded-2xl overflow-hidden ${!showHistory && 'hidden lg:block'}`}>
                  <CardHeader className="pb-3 border-b border-gray-100 dark:border-border/10">
                    <CardTitle className="text-[0.75rem] font-bold uppercase tracking-widest text-gray-500">
                      Recent Searches
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 px-0">
                    <ScrollArea className="h-[230px]">
                      <div className="space-y-0.5 p-2">
                        {history.length > 0 ? history.map((h) => (
                          <button 
                            key={h.id}
                            onClick={() => applyHistoryItem(h)}
                            className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[0.9rem] hover:bg-gray-50 dark:hover:bg-muted/60 transition-colors"
                          >
                            <span className="pr-3 font-medium text-gray-900 dark:text-gray-300 line-clamp-2 wrap-break-word leading-relaxed">{h.query_text}</span>
                            <ArrowRight className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 mt-0.5" />
                          </button>
                        )) : (
                          <div className="text-sm text-center text-muted-foreground p-6">No recent searches</div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Search Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-gray-200 dark:border-border/50 dark:bg-card shadow-sm rounded-xl p-1.5 sm:p-2 mb-2">
               <form onSubmit={(e) => handleSearch(e)} className="flex items-center w-full">
                 <div className="flex-1 flex items-center">
                   <Search className="ml-4 h-5 w-5 text-gray-400" />
                   <Input 
                     placeholder="Search GDPR consent violations, CCPA opt-out cases..." 
                     className="h-12 border-none focus-visible:ring-0 shadow-none bg-transparent w-full text-[15px] dark:text-gray-100 placeholder:text-gray-400"
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                   />
                 </div>
                 <Button type="submit" size="lg" disabled={loading} className="px-6 shadow-md hover:shadow-lg transition-all h-12 bg-[#ff5a1f] hover:bg-[#e64a13] text-white rounded-[0.55rem] font-medium ml-2 shrink-0">
                   {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search Precedents"}
                 </Button>
               </form>
            </div>

            {/* Search Results */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-32 text-center border border-gray-200 dark:border-border/50 rounded-2xl bg-white dark:bg-card shadow-sm min-h-[500px]"
                >
                  <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-5" />
                  <h3 className="text-[1.35rem] font-bold text-gray-900 dark:text-gray-100">Analyzing Legal Precedents...</h3>
                  <p className="max-w-sm text-gray-500 mt-2.5 text-[0.95rem] leading-relaxed">
                    Our AI is currently synthesizing the court documents and rulings. Please hold on a moment.
                  </p>
                </motion.div>
              ) : !results ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-32 text-center border border-gray-200 dark:border-border/50 rounded-2xl bg-white dark:bg-card shadow-sm min-h-[500px]"
                >
                  <div className="mb-5 rounded-full bg-orange-50 dark:bg-primary/10 p-5 ring-1 ring-orange-100 dark:ring-primary/20">
                    <Gavel className="h-10 w-10 text-orange-400 opacity-90" />
                  </div>
                  <h3 className="text-[1.35rem] font-bold text-gray-900 dark:text-gray-100">Start your legal research</h3>
                  <p className="max-w-sm text-gray-500 mt-2.5 text-[0.95rem] leading-relaxed">
                    Enter a query to find relevant court rulings, or select a precedent from your history.
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key={`results-${query}-${Date.now()}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* AI Summary Section */}
                  {results?.ai_summary && (
                    <motion.div variants={itemVariants}>
                      <Card className="border-orange-200 bg-white dark:border-primary/20 dark:bg-card shadow-sm rounded-[1rem] overflow-hidden">
                        <CardHeader className="pb-2 pt-6 px-6">
                          <CardTitle className="flex items-center gap-2 text-[1.05rem] font-bold text-[#ea580c] dark:text-primary tracking-wide">
                            <Sparkles className="h-[1.1rem] w-[1.1rem]" />
                            AI Research Synthesis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 px-6 pb-6">
                          <p className="text-[0.92rem] leading-[1.8] text-gray-700 dark:text-foreground/80 whitespace-pre-wrap">
                            {results.ai_summary}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  <div key={results?.total} className="space-y-6">
                    <div className="flex items-center gap-4 pb-4">
                      <div className="h-px bg-gray-200 dark:bg-border flex-1" />
                      <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                        Found {results?.total ?? 0} relevant cases
                      </span>
                      <div className="h-px bg-gray-200 dark:bg-border flex-1" />
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      {Array.isArray(results?.cases) && results.cases.length > 0 ? (
                        results.cases.map((caseItem, idx) => (
                          <motion.div key={caseItem.id || idx} variants={itemVariants}>
                            <Card className="transition-all hover:border-orange-200 hover:shadow-md bg-white dark:bg-card/50 border-gray-200 dark:border-border/50 rounded-xl overflow-hidden block">
                              <CardHeader className="p-5 pb-0">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-4">
                                    {/* Title */}
                                    <CardTitle className="text-[1.35rem] font-bold text-gray-900 dark:text-white leading-tight">
                                      {caseItem.title || "Unnamed Case"}
                                    </CardTitle>
                                    
                                    {/* Metadata row */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                      <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> {caseItem.jurisdiction || "Unknown"}</span>
                                      <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {caseItem.year || "N/A"}</span>
                                      <span className="flex items-center gap-1.5 font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-md">
                                        <Gavel className="h-4 w-4" /> {caseItem.court || "Unknown"}
                                      </span>
                                    </div>

                                    {/* Badges row */}
                                    <div className="flex gap-2">
                                      <Badge variant="outline" className="bg-white dark:bg-background text-gray-700 dark:text-gray-300 font-medium px-3 py-1 border-gray-200 dark:border-border">
                                        {caseItem.regulation || "Regulation"}
                                      </Badge>
                                      <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 font-medium px-3 py-1">
                                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Validated Precedent
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Bookmark Button */}
                                  <button 
                                    onClick={() => handleSaveCase(caseItem.id)}
                                    className={`p-2 rounded-xl transition-colors focus:outline-none focus:ring-0 ${savedCases.includes(caseItem.id) ? 'bg-orange-50 text-orange-500 border border-orange-200 shadow-sm dark:bg-orange-500/10 dark:border-orange-500/30' : 'bg-transparent border border-transparent hover:bg-gray-50 text-gray-400 hover:text-orange-500 dark:text-gray-500 dark:hover:bg-muted/50'}`}
                                  >
                                    <Bookmark className={`h-5 w-5 ${savedCases.includes(caseItem.id) ? 'fill-current' : ''}`} strokeWidth={savedCases.includes(caseItem.id) ? 2 : 1.5} />
                                  </button>
                                </div>
                              </CardHeader>
                              
                              <CardContent className="p-5 pt-6 space-y-6">
                                {/* Key Ruling Section */}
                                <div className="space-y-3">
                                  <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <Info className="h-4 w-4 text-orange-500" /> KEY RULING
                                  </h4>
                                  <div className="bg-gray-50/50 dark:bg-muted/30 p-4 rounded-lg border-l-2 border-orange-400">
                                    <p className="text-gray-900 dark:text-gray-200 italic font-medium">"{caseItem.key_ruling || "No key ruling specified."}"</p>
                                  </div>
                                </div>
                                
                                {/* Case Summary Section */}
                                <div className="space-y-2">
                                  <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-gray-500">CASE SUMMARY</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {caseItem.summary || "No summary available."}
                                  </p>
                                </div>

                                {/* Expanded Full Judgment Section */}
                                <AnimatePresence>
                                  {expandedCase === caseItem.id && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-border/50">
                                        <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-gray-500 mb-2">FULL JUDGMENT</h4>
                                        <div className="bg-white dark:bg-card p-4 rounded-md border border-gray-100 dark:border-border/50 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                          {caseItem.full_text || "Full judgment text is not available for this case."}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </CardContent>
                              
                              <CardFooter className="p-5 pt-0 justify-end border-t border-gray-50 dark:border-border/20 mt-2">
                                <button 
                                  onClick={() => setExpandedCase(expandedCase === caseItem.id ? null : caseItem.id)}
                                  className="group flex items-center font-medium text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 transition-colors text-sm py-2"
                                >
                                  {expandedCase === caseItem.id ? "Hide Judgment" : "Read Full Judgment"}
                                  <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${expandedCase === caseItem.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                                </button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))
                      ) : (
                        results && <div className="text-center py-10 text-muted-foreground">No cases found matching your criteria. Try loosening your filters.</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
