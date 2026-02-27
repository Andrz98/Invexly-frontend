import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Components/organisms/Navbar/Navbar'
import Footer from './Components/organisms/Footer/Footer'
import AuthCard from './Components/organisms/AuthCard/AuthCard'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [activeForm, setActiveForm] = useState('login')
  const [dropdownHeight, setDropdownHeight] = useState(0)
  const openAuthModal = useCallback((formType) => {
    setActiveForm(formType)
    setIsAuthModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsAuthModalOpen(false)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-primary-light">
      <Navbar
        openAuthModal={openAuthModal}
        setDropdownHeight={setDropdownHeight}
      />

      {/* Asegurar que el contenido empuje al footer */}
      <main
        className={`flex-1 pt-[68px] pb-20 px-4 lg:px-8 bg-primary-light ${
          dropdownHeight > 0 ? 'mt-10' : ''
        }`}
      >
        <Outlet />
      </main>

      <Footer />

      {isAuthModalOpen && (
        <AuthCard
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          onClose={handleCloseModal}
        />
      )}

      {/* Esto permitirá que los toasts se muestren en toda la aplicación */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
      />
    </div>
  )
}

export default App
