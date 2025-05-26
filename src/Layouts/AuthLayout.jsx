import React from 'react'
import Navbar from '../components/Utilities/Navbar'
import Footer from '../components/Utilities/Footer'

const AuthLayout = ({children}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default AuthLayout