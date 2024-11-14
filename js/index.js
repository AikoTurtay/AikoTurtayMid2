const apiKey = '9185c234296cd5518e77f5fe5c018193';

const searchBtn = document.getElementById('search-btn');
const movieSearch = document.getElementById('movie-search');
const movieResults = document.getElementById('movie-results');
const popularMoviesList = document.getElementById('popular-movies-list');

// Initialize favorite movies from localStorage
let favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
}

// Toggle favorite status
function toggleFavorite(movie) {
    const index = favoriteMovies.findIndex(fav => fav.id === movie.id);
    if (index > -1) {
        favoriteMovies.splice(index, 1);
    } else {
        favoriteMovies.push(movie);
    }
    saveFavorites();
    displayMovies(favoriteMovies, "Favorite Movies");
}

document.addEventListener('DOMContentLoaded', fetchPopularMovies);

searchBtn.addEventListener('click', () => {
    const query = movieSearch.value.trim();
    if (query) {
        fetchMovies(query);
    }
});

movieSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = movieSearch.value.trim();
        if (query) {
            fetchMovies(query);
        }
    }
});

async function fetchPopularMovies() {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results, 'Popular Movies');
    } catch (error) {
        console.error('Error fetching popular movies:', error);
    }
}

async function fetchMovies(query) {
    if (!query.trim()) return;

    const url = `https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${apiKey}&language=en-US`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results, `Search Results for: "${query}"`);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

async function fetchMoviesByGenre(genreId) {
    resetResults();

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&with_genres=${genreId}&page=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results, 'Movies by Genre');
    } catch (error) {
        console.error('Error fetching movies by genre:', error);
    }
}

async function fetchMovieDetails(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        showMovieDetails(data);
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

async function fetchMovieCredits(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.cast.slice(0, 5).map(actor => actor.name).join(', ');
    } catch (error) {
        console.error('Error fetching movie credits:', error);
        return 'No cast information available';
    }
}

async function showMovieDetails(movie) {
    const cast = await fetchMovieCredits(movie.id);

    movieResults.innerHTML = `
        <h2>${movie.title}</h2>
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
        <p><strong>Description:</strong> ${movie.overview}</p>
        <p><strong>Rating:</strong> ${movie.vote_average}</p>
        <p><strong>Release Date:</strong> ${movie.release_date}</p>
        <p><strong>Cast:</strong> ${cast}</p>
        <button onclick="fetchPopularMovies()">Back to Popular Movies</button>
    `;
}

function resetResults() {
    movieResults.innerHTML = '';
}

function displayMovies(movies, title = 'Search Results') {
    resetResults();
    movieResults.innerHTML = `<h2>${title}</h2>`;
    if (movies.length === 0) {
        movieResults.innerHTML += '<p>No movies found.</p>';
        return;
    }

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.addEventListener('click', () => fetchMovieDetails(movie.id));

        const movieImg = document.createElement('img');
        movieImg.src = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/150';
        movieImg.alt = movie.title;

        const movieInfo = document.createElement('div');
        movieInfo.classList.add('movie-info');

        const movieTitle = document.createElement('h3');
        movieTitle.textContent = movie.title;

        const movieOverview = document.createElement('p');
        movieOverview.textContent = movie.overview ? movie.overview.slice(0, 200) + '...' : 'No description available.';

        const movieRating = document.createElement('p');
        movieRating.textContent = `Rating: ${movie.vote_average}`;

        const favoriteBtn = document.createElement('button');
        favoriteBtn.textContent = favoriteMovies.some(fav => fav.id === movie.id) ? '❤️' : '♡';
        favoriteBtn.classList.add('favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(movie);
            favoriteBtn.textContent = favoriteMovies.some(fav => fav.id === movie.id) ? '❤️' : '♡';
        });

        movieInfo.appendChild(movieTitle);
        movieInfo.appendChild(movieOverview);
        movieInfo.appendChild(movieRating);
        movieInfo.appendChild(favoriteBtn);
        movieCard.appendChild(movieImg);
        movieCard.appendChild(movieInfo);

        movieResults.appendChild(movieCard);
    });
}

