const API_KEY = KEYS.nasa;

const roverContainer = document.getElementById('rovers');
const favRoverContainer = document.getElementById('favRovers');

const sortBtn = document.querySelectorAll('button.sortBtn');

const totalSol = document.getElementById('total-sol');
const favTotalSol = document.getElementById('fav-total-sol');

const defaultPageNum = 2;

const searchPageInput = document.getElementById('page-num');
const searchPageButton = document.getElementById('search-page-button')

searchPageInput.setAttribute('placeholder', defaultPageNum);

const clearFavsButton = document.getElementById('clear-favs');

const correspondingContainer = (solElm) => solElm === totalSol ? roverContainer : favRoverContainer;

const favoritesName = 'favs';
let favoritesIds;
const putFavesInLocalStorage = () => {
    console.log("Saving favorites to local storage:", favoritesIds);
    localStorage.setItem(favoritesName, JSON.stringify(favoritesIds));
};

try {
    favoritesIds = JSON.parse(localStorage.getItem(favoritesName)) || [];
} catch (error) {
    console.error("Error while getting favoriteIds:", error);
    favoritesIds = [];
    putFavesInLocalStorage();
}

const addToLocalStorage = (id) => {
    if (favoritesIds.includes(id)) {
        favoritesIds = favoritesIds.filter((i) => i !== id);
    } else {
        favoritesIds.push(id);
    }
    putFavesInLocalStorage();
}

const clearFavs = () => {
    favoritesIds = [];
    putFavesInLocalStorage();
    favRoverContainer.innerHTML = '';
    initSolSums();
}

const initSolSums = () => {
    const addTotalSol = (container) => {
        const childrenArray = Array.from(container.children);
        return childrenArray.reduce((add, sol) => {
            return add + Number(sol.dataset.sol);
        }, 0);
    }

    [totalSol, favTotalSol].forEach((sol) => {
        sol.innerHTML = `Total Sol: ${addTotalSol(correspondingContainer(sol))}`;
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

const toggleButtonText = (btn, condition) => {
    const isFavorited = condition === undefined ? btn.innerText === "Add to Faves" : condition;
    btn.innerText = isFavorited ? "Remove from Faves" : "Add to Faves";
};

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
    toggleButtonText(toFavs, isInFavorites);

    popUp.append(roverName, roverElement, roverSol, toFavs);
    imgContainer.append(roverImg, popUp);

    container.appendChild(imgContainer);
}

const getApiLink = (page, key) => {
    return `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&page=${page}&api_key=${key}`;
}

const roverPhotos = async (page) => {
    const link =  getApiLink(page, API_KEY);

    return await fetch(link)
    .then((data) => {
        if (!data.ok) {
            alert(`${page} is not accessible!`);
            throw new Error(`Server returned with error code ${data.status}`);
        }
        return data.json();
    })
    .catch((error) => {
        console.log(error);
    });
}

const fetchPhotosByPage = (page) => {
    roverPhotos(page).then((data) => {
        for (const photo of data.photos) {
            createPicElements(photo, favoritesIds.includes(String(photo.id)));
        }
        initSolSums();
    });
}

fetchPhotosByPage(defaultPageNum);

const handleImageClick = (e) => {
    if (e.target.matches('button')) {
        const t = e.target;
        const imgContainer = t.closest('.img-container');
        if (!imgContainer) return;
        toggleButtonText(t);
        updateFavPics(imgContainer);
        addToLocalStorage(imgContainer.id);
    }
};

const showConfirmationModal = (onConfirm) => {
    const len = favoritesIds.length;
    document.getElementById('favCount').innerText = len;
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'block';

    document.getElementById('confirmBtn').onclick = () => {
        onConfirm();
        modal.style.display = 'none';
    };

    document.getElementById('cancelBtn').onclick = () => {
        modal.style.display = 'none';
    };
};

roverContainer.addEventListener('click', handleImageClick);
favRoverContainer.addEventListener('click', handleImageClick);
clearFavsButton.addEventListener('click', () => {
    showConfirmationModal(clearFavs);
});
searchPageButton.addEventListener('click', () => {
    const value = searchPageInput.value ? searchPageInput.value : defaultPageNum;
    roverContainer.innerHTML = '';
    fetchPhotosByPage(value);
})
