var currentPage = 1;

document.addEventListener("DOMContentLoaded", function () {

    // document.querySelector('#post-form').addEventListener('submit', new_post);
    // document.querySelector("#follow-button").addEventListener("click", () => toggle_follow_button());
    // document.querySelector("#nav-all-posts").addEventListener("click", () => all_posts());
    // document.querySelector("#nav-brand").addEventListener("click", () => all_posts());
    
    let currentUsername = document.querySelector("#current-username").value;


    document
        .querySelector("#nav-profile")
        .addEventListener("click", () => profile(currentUsername, 1));
    
    document
        .querySelector("#nav-following")
        .addEventListener("click", () => following(1));
    

    all_posts(1);
    

});


function new_post() {
    document.querySelector("#new-post").style.display = "block";    
    document.querySelector('#new-post').innerHTML = "";


    let np_form = document.createElement("form");
    np_form.id = "post-form"
    np_form.innerHTML = 
        `
            <div class="form-group">
                <input autofocus class="form-control" id="post-text" type="text">
            </div>
                <input class="btn btn-primary" type="submit" value="Post">
        `;
        document.querySelector('#new-post').appendChild(np_form);

    document.querySelector("#post-form").addEventListener("submit", () => {
        submit_post();
    });

    // document.querySelector("#post-form").addEventListener("submit", submit_post);   
}

