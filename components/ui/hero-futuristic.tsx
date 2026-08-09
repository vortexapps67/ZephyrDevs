'use client';

import { useState, useEffect } from 'react';
import { WebGLShader } from './web-gl-shader';
import DotGridBackground from './dot-grid-bg';

export const Html = () => {
  const titleWords = 'Bespoke Digital Design & AI Integration'.split(' ');
  const description = 'We build fast, responsive, and intelligence-driven web applications. Powered by HTML5, Node.js, Firebase, Google AI, and Anthropic Claude.';
  
  const [visibleWords, setVisibleWords] = useState(0);
  const [descVisible, setDescVisible] = useState(false);
  const [delays, setDelays] = useState<number[]>([]);

  useEffect(() => {
    setDelays(titleWords.map(() => Math.random() * 0.07));
  }, [titleWords.length]);

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(visibleWords + 1), 200); // Faster word-by-word reveal for readability
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setDescVisible(true), 400);
      return () => clearTimeout(timeout);
    }
  }, [visibleWords, titleWords.length]);

  useEffect(() => {
    // Re-run scroll reveal and 3D tilt tracking for React elements after they are mounted in the DOM
    if (typeof (window as any).initScrollReveal === 'function') {
      (window as any).initScrollReveal();
    }
    if (typeof (window as any).init3DTilt === 'function') {
      (window as any).init3DTilt();
    }
  }, []);

  return (
    <div className="w-full py-6 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        
        {/* Centerpiece: Main Hero Pitch with WebGL Shader Background */}
        <div className="bento-reveal hero-bento-card relative md:col-span-4 md:row-span-2 min-h-[520px] border border-[#bef264]/20 hover:border-[#bef264]/40 bg-[#09090b]/85 backdrop-blur-md rounded-2xl p-8 md:p-12 flex flex-col justify-between overflow-hidden group transition-all duration-500 hover:shadow-[0_0_30px_rgba(190,242,100,0.12)]">
          
          {/* Canvas Background Container */}
          <div className="absolute inset-0 z-0 opacity-75 pointer-events-none">
            <WebGLShader className="absolute inset-0 w-full h-full block" />
            <DotGridBackground className="absolute inset-0 w-full h-full block" />
          </div>
 
          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col h-full justify-between pointer-events-none">
            <div>
              {/* Monospaced badge with lime outline */}
              <div 
                style={{ fontFamily: 'var(--font-mono)' }} 
                className="inline-flex items-center gap-2 border border-[#bef264]/30 px-3 py-1.5 rounded-full text-xs text-[#bef264] tracking-widest uppercase mb-6 bg-black/60 backdrop-blur-sm w-fit"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-pulse"></span>
                Accepting Projects For 2026
              </div>
 
              {/* Title Header: Combination of Space Grotesk and Lime Accents */}
              <h1 
                style={{ fontFamily: 'var(--font-title)' }} 
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight uppercase leading-[1.1] text-left max-w-2xl mb-4"
              >
                <span className="flex flex-wrap gap-x-3 gap-y-1">
                  {titleWords.map((word, index) => {
                    const isLime = word.toLowerCase() === 'ai' || word.toLowerCase() === 'integration' || word === '&';
                    return (
                      <span
                        key={index}
                        className={`${index < visibleWords ? 'fade-in' : ''} ${isLime ? 'text-[#bef264] drop-shadow-[0_0_12px_rgba(190,242,100,0.45)]' : 'text-white'}`}
                        style={{ 
                          animationDelay: `${index * 0.08 + (delays[index] || 0)}s`, 
                          opacity: index < visibleWords ? undefined : 0 
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </span>
              </h1>
            </div>
 
            <div>
              {/* Description body paragraph */}
              <p 
                style={{ fontFamily: 'var(--font-body)' }} 
                className={`text-white/70 text-sm md:text-base max-w-xl leading-relaxed mb-8 text-left transition-opacity duration-700 ${descVisible ? 'opacity-100' : 'opacity-0'}`}
              >
                {description}
              </p>
 
              {/* Interactive buttons */}
              <div className="flex flex-wrap gap-4 pointer-events-auto">
                <button 
                  onClick={() => window.location.href = 'contact.html'}
                  style={{ fontFamily: 'var(--font-title)' }} 
                  className="bg-[#bef264] text-black hover:bg-[#bef264]/80 px-6 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 transform hover:scale-[1.03] active:scale-95 flex items-center gap-2 border border-transparent shadow-[0_4px_20px_rgba(190,242,100,0.25)] hover:shadow-[0_4px_30px_rgba(190,242,100,0.45)] cursor-pointer"
                >
                  Start a Project
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
                <button 
                  onClick={() => window.location.href = 'services.html'}
                  style={{ fontFamily: 'var(--font-title)' }} 
                  className="border border-white/20 text-white hover:border-[#bef264] hover:text-[#bef264] px-6 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 transform hover:scale-[1.03] active:scale-95 bg-black/40 backdrop-blur-sm cursor-pointer"
                >
                  Explore Services
                </button>
              </div>
            </div>
          </div>
        </div>
 
        {/* Orbiting Panel 1: Review for Rajdarbar Banquet */}
        <div className="bento-reveal reveal-left hero-bento-card border border-[#bef264]/10 hover:border-[#bef264]/30 bg-[#09090b]/80 backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col justify-between md:col-span-2 min-h-[250px] group transition-all duration-500 hover:shadow-[0_0_20px_rgba(190,242,100,0.08)]">
          <div style={{ fontFamily: 'var(--font-mono)' }} className="text-[#bef264] text-4xl font-extrabold leading-none mb-4">“</div>
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-white/80 text-sm leading-relaxed mb-6 text-left italic">
            The visual aesthetics perfectly capture our luxury venue spaces, and our inquiries grew by 150%!
          </p>
          <div className="border-t border-[#bef264]/10 pt-4 text-left">
            <h4 style={{ fontFamily: 'var(--font-title)' }} className="text-white text-sm font-bold tracking-wide">RAJESH KUMAR</h4>
            <span style={{ fontFamily: 'var(--font-mono)' }} className="text-[#bef264] text-[10px] font-bold tracking-wider uppercase">Rajdarbar Banquet</span>
          </div>
        </div>
 
        {/* Orbiting Panel 2: Review for Haveli Restaurant + Performance Stat */}
        <div className="bento-reveal reveal-right hero-bento-card border border-[#bef264]/10 hover:border-[#bef264]/30 bg-[#09090b]/80 backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col justify-between md:col-span-2 min-h-[250px] group transition-all duration-500 hover:shadow-[0_0_20px_rgba(190,242,100,0.08)]">
          <div className="flex justify-between items-start mb-4">
            <div style={{ fontFamily: 'var(--font-mono)' }} className="text-[#bef264] text-4xl font-extrabold leading-none">“</div>
            <div style={{ fontFamily: 'var(--font-mono)' }} className="text-right">
              <span className="text-[#bef264] text-2xl font-black block tracking-tighter">&lt; 0.6s</span>
              <span className="text-white/40 text-[9px] uppercase font-bold tracking-widest block">Load Time</span>
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-white/80 text-sm leading-relaxed mb-6 text-left italic">
            Operates smoothly on mobile, allowing guests to view dishes and book tables in seconds.
          </p>
          <div className="border-t border-[#bef264]/10 pt-4 text-left">
            <h4 style={{ fontFamily: 'var(--font-title)' }} className="text-white text-sm font-bold tracking-wide">SANJAY SINGH</h4>
            <span style={{ fontFamily: 'var(--font-mono)' }} className="text-[#bef264] text-[10px] font-bold tracking-wider uppercase">Haveli Restaurant</span>
          </div>
        </div>
 
      </div>
    </div>
  );
};

export default Html;
