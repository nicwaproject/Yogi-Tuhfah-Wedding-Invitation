// DOM Elements
const backgroundMusic = document.getElementById('backgroundMusic');
const playPauseButton = document.getElementById('playPauseButton');
const audioControls = document.querySelector('.audio-controls');
const openButton = document.getElementById('openInvitation');
const invitationCover = document.getElementById('cover');
const invitationContent = document.getElementById('invitation');
const accountNumber = document.getElementById('accountNumber');
const rsvpForm = document.getElementById('rsvpForm');
const responseMessage = document.getElementById('responseMessage');
const rsvpList = document.getElementById('rsvpList'); // Elemen untuk menampilkan daftar RSVP
const attendanceCountsElement = document.getElementById('attendanceCounts'); // Elemen untuk menampilkan jumlah kehadiran

const elements = document.querySelectorAll('.zoom-in, .zoom-out');

// Event listener untuk membuka undangan
openButton.addEventListener('click', function() {
    invitationCover.style.display = 'none';
    invitationContent.style.display = 'block';
    audioControls.style.display = 'block'; // Menampilkan kontrol audio
    togglePlayPause();
});

// Fungsi untuk melakukan play/pause pada audio
let isPlaying = false; // Variabel untuk melacak status audio

function togglePlayPause() {
    if (isPlaying) {
        backgroundMusic.pause(); // Hentikan audio
        playPauseButton.src = 'play.png'; // Ganti ikon menjadi play
    } else {
        backgroundMusic.play(); // Putar audio
        playPauseButton.src = 'pause.png'; // Ganti ikon menjadi pause
    }
    isPlaying = !isPlaying; // Toggle status isPlaying
}

// Event listener untuk tombol play/pause
playPauseButton.addEventListener('click', togglePlayPause);

// Smooth scrolling untuk tautan navigasi
document.querySelectorAll('nav ul li a').forEach(anchor => {
    anchor.addEventListener('click', function(event) {
        event.preventDefault();
        document.querySelector(anchor.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Fungsi untuk mendapatkan parameter query
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Menampilkan nama tamu dari parameter URL
const guestName = getQueryParam('guest');
if (guestName) {
    document.getElementById('guest').textContent = guestName;
}

// Timer hitung mundur
const targetDate = new Date('2024-10-13T00:00:00');
let intervalId;

function updateCountdown() {
    const now = new Date();
    const timeDiff = targetDate - now;

    if (timeDiff <= 0) {
        clearInterval(intervalId);
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Update hitung mundur setiap detik
setInterval(updateCountdown, 1000);
updateCountdown(); // Inisialisasi hitung mundur


// Animasi
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            entry.target.classList.remove('hide');
        } else {
            entry.target.classList.remove('show');
            entry.target.classList.add('hide');
        }
    });
});

elements.forEach(element => {
    observer.observe(element);
});

// Set untuk menyimpan pesan yang sudah ditampilkan
const displayedMessages = new Set();

// Fungsi untuk menampilkan pesan RSVP
function fetchMessages() {
    fetch('https://ogik-tuhfah.glitch.me/rsvp')
        .then(response => response.json())
        .then(data => {
            const messagesContainer = document.getElementById('messages');
            messagesContainer.innerHTML = '';
            data.forEach(message => {
                // Buat key unik untuk setiap pesan (bisa menggunakan nama dan isi pesan)
                const messageKey = `${message.name}-${message.message}`;
                
                // Cek apakah pesan sudah ditampilkan
                if (!displayedMessages.has(messageKey)) {
                    displayedMessages.add(messageKey); // Tambahkan pesan ke set
                    
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('message-item');
                    messageElement.innerHTML = `
                        <h4>${message.name}</h4>
                        <p>${message.message}</p>
                        <p class="attendance-status">${message.attendance}</p>
                    `;
                    messagesContainer.appendChild(messageElement);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
        });
}

// Fungsi untuk menampilkan jumlah kehadiran
function fetchAttendanceCounts() {
    fetch('https://ogik-tuhfah.glitch.me/rsvp/attendance')
        .then(response => response.json())
        .then(data => {
            document.getElementById('hadirCount').textContent = data.hadir;
            document.getElementById('tidakHadirCount').textContent = data.tidakHadir;
            document.getElementById('raguCount').textContent = data.ragu;
        })
        .catch(error => {
            console.error('Error fetching attendance counts:', error);
        });
}

// Event listener untuk form RSVP
rsvpForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Mencegah halaman refresh

    // Mengambil nilai dari form
    const name = document.getElementById('name').value;
    const message = document.getElementById('message').value;
    const attendance = document.getElementById('attendance').value;

    // Mengirim data ke server
    fetch('https://ogik-tuhfah.glitch.me/rsvp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, message, attendance })
    })
    .then(response => response.json())
    .then(data => {
        responseMessage.textContent = `Terima kasih, ${name}! Pesan Anda telah diterima: "${message}"`;
        // Reset form setelah submit
        rsvpForm.reset();
        // Refresh daftar RSVP dan jumlah kehadiran
        fetchMessages();
        fetchAttendanceCounts();
    })
    .catch(error => {
        responseMessage.textContent = 'Terjadi kesalahan, coba lagi nanti.';
        console.error('Error:', error);
    });
});

// Panggil fetchMessages() saat halaman pertama kali dimuat
fetchMessages();
fetchAttendanceCounts();
