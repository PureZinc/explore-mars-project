const navToggleButton = document.querySelector('.nav-bars');
const dropdownNav = document.getElementById('dropdownNav');

navToggleButton.addEventListener('click', function() {
    const symbol = navToggleButton.children[0];
    symbol.classList.toggle('fa-bars');
    symbol.classList.toggle('fa-x');
    dropdownNav.classList.toggle('open'); 
});