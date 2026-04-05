import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <div className="px-6 py-12 md:py-20">
      <h1 className="mb-8 text-center text-3xl font-bold tracking-wide">
        CONTACT US
      </h1>
      <ContactForm />
    </div>
  );
}
