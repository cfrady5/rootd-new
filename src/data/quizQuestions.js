// src/data/quizQuestions.js
export const quizQuestions = [
  // ===== 1. Profile Basics =====
  { id: 1, category: "Profile Basics", type: "text", question: "Where do you go to school?", placeholder: "e.g. Purdue University" },
  { id: 2, category: "Profile Basics", type: "single", question: "What year are you in school?", options: ["Freshman","Sophomore","Junior","Senior","Graduate student","Other"] },
  { id: 3, category: "Profile Basics", type: "single", question: "Which sport do you play?", options: ["Basketball","Football","Soccer","Baseball","Softball","Volleyball","Track & Field","Cross Country","Swimming & Diving","Wrestling","Tennis","Golf","Gymnastics","Lacrosse","Hockey","Cheer / Dance","Esports","Other"] },
  { id: 4, category: "Profile Basics", type: "single", question: "What is your position or event specialty?", options: ["Guard / Perimeter","Forward / Wing","Center","Quarterback","Running Back","Receiver / Tight End","Defensive / Lineman","Midfielder","Goalkeeper","Sprinter","Distance","Thrower / Field","Other"] },
  { id: 5, category: "Profile Basics", type: "single", question: "Scholarship status", options: ["Full","Partial","None","Prefer not to say"] },
  { id: 6, category: "Profile Basics", type: "single", question: "Roster status", options: ["Starter","Key rotation","Role player","Redshirt","Injured / rehab","Walk-on"] },

  // ===== 2. Motivation & Goals =====
  { id: 7, category: "Motivation & Goals", type: "single", question: "What drives you most as an athlete?", options: ["Proving myself","Representing my school/community","Building my brand","Providing for my family","Inspiring others"] },
  { id: 8, category: "Motivation & Goals", type: "single", question: "Which statement best fits your current mindset?", options: ["I’m focused purely on performance","I’m balancing performance with building my platform","I’m looking for NIL deals that fit my values","I’m exploring creative side projects"] },
  { id: 9, category: "Motivation & Goals", type: "single", question: "How would you describe your leadership style?", options: ["Lead by example","Motivate through words","Calm and steady presence","High-energy / hype","Quietly focused on my craft"] },
  { id: 10, category: "Motivation & Goals", type: "single", question: "What do you want fans to remember most about your career?", options: ["Work ethic","Character and integrity","Team success","Personal records","Community impact"] },
  { id: 11, category: "Motivation & Goals", type: "single", question: "Your top NIL goal:", options: ["Supplement income","Grow personal brand","Support my family","Launch a business","Give back locally"] },

  // ===== 3. Content & Brand Presence =====
  { id: 12, category: "Content & Brand Presence", type: "multiple", question: "Which platforms are you active on?", options: ["Instagram","TikTok","YouTube","X (Twitter)","Twitch","Facebook","LinkedIn"] },
  { id: 13, category: "Content & Brand Presence", type: "single", question: "How often do you post?", options: ["Daily","2–3x/week","Weekly","Monthly","Rarely"] },
  { id: 14, category: "Content & Brand Presence", type: "multiple", question: "What do you post most often? (Select all)", options: ["Game highlights","Training / workouts","Behind-the-scenes","Motivation / faith","Humor / trends","Fashion / lifestyle","Tech / gaming","Food / reviews","School life"] },
  { id: 15, category: "Content & Brand Presence", type: "single", question: "Comfort level creating sponsored content", options: ["Very comfortable","Somewhat comfortable","Neutral","Somewhat uncomfortable","Not comfortable yet"] },
  { id: 16, category: "Content & Brand Presence", type: "single", question: "Preferred content style", options: ["Cinematic / polished","Casual / authentic","Funny / trending","Inspirational / story-driven","Educational / informative"] },

  // ===== 4. Personality & Lifestyle =====
  { id: 17, category: "Personality & Lifestyle", type: "single", question: "How would close friends describe you?", options: ["Outgoing","Chill","Focused","Funny","Balanced"] },
  { id: 18, category: "Personality & Lifestyle", type: "multiple", question: "Pick words that describe your off-court vibe", options: ["Hype","Minimal","Faith-forward","Family-first","Creative","Scholarly","Trendsetter","Introverted"] },
  { id: 19, category: "Personality & Lifestyle", type: "multiple", question: "What do you enjoy most in downtime?", options: ["Gaming","Music / creating","Reading / studying","Volunteering","Coaching / mentoring","Content creation","Travel / exploring","Fashion / styling"] },
  { id: 20, category: "Personality & Lifestyle", type: "single", question: "What best describes your personal brand tone?", options: ["Motivational","Entertaining","Educational","Faith-based","Lifestyle / fashion","Community-focused"] },
  { id: 21, category: "Personality & Lifestyle", type: "multiple", question: "Preferred content formats", options: ["Short-form video (Reels / TikTok)","Photo posts","Podcasts","Livestreams","Blogs / written pieces"] },

  // ===== 5. Community & Causes =====
  { id: 22, category: "Community & Causes", type: "single", question: "How connected do you feel to your local community?", options: ["Very connected","Somewhat connected","Occasionally involved","Not active yet"] },
  { id: 23, category: "Community & Causes", type: "multiple", question: "Which causes are you most passionate about? (Select all)", options: ["Youth mentorship","Education / literacy","Mental health","Faith-based initiatives","Environmental sustainability","Food security","Local business growth","Veteran support","Equality & inclusion"] },
  { id: 24, category: "Community & Causes", type: "single", question: "Would you participate in charity events or appearances?", options: ["Definitely","Probably","Maybe","Probably not","No"] },
  { id: 25, category: "Community & Causes", type: "multiple", question: "Local industries you’d love to partner with", options: ["Coffee / cafés","Gyms / training","Restaurants / food trucks","Tech / startups","Health / wellness","Arts / music / culture","Retail / apparel","Automotive / dealerships","Education / tutoring"] },
  { id: 26, category: "Community & Causes", type: "single", question: "Community visibility level", options: ["Very active","Somewhat active","Occasional","Not active yet"] },

  // ===== 6. NIL Readiness =====
  { id: 27, category: "NIL Readiness", type: "single", question: "How confident are you managing NIL contracts?", options: ["Very confident","Somewhat confident","Neutral","Need help","Not confident"] },
  { id: 28, category: "NIL Readiness", type: "single", question: "Would you like resources on taxes / compliance?", options: ["Yes","Maybe","No"] },
  { id: 29, category: "NIL Readiness", type: "multiple", question: "What support do you need most?", options: ["Social media strategy","Brand partnerships","Legal guidance","Financial literacy","Time management","Public speaking","Portfolio / media kit"] },
  { id: 30, category: "NIL Readiness", type: "single", question: "If offered a new NIL deal, what matters most?", options: ["Compensation","Brand values","Audience growth","Community impact","Product quality"] },
  { id: 31, category: "NIL Readiness", type: "single", question: "Would you like help building a media kit?", options: ["Yes, please","Maybe later","I already have one"] },

  // ===== 7. Aspirations & Future =====
  { id: 32, category: "Aspirations & Future", type: "single", question: "Which area would you most like to grow in after graduation?", options: ["Professional athletics","Coaching / sports leadership","Entrepreneurship","Media / content creation","Corporate career","Community or nonprofit work"] },
  { id: 33, category: "Aspirations & Future", type: "multiple", question: "Industries you want to work with long-term (Select all)", options: ["Sports performance / recovery","Finance / investing","Education / edtech","Travel / hospitality","Media / entertainment","Real estate","Consumer products","Technology / AI"] },
  { id: 34, category: "Aspirations & Future", type: "single", question: "What type of brand partnerships excite you most?", options: ["Performance & training","Lifestyle & fashion","Health & wellness","Tech & innovation","Food & beverage","Community impact"] },

  // ===== 8. Preferences =====
  { id: 35, category: "Preferences", type: "slider", question: "Preferred max distance for partnering with local businesses (miles)", min: 0, max: 250, step: 5, defaultValue: 25 }
];
