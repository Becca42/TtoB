/* Replaces recognized images of Trump with Bo Obama 
 *
 * Help from: https://blog.lateral.io/2016/04/create-chrome-extension-modify-websites-html-css/ 
 *
 * TODO:
 *   - build js to run on icon click
 *   - make small bo pic to use for icon
 *   - 
 */


console.log("debug");
// list of all boIds (correspond to Bo pics)
var boList = ["Bo_1", "Bo_2", "Bo_3", "Bo_4"];

/* add JQuery to document */
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

/* finds images of Trumps by checking src, alt, surrounding links, ... TODO */
function findTrumps()
{
  var images = document.getElementsByTagName('img');
  console.log("trumping");
  for (var i = 0, l = images.length; i < l; i++)
  {

    // TODO check enclosing div caption? -- might be hard

    // check alt text
    var inAlt = checkALT(images[i]);

    // check for Trump in src
    var inSRC = checkSRC(images[i]);

    // TODO check data-mediaviewer-caption?

    // TODO stop replacing all images
    if (inSRC || inAlt)
    {
      console.log(images[i].alt);
      replace(images[i]);
    }
    /* do more complicated searches if not in src or alt */
    else
    {
        // TODO check enclosing link -- In Progress
      var inLink = checkLink(images[i]);

      if (inLink)
      {
        replace(images[i]);
      }

    // TODO deal with links with background images?

    // TODO deal with divs with background images?
    }
  }
}

function findTrumps1()
{
  var images = document.getElementsByTagName('img');
  console.log("trumping1");
  for (var i = 0, l = images.length; i < l; i++)
  {
    //TODO determine if pic is of Trump

    // check alt

    // check for Trump in src 

    // check data-mediaviewer-caption for Trump

    // TODO stop replacing all images
    if (true)
    {
      replace(images[i]);
    }

  // TODO deal with links with background images?

  }
}

function findTrumps2()
{
  var images = document.getElementsByTagName('img');
  console.log("trumping2");
  for (var i = 0, l = images.length; i < l; i++)
  {
    //TODO determine if pic is of Trump

    // check alt

    // check for Trump in src 

    // check data-mediaviewer-caption for Trump

    // TODO stop replacing all images
    if (true)
    {
      replace(images[i]);
    }

  // TODO deal with links with background images?

  }
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

// TODO ADD ANOTHER SCRIPT TO RUN WHEN ICON IS CLICKED ~ MAYBE THAT CAN BE USED TO SOLVE LAZY LOAD AND PAGE RELOAD PROBLEMS

findTrumps();
//window.addEventListener('load', findTrumps1, false);
//window.addEventListener("DOMContentLoaded", findTrumps2);
setTimeout(findTrumps, 5000);
run();