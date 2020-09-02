let bookmarks = [];
let error = null; 
let adding = false;
let filter= 0;

const findById = function (id) {
    console.log('Store Bookmarks:',this.bookmarks)
    return this.bookmarks.find(currentBookmark => currentBookmark.id === id);
};
   
const addBookmark = function (bookmark) {
    Object.assign(bookmark, {expanded: false})
    this.bookmarks.push(bookmark);
    console.log('Store Bookmarks:',this.bookmarks)
};

const findAndDelete = function (id) {
    this.bookmarks = this.bookmarks.filter(currentBookmark => currentBookmark.id !== id);
    console.log('Store Bookmarks:',this.bookmarks)
};

const toggleNewBookmarkForm = function () {
    console.log('Store Bookmarks:',this.bookmarks)
    this.adding = !this.adding;
};

const findAndUpdate = function (id, newData) {
const currentBookmark = this.findById(id);
Object.assign(currentBookmark, newData);
console.log('Store Bookmarks:',this.bookmarks)
};

const setError = function (error) {
this.error = error;
};

export default {
bookmarks,
error,
adding,
filter,
toggleNewBookmarkForm,
findById,
addBookmark,
findAndDelete,
findAndUpdate,
setError
};