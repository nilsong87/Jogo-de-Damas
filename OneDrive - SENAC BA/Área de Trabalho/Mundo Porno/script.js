
        // Age Verification
        document.addEventListener('DOMContentLoaded', function() {
            const ageVerification = document.getElementById('ageVerification');
            const confirmAge = document.getElementById('confirmAge');
            const denyAge = document.getElementById('denyAge');
            
            // Check if age was already verified
            if(localStorage.getItem('ageVerified') !== 'true') {
                ageVerification.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
            
            confirmAge.addEventListener('click', function() {
                localStorage.setItem('ageVerified', 'true');
                ageVerification.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
            
            denyAge.addEventListener('click', function() {
                window.location.href = 'https://www.google.com';
            });
            
            // Video Grid Simulation
            const videoGrid = document.getElementById('videoGrid');
            const categories = ['Brasileiras', 'Novinhas', 'Morenas', 'Negras', 'Loiras', 'Ruivas', 'Mamães', 'Coroas'];
            const durations = ['5:20', '12:45', '8:30', '15:10', '7:25', '9:50', '18:15', '22:30', '10:05', '14:40'];
            const views = ['1.2M', '856K', '2.4M', '543K', '1.8M', '723K', '3.1M', '1.5M', '987K', '2.2M'];
            
            // Generate video cards
            for(let i = 0; i < 24; i++) {
                const randomCat = categories[Math.floor(Math.random() * categories.length)];
                const randomDuration = durations[Math.floor(Math.random() * durations.length)];
                const randomViews = views[Math.floor(Math.random() * views.length)];
                
                const videoCard = `
                    <div class="col-lg-3 col-md-4 col-sm-6">
                        <div class="video-card">
                            ${i % 3 === 0 ? '<div class="premium-badge">PREMIUM</div>' : ''}
                            <div class="video-thumbnail">
                                <img src="https://via.placeholder.com/300x170?text=${randomCat.replace(' ', '+')}" alt="Video Thumbnail">
                                <div class="video-duration">${randomDuration}</div>
                            </div>
                            <div class="video-info">
                                <h6 class="video-title">Video ${i+1}: ${randomCat} - Cena ${Math.floor(Math.random() * 10) + 1}</h6>
                                <div class="video-meta">
                                    <span>${randomViews} views</span>
                                    <span>${Math.floor(Math.random() * 30) + 1} days ago</span>
                                </div>
                            </div>
                            ${i % 3 === 0 ? `
                            <div class="premium-overlay">
                                <i class="fas fa-lock fa-3x mb-3"></i>
                                <p class="text-center">Conteúdo exclusivo para assinantes</p>
                                <button class="btn btn-premium" data-bs-toggle="modal" data-bs-target="#subscriptionModal">Assine agora</button>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `;
                
                videoGrid.innerHTML += videoCard;
            }
            
            // Category filter
            const categoryBtns = document.querySelectorAll('.category-btn');
            categoryBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    categoryBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    // In a real app, you would filter videos here
                });
            });
            
            // Video click handler
            const videoCards = document.querySelectorAll('.video-card');
            videoCards.forEach(card => {
                card.addEventListener('click', function(e) {
                    // Don't open if clicking on subscription button
                    if(e.target.closest('.btn-premium') || e.target.closest('.premium-overlay')) {
                        return;
                    }
                    
                    // Show ad before playing video
                    const adModal = document.getElementById('adModal');
                    adModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                    
                    let count = 10;
                    const countdown = document.getElementById('countdown');
                    const countdownInterval = setInterval(() => {
                        count--;
                        countdown.textContent = count;
                        
                        if(count <= 0) {
                            clearInterval(countdownInterval);
                            playVideo();
                        }
                    }, 1000);
                    
                    // Close ad handlers
                    document.getElementById('closeAd').addEventListener('click', function() {
                        clearInterval(countdownInterval);
                        adModal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    });
                    
                    document.getElementById('skipAd').addEventListener('click', function() {
                        clearInterval(countdownInterval);
                        playVideo();
                    });
                    
                    function playVideo() {
                        adModal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                        // In a real app, this would open the video page
                        window.open('video.html', '_blank');
                    }
                });
            });
            
            // Simulate premium content blur
            const premiumCards = document.querySelectorAll('.video-card .premium-overlay');
            premiumCards.forEach(card => {
                card.parentElement.querySelector('.video-thumbnail').classList.add('blur-content');
            });
        });
    