// ===== CONFIG =====
// GROQ_API_KEY is handled by backend — no key needed in frontend
// Model config is in backend

const SYSTEM_PROMPT = `You are KisanAI — a smart agriculture assistant.

LANGUAGE RULE (STRICT):
- Hindi/Hinglish question → SIRF HINDI SCRIPT (Devanagari) mein jawab do. Roman Hindi NAHI.
- English question → English mein jawab do
- Jo language user ki, wohi teri — kabhi mat badlo

SABSE ZAROORI RULE — SIRF UTNA BATAO JO PUCHHA JAYE:

User ne sirf naam puchha → sirf naam batao, kuch aur mat batao
User ne disease puchhi → sirf disease batao
User ne poora diagnosis manga → tab poora format use karo
User ne general question puchha → seedha simple jawab do

EXAMPLES:
Q: "is plant ka naam kya hai?" → "यह टमाटर का पौधा है।" (bas itna)
Q: "isme kya bimari hai?" → "इसमें अर्ली ब्लाइट रोग है।" (bas itna)
Q: "poori detail batao" → tab poora format use karo
Q: "ilaj batao" → sirf ilaj batao, baki kuch nahi
Q: "aaj ka mausam kaisa hai?" → मौसम ke baare mein jawab do
Q: "hello" → greet karo

POORA FORMAT — sirf tab jab user ne sab manga ho:
पौधा: [naam]
समस्या: [kya hai]
कारण: [kyun]
देसी उपाय: [solution]
दवाई: [dose ke saath]
बचाव: [tips]

TONE: Koi emoji nahi. Koi bhai/yaar nahi. Simple, seedha, clear.
Hamesha chhota jawab prefer karo — user ne jo manga wohi do, zyada nahi.`;

// ===== STATE =====
var uploadedImageDesc = '';
var chatHistory       = [];
var isSpeaking        = false;
var isMuted           = false;
var isRecording       = false;
var recognition       = null;
var currentUtterance  = null;
var cameraStream      = null;
var cameraActive      = false;

// ===== STOP SPEECH =====
function stopAllSpeech() {
  window.speechSynthesis.cancel();
  isSpeaking       = false;
  currentUtterance = null;
  updateSpeakingUI(false);
}

function updateSpeakingUI(speaking) {
  var btn = document.getElementById('muteBtn');
  if (!btn) return;
  if (isMuted) {
    btn.textContent      = '🔇';
    btn.style.background = '';
    btn.style.color      = '';
  } else if (speaking) {
    btn.textContent      = '⏹️';
    btn.style.background = '#c62828';
    btn.style.color      = 'white';
  } else {
    btn.textContent      = '🔊';
    btn.style.background = '';
    btn.style.color      = '';
  }
}

// ===== DETECT LANGUAGE =====
function detectLang(text) {
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa-IN';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
  if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN';
  return 'en-US';
}

// ===== SPEAK =====
function speak(text) {
  stopAllSpeech();
  if (isMuted) return;

  var clean = text
    .replace(/[*#_]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n+/g, '. ')
    .replace(/[╔╗╚╝║═]/g, '')
    .trim()
    .slice(0, 400);

  if (!clean) return;

  var lang         = detectLang(clean);
  currentUtterance = new SpeechSynthesisUtterance(clean);
  currentUtterance.lang  = lang;
  currentUtterance.rate  = 0.9;
  currentUtterance.pitch = 1.05;

  var voices = window.speechSynthesis.getVoices();
  for (var i = 0; i < voices.length; i++) {
    if (voices[i].lang.indexOf(lang.split('-')[0]) !== -1) {
      currentUtterance.voice = voices[i];
      break;
    }
  }

  currentUtterance.onstart = function() { isSpeaking = true;  updateSpeakingUI(true);  };
  currentUtterance.onend   = function() { isSpeaking = false; updateSpeakingUI(false); };
  currentUtterance.onerror = function() { isSpeaking = false; updateSpeakingUI(false); };

  window.speechSynthesis.speak(currentUtterance);
}

function toggleMute() {
  isMuted = !isMuted;
  if (isMuted) stopAllSpeech();
  updateSpeakingUI(isSpeaking);
}

// ===== SEND MESSAGE =====
function sendMessage() {
  var input = document.getElementById('messageInput');
  var text  = input.value.trim();
  if (!text) return;

  stopAllSpeech();
  appendMessage('user', text);
  input.value = '';
  autoResize(input);

  var imageDesc   = uploadedImageDesc;
  clearImageAttachment();

  var userContent = text;
  if (imageDesc) userContent += '\n\nImage mein dekha: ' + imageDesc;

  chatHistory.push({ role: 'user', content: userContent });
  showTyping();
  document.getElementById('sendBtn').disabled = true;

  callGroq(chatHistory).then(function(answer) {
    hideTyping();
    chatHistory.push({ role: 'assistant', content: answer });
    appendMessage('bot', answer);
    speak(answer);
    document.getElementById('sendBtn').disabled = false;
  }).catch(function(err) {
    hideTyping();
    appendMessage('bot', '❌ ' + err.message);
    document.getElementById('sendBtn').disabled = false;
  });
}

// ===== GROQ API — Backend Se (Safe for Replit/Production) =====
function callGroq(history) {
  // Get last user message
  var lastMsg = history[history.length - 1];
  var question = lastMsg ? lastMsg.content : '';

  return fetch('/api/chatbot/ask', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question:          question,
      image_description: '',
      history:           history.slice(0, -1) // send history without last msg
    })
  }).then(function(res) {
    if (!res.ok) throw new Error('Server error ' + res.status);
    return res.json();
  }).then(function(data) {
    if (!data.success) throw new Error(data.error || 'Unknown error');
    return data.answer;
  });
}

