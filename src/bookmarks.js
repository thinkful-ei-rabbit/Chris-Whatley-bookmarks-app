import $ from 'jquery';
import store from './store';
import api from './api';

function generateBookmarkElement(bookmark) {
    if(bookmark.expanded ===true){
        return `
        <li class="bookmark" data-bookmark-id="${bookmark.id}">
        <div class="list-control"> 
            <div class="bookmark-title">${bookmark.title}</div><div class="bookmark-rating"> ${bookmark.rating}</div>
        </div>
            <div class="expanded">
                <p class="bookmark-description">${bookmark.desc}</p>
                <div class="list-control">
                    <a href="${bookmark.url}" target="_blank" class='button'>Visit Site</a><button class="delete">Delete</button>
                </div>
            </div>
        </li>`;
    } 
    else {
        return `
        <li class="bookmark" data-bookmark-id="${bookmark.id}">
            <div class="list-control"> 
                <div class="bookmark-title">${bookmark.title}</div><div class="bookmark-rating"> ${bookmark.rating}</div>
            </div>
        </li>`;
    }
}

function generateNewBookmarkForm(){
    return `
        <form id="bookmark-form">
           <div class="error-container"></div>
           <label for="new-bookmark-entry">Add New Bookmark</label><br>
           <input type="text" class="new-bookmark" id= 'bookmark-url'placeholder="Enter bookmark URL" required><br>
           <input type="text" class="new-bookmark" id= 'bookmark-name'placeholder="Enter bookmark Name" required> 
           <fieldset required>
            <span class="star-cb-group">
              <input type="radio" id="rating-5" name="rating" value="5" />
              <label for="rating-5">5</label>
              <input type="radio" id="rating-4" name="rating" value="4" />
              <label for="rating-4">4</label>
              <input type="radio" id="rating-3" name="rating" value="3" />
              <label for="rating-3">3</label>
              <input type="radio" id="rating-2" name="rating" value="2" />
              <label for="rating-2">2</label>
              <input type="radio" id="rating-1" name="rating" value="1" />
              <label for="rating-1">1</label>
              <input type="radio" id="rating-0" name="rating" value="0" class="star-cb-clear" />
              <label for="rating-0">0</label>
            </span>
          </fieldset>
          <textarea name="new-bookmark-entry" id="bookmark-description" placeholder="Enter description of bookmark(optional)" cols="30" rows="10"></textarea><br>
          <div class="list-control">
            <button class="new-bookmark-cancel" type="reset">Cancel</button><button type="submit">Create Bookmark</button>
          </div>
        </form>
    </div>
    `;
}

function generateBookmarksString(bookmarksList) {
    const bookmarks = bookmarksList.map((bookmark) => generateBookmarkElement(bookmark));
    return bookmarks.join('');
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
    
    if (store.adding){
        $('.container-form,.bookmark-list').empty();
        let form= generateNewBookmarkForm()
        $('.container-form').html(form)
    }
    else{
        let bookmarksList = [...store.bookmarks];
        if (store.filter>0){
            bookmarksList = bookmarksList.filter(bookmark => bookmark.rating >= store.filter)
        }
        $('.container-form,.bookmark-list').empty();
        // render the bookmark list in the DOM
        const bookmarksString = generateBookmarksString(bookmarksList);

        // insert that HTML into the DOM
        $('.bookmark-list').html(bookmarksString);
    }
    console.log('rendered')
};

function handleNewBookmarkClick() {
    $('.new-bookmark-button').click(() => {
        console.log('false?',store.adding)
        if (store.adding === false) {
            store.toggleNewBookmarkForm();
            console.log('true?',store.adding)
            render();
        } else{
            alert('Only one bookmark can be added at a time.')
        }
    })
}

function handleCancelNewBookmarkClick() {
    $('.container-form').on('click','.new-bookmark-cancel',() =>{
        console.log('cancel clicked')
        store.toggleNewBookmarkForm();
        console.log('false?',store.adding)
        render();
    })
}

function handleNewBookmarkSubmit() {
    $('.container-form').on('submit','#bookmark-form',(e)=> {
        e.preventDefault();
        console.log('form submitted')
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
    $('.error-container').on('click', '#cancel-error', () => {
      store.setError(null);
      render();
    });
};

function getBookmarkIdFromElement(bookmark) {
    return $(bookmark).closest('.bookmark').data('bookmark-id');
};

function handleBookmarkListItemClicked(){
    $('.bookmark-list').on('click', '.bookmark', e =>{
        //e.preventDefault()
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
    $('.bookmark-list').on('click', '.delete', e => {
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
    $('#filter').on('change', ()=>{
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
    // handleEditBookmarkSubmit();
}

export default {
    render,
    bindEventListeners
};