/* Replaces recognized images of Trump with Bo Obama 
 *
 * Help from: https://blog.lateral.io/2016/04/create-chrome-extension-modify-websites-html-css/ 
 *
 * TODO:
 *   - deal with <picture> tag?
 *   - keyboard shortcut to replace images
 *   - check text enclosed by links <a> example trump .... </a>?
 *   - deal with links that have direct parents or children with background images (a)
 *   - WMW posters as replacement images?
 *   - change pause/resume to be by site/domain not page url
 *   - hash blocked pages
 * 
 * KNOWN "BUGS":
 *   - can't handle images inserted by scripts e.g. twitter avatar
 *   - fix problems like this page - http://www.npr.org/2016/12/28/507305600/trump-speaks-briefly-to-reporters-reversing-obama-criticism-and-touting-new-jobs
 *     (trump doesn't appear in src or alt, no surrounding link -- maybe look for closest <p></p>?)
 *   - (a) link w/in div that has a background image doesn't work for context menu replace
 *   - context replace doesn't seem to work for page that's been idle for awhile (replacement happens in src but isn't reflected in display)
 */

/* Globals: */

// image type enum
var imageTypes = {
  "BO": 0,
  "FLAG": 1,
  "TROMPET": 2,
};

// list of all images to choose from for each type
var boList = ["Bo_1", "Bo_2", "Bo_3", "Bo_4", "Bo_5", "Bo_6", "Bo_7", "Bo_8"];
var trompetList = ["trompet_1", "trompet_2", "trompet_3", "trompet_4", "trompet_5", "trompet_6", "trompet_7", "trompet_8", "trompet_9", "trompet_10"];
var flagList = ["flag_01", "flag_02", "flag_03", "flag_04", "flag_05", "flag_05", "flag_06", "flag_07", "flag_08", "flag_09", "flag_10", "flag_11"];

// list of aspect ratios used
var ratioList = [{dimensions: "9x16", val: 0.5625}, {dimensions: "4x6", val: 0.666}, {dimensions: "8x10", val: 0.8}, {dimensions: "1x1", val: 1.0}, {dimensions: "5x4", val: 1.25}, {dimensions: "4x3", val: 1.33}, {dimensions: "3x2", val: 1.5}, {dimensions: "5x3", val: 1.67}, {dimensions: "16x9", val: 1.78}];

// which photos to use
var imageTypesList = [{folder: "bo_images", imgList: boList}, {folder: "flag_images", imgList: flagList}, {folder: "trompet_images", imgList: trompetList}];
var selected = "BO";

//blocking status;
var paused;

chrome.storage.sync.get("imgType", function (type) {
  console.log(type.imgType);
  selected = type.imgType;
  console.log(type);
  folder = imageTypesList[imageTypes[selected]].folder;
  imgList = imageTypesList[imageTypes[selected]].imgList;
  // check for blocking
  // get window url
  var url = window.location.href;
  // get blocking status from storage
  chrome.storage.sync.get("blocking", function (item) {
    var blockList = item.blocking;
    console.log(Object.keys(blockList));
    // if url in list of pages with blocking paused
    console.log("url: "+url);
    if (url in blockList)
    {
      paused = true;
    }
    else
    {
      paused = false;
      findTrumps();
      console.log("paused: "+paused);
    }
  });
});

var folder = imageTypesList[imageTypes[selected]].folder;
var imgList = imageTypesList[imageTypes[selected]].imgList;

/* add JQuery to document -- code from stackoverflow*/
function addJQ()
{
  var script = document.createElement('script');
  script.src = 'http://code.jquery.com/jquery-1.11.0.min.js';
  script.type = 'text/javascript';
  document.getElementsByTagName('head')[0].appendChild(script);
}

/* enacts response when a page's blocking status has been changed */
function blockingChanged(url, blocking)
{
  // TODO refresh page
}

/* returns true if the src of image matches a regex for trump */
function checkSRC(image)
{
  var trumpRegex = new RegExp("(trump)");
  var lower = image.src.toLowerCase();
  return lower.match(trumpRegex);
}

function checkALT(image)
{
  var trumpRegex = new RegExp("(trump)");
  var lower = image.alt.toLowerCase();
  return lower.match(trumpRegex);
}