// ===== MICROPHONE =====
function toggleMic() {
  if (isRecording) stopMic(); else startMic();
}

function startMic() {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert('Chrome browser use karo mic ke liye!'); return; }

  stopAllSpeech();
  recognition = new SR();
  recognition.continuous     = false;
  recognition.interimResults = true;
  recognition.lang           = 'hi-IN';

  recognition.onresult = function(e) {
    var final = '', interim = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final   += e.results[i][0].transcript;
      else                      interim += e.results[i][0].transcript;
    }
    document.getElementById('messageInput').value = final || interim;
    autoResize(document.getElementById('messageInput'));
    if (final) { stopMic(); sendMessage(); }
  };

  recognition.onerror = function() { stopMic(); };
  recognition.onend   = function() { if (isRecording) stopMic(); };
  recognition.start();

  isRecording = true;
  var btn = document.getElementById('micBtn');
  if (btn) { btn.classList.add('active'); btn.innerHTML = '🎙️'; }
  var hint = document.getElementById('micHint');
  if (hint) hint.style.display = 'block';
}

function stopMic() {
  try { if (recognition) recognition.stop(); } catch(e) {}
  isRecording = false;
  var btn = document.getElementById('micBtn');
  if (btn) { btn.classList.remove('active'); btn.innerHTML = '🎙️'; }
  var hint = document.getElementById('micHint');
  if (hint) hint.style.display = 'none';
}

// ===== CAMERA =====
function toggleCamera() {
  if (cameraActive) closeCameraPanel(); else openCameraPanel();
}

function openCameraPanel() {
  var panel = document.getElementById('cameraPanel');
  if (!panel) return;
  panel.style.display = 'flex';
  cameraActive = true;

  navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment', width: { ideal: 1280 } }
  }).then(function(stream) {
    cameraStream = stream;
    document.getElementById('cameraFeed').srcObject = stream;
  }).catch(function() {
    panel.innerHTML = '<div style="color:white; padding:2rem; text-align:center;">Camera access nahi mila 😔<br><br><button onclick="closeCameraPanel()" style="padding:0.5rem 1rem; border-radius:8px; border:none; cursor:pointer;">Band Karo</button></div>';
  });
}

function closeCameraPanel() {
  cameraActive = false;
  if (cameraStream) {
    cameraStream.getTracks().forEach(function(t) { t.stop(); });
    cameraStream = null;
  }
  var panel = document.getElementById('cameraPanel');
  if (panel) panel.style.display = 'none';
}

function captureAndAnalyze() {
  var video  = document.getElementById('cameraFeed');
  var canvas = document.createElement('canvas');
  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext('2d').drawImage(video, 0, 0);

  var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  var base64  = dataUrl.split(',')[1];

  closeCameraPanel();

  var st = document.getElementById('analyzeStatus');
  if (st) st.textContent = '🔍 Dekh raha hun...';

  describeImage(base64, 'image/jpeg').then(function(desc) {
    uploadedImageDesc = desc;
    document.getElementById('attachmentRow').style.display = 'flex';
    document.getElementById('attachThumb').innerHTML =
      '<div class="thumb-wrap"><img src="' + dataUrl + '" class="img-thumb" /><button class="remove-img" onclick="clearImageAttachment()">✕</button></div>';
    if (st) st.textContent = '';
    document.getElementById('messageInput').value = 'Is plant mein kya problem hai?';
    sendMessage();
  }).catch(function() {
    uploadedImageDesc = 'Camera se plant ki photo li gayi.';
    if (st) st.textContent = '✅ Photo ready';
  });
}

