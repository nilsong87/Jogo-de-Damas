// Inicialização AOS Animation
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false
});

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
            
            // Fechar o menu mobile após clicar em um link
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        }
    });
});

// Back to Top Button
const backToTopButton = document.getElementById('backToTop');
window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        backToTopButton.style.opacity = '1';
        backToTopButton.style.visibility = 'visible';
    } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.visibility = 'hidden';
    }
});

backToTopButton.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simulação de envio do formulário
        const formData = new FormData(this);
        const formValues = Object.fromEntries(formData.entries());
        
        console.log('Formulário enviado:', formValues);
        
        // Exibir mensagem de sucesso
        const successAlert = `
            <div class="alert alert-success alert-dismissible fade show mt-4" role="alert">
                <strong>Mensagem enviada com sucesso!</strong> Entraremos em contato em breve.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        const alertContainer = document.createElement('div');
        alertContainer.innerHTML = successAlert;
        contactForm.parentNode.insertBefore(alertContainer.firstChild, contactForm.nextSibling);
        
        // Limpar formulário
        this.reset();
        
        // Rolar para a mensagem de sucesso
        setTimeout(() => {
            const alertElement = document.querySelector('.alert');
            if (alertElement) {
                alertElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    });
}

// Newsletter Form
const newsletterForms = document.querySelectorAll('.newsletter-form');
newsletterForms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        if (emailInput && emailInput.value) {
            // Simulação de cadastro na newsletter
            console.log('Email cadastrado:', emailInput.value);
            
            // Exibir mensagem de sucesso
            const successAlert = `
                <div class="alert alert-success mt-3">
                    Obrigado por se inscrever! Você receberá nossas atualizações por email.
                </div>
            `;
            
            const alertContainer = document.createElement('div');
            alertContainer.innerHTML = successAlert;
            this.parentNode.insertBefore(alertContainer.firstChild, this.nextSibling);
            
            // Limpar campo de email
            emailInput.value = '';
            
            // Remover mensagem após 5 segundos
            setTimeout(() => {
                const alertElement = this.parentNode.querySelector('.alert');
                if (alertElement) {
                    alertElement.remove();
                }
            }, 5000);
        }
    });
});

// FAQ Accordion - Abrir apenas um item por vez
const accordionItems = document.querySelectorAll('.accordion-item');
accordionItems.forEach(item => {
    const button = item.querySelector('.accordion-button');
    
    button.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        if (!isExpanded) {
            // Fechar todos os outros itens
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherButton = otherItem.querySelector('.accordion-button');
                    const otherCollapse = otherItem.querySelector('.accordion-collapse');
                    
                    otherButton.classList.add('collapsed');
                    otherButton.setAttribute('aria-expanded', 'false');
                    otherCollapse.classList.remove('show');
                }
            });
        }
    });
});

// Ativar tooltips (se necessário)
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Animação de contadores nas estatísticas
function animateCounters() {
    const statBoxes = document.querySelectorAll('.stat-box h3');
    const speed = 200;
    
    statBoxes.forEach(statBox => {
        const target = parseInt(statBox.textContent.replace('%', ''));
        const count = 0;
        const increment = target / speed;
        
        const updateCount = () => {
            const currentCount = parseInt(statBox.textContent.replace('%', ''));
            if (currentCount < target) {
                statBox.textContent = Math.ceil(currentCount + increment) + (statBox.textContent.includes('%') ? '%' : '');
                setTimeout(updateCount, 1);
            } else {
                statBox.textContent = target + (statBox.textContent.includes('%') ? '%' : '');
            }
        };
        
        // Iniciar animação quando o elemento estiver visível
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                updateCount();
                observer.unobserve(statBox);
            }
        });
        
        observer.observe(statBox);
    });
}

// Chamar a função quando a página carregar
window.addEventListener('load', animateCounters);