import { React } from 'react'
import Hero from '../components/home_page/Hero';
import TabbedView from '../components/services_page/TabbedView';
import Contact from '../components/home_page/Contact';
import NailServiceIntro from '../components/home_page/NailServiceIntro';

// Main App Component
const Home = () => (
  <div>
    <Hero />
    <NailServiceIntro />
    <Contact />
  </div>
);


export default Home
