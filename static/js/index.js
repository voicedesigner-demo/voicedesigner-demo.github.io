window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        if (dropdown) dropdown.classList.remove('show');
        if (button) button.classList.remove('active');
    }
});

function dataAugJsonKeyFromPath(jsonPath) {
    if (!jsonPath) return '';
    var m = jsonPath.match(/([\w-]+)\.json\s*$/);
    return m ? m[1] : '';
}

function openDataAugFxModal(button) {
    var modal = document.getElementById('dataAugFxModal');
    var codeEl = document.getElementById('dataAugFxModalJson');
    var titleEl = document.getElementById('dataAugFxModalTitle');
    var errEl = document.getElementById('dataAugFxModalErr');
    if (!modal || !codeEl) return;

    var jsonPath = button && button.getAttribute ? button.getAttribute('data-json') : '';
    var title = button && button.textContent ? button.textContent.trim() : 'FX Chain';

    if (titleEl) titleEl.textContent = title;
    if (errEl) {
        errEl.textContent = '';
        errEl.classList.add('is-hidden');
    }
    codeEl.textContent = 'Loading…';

    modal.classList.add('is-active');
    document.documentElement.classList.add('is-clipped');

    if (!jsonPath) {
        codeEl.textContent = 'No JSON path (data-json) configured for this row.';
        return;
    }

    var key = dataAugJsonKeyFromPath(jsonPath);
    var bundle = typeof window.DATA_AUG_JSON !== 'undefined' ? window.DATA_AUG_JSON : null;
    if (bundle && key && Object.prototype.hasOwnProperty.call(bundle, key)) {
        codeEl.textContent = JSON.stringify(bundle[key], null, 2);
        return;
    }

    fetch(jsonPath)
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.text();
        })
        .then(function (text) {
            try {
                var obj = JSON.parse(text);
                codeEl.textContent = JSON.stringify(obj, null, 2);
            } catch (e) {
                codeEl.textContent = text;
            }
        })
        .catch(function (err) {
            codeEl.textContent = '';
            if (errEl) {
                errEl.textContent = 'Could not load JSON: ' + (err && err.message ? err.message : String(err)) +
                    '. If you opened this page as file://, use a local server, or run node scripts/build_data_aug_json.js after editing JSON.';
                errEl.classList.remove('is-hidden');
            }
        });
}

function closeDataAugFxModal() {
    var modal = document.getElementById('dataAugFxModal');
    if (modal) {
        modal.classList.remove('is-active');
        document.documentElement.classList.remove('is-clipped');
    }
}

document.addEventListener('click', function (event) {
    var fxBtn = event.target.closest('.data-aug-fx-subtitle');
    if (fxBtn) {
        event.preventDefault();
        openDataAugFxModal(fxBtn);
        return;
    }
    var modal = document.getElementById('dataAugFxModal');
    if (modal && modal.classList.contains('is-active')) {
        if (event.target.classList.contains('modal-background') ||
            event.target.closest('.modal-close')) {
            closeDataAugFxModal();
        }
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        var fxModal = document.getElementById('dataAugFxModal');
        if (fxModal && fxModal.classList.contains('is-active')) {
            closeDataAugFxModal();
            return;
        }
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        if (dropdown) dropdown.classList.remove('show');
        if (button) button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (!scrollButton) return;
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

})
