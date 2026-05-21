/**
 * Neat PDF Maker — app.js
 * Frontend-only image-to-PDF tool for students
 * Uses jsPDF (loaded via CDN)
 */

'use strict';

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  images: [],          // { id, file, dataUrl, name }
  dragSrcId: null,
};
let imageIdCounter = 0;

// ─── DOM References ───────────────────────────────────────────────────────────
const dropzone         = document.getElementById('dropzone');
const fileInput        = document.getElementById('file-input');
const assignmentToggle = document.getElementById('assignment-toggle');
const coverForm        = document.getElementById('cover-form');
const previewCard      = document.getElementById('preview-card');
const imageGrid        = document.getElementById('image-grid');
const pageCountLabel   = document.getElementById('page-count-label');
const generateBtn      = document.getElementById('generate-btn');
const generateBtnText  = document.getElementById('generate-btn-text');
const progressWrap     = document.getElementById('progress-wrap');
const progressFill     = document.getElementById('progress-bar-fill');
const progressLabel    = document.getElementById('progress-label');
const successWrap      = document.getElementById('success-wrap');
const successSub       = document.getElementById('success-sub');
const clearAllBtn      = document.getElementById('clear-all-btn');
const addMoreBtn       = document.getElementById('add-more-btn');
const makeAnotherBtn   = document.getElementById('make-another-btn');
const autoDateEl       = document.getElementById('auto-date');
const processingCanvas = document.getElementById('processing-canvas');

// ─── Daily Quotes ─────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Education is the most powerful weapon you can use to change the world.", author: "Nelson Mandela" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Learning is not attained by chance; it must be sought with passion.", author: "Abigail Adams" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { text: "Great things never come from comfort zones.", author: "Anonymous" },
  { text: "Dream it. Wish it. Do it.", author: "Anonymous" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Anonymous" },
  { text: "Little by little, a little becomes a lot.", author: "Tanzanian Proverb" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { text: "Strive for progress, not perfection.", author: "Anonymous" },
  { text: "You are braver than you believe, stronger than you seem.", author: "A.A. Milne" },
  { text: "Today's preparation determines tomorrow's achievement.", author: "Anonymous" },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Keep your eyes on the stars and your feet on the ground.", author: "Theodore Roosevelt" },
  { text: "Excellence is not a skill, it's an attitude.", author: "Ralph Marston" },
  { text: "Rise up, start fresh, see the bright opportunity in each new day.", author: "Anonymous" },
  { text: "You have to fight through some bad days to earn the best days of your life.", author: "Anonymous" },
  { text: "The beautiful thing about learning is nobody can take it away from you.", author: "B.B. King" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Aim for the moon. If you miss, you may hit a star.", author: "W. Clement Stone" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Success doesn't come to you, you go to it.", author: "Marva Collins" },
  { text: "Work hard in silence. Let success be your noise.", author: "Frank Ocean" },
  { text: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
  { text: "Your limitation — it's only your imagination.", author: "Anonymous" },
  { text: "Sometimes later becomes never. Do it now.", author: "Anonymous" },
  { text: "Be so good they can't ignore you.", author: "Steve Martin" },
  { text: "Knowledge is power. Power to do evil or power to do good.", author: "Veronica Roth" },
  { text: "The more you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "Opportunities don't happen, you create them.", author: "Chris Grosser" },
  { text: "Failure is the stepping stone to success.", author: "Anonymous" },
  { text: "Study while others are sleeping. Work while others are loafing.", author: "William Arthur Ward" },
  { text: "The mind is not a vessel to be filled but a fire to be kindled.", author: "Plutarch" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Small steps every day lead to big changes over time.", author: "Anonymous" },
  { text: "Your attitude determines your direction.", author: "Anonymous" },
  { text: "Each day provides its own gifts.", author: "Marcus Aurelius" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "It's not about being the best. It's about being better than you were yesterday.", author: "Anonymous" },
  { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Anonymous" },
  { text: "Work until your idols become your rivals.", author: "Anonymous" },
  { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "Arise, awake, and stop not until the goal is reached.", author: "Swami Vivekananda" },
  { text: "You have to dream before your dreams can come true.", author: "A.P.J. Abdul Kalam" },
  { text: "Excellence is to do a common thing in an uncommon way.", author: "Booker T. Washington" },
  { text: "Man needs difficulties in life because they are necessary to enjoy success.", author: "A.P.J. Abdul Kalam" },
  { text: "All our dreams can come true, if we have the courage to pursue them.", author: "Walt Disney" },
  { text: "Go the extra mile. It's never crowded.", author: "Anonymous" },
];

function setDailyQuote() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const quote = QUOTES[dayOfYear % QUOTES.length];
  document.getElementById('quote-text').textContent = `"${quote.text}"`;
  document.getElementById('quote-author').textContent = `— ${quote.author}`;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  setAutoDate();
  setDailyQuote();
  bindEvents();
}

function setAutoDate() {
  const now = new Date();
  const formatted = now.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  autoDateEl.textContent = formatted;
}

// ─── Event Bindings ───────────────────────────────────────────────────────────
function bindEvents() {
  // Drop zone click
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });

  // Drag & drop on dropzone
  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', e => { if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove('drag-over'); });
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
    if (files.length) loadFiles(files);
  });

  // File input change
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      loadFiles([...fileInput.files]);
      fileInput.value = '';
    }
  });

  // Assignment mode toggle
  assignmentToggle.addEventListener('change', () => {
    if (assignmentToggle.checked) {
      coverForm.classList.add('open');
      coverForm.setAttribute('aria-hidden', 'false');
    } else {
      coverForm.classList.remove('open');
      coverForm.setAttribute('aria-hidden', 'true');
    }
  });

  // Generate button
  generateBtn.addEventListener('click', generatePDF);

  // Clear all
  clearAllBtn.addEventListener('click', () => {
    if (confirm('Remove all images?')) clearAll();
  });

  // Add more
  addMoreBtn.addEventListener('click', () => fileInput.click());

  // Make another
  makeAnotherBtn.addEventListener('click', resetUI);
}

