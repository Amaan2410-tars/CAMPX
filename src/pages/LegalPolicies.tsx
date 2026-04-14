import React from 'react';

export default function LegalPolicies() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f8] font-sans selection:bg-[#6c63ff] selection:text-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <section className="bg-[#13131a] border border-[#1c1c27] rounded-3xl p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#6c63ff] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black font-['Syne'] tracking-tighter mb-4 text-[#f0f0f8]">
              Legal &amp; Policies
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
              CampX Policies and compliance information.
            </p>
          </div>
        </section>

        {/* 1. Terms and Conditions */}
        <section className="bg-[#13131a] border border-[#1c1c27] rounded-3xl p-8 md:p-12" id="terms">
          <h2 className="text-2xl font-bold font-['Syne'] mb-6 text-white text-[#6c63ff]">1. Terms and Conditions</h2>
          <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
            <p>Welcome to CampX. By accessing or using our platform, you agree to be bound by these Terms and Conditions. CampX is an exclusive, verified digital network designed for college and university students.</p>
            <p><strong>Account Verification:</strong> We require valid institution identification for access. You agree to provide accurate information during registration.</p>
            <p><strong>Code of Conduct:</strong> Users must not engage in any form of cyberbullying, harassment, or distribution of illegal content. Violations will result in immediate account termination.</p>
            <p><strong>Content Ownership:</strong> You retain rights to your content, but grant CampX a license to display it within the platform.</p>
          </div>
        </section>

        {/* 2. Privacy Policy */}
        <section className="bg-[#13131a] border border-[#1c1c27] rounded-3xl p-8 md:p-12" id="privacy">
          <h2 className="text-2xl font-bold font-['Syne'] mb-6 text-white text-[#6c63ff]">2. Privacy Policy</h2>
          <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
            <p>At CampX, your privacy is our priority. We collect only what is necessary to verify your identity and improve your platform experience.</p>
            <p><strong>Data Collected:</strong> We process your name, contact details, college ID (for KYC), and interactions on the platform.</p>
            <p><strong>Data Usage:</strong> Your data is solely used to verify your student status, provide curated feeds, and facilitate peer networking. We do not sell your personal data to third parties.</p>
            <p><strong>Security:</strong> All sensitive data is encrypted using industry-standard protocols, including our end-to-end encrypted messaging.</p>
          </div>
        </section>

        {/* 3. Refunds/Cancellations */}
        <section className="bg-[#13131a] border border-[#1c1c27] rounded-3xl p-8 md:p-12" id="refunds">
          <h2 className="text-2xl font-bold font-['Syne'] mb-6 text-white text-[#6c63ff]">3. Refunds/Cancellations Policy</h2>
          <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
            <p>Our subscriptions (Pro, Plus, Verified) provide immediate access to digital premium features.</p>
            <p><strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing cycle.</p>
            <p><strong>Refund Policy:</strong> If a charge was made in error or if there are unexpected technical issues preventing account access, you may request a refund within 3 days of purchase.</p>
            <p><strong>Refund Timeline:</strong> Once a refund request is approved, the amount will be processed and credited back to the customer's original bank account or payment method within <strong>5-7 working days</strong>.</p>
          </div>
        </section>

        {/* 4. Pricing */}
        <section className="bg-[#13131a] border border-[#1c1c27] rounded-3xl p-8 md:p-12" id="pricing">
          <h2 className="text-2xl font-bold font-['Syne'] mb-6 text-white text-[#6c63ff]">4. Pricing</h2>
          <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
            <p>CampX offers optional premium subscriptions alongside its free verified tier:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Free Tier (Verified):</strong> ₹0/month. Standard campus access.</li>
              <li><strong>Plus Tier:</strong> ₹199/month. Advanced networking and badge.</li>
              <li><strong>Pro Tier:</strong> ₹499/month. Analytics, top directory placement, premium badges.</li>
            </ul>
            <p>All prices are inclusive of applicable taxes.</p>
          </div>
        </section>

        {/* 5. Shipping Policy */}
        <section className="bg-[#13131a] border border-[#1c1c27] rounded-3xl p-8 md:p-12" id="shipping">
          <h2 className="text-2xl font-bold font-['Syne'] mb-6 text-white text-[#6c63ff]">5. Shipping Delivery Policy</h2>
          <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
            <p>CampX operates as a digital Software as a Service (SaaS). We do not ship physical goods.</p>
            <p><strong>Delivery Timeline:</strong> Membership upgrades and digital subscriptions are fulfilled immediately upon successful payment verification. Minimum timeline: Instant. Maximum timeline: 24 hours (in case of server delays or manual reviews).</p>
          </div>
        </section>

        {/* 6. Contact Us */}
        <section className="bg-[#13131a] border border-[#1c1c27] rounded-3xl p-8 md:p-12" id="contact">
          <h2 className="text-2xl font-bold font-['Syne'] mb-6 text-white text-[#6c63ff]">6. Contact Us</h2>
          <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
            <p>If you have any questions or require support, please contact us at:</p>
            <ul className="list-none space-y-2">
              <li><strong>Email Address:</strong> ghoriamaan01@gmail.com</li>
              <li><strong>Contact Number:</strong> +91 7036192138</li>
              <li><strong>Operating Address:</strong> CampX Technologies Pvt Ltd, 123 Tech Hub, Hitech City, Hyderabad, Telangana 500081, India</li>
            </ul>
          </div>
        </section>
        
        <div className="text-center pb-8">
          <a href="/branding" className="text-gray-500 hover:text-white transition-colors underline text-sm">Back to Home</a>
        </div>

      </div>
    </div>
  );
}
