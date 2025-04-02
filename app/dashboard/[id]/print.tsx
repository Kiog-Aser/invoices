"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useParams } from "next/navigation";
import { FaCopy } from "react-icons/fa";
import LoadingView from "@/components/LoadingView";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";

interface PublishingCalendarItem {
  day: string;
  contentType: string;
  notes: string;
}

interface ContentType {
  name: string;
  purpose: string;
  format: string;
  frequency: string;
}

interface ContentCreationSystem {
  ideationProcess: string;
  creationWorkflow: string;
  reviewProcess: string;
}

interface WritingProtocol {
  _id: string;
  name: string;
  styleGuide: {
    voiceAndTone: string;
    grammarRules: string;
    formattingGuidelines: string;
  };
  targetAudience: {
    demographics: string;
    painPoints: string;
    goalsAndAspirations: string;
  };
  contentTypes: ContentType[];
  publishingCalendar: PublishingCalendarItem[];
  researchProcess: {
    sources: string;
    factChecking: string;
    citationStyle: string;
  };
  contentCreationSystem: ContentCreationSystem;
  promotionStrategy: {
    distributionChannels: string;
    sharingSchedule: string;
    engagementTactics: string;
  };
}

// Define specific type for day key of calendar days
interface CalendarDays {
  [key: string]: { type: string; title: string; icon?: string }[];
}

