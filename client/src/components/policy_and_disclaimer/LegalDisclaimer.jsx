// components/LegalDisclaimer.jsx
import './LegalDisclaimer.css';

const LegalDisclaimer = () => (
  <div className='legal-disclaimer-page'>
    <div className="legal-disclaimer-container">
      <h1 className="text-center text-2xl font-bold">Legal Disclaimer</h1>
      <p className="mt-4">
        The information provided by Golden Nails & Spa ("we," "our," or "us") on our website and during your visit to our spa is
        for general informational purposes only. All services are provided "as is" and without any warranty of any kind.
      </p>
      <h2 className="mt-6 font-semibold">1. Service Accuracy</h2>
      <p>
        We make every effort to ensure that the services offered at Golden Nails & Spa are accurately described, but we do not
        guarantee that all descriptions or images are 100% accurate. Prices, availability, and services may change without prior
        notice.
      </p>
      <h2 className="mt-6 font-semibold">2. Health and Safety</h2>
      <p>
        While we take every precaution to maintain a clean and safe environment, we cannot guarantee that there will be no
        risk of allergic reactions or other health-related issues arising from the services provided. You are responsible for
        informing us of any allergies or sensitivities before receiving any treatment.
      </p>
      <h2 className="mt-6 font-semibold">3. Liability</h2>
      <p>
        By using our services, you acknowledge that Golden Nails & Spa, its owners, employees, and agents will not be held
        liable for any damages, injuries, or losses that may occur during or after any service provided at our spa. This includes
        but is not limited to personal injuries, allergic reactions, and damage to personal property.
      </p>
      <h2 className="mt-6 font-semibold">4. External Links</h2>
      <p>
        Our website may contain links to external websites or resources. We are not responsible for the content, privacy practices,
        or actions of these third-party sites. We encourage you to review their privacy policies and terms of service.
      </p>
      <h2 className="mt-6 font-semibold">5. Modifications</h2>
      <p>
        We reserve the right to modify or amend this legal disclaimer at any time without prior notice. Any changes will be
        reflected on this page with the updated date.
      </p>
    </div>
  </div>
);

export default LegalDisclaimer;
