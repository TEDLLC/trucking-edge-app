import React, { useState } from 'react';

interface DispatchFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  mcAuthority: string;
  noaDocument: File | null;
  serviceType: 'dispatch' | 'lease';
  leasePercentage: string;
  dispatchFee: string;
  agreedToTerms: boolean;
}

const GuestDispatchForm: React.FC = () => {
  const [formData, setFormData] = useState<DispatchFormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    mcAuthority: '',
    noaDocument: null,
    serviceType: 'dispatch',
    leasePercentage: '17%',
    dispatchFee: '5%',
    agreedToTerms: false,
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, noaDocument: e.target.files![0] }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, agreedToTerms: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      alert('Please agree to the terms and conditions to proceed.');
      return;
    }
    // Handle form submission logic (e.g., API call to backend)
    console.log('Submitted Guest Dispatch Data:', formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-green-50 border border-green-200 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Registration Successful!</h2>
        <p className="text-green-700">
          Thank you for providing your dispatch information. Our team will review your MC Authority and NOA documentation and get in touch shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
        >
          Submit Another Response
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white border border-gray-200 rounded-xl shadow-lg">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Guest Dispatch Portal</h2>
        <p className="text-sm text-gray-600 mt-1">
          Provide your carrier details and choose your preferred service arrangement.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Agreement / Guest Login Notice */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleCheckboxChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <span className="text-sm text-gray-700">
              <strong>Guest Agreement:</strong> I agree to share my company and compliance information for dispatch services and certify that all provided details are accurate.
            </span>
          </label>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name / Company Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="John Doe / Transport LLC"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="(555) 000-0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="carrier@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MC / FF Authority Number</label>
            <input
              type="text"
              name="mcAuthority"
              value={formData.mcAuthority}
              onChange={handleChange}
              required
              placeholder="MC123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* NOA Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notice of Assignment (NOA)</label>
          <input
            type="file"
            accept=".pdf,.jpg,.png"
            onChange={handleFileChange}
            required
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">Upload PDF or image format of your NOA document.</p>
        </div>

        {/* Service Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Service Arrangement</label>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="serviceType"
                value="dispatch"
                checked={formData.serviceType === 'dispatch'}
                onChange={handleChange}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-800">Dispatch Service Only</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="serviceType"
                value="lease"
                checked={formData.serviceType === 'lease'}
                onChange={handleChange}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-800">Lease-On Option</span>
            </label>
          </div>
        </div>

        {/* Conditional Options based on Service Type */}
        {formData.serviceType === 'lease' ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="block text-sm font-semibold text-blue-900 mb-1">
              Lease Percentage Option (Market Practice: 17% - 25%)
            </label>
            <select
              name="leasePercentage"
              value={formData.leasePercentage}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="17%">17% - Standard Tier</option>
              <option value="18%">18%</option>
              <option value="19%">19%</option>
              <option value="20%">20% - Recommended Tier</option>
              <option value="21%">21%</option>
              <option value="22%">22%</option>
              <option value="23%">23%</option>
              <option value="24%">24%</option>
              <option value="25%">25% - Premium Full Service</option>
            </select>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Dispatch Fee Structure (Market Practice: 5% - 15%)
            </label>
            <select
              name="dispatchFee"
              value={formData.dispatchFee}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="5%">5% - Basic Dispatch</option>
              <option value="6%">6%</option>
              <option value="7%">7%</option>
              <option value="8%">8%</option>
              <option value="9%">9%</option>
              <option value="10%">10% - Standard Dispatch</option>
              <option value="11%">11%</option>
              <option value="12%">12%</option>
              <option value="13%">13%</option>
              <option value="14%">14%</option>
              <option value="15%">15% - Dedicated Fleet Dispatch</option>
            </select>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow transition duration-200"
        >
          Submit Guest Information & Agree
        </button>
      </form>
    </div>
  );
};

export default GuestDispatchForm;