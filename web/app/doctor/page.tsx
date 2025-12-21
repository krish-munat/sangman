export default function DoctorHomePage() {
  // Redirect to dashboard
  if (typeof window !== 'undefined') {
    window.location.href = '/doctor/dashboard'
  }
  return null
}