export default function PrintWritingProtocol() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [protocol, setProtocol] = useState<WritingProtocol | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProtocol = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch(`/api/writing-protocol/${params.id}`);
          
          if (!response.ok) {
            if (response.status === 404) {
              notFound();
            }
            throw new Error("Failed to fetch protocol");
          }
          
          const data = await response.json();
          setProtocol(data);
        } catch (error) {
          console.error("Error fetching protocol:", error);
          toast.error("Failed to load the protocol");
        } finally {
          setLoading(false);
        }
      }
    };

    if (status === "authenticated") {
      fetchProtocol();
    }
  }, [params.id, status]);

  // Function to generate PDF
  const generatePDF = async () => {
    if (!protocol) return;
    
    setGenerating(true);
    toast.loading("Generating PDF...");
    
    try {
      // Select the print container
      const printContainer = document.getElementById("print-container");
      if (!printContainer) {
        toast.error("Print container not found");
        return;
      }
      
      // Set up PDF document with A4 size
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      // Define PDF dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Create a clone to avoid modifying the original DOM
      const clonedContainer = printContainer.cloneNode(true) as HTMLElement;
      document.body.appendChild(clonedContainer);
      clonedContainer.style.position = 'absolute';
      clonedContainer.style.left = '-9999px';
      clonedContainer.style.width = `${pageWidth * 3.779527559}px`; // Convert mm to px
      
      // Get reference to theme colors
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--p') || '#570df8';  
      const primaryContentColor = getComputedStyle(document.documentElement).getPropertyValue('--pc') || '#fff';
      const baseColor = getComputedStyle(document.documentElement).getPropertyValue('--b1') || '#ffffff';
      const baseContentColor = getComputedStyle(document.documentElement).getPropertyValue('--bc') || '#1f2937';
      const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--s') || '#f000b8';
      
      // Add styling for better appearance in PDF
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        * { 
          box-sizing: border-box; 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        }
        body { 
          background-color: ${baseColor}; 
          color: ${baseContentColor}; 
          line-height: 1.6;
        }
        .print-container {
          padding: 20px;
          max-width: 100%;
        }
        h1, h2, h3, h4 { 
          color: ${baseContentColor}; 
          margin-top: 24px; 
          margin-bottom: 12px; 
          font-weight: 600;
        }
        h1 { 
          font-size: 32px; 
          font-weight: 800; 
          color: ${baseContentColor};
        }
        h2 { 
          font-size: 24px; 
          font-weight: 700;
          color: ${baseContentColor}; 
          border-bottom: 2px solid ${primaryColor}; 
          padding-bottom: 6px;
          margin-top: 36px;
        }
        h3 { 
          font-size: 18px; 
          font-weight: 600; 
          color: ${baseContentColor};
          margin-top: 24px;
        }
        p, li { 
          font-size: 14px; 
          line-height: 1.6; 
          color: ${baseContentColor}; 
          opacity: 0.85;
        }
        strong {
          font-weight: 600;
          color: ${baseContentColor};
          opacity: 1;
        }
        ul, ol { 
          padding-left: 24px; 
          margin-bottom: 16px;
        }
        li { 
          margin-bottom: 8px; 
        }
        .content-section { 
          background-color: ${baseColor}; 
          padding: 24px;
          margin-bottom: 24px; 
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .section-title { 
          font-weight: 700; 
          color: ${baseContentColor}; 
          margin-bottom: 20px;
          display: flex;
          align-items: center;
        }
        .section-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background-color: ${primaryColor}; 
          color: ${primaryContentColor};
          border-radius: 50%;
          margin-right: 12px;
          font-weight: bold;
        }
        .section-content { 
          margin-left: 12px; 
          padding: 16px;
          background-color: ${baseColor};
          border-radius: 8px;
        }
        .calendar-item { 
          border: 1px solid rgba(0, 0, 0, 0.1); 
          padding: 12px; 
          margin-bottom: 12px; 
          border-radius: 8px;
          background-color: ${baseColor};
        }
        .calendar-day { 
          font-weight: 600; 
          color: ${primaryColor}; 
          margin-bottom: 4px;
        }
        .text-muted { 
          color: ${baseContentColor}; 
          opacity: 0.6;
          font-size: 13px;
        }
        .title-page {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          text-align: center;
        }
        .title-page h1 {
          font-size: 36px;
          color: ${primaryColor};
          margin-bottom: 12px;
        }
        .title-page p {
          font-size: 18px;
          color: ${baseContentColor};
          opacity: 0.8;
        }
        .toc-page {
          padding: 40px;
        }
        .toc-page h1 {
          margin-bottom: 32px;
        }
        .toc-page ol {
          list-style-type: decimal;
        }
        .toc-page li {
          margin-bottom: 16px;
          font-size: 16px;
        }
        .badge {
          display: inline-block;
          background-color: ${primaryColor}20;
          color: ${primaryColor};
          padding: 4px 8px;
          border-radius: 16px;
          font-size: 12px;
          margin-right: 8px;
        }
        .subsection-title {
          color: ${baseContentColor};
          font-weight: 600;
          margin-top: 16px;
          margin-bottom: 8px;
          font-size: 16px;
        }
      `;
      clonedContainer.appendChild(styleElement);
      
      // Set a clean white background for each page
      const setWhiteBackground = (canvas: HTMLCanvasElement) => {
        const context = canvas.getContext('2d');
        if (context) {
          // Save current state
          context.save();
          // Set white background
          context.globalCompositeOperation = 'destination-over';
          context.fillStyle = baseColor;
          context.fillRect(0, 0, canvas.width, canvas.height);
          // Restore state
          context.restore();
        }
      };
      
      // Process each section
      let currentPage = 0;
      
      // Add title page
      const titleSection = document.createElement('div');
      titleSection.className = 'title-page';
      titleSection.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 700px; text-align: center;">
          <h1>${protocol.name}</h1>
          <p>Writing Protocol</p>
          <div style="margin-top: 60px; opacity: 0.5;">Generated on ${new Date().toLocaleDateString()}</div>
        </div>
      `;
      clonedContainer.appendChild(titleSection);
      
      // First render the title page
      const titleCanvas = await html2canvas(titleSection, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
      });
      
      setWhiteBackground(titleCanvas);
      
      // Add title page to PDF
      const titleImgData = titleCanvas.toDataURL('image/png');
      pdf.addImage(
        titleImgData,
        'PNG',
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        'FAST'
      );
      
      // Add a table of contents page
      pdf.addPage();
      const tocSection = document.createElement('div');
      tocSection.className = 'toc-page';
      tocSection.innerHTML = `
        <div>
          <h1>Table of Contents</h1>
          <ol>
            <li>Writing Style Guide</li>
            <li>Target Audience</li>
            <li>Content Types</li>
            <li>Publishing Calendar</li>
            <li>Research Process</li>
            <li>Content Creation System</li>
            <li>Promotion Strategy</li>
          </ol>
        </div>
      `;
      clonedContainer.appendChild(tocSection);
      
      const tocCanvas = await html2canvas(tocSection, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      setWhiteBackground(tocCanvas);
      
      const tocImgData = tocCanvas.toDataURL('image/png');
      pdf.addImage(
        tocImgData,
        'PNG',
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        'FAST'
      );
      
      currentPage = 2; // We already have title and TOC pages
      
      // Get all content sections that need to be captured
      const contentSections = printContainer.querySelectorAll(".content-section");
      
      // Now process main content sections
      for (const section of Array.from(contentSections)) {
        // Create a new page for each section
        if (currentPage > 0) {
          pdf.addPage();
        }
        currentPage++;
        
        // Render the section to canvas
        const canvas = await html2canvas(section as HTMLElement, {
          scale: 2, // Higher scale for better quality
          logging: false,
          useCORS: true,
          backgroundColor: baseColor,
        });
        
        setWhiteBackground(canvas);
        
        // Convert the canvas to an image
        const imgData = canvas.toDataURL('image/png');
        
        // Add the image to the PDF
        pdf.addImage(
          imgData,
          'PNG',
          0,
          0,
          pageWidth,
          pageHeight,
          undefined,
          'FAST'
        );
      }
      
      // Remove the cloned container
      document.body.removeChild(clonedContainer);
      
      // Save the PDF
      const filename = protocol?.name ? `${protocol.name.replace(/\s+/g, '-').toLowerCase()}-writing-protocol.pdf` : 'writing-protocol.pdf';
      pdf.save(filename);
      
      toast.dismiss();
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  // Handle print with proper sidebar hiding
  const handlePrint = () => {
    // Temporarily hide the sidebar and adjust layout for printing
    const sidebar = document.querySelector('.sidebar-navigation');
    const mainContent = document.querySelector('.main-content-wrapper');
    
    if (sidebar && mainContent) {
      // Save original classes to restore after print
      const originalSidebarDisplay = (sidebar as HTMLElement).style.display;
      const originalMainContentClass = mainContent.className;
      
      // Adjust for printing
      (sidebar as HTMLElement).style.display = 'none';
      mainContent.className = 'print-layout';
      
      // Trigger print
      window.print();
      
      // Restore original layout after print dialog closes
      setTimeout(() => {
        (sidebar as HTMLElement).style.display = originalSidebarDisplay;
        mainContent.className = originalMainContentClass;
      }, 1000);
    } else {
      // Fallback if elements aren't found
      window.print();
    }
  };

  // Fix for safely handling dayKey in calendar data
  const getCalendarContent = (days: CalendarDays, dayKey: string) => {
    if (dayKey in days) {
      return days[dayKey] || [];
    }
    return [];
  };

  // Handle clipboard copy with proper prompt text
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        toast.error("Failed to copy to clipboard");
      });
  };

  useEffect(() => {
    // Generate PDF automatically when protocol is loaded
    if (protocol && !loading) {
      generatePDF();
    }
  }, [protocol, loading]);

  if (loading) {
    return <LoadingView />;
  }

  return (
    <div className="print-layout">
      <div id="print-container" className="print-container">
        {protocol && (
          <>
            {/* Writing Style Guide */}
            <div className="content-section">
              <h2 className="section-title">
                <span className="section-number">1</span>
                Writing Style Guide
              </h2>
              <div className="section-content">
                <h3 className="subsection-title">Voice & Tone</h3>
                <p>{protocol.styleGuide.voiceAndTone}</p>
                
                <h3 className="subsection-title">Grammar Rules</h3>
                <p>{protocol.styleGuide.grammarRules}</p>
                
                <h3 className="subsection-title">Formatting Guidelines</h3>
                <p>{protocol.styleGuide.formattingGuidelines}</p>
              </div>
            </div>
            
            {/* Target Audience */}
            <div className="content-section">
              <h2 className="section-title">
                <span className="section-number">2</span>
                Target Audience
              </h2>
              <div className="section-content">
                <h3 className="subsection-title">Audience Demographics</h3>
                <p>{protocol.targetAudience.demographics}</p>
                
                <h3 className="subsection-title">Pain Points</h3>
                <p>{protocol.targetAudience.painPoints}</p>
                
                <h3 className="subsection-title">Goals & Aspirations</h3>
                <p>{protocol.targetAudience.goalsAndAspirations}</p>
              </div>
            </div>
            
            {/* Content Types */}
            <div className="content-section">
              <h2 className="section-title">
                <span className="section-number">3</span>
                Content Types
              </h2>
              <div className="section-content">
                <ul>
                  {protocol.contentTypes.map((type: ContentType, index: number) => (
                    <li key={index} style={{marginBottom: '20px'}}>
                      <h3 className="subsection-title">{type.name}</h3>
                      <p><strong>Purpose:</strong> {type.purpose}</p>
                      <p><strong>Format:</strong> {type.format}</p>
                      <p><strong>Frequency:</strong> <span className="badge">{type.frequency}</span></p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Publishing Calendar */}
            <div className="content-section">
              <h2 className="section-title">
                <span className="section-number">4</span>
                Publishing Calendar
              </h2>
              <div className="section-content">
                {protocol.publishingCalendar.map((item: PublishingCalendarItem, index: number) => (
                  <div key={index} className="calendar-item">
                    <div className="calendar-day">{item.day}</div>
                    <div className="calendar-content">{item.contentType}</div>
                    <div className="text-muted">{item.notes}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Research Process */}
            <div className="content-section">
              <h2 className="section-title">
                <span className="section-number">5</span>
                Research Process
              </h2>
              <div className="section-content">
                <h3 className="subsection-title">Sources</h3>
                <p>{protocol.researchProcess.sources}</p>
                
                <h3 className="subsection-title">Fact-Checking</h3>
                <p>{protocol.researchProcess.factChecking}</p>
                
                <h3 className="subsection-title">Citation Style</h3>
                <p>{protocol.researchProcess.citationStyle}</p>
              </div>
            </div>
            
            {/* Content Creation System */}
            <div className="content-section">
              <h2 className="section-title">
                <span className="section-number">6</span>
                Content Creation System
              </h2>
              <div className="section-content">
                <h3 className="subsection-title">Ideation Process</h3>
                <p>{protocol.contentCreationSystem?.ideationProcess || "Define your process for generating content ideas."}</p>
                
                <h3 className="subsection-title">Creation Workflow</h3>
                <p>{protocol.contentCreationSystem?.creationWorkflow || "Outline the steps from draft to publication."}</p>
                
                <h3 className="subsection-title">Review & Approval</h3>
                <p>{protocol.contentCreationSystem?.reviewProcess || "Specify who reviews content and what they look for."}</p>
              </div>
            </div>
            
            {/* Promotion Strategy */}
            <div className="content-section">
              <h2 className="section-title">
                <span className="section-number">7</span>
                Promotion Strategy
              </h2>
              <div className="section-content">
                <h3 className="subsection-title">Distribution Channels</h3>
                <p>{protocol.promotionStrategy.distributionChannels}</p>
                
                <h3 className="subsection-title">Sharing Schedule</h3>
                <p>{protocol.promotionStrategy.sharingSchedule}</p>
                
                <h3 className="subsection-title">Engagement Tactics</h3>
                <p>{protocol.promotionStrategy.engagementTactics}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}