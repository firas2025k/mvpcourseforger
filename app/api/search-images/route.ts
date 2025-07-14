// app/api/search-images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createPixabayService, PixabaySearchOptions } from '@/lib/pixabay';

export async function POST(request: NextRequest) {
  // Initialize Supabase client for authentication
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {}
        },
      },
    }
  );

  try {
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { 
      query, 
      image_type = 'photo',
      category,
      per_page = 20,
      page = 1,
      min_width = 640,
      min_height = 480,
      safesearch = true
    } = body;

    // 3. Validate required parameters
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ 
        error: 'Query parameter is required and must be a string' 
      }, { status: 400 });
    }

    if (query.length > 100) {
      return NextResponse.json({ 
        error: 'Query parameter cannot exceed 100 characters' 
      }, { status: 400 });
    }

    // 4. Validate optional parameters
    const validImageTypes = ['all', 'photo', 'illustration', 'vector'];
    if (!validImageTypes.includes(image_type)) {
      return NextResponse.json({ 
        error: `Invalid image_type. Must be one of: ${validImageTypes.join(', ')}` 
      }, { status: 400 });
    }

    const validCategories = [
      'backgrounds', 'fashion', 'nature', 'science', 'education', 'feelings', 
      'health', 'people', 'religion', 'places', 'animals', 'industry', 
      'computer', 'food', 'sports', 'transportation', 'travel', 'buildings', 
      'business', 'music'
    ];
    
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ 
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      }, { status: 400 });
    }

    if (per_page < 3 || per_page > 200) {
      return NextResponse.json({ 
        error: 'per_page must be between 3 and 200' 
      }, { status: 400 });
    }

    // 5. Create Pixabay service instance
    let pixabayService;
    try {
      pixabayService = createPixabayService();
    } catch (error) {
      console.error('Failed to create Pixabay service:', error);
      return NextResponse.json({ 
        error: 'Image search service is not configured. Please contact support.' 
      }, { status: 500 });
    }

    // 6. Prepare search options
    const searchOptions: PixabaySearchOptions = {
      q: query,
      image_type: image_type as 'all' | 'photo' | 'illustration' | 'vector',
      safesearch,
      page,
      per_page,
      min_width,
      min_height
    };

    if (category) {
      searchOptions.category = category as any;
    }

    // 7. Search for images
    const searchResults = await pixabayService.searchImages(searchOptions);

    // 8. Process and format results
    const processedResults = {
      total: searchResults.total,
      totalHits: searchResults.totalHits,
      page,
      per_page,
      images: searchResults.hits.map(image => ({
        id: image.id,
        tags: image.tags,
        previewURL: image.previewURL,
        webformatURL: image.webformatURL,
        largeImageURL: image.largeImageURL,
        fullHDURL: image.fullHDURL,
        imageWidth: image.imageWidth,
        imageHeight: image.imageHeight,
        views: image.views,
        downloads: image.downloads,
        likes: image.likes,
        user: image.user,
        pageURL: image.pageURL,
        // Add different size options
        sizes: {
          small: pixabayService.getImageUrl(image, 'small'),
          medium: pixabayService.getImageUrl(image, 'medium'),
          large: pixabayService.getImageUrl(image, 'large'),
          original: pixabayService.getImageUrl(image, 'original')
        }
      }))
    };

    return NextResponse.json({
      success: true,
      query,
      results: processedResults
    });

  } catch (error) {
    console.error('Error in image search API:', error);
    
    let errorMessage = 'Failed to search for images';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('Pixabay API error')) {
        errorMessage = 'External image service error. Please try again later.';
        statusCode = 503;
      } else if (error.message.includes('PIXABAY_API_KEY')) {
        errorMessage = 'Image search service is not configured.';
        statusCode = 500;
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage 
    }, { status: statusCode });
  }
}

export async function GET(request: NextRequest) {
  // Support GET requests with query parameters for simple searches
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ 
      error: 'Query parameter "q" is required' 
    }, { status: 400 });
  }

  // Convert GET request to POST format
  const body = {
    query,
    image_type: searchParams.get('image_type') || 'photo',
    category: searchParams.get('category'),
    per_page: parseInt(searchParams.get('per_page') || '20'),
    page: parseInt(searchParams.get('page') || '1'),
    min_width: parseInt(searchParams.get('min_width') || '640'),
    min_height: parseInt(searchParams.get('min_height') || '480'),
    safesearch: searchParams.get('safesearch') !== 'false'
  };

  // Create a new request with the body
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(body)
  });

  return POST(postRequest);
}

