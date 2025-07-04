
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "Portland, OR",
      text: "AR-Furniture transformed our living space completely. The quality is exceptional and knowing it's sustainable makes it even better.",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      location: "San Francisco, CA",
      text: "The craftsmanship is incredible. Each piece feels like it was made specifically for our home. Couldn't be happier with our dining set.",
      rating: 5
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      location: "Austin, TX",
      text: "Finally found furniture that matches our values. Beautiful, durable, and environmentally conscious. AR-Furniture is our go-to now.",
      rating: 5
    }
  ];

  return (
    <section className="bg-white section-padding">
      <div className="max-w-7xl mx-auto p-5">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-serif font-bold text-sage-dark mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from families who have transformed their homes with AR-Furniture
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className="bg-sage-light rounded-2xl p-8 animate-slide-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              
              <div>
                <div className="font-semibold text-sage-dark">
                  {testimonial.name}
                </div>
                <div className="text-gray-600 text-sm">
                  {testimonial.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
