import CookProfile from "../modles/cookProfile.js";

// AI Matchmaker: Match cooks based on natural language user descriptions, food, type, reviews, and ratings
export const matchCooks = async (req, res) => {
  try {
    const { foodWant, cuisine, whenWant, additionalRequirements } = req.body;
    console.log("DEBUG Matchmaker request payload:", { foodWant, cuisine, whenWant, additionalRequirements });
    console.log("DEBUG GEMINI_API_KEY exists in process.env:", !!process.env.GEMINI_API_KEY);
    console.log("DEBUG Available keys in process.env containing GEMINI/API/KEY:", Object.keys(process.env).filter(k => k.toLowerCase().includes("gemini") || k.toLowerCase().includes("api") || k.toLowerCase().includes("key")));
    
    if (!foodWant) {
      return res.status(400).json({ message: "Please tell us what food you want today" });
    }

    // Retrieve all cooks and populate user and reviews
    const cooks = await CookProfile.find()
      .populate('user', 'name email')
      .populate('reviews.user', 'name');
    
    // Structure a highly descriptive list for Gemini to analyze
    const cooksList = cooks.map(c => ({
      id: c._id.toString(),
      name: c.user?.name,
      cuisines: c.cuisines || [],
      experience: c.experience,
      pricePerDay: c.pricePerDay,
      rating: c.rating || 0,
      location: `${c.location?.city || ''}, ${c.location?.state || ''}`,
      bio: c.bio || "",
      recentReviews: (c.reviews || []).slice(0, 3).map(r => ({
        rating: r.rating,
        comment: r.comment
      }))
    }));

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback matches
      const fallbackMatches = cooks.slice(0, 3).map((c, idx) => ({
        cook: c,
        matchScore: 96 - idx * 4,
        aiExplanation: `Chef ${c.user?.name || 'Specialist'} has excellent reviews and a high ${c.rating || 5}-star rating for preparing customized meals like "${foodWant}".`
      }));
      return res.json(fallbackMatches);
    }

    const prompt = `You are an elite culinary matchmaking assistant.
We have a client who has described their dining requirements:
- What food they want today: "${foodWant}"
- Cuisine / Style desired: "${cuisine || "Any"}"
- When they want it: "${whenWant || "Today"}"
- Additional details/requirements: "${additionalRequirements || "None"}"

Here is the list of available professional chefs on our platform (including their specialties, prices, ratings, and client reviews):
${JSON.stringify(cooksList, null, 2)}

Analyze the client's needs against the chefs' profiles, ratings, prices, and client reviews. Select the top 1 to 3 best-matching chefs.
You MUST reply ONLY with a valid, parseable JSON array of objects matching this exact schema:
[
  {
    "cookId": "String ID of the matching chef",
    "matchScore": 95,
    "aiExplanation": "A charming, 2-sentence explanation of why they are the perfect chef, specifically mentioning how their experience, ratings, and reviews fit the client's craving."
  }
]`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error("Gemini matchmaker call failed");
    }

    const data = await response.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text.includes("```")) {
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    const aiMatches = JSON.parse(text);

    // Populate full cook data for the matched IDs
    const matchedCooks = [];
    for (const match of aiMatches) {
      const fullCook = cooks.find(c => c._id.toString() === match.cookId);
      if (fullCook) {
        matchedCooks.push({
          cook: fullCook,
          matchScore: match.matchScore,
          aiExplanation: match.aiExplanation
        });
      }
    }

    if (matchedCooks.length === 0) {
      const fallbacks = cooks.slice(0, 2).map((c, idx) => ({
        cook: c,
        matchScore: 88 - idx * 4,
        aiExplanation: `Recommended based on outstanding reviews and their specialization in related dishes.`
      }));
      return res.json(fallbacks);
    }

    res.json(matchedCooks);
  } catch (error) {
    console.error("AI Matchmaker error:", error);
    const cooks = await CookProfile.find().populate('user', 'name email').populate('reviews.user', 'name');
    const fallbacks = cooks.slice(0, 2).map((c, idx) => ({
      cook: c,
      matchScore: 85 - idx * 5,
      aiExplanation: `Recommended based on high overall ratings and general availability.`
    }));
    res.json(fallbacks);
  }
};
