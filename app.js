function customHttp() {
return {
    get(url, cb){
        try{
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.addEventListener('load', () => {
                if(Math.floor(xhr.status / 100)!== 2){
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                    return;
                }
                const response = JSON.parse(xhr.responseText);
                cb(null, response);
            });

            xhr.addEventListener('error', () =>{
                cb(`Error. Status code: ${xhr.status}`, xhr);
            });
            xhr.send();
        } catch (error) {
            cb(error);
        }

    },
    post(url, body, headers, cb){
        try{
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url);
            xhr.addEventListener('load', () => {
                if(Math.floor(xhr.status/100) !== 2){
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                    return;
                }
                const response = JSON.parse(xhr.responseText);
                cb(null, response);
            });

            xhr.addEventListener('error', ()=>{
                cb(`Error Status code: ${xhr.status}`, xhr);
            });

            if (headers) {
                Object.entries(headers).forEach(([key, value]) =>{
                    xhr.setRequestHeader(key, value);
                });
            }
            xhr.send(JSON.stringify(body));
        } catch(error) {
            cb(error);
        }
    },
};

}

const http = customHttp();

const newsService = (function() {
const apikey = 'b86cfa37b07c4930b0dd5ab3a764d692';
const apiUrl = 'https://news-api-v2.herokuapp.com';

return {
topHeadlines(query, country = 'us', cb) {
    http.get(`${apiUrl}/top-headlines?country=${country}&category=${query}&apiKey=${apikey}`, cb);
},
everything(query, cb) {
    http.get(`${apiUrl}/everything?q=${query}&apiKey=${apikey}`, cb);
},

categoryNews(query, cb){
    http.get(`${apiUrl}/everything?q=${query}&apiKey=${apikey}`, cb);
}


};
})();

//elements

const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];
const categorySelect = form.elements['category'];

form.addEventListener('submit', (e) =>{
e.preventDefault();
loadNews();


});


document.addEventListener('DOMContentLoaded', function() {
M.AutoInit();
loadNews();
});

//Load news function

function loadNews(){

    showLoader();
    const country = countrySelect.value;
    const searchText = searchInput.value;
    const category = categorySelect.value;
   
    
    
     if(!searchText){

         newsService.topHeadlines(category,country, onGetResponse);
    

      }else{

         newsService.everything(searchText, onGetResponse);
      }


    }

//function on get response from server
function onGetResponse(err, res){
    removePreloader();
  if(err){
      showAlert(err, 'error-msg');
      return;
  }
  if(!res.articles.length){
//show empty message
return;

  }
    renderNews(res.articles);

}

// function render news

function renderNews(news) {

const newsContainer = document.querySelector('.news-container .row');
if(newsContainer.children.length){
    ClearContainer(newsContainer);
}
let fragment = '';
news.forEach(newsItem => {
const el = newsTemplate(newsItem);
fragment += el;
});

newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

//function clear container
function ClearContainer(container){ 
let child = container.lastElementChild;
while (child) {
    container.removeChild(child);
    child = container.lastElementChild;

}

}

//News item template funtion
function newsTemplate({urlToImage, title, url, description}){

if(!urlToImage){

return`
<div class="col s12">
<div class="card">
<div class ="card-image">
<img src="not_found.jpg" height="690">
<span class="card-title">${title || ''}</span>
</div>
<div class="card-content">
<p>${description || ''}</p>
</div>
<div class="card-action">
<a href="${url}">Read more</a>
</div>
</div>
</div>
`;
}else{
    return`
    <div class="col s12">
    <div class="card">
    <div class ="card-image">
    <img src="${urlToImage}">
    <span class="card-title">${title || ''}</span>
    </div>
    <div class="card-content">
    <p>${description || ''}</p>
    </div>
    <div class="card-action">
    <a href="${url}">Read more</a>
    </div>
    </div>
    </div>
    `;
}

}

function showAlert(msg, type = 'success') {
M.toast({html: msg, classes: type});

}

//show loader function
function showLoader(){
    document.body.insertAdjacentHTML('afterbegin', 
    ` 
     <div class="progress">
    <div class="indeterminate"></div>
</div>
      `,
      );
}


//remove loader function 
function removePreloader() {
    const loader = document.querySelector('.progress');
    if(loader){

        loader.remove();
    }
}