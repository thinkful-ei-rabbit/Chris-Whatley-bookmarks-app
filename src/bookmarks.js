import $ from 'jquery';
import store from './store';
import api from './api';

const generateLayout= ()=> {
    return `
    <section class="container">
      <header>
      <h1>My Bookmarks</h1>
        <div class="button-align">
          <button class="new-bookmark-button">New Bookmark</button>
          <label>
          <select name="FilterBy" id='filter'>
            <option value="0">Filter by Rating</option>
            <option value="5">5-star</option>
            <option value="4">4-star</option>
            <option value="3">3-star</option>
            <option value="2">2-star</option>
            <option value="1">1-star</option>
          </select>
          </label>
        </div>
      </header>
    </section>
    <section class= 'error-container'></section>
    <section class="container-form">  
    </section>
    <section class="container">
        <ul class="bookmark-list">
        </ul>
    </section>
    `
}

function generateBookmarkElement(bookmark) {
    let rating = generateStarRating(bookmark.rating)
    if(bookmark.expanded ===true){
        return `
        <li class="bookmark" data-bookmark-id="${bookmark.id}">
        <div class="list-control"> 
            <div class="bookmark-title">${bookmark.title}</div><div class="bookmark-rating"> ${rating}</div>
        </div>
            <div class="expanded">
                <div>Description:</div>
                <p class="bookmark-description">${bookmark.desc}</p>
                <div class="button-align">
                    <a href="${bookmark.url}" target="_blank" class='button'>Visit Site</a><button class="delete">Delete</button>
                </div>
            </div>
        </li>`;
    } 
    else {
        return `
        <li class="bookmark" data-bookmark-id="${bookmark.id}">
            <div class="list-control"> 
                <div class="bookmark-title">${bookmark.title}</div><div class="bookmark-rating"> ${rating}</div>
            </div>
        </li>`;
    }
}

function generateNewBookmarkForm(){
    return `
        <form id="bookmark-form">
           <fieldset>
           <label class='bookmark-label'for="bookmark-url">New Bookmark URL
           <input type="text" class="new-bookmark" id='bookmark-url' placeholder="e.g.,- http://www.google.com" required></label><br>
           <label class='bookmark-label'for="bookmark-name">New Bookmark Name </label><br>
           <input type="text" class="new-bookmark" id= 'bookmark-name'placeholder="e.g.- ESPN, Google, or Facebook" required> 
            <fieldset class="star-cb-group">
            <legend>Rating</legend>
              <input type="radio" id="rating-1" name="rating" value="1" required/>
              <label for="rating-1">1</label>
              <input type="radio" id="rating-2" name="rating" value="2" />
              <label for="rating-2">2</label>
              <input type="radio" id="rating-3" name="rating" value="3" />
              <label for="rating-3">3</label>
              <input type="radio" id="rating-4" name="rating" value="4" />
              <label for="rating-4">4</label>
              <input type="radio" id="rating-5" name="rating" value="5" />
              <label for="rating-5">5</label>
            </fieldset><br>
          <label class='bookmark-label' for='bookmark-description'>Description
            <textarea name="new-bookmark-entry" id="bookmark-description" placeholder="Enter description of bookmark(optional)" cols="30" rows="10"></textarea>
          </label><br>
          </fieldset>
          <div class="button-align">
            <button class="new-bookmark-cancel" type="reset">Cancel</button><button type="submit">Add Bookmark</button>
          </div>
        </form>
    </div>
    `;
}

function generateBookmarksString(bookmarksList) {
    const bookmarks = bookmarksList.map((bookmark) => generateBookmarkElement(bookmark));
    return bookmarks.join('');
};

function generateStarRating(number){
    let stars = '';
    for(let i = 0; i < number; i++) {
      stars += '★';
    };
    return `<span class="icon colored-stars">${stars}</span>`;
  };

const generateError = function (message) {
    return `
        <section class="error-content">
            <button id="cancel-error">X</button>
            <p>${message}</p>
        </section>
      `;
};