/* checks enclosing link for trump */
function checkLink(image)
{
  // add jquery 
  addJQ();

  // check link href
  var href = $(image).closest('a').attr('href');
  if (!href)
  {
    return false;
  }
  var trumpRegex = new RegExp("(trump)");
  var lower = href.toLowerCase();
  var inHref = lower.match(trumpRegex);
  return inHref;
}

/* checks html inside closest figcaption tag for trump, returns true if trumpy caption, false otherwise*/
function checkFigCap(image)
{
  addJQ();

  // get text of closest figcaption
  var parent = $(image).closest('figure');
  var cap = parent.find('figcaption');
  var inner = cap.text();
  if (!inner)
  {
    return false;
  }
  // check trumpiness
  var trumpRegex = new RegExp("(trump)");
  var lower = inner.toLowerCase();
  var inFigCap = lower.match(trumpRegex);
  return inFigCap;
}

/* checks attributes of given html tag for background-image, if exists checks for trump and replaces if trumpy
 * code help from http://stackoverflow.com/questions/4952337/quickly-select-all-elements-with-css-background-image */
function checkTagBackgrounds(tag)
{
  addJQ();

  var toUpdate = [];
  // get new url
  var chosenBo = imgList[Math.floor(Math.random() * imgList.length)];

  var aspect = parseInt($(tag).css('width'), 10)/parseInt($(tag).css('height'), 10);
  var ratio = getClosestRatio(aspect, 0, ratioList.length - 1);

  var newrl = chrome.extension.getURL("/images/" + folder + "/" + chosenBo + "/" + ratio + ".jpg");
  if (tag == 'div')
  {
    newrl = 'url("' + newrl + '"';
  }

  // reset links with background images
  $(tag).filter(function() {
    // check if background is set
    if ($(this).css('background-image') === '' || $(this).css('background-image') == "none")
    {
      return false;
    }
    else
    {
      // check for trumpishness
      var backImg = $(this).css('background-image');
      var oldrl = backImg;
      var trumpRegex = new RegExp("(trump)");
      var lower = backImg.toLowerCase();
      if (lower.match(trumpRegex)) {console.log(backImg);}
      if (tag == 'a' || lower.match(trumpRegex))
      {
        var matched = lower.match(trumpRegex);
        if (matched)
        {
          // save old source
          if ($(this).attr("old-source") == "none" || !$(this).attr("old-source"))
          {
            $(this).attr("old-source", backImg);
          }
        }
        // set url if trumpy
        return matched;
      }
      // check closest link for divs with background images that aren't trumpy
      else
      {
        // check closest link
        var link = checkLink($(this));
        if (link)
        {
          if ($(this).attr("old-source") == "none" || !$(this).attr("old-source"))
          {
            $(this).attr("old-source", backImg);
          }
        }
        // set url if nearest link is trumpy
        return link;
      }
    }
  }).css('background-image', newrl);
}

/* returns closest aspect ratio from global ratioList to aspect */
function getClosestRatio(aspect, start, end)
{
  var epsilon = 0.01;

  // no good enough match found
  if (start > end)
  {
    if (end >= 0 && end <= (ratioList.length - 1))
    {
      return ratioList[end].dimensions;
    }
    else
    {
      return ratioList[start].dimensions;
    }
  }
  var middle = Math.floor((start + end)/2);
  var val = ratioList[middle].val;
  // found close enough match
  if (Math.abs(val - aspect) < epsilon)
  {
    return ratioList[middle].dimensions;
  }
  else if (aspect > val)
  {
    return getClosestRatio(aspect, middle + 1, end);
  }
  else
  {
    return getClosestRatio(aspect, start, middle - 1);
  }
}

