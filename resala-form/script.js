const API_URL = "/api/submit";

const form = document.getElementById('resalaForm');
const sections = [...document.querySelectorAll('.form-section')];
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const stepLabel = document.getElementById('stepLabel');
const statusMessage = document.getElementById('statusMessage');
let step = 0;

function updateStep(){
  sections.forEach((s,i)=>s.classList.toggle('active', i===step));
  prevBtn.hidden = step === 0;
  nextBtn.hidden = step === sections.length - 1;
  submitBtn.hidden = step !== sections.length - 1;
  progressBar.style.width = `${((step+1)/sections.length)*100}%`;
  statusMessage.textContent = '';
}

function currentSectionIsValid(){
  const inputs = [...sections[step].querySelectorAll('input, select, textarea')];
  return inputs.every(input => input.reportValidity());
}

nextBtn.addEventListener('click', () => {
  if(!currentSectionIsValid()) return;
  step++;
  updateStep();
});

prevBtn.addEventListener('click', () => {
  step--;
  updateStep();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if(!currentSectionIsValid()) return;

  const data = Object.fromEntries(new FormData(form).entries());
  // client-side timestamp is optional; server will generate the canonical Timestamp

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  statusMessage.textContent = '';

  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      statusMessage.textContent = json.error || 'Submission failed. Please review the form.';
    } else {
      statusMessage.textContent = 'Application submitted successfully. Thank you!';
      form.reset();
      step = 0;
      updateStep();
      // Prevent accidental duplicate by storing a small flag
      try { localStorage.setItem('resala_last_submission', JSON.stringify({ aucId: data.aucId, email: data.email, at: Date.now() })); } catch(e){}
    }
  } catch (err) {
    statusMessage.textContent = 'Something went wrong. Please try again.';
    console.error(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Application';
  }
});

updateStep();
