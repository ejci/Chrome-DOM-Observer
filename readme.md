DOM Observer - Chrome developer tools extension
=======

DOM Observer is a proof of concept extension. This extension should help to find out which DOM manipulation are causing "flickering" during page load. Flickering is usualy caused by style change between DOMContentLoaded and onLoad event.
Extension is recording all changes off DOM with MutationObserver on whole document.
 
##Instalation / Update Google Chrome (0.0.1.0)
* [Download extension](https://github.com/ejci/Chrome-DOM-Observer/raw/master/releases/dom_observer_0.0.1.0.crx.zip) (.zip)
* Unzip downloaded file (.crx)
* Type chrome://extensions in your Google Chrome browser
* Drag and drop unziped (.crx) file to Google Chrome extensions tab

##Screenshots
![Image](https://github.com/ejci/Chrome-DOM-Observer/raw/master/resources/screenshot_1.png)	

![Image](https://github.com/ejci/Chrome-DOM-Observer/raw/master/resources/screenshot_2.png)	

![Image](https://github.com/ejci/Chrome-DOM-Observer/raw/master/resources/screenshot_3.png)	

![Image](https://github.com/ejci/Chrome-DOM-Observer/raw/master/resources/screenshot_4.png)	


#####Todo
* fix performance issues
* refactor code
* ng-repeat fix 
* charts