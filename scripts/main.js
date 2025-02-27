// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
        });
        this.classList.add('active');
      }
    });
  });
  
  // Add active class to nav items on scroll
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    const navbarHeight = document.querySelector('.navbar').offsetHeight;
    
    document.querySelectorAll('section').forEach(section => {
      const sectionTop = section.offsetTop - navbarHeight - 50;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        const currentId = section.getAttribute('id');
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
          }
        });
      }
    });
    
    // Add shadow to navbar on scroll
    if (scrollPosition > 50) {
      document.querySelector('.navbar').classList.add('shadow');
    } else {
      document.querySelector('.navbar').classList.remove('shadow');
    }
  });
  
  // Initialize all tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  if (typeof bootstrap !== 'undefined') {
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
  
  // Form validation and submission handling
  const contactForm = document.querySelector('#contact-me form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simple form validation
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      
      if (!name || !email || !message) {
        alert('Please fill in all required fields');
        return;
      }
      
      // You can add form submission code here
      
      // For demonstration, show a success message
      const formElements = contactForm.elements;
      for (let i = 0; i < formElements.length; i++) {
        formElements[i].disabled = true;
      }
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending...';
      
      // Simulate form submission
      setTimeout(() => {
        const formContainer = contactForm.parentElement;
        formContainer.innerHTML = `
          <div class="text-center py-5">
            <i class="fas fa-check-circle text-success fa-4x mb-3"></i>
            <h4>Thank you for your message!</h4>
            <p>I'll get back to you as soon as possible.</p>
          </div>
        `;
      }, 1500);
    });
  }
  
  // Add animation to skills progress bars on scroll
  const progressBars = document.querySelectorAll('.progress-bar');
  const animateProgressBars = () => {
    progressBars.forEach(bar => {
      const value = bar.getAttribute('aria-valuenow');
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = value + '%';
        bar.style.transition = 'width 1s ease-in-out';
      }, 200);
    });
  };
  
  // Check if IntersectionObserver is supported
  if ('IntersectionObserver' in window) {
    const skillsSection = document.querySelector('#skills');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateProgressBars();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    if (skillsSection) {
      observer.observe(skillsSection);
    }
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    window.addEventListener('load', animateProgressBars);
  }