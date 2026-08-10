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

function escapeFxHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

var FX_NAME_LABELS = {
    shift_pitch_by_semitones: 'Pitch Shift',
    process_audio_pitch_sifigan: 'Pitch (SiFiGAN)',
    process_audio_formant_sifigan: 'Formant (SiFiGAN)',
    praat_formant_shifting: 'Formant Shift',
    time_stretch: 'Time Stretch',
    bandpass_filter_scipy: 'Bandpass',
    pb_distortion: 'Distortion',
    pb_limiter: 'Limiter',
    pb_gsm_compression: 'GSM Compression',
    pb_bitcrush: 'Bitcrush',
    pw_whisper: 'Whisper',
    pb_reverb: 'Reverb',
    pb_delay: 'Delay',
    pb_gain: 'Gain',
    pb_chorus: 'Chorus',
    pb_compressor: 'Compressor',
    pb_eq: 'EQ'
};

function humanizeFxName(name) {
    if (!name) return 'Effect';
    if (FX_NAME_LABELS[name]) return FX_NAME_LABELS[name];
    return String(name)
        .replace(/^(pb_|pw_)/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

function humanizeFxParamKey(key) {
    return String(key || '')
        .replace(/_/g, ' ')
        .replace(/\bhz\b/gi, 'Hz')
        .replace(/\bdb\b/gi, 'dB');
}

function formatFxParamValue(value) {
    if (value == null) return '';
    if (typeof value === 'number') {
        return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
    }
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(formatFxParamValue).join(', ');
    if (typeof value === 'object') {
        if (Array.isArray(value.range) && value.range.length >= 2) {
            return formatFxParamValue(value.range[0]) + ' … ' + formatFxParamValue(value.range[1]);
        }
        return Object.keys(value).map(function (k) {
            return humanizeFxParamKey(k) + ' ' + formatFxParamValue(value[k]);
        }).join(' · ');
    }
    return String(value);
}

function formatFxParams(params) {
    if (!params || typeof params !== 'object') return '';
    var keys = Object.keys(params);
    if (!keys.length) return '';
    return keys.map(function (key) {
        return humanizeFxParamKey(key) + ': ' + formatFxParamValue(params[key]);
    }).join(' · ');
}

function renderFxNodesHtml(fxList) {
    if (!fxList || !fxList.length) {
        return '<span class="fx-viz-empty-nodes">Passthrough</span>';
    }
    var parts = [];
    fxList.forEach(function (fx, index) {
        if (index > 0) {
            parts.push('<span class="fx-viz-node-arrow" aria-hidden="true">→</span>');
        }
        var name = humanizeFxName(fx && fx.name);
        var params = formatFxParams(fx && fx.params);
        parts.push(
            '<div class="fx-viz-node">' +
              '<span class="fx-viz-node-name">' + escapeFxHtml(name) + '</span>' +
              (params ? '<span class="fx-viz-node-params">' + escapeFxHtml(params) + '</span>' : '') +
            '</div>'
        );
    });
    return parts.join('');
}

function formatMixWeight(weight) {
    var n = Number(weight);
    if (!isFinite(n)) return '—';
    return Math.round(n * 1000) / 10 + '%';
}

function renderDataAugFxViz(obj, vizEl) {
    if (!vizEl) return;
    if (!obj || typeof obj !== 'object') {
        vizEl.innerHTML = '';
        vizEl.classList.add('is-empty');
        return;
    }

    var chains = obj.channel_fx_chains || {};
    var weights = obj.mix_weights || {};
    var master = obj.master_fx_chain || [];
    var channelKeys = Object.keys(chains).sort(function (a, b) {
        var na = parseInt(String(a).replace(/\D/g, ''), 10);
        var nb = parseInt(String(b).replace(/\D/g, ''), 10);
        if (isFinite(na) && isFinite(nb) && na !== nb) return na - nb;
        return String(a).localeCompare(String(b));
    });

    if (!channelKeys.length && !master.length) {
        vizEl.innerHTML = '';
        vizEl.classList.add('is-empty');
        return;
    }

    var channelHtml = channelKeys.map(function (key, index) {
        var weight = weights.hasOwnProperty(key) ? weights[key] : null;
        var muted = weight != null && Number(weight) === 0;
        var channelLabel = String(key).replace(/^ch(\d+)$/i, 'Channel $1');
        return (
            (index > 0 ? '<span class="fx-viz-pipe" aria-hidden="true">|</span>' : '') +
            '<div class="fx-viz-channel' + (muted ? ' is-muted' : '') + '">' +
              '<div class="fx-viz-channel-head">' +
                '<span class="fx-viz-ch">' + escapeFxHtml(channelLabel) + '</span>' +
                (weight != null
                  ? '<span class="fx-viz-weight">' + escapeFxHtml(formatMixWeight(weight)) + '</span>'
                  : '') +
              '</div>' +
              '<div class="fx-viz-nodes">' + renderFxNodesHtml(chains[key]) + '</div>' +
            '</div>'
        );
    }).join('');

    vizEl.classList.remove('is-empty');
    vizEl.innerHTML =
        '<div class="fx-viz-flow">' +
          '<div class="fx-viz-io">Original Recording</div>' +
          (channelHtml
            ? '<div class="fx-viz-label">Send to channels:</div>' +
              '<div class="fx-viz-channels">' + channelHtml + '</div>' +
              '<div class="fx-viz-label">Merge</div>'
            : '') +
          '<div class="fx-viz-merge">' +
            (master.length
              ? '<div class="fx-viz-nodes">' + renderFxNodesHtml(master) + '</div>'
              : '<div class="fx-viz-merge-empty"></div>') +
          '</div>' +
          '<div class="fx-viz-io">Target Output</div>' +
        '</div>';
}

function setDataAugFxModalPayload(obj, rawText) {
    var codeEl = document.getElementById('dataAugFxModalJson');
    var vizEl = document.getElementById('dataAugFxModalViz');
    if (obj && typeof obj === 'object') {
        renderDataAugFxViz(obj, vizEl);
        if (codeEl) codeEl.textContent = JSON.stringify(obj, null, 2);
        return;
    }
    if (vizEl) {
        vizEl.innerHTML = '';
        vizEl.classList.add('is-empty');
    }
    if (codeEl) codeEl.textContent = rawText || '';
}

function openDataAugFxModal(button) {
    var modal = document.getElementById('dataAugFxModal');
    var codeEl = document.getElementById('dataAugFxModalJson');
    var vizEl = document.getElementById('dataAugFxModalViz');
    var titleEl = document.getElementById('dataAugFxModalTitle');
    var errEl = document.getElementById('dataAugFxModalErr');
    var detailsEl = modal ? modal.querySelector('.fx-viz-json-details') : null;
    if (!modal || !codeEl) return;

    var jsonPath = button && button.getAttribute ? button.getAttribute('data-json') : '';
    var title = button && button.textContent ? button.textContent.trim() : 'FX Chain';

    if (titleEl) titleEl.textContent = title;
    if (errEl) {
        errEl.textContent = '';
        errEl.classList.add('is-hidden');
    }
    if (detailsEl) detailsEl.open = false;
    if (vizEl) {
        vizEl.classList.remove('is-empty');
        vizEl.innerHTML = '<div class="fx-viz-join">Loading…</div>';
    }
    codeEl.textContent = 'Loading…';

    modal.classList.add('is-active');
    document.documentElement.classList.add('is-clipped');

    if (!jsonPath) {
        setDataAugFxModalPayload(null, 'No JSON path (data-json) configured for this row.');
        return;
    }

    var key = dataAugJsonKeyFromPath(jsonPath);
    var bundle = typeof window.DATA_AUG_JSON !== 'undefined' ? window.DATA_AUG_JSON : null;
    if (bundle && key && Object.prototype.hasOwnProperty.call(bundle, key)) {
        setDataAugFxModalPayload(bundle[key]);
        return;
    }

    fetch(jsonPath)
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.text();
        })
        .then(function (text) {
            try {
                setDataAugFxModalPayload(JSON.parse(text));
            } catch (e) {
                setDataAugFxModalPayload(null, text);
            }
        })
        .catch(function (err) {
            setDataAugFxModalPayload(null, '');
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

        var oursIndexes = [];
        table.querySelectorAll('thead th').forEach(function (th, index) {
            if (th.classList.contains('ours-col')) oursIndexes.push(index);
        });

        table.querySelectorAll('tbody tr').forEach(function (row) {
            Array.from(row.children).forEach(function (cell, index) {
                if (cell.tagName !== 'TD') return;
                var isOurs = oursIndexes.indexOf(index) !== -1;
                if (isOurs) {
                    cell.classList.add('ours-cell');
                }
                if (!cell.hasAttribute('data-label') && headers[index]) {
                    cell.setAttribute(
                        'data-label',
                        isOurs ? ('★ ' + headers[index].replace(/^★\s*/, '')) : headers[index]
                    );
                } else if (isOurs && cell.hasAttribute('data-label')) {
                    var existing = cell.getAttribute('data-label') || '';
                    if (existing && existing.indexOf('★') !== 0) {
                        cell.setAttribute('data-label', '★ ' + existing.replace(/^★\s*/, ''));
                    }
                }
            });
        });
    });
}

