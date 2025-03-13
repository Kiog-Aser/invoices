import { Notification } from "@/models/Notification";

export const generateNotificationScript = (
  websiteId: string,
  notifications: Notification[]
) => {
  // Add default duration and delay if not set
  notifications.forEach(n => {
    if (!n.delay) n.delay = 3000;
  });

  const notificationsJSON = JSON.stringify(notifications.map(n => ({
    title: n.title,
    body: n.message,
    icon: n.image || null,
    url: n.url || null,
    duration: n.delay, // Using delay as duration
    theme: n.theme || "ios",
  })));

  return `
    (function() {
      var notifications = ${notificationsJSON};
      var scriptId = "nf-script";
      var existingScript = document.getElementById(scriptId);
      var scriptSrc = "https://notifast.co/js/embed.js";
      
      if (!existingScript) {
        var script = document.createElement("script");
        script.id = scriptId;
        script.src = scriptSrc;
        script.setAttribute("data-website-id", "${websiteId}");
        script.setAttribute("data-notifications", JSON.stringify(notifications));
        document.head.appendChild(script);
      }
    })();
  `;
};