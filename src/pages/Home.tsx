import Header from "../components/Home/Header";
import Footer from "../shared/Footer";
import Hero from "../components/Home/Hero";
import FeaturedProducts from "../components/Home/FeaturedProducts";
import Testimonials from "../components/Home/Testimonials";
import About from "../components/Home/About";


const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Header, Hero, Featured Products, Newsletter, Footer */}
      <Header />
      <Hero />
      <FeaturedProducts />
      <About />
      <Testimonials />
      <Footer />
    </div>

  );
}

export default Home;
