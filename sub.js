/* Replaces recognized images of Trump with Bo Obama 
 *
 * Help from: https://blog.lateral.io/2016/04/create-chrome-extension-modify-websites-html-css/ 
 */


console.log("debug");
// list of all boIds (correspond to Bo pics)
var boList = ["Bo_1", "Bo_2", "Bo_3", "Bo_4"];

/* finds images of Trumps by TODO */
function findTrumps()
{
  var images = document.getElementsByTagName('img');
  for (var i = 0, l = images.length; i < l; i++)
  {
    //TODO determine if pic is of Trump

    // check alt

    // check for Trump in src 

    // check data-mediaviewer-caption for Trump

    if (true)
    {
      replace(images[i]);
    }
  }
}

/* replaces image with and image of Bo Obama */
function replace(image)
{
  // choose random Bo
  var chosenBo = boList[Math.floor(Math.random() * boList.length)];
  // switch img src to be of Bo (should works b/c http://stackoverflow.com/questions/518000/is-javascript-a-pass-by-reference-or-pass-by-value-language)
  //image.src = "chrome-extension://__MSG_@@extension_id__/images/" + chosenBo + ".jpg";
  image.src = chrome.extension.getURL("/images/" + chosenBo + ".jpg");

  // TODO limit size
  image.maxwidth = image.width;
  image.width = image.width;
  image.maxheight = image.height;
  image.height = image.height;

  console.log("width: "+image.width);
  console.log("height: "+image.height);

}

findTrumps();