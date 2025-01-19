import { React } from 'react'
import Hero from '../components/home_page/Hero';
import SpaLocation from '../components/home_page/SpaLocation';
import NailServiceIntro from '../components/home_page/NailServiceIntro';

// Main App Component
const Home = () => (
  <div>
    <Hero />
    <NailServiceIntro />
    <SpaLocation />
  </div>
);


export default Home
