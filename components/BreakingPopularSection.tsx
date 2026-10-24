import Image from 'next/image';
import Link from 'next/link';

export interface BreakingArticle {
  id: string;
  badge: string;
  category: string;
  title: string;
  date: string;
  image: string;
  href: string;
  is_breaking?: boolean;
}

export interface PopularArticle {
  id: string;
  categories: string[];
  title: string;
  excerpt: string;
  image: string;
  href: string;
  date?: string;
}

export interface BreakingPopularSectionProps {
  breaking?: BreakingArticle;
  popular?: PopularArticle[];
}

export default function BreakingPopularSection({
  breaking,
  popular,
}: BreakingPopularSectionProps) {
  if (!breaking && (!popular || popular.length === 0)) {
    return null;
  }

  const hasPopular = popular && popular.length > 0;

  return (
    <section
      aria-label="Breaking News and Recent News"
      className="w-full bg-white py-10 sm:py-12 md:py-14 border-b border-neutral-200/70"
    >
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-10 lg:items-stretch">
          {/* Left Column: Breaking News Spotlight */}
          {breaking && (
            <div className={`flex flex-col ${hasPopular ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-orange-500 animate-pulse" />
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                    Breaking News
                  </h2>
                </div>
              </div>

              <Link
                href={breaking.href}
                className="group relative flex flex-1 flex-col justify-end overflow-hidden rounded-none bg-neutral-950 shadow-sm transition-all duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1365A4] min-h-[460px] sm:min-h-[520px] lg:min-h-0"
              >
                {/* Image with smooth zoom on hover */}
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={breaking.image}
                    alt={breaking.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Cinematic Vignette Overlays for Maximum Text Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 via-40% to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

                {/* Top-Left BREAKING Pill Badge */}
                <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-none px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md ${
                      breaking.is_breaking ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-[#f97316]'
                    }`}
                  >
                    {breaking.is_breaking && <span className="size-1.5 rounded-full bg-white animate-ping" />}
                    <span>{breaking.badge}</span>
                  </span>
                </div>

                {/* Bottom Details Content */}
                <div className="relative z-10 flex flex-col items-start p-5 sm:p-6 md:p-7">
                  {/* Category Badge */}
                  <span className="mb-2.5 inline-block rounded-none bg-black/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    {breaking.category}
                  </span>

                  {/* Title */}
                  <h3 className="mb-2 text-xl sm:text-2xl lg:text-[26px] font-bold leading-tight tracking-tight text-white transition-colors duration-200 group-hover:text-amber-200 line-clamp-3">
                    {breaking.title}
                  </h3>

                  {/* Date */}
                  <time
                    dateTime={breaking.date}
                    className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300"
                  >
                    {breaking.date}
                  </time>
                </div>
              </Link>
            </div>
          )}

          {/* Right Column: Recent News */}
          {hasPopular && (
            <div className={`flex flex-col ${breaking ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                  Recent News
                </h2>
                <Link
                  href="/news"
                  className="text-xs font-bold uppercase tracking-wider text-[#1365A4] hover:underline"
                >
                  View All News &rarr;
                </Link>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 sm:gap-y-8">
                {popular.map((item) => (
                  <article key={item.id} className="group flex flex-col">
                    <Link
                      href={item.href}
                      className="flex flex-col h-full rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1365A4]"
                    >
                      {/* Thumbnail with Category Badges */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-none bg-neutral-100 shadow-sm">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 28vw"
                          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                        />

                        {/* Bottom-left Overlaid Badges */}
                        <div className="absolute bottom-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1.5">
                          {item.categories.map((cat) => (
                            <span
                              key={cat}
                              className="inline-block rounded-none bg-black/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-[2px]"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Content Below Thumbnail */}
                      <div className="mt-3 flex flex-1 flex-col">
                        <h3 className="mb-1.5 text-[15px] sm:text-base font-bold leading-snug text-neutral-900 transition-colors duration-200 group-hover:text-[#1365A4] line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-[13px] leading-relaxed text-neutral-500 line-clamp-2">
                          {item.excerpt}
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