function submit_post() {
    let currentUsername = document.querySelector("#current-username").value;
    
    text = document.querySelector("#post-text");
    
    if (text.value == '') return;
    else {
        fetch("/new_post", {
            method: "POST",
            body: JSON.stringify({
                text: text.value,
                author: currentUsername,
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.status);
            if (data.error) {
                alert(data.error);
                return true;
            }
            text.value = '';
            // Return back to first page
            currentPage = 1;
            all_posts(currentPage);
        });
    }
}


function all_posts(pageNumber) {

    let currentUsername = document.querySelector("#current-username").value;

    if (pageNumber === 1) {
        currentPage = 1;
    }
    
    let page_title = document.createElement("div");
    page_title.innerHTML = `<h1>All Posts</h1>`;

    document.querySelector("#page-title").style.display = "block";
    document.querySelector("#page-title").innerHTML = "";
    document.querySelector("#page-title").appendChild(page_title);

    new_post();

    document.querySelector("#posts-view").style.display = "block";
    document.querySelector("#posts-view").innerHTML= "";
    
    document.querySelector("#page-nav").style.display = "block";
    document.querySelector("#page-nav").innerHTML= "";
    
    // return all posts for a single page
    fetch(`/all_posts/${pageNumber}`)
    .then(response => response.json())
    .then(data => { 
        let page = data.page;

        // loop through posts on a single page
        page.forEach(item => {
            // Create each element of the post displayed on a card
            let card_border = document.createElement("div");
            card_border.className = "card border-dark mb-3";

            let card = document.createElement("div");
            card.className = "card";
            
            let card_body = document.createElement("div");
            card_body.className = "card-body";
            card_body.id = "card_body";
            
            let card_title = document.createElement("h5");
            card_title.className = "card-title";
            card_title.innerHTML = item.author;
            card_title.addEventListener("click", () => {
                profile(item.author, 1);
            });

            let card_subtitle = document.createElement("h6");
            card_subtitle.className = "card-subtitle";
            card_subtitle.innerHTML = item.timestamp;

            let card_text = document.createElement("p");
            card_text.className = "card-text";
            card_text.innerHTML = item.text;

            card_body.appendChild(card_title);
            card_body.appendChild(card_subtitle);
            card_body.appendChild(card_text);
            
            card.appendChild(card_body);

            card_border.appendChild(card);
 
            // Add to view
            document.querySelector("#posts-view").appendChild(card_border);

            if (item.author === currentUsername) {
                let edit_button = document.createElement("button");
                // edit_button.className = "btn btn-secondary btn-sm";
                edit_button.innerHTML = "Edit";
                edit_button.style.cssText = "position: absolute;top:0;right:0;left:auto;";
                card.appendChild(edit_button);

                // Click edit button
                edit_button.addEventListener("click", () => {
                    card_body.removeChild(card_text);
                    // card_text.innerHTML = "";

                    let edit_form = document.createElement("form");
                    edit_form.id = "edit-form";

                    let edit_text = document.createElement("textarea");
                    edit_text.id = "edit-text";
                    edit_text.value = item.text;

                    let save_button = document.createElement("input");
                    save_button.className = "btn btn-primary"
                    save_button.type = "submit";
                    save_button.value = "Save";

                    edit_form.appendChild(edit_text);
                    edit_form.appendChild(save_button);
                    
                    card_body.appendChild(edit_form);
                    // card_body.appendChild(edit_form);
    
                    edit_form.addEventListener("submit", (event) => {
                        event.preventDefault();
                        new_text = edit_text.value;
                        edit(item.author, item.timestamp, item.text, new_text);


                        card_body.removeChild(edit_form);
                        item.text = new_text;
                        // edit_form.innerHTML = "";

                        // let new_card_text = document.createElement("p");
                        // new_card_text.className = "card-text";
                        // new_card_text.innerHTML = new_text;
                        card_text.innerHTML = new_text;
                        card_body.appendChild(card_text);

                    });
                });
            }    
            
            let like_div = document.createElement("div");
            let like_button = document.createElement("button");
            let like_count = document.createElement("h6");
            like_count.className = "like-count";

            like_button.className = "like-button";
            like_div.className = "like-div";

            like_button.style.cssText = "display: inline-block;";
            like_count.style.cssText = "width:10px;margin-left:5px;margin-right:10px;display: inline-block;";
            // like_div.style.cssText = "width:200px;";
            

            like_div.appendChild(like_count);
            like_div.appendChild(like_button);

            card_border.appendChild(like_div);
            

            var num_likes;
            var likes;
            
            fetch(`/likes_amount/${item.author}/${item.timestamp}/${item.text}`)
            .then(response => response.json())
            .then(result => {
                likes = result.likes;
            
                like_count.innerHTML = result.likesAmount;

                

                if (likes == undefined) {
                    like_button.innerHTML = "Like";
                } else {
                    if (likes.includes(currentUsername)) {
                        like_button.innerHTML = "Unlike";
                    } else {
                        like_button.innerHTML = "Like";
                    }
                }
        
            });

            
            
            like_button.addEventListener("click", () => {
                if (like_button.innerHTML == "Like") {
                    like(item.author, item.timestamp, currentUsername, item.text);
                    like_button.innerHTML = "Unlike";
                    fetch(`/likes_amount/${item.author}/${item.timestamp}/${item.text}`)
                    .then(response => response.json())
                    .then(result => {
                        likes = result.likes;
                        // num_likes = result.likesAmount;
                        // document.querySelector("#like_count").innerHTML = "";
                        like_count.innerHTML = result.likesAmount;
                    });
                }
                else {
                    unlike(item.author, item.timestamp, currentUsername, item.text);
                    like_button.innerHTML = "Like";
                    fetch(`/likes_amount/${item.author}/${item.timestamp}/${item.text}`)
                    .then(response => response.json())
                    .then(result => {
                        likes = result.likes;
                        // num_likes = result.likesAmount;
                        // document.querySelector("#like_count").innerHTML = "";
                        like_count.innerHTML = result.likesAmount;
                    });
                }

                fetch(`/likes_amount/${item.author}/${item.timestamp}/${item.text}`)
                .then(response => response.json())
                .then(result => {
                    likes = result.likes;
                    // num_likes = result.likesAmount;
                    // document.querySelector("#like_count").innerHTML = "";
                    like_count.innerHTML = result.likesAmount;
                });
                
            });

        });
            
        // Create next and previous page buttons
        if (data.prev == true) {
            let prev_button = document.createElement("button");
            prev_button.innerHTML = `<h6>Prev</h6>`;

            document.querySelector("#page-nav").appendChild(prev_button);
            prev_button.addEventListener("click", () => {
                currentPage = currentPage - 1;
                all_posts(currentPage);
            });
        }

        if (data.next == true) {
            let next_button = document.createElement("button");
            next_button.innerHTML = `<h6>Next</h6>`;

            document.querySelector("#page-nav").appendChild(next_button);
            next_button.addEventListener("click", () => {
                currentPage = currentPage + 1;
                all_posts(currentPage);
            });
        }

    });
}

function profile(profileUsername, pageNumber) {

    if (pageNumber === 1) {
        currentPage = 1;
    }

    let currentUsername = document.querySelector("#current-username").value;

    document.querySelector("#page-title").style.display = "block"; 
    document.querySelector("#new-post").style.display = "none";  
    document.querySelector("#posts-view").style.display = "block";
    
    document.querySelector("#page-title").innerHTML = "";
    document.querySelector("#posts-view").innerHTML = "";
    
    document.querySelector("#page-nav").style.display = "block";
    document.querySelector("#page-nav").innerHTML= "";

    let page_title = document.createElement("div");
    page_title.innerHTML = `<h1 style="text-align:center;"> ${profileUsername} </h1>`;
    document.querySelector("#page-title").appendChild(page_title);


    // Check if profile user is the same as the current user
    if (currentUsername !== profileUsername) {
        
        fetch(`/user/${currentUsername}`)
        .then((response) => response.json())
        .then((user) => {
            let follow_button = document.createElement("button");
            let currentFollowing = user.following;

            // Check if profile username is in current user following list
            if (currentFollowing.includes(profileUsername)) { 
                follow_button.innerHTML = `<h6>Unfollow</h6>`;
            } else {
                follow_button.innerHTML = `<h6>Follow</h6>`;
            }

            // Follow button
            follow_button.addEventListener("click", () => {
                if (follow_button.innerText == "Follow") {
                    follow(currentUsername, profileUsername);
                    follow_button.innerText = "Unfollow";
                }
                    
                else {
                    unfollow(currentUsername, profileUsername);
                    follow_button.innerText = "Follow";
                } 
            });
            document.querySelector("#page-title").appendChild(follow_button); 
        });
             
    }

    fetch(`/posts/${profileUsername}/${pageNumber}`)
    .then(response => response.json())
    .then(data => { 
        let page = data.page;
        page.forEach(item => {
            let card_border = document.createElement("div");
            card_border.className = "card border-dark mb-3";

            let card = document.createElement("div");
            card.className = "card";
            
            let card_body = document.createElement("div");
            card_body.className = "card-body";
            card_body.id = "card_body";
            
            let card_title = document.createElement("h5");
            card_title.className = "card-title";
            card_title.innerHTML = item.author;
            card_title.addEventListener("click", () => {
                profile(item.author, 1);
            });

            let card_subtitle = document.createElement("h6");
            card_subtitle.className = "card-subtitle";
            card_subtitle.innerHTML = item.timestamp;

            let card_text = document.createElement("p");
            card_text.className = "card-text";
            card_text.innerHTML = item.text;

            card_body.appendChild(card_title);
            card_body.appendChild(card_subtitle);
            card_body.appendChild(card_text);
            
            card.appendChild(card_body);

            card_border.appendChild(card);
 
            // Add to view
            document.querySelector("#posts-view").appendChild(card_border);

            if (item.author === currentUsername) {
                let edit_button = document.createElement("button");
                // edit_button.className = "btn btn-secondary btn-sm";
                edit_button.innerHTML = "Edit";
                edit_button.style.cssText = "position: absolute;top:0;right:0;left:auto;";
                card.appendChild(edit_button);

                // Click edit button
                edit_button.addEventListener("click", () => {
                    card_body.removeChild(card_text);
                    // card_text.innerHTML = "";

                    let edit_form = document.createElement("form");
                    edit_form.id = "edit-form";

                    let edit_text = document.createElement("textarea");
                    edit_text.id = "edit-text";
                    edit_text.value = item.text;

                    let save_button = document.createElement("input");
                    save_button.className = "btn btn-primary"
                    save_button.type = "submit";
                    save_button.value = "Save";

                    edit_form.appendChild(edit_text);
                    edit_form.appendChild(save_button);
                    
                    card_body.appendChild(edit_form);
                    // card_body.appendChild(edit_form);
    
                    edit_form.addEventListener("submit", (event) => {
                        event.preventDefault();
                        new_text = edit_text.value;
                        edit(item.author, item.timestamp, item.text, new_text);


                        card_body.removeChild(edit_form);
                        item.text = new_text;
                        // edit_form.innerHTML = "";

                        // let new_card_text = document.createElement("p");
                        // new_card_text.className = "card-text";
                        // new_card_text.innerHTML = new_text;
                        card_text.innerHTML = new_text;
                        card_body.appendChild(card_text);

                    });
                });
            }    
            
            let like_div = document.createElement("div");
            let like_button = document.createElement("button");
            let like_count = document.createElement("h6");
            like_count.className = "like-count";

            like_button.className = "like-button";
            like_div.className = "like-div";

            like_button.style.cssText = "display: inline-block;";
            like_count.style.cssText = "margin-left:5px;margin-right:10px;display: inline-block;";
            

            like_div.appendChild(like_count);
            like_div.appendChild(like_button);

            card_border.appendChild(like_div);
            

            var num_likes;
            var likes;
            
            fetch(`/likes_amount/${item.author}/${item.timestamp}/${item.text}`)
            .then(response => response.json())
            .then(result => {
                likes = result.likes;
            
                like_count.innerHTML = result.likesAmount;

                

                if (likes == undefined) {
                    like_button.innerHTML = "Like";
                } else {
                    if (likes.includes(currentUsername)) {
                        like_button.innerHTML = "Unlike";
                    } else {
                        like_button.innerHTML = "Like";
                    }
                }
        
            });

            
            
            like_button.addEventListener("click", () => {
                if (like_button.innerHTML == "Like") {
                    like(item.author, item.timestamp, currentUsername, item.text);
                    like_button.innerHTML = "Unlike";
                    fetch(`/likes_amount/${item.author}/${item.text}`)
                    .then(response => response.json())
                    .then(result => {
                        likes = result.likes;
                        // num_likes = result.likesAmount;
                        // document.querySelector("#like_count").innerHTML = "";
                        like_count.innerHTML = result.likesAmount;
                    });
                }
                else {
                    unlike(item.author, item.timestamp, currentUsername, item.text);
                    like_button.innerHTML = "Like";
                    fetch(`/likes_amount/${item.author}/${item.timestamp}/${item.text}`)
                    .then(response => response.json())
                    .then(result => {
                        likes = result.likes;
                        // num_likes = result.likesAmount;
                        // document.querySelector("#like_count").innerHTML = "";
                        like_count.innerHTML = result.likesAmount;
                    });
                }

                fetch(`/likes_amount/${item.author}/${item.timestamp}/${item.text}`)
                .then(response => response.json())
                .then(result => {
                    likes = result.likes;
                    // num_likes = result.likesAmount;
                    // document.querySelector("#like_count").innerHTML = "";
                    like_count.innerHTML = result.likesAmount;
                });
                
            });

            });
        
        // Create next and previous page buttons
        if (data.prev == true) {
            let prev_button = document.createElement("button");
            prev_button.innerHTML = `<h6>Prev</h6>`;

            document.querySelector("#page-nav").appendChild(prev_button);
            prev_button.addEventListener("click", () => {
                currentPage = currentPage - 1;
                profile(profileUsername, currentPage);
            });
        }

        if (data.next == true) {
            let next_button = document.createElement("button");
            next_button.innerHTML = `<h6>Next</h6>`;

            document.querySelector("#page-nav").appendChild(next_button);
            next_button.addEventListener("click", () => {
                currentPage = currentPage + 1;
                profile(profileUsername, currentPage);
            });
        }


            
        });

}

function following(pageNumber) {

    if (pageNumber === 1) {
        currentPage = 1;
    }

    let currentUsername = document.querySelector("#current-username").value;

    let page_title = document.createElement("div");
    page_title.innerHTML = `<h1>Following</h1>`;

    document.querySelector("#page-title").style.display = "block";
    document.querySelector("#page-title").innerHTML = "";
    document.querySelector("#page-title").appendChild(page_title);

    new_post();

    document.querySelector("#posts-view").style.display = "block";
    document.querySelector("#posts-view").innerHTML= "";

    document.querySelector("#page-nav").style.display = "block";
    document.querySelector("#page-nav").innerHTML= "";
    
    fetch(`/following/${currentUsername}/${pageNumber}`)
    .then(response => response.json())
    .then(data => { 
        let page = data.page;
        page.forEach(item => {
            let card_border = document.createElement("div");
            card_border.className = "card border-dark mb-3";

            let card = document.createElement("div");
            card.className = "card";
            
            let card_body = document.createElement("div");
            card_body.className = "card-body";
            card_body.id = "card_body";
            
            let card_title = document.createElement("h5");
            card_title.className = "card-title";
            card_title.innerHTML = item.author;
            card_title.addEventListener("click", () => {
                profile(item.author, 1);
            });

            let card_subtitle = document.createElement("h6");
            card_subtitle.className = "card-subtitle";
            card_subtitle.innerHTML = item.timestamp;

            let card_text = document.createElement("p");
            card_text.className = "card-text";
            card_text.innerHTML = item.text;

            card_body.appendChild(card_title);
            card_body.appendChild(card_subtitle);
            card_body.appendChild(card_text);
            
            card.appendChild(card_body);

            card_border.appendChild(card);
 
            // Add to view
            document.querySelector("#posts-view").appendChild(card_border);

            if (item.author === currentUsername) {
                let edit_button = document.createElement("button");
                // edit_button.className = "btn btn-secondary btn-sm";
                edit_button.innerHTML = "Edit";
                edit_button.style.cssText = "position: absolute;top:0;right:0;left:auto;";
                card.appendChild(edit_button);

                // Click edit button
                edit_button.addEventListener("click", () => {
                    card_body.removeChild(card_text);
                    // card_text.innerHTML = "";

                    let edit_form = document.createElement("form");
                    edit_form.id = "edit-form";

                    let edit_text = document.createElement("textarea");
                    edit_text.id = "edit-text";
                    edit_text.value = item.text;

                    let save_button = document.createElement("input");
                    save_button.className = "btn btn-primary"
                    save_button.type = "submit";
                    save_button.value = "Save";

                    edit_form.appendChild(edit_text);
                    edit_form.appendChild(save_button);
                    
                    card_body.appendChild(edit_form);
                    // card_body.appendChild(edit_form);
    
                    edit_form.addEventListener("submit", (event) => {
                        event.preventDefault();
                        new_text = edit_text.value;
                        edit(item.author, item.timestamp, item.text, new_text);


                        card_body.removeChild(edit_form);
                        item.text = new_text;
                        // edit_form.innerHTML = "";

                        // let new_card_text = document.createElement("p");
                        // new_card_text.className = "card-text";
                        // new_card_text.innerHTML = new_text;
                        card_text.innerHTML = new_text;
                        card_body.appendChild(card_text);

                    });
                });
            }    
            
            let like_div = document.createElement("div");
            let like_button = document.createElement("button");
            let like_count = document.createElement("h6");
            like_count.className = "like-count";

            like_button.className = "like-button";
            like_div.className = "like-div";

            like_button.style.cssText = "display: inline-block;";
            like_count.style.cssText = "margin-left:5px;margin-right:10px;display: inline-block;";
            

            like_div.appendChild(like_count);
            like_div.appendChild(like_button);

            card_border.appendChild(like_div);
            

            var num_likes;
            var likes;
            
            fetch(`/likes_amount/${item.author}/${item.timestamp}/${item.text}`)
            .then(response => response.json())
            .then(result => {
                likes = result.likes;
            
                like_count.innerHTML = result.likesAmount;

                

                if (likes == undefined) {
                    like_button.innerHTML = "Like";
                } else {
                    if (likes.includes(currentUsername)) {
                        like_button.innerHTML = "Unlike";
                    } else {
                        like_button.innerHTML = "Like";
                    }
                }
        
            });

            
            
            like_button.addEventListener("click", () => {
                if (like_button.innerHTML == "Like") {
                    like(item.author, item.timestamp, currentUsername, item.text);
                    like_button.innerHTML = "Unlike";
                    fetch(`/likes_amount/${item.author}/${item.timestamp}/${item.text}`)
                    .then(response => response.json())
                    .then(result => {
                        likes = result.likes;
                        // num_likes = result.likesAmount;
                        // document.querySelector("#like_count").innerHTML = "";
                        like_count.innerHTML = result.likesAmount;
                    });
                }
                else {
                    unlike(item.author, item.timestamp, currentUsername, item.text);
                    like_button.innerHTML = "Like";
                    fetch(`/likes_amount/${item.author}/${item.timestamp}/${item.text}`)
                    .then(response => response.json())
                    .then(result => {
                        likes = result.likes;
                        // num_likes = result.likesAmount;
                        // document.querySelector("#like_count").innerHTML = "";
                        like_count.innerHTML = result.likesAmount;
                    });
                }

                fetch(`/likes_amount/${item.author}/${item.timestamp}/${item.text}`)
                .then(response => response.json())
                .then(result => {
                    likes = result.likes;
                    // num_likes = result.likesAmount;
                    // document.querySelector("#like_count").innerHTML = "";
                    like_count.innerHTML = result.likesAmount;
                });
                
            });

            });
        
        // Create next and previous page buttons
        if (data.prev == true) {
            let prev_button = document.createElement("button");
            prev_button.innerHTML = `<h6>Prev</h6>`;

            document.querySelector("#page-nav").appendChild(prev_button);
            prev_button.addEventListener("click", () => {
                currentPage = currentPage - 1;
                following(currentPage);
            });
        }

        if (data.next == true) {
            let next_button = document.createElement("button");
            next_button.innerHTML = `<h6>Next</h6>`;

            document.querySelector("#page-nav").appendChild(next_button);
            next_button.addEventListener("click", () => {
                currentPage = currentPage + 1;
                following(currentPage);
            });
        }
   
        });

}

function follow(follower_username, following_username) {
    fetch(`/follow`, {
      method: "PUT",
      body: JSON.stringify({
        follower: follower_username,
        following: following_username, 
      }),
    });
  }

function unfollow(follower_username, following_username) {
    fetch(`/unfollow`, {
        method: "DELETE",
        body: JSON.stringify({
          follower: follower_username,
          following: following_username, 
        }),
      });
}

function edit(author, timestamp, old_text, new_text) {
    fetch(`/edit`, {
        method: "PUT",
        body: JSON.stringify({
          author: author,
          timestamp: timestamp,
          old_text: old_text,
          new_text: new_text, 
        }),
    });
}

function like(author, timestamp, user, text) {
    fetch(`/like`, {
        method: "PUT",
        body: JSON.stringify({
          author: author,
          timestamp: timestamp,
          user: user,
          text: text, 
          
        }),
    });
}

function unlike(author, timestamp, user, text) {
    fetch(`/unlike`, {
        method: "DELETE",
        body: JSON.stringify({
          author: author,
          timestamp: timestamp,
          user: user,
          text: text, 
        }),
    });
}



  


