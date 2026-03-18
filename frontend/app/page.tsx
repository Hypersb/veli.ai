import Hero          from '@/components/Hero'
import EmailScanner  from '@/components/EmailScanner'
import StatsSection  from '@/components/StatsSection'
import AboutSection  from '@/components/AboutSection'

export default function Home() {
  return (
    <>
      <Hero />
      <EmailScanner />
      <StatsSection />
      <AboutSection />
    </>
  )
}
