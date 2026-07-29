import Navbar from '../components/layout/Navbar'
import Hero from '../components/landing/Hero'
import ProblemSolution from '../components/landing/ProblemSolution'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import CTA from '../components/landing/CTA'
import Footer from '../components/landing/Footer'

export default function LandingPage({ onOpenLogin, onOpenSignup }) {
  return (
    <div className="min-h-screen">
      <Navbar onOpenLogin={onOpenLogin} onOpenSignup={onOpenSignup} />
      <Hero onOpenSignup={onOpenSignup} />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <CTA onOpenSignup={onOpenSignup} />
      <Footer />
    </div>
  )
}
