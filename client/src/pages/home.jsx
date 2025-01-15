import { React } from 'react'
import Hero from '../components/home_page/Hero';
import TabbedView from '../components/home_page/TabbedView';
import Contact from '../components/home_page/Contact';

// Main App Component
const Home = () => (
  <div>
    <Hero />
    <TabbedView />
    <Contact />
  </div>
);


export default Home
