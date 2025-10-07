// src/data/quizQuestions.js
// Types: "single" (radio), "multiple" (checkbox), "text" (free text)

export const quizQuestions = [
  // 1) Identity & Motivation (1–5)
  {
    id: 1,
    category: "Identity & Motivation",
    type: "single",
    question: "What best describes what drives you as an athlete?",
    options: [
      "Proving myself against the best",
      "Representing my school/community",
      "Building a personal brand",
      "Achieving financial stability for my family",
      "Inspiring others through my journey"
    ]
  },
  {
    id: 2,
    category: "Identity & Motivation",
    type: "text",
    question: "In one sentence, what’s your personal mission as an athlete?",
  },
  {
    id: 3,
    category: "Identity & Motivation",
    type: "single",
    question: "How would you describe your leadership style?",
    options: [
      "Lead by example",
      "Motivate through words",
      "Calm and steady presence",
      "High energy / hype",
      "I prefer to focus on my craft quietly"
    ]
  },
  {
    id: 4,
    category: "Identity & Motivation",
    type: "single",
    question: "What do you want people to remember most about your athletic career?",
    options: [
      "Work ethic",
      "Character and integrity",
      "Team achievements",
      "Personal records",
      "Community impact"
    ]
  },
  {
    id: 5,
    category: "Identity & Motivation",
    type: "text",
    question: "What’s your biggest motivator during tough stretches of the season?",
  },

  // 2) NIL Vision (6–10)
  {
    id: 6,
    category: "NIL Vision",
    type: "single",
    question: "What do you hope to achieve through NIL opportunities?",
    options: [
      "Supplement income",
      "Grow personal brand",
      "Support my family",
      "Build long-term business",
      "Give back to my community"
    ]
  },
  {
    id: 7,
    category: "NIL Vision",
    type: "single",
    question: "How comfortable are you creating sponsored content?",
    options: [
      "Very comfortable",
      "Somewhat comfortable",
      "Neutral",
      "Somewhat uncomfortable",
      "Very uncomfortable"
    ]
  },
  {
    id: 8,
    category: "NIL Vision",
    type: "multiple",
    question: "Which types of partnerships interest you most? (Choose all that apply)",
    options: [
      "Local businesses",
      "National brands",
      "Charities / community orgs",
      "Fitness or nutrition",
      "Lifestyle / fashion",
      "Tech / gaming",
      "Food & beverage"
    ]
  },
  {
    id: 9,
    category: "NIL Vision",
    type: "multiple",
    question: "Which NIL formats would you most enjoy? (Choose all that apply)",
    options: [
      "Social media posts",
      "Appearances / events",
      "Brand ambassadorship",
      "Merchandise collabs",
      "Speaking / mentorship",
      "Affiliate links / promo codes"
    ]
  },
  {
    id: 10,
    category: "NIL Vision",
    type: "single",
    question: "Which matters more to you when choosing a deal?",
    options: [
      "Financial compensation",
      "Brand alignment / values",
      "Audience growth potential",
      "Community impact",
      "Product quality"
    ]
  },

  // 3) Community & Interests (11–15)
  {
    id: 11,
    category: "Community & Interests",
    type: "text",
    question: "What’s your connection to your hometown and/or school community?",
  },
  {
    id: 12,
    category: "Community & Interests",
    type: "multiple",
    question: "Which causes are you most passionate about? (Choose all that apply)",
    options: [
      "Youth development / mentorship",
      "Education / literacy",
      "Mental health",
      "Faith-based initiatives",
      "Environmental sustainability",
      "Food security",
      "Local small business growth"
    ]
  },
  {
    id: 13,
    category: "Community & Interests",
    type: "single",
    question: "Would you participate in community events or charity drives?",
    options: ["Definitely", "Probably", "Maybe", "Probably not", "No"]
  },
  {
    id: 14,
    category: "Community & Interests",
    type: "single",
    question: "How active are you in engaging fans outside of games?",
    options: [
      "Very active (weekly or more)",
      "Somewhat active (monthly)",
      "Occasional",
      "Not active yet"
    ]
  },
  {
    id: 15,
    category: "Community & Interests",
    type: "multiple",
    question: "Which local industries excite you most? (Choose all that apply)",
    options: [
      "Coffee / cafés",
      "Gyms / training",
      "Restaurants / food trucks",
      "Tech / startups",
      "Health / wellness",
      "Arts / music / culture",
      "Retail / apparel"
    ]
  },

  // 4) Lifestyle & Personality (16–20)
  {
    id: 16,
    category: "Lifestyle & Personality",
    type: "single",
    question: "How would close friends describe your personality?",
    options: [
      "Outgoing and talkative",
      "Chill and observant",
      "Focused and intense",
      "Funny and entertaining",
      "Balanced and grounded"
    ]
  },
  {
    id: 17,
    category: "Lifestyle & Personality",
    type: "multiple",
    question: "Pick words that describe your off-court vibe (Choose all that apply)",
    options: [
      "Hype",
      "Minimal",
      "Faith-forward",
      "Family-first",
      "Creative",
      "Scholarly",
      "Trendsetter"
    ]
  },
  {
    id: 18,
    category: "Lifestyle & Personality",
    type: "multiple",
    question: "What do you enjoy most during downtime? (Choose all that apply)",
    options: [
      "Gaming",
      "Reading / studying",
      "Music / creating",
      "Fashion / styling",
      "Volunteering",
      "Coaching / mentoring",
      "Content creation"
    ]
  },
  {
    id: 19,
    category: "Lifestyle & Personality",
    type: "text",
    question: "If your personal brand had a tagline or color palette, how would you describe it?",
  },
  {
    id: 20,
    category: "Lifestyle & Personality",
    type: "multiple",
    question: "What content do you naturally post most often? (Choose all that apply)",
    options: [
      "Game highlights",
      "Lifestyle / behind-the-scenes",
      "Motivation / faith",
      "Humor / trends",
      "Product reviews / recommendations"
    ]
  },

  // 5) Business Readiness (21–25)
  {
    id: 21,
    category: "Business Readiness",
    type: "single",
    question: "How often do you post on social media?",
    options: ["Daily", "2–3x per week", "Weekly", "Monthly", "Rarely"]
  },
  {
    id: 22,
    category: "Business Readiness",
    type: "multiple",
    question: "Which platforms do you actively use? (Choose all that apply)",
    options: [
      "Instagram",
      "TikTok",
      "YouTube",
      "X (Twitter)",
      "Twitch",
      "Facebook",
      "LinkedIn"
    ]
  },
  {
    id: 23,
    category: "Business Readiness",
    type: "single",
    question: "How comfortable are you negotiating or reviewing NIL contracts?",
    options: [
      "Very comfortable",
      "Somewhat comfortable",
      "Neutral",
      "Need help / not comfortable"
    ]
  },
  {
    id: 24,
    category: "Business Readiness",
    type: "single",
    question: "Would you like help building a media kit / portfolio?",
    options: ["Yes, please", "Maybe later", "I already have one"]
  },
  {
    id: 25,
    category: "Business Readiness",
    type: "single",
    question: "How would you rate your time management across school, sport, and NIL?",
    options: ["Excellent", "Good", "Fair", "Needs work"]
  },

  // 6) Aspirations & Growth (26–30)
  {
    id: 26,
    category: "Aspirations & Growth",
    type: "text",
    question: "Where do you see yourself five years after college?",
  },
  {
    id: 27,
    category: "Aspirations & Growth",
    type: "multiple",
    question: "Which industries do you want to work with long-term? (Choose all that apply)",
    options: [
      "Sports performance / recovery",
      "Financial services",
      "Education / edtech",
      "Travel / hospitality",
      "Media / entertainment",
      "Real estate",
      "Consumer packaged goods"
    ]
  },
  {
    id: 28,
    category: "Aspirations & Growth",
    type: "text",
    question: "Who inspires your approach to branding (athletes, creators, leaders)?",
  },
  {
    id: 29,
    category: "About You",
    type: "text",
    question: "Which school or college do you currently attend?",
  },
  {
    id: 30,
    category: "Preferences",
    type: "single",
    question: "What is your preferred maximum distance (in miles) for connecting with local businesses?",
    options: ["5", "10", "25", "50"]
  }
];
