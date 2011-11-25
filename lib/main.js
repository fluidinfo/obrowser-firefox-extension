const contextMenu = require("context-menu");
const selection = require("selection");
const tabs = require("tabs");

const baseURL = "http://fluidinfo.com/about/";
const defaultAbout = "fluidinfo";


function openNewTab(about, tab) {
    /*
     * Create a new tab with the object browser looking at the given about value.
     */
    tabs.open(makeURL(about === undefined ? defaultAbout : about, tab));
}

function makeURL(about, tab) {
    /*
     * Generate an object browser URL given an about value and an tab
     * object containing information about the current tab.
     */
    var fragment = referrerFragment(tab);
    if (fragment === undefined) {
        return baseURL + encodeURIComponent(about);
    } else {
        return baseURL + encodeURIComponent(about) + '?' + fragment;
    }
}

function referrerFragment(tab) {
    /*
     * A utility function to produce a url=xxx referring page URL fragment for
     * a request to the object browser.
     */
    return tab.url ? 'url=' + encodeURIComponent(tab.url) : undefined;
}

exports.main = function(options, callbacks) {
    console.log(options.loadReason);

    // Selection Context
    contextMenu.Item({
        label: "Search Fluidinfo",
        // Show this item when a selection exists.
        context: contextMenu.SelectionContext(),
        // When this item is clicked, post a message to the item with the
        // selected text and current URL.
        contentScript: 'self.on("context", function () {' +
                       '  var text = window.getSelection().toString();' +
                       '  return "Search Fluidinfo for " + text;' +
                       '});' +
                       'self.on("click", function () {' +
                       '  var text = window.getSelection().toString();' +
                       '  self.postMessage(text);' +
                       '});',
        // When we receive the message, we open a new tab pointing to the
        // Object Browser
        onMessage: function(about) {
            openNewTab(about, tabs.activeTab);
        }
    });

    // Page Context
    contextMenu.Item({
        label: "Search Fluidinfo for this page",
        // Show this item when a selection exists.
        context: contextMenu.PageContext(),
        // When this item is clicked, post a message to the item with the
        // selected text and current URL.
        contentScript: 'self.on("click", function () {' +
                       '  self.postMessage(null);' +
                       '});',
        // When we receive the message, we open a new tab pointing to the
        // Object Browser
        onMessage: function() {
            openNewTab(tabs.activeTab.url, tabs.activeTab);
        }
    });

    // Image Context
    contextMenu.Item({
        label: "Search Fluidinfo for this image",
        // Show this item when a selection exists.
        context: contextMenu.SelectorContext('img'),
        // When this item is clicked, post a message to the item with the
        // selected text and current URL.
        contentScript: 'self.on("click", function (node) {' +
                       '  self.postMessage(node.src);' +
                       '});',
        // When we receive the message, we open a new tab pointing to the
        // Object Browser
        onMessage: function(about) {
            openNewTab(about, tabs.activeTab);
        }
    });

    // Link Context
    contextMenu.Item({
        label: "Search Fluidinfo for this link",
        // Show this item when a selection exists.
        context: contextMenu.SelectorContext('a[href]'),
        // When this item is clicked, post a message to the item with the
        // selected text and current URL.
        contentScript: 'self.on("click", function (node) {' +
                       '  self.postMessage(node.href);' +
                       '});',
        // When we receive the message, we open a new tab pointing to the
        // Object Browser
        onMessage: function(about) {
            openNewTab(about, tabs.activeTab);
        }
    });

};

exports.onUnload = function(reason) {
    console.log(reason);
};