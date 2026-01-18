'use client';

import { useState, useEffect } from 'react';
import AnimatedDemo from './AnimatedDemo';
import SuccessDemo from './SuccessDemo';
import SolutionDemo from './SolutionDemo';

export default function SequentialDemos() {
  const [activeDemo, setActiveDemo] = useState<'analysis' | 'results' | 'solutions' | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);

  useEffect(() => {
    // Start with analysis
    setActiveDemo('analysis');

    // After analysis completes (16 logs * 400ms + buffer), show results
    const resultsTimer = setTimeout(() => {
      setShowResults(true);
      setActiveDemo('results');
    }, 16 * 400 + 500); // 6.9 seconds

    // After results complete (14 logs * 350ms + buffer), show solutions
    const solutionsTimer = setTimeout(() => {
      setShowSolutions(true);
      setActiveDemo('solutions');
    }, 16 * 400 + 500 + 14 * 350 + 500); // ~12.3 seconds

    // Reset everything after full cycle
    const resetTimer = setTimeout(() => {
      setActiveDemo(null);
      setShowResults(false);
      setShowSolutions(false);
      
      // Restart the cycle
      setTimeout(() => {
        setActiveDemo('analysis');
      }, 1000);
    }, 16 * 400 + 14 * 350 + 16 * 300 + 3000); // Full cycle + pause

    return () => {
      clearTimeout(resultsTimer);
      clearTimeout(solutionsTimer);
      clearTimeout(resetTimer);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Main Analysis - Always visible, starts first */}
      <div className={`transition-opacity duration-500 ${activeDemo === 'analysis' ? 'opacity-100' : 'opacity-50'}`}>
        <AnimatedDemo key={activeDemo === 'analysis' ? 'active' : 'inactive'} isActive={activeDemo === 'analysis'} />
      </div>

      {/* Results and Solutions - Side by side, appear sequentially */}
      <div className="grid grid-cols-2 gap-4">
        {/* Results - Appears second */}
        <div 
          className={`transition-all duration-700 ${
            showResults 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {showResults && (
            <div className={activeDemo === 'results' ? 'opacity-100' : 'opacity-50'}>
              <SuccessDemo key={activeDemo === 'results' ? 'active' : 'inactive'} isActive={activeDemo === 'results'} />
            </div>
          )}
        </div>

        {/* Solutions - Appears third */}
        <div 
          className={`transition-all duration-700 ${
            showSolutions 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {showSolutions && (
            <div className={activeDemo === 'solutions' ? 'opacity-100' : 'opacity-50'}>
              <SolutionDemo key={activeDemo === 'solutions' ? 'active' : 'inactive'} isActive={activeDemo === 'solutions'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}