/* Replaces recognized images of Trump with Bo Obama 
 *
 * Help from: https://blog.lateral.io/2016/04/create-chrome-extension-modify-websites-html-css/ 
 *
 * TODO:
 *   - look at aspect ration of incoming image and have various replacement images to better match ratios
 *   - add option on right click to convert image (if mouse is over an image) -- how would this work for divs and links with background images
 *   - test on other sources like reddit and shit, need different tactics?
 *   - deal with images inserted by script e.g. twitter widgets/embeds
 *   - check text enclosed by links <a> example trump .... </a>?
 *   - store old src and have a restore option on right click??
 *   - check <figcaption>?
 *   - make some kind of options or info page
 * 
 * KNOWN "BUGS":
 *   - misses images where text containing trump is 2+ levels up
 *   - can't handle images inserted by scripts e.g. twitter avatar
 *   - fix problems like this page - http://www.npr.org/2016/12/28/507305600/trump-speaks-briefly-to-reporters-reversing-obama-criticism-and-touting-new-jobs
 *     (trump doesn't appear in src or alt, no surrounding link -- maybe look for closest <p></p>?)
 */


console.log("debug");
// list of all boIds (correspond to Bo pics)
var boList = ["Bo_1", "Bo_2", "Bo_3", "Bo_4"];

/* add JQuery to document -- code from stackoverflow*/
function addJQ()
{
  var script = document.createElement('script');
  script.src = 'http://code.jquery.com/jquery-1.11.0.min.js';
  script.type = 'text/javascript';
  document.getElementsByTagName('head')[0].appendChild(script);
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

/* checks attributes of given html tag for background-image, if exists checks for trump and replaces if trumpy
 * code help from http://stackoverflow.com/questions/4952337/quickly-select-all-elements-with-css-background-image */
function checkTagBackgrounds(tag)
{

  addJQ();
  // get new url
  var chosenBo = boList[Math.floor(Math.random() * boList.length)];
  var newrl = chrome.extension.getURL("/images/" + chosenBo + ".jpg");
  if (tag == 'div')
  {
    newrl = 'url("' + newrl + '"';
  }

  // reset links with background images
  $(tag).filter(function() {
    // check if background is set
    if ($(this).css('background-image') === '')
    {
      return false;
    }
    else
    {
      // TODO check for trumpishness
      var backImg = $(this).css('background-image');
      var trumpRegex = new RegExp("(trump)");
      var lower = backImg.toLowerCase();
      if (lower.match(trumpRegex)) {console.log(backImg);}
      if (tag == 'a' || lower.match(trumpRegex))
      {
        return lower.match(trumpRegex);
      }
      // check closest link for divs with background images that aren't trumpy
      else
      {
        // check closest link
        return checkLink($(this));
      }
    }
  }).css('background-image', newrl);
}

/* checks attributes of given image, attributes that contain 'src' in key name have values replaced with url newrl */
function findReplaceSRC(image)
{
  // get replacement url
  var chosenBo = boList[Math.floor(Math.random() * boList.length)];
  var newrl = chrome.extension.getURL("/images/" + chosenBo + ".jpg");

  // check all attributes
  // code adapted from http://stackoverflow.com/questions/2048720/get-all-attributes-from-a-html-element-with-javascript-jquery
  for (var att, i = 0, atts = image.attributes, n = atts.length; i < n; i++){
      att = atts[i];
      // check if attribute contains 'src'
      var srcRegex = new RegExp("(src)");
      var lower = att.nodeName.toLowerCase();
      if (lower.match(srcRegex))
      {
        // if attribute includes src, replace value with newrl
        image.setAttribute(att.nodeName, newrl);
      }
  }
  // limit size
  image.maxwidth = image.width;
  image.width = image.width;
  image.maxheight = image.height;
  image.height = image.height;
}

/* finds images of Trumps by checking src, alt, surrounding links, ... TODO */
function findTrumps()
{
  var images = document.getElementsByTagName('img');
  console.log("trumping");
  for (var i = 0, l = images.length; i < l; i++)
  {
    var found = false;

    // TODO check enclosing div caption? -- might be hard

    // check alt text
    var inAlt = checkALT(images[i]);

    // check for Trump in src
    var inSRC = checkSRC(images[i]);

    // TODO check data-mediaviewer-caption?

    if (inSRC || inAlt)
    {
      found = true;
      findReplaceSRC(images[i]);
    }
    // check enclosing link (<a></a>)
    else if (!found)
    {
      var inLink = checkLink(images[i]);
      if (inLink)
      {
        //replace(images[i]);
        findReplaceSRC(images[i]);
      }

    // TODO check closest <p></p> text

    // TODO deal with divs with background images?
    }
  }
  // deal with links with background images
  checkTagBackgrounds('a');

  // deal with divs with background images
  checkTagBackgrounds('div');
}

/* replaces image with and image of Bo Obama */
function replace(image)
{
  // choose random Bo
  var chosenBo = boList[Math.floor(Math.random() * boList.length)];
  var newrl = chrome.extension.getURL("/images/" + chosenBo + ".jpg");
  // switch img src to be of Bo (should works b/c http://stackoverflow.com/questions/518000/is-javascript-a-pass-by-reference-or-pass-by-value-language)
  //image.src = "chrome-extension://__MSG_@@extension_id__/images/" + chosenBo + ".jpg";
  image.src = newrl;

  // srcset: http://i1.wp.com/cornellsun.com/wp-content/uploads/2016/11/Pg-10-Bruce-Monger-by-David-Navadeh-File-Photo.jpg?w=1000 1000w, http://i1.wp.com/cornellsun.com/wp-content/uploads/2016/11/Pg-10-Bruce-Monger-by-David-Navadeh-File-Photo.jpg?resize=336%2C240 336w, http://i1.wp.com/cornellsun.com/wp-content/uploads/2016/11/Pg-10-Bruce-Monger-by-David-Navadeh-File-Photo.jpg?resize=768%2C548 768w, http://i1.wp.com/cornellsun.com/wp-content/uploads/2016/11/Pg-10-Bruce-Monger-by-David-Navadeh-File-Photo.jpg?resize=771%2C550 771w

  // deal with srcset
  // url regex (from : http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url)
  var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var urlRegex = new RegExp(expression);
  image.srcset = image.srcset.replace(urlRegex, newrl);

  // TODO deal with data-original ????????????????
  //if (image.getAttribute("data-original"))
  if (false)
  {
    console.log(image.getAttribute("data-original"));
    image.setAttribute("data-original", newrl);
    console.log(image.getAttribute("data-original"));
    console.log(image.class);

  }

  // TODO deal with data-hi-res-src and data-low-res-src or maybe just any tag that says src, can you regex serach tags???

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
  image.maxwidth = image.width;
  image.width = image.width;
  image.maxheight = image.height;
  image.height = image.height;

  // TODO deal with weird resizing on refresh


}

// TODO -- this hot mess
function run()
{
  var a = false;
  while(a)
  {
    if(performance.navigation.type  == 1 )
    {
      console.log('page reloaded');
      a = false;
    }
  }
}

findTrumps();
//window.addEventListener('load', findTrumps, false);
//window.addEventListener("DOMContentLoaded", findTrumps);
//setTimeout(findTrumps, 5000);
//run();