import { React } from 'react'
import Hero from '../components/home_page/Hero';
import SpaLocation from '../components/home_page/SpaLocation';
import NailServiceIntro from '../components/home_page/NailServiceIntro';
import PartnerSection from '../components/home_page/PartnerSection';
import ServiceCards from '../components/home_page/ServiceCards';

// Main App Component
const Home = () => (
  <div>
    <Hero />
    <NailServiceIntro />
    <ServiceCards />
    <PartnerSection />
    <SpaLocation />
  </div>
);


export default Home
