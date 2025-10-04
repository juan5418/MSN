const API = '/api/news';

let allNews = [];

// Fonctions utilitaires
function safeParseTags(s) {
  return s.split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

// Charger les news depuis le serveur
async function fetchNews() {
  const resp = await fetch(API);
  if (resp.ok) {
    allNews = await resp.json();
    renderMobileView();
    checkBreaking();
  } else {
    console.error('Erreur fetch news', resp.status);
  }
}

// Afficher la vue mobile
function renderMobileView() {
  if (allNews.length === 0) {
    document.getElementById('main-title').innerText = 'Pas de news';
    return;
  }
  // Une principale (premier élément)
  const main = allNews[0];
  const imgEl = document.getElementById('main-img');
  imgEl.src = main.imageUrl || '';
  document.getElementById('main-title').innerText = main.title;

  // Cliquer glisser : vers la gauche → article complet, vers la droite → revenir
  // On va écouter les events de swipe
  addSwipeListeners(document.getElementById('main-article'), () => {
    openArticle(main.id);
  }, () => {
    // revenir — ici, on ne fait rien (on reste)
  });

  // Autres news
  const container = document.getElementById('other-news');
  container.innerHTML = '';
  for (let i = 1; i < allNews.length; i++) {
    const item = allNews[i];
    const div = document.createElement('div');
    div.className = 'news-item';
    const img = document.createElement('img');
    img.src = item.imageUrl || '';
    const info = document.createElement('div');
    info.className = 'info';
    if (item.tags && item.tags.length > 0) {
      const tagspan = document.createElement('span');
      tagspan.className = 'tag';
      tagspan.innerText = item.tags[0];  // on ne affiche que le premier tag ici
      info.appendChild(tagspan);
    }
    const tit = document.createElement('div');
    tit.innerText = item.title;
    const summ = document.createElement('div');
    summ.innerText = item.summary || '';
    info.appendChild(tit);
    info.appendChild(summ);
    div.appendChild(img);
    div.appendChild(info);

    // Swipe sur cet item
    addSwipeListeners(div, () => {
      openArticle(item.id);
    }, () => {
      // swipe vers droite → revenir
    });

    container.appendChild(div);
  }
}

// Ouvre l’article complet (tu peux faire une “page” article ou modal)
function openArticle(id) {
  const art = allNews.find(n => n.id === id);
  if (!art) return;
  // Par simplicité, on peut remplacer la vue mobile par l’article complet
  const html = `
    <div style="padding: 20px;">
      <h1>${art.title}</h1>
      ${art.imageUrl ? `<img src="${art.imageUrl}" style="max-width:100%;" />` : ''}
      ${art.imageUrl2 ? `<img src="${art.imageUrl2}" style="max-width:100%;" />` : ''}
      <p>${art.content}</p>
      <button id="btn-back">Retour</button>
    </div>
  `;
  const body = document.body;
  body.innerHTML = html;
  document.getElementById('btn-back').onclick = () => {
    location.reload();
  };
}

// Ajoute les listeners de “swipe” gauche / droite
function addSwipeListeners(el, onLeftSwipe, onRightSwipe) {
  let startX = null;
  el.addEventListener('touchstart', (ev) => {
    startX = ev.touches[0].clientX;
  });
  el.addEventListener('touchend', (ev) => {
    if (startX === null) return;
    const endX = ev.changedTouches[0].clientX;
    const dx = endX - startX;
    if (dx < -50) {
      onLeftSwipe();
    } else if (dx > 50) {
      onRightSwipe();
    }
    startX = null;
  });
}

// Vérifier breaking news : si la première est de type “breaking”, alerter
function checkBreaking() {
  if (allNews.length > 0 && allNews[0].type === 'breaking') {
    alert('Breaking news: ' + allNews[0].title + ' — ' + allNews[0].summary);
  }
}

// === Partie éditeur ===

const EDIT_CODE = 'MSN';

function setupEditor() {
  const loginBtn = document.getElementById('editor-login-btn');
  loginBtn.onclick = () => {
    const v = document.getElementById('editor-code').value;
    if (v === EDIT_CODE) {
      document.getElementById('editor-login').style.display = 'none';
      document.getElementById('editor-main').style.display = 'block';
    } else {
      alert('Code incorrect');
    }
  };

  document.getElementById('btn-new-news').onclick = () => {
    showForm('new');
  };
  document.getElementById('btn-two-image-news').onclick = () => {
    showForm('two');
  };
  document.getElementById('btn-breaking-news').onclick = () => {
    showForm('breaking');
  };

  document.getElementById('submit-news').onclick = async () => {
    const title = document.getElementById('input-title').value;
    const summary = document.getElementById('input-summary').value;
    const content = document.getElementById('input-content').value;
    const img1 = document.getElementById('input-image1').value;
    const img2 = document.getElementById('input-image2').value;
    const tags = safeParseTags(document.getElementById('input-tags').value);

    let endpoint = '/api/news';
    let body = { title, summary, content, imageUrl: img1, tags };
    if (img2) {
      body.imageUrl2 = img2;
    }
    if (currentFormType === 'breaking') {
      endpoint = '/api/breaking';
      body = { title, summary };
    }
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (resp.ok) {
      alert('News créée');
      location.reload();
    } else {
      alert('Erreur création');
    }
  };
}

let currentFormType = 'new';
function showForm(type) {
  currentFormType = type;
  document.getElementById('form-news').style.display = 'block';
  const h = document.getElementById('form-title');
  if (type === 'new') {
    h.innerText = 'Créer une news';
  } else if (type === 'two') {
    h.innerText = 'Créer une news avec deux images';
  } else if (type === 'breaking') {
    h.innerText = 'Créer une breaking news';
  }
}

// Init
window.onload = () => {
  fetchNews();
  setupEditor();
};
