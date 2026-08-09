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

// Short ease scrolling (faster than native smooth on long pages)
var _scrollAnimFrame = null;

function smoothScrollTo(targetY) {
    var start = window.pageYOffset || document.documentElement.scrollTop;
    var end = Math.max(0, targetY);
    var distance = end - start;
    if (Math.abs(distance) < 1) return;

    if (_scrollAnimFrame) {
        cancelAnimationFrame(_scrollAnimFrame);
        _scrollAnimFrame = null;
    }

    var duration = Math.min(480, Math.max(240, Math.abs(distance) * 0.18));
    var startTime = performance.now();

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function step(now) {
        var t = Math.min(1, (now - startTime) / duration);
        window.scrollTo(0, start + distance * easeOutCubic(t));
        if (t < 1) {
            _scrollAnimFrame = requestAnimationFrame(step);
        } else {
            _scrollAnimFrame = null;
        }
    }

    _scrollAnimFrame = requestAnimationFrame(step);
}

function scrollToTop() {
    smoothScrollTo(0);
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

// Label sample-table cells from headers (phone card layout uses data-label)
function hydrateSampleTableLabels() {
    document.querySelectorAll('table.sample-table').forEach(function (table) {
        var headers = Array.from(table.querySelectorAll('thead th')).map(function (th) {
            return (th.textContent || '').replace(/\s+/g, ' ').trim();
        });
        if (!headers.length) return;

        table.querySelectorAll('tbody tr').forEach(function (row) {
            Array.from(row.children).forEach(function (cell, index) {
                if (cell.tagName !== 'TD') return;
                if (!cell.hasAttribute('data-label') && headers[index]) {
                    cell.setAttribute('data-label', headers[index]);
                }
            });
        });
    });
}

function navigationType() {
    try {
        var entries = performance.getEntriesByType('navigation');
        if (entries && entries[0] && entries[0].type) return entries[0].type;
    } catch (e) {}
    if (performance.navigation) {
        if (performance.navigation.type === 1) return 'reload';
    }
    return 'navigate';
}

function clearLocationHash() {
    if (!location.hash) return;
    if (history.replaceState) {
        history.replaceState(null, '', location.pathname + location.search);
    }
}

// Highlight sticky subnav link for the in-view major section
function setupPageSubnavSpy() {
    var nav = document.getElementById('page-subnav');
    if (!nav) return;

    var links = Array.from(nav.querySelectorAll('[data-nav-section]'));
    if (!links.length) return;

    var entries = links.map(function (link) {
        var id = link.getAttribute('data-nav-section');
        return {
            link: link,
            section: id ? document.getElementById(id) : null
        };
    }).filter(function (entry) {
        return !!entry.section;
    });
    if (!entries.length) return;

    var isReload = navigationType() === 'reload';

    function setActive(activeLink) {
        links.forEach(function (link) {
            var on = link === activeLink;
            link.classList.toggle('is-active', on);
            if (on) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    function updateActive() {
        var marker = nav.getBoundingClientRect().bottom + 24;
        var current = entries[0].link;

        entries.forEach(function (entry) {
            if (entry.section.getBoundingClientRect().top <= marker) {
                current = entry.link;
            }
        });

        setActive(current);
    }

    function scrollToSection(section, animate) {
        var top = section.getBoundingClientRect().top + window.pageYOffset - nav.offsetHeight - 8;
        top = Math.max(0, top);
        if (animate) {
            smoothScrollTo(top);
        } else {
            window.scrollTo(0, top);
        }
    }

    links.forEach(function (link) {
        link.addEventListener('click', function (event) {
            var id = link.getAttribute('data-nav-section');
            var section = id ? document.getElementById(id) : null;
            if (!section) return;

            event.preventDefault();
            setActive(link);
            clearLocationHash();
            scrollToSection(section, true);
            updateActive();
        });
    });

    // Reload should always start at the top (ignore old hash / scroll restoration)
    if (isReload) {
        clearLocationHash();
        window.scrollTo(0, 0);
    } else if (location.hash) {
        var hashId = location.hash.slice(1);
        var hashSection = document.getElementById(hashId);
        var hashLink = links.find(function (link) {
            return link.getAttribute('data-nav-section') === hashId;
        });
        if (hashSection) {
            window.setTimeout(function () {
                scrollToSection(hashSection, false);
                if (hashLink) setActive(hashLink);
            }, 0);
        }
    }

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
}

$(document).ready(function() {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

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

    hydrateSampleTableLabels();
    setupPageSubnavSpy();

})