/* checks attributes of given image, attributes that contain 'src' in key name have values replaced with url newrl */
function findReplaceSRC(image)
{
  
  var oldrl = image.src;
  var oldWidth = image.width;
  var oldHeight = image.height;
  // get aspect ratio
  var aspect = oldWidth/oldHeight;

  var ratio = getClosestRatio(aspect, 0, ratioList.length - 1);

  // get replacement url
  var chosenBo = imgList[Math.floor(Math.random() * imgList.length)];
  var newrl = chrome.extension.getURL("/images/" + folder + "/" + chosenBo + "/" + ratio + ".jpg");

  if (image.width === 0 && image.height === 0)
  {
    console.log("no h/w");
    return;
  }

  // check all attributes
  // code adapted from http://stackoverflow.com/questions/2048720/get-all-attributes-from-a-html-element-with-javascript-jquery
  for (var att, i = 0, atts = image.attributes, n = atts.length; i < n; i++){
      att = atts[i];

      //console.log(att.nodeName + ": " + att.nodeValue);
      // check if attribute contains 'src'
      var srcRegex = new RegExp("(src)");
      var lower = att.nodeName.toLowerCase();
      if (lower.match(srcRegex))
      {
        // if attribute contains "hi", use for old-source
        var hiRegex = new RegExp("(hi)");
        if (lower.match(hiRegex) && (image.getAttribute("old-source") == "none" || !image.getAttribute("old-source")))
        {
          image.setAttribute("old-source", att.nodeValue);
        }
        // if attribute includes src, replace value with newrl
        image.setAttribute(att.nodeName, newrl);
      }
  }

  
  // limit size
  image.setAttribute('maxwidth', oldWidth);
  image.setAttribute('width', oldWidth);
  image.setAttribute('maxheight', oldHeight);
  image.setAttribute('height', oldHeight);

  // store old src
  if (image.getAttribute("old-source") == "none" || !image.getAttribute("old-source"))
  {
    image.setAttribute("old-source", oldrl);
  }
}

/* finds images of Trumps by checking src, alt, surrounding links, ... TODO */
function findTrumps()
{
  var images = document.getElementsByTagName('img');
  console.log("trumping");
  for (var i = 0, l = images.length; i < l; i++)
  {
    var found = false;

    // TODO check enclosing div caption?

    // check alt text
    var inAlt = checkALT(images[i]);

    // check for Trump in src
    var inSRC = checkSRC(images[i]);

    // TODO check data-mediaviewer-caption?

    // TODO deal with data-original?

    if (inSRC || inAlt)
    {
      found = true;
      findReplaceSRC(images[i]);
    }
    // check enclosing link (<a></a>)
    if (!found)
    {
      var inLink = checkLink(images[i]);
      if (inLink)
      {
        //replace(images[i]);
        findReplaceSRC(images[i]);
        found = true;
      }
    }
    // check figure caption tag
    if (!found)
    {
      var inFigCap = checkFigCap(images[i]);
      if (inFigCap)
      {
        console.log("down below");
        findReplaceSRC(images[i]);
        found = true;
      }
    }
  }
  // deal with links with background images
  checkTagBackgrounds('a');

  // deal with divs with background images
  checkTagBackgrounds('div');
}

/* replaces image with and image of Bo Obama -- not used */
function replace(image)
{
  // choose random Bo
  var chosenBo = imgList[Math.floor(Math.random() * imgList.length)];
  var newrl = chrome.extension.getURL("/images/" + folder + "/" + chosenBo + ".jpg");
  // switch img src to be of Bo (should works b/c http://stackoverflow.com/questions/518000/is-javascript-a-pass-by-reference-or-pass-by-value-language)
  //image.src = "chrome-extension://__MSG_@@extension_id__/images/" + chosenBo + ".jpg";
  image.src = newrl;

  // srcset: http://i1.wp.com/cornellsun.com/wp-content/uploads/2016/11/Pg-10-Bruce-Monger-by-David-Navadeh-File-Photo.jpg?w=1000 1000w, http://i1.wp.com/cornellsun.com/wp-content/uploads/2016/11/Pg-10-Bruce-Monger-by-David-Navadeh-File-Photo.jpg?resize=336%2C240 336w, http://i1.wp.com/cornellsun.com/wp-content/uploads/2016/11/Pg-10-Bruce-Monger-by-David-Navadeh-File-Photo.jpg?resize=768%2C548 768w, http://i1.wp.com/cornellsun.com/wp-content/uploads/2016/11/Pg-10-Bruce-Monger-by-David-Navadeh-File-Photo.jpg?resize=771%2C550 771w

  // deal with srcset
  // url regex (from : http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url)
  var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var urlRegex = new RegExp(expression);
  image.srcset = image.srcset.replace(urlRegex, newrl);

  // Code to find tag attributes containing src
  /*for(var key in image)
  {
    var srcRegex = new RegExp("(src)");
    if (image[key] && key.match(srcRegex))
    {
      console.log(key);
    }
  }*/

  // limit size
  image.setAttribute('maxwidth', oldWidth);
  image.setAttribute('width', oldWidth);
  image.setAttribute('maxheight', oldHeight);
  image.setAttribute('height', oldHeight);
}


