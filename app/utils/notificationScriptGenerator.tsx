import { Notification } from "@/models/Notification";

export function generateEmbedScript(notifications: Notification[]): string {
  // Minified CSS styles for the notifications
  const styles = `
    .ios-notification{position:fixed;z-index:9999;left:50%;transform:translateX(-50%);width:350px;max-width:calc(100% - 20px);background-color:#F2F2F7;box-shadow:0 4px 10px rgba(0,0,0,0.1);border:1px solid rgba(255,255,255,0.18);border-radius:12px;padding:12px;overflow:hidden;transition:all 0.5s ease-in-out;opacity:0;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}.ios-notification.top{top:16px;transform:translate(-50%,-20px)}.ios-notification.bottom{bottom:16px;transform:translate(-50%,20px)}.ios-notification.visible{opacity:1;transform:translateX(-50%) translateY(0)}.ios-notification.leaving{opacity:0;transform:translateX(-50%) translateY(-20px)}.ios-notification.bottom.leaving{transform:translateX(-50%) translateY(20px)}.ios-notification-content{display:flex;align-items:flex-start}.ios-notification-icon{width:40px;height:40px;border-radius:8px;margin-right:12px;background-size:cover;background-position:center}.ios-notification-text{flex:1}.ios-notification-title{font-weight:600;font-size:14px;color:#000;margin-bottom:2px}.dark .ios-notification-title{color:#fff}.ios-notification-body{font-size:13px;color:#666;line-height:1.3}.dark .ios-notification-body{color:#aaa}@media (prefers-color-scheme:dark){.ios-notification{background-color:#1C1C1E;border-color:rgba(255,255,255,0.1)}.ios-notification-title{color:#fff}.ios-notification-body{color:#aaa}}
  `;

  // Convert notifications to JSON string for the script
  const notificationsJSON = JSON.stringify(notifications.map(n => ({
    title: n.title,
    body: n.body,
    icon: n.icon || null,
    url: n.url || null,
    duration: n.duration,
    position: n.position
  })));

  // Generate the embed script
  const script = `
    <script>
    (function() {
      // Add styles to head
      const style = document.createElement('style');
      style.textContent = '${styles}';
      document.head.appendChild(style);

      // Notifications data
      const notifications = ${notificationsJSON};
      let isDisplaying = false;
      let queue = [...notifications];
      let currentNotification = null;
      let timeout = null;

      // Function to show a notification
      function showNotification(notification) {
        if (isDisplaying) {
          return false;
        }
        
        isDisplaying = true;
        currentNotification = notification;
        
        const notificationElement = document.createElement('div');
        notificationElement.className = 'ios-notification ' + notification.position;
        
        // Build inner HTML
        let innerHtml = '<div class="ios-notification-content">';
        
        if (notification.icon) {
          innerHtml += '<div class="ios-notification-icon" style="background-image: url(' + notification.icon + ')"></div>';
        }
        
        innerHtml += '<div class="ios-notification-text">';
        innerHtml += '<div class="ios-notification-title">' + notification.title + '</div>';
        innerHtml += '<div class="ios-notification-body">' + notification.body + '</div>';
        innerHtml += '</div></div>';
        
        notificationElement.innerHTML = innerHtml;
        
        if (notification.url) {
          notificationElement.style.cursor = 'pointer';
          notificationElement.addEventListener('click', function() {
            window.open(notification.url, '_blank');
          });
        }
        
        document.body.appendChild(notificationElement);
        
        // Trigger animation in next frame
        setTimeout(() => {
          notificationElement.classList.add('visible');
        }, 10);
        
        // Set timeout to close notification
        timeout = setTimeout(() => {
          hideNotification(notificationElement);
        }, notification.duration);
        
        return true;
      }
      
      // Function to hide a notification
      function hideNotification(element) {
        element.classList.add('leaving');
        element.classList.remove('visible');
        
        setTimeout(() => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
          isDisplaying = false;
          currentNotification = null;
          
          // Show next notification if any
          showNextNotification();
        }, 500); // Animation duration
      }
      
      // Function to show next notification in queue
      function showNextNotification() {
        if (queue.length > 0) {
          const next = queue.shift();
          showNotification(next);
        }
      }
      
      // Start showing notifications after a delay
      setTimeout(showNextNotification, 2000);
    })();
    </script>
  `;

  return script;
}