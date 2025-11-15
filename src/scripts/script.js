const STORAGE_KEY = 'hw1_posts_v1';
const PROFILE_KEY = 'hw1_profile_v1';

/**
 * Read posts from LocalStorage
 * @returns {Array<{id:string,title:string,content:string,createdAt:number}>}
 */
function readPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

/**
 * Save posts to LocalStorage
 * @param {Array} posts
 */
function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

/**
 * Delete a post by ID
 * @param {string} postId - The ID of the post to delete
 */
function deletePost(postId) {
  const posts = readPosts();
  const filtered = posts.filter(p => p.id !== postId);
  savePosts(filtered);
  renderPosts();
}

/**
 * Creates a new post object and saves it to LocalStorage.
 * @param {string} title - The title of the post.
 * @param {string} content - The content of the post.
 * @returns {object} The created post object.
 */
function createPost(title, content) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const createdAt = Date.now();
  const post = { id, title, content, createdAt };

  const posts = readPosts();
  posts.unshift(post);
  savePosts(posts);

  return post;
}


function getDefaultProfileFromDom() {
  return {
    name: document.getElementById('aboutName')?.textContent?.trim() || '',
    avatar: document.getElementById('aboutAvatar')?.src || '',
    school: document.getElementById('aboutSchool')?.textContent?.trim() || '',
    age: document.getElementById('aboutAge')?.textContent?.trim() || '',
    hobbies: document.getElementById('aboutHobbies')?.textContent?.trim() || ''
  };
}

function formatDate(ts) {
  const date = new Date(ts);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

/**
 * Format age with correct Russian ending
 * @param {number|string} age - The age number
 * @returns {string} Age with correct ending
 */
function formatAge(age) {
  const num = typeof age === 'string' ? parseInt(age.replace(/\D/g, ''), 10) : age;
  if (isNaN(num) || num <= 0) return '';

  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  
  // Special cases: 11, 12, 13, 14 always use "лет"
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${num} лет`;
  }
  
  // Last digit 1 → "год"
  if (lastDigit === 1) {
    return `${num} год`;
  }
  
  // Last digit 2, 3, 4 → "года"
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${num} года`;
  }
  
  // Everything else → "лет"
  return `${num} лет`;
}

function readProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_){
    return null;
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function applyProfileToDom(p) {
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setText('aboutName', p.name);
  const avatarEl = document.getElementById('aboutAvatar');
  if (avatarEl && p.avatar) avatarEl.src = p.avatar;
  setText('aboutSchool', p.school);
  setText('aboutAge', p.age);
  setText('aboutHobbies', p.hobbies);
}

// function openProfileModal() {
//   const modal = document.getElementById('profileModal');
//   const current = readProfile() || getDefaultProfileFromDom();
  
//   // Fill form with current values
//   document.getElementById('profileName').value = current.name || '';
//   document.getElementById('profileAvatar').value = current.avatar || '';
//   document.getElementById('profileSchool').value = current.school || '';
//   document.getElementById('profileAge').value = current.age || '';
//   document.getElementById('profileHobbies').value = current.hobbies || '';
  
//   modal.classList.add('active');
// }

function updateAvatarPreview(avatarUrl) {
  const previewImg = document.getElementById('avatarPreview');
  const placeholder = document.querySelector('.avatar-selector__preview-placeholder');
  
  if (avatarUrl) {
    previewImg.src = avatarUrl;
    previewImg.classList.add('show');
    placeholder.classList.add('hidden');
    document.getElementById('profileAvatar').value = avatarUrl;
  } else {
    previewImg.src = '';
    previewImg.classList.remove('show');
    placeholder.classList.remove('hidden');
    document.getElementById('profileAvatar').value = '';
  }
}

function openProfileModal() {
  const modal = document.getElementById('profileModal');
  const current = readProfile() || getDefaultProfileFromDom();
  
  document.getElementById('profileName').value = current.name || '';
  document.getElementById('profileSchool').value = current.school || '';
  
  const ageNumber = current.age ? parseInt(current.age.replace(/\D/g, ''), 10) : '';
  document.getElementById('profileAge').value = isNaN(ageNumber) ? '' : ageNumber;
  
  document.getElementById('profileHobbies').value = current.hobbies || '';
  
  // Set up avatar preview
  updateAvatarPreview(current.avatar || '');
  
  // Reset avatar inputs
  document.getElementById('profileAvatarUrl').value = '';
  document.getElementById('profileAvatarFile').value = '';
  
  // Reset selected preset avatars
  document.querySelectorAll('.avatar-selector__avatar').forEach(btn => {
    btn.classList.remove('selected');
    if (btn.dataset.avatar === current.avatar) {
      btn.classList.add('selected');
    }
  });
  
  modal.classList.add('active');
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  modal.classList.remove('active');
}

/**
 * Render preset avatars from AVATARS array into the grid
 */
function renderAvatars() {
  const grid = document.getElementById('avatarGrid');
  if (!grid || typeof AVATARS === 'undefined') return;
  
  grid.innerHTML = AVATARS.map((avatarUrl, index) => `
    <button type="button" class="avatar-selector__avatar" data-avatar="${avatarUrl}">
      <img src="${avatarUrl}" alt="Avatar ${index + 1}">
    </button>
  `).join('');
}

function setupProfileEditing() {
  const btn = document.querySelector('.about .icon-btn');
  const modal = document.getElementById('profileModal');
  const form = document.getElementById('profileForm');
  const closeBtn = document.querySelector('.modal__close');
  
  if (!btn || !modal || !form) return;
  
  // Open modal on edit button click
  btn.addEventListener('click', openProfileModal);
  
  // Close modal on X button
  closeBtn.addEventListener('click', closeProfileModal);
  
  // Close modal on overlay click
  document.querySelector('.modal__overlay')?.addEventListener('click', closeProfileModal);
  
  // Avatar selector: Tab switching
  document.querySelectorAll('.avatar-selector__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update active tab
      document.querySelectorAll('.avatar-selector__tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show/hide content
      document.querySelectorAll('.avatar-selector__content').forEach(content => {
        if (content.dataset.content === targetTab) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });
  
  // Avatar selector: Preset avatar selection
  // Use event delegation since avatars are rendered dynamically
  const avatarGrid = document.getElementById('avatarGrid');
  if (avatarGrid) {
    avatarGrid.addEventListener('click', (e) => {
      const avatarBtn = e.target.closest('.avatar-selector__avatar');
      if (!avatarBtn) return;
      
      const avatarUrl = avatarBtn.dataset.avatar;
      
      // Update selected state
      document.querySelectorAll('.avatar-selector__avatar').forEach(btn => btn.classList.remove('selected'));
      avatarBtn.classList.add('selected');
      
      // Update preview
      updateAvatarPreview(avatarUrl);
    });
  }
  
  // Avatar selector: URL input
  const urlInput = document.getElementById('profileAvatarUrl');
  if (urlInput) {
    urlInput.addEventListener('input', () => {
      const url = urlInput.value.trim();
      if (url) {
        updateAvatarPreview(url);
        // Clear selected preset
        document.querySelectorAll('.avatar-selector__avatar').forEach(btn => btn.classList.remove('selected'));
      }
    });
  }
  
  // Avatar selector: File upload
  const fileInput = document.getElementById('profileAvatarFile');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          updateAvatarPreview(dataUrl);
          // Clear selected preset and URL
          document.querySelectorAll('.avatar-selector__avatar').forEach(btn => btn.classList.remove('selected'));
          if (urlInput) urlInput.value = '';
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const ageInput = document.getElementById('profileAge').value.trim();
    const ageNumber = parseInt(ageInput);
    const formattedAge = formatAge(ageNumber);
    
    const profile = {
      name: document.getElementById('profileName').value.trim(),
      avatar: document.getElementById('profileAvatar').value.trim(),
      school: document.getElementById('profileSchool').value.trim(),
      age: formattedAge,
      hobbies: document.getElementById('profileHobbies').value.trim(),
    };
    
    saveProfile(profile);
    applyProfileToDom(profile);
    closeProfileModal();
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeProfileModal();
    }
  });
}