/* Mousedown listener to use for identify context menu update images 
 * from: http://stackoverflow.com/questions/7703697/how-to-retrieve-the-element-where-a-contextmenu-has-been-executed */
document.addEventListener("mousedown", function(event){
    //right click
    if(event.button == 2) {
        clickedEl = event.target;
    }
}, true);

/* Context Menu Code :: help from http://stackoverflow.com/questions/14452777/is-that-possible-calling-content-script-method-by-context-menu-item-in-chrome-ex */

/* Replaces src of clicked image and store old src */
function replaceSrcContext(i)
{
  var oldWidth = clickedEl.width;
  var oldHeight = clickedEl.height;
  // get aspect ratio
  var aspect = oldWidth/oldHeight;

  var ratio = getClosestRatio(aspect, 0, ratioList.length - 1);

  // get replacement url
  var chosenBo = imgList[Math.floor(Math.random() * imgList.length)];
  var newrl = chrome.extension.getURL("/images/" + folder + "/" + chosenBo + "/" + ratio + ".jpg") + "?" + new Date().getTime();


  // get old src
  var oldrl = i.srcUrl;
  // replace src
  clickedEl.src = newrl;
  // check other src options on image
  for (var att, k = 0, atts = clickedEl.attributes, n = atts.length; k < n; k++){
    att = atts[k];
    // check if attribute contains 'src'
    var srcRegex = new RegExp("(src)");
    var lower = att.nodeName.toLowerCase();
    // if attribute contains src
    if (lower.match(srcRegex))
    {
      if (lower == "srcset")
        {
          // get urls from srcset value
          var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
          var urlRegex = new RegExp(expression);
          att.nodeValue = att.nodeValue.replace(urlRegex, newrl);
        }
        else
        {
          clickedEl.setAttribute(att.nodeName, newrl);
        }
    }
  }
  // limit size
  clickedEl.setAttribute('maxwidth', oldWidth);
  clickedEl.setAttribute('width', oldWidth);
  clickedEl.setAttribute('maxheight', oldHeight);
  clickedEl.setAttribute('height', oldHeight);

  // store old src if not already stored
  if (!clickedEl.getAttribute("old-source") || (clickedEl.getAttribute("old-source") == "none"))
  {
    console.log('replacing');
    clickedEl.setAttribute("old-source", oldrl);
  }
}

/* Returns image (all src-containing attributes) to origianl source using old-source tag */
function revertImage(i)
{
  // chekc if image has been replaced yet
  if (clickedEl.getAttribute('old-source') === "" || clickedEl.getAttribute('old-source') == 'none' || !clickedEl.getAttribute("old-source"))
  {
    console.log("hasn't been replaced");
  }
  else
  {
    // get old src
    var oldrl = clickedEl.getAttribute('old-source');
    // reset src
    clickedEl.setAttribute('src', oldrl);
    // check other src options on image
    for (var att, k = 0, atts = clickedEl.attributes, n = atts.length; k < n; k++){
      att = atts[k];
      // check if attribute contains 'src'
      var srcRegex = new RegExp("(src)");
      var lower = att.nodeName.toLowerCase();
      // if attribute contains src
      if (lower.match(srcRegex))
      {
        console.log("found src tag");
        if (lower == "srcset")
          {
            console.log('srcset');
            // get urls from srcset value
            var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
            var urlRegex = new RegExp(expression);
            att.nodeValue = att.nodeValue.replace(urlRegex, oldrl);
          }
          else
          {
            clickedEl.setAttribute(att.nodeName, oldrl);
          }
      }
    }
    // mark picture as original
    clickedEl.setAttribute('old-source', "none");
  }
}

