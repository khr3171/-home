import { firebaseConfig, appCheckSiteKey } from './firebase-config.js';
import { compressPhoto } from './compress.js';
const $ = id => document.getElementById(id);
const say = (id, message, error = false) => { $(id).textContent = message; $(id).classList.toggle('error', error); };
const element = (tag, text, className) => { const el = document.createElement(tag); if (text) el.textContent = text; if (className) el.className = className; return el; };
const date = time => new Date(time).toLocaleDateString('ko-KR');
const kb = bytes => `${(bytes / 1024).toFixed(1)}KB`;
const configured = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId'].every(key => firebaseConfig[key]);
let sdk, db, auth, user, admin = false, compressed, fileVersion = 0, photoCursor, questionCursor, questionEpoch = 0, photoEpoch = 0;
const imageCache = new Map();
const page = document.body.dataset.page;
function errorText(error) {
  const code = error?.code || '';
  if (code.includes('popup-closed')) return '로그인 창이 닫혔어요. 다시 눌러 주세요.';
  if (code.includes('popup-blocked')) return '팝업이 차단됐어요. 이 사이트의 팝업을 허용해 주세요.';
  if (code.includes('unauthorized-domain')) return 'Firebase Authentication의 승인된 도메인에 현재 홈페이지 주소를 추가해 주세요.';
  if (code.includes('operation-not-allowed') || code.includes('admin-restricted-operation')) return '익명 등록이 아직 준비되지 않았어요. 관리자: Firebase Authentication에서 익명(Anonymous) 로그인을 켜 주세요.';
  if (code.toLowerCase().includes('permission')) return '접근 권한이 없어요. 로그인 상태와 Firebase 보안 규칙을 확인해 주세요.';
  if (code.includes('network')) return '인터넷 연결을 확인하고 다시 시도해 주세요.';
  return '처리하지 못했어요. 인터넷 연결과 Firebase 설정을 확인한 뒤 다시 시도해 주세요.';
}
function action(text, handler, className = 'button light') {
  const button = element('button', text, className); button.type = 'button';
  button.addEventListener('click', async () => { button.disabled = true; try { await handler(); } catch (error) { alert(errorText(error)); } finally { button.disabled = false; } }); return button;
}
async function start() {
  if (!configured) {
    say('setup-status', '게시판을 준비하고 있어요.\n관리자: firebase-config.js에 Firebase 웹 앱 설정을 입력하고, 안내서대로 보안 규칙과 로그인을 설정해 주세요.');
    say('photos-status', 'Firebase 연결 후 활동 사진이 표시됩니다.');
    say('questions-status', 'Firebase 연결 후 질문과 답변을 이용할 수 있어요.'); return;
  }
  try {
    const base = 'https://www.gstatic.com/firebasejs/13.1.0/';
    const [appSDK, authSDK, databaseSDK] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-database.js')]);
    sdk = { ...authSDK, ...databaseSDK };
    const app = appSDK.initializeApp(firebaseConfig);
    if (appCheckSiteKey) {
      const check = await import(base + 'firebase-app-check.js');
      check.initializeAppCheck(app, { provider: new check.ReCaptchaEnterpriseProvider(appCheckSiteKey), isTokenAutoRefreshEnabled: true });
    }
    db = sdk.getDatabase(app); auth = sdk.getAuth(app);
    await sdk.setPersistence(auth, sdk.browserLocalPersistence);
    $('login').disabled = false;
    $('refresh-photos').disabled = false; $('refresh-questions').disabled = false;
    say('setup-status', '사진은 작게 압축해 저장하고, 질문은 필요한 내용만 보관합니다.');
    sdk.onAuthStateChanged(auth, async current => {
      user = current; admin = false; const uid = current?.uid;
      // 이전 계정의 비공개 내용을 즉시 화면에서 제거합니다.
      questionEpoch++; $('question-list').replaceChildren();
      $('question-fields').disabled = true; $('upload-fields').disabled = true;
      if (!current) {
        $('login').hidden = false; $('logout').hidden = true;
        $('account-status').textContent = '익명 이용 준비 중';
        $('question-filter').options[1].disabled = true; $('question-filter').options[2].disabled = true;
        $('question-filter').value = 'public';
        await Promise.all([loadPhotos(), loadQuestions()]);
        if (auth.currentUser) return;
        try { await sdk.signInAnonymously(auth); }
        catch (error) { say('setup-status', errorText(error), true); }
        return;
      }
      if (!current.isAnonymous) {
        try { const record = await sdk.get(sdk.ref(db, `admins/${uid}`)); if (user?.uid !== uid) return; admin = record.val() === true; }
        catch { say('auth-status', '관리자 권한을 확인하지 못했어요. Firebase 보안 규칙을 확인해 주세요.', true); }
      }
      if (user?.uid !== uid) return;
      $('login').hidden = !user.isAnonymous; $('logout').hidden = user.isAnonymous;
      $('account-status').textContent = user.isAnonymous ? '익명으로 이용 중' : `${user.displayName || '사용자'} · ${admin ? '관리자' : '일반 사용자'}`;
      $('question-fields').disabled = false; $('upload-fields').disabled = false;
      $('question-filter').options[1].disabled = !user; $('question-filter').options[2].disabled = !admin;
      $('question-filter').value = admin ? 'all' : user ? 'mine' : 'public';
      say('question-status', '로그인 절차 없이 질문을 남길 수 있어요. 답변은 관리자만 작성합니다.');
      await Promise.all([loadPhotos(), loadQuestions()]);
    });
  } catch (error) { say('setup-status', errorText(error), true); }
}
$('login').addEventListener('click', async () => {
  $('login').disabled = true; say('auth-status', '로그인 창에서 Google 계정을 선택해 주세요.');
  try { await sdk.signInWithPopup(auth, new sdk.GoogleAuthProvider()); say('auth-status', '로그인했어요.'); }
  catch (error) { say('auth-status', errorText(error), true); }
  finally { $('login').disabled = false; }
});
$('logout').addEventListener('click', async () => {
  try { await sdk.signOut(auth); say('auth-status', '로그아웃했어요.'); } catch (error) { say('auth-status', errorText(error), true); }
});
$('photo-file').addEventListener('change', async () => {
  const version = ++fileVersion; compressed = null; $('publish-photo').disabled = true; $('photo-preview').hidden = true;
  const file = $('photo-file').files[0]; if (!file) return;
  say('compression-status', '사진 용량을 줄이고 있어요…');
  try {
    const result = await compressPhoto(file); if (version !== fileVersion) return; compressed = result;
    $('photo-preview').src = result.dataUrl; $('photo-preview').hidden = false;
    say('compression-status', `원본 ${kb(file.size)} → 압축 ${kb(result.bytes)} · ${result.width} × ${result.height}px\nDB 사진 데이터 약 ${kb(result.dataUrl.length)} (문자열 변환 포함). 원본은 업로드하지 않습니다.`);
    $('publish-photo').disabled = false;
  } catch (error) { if (version === fileVersion) say('compression-status', error.message || '사진을 읽을 수 없어요.', true); }
});
$('upload-form').addEventListener('submit', async event => {
  event.preventDefault(); if (!user || !compressed) return;
  const title = $('photo-title').value.trim(); if (!title) return say('upload-status', '사진 제목을 적어 주세요.', true);
  const button = $('publish-photo'); button.disabled = true;
  const pending = compressed;
  try {
    const id = `${sdk.push(sdk.ref(db, 'photos')).key}_${user.uid}`;
    const metadata = { owner: user.uid, title, description: $('photo-description').value.trim(), createdAt: sdk.serverTimestamp(), bytes: pending.bytes, width: pending.width, height: pending.height };
    await sdk.update(sdk.ref(db), { [`photos/${id}`]: metadata, [`photoData/${id}`]: pending.dataUrl });
    $('upload-form').reset(); fileVersion++; compressed = null; $('photo-preview').hidden = true;
    say('upload-status', '사진을 게시했어요.'); say('compression-status', '다음 사진을 선택해 주세요.'); await loadPhotos();
  } catch (error) { say('upload-status', errorText(error), true); }
  finally { button.disabled = !compressed; }
});
async function loadPhotos(append = false) {
  if (!db || page === 'questions') return;
  const epoch = ++photoEpoch; $('more-photos').disabled = true;
  if (!append) { photoCursor = null; $('photo-list').replaceChildren(); }
  say('photos-status', '사진 목록을 불러오는 중…');
  try {
    const constraints = [sdk.orderByKey(), sdk.limitToLast(12)]; if (append && photoCursor) constraints.push(sdk.endBefore(photoCursor));
    const snapshot = await sdk.get(sdk.query(sdk.ref(db, 'photos'), ...constraints)); if (epoch !== photoEpoch) return;
    const rows = []; snapshot.forEach(child => rows.push([child.key, child.val()])); photoCursor = rows[0]?.[0];
    for (const [id, record] of rows.reverse()) {
      const card = element('article', '', 'photo-card'); const img = element('img'); img.alt = record.description || record.title; img.loading = 'lazy'; img.width = record.width; img.height = record.height;
      const body = element('div', '', 'card-body'); body.append(element('h3', record.title), element('p', record.description), element('p', `${date(record.createdAt)} · ${kb(record.bytes)}`, 'meta'));
      const imageStatus = element('p', '', 'meta'); body.append(imageStatus);
      let loading = false;
      const fetchImage = async () => {
        if (loading) return; loading = true;
        try {
          let data = imageCache.get(id); if (!data) { const image = await sdk.get(sdk.ref(db, `photoData/${id}`)); data = image.val(); }
          if (typeof data !== 'string' || !/^data:image\/(webp|jpeg);base64,[A-Za-z0-9+/=]+$/.test(data)) throw new Error('image');
          imageCache.set(id, data); if (imageCache.size > 48) imageCache.delete(imageCache.keys().next().value);
          img.src = data; imageStatus.textContent = ''; retry.hidden = true;
        } catch { imageStatus.textContent = '사진을 불러오지 못했어요.'; retry.hidden = false; } finally { loading = false; }
      };
      const retry = action('사진 다시 불러오기', fetchImage); retry.hidden = true; body.append(retry);
      if (admin || user?.uid === record.owner) body.append(action('사진 삭제', async () => {
        if (!confirm('이 사진을 영구 삭제할까요? 복구할 수 없어요.')) return;
        await sdk.update(sdk.ref(db), { [`photos/${id}`]: null, [`photoData/${id}`]: null }); imageCache.delete(id); await loadPhotos();
      }, 'button light danger'));
      card.append(img, body); $('photo-list').append(card);
      // 화면 근처에 온 사진만 다운로드합니다. metadata 목록 조회에 이미지 문자열은 포함하지 않습니다.
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); void fetchImage(); } }, { rootMargin: '150px' }); observer.observe(card);
      } else { void fetchImage(); }
    }
    $('more-photos').hidden = rows.length < 12;
    say('photos-status', $('photo-list').children.length ? '사진을 12장씩 불러옵니다.' : '아직 올라온 사진이 없어요.');
  } catch (error) { if (epoch === photoEpoch) say('photos-status', errorText(error), true); }
  finally { if (epoch === photoEpoch) $('more-photos').disabled = false; }
}
$('question-form').addEventListener('submit', async event => {
  event.preventDefault(); if (!user) return;
  const title = $('question-title').value.trim(), body = $('question-body').value.trim();
  if (!title || !body) return say('question-status', '제목과 질문 내용을 적어 주세요.', true);
  $('question-fields').disabled = true;
  try {
    await sdk.set(sdk.push(sdk.ref(db, 'questions')), { title, body, owner: user.uid, isPublic: $('question-public').checked, createdAt: sdk.serverTimestamp() });
    $('question-form').reset(); say('question-status', '질문을 등록했어요. ‘내 질문’에서 답변을 확인해 주세요.');
    $('question-filter').value = 'mine'; await loadQuestions();
  } catch (error) { say('question-status', errorText(error), true); }
  finally { $('question-fields').disabled = !user; }
});
async function loadQuestions(append = false) {
  if (!db || page === 'gallery') return;
  const epoch = ++questionEpoch; const mode = $('question-filter').value;
  if (!append) { questionCursor = null; $('question-list').replaceChildren(); }
  $('more-questions').hidden = true; $('more-questions').disabled = true;
  say('questions-status', '질문을 불러오는 중…');
  try {
    let constraints;
    if (mode === 'mine' && user) constraints = [sdk.orderByChild('owner'), sdk.equalTo(user.uid), sdk.limitToLast(20)];
    else if (mode === 'all' && admin) { constraints = [sdk.orderByKey(), sdk.limitToLast(20)]; if (append && questionCursor) constraints.push(sdk.endBefore(questionCursor)); }
    else constraints = [sdk.orderByChild('isPublic'), sdk.equalTo(true), sdk.limitToLast(20)];
    const snapshot = await sdk.get(sdk.query(sdk.ref(db, 'questions'), ...constraints)); if (epoch !== questionEpoch) return;
    const rows = []; snapshot.forEach(child => rows.push([child.key, child.val()])); questionCursor = rows[0]?.[0];
    for (const [id, record] of rows.reverse()) {
      const card = element('details', '', 'question-card');
      card.append(element('summary', `${record.answer ? '답변 완료' : '답변 대기'} · ${record.title}`), element('p', `${record.isPublic ? '공개' : '비공개'} · ${date(record.createdAt)}`, 'meta'), element('p', record.body, 'question-text'));
      if (record.answer) { const box = element('div', '', 'answer-box'); box.append(element('strong', '관리자 답변'), element('p', record.answer.body, 'answer-text'), element('p', date(record.answer.updatedAt), 'meta')); card.append(box); }
      if (admin) {
        const form = element('form'); const label = element('label', '관리자 답변 (최대 2,000자)'); const input = element('textarea');
        input.id = `answer-${id}`; label.htmlFor = input.id; input.maxLength = 2000; input.rows = 4; input.required = true; input.value = record.answer?.body || '';
        const save = element('button', '답변 저장', 'button primary'); save.type = 'submit'; const status = element('p'); status.setAttribute('role', 'status');
        form.append(label, input, save, status); form.addEventListener('submit', async event => {
          event.preventDefault(); if (!input.value.trim()) return; save.disabled = true;
          try { await sdk.set(sdk.ref(db, `questions/${id}/answer`), { body: input.value.trim(), updatedAt: sdk.serverTimestamp() }); status.textContent = '답변을 저장했어요.'; await loadQuestions(); }
          catch (error) { status.textContent = errorText(error); } finally { save.disabled = false; }
        }); card.append(form);
      }
      if (admin || user?.uid === record.owner) card.append(action('질문 삭제', async () => {
        if (!confirm('질문과 답변을 영구 삭제할까요? 복구할 수 없어요.')) return;
        await sdk.remove(sdk.ref(db, `questions/${id}`)); await loadQuestions();
      }, 'button light danger'));
      $('question-list').append(card);
    }
    $('more-questions').hidden = !(mode === 'all' && rows.length === 20);
    say('questions-status', $('question-list').children.length ? (mode === 'all' ? '질문을 20개씩 불러옵니다.' : '최근 질문 20개까지 표시합니다.') : '아직 등록된 질문이 없어요.');
  } catch (error) { if (epoch === questionEpoch) say('questions-status', errorText(error), true); }
  finally { if (epoch === questionEpoch) $('more-questions').disabled = false; }
}
$('refresh-photos').addEventListener('click', () => loadPhotos());
$('more-photos').addEventListener('click', () => loadPhotos(true));
$('refresh-questions').addEventListener('click', () => loadQuestions());
$('more-questions').addEventListener('click', () => loadQuestions(true));
$('question-filter').addEventListener('change', () => loadQuestions());
void start();
