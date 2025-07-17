// lib/pixabay.ts
// Pixabay API service for image search

export interface PixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  fullHDURL: string;
  imageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

export interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

export interface PixabaySearchOptions {
  q: string; // Search query
  image_type?: 'all' | 'photo' | 'illustration' | 'vector';
  category?: 'backgrounds' | 'fashion' | 'nature' | 'science' | 'education' | 'feelings' | 'health' | 'people' | 'religion' | 'places' | 'animals' | 'industry' | 'computer' | 'food' | 'sports' | 'transportation' | 'travel' | 'buildings' | 'business' | 'music';
  min_width?: number;
  min_height?: number;
  safesearch?: boolean;
  page?: number;
  per_page?: number; // 3-200, default 20
}

export class PixabayService {
  private apiKey: string;
  private baseUrl = 'https://pixabay.com/api/';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search for images on Pixabay
   * @param options Search options
   * @returns Promise<PixabayResponse>
   */
  async searchImages(options: PixabaySearchOptions): Promise<PixabayResponse> {
    const params = new URLSearchParams({
      key: this.apiKey,
      q: encodeURIComponent(options.q),
      image_type: options.image_type || 'photo',
      safesearch: (options.safesearch !== false).toString(),
      page: (options.page || 1).toString(),
      per_page: Math.min(options.per_page || 20, 200).toString(),
    });

    // Add optional parameters
    if (options.category) {
      params.append('category', options.category);
    }
    if (options.min_width) {
      params.append('min_width', options.min_width.toString());
    }
    if (options.min_height) {
      params.append('min_height', options.min_height.toString());
    }

    const url = `${this.baseUrl}?${params.toString()}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status} ${response.statusText}`);
      }

      const data: PixabayResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching images from Pixabay:', error);
      throw error;
    }
  }

  /**
   * Get the best image URL for a given size preference
   * @param image Pixabay image object
   * @param sizePreference Size preference: 'small', 'medium', 'large', 'original'
   * @returns Image URL
   */
  getImageUrl(image: PixabayImage, sizePreference: 'small' | 'medium' | 'large' | 'original' = 'medium'): string {
    switch (sizePreference) {
      case 'small':
        return image.previewURL;
      case 'medium':
        return image.webformatURL;
      case 'large':
        return image.largeImageURL || image.fullHDURL || image.webformatURL;
      case 'original':
        return image.imageURL || image.fullHDURL || image.largeImageURL || image.webformatURL;
      default:
        return image.webformatURL;
    }
  }

  /**
   * Get a resized version of the webformat image
   * @param webformatURL Original webformat URL
   * @param size Target size: 180, 340, 640, 960
   * @returns Resized image URL
   */
  getResizedImageUrl(webformatURL: string, size: 180 | 340 | 640 | 960): string {
    return webformatURL.replace('_640', `_${size}`);
  }

  /**
   * Search for images with specific keywords for presentation slides
   * @param keywords Array of keywords to search for
   * @param options Additional search options
   * @returns Promise<PixabayImage[]> Array of selected images
   */
  async searchImagesForSlides(
    keywords: string[], 
    options: Partial<PixabaySearchOptions> = {}
  ): Promise<PixabayImage[]> {
    const results: PixabayImage[] = [];
    
    for (const keyword of keywords) {
      try {
        const searchOptions: PixabaySearchOptions = {
          q: keyword,
          image_type: 'photo',
          safesearch: true,
          per_page: 5, // Get top 5 results for each keyword
          min_width: 640,
          min_height: 480,
          ...options
        };

        const response = await this.searchImages(searchOptions);
        
        if (response.hits.length > 0) {
          // Select the best image (highest quality/views ratio)
          const bestImage = response.hits.reduce((best, current) => {
            const bestScore = (best.views + best.likes * 10) / best.imageSize;
            const currentScore = (current.views + current.likes * 10) / current.imageSize;
            return currentScore > bestScore ? current : best;
          });
          
          results.push(bestImage);
        }
        
        // Add delay to respect rate limits (100 requests per 60 seconds)
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error searching for keyword "${keyword}":`, error);
        // Continue with other keywords even if one fails
      }
    }
    
    return results;
  }

  /**
   * Extract relevant keywords from slide content for image search
   * @param slideTitle Slide title
   * @param slideContent Slide content
   * @param slideType Slide type
   * @returns Array of search keywords
   */
  extractImageKeywords(
    slideTitle: string, 
    slideContent: string, 
    slideType: 'title' | 'content' | 'image' | 'chart' | 'conclusion'
  ): string[] {
    const keywords: string[] = [];
    
    // Combine title and content for analysis
    const text = `${slideTitle} ${slideContent}`.toLowerCase();
    
    // Remove common words and extract meaningful terms
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'can', 'may', 'might', 'must', 'shall', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under',
      'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
      'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
      'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very'
    ]);
    
    // Extract words (3+ characters, not common words)
    const words = text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 3 && !commonWords.has(word))
      .slice(0, 10); // Limit to top 10 words
    
    // Add specific keywords based on slide type
    switch (slideType) {
      case 'title':
        keywords.push(slideTitle.toLowerCase()); // Use the actual title as a keyword
        break;
      case 'conclusion':
        keywords.push(slideTitle.toLowerCase()); // Use the actual title as a keyword
        break;
      case 'chart':
        keywords.push('chart', 'graph', 'data', 'statistics');
        break;
      default:
        // For content slides, use extracted words
        break;
    }
    
    // Combine extracted words with type-specific keywords
    keywords.push(...words);
    
    // Remove duplicates and return top 3 keywords
    return [...new Set(keywords)].slice(0, 3);
  }
}

// Utility function to create Pixabay service instance
export function createPixabayService(): PixabayService {
  const apiKey = process.env.PIXABAY_API_KEY;
  
  if (!apiKey) {
    throw new Error('PIXABAY_API_KEY environment variable is not set');
  }
  
  return new PixabayService(apiKey);
}

// Default export
export default PixabayService;

