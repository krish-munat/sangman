'use client'

import { useState } from 'react'
import { MessageCircle, Mail, Phone, Send, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SupportPage() {
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Send support message via API
    toast.success('Message sent! We will get back to you soon.')
    setMessage('')
    setSubject('')
  }

  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer:
        'Search for doctors using the discover page, select a doctor, choose a date and time slot, and complete the payment to book your appointment.',
    },
    {
      question: 'What is the OTP for?',
      answer:
        'The OTP is sent to your phone after booking. You need to show this OTP to the doctor at the clinic to verify your visit and start the consultation.',
    },
    {
      question: 'Can I cancel an appointment?',
      answer:
        'Yes, you can cancel appointments from the "My Appointments" page. Cancellation policies may apply based on the timing.',
    },
    {
      question: 'How does the subscription work?',
      answer:
        'With a subscription, you get a 10% discount on all appointments. The discount is automatically applied at checkout.',
    },
    {
      question: 'What payment methods are accepted?',
      answer:
        'We accept Credit/Debit Cards, UPI, and Digital Wallets. All payments are secure and encrypted.',
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
          Support & Help
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Contact Card */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Us
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Email</p>
                  <p className="font-medium">support@sangman.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-success-500" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Phone</p>
                  <p className="font-medium">+91 1800-123-4567</p>
                </div>
              </div>
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Available 24/7 for emergency support
                </p>
              </div>
            </div>
          </div>

          {/* Send Message */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 icon-text-group">
              <Send className="w-5 h-5 flex-shrink-0" />
              <span>Send us a Message</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input"
                  placeholder="What can we help you with?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input"
                  rows={5}
                  placeholder="Describe your issue or question..."
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 icon-text-group">
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-neutral-200 dark:border-neutral-700 pb-4 last:border-0"
              >
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {faq.question}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

