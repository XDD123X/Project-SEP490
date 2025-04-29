import { Mail, Phone, Facebook } from "lucide-react"

export function Footer() {
    const email = import.meta.VITE_SUPPORT_EMAIL
    const phone = import.meta.VITE_SUPPORT_PHON
    const facebookUrl = import.meta.VITE_SUPPORT_FACEBOOK

    return (
        <footer className="bg-gray-900 py-12 text-gray-300">
            <div className="container mx-auto px-4">
                <div className="grid gap-8 md:grid-cols-3">
                    <div>
                        <h3 className="mb-4 text-xl font-bold text-white">About Us</h3>
                        <p className="mb-4">
                            We're dedicated to providing exceptional service and solutions to meet your needs. Our team of experts is
                            always ready to help you achieve your goals.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 text-xl font-bold text-white">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="hover:text-white">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    Services
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-xl font-bold text-white">Contact Us</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                <a href={`mailto:${email}`} className="hover:text-white">
                                    {email}
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                <a href={`tel:${phone}`} className="hover:text-white">
                                    {phone}
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Facebook className="h-5 w-5" />
                                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                                    Facebook
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-800 pt-8 text-center">
                    <p>&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
