from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatSessionViewSet, send_chat_message, WishlistItemViewSet, FeedbackViewSet, compare_games

router = DefaultRouter()
router.register(r'chats', ChatSessionViewSet, basename='chats')
router.register(r'wishlist', WishlistItemViewSet, basename='wishlist')
router.register(r'feedback', FeedbackViewSet, basename='feedback')

urlpatterns = [
    path('', include(router.urls)),
    path('chats/<int:pk>/message/', send_chat_message, name='send_chat_message'),
    path('compare/', compare_games, name='compare_games'),
]