/* Functions for context menu link background replacement */

/* replaces style background image if it exists */
function replaceLinkContext(i)
{
  //var style = window.getComputedStyle(clickedEl);
  //var backImage = style.getPropertyValue('background-image');

  // check that a background image exists
  if (clickedEl.style["background-image"])
  {
    var oldWidth = clickedEl.offsetWidth;
    var oldHeight = clickedEl.offsetHeight;
    console.log("width: " + oldWidth + " height: " + oldHeight);
    // get aspect ratio
    var aspect = oldWidth/oldHeight;
    var ratio = getClosestRatio(aspect, 0, ratioList.length - 1);

    // get replacement url
    var chosenBo = imgList[Math.floor(Math.random() * imgList.length)];
    var newrl = "url(" + chrome.extension.getURL("/images/" + folder + "/" + chosenBo + "/" + ratio + ".jpg") + "?" + new Date().getTime() + ")";

    // get old url
    var oldSource = clickedEl.style["background-image"];
    if (!clickedEl.getAttribute("old-source") || (clickedEl.getAttribute("old-source") == "none"))
    {
      clickedEl.setAttribute("old-source", oldSource);
    }

    // replace background image in style
    clickedEl.style["background-image"] = newrl;

    return;
  }
  // TODO check parent for background image
  addJQ();

  // get text of closest figcaption
  var parent = $(clickedEl).closest();
  if (parent.css('background-image'))
  {
    // TODO replace
    console.log("has parent with bg image");
    return;
  }
  // TODO check child for background image
  var children = $(clickedEl).children();
  if (children.css('background-image'))
  {
    // TODO replace
    console.log("has >= 1 child with bg image");
    return;
  }
  console.log("No image to replace.");
}

/* Returns element's background image to original source using old-source tag (if element has been marked as changed) */
function revertLink(i)
{
  console.log("REVERT LINK TODO");
  // chekc if image has been replaced yet
  if (clickedEl.getAttribute('old-source') === "" || clickedEl.getAttribute('old-source') == 'none' || !clickedEl.getAttribute("old-source"))
  {
    console.log("hasn't been replaced");
    return;
  }
  // get old src
  var oldrl = clickedEl.getAttribute('old-source');
  // reset src
  clickedEl.style["background-image"] = oldrl;
  
  // mark picture as original
  clickedEl.setAttribute('old-source', "none");
}

/* (context menu) message listener */
chrome.extension.onMessage.addListener(function (message, sender, callback) {
    if (message.functiontoInvoke == "replaceSrcContext") {
      if (message.info.srcUrl)
      {
        replaceSrcContext(message.info);
      }
      else
      {
        // TODO go somewhere else for links
        replaceLinkContext(message.info);
      }
    }
    if (message.functiontoInvoke == "revertImage") {
      if (message.info.srcUrl)
      {
        revertImage(message.info);
      }
      else
      {
        // TODO go somewhere else for links
        revertLink(message.info);
      }
    }
    if (message.functiontoInvoke == "changeImageType")
    {
      var type = message.imgType;
      console.log(type);
      console.log(imageTypes[type]);
      //folder = imageTypesList[imageTypes[message.imgType]].folder;
      //imgList = imageTypesList[imageTypes[message.imgType]].imgList;
    }
});

