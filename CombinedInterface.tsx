import { useState, useCallback } from "react";
import { TerminalPanel } from "./ui/TerminalPanel";
import { MessageButton } from "./MessageSidebar";
import { DictionarySidebar } from "./DictionarySidebar";
import { TransmissionRenderer } from "./translation";
import { GlyphAnalysisModal } from "./modals";
import { AnimatedHexagonSelector } from "./hexagon";
import { TranslationControls } from "./translation";
import GlyphLambdaTabs from "./GlyphLambdaTabs";
import { BackgroundMusic } from "./BackgroundMusic";
import WelcomeModal from "./WelcomeModal";
import EncounterStartOverlay from "./EncounterStartOverlay";
import { useGameEngine } from "@/services/gameEngineService";
import { SoundShapeLanguage } from "./Lambda";
import dataService from "@/services/dataService";

// Constants
const INITIAL_TERMINAL_MESSAGES = [
  '[2157.03.15 14:23:07] INCOMING TRANSMISSION STATUS: ACTIVE',
  '[2157.03.15 14:23:07] TRANSLATION INTERFACE INITIALIZED',
  '[2157.03.15 14:23:07] GLYPH DATABASE ONLINE'
];

const END_GAME_DELAY = 2000;

// Utility functions
const createTerminalMessage = (message: string) => `[${new Date().toISOString()}] ${message}`;

