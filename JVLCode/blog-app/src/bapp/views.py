from rest_framework import generics
from rest_framework import permissions
from rest_framework.permissions import AllowAny
from rest_framework import viewsets

from .models import Post
from .serializers import PostSerializer

class PostModelViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [AllowAny]
