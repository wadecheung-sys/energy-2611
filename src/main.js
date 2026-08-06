const today = document.querySelector('#today');
const input = document.querySelector('#focusInput');
const button = document.querySelector('#startButton');
const count = document.querySelector('#focusCount');
const minutes = document.querySelector('#minutes');
const mood = document.querySelector('#mood');

today.textContent = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}).format(new Date());

let running = false;
let elapsed = 0;
let timer;

button.addEventListener('click', () => {
  if (!running && !input.value.trim()) {
    input.focus();
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 450);
    return;
  }

  running = !running;
  button.classList.toggle('active', running);
  input.disabled = running;

  if (running) {
    button.innerHTML = '完成专注 <span>✓</span>';
    mood.textContent = '专注中';
    timer = setInterval(() => {
      elapsed += 1;
      minutes.textContent = Math.floor(elapsed / 60);
    }, 1000);
  } else {
    clearInterval(timer);
    count.textContent = Number(count.textContent) + 1;
    button.innerHTML = '再次开始 <span>→</span>';
    mood.textContent = '满足';
    input.disabled = false;
    input.value = '';
  }
});