export default function CombinedInterface() {
  const [activeTab, setActiveTab] = useState<'glyph' | 'lambda'>('glyph');
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showEncounterStart, setShowEncounterStart] = useState(true);

  const {
    gameState,
    selectGlyph,
    clearPersistentSelections,
    selectTransmission,
    viewTransmission,
    assignMeaning,
    calculateAccuracy,
    nextTransmission,
    addLog,
    markTransmissionSynchronized
  } = useGameEngine();

  const [terminalMessages, setTerminalMessages] = useState<string[]>(INITIAL_TERMINAL_MESSAGES);

  const [showGlyphModal, setShowGlyphModal] = useState(false);
  const [modalGlyph, setModalGlyph] = useState<any>(null);

  const handleTabChange = useCallback((tab: 'glyph' | 'lambda') => {
    setActiveTab(tab);
    setTerminalMessages(prev => [...prev, createTerminalMessage(`SWITCHED TO ${tab.toUpperCase()} INTERFACE`)]);
  }, []);

  const handleGlyphClick = useCallback((glyphId: string) => {
    // Debug: handleGlyphClick called
    selectGlyph(glyphId);
  }, [selectGlyph]);

  const handleAssignMeaning = useCallback((glyphId: string, meaning: string) => {
    assignMeaning(glyphId, meaning);

    // Add terminal message for successful translation
    setTerminalMessages(prev => [...prev, createTerminalMessage(`GLYPH "${glyphId}" TRANSLATED AS "${meaning}"`)]);
  }, [assignMeaning]);

  // ✅ NEW: Helper function to check transmission completion (non-blocking)
  const checkTransmissionCompletion = useCallback((transmission: any, translationState: Record<string, string>): boolean => {
    if (!transmission) return false;

    // Check if it's a narrative transmission
    if ('alienText' in transmission) {
      const narrativeTransmission = transmission as any;
      const glyphItems = narrativeTransmission.alienText.filter((item: any) =>
        item.type === 'glyph' && item.glyph
      );

      if (glyphItems.length === 0) return true; // No glyphs to translate

      // Check if all unlocked glyphs are translated
      const unlockedGlyphItems = glyphItems.filter((item: any) =>
        item.glyph && dataService.isGlyphUnlocked(item.glyph)
      );

      return unlockedGlyphItems.length > 0 &&
        unlockedGlyphItems.every((item: any) => translationState[item.glyph!]);
    }

    // Check if it's a legacy transmission
    if ('glyphs' in transmission) {
      const legacyTransmission = transmission as any;
      if (!legacyTransmission.glyphs || legacyTransmission.glyphs.length === 0) return true;

      const unlockedGlyphs = legacyTransmission.glyphs.filter((g: string) =>
        dataService.isGlyphUnlocked(g)
      );

      return unlockedGlyphs.length > 0 &&
        unlockedGlyphs.every(g => translationState[g]);
    }

    return false;
  }, []);

  // ✅ NEW: Helper function to get translation progress (matching TranslationControls logic)
  const getTranslationProgress = useCallback((transmission: any, translationState: Record<string, string>) => {
    if ('alienText' in transmission) {
      // Narrative transmission
      const glyphItems = transmission.alienText.filter((item: any) =>
        item.type === 'glyph' && item.glyph
      );

      if (glyphItems.length === 0) return { unlocked: 0, translated: 0, total: 0 };

      const unlockedGlyphItems = glyphItems.filter((item: any) =>
        item.glyph && dataService.isGlyphUnlocked(item.glyph)
      );
      const translatedGlyphs = unlockedGlyphItems.filter((item: any) =>
        translationState[item.glyph!]
      );

      return {
        unlocked: unlockedGlyphItems.length,
        translated: translatedGlyphs.length,
        total: glyphItems.length
      };
    } else if ('glyphs' in transmission) {
      // Legacy transmission
      const unlockedGlyphs = transmission.glyphs?.filter((g: string) => dataService.isGlyphUnlocked(g)) || [];
      const translatedGlyphs = unlockedGlyphs.filter((g: string) => translationState[g]);

      return {
        unlocked: unlockedGlyphs.length,
        translated: translatedGlyphs.length,
        total: transmission.glyphs?.length || 0
      };
    }

    return { unlocked: 0, translated: 0, total: 0 };
  }, []);

  // Wrapper for hexagon selector that converts meaning selection to glyph assignment
  const handleHexagonSelect = useCallback((hexagonId: string) => {
    if (!gameState?.selectedGlyph) return;

    // Check if this is the correct answer (no "decoy-" prefix)
    if (!hexagonId.startsWith('decoy-')) {
      // ✅ RESTORE: Allow translation immediately - no blocking synchronization
      console.log('✅ Correct answer selected:', hexagonId);
      handleAssignMeaning(gameState.selectedGlyph, hexagonId);
      selectGlyph(null); // Deselect the glyph

      // ✅ ENHANCED: Check if transmission is now complete (non-blocking)
      const currentTransmission = gameState.currentTransmission;
      if (currentTransmission) {
        console.log('🎯 Translation completed, checking transmission status...');

        // Check if this transmission is now complete
        const isComplete = checkTransmissionCompletion(currentTransmission, gameState.translationState);
        if (isComplete) {
          console.log('🎉 Transmission completed!');
          setTerminalMessages(prev => [...prev, createTerminalMessage(`🎉 TRANSMISSION COMPLETED! All glyphs translated successfully.`)]);

          // ✅ CRITICAL FIX: Mark transmission as synchronized when complete
          const transmissionId = typeof currentTransmission.id === 'string'
            ? parseInt(currentTransmission.id)
            : currentTransmission.id;

          if (transmissionId) {
            markTransmissionSynchronized(transmissionId);
          }

          // Could trigger celebration effects or unlock next transmission here
          // This is non-blocking - user can continue playing immediately
        }
      }
    } else {
      // This is a wrong answer, show feedback but don't assign meaning
      console.log('❌ Wrong answer selected:', hexagonId);
      setTerminalMessages(prev => [...prev, createTerminalMessage(`INCORRECT SELECTION: "${hexagonId}" IS NOT THE RIGHT MEANING`)]);
    }
  }, [gameState?.selectedGlyph, gameState?.currentTransmission, handleAssignMeaning, selectGlyph, checkTransmissionCompletion, gameState, markTransmissionSynchronized]);

  // Wrapper for modal that matches its expected signature
  const handleModalAssignMeaning = useCallback((meaning: string) => {
    if (gameState?.selectedGlyph) {
      handleAssignMeaning(gameState.selectedGlyph, meaning);
    }
  }, [gameState?.selectedGlyph, handleAssignMeaning]);

  const handleTransmissionComplete = useCallback((transmission: any, accuracy: number) => {
    // Mark the transmission as synchronized in the game state
    if (transmission?.id) {
      markTransmissionSynchronized(transmission.id);
    }

    // Add terminal message for transmission synchronization
    setTerminalMessages(prev => [...prev, createTerminalMessage(`TRANSMISSION SYNCHRONIZED - ACCURACY: ${accuracy}%`)]);
  }, [markTransmissionSynchronized]);

  const handleCloseGlyphModal = useCallback(() => {
    setShowGlyphModal(false);
    setModalGlyph(null);
  }, []);

  const handleNextTransmission = useCallback(() => {
    // ✅ STEP 1: Check if transmission is complete before proceeding
    if (gameState?.currentTransmission) {
      const progress = getTranslationProgress(gameState.currentTransmission, gameState.translationState);
      const isComplete = progress.translated === progress.unlocked && progress.unlocked > 0;

      if (isComplete) {
        // ✅ STEP 2: Mark as synchronized first
        const transmissionId = typeof gameState.currentTransmission.id === 'string'
          ? parseInt(gameState.currentTransmission.id)
          : gameState.currentTransmission.id;

        if (transmissionId) {
          markTransmissionSynchronized(transmissionId);
          setTerminalMessages(prev => [...prev, createTerminalMessage(`🎉 TRANSMISSION SYNCHRONIZED - PROCEEDING TO NEXT`)]);
        }
      } else {
        // ✅ STEP 3: Show error if not complete - don't proceed
        setTerminalMessages(prev => [...prev, createTerminalMessage(`⚠️ TRANSMISSION NOT COMPLETE - TRANSLATE ALL GLYPHS FIRST`)]);
        return; // Don't proceed to next transmission
      }
    }

    // ✅ STEP 4: Only proceed if transmission was synchronized
    nextTransmission();
    setTerminalMessages(prev => [...prev, createTerminalMessage(`🚀 UNLOCKING NEXT TRANSMISSION...`)]);
  }, [gameState?.currentTransmission, gameState?.translationState, markTransmissionSynchronized, nextTransmission]);

  const handleSoundShapeEndTransmission = useCallback(() => {
    console.log('SoundShape end transmission triggered');
    setTerminalMessages(prev => [...prev, createTerminalMessage('SOUND SHAPE END TRANSMISSION SEQUENCE INITIATED')]);

    // Add a small delay to allow the UI to update before redirecting
    setTimeout(() => {
      window.location.href = '/audio/end-game.html';
    }, END_GAME_DELAY);
  }, []);

  // Get the currently selected glyph for the hexagon selector
  const selectedGlyph = gameState?.selectedGlyph ? gameState.lexicon.get(gameState.selectedGlyph) : null;

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
          <div className="gridOverlay"></div>
          <div className="h-auto p-4">
            <GlyphLambdaTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Content based on active tab */}
          {activeTab === 'glyph' ? (
            <>
              {/* Transmission Renderer - Upper Section */}
              <div className="flex-[2] p-4 overflow-y-auto min-h-0">
                <TransmissionRenderer
                  currentTransmission={gameState?.currentTransmission}
                  gameState={gameState}
                  onGlyphClick={handleGlyphClick}
                  onTransmissionComplete={handleTransmissionComplete}
                  onAssignMeaning={handleAssignMeaning}
                  onNextTransmission={nextTransmission}
                />
              </div>

              {/* Hexagon Selector + Controls */}
              <div className="flex-[3] p-4 flex flex-col min-h-0">
                {/* Synchronization Status Indicator */}
                {gameState?.currentTransmission && (
                  <div className="mb-4 text-center">
                    {(() => {
                      const currentTransmissionId = gameState.currentTransmission?.id;
                      const numericId = typeof currentTransmissionId === 'string' ? parseInt(currentTransmissionId) : currentTransmissionId;
                      const isSync = numericId && gameState?.synchronizedTransmissions?.has(numericId);

                      // Calculate progress for current transmission
                      const allGlyphItems = gameState.currentTransmission?.alienText?.filter(item =>
                        item.type === 'glyph' && item.glyph
                      ) || [];
                      const unlockedGlyphItems = allGlyphItems.filter(item =>
                        dataService.isGlyphUnlocked(item.glyph!)
                      );
                      const totalUnlockedGlyphs = unlockedGlyphItems.length;
                      const totalGlyphs = allGlyphItems.length;
                      const translatedUnlockedGlyphs = unlockedGlyphItems.filter(item =>
                        item.glyph && gameState.translationState[item.glyph]
                      ).length;

                      // Hide status bar entirely if no glyphs
                      if (totalGlyphs === 0) return null;

                      return (
                        <div className={`px-4 py-2 rounded-lg font-bold text-center transition-all duration-300 text-sm tracking-wider ${isSync
                            ? 'bg-green-600 text-white shadow-lg'
                            : totalUnlockedGlyphs > 0 && translatedUnlockedGlyphs === totalUnlockedGlyphs
                              ? 'bg-green-600 text-white shadow-lg'
                              : totalUnlockedGlyphs > 0
                                ? 'bg-[rgba(255,78,66,0.15)] text-[#ff4e42] border border-[rgba(255,78,66,0.3)]'
                                : 'bg-[rgba(255,78,66,0.1)] text-[#c2b8b2] border border-[rgba(255,78,66,0.15)]'
                          }`}>
                          {isSync
                            ? 'TRANSMISSION SYNCHRONIZED'
                            : totalUnlockedGlyphs > 0 && translatedUnlockedGlyphs === totalUnlockedGlyphs
                              ? 'TRANSLATION COMPLETE'
                              : totalUnlockedGlyphs > 0 && translatedUnlockedGlyphs > 0
                                ? `TRANSLATING: ${translatedUnlockedGlyphs}/${totalUnlockedGlyphs}`
                                : totalUnlockedGlyphs > 0
                                  ? 'SELECT A GLYPH TO BEGIN'
                                  : `${totalGlyphs} LOCKED GLYPHS — VIEW OTHER TRANSMISSIONS FIRST`
                          }
                        </div>
                      );
                    })()}
                  </div>
                )}

                <AnimatedHexagonSelector
                  selectedHexagon={gameState?.selectedGlyph || null}
                  onHexagonSelect={handleHexagonSelect}
                  selectedGlyph={selectedGlyph}
                  className="w-full h-full"
                />

                {/* Translation Controls - directly under hexagon */}
                <div className="pt-2 pb-2 flex-shrink-0">
                  <TranslationControls
                    currentTransmission={gameState?.currentTransmission}
                    gameState={gameState}
                    onNextTransmission={handleNextTransmission}
                  />
                </div>
              </div>
            </>
          ) : (
            /* SoundShape Interface - Full Height */
            <div className="h-full">
              <SoundShapeLanguage
                onEndTransmission={handleSoundShapeEndTransmission}
                className="w-full h-full"
              />
            </div>
          )}
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

      {/* Terminal Panel - Bottom of left sidebar area */}
      <div className="fixed bottom-6 z-50 pointer-events-auto"
        style={{ left: '336px', maxWidth: '400px' }}>
        <TerminalPanel messages={terminalMessages} />
      </div>

      {/* Custom Styles for SoundShapeLanguage */}
      <style>{`
        .soundShapeLanguage {
          position: relative;
          width: 100%; 
          overflow: hidden; 
          color: #f3ede9;
          font-family: "TheGoodMonolith", monospace;
          text-transform: uppercase;
        }

        .loadingOverlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #080C10;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          transition: opacity 0.5s ease-out;
        }

        .loadingContainer {
          text-align: center;
          color: #ff4e42;
        }

        .preloaderCanvasContainer {
          margin-bottom: 1.25rem;
        }

        .preloaderCanvas {
          border: 1px solid #ff4e42;
          border-radius: 50%;
        }

        .loadingText {
          font-size: 0.875rem;
          color: #c2b8b2;
        }

        .threeContainer {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 1;
          cursor: grab;
          top: 0;
          left: 0;
        }

        .threeContainer:active {
          cursor: grabbing;
        }
        
        .threeContainer canvas {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }

        .gridOverlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(
              to right,
              rgba(255, 240, 230, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(to bottom, rgba(255, 240, 230, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .interfaceContainer {
          position: relative;
          width: 100%;
          
          z-index: 2;
          pointer-events: none;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .header {
          display: flex;
          justify-content: space-between;
          padding: 1.25rem;
        }

        .headerItem {
          font-size: 0.75rem;
          color: #c2b8b2;
        }

        .soundShapePanel {
            background: rgba(30, 26, 24, 0.7);
            border: 1px solid rgba(255, 78, 66, 0.3);
            border-radius: 5px;
            padding: 1.25rem;
            backdrop-filter: blur(8px);
            position: absolute;
            pointer-events: auto;
            z-index: 10;
            bottom: 0px;
            width: 100%;
            max-width: 400px;
            margin: auto;
            height: 450px;
            left: 0px;
            right: 0px;
        }

        .shapeInfoPanel { 
      
          width: 100%;
          background: rgba(30, 26, 24, 0.7);
          border: 1px solid rgba(255, 78, 66, 0.3);
          border-radius: 5px;
          padding: 1.25rem;
          backdrop-filter: blur(8px);
          pointer-events: auto;
          z-index: 10;
          display: none;
        }

        .panelHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          padding-bottom: 0.625rem;
          border-bottom: 1px solid rgba(255, 78, 66, 0.3);
        }

        .panelTitle {
          font-size: 0.875rem;
          color: #ff4e42;
        }

        .dragHandle {
          cursor: grab;
          color: #c2b8b2;
          font-size: 1.25rem;
          user-select: none;
        }

        .waveformContainer {
          position: relative;
          margin: 20px auto;
          border: 1px solid rgba(255, 78, 66, 0.3);
          background: rgba(0, 0, 0, 1);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0;
          overflow: hidden;
          backdrop-filter: blur(5px);
          width: 100%;
          max-width: 1600px;
        }

        .attributeContainer {
          margin: 20px auto;
          width: 100%;
          padding: 0;
          margin-left: 0px;
          margin-right: 0px;
          background: rgba(0, 0, 0, 1);
          border: 1px solid rgba(255, 78, 66, 0.3);
          max-width: 1600px;
        }

        .attributeFrame {
          padding: 15px;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 0;
          margin: auto;
          max-width: 1600px;
        }

        .attributeItem {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .attributeItem strong {
          color: #ff4e42;
          font-size: 0.8rem;
        }

        .attributeValue {
          color: #c2b8b2;
          font-size: 1.1rem;
          font-weight: bold;
        }

        .buttons {
          display: flex;
          gap: 0.625rem;
          margin-top: 1.25rem;
        }

        .btn {
          flex: 1;
          padding: 0.5rem 0;
          background: rgba(255, 78, 66, 0.1);
          border: 1px solid rgba(255, 78, 66, 0.3);
          color: #ff4e42;
          font-size: 0.75rem;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: "TheGoodMonolith", monospace;
        }

        .btn:hover {
          background: rgba(255, 78, 66, 0.3);
        }

        .endTransmissionBtn {
          background: #ff4e42 !important;
          color: #080C10 !important;
          font-weight: bold;
          border: 1px solid #ff4e42;
        }

        .endTransmissionBtn:hover {
          background: #e63e33 !important;
          border-color: #e63e33;
        }

        .shapeReadouts {
          margin-top: 0.625rem;
        }

        .dataRow {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.3125rem;
          font-size: 0.75rem;
        }

        .dataLabel {
          color: #c2b8b2;
        }

        .dataValue {
          color: #f3ede9;
        }

        .terminalPanel {
          position: absolute;
          left: 20px;
          bottom: 20px;
          width: 500px;
          height: 150px;
          background: rgba(30, 26, 24, 0.7);
          border: 1px solid rgba(255, 78, 66, 0.3);
          border-radius: 5px;
          overflow: hidden;
          pointer-events: auto;
          z-index: 10;
        }

        .terminalHeader {
          padding: 0.5rem 0.625rem;
          background: rgba(0, 0, 0, 0.3);
          font-size: 0.875rem;
          color: #ff4e42;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .terminalContent {
          padding: 0.625rem;
          height: calc(100% - 40px);
          overflow-y: auto;
          font-size: 0.75rem;
          line-height: 1.4;
        }

        .terminalLine {
          margin-bottom: 0.25rem;
          color: #c2b8b2;
        }

        .typing {
          position: relative;
        }

        .typing::after {
          content: "|";
          animation: blink 1s infinite;
          color: #ff4e42;
        }

        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .waveformContainer {
            margin: 15px auto;
          }
          
          .attributeFrame {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          
          .attributeItem {
            flex-direction: row;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
} 