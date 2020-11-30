/*
*  Single page views that switch depending on the button press
*  one for my resume, and one for my CV
*/


document.addEventListener('DOMContentLoaded', function() {

    // Form view button functionality
    document.getElementById('artistic-resume-button').onclick = () => showRecommendationForm('artistic-resume-button');
    document.getElementById('technical-resume-button').onclick = () => showRecommendationForm('technical-resume-button');
    document.getElementById('cv-button').onclick = () => showRecommendationForm('cv-button');

});

function showRecommendationForm(buttonId) {
    switch(buttonId) {

        case 'artistic-resume-button':
            
            // Display the resume and hide the cv
            document.getElementById('artistic-resume-container').style.display = 'block';
            document.getElementById('technical-resume-container').style.display = "none";
            document.getElementById('cv-container').style.display = "none";

            break;

        case 'technical-resume-button':

            // Display the resume and hide the cv
            document.getElementById('artistic-resume-container').style.display = 'none';
            document.getElementById('technical-resume-container').style.display = "block";
            document.getElementById('cv-container').style.display = "none";
            
            break;

        case 'cv-button':

            // Display the artists input form and hide the others
            document.getElementById('artistic-resume-container').style.display = 'none';
            document.getElementById('technical-resume-container').style.display = "none";
            document.getElementById('cv-container').style.display = "block";

            break;

    }
}