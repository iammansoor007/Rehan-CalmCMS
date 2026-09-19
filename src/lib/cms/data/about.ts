import { AboutContent } from "@/types/cms";

export const aboutContent: AboutContent = {
  seo: {
    title: "",
    description:
      "Learn about CalmTouch's mission to provide simple, trustworthy, and science-backed massage and body wellness guides.",
  },
  badge: "Our Philosophy",
  title: "Empowering Everyday Wellness Through Thoughtful Touch",
  subtitle:
    "CalmTouch was founded on the belief that bodily comfort, intentional touch, and nervous system regulation should be accessible to everyone.",
  image: "",
  story: {
    visible: true,
    title: "Why CalmTouch Exists",
    paragraphs: [
      "In our modern, high-speed digital world, our physical bodies often bear the silent brunt of continuous stress—from hunched shoulders over keyboards to chronic lower back stiffness and interrupted sleep patterns.",
      "Most wellness information online is either overly technical or cluttered with commercial hype. CalmTouch offers a tranquil sanctuary of clear, grounded, and evidence-informed guidance on massage therapy, self-care routines, and gentle physical recovery.",
      "Whether you are preparing for your very first professional massage appointment or seeking 3-minute desk stretches to loosen an aching neck, we provide actionable advice you can trust.",
    ],
    image: "",
  },
  values: {
    visible: true,
    title: "Our Core Principles",
    subtitle: "The foundational pillars that steer every article and routine we share.",
    items: [
      {
        title: "Clarity & Simplicity",
        desc: "We explain anatomical principles and bodywork concepts in warm, plain language anyone can apply.",
        iconName: "Compass",
      },
      {
        title: "Evidence & Safety First",
        desc: "Every self-massage technique and guideline prioritizes anatomical safety, gentle pressure, and injury prevention.",
        iconName: "Shield",
      },
      {
        title: "Holistic Mind-Body Connection",
        desc: "We view muscular tension not just as mechanical tightness, but as a direct reflection of our nervous system state.",
        iconName: "Smile",
      },
    ],
  },
  team: {
    visible: true,
    title: "Editorial Advisors & Contributors",
    subtitle: "Experienced practitioners dedicated to body health and mindful recovery.",
    members: [
      {
        name: "Dr. Elena Vance, LMT",
        role: "Lead Bodywork Advisor",
        bio: "Over 14 years of clinical experience in neuromuscular therapy, myofascial release, and pain rehabilitation.",
        photo: "",
      },
      {
        name: "Marcus Vance",
        role: "Athletic Recovery Coach",
        bio: "Former collegiate trainer specializing in sports massage, dynamic mobility, and soft-tissue injury prevention.",
        photo: "",
      },
      {
        name: "Sarah Jenkins",
        role: "Aromatherapy & Sleep Specialist",
        bio: "Holistic health practitioner focusing on the intersection of herbal botanicals, breathwork, and deep sleep hygiene.",
        photo: "",
      },
    ],
  },
  commitments: {
    visible: true,
    title: "Our Editorial Integrity Pledge",
    subtitle: "We uphold clinical responsibility and factual clarity in every guide we write.",
    items: [
      "Strict editorial independence with no undisclosed product promotions",
      "Evidence-supported techniques referenced from certified massage manuals",
      "Clear contraindication alerts advising when to seek professional medical care",
      "Committed to accessible, inclusive wellness advice for all ages and fitness levels",
    ],
  },
};
