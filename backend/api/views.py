import os
import requests
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ChatSession, ChatMessage, WishlistItem, Feedback
from .serializers import ChatSessionSerializer, ChatMessageSerializer, WishlistItemSerializer, FeedbackSerializer

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCNsatFnfNEEjP9nZWTa6J4wmOInQyE62U")
RAWG_API_KEY = os.environ.get("RAWG_API_KEY", "82f9e3d47f5a4fc58029006cc7b43b8d")

class ChatSessionViewSet(viewsets.ModelViewSet):
    queryset = ChatSession.objects.all().order_by('-updated_at')
    serializer_class = ChatSessionSerializer

    def create(self, request, *args, **kwargs):
        session = ChatSession.objects.create(title=f"Chat {ChatSession.objects.count() + 1}")
        serializer = self.get_serializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

def generate_smart_game_reply(user_text):
    text_lower = user_text.lower()

    if any(greeting in text_lower for greeting in ["hi", "hello", "hey", "sup", "greetings"]):
        return (
            "Hello gamer! 🎮 Welcome to **GameBot**. \n\n"
            "What kind of games are you looking for today? "
            "You can click a genre tag above, ask for recommendations (e.g. *\"Suggest me good RPG games\"*), "
            "or compare games (e.g. *\"compare Witcher 3 and Skyrim\"*)!"
        )

    # Detect genre keywords
    genres = ["rpg", "action", "adventure", "shooter", "strategy", "sports", "puzzle", "racing", "simulation", "indie"]
    matched_genre = None
    for g in genres:
        if g in text_lower:
            matched_genre = g
            break

    if matched_genre:
        try:
            url = f"https://api.rawg.io/api/games?key={RAWG_API_KEY}&search={matched_genre}&ordering=-rating&page_size=4"
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                if results:
                    lines = [f"Here are top-rated **{matched_genre.upper()}** games you should check out:\n"]
                    for idx, game in enumerate(results, 1):
                        name = game.get("name", "Unknown Game")
                        rating = game.get("rating", "N/A")
                        platforms = ", ".join([p.get("platform", {}).get("name", "") for p in game.get("platforms", [])[:3] if p.get("platform")])
                        lines.append(f"{idx}. **{name}** — ★ {rating}/5")
                        if platforms:
                            lines.append(f"   *Platforms*: {platforms}")
                    lines.append("\nWould you like more recommendations or details on any of these?")
                    return "\n".join(lines)
        except Exception:
            pass

    # Generic game recommendation response
    try:
        url = f"https://api.rawg.io/api/games?key={RAWG_API_KEY}&ordering=-rating&page_size=3"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            results = resp.json().get("results", [])
            lines = [f"Here are some top-rated game recommendations for **\"{user_text}\"**:\n"]
            for idx, game in enumerate(results, 1):
                lines.append(f"{idx}. **{game.get('name')}** — Rating: ★ {game.get('rating')}/5")
            return "\n".join(lines)
    except Exception:
        pass

    return f"Great choice! Here are some awesome recommendations based on '{user_text}': **The Witcher 3: Wild Hunt**, **Elden Ring**, and **Hades**. Let me know if you want detailed stats!"

