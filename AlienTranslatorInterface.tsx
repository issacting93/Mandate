import { useState, useCallback, useEffect } from "react";
import { TerminalPanel } from "./ui/TerminalPanel";
import { MessageButton } from "./MessageSidebar";
import { DictionarySidebar } from "./DictionarySidebar";
import { TransmissionRenderer } from "./translation/TransmissionRenderer";
import { GlyphAnalysisModal } from "./modals/GlyphAnalysisModal";
import { AnimatedHexagonSelector } from "./hexagon/AnimatedHexagonSelector";
import { TranslationControls } from "./translation/TranslationControls";
import GlyphLambdaTabs from "./GlyphLambdaTabs";
import { BackgroundMusic } from "./BackgroundMusic";
import WelcomeModal from "./WelcomeModal";
import EncounterStartOverlay from "./EncounterStartOverlay";
import { useGameEngine } from "../src/services/gameEngineService";

// Constants
const INITIAL_TERMINAL_MESSAGES = [
  '[2157.03.15 14:23:07] INCOMING TRANSMISSION STATUS: ACTIVE',
  '[2157.03.15 14:23:07] TRANSLATION INTERFACE INITIALIZED',
  '[2157.03.15 14:23:07] GLYPH DATABASE ONLINE'
];

const END_GAME_DELAY = 2000;

// Utility functions
const createTerminalMessage = (message: string) => `[${new Date().toISOString()}] ${message}`;

const isEndGameCondition = (synchronizedCount: number, totalTransmissions: number) => 
  synchronizedCount >= totalTransmissions && totalTransmissions > 0;

