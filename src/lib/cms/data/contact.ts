import { ContactContent } from "@/types/cms";

export const contactContent: ContactContent = {
  seo: {
    title: "",
    description:
      "Get in touch with the CalmTouch editorial team. Send us your inquiries or massage topic requests directly.",
  },
  badge: "Connect With Us",
  title: "We Would Love to Hear From You",
  subtitle:
    "Have a question regarding massage therapy, a suggested topic for our editorial team, or a feedback note? Reach out and we'll reply shortly.",
  infoCards: {
    visible: true,
    items: [
      {
        title: "Direct Email",
        detail: "support@calmtouch.com",
        subtext: "We respond within 24 to 48 business hours",
        iconName: "Mail",
        href: "mailto:support@calmtouch.com",
      },
      {
        title: "Editorial Desk",
        detail: "editorial@calmtouch.com",
        subtext: "For therapist submissions and content inquiries",
        iconName: "FileText",
        href: "mailto:editorial@calmtouch.com",
      },
      {
        title: "Our Hours",
        detail: "Monday - Friday: 9am - 6pm EST",
        subtext: "Weekend messages answered Mondays",
        iconName: "Clock",
        href: "",
      },
    ],
  },
  form: {
    visible: true,
    title: "Send a Message",
    subtitle: "Fill out the form below and we will get back to you promptly.",
    buttonText: "Send Message",
    subjects: [
      "General Inquiry",
      "Article Topic Suggestion",
      "Editorial Feedback",
      "Therapist Collaboration",
      "Press & Partnerships",
    ],
    recipientEmail: "support@calmtouch.com",
    successMessage: "Thank you {name}! Message recorded and opening mail client.",
  },
  faq: {
    visible: true,
    title: "Frequently Asked",
    subtitle: "Quick answers to common questions about CalmTouch.",
    items: [
      {
        question: "Can CalmTouch provide medical diagnosis or treatment plans?",
        answer:
          "No. CalmTouch provides educational wellness advice only. If you are experiencing acute sharp pain, unexplained numbness, or chronic symptoms, always consult a licensed physician or physical therapist.",
      },
      {
        question: "How often do you publish new wellness guides?",
        answer:
          "We publish new in-depth articles, technique breakdowns, and recovery guides every Tuesday and Friday morning.",
      },
      {
        question: "Are your massage routines safe for pregnant individuals?",
        answer:
          "Certain pressure points and deep abdominal/sacral techniques should be avoided during pregnancy. Always seek a specialized prenatal massage therapist and clearance from your OB-GYN.",
      },
      {
        question: "Can I suggest a specific topic or muscle group for an article?",
        answer:
          "Absolutely! Use the contact form below or email us directly at editorial@calmtouch.com with your topic ideas.",
      },
    ],
  },
};
