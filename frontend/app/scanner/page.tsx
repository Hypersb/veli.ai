import EmailScanner from '@/components/EmailScanner'
import StatsSection  from '@/components/StatsSection'
import AboutSection  from '@/components/AboutSection'

export default function ScannerPage() {
  return (
    <>
      {/* Top spacing because the Navbar is sticky */}
      <div className="h-16" />
      <EmailScanner />
      <StatsSection />
      <AboutSection />
    </>
  )
}
