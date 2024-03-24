window.addEventListener("DOMContentLoaded", (event) => {
    console.log(window.location.hash.split('/'));

    setTimeout(function() {
        if (window.location.hash.split('/').length == 3) {
            var element = document.getElementById('operations-\\[object_Object\\]-' + window.location.hash.split('/')[2]);
            if (element) {// go to element
                element.children[0].click();
                element.scrollIntoView();
            }
        }
    }, 300);
});