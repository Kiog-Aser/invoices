(async function() {
  try {
    const scriptTag = document.currentScript;
    const websiteId = scriptTag.getAttribute('data-website-id');

    if (!websiteId) {
      console.error('PoopUp: No website ID provided');
      return;
    }

    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 24px;
      z-index: 9999;
      width: 100%;
      max-width: 320px;
      right: 24px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      pointer-events: none;
    `;

    // Center container on mobile
    if (window.innerWidth <= 768) {
      container.style.alignItems = 'center';
      container.style.right = '50%';
      container.style.transform = 'translateX(50%)';
      container.style.maxWidth = '90%';
    }

    document.body.appendChild(container);

    // Add base styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes poopup-slide {
        from { 
          opacity: 0; 
          transform: translateY(-120px);
        }
        to { 
          opacity: 1; 
          transform: translateY(0);
        }
      }

      /* Theme Styles */
      .poopup {
        margin-bottom: 12px;
        padding: 14px;
        position: relative;
        animation: poopup-slide 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        cursor: default;
        max-width: calc(100% - 20px);
      }

      @media (max-width: 768px) {
        .poopup {
          animation-duration: 0.5s;
          animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      }

      /* iOS Theme */
      .poopup.theme-ios {
      border-radius: 1rem;
      background-color: rgba(230, 230, 230, 0.2);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      }

      /* Modern Light Theme */
      .poopup.theme-modern {
      border-radius: 0.75rem;
      background-color: #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border: 1px solid rgba(66, 153, 225, 0.1);
      }

      /* Modern Dark Theme */
      .poopup.theme-dark {
      border-radius: 0.75rem;
      background-color: #1f2937;
      color: #f3f4f6;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.1);
      }

      /* Minimal Theme */
      .poopup.theme-minimal {
      border-radius: 0.375rem;
      background-color: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border-left: 4px solid #4299e1;
      }

      /* Glass Theme */
      .poopup.theme-glass {
      border-radius: 0.5rem;
      background-color: rgba(255,255,255,0.4);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.3);
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      }

      /* Colorful Theme */
      .poopup.theme-colorful {
      border-radius: 0.75rem;
      background: linear-gradient(to right, #4299e1, #9f7aea);
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }

      /* iOS-style close button - positioned outside and above */
      .poopup-close {
      position: absolute;
      top: -8px;
      left: -8px;
      width: 20px;
      height: 20px;
      background-color: rgba(230, 230, 230, 0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.9;
      font-size: 15px;
      line-height: 1;
      color: black;
      z-index: 2;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      transition: background-color 0.2s;
      }

      .poopup-close:hover {
      background-color: rgba(181, 178, 178, 0.15);
      }

      .poopup-content {
      display: flex;
      align-items: center; /* Center images vertically */
      gap: 12px;
      }

      .poopup-image {
      width: 32px; /* Match dashboard size */
      height: 32px; /* Match dashboard size */
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
      }

      .poopup-text {
      flex: 1;
      min-width: 0;
      }

      .poopup-title {
      font-weight: 500;
      margin-bottom: 2px;
      font-size: 14px;
      line-height: 1.2;
      }

      .poopup-message {
      font-size: 12px; /* Slightly smaller */
      opacity: 0.7;
      line-height: 1.2;
      }

      /* Dark theme text colors */
      .poopup.theme-dark .poopup-message {
      opacity: 0.8;
      }

      /* Colorful theme text */
      .poopup.theme-colorful .poopup-message {
      opacity: 0.9;
      }

      .poopup-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 6px;
      margin-bottom: 2px;
      }

      .poopup-timestamp {
      font-size: 11px;
      white-space: nowrap;
      opacity: 0.7;
      line-height: 1.2;
      margin-top: 1px; /* Align with title */
      }

      .poopup.theme-ios .poopup-timestamp {
      color: rgba(0, 0, 0, 0.7);
      }

      .poopup.theme-dark .poopup-timestamp {
      color: rgba(255, 255, 255, 0.7);
      }

      .poopup.theme-colorful .poopup-timestamp {
      color: rgba(255, 255, 255, 0.9);
      }

      /* Mobile-specific styles */
      @media (max-width: 768px) {
        .poopup {
          width: 100%;
          margin-left: auto;
          margin-right: auto;
          pointer-events: auto;
        }

        /* Only show the last notification on mobile */
        .poopup:not(:last-child) {
          display: none;
        }
      }

      /* Restore all other styles */
      .poopup {
      margin-bottom: 12px;
      padding: 14px; /* Reduced padding for smaller height */
      position: relative;
      animation: poopup-slide 0.3s ease forwards;
      cursor: default;
      max-width: calc(100% - 20px);
      }
    `;
    document.head.appendChild(style);

    const response = await fetch(`/api/website-notifications/${websiteId}/public`);
    if (!response.ok) throw new Error('Failed to load notifications');

    const data = await response.json();
    if (!data.notifications?.length) return;

    let index = 0;

    function showNotification(notification) {
      // On mobile, remove existing notification before showing new one
      if (window.innerWidth <= 768) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }

      const el = document.createElement('div');
      el.className = `poopup theme-${data.config.theme || 'ios'}`;
      el.style.width = '100%'; // Ensure each notification takes full width

      let contentHtml = '<div class="poopup-content">';

      if (notification.image) {
        contentHtml += `<img src="${notification.image}" class="poopup-image" alt="" />`;
      }

      contentHtml += '<div class="poopup-text">';
      contentHtml += `<div class="poopup-header"><span class="poopup-title">${notification.title}</span>`;
      if (notification.timestamp) {
        contentHtml += `<span class="poopup-timestamp">${notification.timestamp}</span>`;
      }
      contentHtml += '</div>';
      contentHtml += `<div class="poopup-message">${notification.body || notification.message}</div>`;
      contentHtml += '</div></div>';

      el.innerHTML = contentHtml;

      if (data.config.showCloseButton) {
        const closeBtn = document.createElement('span');
        closeBtn.className = 'poopup-close';
        closeBtn.textContent = '×';
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          el.style.opacity = '0';
          el.style.transform = 'translateY(-20px)';
          el.style.transition = 'all 0.3s ease-out';
          setTimeout(() => {
            if (container.contains(el)) {
              container.removeChild(el);
            }
          }, 300);
        };
        el.appendChild(closeBtn);
      }

      if (notification.url) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => window.open(notification.url, '_blank'));
      }

      container.appendChild(el);

      setTimeout(() => {
        if (container.contains(el)) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(-120px)';
          el.style.transition = window.innerWidth <= 768 
            ? 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' 
            : 'all 0.3s ease-out';
          setTimeout(() => {
            if (container.contains(el)) {
              container.removeChild(el);
            }
          }, 300);
        }
      }, data.config.displayDuration);
    }

    // Show first notification after initial delay
    setTimeout(() => {
      showNotification(data.notifications[0]);
      index = 1;

      // Setup interval for remaining notifications
      const interval = setInterval(() => {
        if (index >= data.notifications.length) {
          if (data.config.loop) {
            index = 0;
          } else {
            clearInterval(interval);
            return;
          }
        }
        showNotification(data.notifications[index++]);
      }, data.config.cycleDuration);
    }, data.config.startDelay);

  } catch (error) {
    console.error('PoopUp:', error);
  }
})();