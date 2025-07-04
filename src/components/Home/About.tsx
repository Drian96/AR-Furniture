
const About = () => {
  return (
    <section id="about" className="bg-cream"> 

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="animate-fade-in m-10">

            <h2 className="text-4xl font-serif font-bold text-sage-dark mb-6">
              Crafted with Purpose, Designed for Life
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              For over two decades, AR-Furniture has been at the forefront of sustainable furniture design. 
              We believe that beautiful furniture shouldn't come at the cost of our environment.
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Every piece in our collection is carefully crafted using responsibly sourced materials, 
              traditional techniques, and modern innovation to create furniture that tells a story 
              and stands the test of time.
            </p>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-sage-dark mb-2">20+</div>
                <div className="text-gray-600">Years of Excellence</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sage-dark mb-2">100%</div>
                <div className="text-gray-600">Sustainable Materials</div>
              </div>
            </div>
            
          </div>
          
          <div className="animate-slide-up">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img 
                  src="https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                  alt="Craftsmanship detail"
                  className="rounded-2xl shadow-lg w-full h-48 object-cover"
                />
                <img 
                  src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                  alt="Sustainable materials"
                  className="rounded-2xl shadow-lg w-full h-32 object-cover"
                />
              </div>
              <div className="space-y-4 mt-8">
                <img 
                  src="https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                  alt="Workshop atmosphere"
                  className="rounded-2xl shadow-lg w-full h-32 object-cover"
                />
                <img 
                  src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                  alt="Finished furniture"
                  className="rounded-2xl shadow-lg w-full h-48 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
