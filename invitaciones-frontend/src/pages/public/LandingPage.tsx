import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Events } from '@/components/landing/Events'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Showcase } from '@/components/landing/Showcase'
// import { Pricing } from '@/components/landing/Pricing'
import { Testimonials } from '@/components/landing/Testimonials'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'
import { CookieBanner } from '@/components/landing/CookieBanner'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal text-charcoal dark:text-champagne-light font-body transition-colors duration-300">
      <Header />
      <Hero />
      <Events />
      <Showcase />
      <Features />
      {/* <HowItWorks /> */}
      {/* <Pricing /> */}
      <Testimonials />
      <FinalCTA />
      <Footer />
      <CookieBanner />
    </div>
  )
}
