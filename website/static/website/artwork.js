/*
*  Script for bringing up a clicked on image, zooming and fading the background
*  also brings up extra information about the image
*/

/* CODE FROM (https://www.w3schools.com/css/css3_images.asp) */

// Get the modal
var modal = document.getElementById('myModal');

// Get the image and insert it inside the modal - use its "alt" text as a caption
var img = document.getElementById('loud-cry');
var modalImg = document.getElementById("imgModal");
var captionText = document.getElementById("caption");
img.onclick = function(){
    
    modal.style.display = "block";
    modalImg.src = this.src;
    captionText.innerHTML = this.alt;
}

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}