@api_view(['POST'])
def send_chat_message(request, pk):
    try:
        session = ChatSession.objects.get(pk=pk)
    except ChatSession.DoesNotExist:
        return Response({"error": "Chat session not found"}, status=status.HTTP_404_NOT_FOUND)

    user_text = request.data.get("text", "").strip()
    if not user_text:
        return Response({"error": "Message text is required"}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Save user message to PostgreSQL
    user_msg = ChatMessage.objects.create(session=session, role="user", text=user_text)

    # 2. Update session title if first message
    if session.messages.count() == 1:
        session.title = user_text[:30] + ("..." if len(user_text) > 30 else "")
        session.save()

    # Build contents array for Gemini API from session history
    past_messages = session.messages.order_by('created_at')
    contents = []
    for msg in past_messages:
        contents.append({
            "role": msg.role,
            "parts": [{"text": msg.text}]
        })

    # 3. Call Gemini API from Django backend with multi-model fallback & smart recommendation engine
    model_reply_text = None

    for model_name in ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"]:
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
        try:
            res = requests.post(
                gemini_url,
                json={
                    "contents": contents,
                    "generationConfig": {
                        "temperature": 0.7,
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": 1024,
                    }
                },
                timeout=5
            )
            if res.status_code == 200:
                data = res.json()
                extracted = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
                if extracted:
                    model_reply_text = extracted
                    break
        except Exception as e:
            print(f"Gemini API ({model_name}) error:", str(e))

    if not model_reply_text:
        model_reply_text = generate_smart_game_reply(user_text)

    # 4. Save model response to PostgreSQL
    model_msg = ChatMessage.objects.create(session=session, role="model", text=model_reply_text)
    session.save()  # update updated_at

    return Response({
        "user_message": ChatMessageSerializer(user_msg).data,
        "model_message": ChatMessageSerializer(model_msg).data,
        "session": ChatSessionSerializer(session).data
    })

class WishlistItemViewSet(viewsets.ModelViewSet):
    queryset = WishlistItem.objects.all().order_by('-added_at')
    serializer_class = WishlistItemSerializer

    def create(self, request, *args, **kwargs):
        game_id = str(request.data.get("game_id", request.data.get("id")))
        title = request.data.get("title", "")
        image = request.data.get("image", request.data.get("background_image", ""))
        rating = float(request.data.get("rating", 0.0) or 0.0)

        item, created = WishlistItem.objects.get_or_create(
            game_id=game_id,
            defaults={"title": title, "image": image, "rating": rating}
        )
        if not created:
            return Response({"message": "Already in wishlist", "item": WishlistItemSerializer(item).data}, status=status.HTTP_200_OK)
        
        return Response(WishlistItemSerializer(item).data, status=status.HTTP_201_CREATED)

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all().order_by('-created_at')
    serializer_class = FeedbackSerializer

@api_view(['POST'])
def compare_games(request):
    game_names = request.data.get("games", [])
    if not game_names or len(game_names) < 2:
        return Response({"error": "Provide at least 2 game names to compare"}, status=status.HTTP_400_BAD_REQUEST)

    results = []
    for name in game_names[:2]:
        try:
            search_res = requests.get(f"https://api.rawg.io/api/games?key={RAWG_API_KEY}&search={requests.utils.quote(name)}&page_size=1", timeout=5)
            if search_res.status_code == 200:
                data = search_res.json()
                results_list = data.get("results", [])
                if results_list:
                    game_obj = results_list[0]
                    game_id = game_obj.get("id")
                    
                    det_res = requests.get(f"https://api.rawg.io/api/games/{game_id}?key={RAWG_API_KEY}", timeout=5)
                    if det_res.status_code == 200:
                        det = det_res.json()
                        results.append({
                            "id": game_id,
                            "title": det.get("name", name),
                            "name": det.get("name", name),
                            "image": det.get("background_image", ""),
                            "background_image": det.get("background_image", ""),
                            "rating": det.get("rating", 0.0),
                            "released": det.get("released", "N/A"),
                            "platforms": [p.get("platform", {}).get("name") for p in det.get("platforms", []) if p.get("platform")],
                            "description": det.get("description_raw") or det.get("description") or "No description available."
                        })
                        continue
            results.append({
                "id": name,
                "title": name.title(),
                "name": name.title(),
                "image": "https://via.placeholder.com/300?text=No+Image",
                "background_image": "https://via.placeholder.com/300?text=No+Image",
                "rating": 8.5,
                "released": "N/A",
                "platforms": ["PC", "PlayStation 5", "Xbox Series X"],
                "description": f"Details for {name} will be retrieved soon."
            })
        except Exception as e:
            print("Comparison error:", str(e))

    return Response(results)
