const searchLink = document.querySelector('.search__link'),
    mainContent = document.querySelector('.main__content'),
    mainClose = document.querySelector('.main__close'),
    mainBlock = document.querySelector('.main__block'),
    mainSolo = document.querySelector('.main__solo'),
    pagination = document.querySelector('.pagination'),
    formMain = document.querySelector('.form__main'),
    formInput = document.querySelector('.header__input'),
    anime = document.querySelector('.anime'),
    headerBurger = document.querySelector('.header__btn'),
    headerAbs = document.querySelector('.header__abs'),
    headerItems = document.querySelector('.header__items')

const openMenu = (e) => {
    e.preventDefault()
    const toggleClass = headerBurger.classList.contains('active') ? 'remove' : 'add'
    headerBurger.classList[toggleClass]('active')
    headerItems.classList[toggleClass]('active')
    headerAbs.classList[toggleClass]('active')
    document.body.classList[toggleClass]('active')
}

headerBurger.addEventListener('click', (e) => openMenu(e))
headerAbs.addEventListener('click', (e) => openMenu(e))

const openSearchPanel = (e, toggler = true) => {
    e.preventDefault()
    mainContent.classList[toggler ? 'add' : 'remove']('active')
}
searchLink.addEventListener('click', (e) => openSearchPanel(e))
mainClose.addEventListener('click', (e) => openSearchPanel(e, false))

const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
const getLink = (url) => url.split('www.').join('')

const host = 'https://kinopoiskapiunofficial.tech'
const hostName = 'X-API-KEY'
const hostKey = '2bea2c6d-ea0a-47b0-88a5-0200e5348f5b'

class Kino {
    constructor() {
        this.date = new Date().getMonth()
        this.month = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
        this.currentYear = new Date().getFullYear()
        this.currentMonth = this.month[this.date]
    }

    fStart = async (url) => {
        const res = await fetch(url, {
            headers: {
                [hostName]: hostKey,
                'Content-Type': 'application/json'
            },
        })
        const json = await res.json()
        return json
    }
    getTopMovies = (page = 1) => this.fStart(`${host}/api/v2.2/films/top?type=TOP_250_BEST_FILMS&page=${page}`)
    getSoloFilm = (id) => this.fStart(`${host}/api/v2.2/films/${id}`)
    getReleases = (page = 2, year = this.currentYear, month = this.currentMonth) => this.fStart(`${host}/api/v2.1/films/releases?year=${year}&month=${month}&page=${page}`)
    getFrames = (id) => this.fStart(`${host}/api/v2.2/films/${id}/images?type=STILL&page=1`)
    getReviews = (id) => this.fStart(`${host}/api/v2.2/films/${id}/reviews?page=1&order=DATE_DESC`)
    getSearch = (page = 1, keyword) => this.fStart(`${host}/api/v2.1/films/search-by-keyword?keyword=${keyword}&page=${page}`)
}

const db = new Kino()

const renderTrendMovies = (element = [], fn = [], films = [], params = []) => {
    anime.classList.add('active')
    element.forEach((item, i) => {
        const parent = document.querySelector(`${item} .swiper-wrapper`)
        db[fn[i]](params[i]).then(data => {
                data[films[i]].forEach(element => {
                    const slide = document.createElement('div')
                    slide.classList.add('swiper-slide')
                    slide.innerHTML = `
                    <div class="movie__item" data-id="${element.filmId}">
                            <img src="${element.posterUrlPreview}" alt="" />
                    </div>
                `
                    parent.append(slide)
                })
                const movieItem = document.querySelectorAll('.movie__item')
                movieItem.forEach(item => {
                    item.addEventListener('click', () => {
                        let attr = item.getAttribute('data-id')
                        renderSolo(attr)
                        // Создать функцию для рендера одного фильма
                    })
                })
                new Swiper(`${item}`, {
                    slidesPerView: 5,
                    spaceBetween: 27,
                    loop: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }
                })
            })
            .then(() => {
                const pages = 13
                const randomNum = random(1, pages)
                renderHeader(randomNum)
            })
            .catch(e => {
                anime.classList.remove('active')
                console.log(e);
            })
    })
}


renderTrendMovies(['.trend__tv-slider', '.popular__actors-slider'], ['getTopMovies', 'getReleases'], ['films', 'releases'], [8, 8])