// Collapse long sample tables to the first N rows; expand/collapse via button
function setupSampleTableCollapse(limit) {
    var maxVisible = typeof limit === 'number' && limit > 0 ? limit : 5;

    document.querySelectorAll('.sample-container').forEach(function (container) {
        if (container.querySelector('.sample-expand')) return;

        var table = container.querySelector('table.sample-table');
        if (!table) return;

        var rows = Array.from(table.querySelectorAll('tbody tr'));
        if (rows.length <= maxVisible) return;

        var hiddenCount = rows.length - maxVisible;
        rows.forEach(function (row, index) {
            if (index >= maxVisible) row.classList.add('is-row-hidden');
        });

        var wrap = document.createElement('div');
        wrap.className = 'sample-expand';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sample-expand-btn';
        btn.setAttribute('aria-expanded', 'false');

        var icon = document.createElement('span');
        icon.className = 'sample-expand-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = '<i class="fas fa-plus"></i>';

        var label = document.createElement('span');
        label.className = 'sample-expand-label';
        label.textContent = 'Show ' + hiddenCount + ' more';

        btn.appendChild(icon);
        btn.appendChild(label);
        wrap.appendChild(btn);
        container.appendChild(wrap);

        btn.addEventListener('click', function () {
            var expanded = btn.classList.toggle('is-expanded');
            rows.forEach(function (row, index) {
                if (index >= maxVisible) {
                    row.classList.toggle('is-row-hidden', !expanded);
                }
            });
            btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            label.textContent = expanded ? 'Show less' : ('Show ' + hiddenCount + ' more');
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

// Keep sticky table headers flush under the frosted subnav
function syncPageSubnavHeight() {
    var nav = document.getElementById('page-subnav');
    if (!nav) return;
    var rect = nav.getBoundingClientRect();
    // When stuck, use bottom edge; otherwise use layout height (not viewport bottom).
    var px = rect.top <= 0.5
        ? Math.floor(rect.bottom + 0.01)
        : Math.floor(nav.offsetHeight + 0.01);
    document.documentElement.style.setProperty('--page-subnav-height', px + 'px');
}

function setupPageSubnavHeightSync() {
    var nav = document.getElementById('page-subnav');
    if (!nav) return;

    syncPageSubnavHeight();
    window.addEventListener('resize', syncPageSubnavHeight);
    window.addEventListener('scroll', syncPageSubnavHeight, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
        var ro = new ResizeObserver(syncPageSubnavHeight);
        ro.observe(nav);
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(syncPageSubnavHeight).catch(function () {});
    }
}

function setupPageSubnavSpy() {
    var nav = document.getElementById('page-subnav');
    if (!nav) return;

    setupPageSubnavHeightSync();

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

function setupBrandAudioPlayers() {
    var players = [];

    function readyDuration(audio) {
        return audio.duration && isFinite(audio.duration) && audio.duration > 0;
    }

    function canStartPlayback(audio) {
        // HAVE_CURRENT_DATA (2) or better — enough to begin without an empty start.
        return audio.readyState >= 2;
    }

    document.querySelectorAll('audio[controls]').forEach(function (audio) {
        if (audio.closest('.vd-player')) return;

        audio.removeAttribute('controls');
        // Avoid fetching every clip on page load; warm up when visible / on press.
        audio.setAttribute('preload', 'none');

        var wrap = document.createElement('div');
        wrap.className = 'vd-player';

        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'vd-player-toggle';
        toggle.setAttribute('aria-label', 'Play');
        toggle.innerHTML = '<span class="vd-player-toggle-icon" aria-hidden="true"></span>';

        var seek = document.createElement('input');
        seek.type = 'range';
        seek.className = 'vd-player-seek';
        seek.min = '0';
        seek.max = '1000';
        seek.value = '0';
        seek.step = '1';
        seek.setAttribute('aria-label', 'Seek');

        var parent = audio.parentNode;
        parent.insertBefore(wrap, audio);
        wrap.appendChild(toggle);
        wrap.appendChild(seek);
        wrap.appendChild(audio);

        var seeking = false;
        var playRequestId = 0;

        function setPlaying(on) {
            wrap.classList.toggle('is-playing', on);
            if (!wrap.classList.contains('is-loading')) {
                toggle.setAttribute('aria-label', on ? 'Pause' : 'Play');
            }
        }

        function setLoading(on) {
            wrap.classList.toggle('is-loading', on);
            toggle.setAttribute('aria-label', on ? 'Loading' : (audio.paused ? 'Play' : 'Pause'));
        }

        function setSeekVisual(ratio) {
            var pct = Math.max(0, Math.min(100, ratio * 100));
            seek.style.setProperty('--vd-seek', pct + '%');
            seek.value = String(Math.round(ratio * 1000));
        }

        function syncSeek() {
            if (seeking || !readyDuration(audio)) return;
            setSeekVisual(audio.currentTime / audio.duration);
        }

        function seekToRatio(ratio) {
            if (!readyDuration(audio)) return;
            ratio = Math.max(0, Math.min(1, ratio));
            audio.currentTime = ratio * audio.duration;
            setSeekVisual(ratio);
        }

        function endSeeking() {
            if (!seeking) return;
            seeking = false;
            syncSeek();
        }

        function warmBuffer() {
            if (canStartPlayback(audio)) return;
            if (audio.getAttribute('preload') !== 'auto') {
                audio.setAttribute('preload', 'auto');
            }
            // NETWORK_EMPTY only — avoid resetting an in-flight buffer.
            if (audio.networkState === 0) {
                try { audio.load(); } catch (e) {}
            }
        }

        function playWhenReady() {
            players.forEach(function (other) {
                if (other !== audio && !other.paused) other.pause();
            });

            var requestId = ++playRequestId;
            setLoading(true);
            warmBuffer();

            function finishLoading() {
                if (requestId !== playRequestId) return;
                setLoading(false);
            }

            function attemptPlay() {
                if (requestId !== playRequestId) return;
                if (!canStartPlayback(audio)) return false;
                var playPromise = audio.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.then(finishLoading).catch(function () {
                        finishLoading();
                    });
                } else {
                    finishLoading();
                }
                return true;
            }

            if (attemptPlay()) return;

            function onReady() {
                if (requestId !== playRequestId) return;
                if (attemptPlay()) {
                    audio.removeEventListener('canplay', onReady);
                    audio.removeEventListener('loadeddata', onReady);
                }
            }

            audio.addEventListener('canplay', onReady);
            audio.addEventListener('loadeddata', onReady);
        }

        // Start fetching on press so the click often has buffered data already.
        toggle.addEventListener('pointerdown', function () {
            if (audio.paused) warmBuffer();
        });

        toggle.addEventListener('click', function () {
            if (wrap.classList.contains('is-loading')) {
                playRequestId += 1;
                setLoading(false);
                try { audio.pause(); } catch (e) {}
                return;
            }
            if (audio.paused) {
                playWhenReady();
            } else {
                playRequestId += 1;
                setLoading(false);
                audio.pause();
            }
        });

        seek.addEventListener('pointerdown', function (event) {
            seeking = true;
            warmBuffer();
            if (seek.setPointerCapture) {
                try { seek.setPointerCapture(event.pointerId); } catch (e) {}
            }
        });
        seek.addEventListener('pointerup', endSeeking);
        seek.addEventListener('pointercancel', endSeeking);
        seek.addEventListener('lostpointercapture', endSeeking);
        seek.addEventListener('change', endSeeking);
        seek.addEventListener('input', function () {
            seekToRatio(Number(seek.value) / 1000);
        });

        audio.addEventListener('play', function () {
            setLoading(false);
            setPlaying(true);
        });
        audio.addEventListener('pause', function () { setPlaying(false); });
        audio.addEventListener('waiting', function () {
            if (!audio.paused) setLoading(true);
        });
        audio.addEventListener('playing', function () {
            setLoading(false);
            setPlaying(true);
        });
        audio.addEventListener('ended', function () {
            setPlaying(false);
            setSeekVisual(0);
        });
        audio.addEventListener('timeupdate', syncSeek);
        audio.addEventListener('loadedmetadata', syncSeek);
        audio.addEventListener('durationchange', syncSeek);

        setSeekVisual(0);
        players.push(audio);

        // Warm nearby clips so tap-to-play feels instant on mobile cards.
        if (typeof IntersectionObserver !== 'undefined') {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) warmBuffer();
                });
            }, { rootMargin: '120px 0px', threshold: 0.15 });
            io.observe(wrap);
        }
    });
}