/* Updates replaced images with new selected image type*/
function updateImgType()
{
  var replacedImages = document.querySelectorAll("img[old-source]");
  for (var i = replacedImages.length - 1; i >= 0; i--) {
    if (replacedImages[i].getAttribute("old-source") != "none")
    {
      var path = replacedImages[i].src;
      // check for other src containing attributes if no src
      if (!path)
      {
        //get src-containing attribute
        for (var attr, j = 0, attrs = replacedImages[i].attributes, m = attrs.length; j < m; j++)
        {
          attr = attrs[j];
          // check if attribute contains 'src'
          var srcregex = new RegExp("(src)");
          var lowered = attr.nodeName.toLowerCase();
          // if attribute contains src
          if (lowered.match(srcregex))
          {
            path = attr.nodeValue;
            break;
          }
        }
      }
      // get old ratio
      var ratioRegex = new RegExp("(\\d+x\\d+)");
      // if attribute contains src
      
      var ratio = path.match(ratioRegex)[0];
      var chosenBo = imgList[Math.floor(Math.random() * imgList.length)];
      var newrl = chrome.extension.getURL("/images/" + folder + "/" + chosenBo + "/" + ratio + ".jpg");

      // find and replace attributes containing src
      for (var att, k = 0, atts = replacedImages[i].attributes, n = atts.length; k < n; k++)
      {
        att = atts[k];
        // check if attribute contains 'src'
        var srcRegex = new RegExp("(src)");
        var lower = att.nodeName.toLowerCase();
        // if attribute contains src
        if (lower.match(srcRegex))
        {
          if (lower == "srcset")
            {
              // get urls from srcset value
              var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
              var urlRegex = new RegExp(expression);
              att.nodeValue = att.nodeValue.replace(urlRegex, newrl);
            }
            else
            {
              replacedImages[i].setAttribute(att.nodeName, newrl);
            }
        }
      }
    }
  }
}

/* Updates replaced images with new selected image type*/
function updateImgTypeOther()
{
  var replacedDivs = document.querySelectorAll("div[old-source]");
  for (var i = replacedDivs.length - 1; i >= 0; i--)
  {
    if (replacedDivs[i].getAttribute("old-source") != "none")
    {
      // get bg image path
      //var path = window.getComputedStyle(replacedDivs[i]).getPropertyValue('background-image');
      var path = replacedDivs[i].style.backgroundImage;
      // get old ratio
      var ratioRegex = new RegExp("(\\d+x\\d+)");
      // if attribute contains src
      var ratio = path.match(ratioRegex)[0];
      var chosenBo = imgList[Math.floor(Math.random() * imgList.length)];
      var newrl = "url("+chrome.extension.getURL("/images/" + folder + "/" + chosenBo + "/" + ratio + ".jpg") + ")";
      // set bg image to new url
      replacedDivs[i].setAttribute('style', "background-image: "+newrl);
    }
  }
  var replacedLinks = document.querySelectorAll("a[old-source]");
  for (var j = replacedLinks.length - 1; j >= 0; j--)
  {
    if (replacedLinks[j].getAttribute("old-source") != "none")
    {
      // get bg image path
      var pathL = replacedLinks[j].style.backgroundImage;
      // get old ratio
      var ratioRegexL = new RegExp("(\\d+x\\d+)");
      // if attribute contains src
      var ratioL = pathL.match(ratioRegexL)[0];
      var chosenBoL = imgList[Math.floor(Math.random() * imgList.length)];
      var newrlL = "url("+chrome.extension.getURL("/images/" + folder + "/" + chosenBoL + "/" + ratioL + ".jpg") + ")";
      // set bg image to new url
      replacedLinks[j].setAttribute('style', "background-image: "+newrlL);
    }
  }
}

// turn off caching 
var textnode = document.createTextNode("<meta http-equiv='Cache-Control' content='no-cache, no-store, must-revalidate' />");
var textnode1 = document.createTextNode("<meta http-equiv='Pragma' content='no-cache' />");
var textnode2 = document.createTextNode("<meta http-equiv='Expires' content='0' />");
document.getElementsByTagName('head')[0].appendChild(textnode);
document.getElementsByTagName('head')[0].appendChild(textnode1);
document.getElementsByTagName('head')[0].appendChild(textnode2);

/* Storage/Options (page and popup) Code */
chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    console.log(key);
    if (key == 'imgType')
    {
      console.log('here');
      var storageChange = changes[key];
      folder = imageTypesList[imageTypes[storageChange.newValue]].folder;
      imgList = imageTypesList[imageTypes[storageChange.newValue]].imgList;
      // replace existing replacements
      if (!paused)
      {
        updateImgType();
        updateImgTypeOther();
      }
    }
    else if (key == 'blocking')
    {
      console.log("blocking triggered");
      console.log(changes[key]);
      // determine if pausing has been stated or stopped for given page and act accordingly
      if (Object.keys(changes[key].newValue).length > Object.keys(changes[key].oldValue).length)
      {
        console.log("resume");
      }
      else
      {
        console.log("pause");
      }
      location.reload();
    }
  }
});
