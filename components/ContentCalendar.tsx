'use client';
import { useState } from 'react';
import { FaCalendarPlus } from 'react-icons/fa';

interface ContentItem {
  type: string;  // 'newsletter' | 'tweet' | 'article' | 'short-form' | 'thread' | etc.
  title: string;
  icon?: string;
}

interface ContentCalendarProps {
  days?: {
    monday?: ContentItem[];
    tuesday?: ContentItem[];
    wednesday?: ContentItem[];
    thursday?: ContentItem[];
    friday?: ContentItem[];
    saturday?: ContentItem[];
    sunday?: ContentItem[];
  };
}

const DAY_MAPPING = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};

// Default content type icons
const CONTENT_TYPE_ICONS: Record<string, string> = {
  newsletter: '📩',
  article: '✍️',
  tweet: '🐦',
  'short-form': '📱',
  thread: '🧵',
  video: '🎥',
  story: '📖',
  carousel: '🔄',
  infographic: '📊',
  poll: '📊',
  livestream: '📡',
  podcast: '🎙️',
  reel: '🎬',
  challenge: '🏆'
};

export default function ContentCalendar({ days = {} }: ContentCalendarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Helper function to get content for a specific day
  const getDayContent = (day: string): ContentItem[] => {
    return days[day as keyof typeof days] || [];
  };

  // Get content type icon
  const getContentIcon = (type: string): string => {
    return CONTENT_TYPE_ICONS[type] || '📄';
  };

  // Helper function to create calendar events
  const createCalendarEvent = (provider: string) => {
    const allEvents: { title: string; description: string; day: number }[] = [];
    
    // Collect all events from the week
    dayNames.forEach((day, index) => {
      const dayContent = getDayContent(day);
      if (dayContent.length > 0) {
        dayContent.forEach(item => {
          allEvents.push({
            title: `${item.type}: ${item.title}`,
            description: `Content type: ${item.type}\nTitle: ${item.title}`,
            day: index + 1, // 1 = Monday, 7 = Sunday
          });
        });
      }
    });
    
    if (allEvents.length === 0) {
      alert('No content found to add to calendar');
      return;
    }
    
    // Get next week's dates starting from Monday
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // If Sunday (0), add 1 day, otherwise add days until next Monday
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    
    // Create calendar URL based on provider
    switch (provider) {
      case 'google': {
        const events = allEvents.map(event => {
          const eventDate = new Date(nextMonday);
          eventDate.setDate(nextMonday.getDate() + event.day - 1); // Adjust to the correct day of the week
          const startDate = eventDate.toISOString().replace(/-|:|\.\d+/g, '');
          
          // End date is 1 hour later
          const endDate = new Date(eventDate);
          endDate.setHours(endDate.getHours() + 1);
          const endDateStr = endDate.toISOString().replace(/-|:|\.\d+/g, '');
          
          return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDateStr}&details=${encodeURIComponent(event.description)}`;
        });
        
        // Open each event in a new tab
        events.forEach(url => window.open(url, '_blank'));
        break;
      }
      
      case 'outlook': {
        const events = allEvents.map(event => {
          const eventDate = new Date(nextMonday);
          eventDate.setDate(nextMonday.getDate() + event.day - 1);
          const startDate = eventDate.toISOString().replace(/-|:|\.\d+/g, '');
          
          // End date is 1 hour later
          const endDate = new Date(eventDate);
          endDate.setHours(endDate.getHours() + 1);
          const endDateStr = endDate.toISOString().replace(/-|:|\.\d+/g, '');
          
          return `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(event.description)}&startdt=${startDate}&enddt=${endDateStr}`;
        });
        
        // Open each event in a new tab
        events.forEach(url => window.open(url, '_blank'));
        break;
      }
      
      case 'apple': {
        // Apple Calendar uses .ics files
        alert('For Apple Calendar: Please add events to Google Calendar, then export to .ics file and import to Apple Calendar');
        // Redirect to Google Calendar as a fallback
        createCalendarEvent('google');
        break;
      }
      
      default:
        break;
    }
    
    setDropdownOpen(false);
  };

  return (
    <div className="card bg-base-100 shadow-lg rounded-xl border border-base-300 relative">
      {/* Add to Calendar Button */}
      <div className="absolute top-3 right-3 z-10">
        <div className="dropdown dropdown-end">
          <button 
            className="btn btn-sm btn-primary flex items-center gap-2"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaCalendarPlus />
            <span>Add to Calendar</span>
          </button>
          {dropdownOpen && (
            <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1">
              <li><a onClick={() => createCalendarEvent('google')}>Google Calendar</a></li>
              <li><a onClick={() => createCalendarEvent('outlook')}>Outlook</a></li>
              <li><a onClick={() => createCalendarEvent('apple')}>Apple Calendar</a></li>
            </ul>
          )}
        </div>
      </div>
      
      <div className="card-body p-0">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 text-center font-semibold bg-base-200 rounded-t-xl">
          {dayNames.map((day) => (
            <div key={day} className="py-3 px-2 first:rounded-tl-xl last:rounded-tr-xl">
              {DAY_MAPPING[day as keyof typeof DAY_MAPPING]}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-base-300">
          {dayNames.map((day) => {
            const content = getDayContent(day);
            return (
              <div key={day} className="p-4 min-h-[200px] hover:bg-base-100/50 transition-colors">
                <h4 className="font-medium text-base text-primary mb-3">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </h4>
                {content.length > 0 ? (
                  <ul className="space-y-3 text-sm">
                    {content.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-lg" role="img" aria-label={item.type}>
                          {item.icon || getContentIcon(item.type)}
                        </span>
                        <div>
                          <div className="font-medium">{item.type}</div>
                          <div className="text-base-content/70">{item.title}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  // Show sample content layout when empty
                  <ul className="space-y-3 text-sm opacity-30">
                    <li className="flex items-start gap-2">
                      <span className="text-lg">📱</span>
                      <div>
                        <div className="font-medium">Short-form post</div>
                        <div className="text-base-content/70">Daily insight</div>
                      </div>
                    </li>
                    {day === 'monday' || day === 'wednesday' || day === 'friday' ? (
                      <li className="flex items-start gap-2">
                        <span className="text-lg">✍️</span>
                        <div>
                          <div className="font-medium">Article</div>
                          <div className="text-base-content/70">Weekly value</div>
                        </div>
                      </li>
                    ) : null}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}