
const Hero = () => {
  return (
    
    <section id="home"
    className="relative  min-h-screen bg-cream flex items-center">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl lg:text-6xl font-serif font-bold text-dgreen mb-6 leading-tight">
              Redefine Your Space with
              <span className="text-lgreen"> Natural Elegance & Innovation</span>
            </h1>
            <p className="text-lg text-gray-900 mb-8 leading-relaxed">
              Discover our curated collection of sustainable furniture, 
              crafted with care for both timeless beauty and environmental responsibility. 
              Experience the future of home design with our unique AR feature – 
              **try any piece in your own space before you buy!**
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-lgreen text-lg px-8 py-4 hover:bg-dgreen transition-colors duration-300 rounded-lg cursor-pointer">
                Shop Now!
              </button>
              <button className="bg-lgreen text-lg px-8 py-4 rounded-lg hover:bg-dgreen transition-colors duration-300 cursor-pointer">
                Shop Collection
              </button>
            </div>
            
          </div>
          
          <div className="animate-slide-up">
            <div className="relative">
              <div className="absolute inset-0 bg-dgreen rounded-3xl transform rotate-3"></div>
              <img 
                src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Modern living room with elegant furniture"
                className="relative rounded-3xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="fill-white">
          <path d="M0,64L1440,32L1440,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
