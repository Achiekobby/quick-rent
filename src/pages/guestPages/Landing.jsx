import React from 'react'
import GuestLayout from '../../Layouts/GuestLayout'
import Hero from '../../components/Landing/Hero'
import Categories from '../../components/Landing/Categories'
import PopularProperties from '../../components/Landing/PopularProperties'
import CTASection from '../../components/Landing/CTASection'
import FAQSection from '../../components/Landing/FAQSection'

const Landing = () => {
  return (
    <GuestLayout>
        <Hero />
        <Categories />
        <PopularProperties />
        <CTASection />
        <FAQSection />
    </GuestLayout>
  )
}

export default Landing