// ─── File Loading ─────────────────────────────────────────────────────────────
function loadFiles(files) {
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  if (!imageFiles.length) return;

  let loaded = 0;
  imageFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const id = ++imageIdCounter;
      state.images.push({ id, file, dataUrl: e.target.result, name: file.name });
      loaded++;
      if (loaded === imageFiles.length) {
        renderGrid();
        updateUI();
      }
    };
    reader.readAsDataURL(file);
  });
}

// ─── Grid Rendering ───────────────────────────────────────────────────────────
function renderGrid() {
  imageGrid.innerHTML = '';
  state.images.forEach((img, index) => {
    const item = createImageItem(img, index);
    imageGrid.appendChild(item);
  });
  updatePageCount();
}

function createImageItem(img, index) {
  const item = document.createElement('div');
  item.className = 'image-item';
  item.setAttribute('role', 'listitem');
  item.setAttribute('draggable', 'true');
  item.dataset.id = img.id;

  item.innerHTML = `
    <img src="${img.dataUrl}" alt="Page ${index + 1}: ${img.name}" loading="lazy" />
    <div class="image-item-overlay">
      <span class="image-page-num">Page ${index + 1}</span>
    </div>
    <button class="remove-btn" aria-label="Remove image ${index + 1}" title="Remove">×</button>
  `;

  // Remove button
  item.querySelector('.remove-btn').addEventListener('click', e => {
    e.stopPropagation();
    removeImage(img.id);
  });

  // Drag-to-reorder
  item.addEventListener('dragstart', e => {
    state.dragSrcId = img.id;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  item.addEventListener('dragend', () => {
    item.classList.remove('dragging');
    document.querySelectorAll('.image-item').forEach(el => el.classList.remove('drag-over-item'));
  });
  item.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.image-item').forEach(el => el.classList.remove('drag-over-item'));
    item.classList.add('drag-over-item');
  });
  item.addEventListener('drop', e => {
    e.preventDefault();
    item.classList.remove('drag-over-item');
    if (state.dragSrcId !== img.id) {
      reorderImages(state.dragSrcId, img.id);
    }
  });

  return item;
}

function reorderImages(srcId, destId) {
  const srcIdx  = state.images.findIndex(i => i.id === srcId);
  const destIdx = state.images.findIndex(i => i.id === destId);
  if (srcIdx < 0 || destIdx < 0) return;
  const [moved] = state.images.splice(srcIdx, 1);
  state.images.splice(destIdx, 0, moved);
  renderGrid();
}

function removeImage(id) {
  state.images = state.images.filter(i => i.id !== id);
  renderGrid();
  updateUI();
}

function clearAll() {
  state.images = [];
  renderGrid();
  updateUI();
}

function updatePageCount() {
  const count = state.images.length;
  const extra = assignmentToggle.checked ? 1 : 0;
  const total = count + extra;
  pageCountLabel.textContent =
    `${count} image${count !== 1 ? 's' : ''} → ${total} page${total !== 1 ? 's' : ''} in PDF` +
    (extra ? ' (incl. cover page)' : '');
}

function updateUI() {
  const hasImages = state.images.length > 0;
  previewCard.classList.toggle('hidden', !hasImages);
  generateBtn.disabled = !hasImages;
  updatePageCount();
}

