import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureGrid from './components/FeatureGrid';
import SearchSection from './components/SearchSection';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="app-container">
      {/* Dynamic Background */}
      <div className="bg-mesh">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <Navbar />

      <main>
        <Hero />
        
        <SearchSection 
          query={searchQuery} 
          setQuery={setSearchQuery} 
        />

        <FeatureGrid />

        <section className="cta-banner container animate-fade-up" style={{ padding: '80px 20px' }}>
          <div className="glass-morphism" style={{ padding: '60px', textAlign: 'center', background: 'var(--gradient-brand)', border: 'none' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>Ready to start your Yatra?</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.9 }}>Join 10,000+ students who found their perfect path with us.</p>
            <button className="btn-primary" style={{ background: 'white', color: 'black' }}>
              Create Your Free Profile
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
