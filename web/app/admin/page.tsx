export default function AdminHomePage() {
  // Redirect to dashboard
  if (typeof window !== 'undefined') {
    window.location.href = '/admin/dashboard'
  }
  return null
}

