import Hero from '../components/home_page/Hero';
import SpaLocation from '../components/home_page/SpaLocation';
import NailServiceIntro from '../components/home_page/NailServiceIntro';
import PartnerSection from '../components/home_page/PartnerSection';
import ServiceCards from '../components/home_page/ServiceCards';
import PromoModal from '../components/home_page/PromoModal';
import { usePromoModal } from '../hooks/usePromoModal'

// Main App Component
const Home = () => {
  const [showModal, handleCloseModal] = usePromoModal();
  return (
    <div>
      <PromoModal show={showModal} onClose={handleCloseModal} />
      <Hero />
      <NailServiceIntro />
      <ServiceCards />
      <PartnerSection />
      <SpaLocation />
    </div>
  )
};


export default Home