function renderError() {
    if (store.error) {
        const el = generateError(store.error);
        $('.error-container').html(el);
    } else {
        $('.error-container').empty();
    }
};

function render() {
    renderError();
    console.log('Store at render:',store)
    $('main').html(generateLayout)
    $('.container-form,.bookmark-list').empty();
    if (store.adding){
        let form= generateNewBookmarkForm()
        $('.container-form').html(form)
    }
    else{
        let bookmarksList = [...store.bookmarks];
        if (store.filter>0){
            bookmarksList = bookmarksList.filter(bookmark => bookmark.rating >= store.filter)
        }
        // render the bookmark list in the DOM
        const bookmarksString = generateBookmarksString(bookmarksList);
        // insert that HTML into the DOM
        $('.bookmark-list').html(bookmarksString);
    }
    console.log('rendered')
};

function handleNewBookmarkClick() {
    $('main').on('click','.new-bookmark-button', () => {
        console.log('false?',store.adding)
        if (store.adding === false) {
            store.toggleNewBookmarkForm();
            console.log('true?',store.adding)
            render();
        } 
    })
}

function handleCancelNewBookmarkClick() {
    $('main').on('click','.new-bookmark-cancel',() =>{
        console.log('cancel clicked')
        store.toggleNewBookmarkForm();
        console.log('false?',store.adding)
        render();
    })
}

function handleNewBookmarkSubmit() {
    $('main').on('submit','#bookmark-form',(e)=> {
        e.preventDefault();
        const newBookmark = {
            title: $('#bookmark-name').val(),
            url: $('#bookmark-url').val(),
            desc: $('#bookmark-description').val(),
            rating: parseInt($('input[name="rating"]:checked').val())
        }
        
        console.log('new bookmark object:',newBookmark)
        api.createBookmark(newBookmark)
            .then((bookmark) => {
                console.log('adding equals true?', store.adding)
                store.addBookmark(bookmark);
                if(store.adding){
                    store.toggleNewBookmarkForm();    
                }
                console.log('adding equals false?', store.adding)
                render();
                $('#bookmark-form').trigger('reset')
            })
            .catch((error) => {
                store.setError(error.message);
                render();
            });
    });
};

function handleCloseError() {
    $('main').on('click', '#cancel-error', () => {
      store.setError(null);
      render();
    });
};

function getBookmarkIdFromElement(bookmark) {
    return $(bookmark).closest('.bookmark').data('bookmark-id');
};

function handleBookmarkListItemClicked(){
    $('main').on('click', '.list-control', e =>{
        let id = getBookmarkIdFromElement(e.currentTarget)
        let bookmark = store.findById(id)
        console.log('bookmark id:', id)
        console.log('adding equals false?', store.adding)
        console.log('before click',bookmark.expanded)
        store.findAndUpdate(id, {expanded: !bookmark.expanded})
        console.log('after click',bookmark.expanded)
        render();
    })
}

function handleDeleteBookmarkClicked(){
    $('main').on('click', '.delete', e => {
        const id = getBookmarkIdFromElement(e.currentTarget);
    
        api.deleteBookmark(id)
            .then(() => {
                store.findAndDelete(id);
                render();
            })
            .catch((error) => {
                console.log(error);
                store.setError(error.message);
                render();
            });
    });
}

function handleRatingFilterSelection(){
    $('main').on('change', '#filter',()=>{
        console.log('filter selected')
        console.log(parseInt($('option:selected').val()))
        store.filter = parseInt($('option:selected').val())
        console.log('new filter val:', store.filter)
        render();
    })
}

function bindEventListeners() {
    handleNewBookmarkSubmit();
    handleNewBookmarkClick();
    handleCancelNewBookmarkClick()
    handleCloseError()
    handleBookmarkListItemClicked();
    handleDeleteBookmarkClicked();
    handleRatingFilterSelection();
}

export default {
    render,
    bindEventListeners
};