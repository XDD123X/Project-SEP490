import { Mail, Phone, Facebook } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ContactInfo() {
    const email = import.meta.env.VITE_SUPPORT_EMAIL
    const phone = import.meta.env.VITE_SUPPORT_PHONE
    const facebookUrl = import.meta.env.VITE_SUPPORT_FACEBOOK

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-2xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <a href={`mailto:${email}`} className="text-lg font-medium text-gray-900 hover:text-blue-600">
                            {email}
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <a href={`tel:${phone}`} className="text-lg font-medium text-gray-900 hover:text-blue-600">
                            {phone}
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <Facebook className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Facebook</p>
                        <a
                            href={facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-medium text-gray-900 hover:text-blue-600"
                        >
                            Visit our Facebook page
                        </a>
                    </div>
                </div>

                <div className="mt-8 rounded-lg bg-gray-50 p-6">
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Office Hours</h3>
                    <div className="space-y-2 text-gray-600">
                        <p>Monday - Sunday: 7:30 AM - 6:00 PM</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
