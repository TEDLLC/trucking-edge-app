import React, { useState } from 'react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'guest'>('login');
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Trucking Edge App
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Manage your fleet or explore lease and onboarding opportunities
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 font-medium text-center border-b-2 ${
                activeTab === 'login'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Secure Portal Login
            </button>
            <button
              onClick={() => setActiveTab('guest')}
              className={`flex-1 py-2 font-medium text-center border-b-2 ${
                activeTab === 'guest'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Prospective Drivers & Carriers (Guest Info)
            </button>
          </div>

          {activeTab === 'login' && (
            <div className="space-y-6">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input type="password" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  Sign In
                </button>
              </form>
            </div>
          )}

          {activeTab === 'guest' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">MC Lease Information & Requirements</h3>
                <div className="space-y-3">
                  <details className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <summary className="font-semibold cursor-pointer text-indigo-600">Lease Requirements</summary>
                    <p className="mt-2 text-sm text-gray-600">
                      Must possess a valid Class A CDL, a clean Motor Vehicle Record (MVR) with no major violations in the last 3 years, minimum age of 23, and commercial truck standards meeting current DOT regulations.
                    </p>
                  </details>

                  <details className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <summary className="font-semibold cursor-pointer text-indigo-600">Commission Splits & Pay Structure</summary>
                    <p className="mt-2 text-sm text-gray-600">
                      Competitive tier structures available: Up to 88% split for owner-operators with their own authority, and flexible lease-purchase plans starting at 75% split with maintenance escrow options.
                    </p>
                  </details>

                  <details className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <summary className="font-semibold cursor-pointer text-indigo-600">Onboarding Guidelines</summary>
                    <p className="mt-2 text-sm text-gray-600">
                      1. Submit digital application & background check.<br />
                      2. Provide insurance certificates and equipment inspection.<br />
                      3. Sign carrier agreement and complete virtual orientation.<br />
                      4. Get assigned a dispatcher and book your first load!
                    </p>
                  </details>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Our Support Team</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Have questions? Call us directly at <span className="font-semibold text-gray-900">(800) 555-TRUCK</span> (Mon–Fri: 8:00 AM – 6:00 PM EST) or drop us a message below.
                </p>

                {submitted ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md text-sm">
                    Thank you! Your message has been sent. Our team will reach out shortly.
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input 
                        type="text" placeholder="Your Name" required 
                        value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        className="border border-gray-300 rounded-md p-2 text-sm"
                      />
                      <input 
                        type="email" placeholder="Email Address" required 
                        value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="border border-gray-300 rounded-md p-2 text-sm"
                      />
                    </div>
                    <input 
                      type="text" placeholder="Phone Number" required 
                      value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      className="border border-gray-300 rounded-md p-2 text-sm w-full"
                    />
                    <textarea 
                      placeholder="How can we help you?" rows={3} required
                      value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      className="border border-gray-300 rounded-md p-2 text-sm w-full"
                    />
                    <button type="submit" className="py-2 px-4 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700">
                      Send Inquiry
                    </button>
                  </form>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}