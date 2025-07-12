
const Newsletter = () => {
  return (
    <section className="bg-sage-dark section-padding">
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-fade-in">
          <h2 className="text-4xl font-serif font-bold text-white mb-4">
            Stay in the Loop
          </h2>
          <p className="text-lg text-sage-light mb-8 max-w-2xl mx-auto">
            Get the latest updates on new collections, exclusive offers, and design inspiration 
            delivered straight to your inbox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-lg border-0 focus:ring-2 focus:ring-sage-medium text-gray-900 placeholder-gray-500"
            />
            <button className="bg-sage-medium text-sage-dark px-8 py-4 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-300 whitespace-nowrap">
              Subscribe
            </button>
          </div>
          
          <p className="text-sage-light text-sm mt-4">
            No spam, unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