// ─── PDF Generation ───────────────────────────────────────────────────────────
async function generatePDF() {
  if (!state.images.length) return;
  if (typeof window.jspdf === 'undefined') {
    alert('PDF library is still loading. Please try again in a moment.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const marginMm   = parseInt(document.getElementById('margin-select').value, 10);
  const quality    = parseFloat(document.getElementById('quality-select').value);
  const addPageNums = document.getElementById('page-numbers-toggle').checked;
  const filenameRaw = document.getElementById('filename-input').value.trim() || 'my-assignment';
  const filename   = sanitizeFilename(filenameRaw) + '.pdf';

  // Show progress
  generateBtn.disabled = true;
  generateBtnText.textContent = 'Generating…';
  progressWrap.classList.remove('hidden');
  successWrap.classList.add('hidden');
  setProgress(5, 'Initialising PDF…');

  // Small delay so UI updates render
  await sleep(50);

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210; // A4 width mm
    const pageH = 297; // A4 height mm
    const usableW = pageW - marginMm * 2;
    const usableH = pageH - marginMm * 2;

    let currentPage = 0;
    let totalPages = state.images.length + (assignmentToggle.checked ? 1 : 0);

    // ── Cover Page ──────────────────────────────────────────────────────────
    if (assignmentToggle.checked) {
      setProgress(10, 'Building cover page…');
      await sleep(30);
      drawCoverPage(doc, pageW, pageH, marginMm);
      currentPage++;
      if (addPageNums) drawPageNumber(doc, currentPage, totalPages, pageW, pageH);
    }

    // ── Image Pages ─────────────────────────────────────────────────────────
    for (let i = 0; i < state.images.length; i++) {
      const imgObj = state.images[i];
      const progress = Math.round(15 + ((i + 1) / state.images.length) * 78);
      setProgress(progress, `Processing image ${i + 1} of ${state.images.length}…`);
      await sleep(20);

      if (currentPage > 0) doc.addPage();
      currentPage++;

      // Resize image via canvas for quality control
      const { dataUrl, imgW, imgH } = await resizeImage(imgObj.dataUrl, quality);

      // Calculate fit dimensions (preserve aspect ratio, centered)
      const { x, y, w, h } = fitImageInBox(imgW, imgH, usableW, usableH, marginMm);

      // Add image — jsPDF handles JPEG, PNG
      const format = getImageFormat(imgObj.file.type);
      doc.addImage(dataUrl, format, x, y, w, h, undefined, 'FAST');

      if (addPageNums) drawPageNumber(doc, currentPage, totalPages, pageW, pageH);
    }

    setProgress(95, 'Saving PDF…');
    await sleep(50);

    doc.save(filename);

    setProgress(100, 'Done!');
    await sleep(300);

    // Success state
    progressWrap.classList.add('hidden');
    successWrap.classList.remove('hidden');
    successSub.textContent = `"${filename}" has been downloaded to your device.`;

  } catch (err) {
    console.error('PDF generation error:', err);
    alert('Something went wrong while generating the PDF. Please try again.\n\n' + err.message);
    resetGenerateBtn();
  }
}

// ─── Cover Page Drawing ───────────────────────────────────────────────────────
function drawCoverPage(doc, pageW, pageH, marginMm) {
  const cx = pageW / 2;

  // ── White background ───────────────────────────────────────────────────────
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, 'F');

  // ── Top blue header band ───────────────────────────────────────────────────
  doc.setFillColor(37, 99, 235);          // --primary blue
  doc.rect(0, 0, pageW, 42, 'F');

  // Top band: App name (small, white)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('NEAT PDF MAKER', cx, 12, { align: 'center' });

  // Top band: "Assignment Submission" label
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(191, 219, 254);        // light blue
  doc.text('Assignment Submission', cx, 20, { align: 'center' });

  // ── Title Box ─────────────────────────────────────────────────────────────
  const titleY = 60;

  // Light blue title card
  doc.setFillColor(239, 246, 255);        // primary-light
  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.5);
  doc.roundedRect(marginMm, titleY, pageW - marginMm * 2, 38, 3, 3, 'FD');

  // Blue left accent stripe
  doc.setFillColor(37, 99, 235);
  doc.rect(marginMm, titleY, 4, 38, 'F');

  // Assignment title text
  const assignmentTitle = document.getElementById('assignment-title').value.trim();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);           // --text-primary
  const titleText = assignmentTitle || 'Assignment Submission';
  doc.text(titleText, cx + 2, titleY + 16, { align: 'center', maxWidth: pageW - marginMm * 2 - 16 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);          // --text-secondary
  doc.text('Prepared using Neat PDF Maker · neatpdfmaker.app', cx, titleY + 28, { align: 'center' });

  // ── Divider ───────────────────────────────────────────────────────────────
  const dividerY = titleY + 50;
  doc.setDrawColor(226, 232, 240);        // --border
  doc.setLineWidth(0.5);
  doc.line(marginMm, dividerY, pageW - marginMm, dividerY);

  // ── Student Details Table ─────────────────────────────────────────────────
  const detailsStartY = dividerY + 14;
  const fields = [
    { label: 'Student Name', value: document.getElementById('student-name').value.trim()    },
    { label: 'Class / Grade', value: document.getElementById('student-class').value.trim()  },
    { label: 'Subject',       value: document.getElementById('student-subject').value.trim() },
    { label: 'Roll Number',   value: document.getElementById('student-roll').value.trim()   },
    { label: 'Teacher',       value: document.getElementById('teacher-name').value.trim()   },
    { label: 'Date',          value: autoDateEl.textContent                                  },
  ].filter(f => f.value);

  const rowH      = 13;
  const tableW    = pageW - marginMm * 2;
  const labelColW = tableW * 0.38;
  const valColX   = marginMm + labelColW;

  // Table header
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(marginMm, detailsStartY - 8, tableW, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('STUDENT DETAILS', marginMm + 6, detailsStartY - 1);

  fields.forEach((field, idx) => {
    const rowY  = detailsStartY + 6 + idx * rowH;
    const isEven = idx % 2 === 0;

    // Alternating row background
    doc.setFillColor(isEven ? 248 : 241, isEven ? 250 : 245, isEven ? 252 : 251);
    doc.rect(marginMm, rowY - 4, tableW, rowH, 'F');

    // Vertical column divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(valColX, rowY - 4, valColX, rowY - 4 + rowH);

    // Row border bottom
    doc.setDrawColor(226, 232, 240);
    doc.line(marginMm, rowY - 4 + rowH, marginMm + tableW, rowY - 4 + rowH);

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(field.label, marginMm + 4, rowY + 4);

    // Value
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(field.value, valColX + 4, rowY + 4, { maxWidth: tableW - labelColW - 8 });
  });

  // ── Bottom footer band ─────────────────────────────────────────────────────
  doc.setFillColor(37, 99, 235);
  doc.rect(0, pageH - 18, pageW, 18, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(191, 219, 254);
  doc.text('This document was generated using Neat PDF Maker · 100% Private · No data uploaded', cx, pageH - 8, { align: 'center' });

  // ── Outer border on full page ──────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(marginMm - 5, 45, pageW - (marginMm - 5) * 2, pageH - 63, 'S');

}

// ─── Page Numbers ─────────────────────────────────────────────────────────────
function drawPageNumber(doc, current, total, pageW, pageH) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 155, 175);
  doc.text(`${current} / ${total}`, pageW / 2, pageH - 6, { align: 'center' });
}

