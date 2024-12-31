from django.db.models import Q

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

class PostSearchView(generics.ListAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        queryset = Post.objects.all()
        query = self.request.query_params.get('q', None)
        if query:
            queryset = queryset.filter(Q(title__icontains=query) | Q(description__icontains=query) | Q(id__icontains=query))
        return queryset
    