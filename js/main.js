const API_KEY = KEYS.nasa;

const roverContainer = document.getElementById('rovers');
const favRoverContainer = document.getElementById('favRovers');

const sortBtn = document.querySelectorAll('button.sortBtn');

const totalSol = document.getElementById('total-sol');
const favTotalSol = document.getElementById('fav-total-sol');

let favoritesIds;
try {
    favoritesIds = JSON.parse(localStorage.getItem('favs')) || [];
} catch (error) {
    console.error("Error while getting favoriteIds:", error);
    favoritesIds = [];
    localStorage.setItem('favs', JSON.stringify(favoritesIds));
}

const addToLocalStorage = (id) => {
    if (favoritesIds.includes(id)) {
        favoritesIds = favoritesIds.filter((i) => i !== id);
    } else {
        favoritesIds.push(id);
    }
    localStorage.setItem('favs', JSON.stringify(favoritesIds));
}

const initSolSums = () => {
    const addTotalSol = (container) => {
        const childrenArray = Array.from(container.children);
        return childrenArray.reduce((add, sol) => {
            return add + Number(sol.dataset.sol);
        }, 0);
    }

    [totalSol, favTotalSol].forEach((sol) => {
        sol.innerHTML = `Total Sol: ${addTotalSol(roverContainer)}`;
    })
}

const updateFavPics = (item) => {
    const container = item.parentNode === roverContainer ? favRoverContainer : roverContainer;
    container.appendChild(item);
    initSolSums();
}

const sortPics = (direction, container) => {
    const picsArray = Array.from(container.children);
    
    picsArray.sort((a, b) => {
        const [idA, idB] = [Number(a.id), Number(b.id)];
        return direction === 'a-z' ? idA - idB : idB - idA;
    });

    picsArray.forEach(pic => {
        container.removeChild(pic);
        container.appendChild(pic);
    });
}

for (const btn of sortBtn) {
    btn.addEventListener('click', () => {
        [roverContainer, favRoverContainer].forEach((container) => {
            sortPics(btn.id, container);
        })
    })

}

const createPicElements = (photoData, isInFavorites=false) => {
    const container = isInFavorites ? favRoverContainer: roverContainer;

    const imgContainer = document.createElement('div');
    imgContainer.classList.add('img-container');
    imgContainer.id = photoData.id;
    imgContainer.setAttribute('data-camera', photoData.camera.name);
    imgContainer.setAttribute('data-sol', photoData.sol);

    const roverImg = document.createElement('img');
    roverImg.setAttribute('src', photoData.img_src);

    const popUp = document.createElement('div');
    popUp.classList.add('pop-up');

    const roverName = document.createElement('h3');
    roverName.innerHTML = 'Rover: ' + photoData.rover.name;

    const roverElement = document.createElement('p');
    roverElement.innerHTML = 'Taken with: ' + photoData.camera.name;

    const roverSol = document.createElement('p');
    roverSol.innerHTML = 'Total Sol: ' + photoData.sol;

    const toFavs = document.createElement('button');
    const favsInner = isInFavorites ? "Remove from Favs" : "Add to Favs";
    toFavs.innerHTML = favsInner;

    popUp.append(roverName, roverElement, roverSol, toFavs);
    imgContainer.append(roverImg, popUp);

    container.appendChild(imgContainer);
}

const getApiLink = (page, key) => {
    return `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&page=${page}&api_key=${API_KEY}`;
}

const roverPhotos = async (page) => {
    const link =  getApiLink(page, API_KEY);
    return await fetch(link)
    .then(data => data.json());
}

roverPhotos(2).then((data) => {
    for (const photo of data.photos.slice(0, 40)) {
        createPicElements(photo, favoritesIds.includes(photo.id));
    }
    initSolSums();
});

const handleImageClick = (e) => {
    const imgContainer = e.target.closest('.img-container');
    if (!imgContainer) return;
    updateFavPics(imgContainer);
    addToLocalStorage(photoData.id);
};

roverContainer.addEventListener('click', handleImageClick);
favRoverContainer.addEventListener('click', handleImageClick);