export default function AlienTranslatorInterface() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showEncounterStart, setShowEncounterStart] = useState(true);
  
  const {
    gameState,
    selectGlyph,
    selectTransmission,
    assignMeaning,
    nextTransmission,
    viewTransmission,
    debugGlyphUnlocking,
    forceUnlockAllGlyphs
  } = useGameEngine();

  const [terminalMessages, setTerminalMessages] = useState<string[]>(INITIAL_TERMINAL_MESSAGES);

  const [showGlyphModal, setShowGlyphModal] = useState(false);
  const [modalGlyph, setModalGlyph] = useState<any>(null);

  const handleGlyphClick = useCallback((glyphId: string) => {
    selectGlyph(glyphId);
  }, [selectGlyph]);

  const handleAssignMeaning = useCallback((glyphId: string, meaning: string) => {
    assignMeaning(glyphId, meaning);
    
    // Add terminal message for successful translation
    setTerminalMessages(prev => [...prev, createTerminalMessage(`GLYPH "${glyphId}" TRANSLATED AS "${meaning}"`)]);
  }, [assignMeaning]);

  // Wrapper for hexagon selector that converts meaning selection to glyph assignment
  const handleHexagonSelect = useCallback((hexagonId: string) => {
    if (!gameState?.selectedGlyph) return;
    
    // Check if this is the correct answer (no "decoy-" prefix)
    if (!hexagonId.startsWith('decoy-')) {
      // This is the correct answer, assign the meaning
      console.log('✅ Correct answer selected:', hexagonId);
      handleAssignMeaning(gameState.selectedGlyph, hexagonId);
    } else {
      // This is a wrong answer, don't assign anything
      console.log('❌ Wrong answer selected:', hexagonId);
      setTerminalMessages(prev => [...prev, createTerminalMessage(`INCORRECT SELECTION: "${hexagonId.replace('decoy-', '')}"`)]);
    }
  }, [gameState?.selectedGlyph, handleAssignMeaning]);

  // Wrapper for modal that matches its expected signature
  const handleModalAssignMeaning = useCallback((meaning: string) => {
    if (gameState?.selectedGlyph) {
      handleAssignMeaning(gameState.selectedGlyph, meaning);
    }
  }, [gameState?.selectedGlyph, handleAssignMeaning]);

  const handleTransmissionComplete = useCallback((_transmission: any, accuracy: number) => {
    // Add terminal message for transmission synchronization
    setTerminalMessages(prev => [...prev, createTerminalMessage(`TRANSMISSION SYNCHRONIZED - ACCURACY: ${accuracy}%`)]);
  }, []);

  const handleCloseGlyphModal = useCallback(() => {
    setShowGlyphModal(false);
    setModalGlyph(null);
  }, []);

  const handleNextTransmission = useCallback(() => {
    nextTransmission();
    // Add terminal message for unlocking next transmission
    setTerminalMessages(prev => [...prev, 'UNLOCKING NEXT TRANSMISSION...']);
  }, [nextTransmission]);

  // Get the currently selected glyph for the hexagon selector
  const selectedGlyph = gameState?.selectedGlyph ? gameState.lexicon.get(gameState.selectedGlyph) : null;

  // Expose debug functions globally for testing
  useEffect(() => {
    (window as any).debugGlyphUnlocking = debugGlyphUnlocking;
    (window as any).forceUnlockAllGlyphs = forceUnlockAllGlyphs;
    (window as any).testUnlockingMechanics = () => {
      console.log('🧪 Testing unlocking mechanics...');
      console.log('📊 Current game state:', gameState);
      console.log('📊 Current lexicon size:', gameState?.lexicon?.size);
      console.log('📊 Unlocked glyphs in lexicon:', 
        Array.from(gameState?.lexicon?.entries() || [])
          .filter(([_, glyph]) => glyph.isUnlocked)
          .map(([id, _]) => id)
      );
    };
    (window as any).triggerEndGame = () => {
      window.location.href = '/audio/end-game.html';
    };
  }, [debugGlyphUnlocking, forceUnlockAllGlyphs, gameState]);

  // Monitor for end game condition
  useEffect(() => {
    const synchronizedCount = gameState?.synchronizedTransmissions?.size || 0;
    const totalTransmissions = gameState?.transmissions?.length || 0;
    
    if (isEndGameCondition(synchronizedCount, totalTransmissions)) {
      // Add terminal message
      setTerminalMessages(prev => [...prev, createTerminalMessage('🎉 ALL TRANSMISSIONS SYNCHRONIZED!')]);
      setTerminalMessages(prev => [...prev, createTerminalMessage('🚀 INITIATING END GAME SEQUENCE...')]);
      
      // Add a small delay to allow the UI to update before redirecting
      setTimeout(() => {
        window.location.href = '/audio/end-game.html';
      }, END_GAME_DELAY);
    }
  }, [gameState?.synchronizedTransmissions?.size, gameState?.transmissions?.length]);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ 
      background: '#080C10',
      fontFamily: '"TheGoodMonolith", monospace',
      color: '#f3ede9'
    }}>
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(to right, rgba(255, 240, 230, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 240, 230, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>

      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcomeModal}
        onClose={() => {
          setShowWelcomeModal(false);
        }}
      />

      {/* Encounter Start Overlay */}
      <EncounterStartOverlay
        isOpen={showEncounterStart}
        onClose={() => setShowEncounterStart(false)}
      />

      {/* Background Music */}
      <BackgroundMusic 
        audioSrc="/audio/encounter-2.mp3"
        volume={0.2}
        loop={true}
        autoPlayOnFirstClick={true}
      />

      {/* Main Content Area - 3 Column Layout */}
      <div className="relative z-10 w-full h-full flex">
        {/* Left Sidebar */}
        <div className="w-80 h-full flex flex-col">
          <MessageButton
            transmissions={gameState.transmissions}
            currentTransmission={gameState.currentTransmission}
            onSelect={selectTransmission}
            gameState={gameState}
            viewTransmission={viewTransmission}
          />
        </div>

        {/* Center Content */}
        <div className="flex-1 h-full flex flex-col">
          {/* GlyphLambdaTabs - Top Section */}
          <div className="h-auto max-h-[40px] p-4">
            <GlyphLambdaTabs />
          </div>
          
          {/* Transmission Renderer - Middle Section */}
          <div className="h-1/3 p-4 overflow-y-auto">
            <TransmissionRenderer
              currentTransmission={gameState?.currentTransmission}
              gameState={gameState}
              onGlyphClick={handleGlyphClick}
              onTransmissionComplete={handleTransmissionComplete}
              onAssignMeaning={handleAssignMeaning}
              onNextTransmission={nextTransmission}
            />
          </div>

          {/* Hexagon Selector - Middle Section */}
          <div className="h-1/3 p-4">
            <AnimatedHexagonSelector
              selectedHexagon={gameState?.selectedGlyph || null}
              onHexagonSelect={handleHexagonSelect}
              selectedGlyph={selectedGlyph}
              className="w-full h-full"
            />
          </div>

          {/* Translation Controls - Bottom Section */}
          <div className="h-1/6 p-4">
            <TranslationControls
              currentTransmission={gameState?.currentTransmission}
              gameState={gameState}
              onNextTransmission={handleNextTransmission}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 h-full flex flex-col">
          <DictionarySidebar />
        </div>
      </div>

      {/* Glyph Analysis Modal */}
      {showGlyphModal && modalGlyph && (
        <GlyphAnalysisModal
          glyph={modalGlyph}
          onAssignMeaning={handleModalAssignMeaning}
          onClose={handleCloseGlyphModal}
        />
      )}
      
      {/* Terminal Panel - Fixed to Bottom Left of Screen */}
      <div className="fixed bottom-6 left-6 z-50 max-w-[320px] pointer-events-auto">
        <TerminalPanel messages={terminalMessages} />
      </div>
    </div>
  );
}