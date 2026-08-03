import React, { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const SupportPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const faqs: FaqItem[] = [
    {
      category: 'Dispatch & RPM',
      question: 'How is Rate Per Mile (RPM) calculated?',
      answer: 'RPM is automatically computed by dividing your Gross Rate by the Total Miles entered for the active dispatch (Gross Rate ÷ Total Miles).'
    },
    {
      category: 'Dispatch & RPM',
      question: 'Can I assign multiple drivers to a single load?',
      answer: 'Currently, the system supports assigning one primary driver per active dispatch to ensure precise ELD and route tracking.'
    },
    {
      category: 'ELD & Compliance',
      question: 'Are Hours of Service (HOS) logs updated in real time?',
      answer: 'Yes, driver status updates made via the ELD logs page sync immediately across your dispatcher overview.'
    },
    {
      category: 'Billing & Account',
      question: 'Where can I manage my subscription package?',
      answer: 'Subscription management and package upgrades are accessible directly through the public landing page prior to signing in.'
    },
  ];

  const categories = ['All', 'Dispatch & RPM', 'ELD & Compliance', 'Billing & Account'];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setTicketSubmitted(true);
    setTicketSubject('');
    setTicketMessage('');
    setTimeout(() => setTicketSubmitted(false), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0b1329 0%, #1e293b 100%)', border: '1px solid #1e293b', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}>
        <h1 style={{ color: '#f8fafc', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0' }}>Support & Knowledge Center</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 20px 0' }}>Find quick answers to common questions or reach out to our enterprise dispatch support team.</p>
        
        <input 
          type="text" 
          placeholder="Search knowledge base (e.g. RPM, ELD, drivers)..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', maxWidth: '600px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', padding: '12px 16px', color: '#f8fafc', outline: 'none', fontSize: '0.95rem' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', alignItems: 'start' }}>
        {/* FAQ Section */}
        <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ color: '#f8fafc', fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px' }}>Frequently Asked Questions</h2>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{ background: selectedCategory === cat ? '#2563eb' : '#020617', color: selectedCategory === cat ? '#fff' : '#94a3b8', border: '1px solid #334155', borderRadius: '6px', padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div key={index} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>{faq.category}</span>
                  <h3 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 600, margin: '0 0 8px 0' }}>{faq.question}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>{faq.answer}</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>No matching articles found.</p>
            )}
          </div>
        </div>

        {/* Submit Support Ticket Card */}
        <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ color: '#f8fafc', fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px' }}>Contact Support</h2>
          
          {ticketSubmitted ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '16px', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}>
              Support ticket submitted successfully! Our team will respond shortly.
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. Load board API sync issue" 
                  value={ticketSubject} 
                  onChange={(e) => setTicketSubject(e.target.value)} 
                  required 
                  style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', color: '#f8fafc', outline: 'none', fontSize: '0.9rem' }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>Message</label>
                <textarea 
                  rows={4} 
                  placeholder="Describe your issue or feature request..." 
                  value={ticketMessage} 
                  onChange={(e) => setTicketMessage(e.target.value)} 
                  required 
                  style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', color: '#f8fafc', outline: 'none', fontSize: '0.9rem', resize: 'vertical' }} 
                />
              </div>

              <button type="submit" style={{ background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s' }}>
                Submit Ticket
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportPage;