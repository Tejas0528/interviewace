from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are a learning resource curator. Suggest realistic, high-quality YouTube videos
that would genuinely help someone learn this topic for interview preparation.
Use REAL, well-known educational YouTube channels for tech content like:
freeCodeCamp.org, Traversy Media, Fireship, NeetCode, Tech With Tim, CS Dojo, 
The Coding Train, Programming with Mosh, Academind, Web Dev Simplified, 
ByteByteGo (system design), Gaurav Sen (system design), Apna College, CodeWithHarry

Return ONLY valid JSON:
{
  "videos": [
    {
      "title": "Realistic video title for this topic",
      "channel": "Real channel name from the list above",
      "duration": "15:30",
      "description": "What this video covers",
      "topic_match": "Why this is relevant"
    }
  ]
}
Provide 4-6 videos. Return ONLY JSON."""

class VideoRecommenderAgent(BaseAgent):
    async def get_recommendations(self, topic: str) -> dict:
        response = await self.invoke(SYSTEM_PROMPT, f"Suggest learning videos for: {topic}")
        result = self.parse_json(response)
        
        if not result or "videos" not in result:
            return self._default(topic)
        
        # Add search URLs since we don't have real YouTube API access
        for v in result.get("videos", []):
            query = f"{v.get('title', topic)} {v.get('channel', '')}".replace(" ", "+")
            v["search_url"] = f"https://www.youtube.com/results?search_query={query}"
            v["thumbnail_placeholder"] = True
        
        return result

    def _default(self, topic: str) -> dict:
        return {
            "videos": [
                {
                    "title": f"{topic} Explained - Complete Guide",
                    "channel": "freeCodeCamp.org", "duration": "25:00",
                    "description": f"Comprehensive tutorial covering {topic} fundamentals",
                    "topic_match": "Beginner-friendly comprehensive coverage",
                    "search_url": f"https://www.youtube.com/results?search_query={topic.replace(' ', '+')}+tutorial",
                    "thumbnail_placeholder": True
                },
                {
                    "title": f"{topic} for Interviews",
                    "channel": "NeetCode", "duration": "18:45",
                    "description": f"Interview-focused explanation of {topic}",
                    "topic_match": "Interview preparation specific",
                    "search_url": f"https://www.youtube.com/results?search_query={topic.replace(' ', '+')}+interview",
                    "thumbnail_placeholder": True
                },
            ]
        }