function setupRope3dViz() {
    var canvas = document.getElementById('rope3dCanvas');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var N = 7;
    var M = 5;
    var L = 7;
    var colors = {
        instruction: '#2563eb',
        text: '#16a34a',
        audio: '#db2777',
        axis: '#cbd5e1',
        label: '#64748b'
    };

    // Look from (0, M, −L) toward (N, 0, 0)
    var lookFrom = { x: 0, y: M, z: -L };
    var lookAt = { x: N, y: 0, z: 0 };
    var viewDx = lookAt.x - lookFrom.x;
    var viewDy = lookAt.y - lookFrom.y;
    var viewDz = lookAt.z - lookFrom.z;
    var yaw = Math.atan2(viewDx, viewDz);
    var horiz = Math.sqrt(viewDx * viewDx + viewDz * viewDz);
    var pitch = Math.atan2(viewDy, horiz);
    var scale = 1.08;
    var dragging = false;
    var lastX = 0;
    var lastY = 0;

    function buildSeries() {
        var instruction = [];
        var text = [];
        var audio = [];
        var i;
        for (i = 0; i < N; i += 1) instruction.push({ x: i, y: 0, z: 0, kind: 'instruction' });
        for (i = 1; i <= M; i += 1) text.push({ x: N, y: i, z: 0, kind: 'text' });
        // Audio axis flipped (−z) so it fans opposite Text (+y)
        for (i = 1; i <= L; i += 1) audio.push({ x: N, y: 0, z: -i, kind: 'audio' });
        return { instruction: instruction, text: text, audio: audio };
    }

    var series = buildSeries();

    function project(point, width, height) {
        var cosY = Math.cos(yaw);
        var sinY = Math.sin(yaw);
        var cosP = Math.cos(pitch);
        var sinP = Math.sin(pitch);

        var cx = point.x - N * 0.5;
        var cy = point.y - M * 0.5;
        var cz = point.z + L * 0.5;

        var x1 = cx * cosY - cz * sinY;
        var z1 = cx * sinY + cz * cosY;
        var y1 = cy * cosP - z1 * sinP;
        var z2 = cy * sinP + z1 * cosP;

        var perspective = 16 / (16 + z2);
        var s = 26 * scale * perspective;
        return {
            x: width * 0.5 + x1 * s,
            y: height * 0.6 - y1 * s,
            depth: z2,
            r: Math.max(2.1, 3.6 * perspective * scale)
        };
    }

    function drawAxis(width, height, from, to, label, color, labelSide) {
        var a = project(from, width, height);
        var b = project(to, width, height);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = color || colors.axis;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (label) {
            drawLabel(label, b.x, b.y, color || colors.label, labelSide || 'below-right', '700 13px Inter, sans-serif');
        }
    }

    function drawLabel(text, x, y, color, side, font) {
        ctx.font = font || '600 12px Inter, ui-monospace, monospace';
        var metrics = ctx.measureText(text);
        var w = metrics.width;
        var h = 12;
        var ox = 8;
        var oy = 14;
        var tx = x + ox;
        var ty = y + oy;

        if (side === 'below-left') {
            tx = x - w - 8;
            ty = y + oy;
        } else if (side === 'below') {
            tx = x - w * 0.5;
            ty = y + oy + 2;
        } else if (side === 'right') {
            tx = x + ox;
            ty = y + 4;
        } else if (side === 'left') {
            tx = x - w - 8;
            ty = y + 4;
        } else {
            // below-right
            tx = x + ox;
            ty = y + oy;
        }

        // Soft halo so labels stay readable over lines / plane
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255,255,255,0.92)';
        ctx.strokeText(text, tx, ty);
        ctx.fillStyle = color;
        ctx.fillText(text, tx, ty);
    }

    function drawAlignPlane(width, height) {
        // Text (y) and Audio (z) share x = N → fill that face to emphasize alignment
        var corners = [
            { x: N, y: 0, z: 0 },
            { x: N, y: M, z: 0 },
            { x: N, y: M, z: -L },
            { x: N, y: 0, z: -L }
        ].map(function (p) { return project(p, width, height); });

        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        var i;
        for (i = 1; i < corners.length; i += 1) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(37, 99, 235, 0.10)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.28)';
        ctx.lineWidth = 1.25;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawMark(point, text, color, width, height, side) {
        var p = project(point, width, height);
        drawLabel(text, p.x, p.y, color, side || 'below-right');
    }

    function drawPolyline(points, color, width, height) {
        if (!points.length) return;
        var projected = points.map(function (p) { return project(p, width, height); });
        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        var i;
        for (i = 1; i < projected.length; i += 1) {
            ctx.lineTo(projected[i].x, projected[i].y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.25;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();

        for (i = 0; i < projected.length; i += 1) {
            var p = projected[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255,255,255,0.85)';
            ctx.stroke();
        }
    }

    function render() {
        var ratio = window.devicePixelRatio || 1;
        var cssWidth = canvas.clientWidth || 720;
        var cssHeight = Math.max(240, Math.round(cssWidth * 0.52));
        if (canvas.width !== Math.round(cssWidth * ratio) || canvas.height !== Math.round(cssHeight * ratio)) {
            canvas.width = Math.round(cssWidth * ratio);
            canvas.height = Math.round(cssHeight * ratio);
            canvas.style.height = cssHeight + 'px';
        }
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, cssWidth, cssHeight);

        drawAlignPlane(cssWidth, cssHeight);

        // Axes first (geometry), labels drawn after polylines so they stay on top
        drawAxis(
            cssWidth, cssHeight,
            { x: -0.4, y: 0, z: 0 },
            { x: N + 0.85, y: 0, z: 0 },
            '',
            colors.instruction
        );
        drawAxis(
            cssWidth, cssHeight,
            { x: N, y: -0.35, z: 0 },
            { x: N, y: M + 1.15, z: 0 },
            '',
            colors.text
        );
        drawAxis(
            cssWidth, cssHeight,
            { x: N, y: 0, z: 0.35 },
            { x: N, y: 0, z: -(L + 1.15) },
            '',
            colors.audio
        );

        drawPolyline(series.instruction, colors.instruction, cssWidth, cssHeight);
        drawPolyline(series.text, colors.text, cssWidth, cssHeight);
        drawPolyline(series.audio, colors.audio, cssWidth, cssHeight);

        // Index marks: keep below / right of each endpoint
        drawMark({ x: 0, y: 0, z: 0 }, '0', colors.instruction, cssWidth, cssHeight, 'below');
        drawMark({ x: N, y: 0, z: 0 }, 'N', colors.label, cssWidth, cssHeight, 'below');
        drawMark({ x: N, y: M, z: 0 }, 'M', colors.text, cssWidth, cssHeight, 'below-right');
        drawMark({ x: N, y: 0, z: -L }, 'L', colors.audio, cssWidth, cssHeight, 'below-right');

        // Modality names outside the geometry — Instruction at the 0 end
        var instrTip = project({ x: 0, y: 0, z: 0 }, cssWidth, cssHeight);
        var textTip = project({ x: N, y: M + 1.15, z: 0 }, cssWidth, cssHeight);
        var audioTip = project({ x: N, y: 0, z: -(L + 1.15) }, cssWidth, cssHeight);
        drawLabel('Instruction', instrTip.x, instrTip.y, colors.instruction, 'left', '700 13px Inter, sans-serif');
        drawLabel('Text', textTip.x, textTip.y, colors.text, 'right', '700 13px Inter, sans-serif');
        drawLabel('Audio', audioTip.x, audioTip.y, colors.audio, 'below-right', '700 13px Inter, sans-serif');

        // Plane caption near the lower-right corner of the align face
        var planeTag = project({ x: N, y: M * 0.72, z: -L * 0.18 }, cssWidth, cssHeight);
        drawLabel('aligned at N', planeTag.x, planeTag.y, 'rgba(37, 99, 235, 0.78)', 'below-right', '600 11px Inter, sans-serif');
    }

    function pointerDown(clientX, clientY) {
        dragging = true;
        lastX = clientX;
        lastY = clientY;
        canvas.classList.add('is-dragging');
    }

    function pointerMove(clientX, clientY) {
        if (!dragging) return;
        yaw += (clientX - lastX) * 0.008;
        pitch += (clientY - lastY) * 0.008;
        pitch = Math.max(-1.15, Math.min(1.15, pitch));
        lastX = clientX;
        lastY = clientY;
        render();
    }

    function pointerUp() {
        dragging = false;
        canvas.classList.remove('is-dragging');
    }

    canvas.addEventListener('mousedown', function (e) {
        pointerDown(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', function (e) {
        pointerMove(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', pointerUp);

    canvas.addEventListener('touchstart', function (e) {
        if (!e.touches.length) return;
        pointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    canvas.addEventListener('touchmove', function (e) {
        if (!e.touches.length) return;
        pointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    canvas.addEventListener('touchend', pointerUp);
    canvas.addEventListener('touchcancel', pointerUp);

    canvas.addEventListener('wheel', function (e) {
        e.preventDefault();
        scale *= e.deltaY > 0 ? 0.94 : 1.06;
        scale = Math.max(0.55, Math.min(2.2, scale));
        render();
    }, { passive: false });

    window.addEventListener('resize', function () {
        render();
    });

    render();
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
    setupSampleTableCollapse(5);
    setupPageSubnavSpy();
    setupBrandAudioPlayers();
    setupRope3dViz();

})
