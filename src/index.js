import $ from 'jquery';

// import 'normalize.css';
import './index.css';

import api from './api';
import store from './store'
import bookmarkList from './bookmarks'

function main(){
    //render header here
    console.log('program compiled')
    api.getBookmarks()
        .then((bookmarks) => {
        bookmarks.forEach((bookmark) => store.addBookmark(bookmark));
        bookmarkList.render();
        console.log(bookmarks)
        console.log('Store at load', store)
        });
    bookmarkList.bindEventListeners();
}

$(main)