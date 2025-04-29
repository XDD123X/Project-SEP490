import { ContactForm } from "@/components/contact/contact-form";
import { HeroSection } from "@/components/contact/contact-hero-section";
import { ContactInfo } from "@/components/contact/contact-infor";
import { MapSection } from "@/components/contact/contact-map-section";
import Footer from "@/components/homepage/Footer";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-primary/20">
            <HeroSection />
            <div className="container mx-auto px-4 py-12 ">
                <div className="grid gap-12 md:grid-cols-2">
                    <ContactInfo />
                    <ContactForm />
                </div>
            </div>
            <MapSection />
            <Footer />
        </div>
    )
}
