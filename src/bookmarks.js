import $ from 'jquery';
import store from './store';
import api from './api';

function generateBookmarkElement(bookmark) {
    if(bookmark.expanded ===true){
        return `
        <li class="bookmark" data-bookmark-id="${bookmark.id}">
            <div class="bookmark-title">${bookmark.title}</div><div class="bookmark-rating"> ${bookmark.rating}</div>
            <div class="expanded">
            <button class="delete">Delete Bookmark</button>
            <p class="bookmark-description">${bookmark.desc}</p>
            <a href="${bookmark.url}"><button class="visit site"> Visit Site</button></a>
            </div>
        </li>`;
    } else {
        return `
        <li class="bookmark" data-bookmark-id="${bookmark.id}">
            <div class="bookmark-title">${bookmark.title}</div><div class="bookmark-rating"> ${bookmark.rating}</div>
            <div class="expanded hidden">
            <button class="delete">Delete Bookmark</button>
            <p class="bookmark-description">${bookmark.desc}</p>
            <a href="${bookmark.url}"><button class="visit site"> Visit Site</button></a>
            </div>
        </li>`;
    }
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
    // Reveals input form if store.adding === true
    let bookmarksList = [...store.bookmarks];
    if (store.filter>0){
        bookmarksList = bookmarksList.filter(bookmark => bookmark.rating >= store.filter)
    }
    if (store.adding) {
        console.log('adding equals true?', store.adding)
        // $('.bookmark-list, #bookmark-form').toggleClass('hidden')
        // $('#bookmark-form').toggleClass('hidden')
    } 
    else {
        // render the bookmark list in the DOM
        console.log('adding equals false?', store.adding)
        const bookmarksString = generateBookmarksString(bookmarksList);
        // $('.bookmark-list, #bookmark-form').toggleClass('hidden')
        // $('.bookmark-list').toggleClass('hidden')
        
        // insert that HTML into the DOM
        $('.bookmark-list').html(bookmarksString);
    }
    // $('.bookmark-list, #bookmark-form').toggleClass('hidden')
    console.log('rendered')
};

function handleNewBookmarkClick() {
    $('.new-bookmark-button').click(() => {
        console.log(store.adding)
        if (store.adding === false) {
            store.toggleNewBookmarkForm();
            console.log(store.adding)
            render();
            $('.bookmark-list, #bookmark-form').toggleClass('hidden')
        } else{
            alert('Only one bookmark can be added at a time.')
        }
    })
}

function handleCancelNewBookmarkClick() {
    $('.new-bookmark-cancel').click(() =>{
        console.log('cancel clicked')
        store.toggleNewBookmarkForm();
        console.log(store.adding)
        $('.bookmark-list, #bookmark-form').toggleClass('hidden')
        render();
    })
}

function handleNewBookmarkSubmit() {
    $('#bookmark-form').submit((e)=> {
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
                $('.bookmark-list, #bookmark-form').toggleClass('hidden')
                render();
                $('#bookmark-form').trigger('reset')
            })
            .catch((error) => {
                store.setError(error.message);
                renderError();
            });
    });
};

function handleCloseError() {
    $('.error-container').on('click', '#cancel-error', () => {
      store.setError(null);
      renderError();
    });
};

function getBookmarkIdFromElement(bookmark) {
    return $(bookmark).closest('.bookmark').data('bookmark-id');
};

function handleBookmarkListItemClicked(){
    $('.bookmark-list').on('click', '.bookmark', e =>{
        e.preventDefault()
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
                renderError();
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