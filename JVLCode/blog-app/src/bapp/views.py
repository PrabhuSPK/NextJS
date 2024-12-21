from rest_framework import generics
from .models import Post
from .serializers import PostSerializer
from rest_framework import permissions
from rest_framework.permissions import AllowAny


class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [AllowAny]
