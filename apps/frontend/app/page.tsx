import CourseSection from "../components/CourseSection";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import InfoSections from "../components/InfoSections";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <CourseSection />
      <InfoSections />
      <Footer />
    </main>
  );
}
