import logo from '@assets/images/logo.svg'

const Logo = () => (
  <div className="h-full flex items-center pt-2 lg:pt-4">
    {' '}
    {/* Padding superior */}
    <div className="h-[110px] lg:h-[120px] px-2 flex items-center">
      <img
        src={logo || '/placeholder.svg'}
        alt="Trendpulse"
        className="h-[90%] w-auto object-contain transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer"
        /** Le aplico una altura relativa para que se ajuste al contenedor */
      />
    </div>
  </div>
)

export default Logo