function validateProfileForm() {
  let isValid = true;

  const fields = [
    { id: 'profileName', required: true },
    { id: 'profileSchool', required: true },
    { id: 'profileAge', required: true },
    { id: 'profileHobbies', required: true },
  ];

  fields.forEach(id => {
    const field = document.getElementById(id);

    if (field.value.trim() === '') {
      field.classList.add('error');
      isValid = false;
    } else {
      field.classList.remove('error');
    }
  });

  return isValid;
}

function renderPosts() {
  const grid = document.getElementById('postsGrid');
  const posts = readPosts().sort((a, b) => b.createdAt - a.createdAt);
  if (!grid) return;
  
  if (posts.length === 0) {
    grid.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 40px 20px; margin: 0; grid-column: 1 / -1;">Здесь пока пусто...</p>';
    return;
  }
  
  grid.innerHTML = posts.map((p) => `
    <article class="post-card">
      <div class="post-card__cover"></div>
      <div class="post-card__body">
        <div class="post-card__header">
          <p class="post-card__date">${formatDate(p.createdAt)}</p>
          <button class="post-card__delete" data-post-id="${p.id}" aria-label="Удалить пост">×</button>
        </div>
        <h3 class="post-card__title">${escapeHtml(p.title)}</h3>
        <p class="post-card__text">${escapeHtml(p.content)}</p>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.post-card__delete').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите удалить этот пост?')) {
        deletePost(btn.dataset.postId);
      }
    })
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setupForm() {
  const form = document.getElementById('postForm');
  const titleInput = document.getElementById('titleInput');
  const contentInput = document.getElementById('contentInput');
  if (!form) return;
  
  // Remove error class only when user types actual content (not just spaces)
  titleInput.addEventListener('input', () => {
    if (titleInput.value.trim().length > 0) {
      titleInput.classList.remove('error');
    }
  });
  
  contentInput.addEventListener('input', () => {
    if (contentInput.value.trim().length > 0) {
      contentInput.classList.remove('error');
    }
  });
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    // Remove previous errors
    titleInput.classList.remove('error');
    contentInput.classList.remove('error');
    
    // Check and mark errors
    let hasError = false;
    if (!title) {
      titleInput.classList.add('error');
      hasError = true;
    }
    if (!content) {
      contentInput.classList.add('error');
      hasError = true;
    }
    
    // Don't submit if there are errors
    if (hasError) {
      // Focus on first error field
      if (!title) {
        titleInput.focus();
      } else if (!content) {
        contentInput.focus();
      }
      return;
    }
    
    // Submit if valid
    const posts = readPosts();
    posts.push({ id: crypto.randomUUID(), title, content, createdAt: Date.now() });
    savePosts(posts);
    titleInput.value = '';
    contentInput.value = '';
    renderPosts();
    contentInput.blur();
  });
}

// Bootstrap
setupForm();
renderPosts();
renderAvatars();

const savedProfile = readProfile();
applyProfileToDom(savedProfile || {
  name: 'Фамилия Имя Отчество',
  avatar: 'https://i.pravatar.cc/96?img=12',
  school: 'НИУ ВШЭ МИЭМ',
  age: '52',
  hobbies: 'Что-то'
});
setupProfileEditing();
