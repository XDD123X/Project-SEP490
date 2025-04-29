export function MapSection() {
    return (
        <div className="bg-white py-12">
            <div className="container mx-auto px-4">
                <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Our Location</h2>
                <div className="overflow-hidden rounded-lg shadow-lg">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.30596552044!2d-74.25986548248684!3d40.69714941932609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sca!4v1619756483692!5m2!1sen!2sca"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title="Office Location"
                    ></iframe>
                </div>
            </div>
        </div>
    )
}
