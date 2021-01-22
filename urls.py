
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    # API Routes
    path("new_post", views.new_post, name="new_post"),
    path("all_posts/<int:pageNumber>", views.all_posts, name="all_posts"),
    path("user/<str:username>", views.user, name="user"),
    path("posts/<str:author>/<int:pageNumber>", views.profile, name="profile"),
    path("following/<str:currentUsername>/<int:pageNumber>", views.following, name="following"),
    path("follow", views.follow, name="follow"),
    path("unfollow", views.unfollow, name="unfollow"),
    path("edit", views.edit, name="edit"),
    path("like", views.like, name="like"),
    path("unlike", views.unlike, name="unlike"),
    path("likes_amount/<str:author>/<str:timestamp>/<str:text>", views.likes_amount, name="likes_amount"),
    
]
