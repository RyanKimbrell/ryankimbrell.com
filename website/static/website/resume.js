/*
*  Single page views that switch depending on the button press
*  one for my resume, and one for my CV
*/


document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('resume-container').style.display = "none";
    document.getElementById('cv-container').style.display = "none";

    // Form view button functionality
    document.getElementById('resume-button').onclick = () => showRecommendationForm('resume-button');
    document.getElementById('cv-button').onclick = () => showRecommendationForm('cv-button');

});

function showRecommendationForm(buttonId) {
    switch(buttonId) {

        case 'resume-button':

            // Display the resume and hide the cv
            document.getElementById('resume-container').style.display = "block";
            document.getElementById('cv-container').style.display = "none";
            
            break;

        case 'cv-button':

            // Display the artists input form and hide the others
            document.getElementById('resume-container').style.display = "none";
            document.getElementById('cv-container').style.display = "block";

            break;

    }
}