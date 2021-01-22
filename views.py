import sys
import json
import datetime
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.core import serializers
# from datetime import datetime, timedelta
from email.utils import parsedate_tz, mktime_tz


from .models import User
from .models import Post


def index(request):
     return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            # user.followers.set(list())
            # user.following.set(list())
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def new_post(request):
    # Composing a new email must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    # Get contents of post
    text = data.get("text", "")
    author = data.get("author", "")
    user = User.objects.get(username=author)
    np = Post(text=text, author=user)
    np.save()

    return JsonResponse({"message": "Post sent successfully."}, status=201)

@login_required
def all_posts(request, pageNumber):
    posts = Post.objects.order_by("timestamp").all().reverse()
    # if request.method == "GET":
    posts_serialized = [post.serialize() for post in posts]
    paginator = Paginator(posts_serialized, 10)
    currentPage = paginator.page(pageNumber).object_list
    hasNext = paginator.page(pageNumber).has_next()
    hasPrevious = paginator.page(pageNumber).has_previous()

    return JsonResponse(data={
        'page': currentPage,
        'next': hasNext,
        'prev': hasPrevious
        }, status=200)

@login_required
def user(request, username):
    try:
        currentUser = User.objects.get(username=username)
    except Email.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    return JsonResponse(currentUser.serialize())

@login_required
def profile(request, author, pageNumber):
    user = User.objects.get(username=author)
    posts = Post.objects.filter(author=user).all().order_by("timestamp").reverse()
    posts_serialized = [post.serialize() for post in posts]
    paginator = Paginator(posts_serialized, 10)
    currentPage = paginator.page(pageNumber).object_list
    hasNext = paginator.page(pageNumber).has_next()
    hasPrevious = paginator.page(pageNumber).has_previous()

    return JsonResponse(data={
        'page': currentPage,
        'next': hasNext,
        'prev': hasPrevious
        }, status=200)


@login_required
def following(request, currentUsername, pageNumber):
    user = User.objects.get(username=currentUsername)
    posts = Post.objects.order_by("timestamp").filter(author__in=user.following.all()).reverse()
    posts_serialized = [post.serialize() for post in posts]
    paginator = Paginator(posts_serialized, 10)
    currentPage = paginator.page(pageNumber).object_list
    hasNext = paginator.page(pageNumber).has_next()
    hasPrevious = paginator.page(pageNumber).has_previous()

    return JsonResponse(data={
        'page': currentPage,
        'next': hasNext,
        'prev': hasPrevious
        }, status=200)



# def check_follow(request):
#     data = json.loads(request.body)
#     if data.get("follower") is not None:
#         follower_username = data["follower"]
#         follower = User.objects.get(username=follower_username)
#     if data.get("following") is not None:
#         following_username = data["following"]
#         following = User.objects.get(username=following_username)

#     if (follower in following.followers):
#         message = "true"
#     else:
#         message = "false"

#     return JsonResponse({"message": message}, status=200)


@csrf_exempt
@login_required
def follow(request):
    data = json.loads(request.body)
    if data.get("follower") is not None:
        follower_username = data["follower"]
        follower = User.objects.get(username=follower_username)
    if data.get("following") is not None:
        following_username = data["following"]
        following = User.objects.get(username=following_username)
    follower.following.add(following)
    following.followers.add(follower)

    follower.save()
    following.save()
    return HttpResponse(status=204)    

@csrf_exempt
@login_required
def unfollow(request):
    data = json.loads(request.body)
    if data.get("follower") is not None:
        follower_username = data["follower"]
        follower = User.objects.get(username=follower_username)
    if data.get("following") is not None:
        following_username = data["following"]
        following = User.objects.get(username=following_username)

    follower.following.remove(following)
    following.followers.remove(follower)

    follower.save()
    following.save()

    return HttpResponse(status=204)   


@csrf_exempt
@login_required
def edit(request):
    data = json.loads(request.body)
    if data.get("author") is not None:
        author_username = data["author"]
        author = User.objects.get(username=author_username)

    if data.get("timestamp") is not None:
        timestamp = data["timestamp"]
        # print(timestamp)
            
    if data.get("old_text") is not None:
        old_text = data["old_text"]

    if data.get("new_text") is not None:
        new_text = data["new_text"]
    
    
    # timestamp = datetime.datetime.strptime(timestamp, "%b %d %Y, %I:%M %p")
    # ts = datetime.datetime.strftime(timestamp, "%b %d %Y, %I:%M %p")
    # print(ts)
    # YYYY-MM-DD HH:MM[:ss[.uuuuuu]][TZ] format.']
    # Dec 1 2020, 7:03 PM
    # .strftime("%b %-d %Y, %-I:%M %p")
    # ts = datetime.strptime(timestamp, "%b %d %Y, %I:%M %p")
    # print(ts)
    # 2020-12-04 01:04:00
    # dt = datetime.date(ts)
    # p1 = Post.objects.get(timestamp=datetime.datetime(2020, 12, 4, 1, 4, 24, 396503, tzinfo=<UTC>))            
    # print(new_text)

    posts = Post.objects.filter(author= author, text= old_text).all()
    

    for post in posts: 
        post_serialize = post.serialize()
        post_timestamp = post_serialize["timestamp"]
        print(post_timestamp)
        if timestamp == post_timestamp:
            p = post

    p.text = new_text
    # p.timestamp = datetime.datetime.now(datetime.timezone.utc) 
    post.save()

    return HttpResponse(status=200) 


@csrf_exempt
@login_required
def like(request):
    data = json.loads(request.body)
    if data.get("author") is not None:
        author_username = data["author"]
        author = User.objects.get(username=author_username)
    
    if data.get("timestamp") is not None:
        timestamp = data["timestamp"]
    
    if data.get("user") is not None:
        user_username = data["user"]
        user = User.objects.get(username=user_username)
    
    if data.get("text") is not None:
        text = data["text"]
    

    posts = Post.objects.filter(author= author, text= text).all()

    for post in posts: 
        post_serialize = post.serialize()
        post_timestamp = post_serialize["timestamp"]
        print(post_timestamp)
        if timestamp == post_timestamp:
            p = post

    p.likes.add(user)
    
    p.save()

    return HttpResponse(status=204) 


@csrf_exempt
@login_required
def unlike(request):
    data = json.loads(request.body)
    if data.get("author") is not None:
        author_username = data["author"]
        author = User.objects.get(username=author_username)
    
    if data.get("timestamp") is not None:
        timestamp = data["timestamp"]
    
    if data.get("user") is not None:
        user_username = data["user"]
        user = User.objects.get(username=user_username)

    if data.get("text") is not None:
        text = data["text"]
    

    posts = Post.objects.filter(author=author, text=text).all()

    for post in posts: 
        post_serialize = post.serialize()
        post_timestamp = post_serialize["timestamp"]
        post_text = post_serialize["text"]
        print(post_timestamp + ", " + post_text )
        if timestamp == post_timestamp:
            p = post


    # p = Post.objects.get(author=author, text=text)
    p.likes.remove(user)
    
    p.save()

    return HttpResponse(status=204) 




@csrf_exempt
@login_required
def likes_amount(request, author, timestamp, text):
    user = User.objects.get(username=author)
    
    posts = Post.objects.filter(author= user, text= text).all()

    for post in posts: 
        post_serialize = post.serialize()
        post_timestamp = post_serialize["timestamp"]
        print(post_timestamp)
        if timestamp == post_timestamp:
            p = post
    
    post_serialize = p.serialize()
    likes = post_serialize["likes"]

    return JsonResponse(data={
        'likes': likes,
        'likesAmount': len(likes),
        }, status=200)