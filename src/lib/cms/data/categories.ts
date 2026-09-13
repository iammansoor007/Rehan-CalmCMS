import { Category, BrowseCard } from "@/types/cms";

export const categoriesData: Category[] = [
  {
    slug: "massage-therapy",
    name: "Massage Therapy",
    description:
      "Browse our complete archive of classic modalities, professional session advice, and bodywork techniques tailored for stress and body alignment.",
  },
  {
    slug: "pain-relief",
    name: "Pain Relief",
    description:
      "Target everyday discomfort, lower back strain, neck tightness, and muscle spasms with safe therapeutic approaches.",
  },
  {
    slug: "stress-sleep",
    name: "Stress & Sleep",
    description:
      "Quiet an overactive mind and prepare your nervous system for deep restorative sleep with evening massage rituals.",
  },
  {
    slug: "self-care",
    name: "Self-Care",
    description:
      "Practical self-massage routines, reflexology tips, and foam rolling techniques you can easily do at home.",
  },
  {
    slug: "aromatherapy",
    name: "Aromatherapy",
    description:
      "Enhance your relaxation journey with essential oil blends, plant extracts, and mindful fragrance pairings.",
  },
  {
    slug: "recovery",
    name: "Recovery",
    description:
      "Support active bodies with post-workout massage, hydrotherapy combinations, and injury prevention advice.",
  },
  {
    slug: "all",
    name: "All Category Archives",
    description:
      "Browse our complete collection of simple, evidence-aligned massage and body care guides.",
  },
];

export const browseCategoryCards: Record<string, BrowseCard[]> = {
  "Massage Therapy": [
    { title: "Swedish Massage: What to Expect", img: "/assets/images/hero.png" },
    { title: "Deep Tissue vs Sports Massage", img: "/assets/images/article2.png" },
    { title: "How Often Should You Get a Massage?", img: "/assets/images/article1.png" },
    { title: "Simple Hand Massage for Daily Tension", img: "/assets/images/article3.png" },
  ],
  "Pain Relief": [
    { title: "Targeting Lower Back Discomfort Effectively", img: "/assets/images/article2.png" },
    { title: "Relieving Upper Back & Shoulder Tightness", img: "/assets/images/article1.png" },
    { title: "Therapeutic Stretches to Combine with Massage", img: "/assets/images/hero.png" },
    { title: "Sciatica Pain Relief Through Myofascial Release", img: "/assets/images/article3.png" },
  ],
  "Stress & Sleep": [
    { title: "Best Evening Massage Routine for Better Sleep", img: "/assets/images/article3.png" },
    { title: "Calming Your Nervous System with Head & Scalp Massage", img: "/assets/images/article4.png" },
    { title: "Breathing Techniques During Massage Sessions", img: "/assets/images/hero.png" },
    { title: "Creating a Peaceful Sleep Sanctuary at Home", img: "/assets/images/article1.png" },
  ],
  "Self-Care": [
    { title: "5 Easy Neck Massage Techniques for Desk Workers", img: "/assets/images/article1.png" },
    { title: "Daily Foot Reflexology Essentials", img: "/assets/images/article3.png" },
    { title: "Foam Rolling Guidelines for Beginners", img: "/assets/images/article2.png" },
    { title: "Evening Relaxation Rituals for Busy Mind", img: "/assets/images/article4.png" },
  ],
  "Recovery": [
    { title: "Post-Workout Muscle Recovery Techniques", img: "/assets/images/hero.png" },
    { title: "Hydrotherapy & Heat Therapy Combinations", img: "/assets/images/article2.png" },
    { title: "Preventing Sports Injuries with Regular Therapy", img: "/assets/images/article1.png" },
    { title: "Active Rest Days for Long-term Mobility", img: "/assets/images/article3.png" },
  ],
};
