from django.contrib.auth.models import AbstractUser
from django.db import models



class User(AbstractUser):
    username = models.CharField(max_length=90, unique=True, blank=False)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=20, blank=False)
    followers = models.ManyToManyField("User", related_name="user_followers", blank= True)
    following = models.ManyToManyField("User", related_name="user_following", blank= True)

    def serialize(self):
        return {
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "followers": [user.username for user in self.followers.all()],
            "following": [user.username for user in self.following.all()],
        }

    

class Post(models.Model):
    text = models.CharField(max_length=300, blank=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="author")
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField("User", related_name="likes", blank= True)

    def serialize(self):
        return {
            "text": self.text,
            "author": self.author.username,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes" : [user.username for user in self.likes.all()],
        }