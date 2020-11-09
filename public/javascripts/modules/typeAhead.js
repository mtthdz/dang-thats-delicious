// we stick with using es6 on the front end
// but use common js in the backend because nodeJS doesn't have es6 modules
// webpack will however convert all js files to common js 
import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `;
  }).join('');
}

function typeAhead(search) {
  // if search isn't on page, don't run fn
  if(!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function() {
    // if no value, quit
    if(!this.value) {
      searchResults.style.display = 'none';
      return; // stop
    }

    // show search results
    searchResults.style.display = 'block';
    // this will default results as blank unless array is returned
    searchResults.innerHTML = '';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if(res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
          return;
        }

        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results for ${this.value} found!</div>`);
      })
      .catch(err => {
        console.error(err);
      });
  });

  // handle keyboard inputs
  searchInput.on('keyup', (e) => {
    // if they aren't pressing up, down, or enter, do nothing
    if(![38, 40, 13].includes(e.keyCode)) {
      return;
    }

    const activeClass= 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    // not a const because we'll be updating this
    let next; 
    // switch case?
    if(e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) {
      next = items[items.length - 1]
    } else if (e.keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    }

    if(current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);


  })
}

export default typeAhead;