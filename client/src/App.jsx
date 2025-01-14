import { React } from 'react'
import Header from './components/Header';
import Hero from './components/Hero';
import TabbedView from './components/TabbedView';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Main App Component
const App = () => (
  <div>
    <Header />
    <Hero />
    <TabbedView />
    <Contact />
    <Footer />
  </div>
);


export default App
