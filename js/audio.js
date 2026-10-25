/**
 * Wedding Audio Controller
 * Plays "Jayamangala Gatha" (Traditional Auspicious Blessing Melody)
 * File: assets/audio/jayamangala_gatha.mp3
 */

class WeddingAudioManager {
  constructor() {
    this.isPlaying = false;
    this.audioElement = new Audio();
    this.audioElement.src = 'assets/audio/jayamangala_gatha.mp3';
    this.audioElement.loop = true;
    this.audioElement.preload = 'auto';

    this.initAudioElement();
    this.initUI();
  }

  initAudioElement() {
    this.audioElement.addEventListener('playing', () => {
      this.isPlaying = true;
      this.updateUI(true);
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateUI(false);
    });

    this.audioElement.addEventListener('error', (err) => {
      console.warn('Audio playback note:', err);
    });
  }

  initUI() {
    this.widget = document.getElementById('floating-audio-widget');
    this.bars = document.getElementById('audio-visualizer-bars');
    this.label = document.getElementById('audio-status-label');
    this.icon = document.getElementById('audio-play-icon');

    if (this.widget) {
      this.widget.addEventListener('click', () => this.togglePlayback());
    }
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.audioElement.pause();
    } else {
      this.audioElement.play().catch(err => {
        console.log('Audio autoplay policy:', err);
      });
    }
  }

  play() {
    if (!this.isPlaying) {
      this.audioElement.play().catch(err => {
        console.log('Audio user gesture required:', err);
      });
    }
  }

  pause() {
    if (this.isPlaying) {
      this.audioElement.pause();
    }
  }

  updateUI(playing) {
    if (!this.widget) return;

    if (playing) {
      this.widget.classList.add('playing');
      if (this.label) this.label.textContent = 'Jayamangala Gatha ♪';
      if (this.icon) {
        this.icon.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        `;
      }
    } else {
      this.widget.classList.remove('playing');
      if (this.label) this.label.textContent = 'Music Paused';
      if (this.icon) {
        this.icon.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;
      }
    }
  }
}

// Global instance
window.weddingAudio = null;
document.addEventListener('DOMContentLoaded', () => {
  window.weddingAudio = new WeddingAudioManager();
});
