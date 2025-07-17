import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Conditionally import puppeteer based on environment
let puppeteer: typeof import("puppeteer") | typeof import("puppeteer-core");
let chromium: any;

async function loadPuppeteerAndChromium() {
  if (process.env.NODE_ENV === "production") {
    puppeteer = await import("puppeteer-core");
    chromium = await import("@sparticuz/chromium");
  } else {
    puppeteer = await import("puppeteer");
  }
}

interface SlideData {
  id: string;
  title: string;
  content: string;
  type: string;
  layout: string;
  order_index: number;
  image_url?: string;
  image_alt?: string;
  speaker_notes?: string;
}

interface PresentationData {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  theme: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  slides: SlideData[];
}

export async function POST(request: NextRequest) {
  await loadPuppeteerAndChromium();
  const supabase = await createClient();

  // Authenticate user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  let requestData: { presentationId: string };
  try {
    requestData = await request.json();
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { presentationId } = requestData;
  if (!presentationId) {
    return NextResponse.json(
      { error: "Presentation ID is required" },
      { status: 400 }
    );
  }

  let browser;
  try {
    // Fetch presentation data from Supabase (for validation and filename only)
    const { data: presentation, error: presentationError } = await supabase
      .from("presentations")
      .select("id, title")
      .eq("id", presentationId)
      .eq("user_id", user.id)
      .single();

    if (presentationError || !presentation) {
      return NextResponse.json(
        { error: "Presentation not found or access denied" },
        { status: 404 }
      );
    }

    // Launch Puppeteer
    if (process.env.NODE_ENV === "production") {
      const executablePath = await chromium.executablePath();
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
        // @ts-expect-error: chromium types are not compatible with puppeteer, but this is required for Vercel
        ignoreHTTPSErrors: true,
      });
    } else {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      });
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Forward the user's cookies to Puppeteer for authentication
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_SITE_URL || "https://your-production-url.com"
        : "http://localhost:3000";
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((cookieStr) => {
        const [name, ...rest] = cookieStr.trim().split("=");
        return {
          name,
          value: rest.join("="),
          domain:
            process.env.NODE_ENV === "production"
              ? new URL(baseUrl).hostname
              : "localhost",
          path: "/",
        };
      });
      await page.setCookie(...cookies);
    }

    // Use Puppeteer to navigate to the print-presentation route and render the real slides
    const printUrl = `${baseUrl}/print-presentation/${presentationId}`;
    await page.goto(printUrl, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      displayHeaderFooter: false,
    });

    const fileName = `${presentation.title.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_presentation.pdf`;
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("[PDF Export] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function generatePresentationHTML(presentation: PresentationData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${presentation.title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #fff;
          color: #222;
          margin: 0;
          padding: 0;
        }
        .presentation-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 30px 0 10px 0;
          border-bottom: 3px solid #3b82f6;
        }
        .presentation-title {
          font-size: 2.5em;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 10px;
        }
        .slide {
          page-break-after: always;
          margin: 0 auto 40px auto;
          max-width: 900px;
          background: #f9fafb;
          border-radius: 16px;
          box-shadow: 0 2px 12px #0001;
          padding: 40px 40px 30px 40px;
          min-height: 600px;
        }
        .slide-title {
          font-size: 2em;
          font-weight: 600;
          color: #3b82f6;
          margin-bottom: 20px;
        }
        .slide-content {
          font-size: 1.2em;
          margin-bottom: 20px;
        }
        .slide-image {
          display: block;
          margin: 30px auto 0 auto;
          max-width: 100%;
          max-height: 350px;
          border-radius: 12px;
          box-shadow: 0 2px 8px #0002;
        }
        .slide-notes {
          margin-top: 30px;
          font-size: 0.95em;
          color: #666;
          background: #e0e7ef;
          padding: 12px 18px;
          border-radius: 8px;
        }
      </style>
    </head>
    <body>
      <div class="presentation-header">
        <h1 class="presentation-title">${presentation.title}</h1>
        <div style="margin-top: 10px; color: #666;">
          <span style="background: #f3f4f6; padding: 4px 12px; border-radius: 20px; font-weight: 500;">
            ${
              presentation.difficulty.charAt(0).toUpperCase() +
              presentation.difficulty.slice(1)
            }
          </span>
        </div>
      </div>
      ${presentation.slides
        .map(
          (slide, idx) => `
        <div class="slide">
          <div class="slide-title">${slide.title}</div>
          <div class="slide-content">${
            slide.content ? slide.content.replace(/\n/g, "<br/>") : ""
          }</div>
          ${
            slide.image_url
              ? `<img class="slide-image" src="${slide.image_url}" alt="${
                  slide.image_alt || ""
                }" />`
              : ""
          }
          ${
            slide.speaker_notes
              ? `<div class="slide-notes"><strong>Speaker Notes:</strong> ${slide.speaker_notes}</div>`
              : ""
          }
        </div>
      `
        )
        .join("")}
      <div style="margin-top: 50px; text-align: center; color: #6b7280; font-size: 0.9em;">
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>This presentation was created using AI-powered content generation</p>
      </div>
    </body>
    </html>
  `;
}
