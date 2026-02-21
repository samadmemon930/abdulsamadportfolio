// --- CRITICAL FIX: Stop browser from auto-scrolling on refresh ---
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

let animatedSkills = new Set();

// --- 1. FUNCTION: Handle Active Nav Links & Update URL Hash ---
const handleActiveNavLinks = () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    let currentSection = ""; 

    const scrollPos = window.pageYOffset;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionId = section.getAttribute('id');
        const adjustment = sectionId === 'home' ? 20 : 100;

        if (scrollPos >= sectionTop - adjustment) {
            currentSection = sectionId;
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (href === `#${currentSection}`) {
            link.classList.add('active');
            
            // URL Update Logic:
            if (currentSection === "home") {
                // Agar home par hain to URL saaf rakho (index.html)
                if (window.location.hash !== "") {
                    history.replaceState(null, null, window.location.pathname);
                }
            } else if (currentSection !== "" && window.location.hash !== `#${currentSection}`) {
                // Baaki sections ke liye URL update karo
                history.replaceState(null, null, `#${currentSection}`);
            }
        }
    });

    // Handle very top of page
    if (scrollPos < 10) {
        if (window.location.hash !== "") history.replaceState(null, null, window.location.pathname);
        document.querySelector('a[href="#home"]')?.classList.add('active');
    }
};

// --- 2. FUNCTION: Initial Load (Simplified) ---
const scrollToHashInstant = () => {
    const hash = window.location.hash;
    
    // Agar URL me pehle se hash hai (About/Services etc), to wahi scroll kare
    if (hash && hash !== '#home') {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
            const headerOffset = 60;
            window.scrollTo({ top: targetElement.offsetTop - headerOffset, behavior: 'auto' });
        }
    } else {
        // Home ya Empty URL par bilkul Top (0,0) par rakhe
        window.scrollTo(0, 0);
    }
    
    // Home content ko foran dikhane ke liye
    handleScrollAnimations(true); 
    handleActiveNavLinks();
};

// --- 3. ANIMATIONS ---
const handleSkillAnimation = () => {
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;
    const rect = skillsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight - 150 && rect.bottom > 0) {
        const skillItems = document.querySelectorAll('.skill-bar-item');
        skillItems.forEach(item => {
            const progressValue = parseInt(item.getAttribute('data-progress'));
            const fillElement = item.querySelector('.progress-bar-fill');
            const percentageElement = item.querySelector('.skill-percentage');
            if (!animatedSkills.has(item)) {
                animatedSkills.add(item);
                fillElement.style.width = `${progressValue}%`;
                let current = 0;
                const interval = setInterval(() => {
                    current += Math.ceil(progressValue / 50);
                    if (current >= progressValue) {
                        current = progressValue;
                        clearInterval(interval);
                    }
                    percentageElement.textContent = `${current}%`;
                }, 30);
            }
        });
    }
};

const handleScrollAnimations = () => {
    const elements = document.querySelectorAll('.fade-in-up, .fade-left, .fade-right, .service-box, .project-card');
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            el.classList.add('active-animate');
        }
    });
};

// --- 4. EXECUTION ---
document.addEventListener('DOMContentLoaded', () => {
    scrollToHashInstant();
});

// --- Updated checkAllLoaded for precise refresh positioning ---
function checkAllLoaded() {
    if (aboutLoaded && skillsLoaded && projectsLoaded) {
        const hash = window.location.hash;
        
        // Agar URL mein koi specific section hai (#projects, #services etc.)
        if (hash && hash !== '#home') {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                const headerOffset = 60;
                const offsetPosition = targetElement.offsetTop - headerOffset;
                
                // Foran wahi scroll karwao taake jump nazar na aaye
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'auto' 
                });
            }
        }
        
        // Content animations ko trigger karein
        handleScrollAnimations(true);
        handleActiveNavLinks();
        
        // Future clicks ke liye smooth scroll on karein
        document.documentElement.classList.add('smooth-scroll');
    }
}

// LINK CLICK EVENT
document.querySelectorAll('.nav-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const offsetPosition = targetId === '#home' ? 0 : targetElement.offsetTop - 60;
            
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

            // Click par URL update logic:
            if (targetId === '#home') {
                history.pushState(null, null, window.location.pathname);
            } else {
                history.pushState(null, null, targetId);
            }
            
            handleActiveNavLinks();
        }
    });
});

window.addEventListener('scroll', () => {
    handleActiveNavLinks();
    handleScrollAnimations();
    handleSkillAnimation();
});

// --- FIREBASE CONFIG ---
const database = firebase.database();

let aboutLoaded = false, skillsLoaded = false, projectsLoaded = false;

// --- FIREBASE CONFIG (ABOUT SECTION ONLY) ---
database.ref("about/descriptions").on("value", snapshot => {
    const container = document.getElementById("aboutDescContainer");
    
    if (container) {
        // Purana data clear karein pehle
        container.innerHTML = "";

        // Firebase snapshot par loop chalayein
        snapshot.forEach(childSnapshot => {
            const text = childSnapshot.val(); // Har description ka text uthayein
            
            if (text) {
                const p = document.createElement("p");
                p.textContent = text;
                // Fade-in animation (optional) agar aapki CSS mein hai
                p.className = "fade-in-up"; 
                container.appendChild(p);
            }
        });
    }

    // Flags update karein loading check karne ke liye
    aboutLoaded = true; 
    if (typeof checkAllLoaded === "function") {
        checkAllLoaded();
    }
});
database.ref("skills").on("value", snapshot => {
    const container = document.getElementById("userSkills");
    if(container) {
        container.innerHTML = "";
        snapshot.forEach(child => {
            const skill = child.val();
            const div = document.createElement("div");
            div.className = "skill-bar-item fade-in-up";
            div.setAttribute("data-progress", skill.percent);
            div.innerHTML = `<div class="skill-info"><span class="skill-name">${skill.name}</span><span class="skill-percentage">0%</span></div><div class="progress-bar-background"><div class="progress-bar-fill"></div></div>`;
            container.appendChild(div);
        });
    }
    skillsLoaded = true; checkAllLoaded();
});

database.ref("projects").on("value", snapshot => {
    const container = document.getElementById("projectsContainer");
    if(container) {
        container.innerHTML = "";
        snapshot.forEach(child => {
            const project = child.val();
            const card = document.createElement('div');
            card.className = `project-card fade-in-up`;
            card.innerHTML = `<img src="${project.image}" alt="${project.name}"><div class="project-content"><h1>${project.name}</h1><p>${project.desc}</p><div class="project-links"><a href="${project.link}" target="_blank">View Project</a></div></div>`;
            container.appendChild(card);
        });
    }
    projectsLoaded = true; checkAllLoaded();
});

const menuToggle = document.getElementById('menu-toggle');
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => { if (menuToggle && menuToggle.checked) menuToggle.checked = false; });
});