// ─── Image Utilities ──────────────────────────────────────────────────────────
function fitImageInBox(imgW, imgH, boxW, boxH, marginMm) {
  const imgRatio = imgW / imgH;
  const boxRatio = boxW / boxH;

  let w, h;
  if (imgRatio > boxRatio) {
    w = boxW;
    h = boxW / imgRatio;
  } else {
    h = boxH;
    w = boxH * imgRatio;
  }

  const x = marginMm + (boxW - w) / 2;
  const y = marginMm + (boxH - h) / 2;
  return { x, y, w, h };
}

function resizeImage(dataUrl, quality) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const MAX_DIM = 2480; // ~A4 at 300 DPI
      let { naturalWidth: w, naturalHeight: h } = img;

      // Downscale if too large
      if (w > MAX_DIM || h > MAX_DIM) {
        if (w > h) { h = Math.round(h * MAX_DIM / w); w = MAX_DIM; }
        else        { w = Math.round(w * MAX_DIM / h); h = MAX_DIM; }
      }

      processingCanvas.width  = w;
      processingCanvas.height = h;
      const ctx = processingCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      const resized = processingCanvas.toDataURL('image/jpeg', quality);
      resolve({ dataUrl: resized, imgW: w, imgH: h });
    };
    img.src = dataUrl;
  });
}

function getImageFormat(mimeType) {
  if (mimeType === 'image/png') return 'PNG';
  return 'JPEG';
}

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '-').toLowerCase() || 'assignment';
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function setProgress(pct, label) {
  progressFill.style.width = pct + '%';
  progressLabel.textContent = label;
}

function resetGenerateBtn() {
  generateBtn.disabled = state.images.length === 0;
  generateBtnText.textContent = 'Generate PDF';
  progressWrap.classList.add('hidden');
  setProgress(0, '');
}

function resetUI() {
  successWrap.classList.add('hidden');
  progressWrap.classList.add('hidden');
  generateBtnText.textContent = 'Generate PDF';
  generateBtn.disabled = state.images.length === 0;
  setProgress(0, '');
  // Scroll back to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Watch assignment toggle for page count update ────────────────────────────
assignmentToggle.addEventListener('change', updatePageCount);

// ─── Start ────────────────────────────────────────────────────────────────────
init();
