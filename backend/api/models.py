from django.db import models

class ChatSession(models.Model):
    title = models.CharField(max_length=255, default="New Chat")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Chat #{self.id} - {self.title}"

class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, related_name="messages", on_delete=models.CASCADE)
    role = models.CharField(max_length=20)  # 'user' or 'model'
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.role}] {self.text[:30]}"

class WishlistItem(models.Model):
    game_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    image = models.TextField(blank=True, default="")
    rating = models.FloatField(default=0.0)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wishlist: {self.title}"

class Feedback(models.Model):
    rating = models.IntegerField()
    comment = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback ({self.rating} stars) - {self.created_at}"
