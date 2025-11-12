// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar Background on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const baseColor = 'rgb(20, 20, 20)';
    const scrolledColor = 'rgba(15, 35, 70, 0.92)';
    const baseShadow = 'none';
    const scrolledShadow = '0 12px 30px rgba(6, 16, 35, 0.45)';

    if (window.scrollY > 50) {
        navbar.style.backgroundColor = scrolledColor;
        navbar.style.backgroundImage = 'none';
        navbar.style.boxShadow = scrolledShadow;
    } else {
        navbar.style.backgroundColor = baseColor;
        navbar.style.backgroundImage = 'none';
        navbar.style.boxShadow = baseShadow;
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.8s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all feature cards, doc cards, and screenshot items
document.querySelectorAll('.feature-card, .doc-card, .screenshot-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Download button click tracking (optional - for analytics)
document.querySelectorAll('a[href*="download"], a[href*="releases"]').forEach(button => {
    button.addEventListener('click', (e) => {
        console.log('Download button clicked:', e.target.href);
        // Add analytics tracking here if needed
    });
});

// Add active class to current nav item based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.classList.remove('active');
            });
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
});

// Detect OS and show appropriate download button
function detectOS() {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

    if (macosPlatforms.indexOf(platform) !== -1) {
        return 'macOS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        return 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        return 'Windows';
    } else if (/Android/.test(userAgent)) {
        return 'Android';
    } else if (/Linux/.test(platform)) {
        return 'Linux';
    }

    return 'Unknown';
}

// Update download button text based on OS
const os = detectOS();
const downloadButtons = document.querySelectorAll('.btn-primary');
downloadButtons.forEach(button => {
    if (button.textContent.includes('Download')) {
        if (os === 'macOS') {
            button.innerHTML = button.innerHTML.replace('Windows', 'macOS (Coming Soon)');
            button.style.opacity = '0.6';
            button.style.cursor = 'not-allowed';
            button.addEventListener('click', (e) => {
                e.preventDefault();
                alert('macOS version coming soon! For now, please build from source.');
            });
        } else if (os === 'Linux') {
            button.innerHTML = button.innerHTML.replace('Windows', 'Linux (Coming Soon)');
            button.style.opacity = '0.6';
            button.style.cursor = 'not-allowed';
            button.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Linux version coming soon! For now, please build from source.');
            });
        }
    }
});

// Copy code snippets (if any)
document.querySelectorAll('pre code').forEach(block => {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = 'Copy';
    button.addEventListener('click', () => {
        navigator.clipboard.writeText(block.textContent);
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
    block.parentElement.style.position = 'relative';
    block.parentElement.appendChild(button);
});

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join('') === konamiSequence.join('')) {
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// Add rainbow animation
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

console.log('%cAtlaswebX', 'font-size: 40px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%cBuilt with ❤️ using Electron and OpenAI GPT-4o-mini', 'font-size: 14px; color: #667eea;');
console.log('%cGitHub: https://github.com/aiexperti/atlaswebx', 'font-size: 12px; color: #764ba2;');
