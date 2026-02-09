'use client'

import { useState } from 'react'
import { Droplet, MapPin, Phone, Search, AlertCircle, CheckCircle, Clock, User } from 'lucide-react'
import toast from 'react-hot-toast'

type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

interface DonorRequest {
  bloodGroup: BloodGroup
  urgency: 'critical' | 'urgent' | 'normal'
  location: string
  contactNumber: string
  hospitalName: string
  patientName: string
  unitsNeeded: number
}

interface Donor {
  id: string
  name: string
  bloodGroup: BloodGroup
  location: string
  distance: string
  phone: string
  lastDonated: string
  available: boolean
}

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const MOCK_DONORS: Donor[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    bloodGroup: 'O+',
    location: 'Karol Bagh, Delhi',
    distance: '2.3 km',
    phone: '+91 98765 43210',
    lastDonated: '4 months ago',
    available: true
  },
  {
    id: '2',
    name: 'Priya Singh',
    bloodGroup: 'O+',
    location: 'Connaught Place, Delhi',
    distance: '3.8 km',
    phone: '+91 98765 43211',
    lastDonated: '6 months ago',
    available: true
  },
  {
    id: '3',
    name: 'Amit Kumar',
    bloodGroup: 'O+',
    location: 'Nehru Place, Delhi',
    distance: '5.2 km',
    phone: '+91 98765 43212',
    lastDonated: '8 months ago',
    available: true
  }
]

export default function BloodDonationPage() {
  const [activeTab, setActiveTab] = useState<'request' | 'search'>('request')
  const [searchBloodGroup, setSearchBloodGroup] = useState<BloodGroup>('O+')
  const [donors, setDonors] = useState<Donor[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const [requestForm, setRequestForm] = useState<DonorRequest>({
    bloodGroup: 'O+',
    urgency: 'normal',
    location: '',
    contactNumber: '',
    hospitalName: '',
    patientName: '',
    unitsNeeded: 1
  })

  const handleSearch = () => {
    setIsSearching(true)
    setTimeout(() => {
      const filtered = MOCK_DONORS.filter(d => d.bloodGroup === searchBloodGroup)
      setDonors(filtered)
      setIsSearching(false)
      toast.success(`Found ${filtered.length} donors`)
    }, 1000)
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!requestForm.patientName || !requestForm.location || !requestForm.contactNumber) {
      toast.error('Please fill all required fields')
      return
    }

    toast.success('Blood donation request submitted! Donors will be notified.')

    // Reset form
    setRequestForm({
      bloodGroup: 'O+',
      urgency: 'normal',
      location: '',
      contactNumber: '',
      hospitalName: '',
      patientName: '',
      unitsNeeded: 1
    })
  }

  const handleContactDonor = (donor: Donor) => {
    window.location.href = `tel:${donor.phone}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl mb-4">
            <Droplet className="w-8 h-8 text-white" fill="white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Blood Donation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Request blood or find donors near you
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'request'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <AlertCircle className="w-5 h-5 inline mr-2" />
            Request Blood
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Search className="w-5 h-5 inline mr-2" />
            Find Donors
          </button>
        </div>

        {/* Request Blood Tab */}
        {activeTab === 'request' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Submit Blood Request
            </h2>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              {/* Urgency Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Urgency Level *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['critical', 'urgent', 'normal'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setRequestForm({ ...requestForm, urgency: level as any })}
                      className={`py-2 px-4 rounded-lg font-medium capitalize transition-colors ${
                        requestForm.urgency === level
                          ? level === 'critical'
                            ? 'bg-red-600 text-white'
                            : level === 'urgent'
                            ? 'bg-orange-500 text-white'
                            : 'bg-yellow-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={requestForm.patientName}
                  onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                  placeholder="Enter patient's name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* Blood Group and Units */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Blood Group *
                  </label>
                  <select
                    value={requestForm.bloodGroup}
                    onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value as BloodGroup })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {BLOOD_GROUPS.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Units Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={requestForm.unitsNeeded}
                    onChange={(e) => setRequestForm({ ...requestForm, unitsNeeded: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Hospital Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={requestForm.hospitalName}
                  onChange={(e) => setRequestForm({ ...requestForm, hospitalName: e.target.value })}
                  placeholder="Enter hospital name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={requestForm.location}
                  onChange={(e) => setRequestForm({ ...requestForm, location: e.target.value })}
                  placeholder="Enter location or address"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  value={requestForm.contactNumber}
                  onChange={(e) => setRequestForm({ ...requestForm, contactNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-lg
                  hover:from-red-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl"
              >
                Submit Request
              </button>
            </form>
          </div>
        )}

        {/* Find Donors Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Search for Blood Donors
              </h2>

              <div className="flex gap-3">
                <select
                  value={searchBloodGroup}
                  onChange={(e) => setSearchBloodGroup(e.target.value as BloodGroup)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {BLOOD_GROUPS.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>

                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg
                    hover:bg-red-600 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSearching ? (
                    <Clock className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5 inline mr-2" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Donors List */}
            {donors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Available Donors ({donors.length})
                </h3>

                {donors.map((donor) => (
                  <div
                    key={donor.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700
                      hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-full
                          flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-white" />
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {donor.name}
                            </h4>
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400
                              rounded-full text-sm font-semibold">
                              {donor.bloodGroup}
                            </span>
                            {donor.available && (
                              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <CheckCircle className="w-3 h-3" />
                                Available
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {donor.location} • {donor.distance} away
                            </p>
                            <p className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Last donated: {donor.lastDonated}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Button */}
                      <button
                        onClick={() => handleContactDonor(donor)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-medium rounded-lg
                          hover:bg-red-600 transition-colors shadow-md"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isSearching && donors.length === 0 && activeTab === 'search' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                <Droplet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No search performed
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Select a blood group and click search to find donors
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
