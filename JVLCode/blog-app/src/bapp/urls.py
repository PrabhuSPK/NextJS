from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from .views import PostSearchView

# Create a router and register the PostViewSet
router = DefaultRouter()
router.register(r'posts', PostModelViewSet, basename='post')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', PostSearchView.as_view(), name='post-search'),
]