// ===== IMAGE UPLOAD =====
function handleImageUpload(event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('attachmentRow').style.display = 'flex';
    document.getElementById('attachThumb').innerHTML =
      '<div class="thumb-wrap"><img src="' + e.target.result + '" class="img-thumb" /><button class="remove-img" onclick="clearImageAttachment()">✕</button></div>';
  };
  reader.readAsDataURL(file);

  // Update both sidebar previews
  ['imagePreviewArea','imagePreviewAreaDesktop'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = '<div style="padding:0.4rem; font-size:0.75rem; color:rgba(255,255,255,0.7);">⏳ Analyze kar raha hun...</div>';
  });

  fileToBase64(file).then(function(b64) {
    return describeImage(b64, file.type);
  }).then(function(desc) {
    uploadedImageDesc = desc;
    ['imagePreviewArea','imagePreviewAreaDesktop'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.innerHTML = '<div style="padding:0.4rem; font-size:0.73rem; color:rgba(255,255,255,0.85);">✅ ' + desc.slice(0,80) + '...</div>';
    });
  }).catch(function() {
    uploadedImageDesc = 'Plant ki image upload ki gayi hai.';
    ['imagePreviewArea','imagePreviewAreaDesktop'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.innerHTML = '<div style="padding:0.4rem; font-size:0.73rem; color:rgba(255,255,255,0.7);">✅ Image ready</div>';
    });
  });
}

function fileToBase64(file) {
  return new Promise(function(res, rej) {
    var r = new FileReader();
    r.onload  = function() { res(r.result.split(',')[1]); };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function describeImage(base64, mimeType) {
  return fetch('/api/chatbot/analyze-image', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64: base64, mimeType: mimeType })
  }).then(function(r) { return r.json(); })
    .then(function(d) {
      if (!d.success) throw new Error(d.error);
      return d.description;
    });
}

function clearImageAttachment() {
  uploadedImageDesc = '';
  var ar = document.getElementById('attachmentRow');
  if (ar) ar.style.display = 'none';
  var at = document.getElementById('attachThumb');
  if (at) at.innerHTML = '';
  ['imageInput','imageInputDesktop'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['imagePreviewArea','imagePreviewAreaDesktop'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  var cp = document.getElementById('capturedPreview');
  if (cp) { cp.style.display = 'none'; cp.src = ''; }
  var as = document.getElementById('analyzeStatus');
  if (as) as.textContent = '';
}

// ===== CHAT UI =====
function appendMessage(role, text) {
  var wrap = document.createElement('div');
  wrap.className = 'message ' + role;
  wrap.innerHTML =
    '<div class="msg-av ' + role + '">' + (role === 'bot' ? '🌱' : '👨‍🌾') + '</div>' +
    '<div class="msg-bubble">' + formatText(text) + '</div>';
  var msgs = document.getElementById('chatMessages');
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

function formatText(t) {
  return t
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

var typingEl = null;
function showTyping() {
  if (typingEl) return;
  typingEl = document.createElement('div');
  typingEl.className = 'message bot';
  typingEl.id = 'typingIndicator';
  typingEl.innerHTML =
    '<div class="msg-av bot">🌱</div>' +
    '<div class="msg-bubble" style="padding:0.6rem 0.9rem;">' +
    '<div class="typing-dots"><span></span><span></span><span></span></div></div>';
  var msgs = document.getElementById('chatMessages');
  msgs.appendChild(typingEl);
  msgs.scrollTop = msgs.scrollHeight;
}

function hideTyping() {
  var el = document.getElementById('typingIndicator');
  if (el) el.remove();
  typingEl = null;
}

function sendQuickQ(q) {
  stopAllSpeech();
  document.getElementById('messageInput').value = q;
  sendMessage();
}

function clearChat() {
  stopAllSpeech();
  chatHistory = [];
  document.getElementById('chatMessages').innerHTML =
    '<div class="message bot"><div class="msg-av bot">🌱</div>' +
    '<div class="msg-bubble">चैट साफ! नया सवाल पूछो भाई 🙏</div></div>';
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

// ===== STOP ON PAGE LEAVE =====
window.addEventListener('beforeunload',   stopAllSpeech);
window.addEventListener('pagehide',       stopAllSpeech);
document.addEventListener('visibilitychange', function() {
  if (document.hidden) stopAllSpeech();
});

document.addEventListener('DOMContentLoaded', function() {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = function() { window.speechSynthesis.getVoices(); };

  var q = sessionStorage.getItem('cropQuery');
  if (q) {
    sessionStorage.removeItem('cropQuery');
    setTimeout(function() {
      document.getElementById('messageInput').value = q;
      sendMessage();
    }, 600);
  }
});