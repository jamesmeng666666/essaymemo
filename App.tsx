import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Simple ID generator logic can be replaced if library not available, but assuming environment supports basic JS.
import { ESSAY_1_TITLE, ESSAY_1_CONTENT, ESSAY_2_TITLE, ESSAY_2_CONTENT } from './constants';
import { Essay, PracticeMode, Token, UserAnswers, VerificationResult } from './types';
import { analyzeTextForMemorization, analyzeTextForTranslation, generateSpeech } from './services/geminiService';
import { decodeAudioData, playAudioBuffer, getAudioContext, stopAudio } from './services/audioService';

// --- Icons ---
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// --- Helpers ---
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const normalizeText = (text: string) => {
    return text.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
};

// --- Components ---

export default function App() {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [activeEssayId, setActiveEssayId] = useState<string | null>(null);
  const [mode, setMode] = useState<PracticeMode>(PracticeMode.READ);
  
  // UI State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // State for practice
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [results, setResults] = useState<VerificationResult | null>(null);
  const [score, setScore] = useState<number | null>(null);

  // State for Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const shouldPlayRef = useRef(false);

  // Initialization
  useEffect(() => {
    const savedEssays = localStorage.getItem('memomaster_essays');
    if (savedEssays) {
      const parsed = JSON.parse(savedEssays);
      setEssays(parsed);
      if (parsed.length > 0) setActiveEssayId(parsed[0].id);
    } else {
      // Load initial essays if none exist
      const id1 = generateId();
      const id2 = generateId(); // Ensure unique IDs

      const essay1: Essay = {
        id: id1,
        title: ESSAY_1_TITLE,
        rawContent: ESSAY_1_CONTENT,
        tokens: [],
        sentences: [],
        isAnalyzed: false,
        createdAt: Date.now()
      };

      const essay2: Essay = {
        id: id2,
        title: ESSAY_2_TITLE,
        rawContent: ESSAY_2_CONTENT,
        tokens: [],
        sentences: [],
        isAnalyzed: false,
        createdAt: Date.now() + 1
      };

      setEssays([essay1, essay2]);
      setActiveEssayId(id1);
      
      // Analyze both initially
      analyzeEssay(essay1);
      setTimeout(() => analyzeEssay(essay2), 100); // Slight delay to prevent race conditions on very fast mounting/state updates
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to local storage whenever essays change
  useEffect(() => {
    if (essays.length > 0) {
      localStorage.setItem('memomaster_essays', JSON.stringify(essays));
    }
  }, [essays]);

  // Reset answers and STOP AUDIO when mode or essay changes
  useEffect(() => {
    setAnswers({});
    setResults(null);
    setScore(null);
    
    // Stop audio
    shouldPlayRef.current = false;
    stopAudio();
    setIsPlaying(false);
    
  }, [mode, activeEssayId]);

  const activeEssay = essays.find(e => e.id === activeEssayId);

  const analyzeEssay = async (essay: Essay) => {
    // If already analyzed, skip
    if (essay.isAnalyzed) return;

    try {
      // Parallel execution for grammar tokens and sentence translation
      const [tokens, sentences] = await Promise.all([
          analyzeTextForMemorization(essay.rawContent),
          analyzeTextForTranslation(essay.rawContent)
      ]);

      setEssays(prev => prev.map(e => e.id === essay.id ? { ...e, tokens, sentences, isAnalyzed: true } : e));
    } catch (err) {
      console.error("Analysis failed for essay:", essay.title, err);
      // We don't alert here for background initialization to avoid spamming alerts
    }
  };

  const handleAddEssay = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    setIsProcessing(true);
    try {
      const [tokens, sentences] = await Promise.all([
          analyzeTextForMemorization(newContent),
          analyzeTextForTranslation(newContent)
      ]);
      
      const newEssay: Essay = {
        id: generateId(),
        title: newTitle,
        rawContent: newContent,
        tokens,
        sentences,
        isAnalyzed: true,
        createdAt: Date.now()
      };
      setEssays(prev => [...prev, newEssay]);
      setActiveEssayId(newEssay.id);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewContent('');
      setMode(PracticeMode.READ);
    } catch (err) {
      alert("Failed to process essay. Ensure API Key is set.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteEssay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this essay?")) {
        const newEssays = essays.filter(ex => ex.id !== id);
        setEssays(newEssays);
        localStorage.setItem('memomaster_essays', JSON.stringify(newEssays));
        if (activeEssayId === id) {
            setActiveEssayId(newEssays.length > 0 ? newEssays[0].id : null);
        }
    }
  };

  const handleSelectEssayMobile = (id: string) => {
      setActiveEssayId(id);
      setIsMobileMenuOpen(false);
  }

  const handlePlayAudio = async () => {
    if (!activeEssay) return;
    
    // Toggle off
    if (isPlaying) {
        shouldPlayRef.current = false;
        stopAudio();
        // setIsPlaying(false) happens automatically via playAudioBuffer promise resolution when stopped
        return;
    }

    shouldPlayRef.current = true;
    setIsLoadingAudio(true);
    
    try {
        let base64 = activeEssay.audioBase64;

        // If not cached, generate it
        if (!base64) {
            base64 = await generateSpeech(activeEssay.rawContent);
            
            // Check if user cancelled
            if (!shouldPlayRef.current) {
                setIsLoadingAudio(false);
                return;
            }

            // Cache it
            setEssays(prev => prev.map(e => 
                e.id === activeEssay.id ? { ...e, audioBase64: base64 } : e
            ));
        }
        
        const ctx = getAudioContext();
        const buffer = await decodeAudioData(base64!, ctx);

        // Check again
        if (!shouldPlayRef.current) {
            setIsLoadingAudio(false);
            return;
        }

        setIsLoadingAudio(false);
        setIsPlaying(true);
        await playAudioBuffer(buffer);
        setIsPlaying(false);
        shouldPlayRef.current = false;
    } catch (err) {
        console.error(err);
        if (shouldPlayRef.current) {
            alert("Audio generation failed.");
            setIsLoadingAudio(false);
            setIsPlaying(false);
            shouldPlayRef.current = false;
        }
    }
  };

  const isTokenHidden = (token: Token) => {
    if (token.isSeparator) return false;
    
    const p = token.pos;
    if (mode === PracticeMode.READ || mode === PracticeMode.TRANSLATION) return false;
    
    // Level 1: Nouns
    if (mode === PracticeMode.LEVEL_1) {
        return p === 'noun';
    }
    
    // Level 2: Nouns + Verbs
    if (mode === PracticeMode.LEVEL_2) {
        return p === 'noun' || p === 'verb';
    }
    
    // Level 3: Nouns + Verbs + Adj + Adv
    if (mode === PracticeMode.LEVEL_3) {
        return p === 'noun' || p === 'verb' || p === 'adj' || p === 'adv';
    }

    return false;
  };

  const handleInputChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const checkAnswers = () => {
    if (!activeEssay) return;

    if (mode === PracticeMode.TRANSLATION) {
        checkTranslationAnswers();
        return;
    }
    
    let correctCount = 0;
    let totalHidden = 0;
    const newResults: VerificationResult = {};

    activeEssay.tokens.forEach(token => {
        if (isTokenHidden(token)) {
            totalHidden++;
            const userVal = (answers[token.id] || "").trim();
            const correctVal = token.text.trim();
            
            const cleanUser = normalizeText(userVal);
            const cleanCorrect = normalizeText(correctVal);

            const isCorrect = cleanUser === cleanCorrect;
            newResults[token.id] = isCorrect;
            if (isCorrect) correctCount++;
        }
    });

    setResults(newResults);
    setScore(totalHidden === 0 ? 100 : Math.round((correctCount / totalHidden) * 100));
  };

  const checkTranslationAnswers = () => {
      if (!activeEssay || !activeEssay.sentences) return;

      let correctCount = 0;
      let totalSentences = activeEssay.sentences.length;
      const newResults: VerificationResult = {};

      activeEssay.sentences.forEach(sent => {
          const userVal = (answers[sent.id] || "").trim();
          const cleanUser = normalizeText(userVal);
          const cleanCorrect = normalizeText(sent.english);
          
          const isCorrect = cleanUser === cleanCorrect;
          newResults[sent.id] = isCorrect;
          if (isCorrect) correctCount++;
      });
      
      setResults(newResults);
      setScore(totalSentences === 0 ? 100 : Math.round((correctCount / totalSentences) * 100));
  }

  // --- Render Helpers ---

  const renderToken = (token: Token) => {
    if (token.isSeparator) {
        // Replace newlines with <br/>
        if (token.text.includes('\n')) {
             return <br key={token.id} />;
        }
        return <span key={token.id} className="whitespace-pre">{token.text}</span>;
    }

    const hidden = isTokenHidden(token);

    if (hidden) {
        const isChecked = results !== null;
        const isCorrect = isChecked ? results[token.id] : undefined;
        
        let borderClass = "border-gray-300 focus:border-blue-500";
        let textClass = "text-gray-800";
        
        if (isChecked) {
            borderClass = isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50";
            textClass = isCorrect ? "text-green-700" : "text-red-700";
        }

        // Calculate width approx based on char length, min 30px
        const width = Math.max(30, token.text.length * 10) + "px";

        return (
            <span key={token.id} className="inline-block mx-1 relative group">
                <input
                    type="text"
                    value={answers[token.id] || ''}
                    onChange={(e) => handleInputChange(token.id, e.target.value)}
                    className={`border-b-2 outline-none text-center bg-transparent transition-colors px-1 ${borderClass} ${textClass}`}
                    style={{ width }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                />
                {isChecked && !isCorrect && (
                     <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {token.text}
                     </span>
                )}
            </span>
        );
    }

    return <span key={token.id} className="text-gray-800">{token.text}</span>;
  };

  const renderTranslationMode = () => {
    if (!activeEssay || !activeEssay.sentences) return null;
    
    return (
        <div className="space-y-6">
            {activeEssay.sentences.map((sent, idx) => {
                const isChecked = results !== null;
                const isCorrect = isChecked ? results[sent.id] : undefined;
                
                return (
                    <div key={sent.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                         <div className="mb-2 text-gray-500 text-sm font-semibold tracking-wide uppercase">Sentence {idx + 1}</div>
                         <div className="mb-3 text-lg font-medium text-gray-900">{sent.chinese}</div>
                         <textarea 
                             className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all resize-none text-lg ${
                                 isChecked 
                                    ? (isCorrect ? 'border-green-300 bg-green-50 focus:ring-green-200' : 'border-red-300 bg-red-50 focus:ring-red-200')
                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                             }`}
                             rows={2}
                             placeholder="Type the English translation..."
                             value={answers[sent.id] || ''}
                             onChange={(e) => handleInputChange(sent.id, e.target.value)}
                         />
                         {isChecked && !isCorrect && (
                             <div className="mt-2 text-green-700 bg-green-50 p-2 rounded-md border border-green-200 text-sm">
                                 <strong>Correct:</strong> {sent.english}
                             </div>
                         )}
                    </div>
                );
            })}
        </div>
    );
  };

  const SidebarContent = () => (
      <>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
            {essays.map(essay => (
                <div
                    key={essay.id}
                    onClick={() => {
                        if (window.innerWidth < 768) {
                           handleSelectEssayMobile(essay.id);
                        } else {
                           setActiveEssayId(essay.id);
                        }
                    }}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        activeEssayId === essay.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                    <span className="truncate pr-2">{essay.title}</span>
                    <button 
                        onClick={(e) => handleDeleteEssay(essay.id, e)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <TrashIcon />
                    </button>
                </div>
            ))}
        </div>

        <div className="p-4 border-t border-gray-100">
            <button
                onClick={() => {
                    setIsAddModalOpen(true);
                    setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors shadow-sm"
            >
                <PlusIcon /> New Essay
            </button>
        </div>
      </>
  );

  // --- Main Render ---

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h1 className="font-bold text-xl text-blue-600 tracking-tight">MemoMaster AI</h1>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b p-4 flex justify-between items-center z-20 relative shadow-sm">
             <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600 hover:text-blue-600">
                 <MenuIcon />
             </button>
             <h1 className="font-bold text-lg text-blue-600">MemoMaster AI</h1>
             <button onClick={() => setIsAddModalOpen(true)} className="text-blue-600">
                 <PlusIcon />
             </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                <div className="relative bg-white w-64 h-full shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h1 className="font-bold text-xl text-blue-600 tracking-tight">MemoMaster AI</h1>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <XIcon />
                        </button>
                    </div>
                    <SidebarContent />
                </div>
            </div>
        )}

        {/* Top Control Bar */}
        {activeEssay && (
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm z-10">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate max-w-xs sm:max-w-md">{activeEssay.title}</h2>
                <div className="text-sm text-gray-400 mt-1">
                    {activeEssay.tokens.length > 0 ? `${activeEssay.tokens.filter(t=>!t.isSeparator).length} words` : 'Processing...'}
                </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full no-scrollbar">
                <button
                    onClick={() => setMode(PracticeMode.READ)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === PracticeMode.READ ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Read
                </button>
                <button
                    onClick={() => setMode(PracticeMode.LEVEL_1)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === PracticeMode.LEVEL_1 ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    第一步
                </button>
                <button
                    onClick={() => setMode(PracticeMode.LEVEL_2)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === PracticeMode.LEVEL_2 ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    第二步
                </button>
                <button
                    onClick={() => setMode(PracticeMode.LEVEL_3)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === PracticeMode.LEVEL_3 ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    第三步
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1 flex-shrink-0"></div>
                <button
                    onClick={() => setMode(PracticeMode.TRANSLATION)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${mode === PracticeMode.TRANSLATION ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    汉译英
                </button>
            </div>
        </header>
        )}

        {/* Text Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
            <div className={`max-w-3xl mx-auto min-h-[50vh] ${mode !== PracticeMode.TRANSLATION ? 'bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 leading-loose text-lg text-gray-800' : ''}`}>
                {activeEssay ? (
                    !activeEssay.isAnalyzed ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                           <p>Analyzing grammar structure...</p>
                        </div>
                    ) : (
                        mode === PracticeMode.TRANSLATION ? (
                            renderTranslationMode()
                        ) : (
                            <div className="space-y-4">
                                <div className="font-serif leading-9">
                                    {activeEssay.tokens.map(token => renderToken(token))}
                                </div>
                            </div>
                        )
                    )
                ) : (
                   <div className="text-center text-gray-400 mt-20">No essay selected. Create one to start.</div>
                )}
            </div>
             {/* Spacer for bottom bar */}
             <div className="h-24"></div>
        </div>

        {/* Bottom Sticky Action Bar */}
        {activeEssay && activeEssay.isAnalyzed && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-4 pointer-events-none z-30">
                <div className="bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 rounded-full p-2 flex items-center gap-4 pointer-events-auto pr-6">
                    
                    {/* Audio Control (Only show in Read/Blank modes, usually not needed in Translation input mode, but good to have) */}
                    <button 
                        onClick={handlePlayAudio}
                        disabled={isLoadingAudio}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
                        title="Read Aloud (Gemini TTS)"
                    >
                        {isLoadingAudio ? <LoadingSpinner /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>

                    <div className="w-px h-6 bg-gray-300"></div>

                    {/* Check Action (Only in practice modes) */}
                    {mode !== PracticeMode.READ && (
                         <div className="flex items-center gap-4">
                            {score !== null && (
                                <div className={`font-bold text-lg ${score > 80 ? 'text-green-600' : 'text-orange-500'}`}>
                                    {score}%
                                </div>
                            )}
                            <button
                                onClick={checkAnswers}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium shadow-md transition-transform active:scale-95 whitespace-nowrap"
                            >
                                <CheckIcon /> <span className="hidden sm:inline">Check Answers</span><span className="sm:hidden">Check</span>
                            </button>
                         </div>
                    )}
                    
                    {mode === PracticeMode.READ && (
                        <span className="text-sm text-gray-500 font-medium px-2">Read Mode</span>
                    )}

                </div>
            </div>
        )}

        {/* Add Modal */}
        {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Essay</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. Unit 1: My School"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <textarea
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    rows={8}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    placeholder="Paste your essay here..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddEssay}
                            disabled={isProcessing || !newTitle || !newContent}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 ${
                                (isProcessing || !newTitle || !newContent) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                            }`}
                        >
                            {isProcessing ? <><LoadingSpinner /> Processing...</> : 'Add Essay'}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}