const renderHeader = (page) => {
    db.getTopMovies(page).then(res => {
        anime.classList.add('active')
        const max = random(0, res.films.length - 1)
        const filmId = res.films[max].filmId
        const filmRating = res.films[max].rating
        console.log(filmId);
        db.getSoloFilm(filmId).then(response => {
                const sm = response
                const headerText = document.querySelector('.header__text')
                headerText.innerHTML = `
                <h1 class= 'header__title'> ${sm.nameRu || sm.nameEn}</h1>
                <div class='header__balls'>
                    <span class='header__year'>${sm.year}</span>
                    <span class='header__rating'>${sm.ratingAgeLimits}</span>
                    <div class='headers__stars'>
                        <span class='icon-solid'></span>
                        <span class='header__rating'>${filmRating}</span>
                    </div>
                    <p class='header__descr'>${sm.description}</p>
                </div>
                <div class='header__buttons'>
                    <a href='#' class='header__watch'>
                        <span class='icon-solid'></span>
                        watch
                    </a>
                    <a href='#' onclick="renderSolo(${sm.kinopoiskId})" class='header__more header__watch movie__item'>
                        More information
                    </a>
                </div>
            `
                anime.classList.remove('active')
            })
            .catch(e => {
                anime.classList.remove('active')
                console.log(e);
            })
    })
}

const renderSolo = (id) => {
    mainBlock.innerHTML = ''
    pagination.innerHTML = ''
    anime.classList.add('active')
    openSearchPanel(event);
    (
        async function () {
            const [reviews, frames, solo] = await Promise.all([
                db.getReviews(id),
                db.getFrames(id),
                db.getSoloFilm(id),
            ])
            return {
                reviews,
                frames,
                solo
            }
        }()
    ).then(res => {
            console.log(res);
            const {
                reviews,
                frames,
                solo
            } = res
            const genres = solo.genres.reduce((acc, item) => acc + `${item.genre}, `, '')
            const countries = solo.countries.reduce((acc, item) => acc + `${item.country} `, '')
            let frame = ''
            let review = ''
            frames.items.forEach((item, i) => {
                if (i < 10) frame += `<img src="${item.previewUrl}" alt="" />`
            })
            reviews.items.forEach((item, i) => {
                if (i < 10) {
                    review += `
                    <div class="review__item">
                        <span class="review__name">${item.author}</span>
                        <p class="review__description">${item.description}</p>
                    </div>
                `
                }
            })
            mainSolo.innerHTML = `
            <div class="solo__img">
                <img  src="${solo.posterUrlPreview}"/>
                <a href="#" class="solo__link header__watch">Смотреть фильм</a>
            </div>
            <div class="solo__content">
            <h3 class="solo__title trend__tv-title">${solo.nameRu || solo.nameEn}</h3>
                <ul>
                    <li class="solo__countries">Страна: ${countries} </li>
                    <li class="solo__countries">Жанры: ${genres}</li>
                    <li class="solo__countries">Продолжительность: ${solo.filmLength || ''} мин.</li>
                    <li class="solo__countries">Год: ${solo.year || ''}</li>
                    <li class="solo__countries">Мировая премьера: ${solo.premierWorld || ''}</li>
                    <li class="solo__countries">Возрастной рейтинг: ${solo.ratingAgeLimits || ''}</li>
                    <li class="solo__countries">Слоган: ${solo.slogan || ''}</li>
                    <li class="solo__countries">Описание: ${solo.description || ''}</li>
                </ul>
            </div>
            <h3 class="trend__tv-title solo__title">Кадры из фильма</h3>
            <div class="solo__images">
                ${frame}
            </div>
            <div class="solo__reviews">
                <h3 class="trend__tv-title solo__title">Отзывы</h3>
                ${review}
            </div>
        `
            anime.classList.remove('active')
        })
        .catch(e => {
            anime.classList.remove('active')
            console.log(e);
        })
}

const renderCards = (page = 1, value = '', fn = 'getTopMovies') => {
    mainBlock.innerHTML = ''
    mainSolo.innerHTML = ''
    anime.classList.add('active')
    db[fn](page, value).then(data => {
            if (data.films.length) {
                data.films.forEach(item => {
                    const {
                        nameRu,
                        nameEn,
                        rating,
                        posterUrlPreview,
                        filmId
                    } = item
                    const someItem = document.createElement('div')
                    someItem.classList.add('some__item')
                    someItem.innerHTML = `
                    <div class='some__img'>
                        <img src="${posterUrlPreview}" alt="" />
                        ${rating === 'null' ? '' : `<span class="some__rating">${rating || ''}</span>`}
                    </div>
                    <h3 class="some__title">${nameRu || nameEn}</h3>
                `
                    someItem.addEventListener('click', () => {
                        renderSolo(filmId)
                    })
                    mainBlock.append(someItem)
                })
                if (fn != 'getTopMovies') anime.classList.remove('active')
            } else {
                anime.classList.remove('active')
                mainBlock.innerHTML = `
                    <div class='some__item'>
                        <h3 class="some__title">По вашему запросу ничего не найдено</h3>
                    </div>
                `
            }
        })
        .catch(e => {
            console.log(e);
        })
}

formMain.addEventListener('submit', (e) => {
    e.preventDefault()
    const value = formInput.value
    renderCards(1, value, 'getSearch')
    formInput.value = ''
})

const comingSoon = document.querySelector('.coming__soon-block img')

db.getTopMovies(2).then(res => {
    const r = random(0, res.films.length - 1)
    comingSoon.src = res.films[r].posterUrlPreview
})