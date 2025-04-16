import { React } from 'react'
import TabbedView from '../components/shared/TabbedView';
import Hero from '../components/services_page/Hero';
import NailSalonMenu from '../components/services_page/NailSalonMenu';
import Team from '../components/services_page/Team';

const tabs = [
  { key: 'menu', label: 'OUR SERVICES', Component: NailSalonMenu },
  { key: 'technicians', label: 'MEET OUR TECHNICIAN', Component: Team },
];
// Main App Component
const ServicesMenu = () => (
  <div>
    <Hero />
    <TabbedView tabs={tabs} />
  </div>
);


export default ServicesMenu
