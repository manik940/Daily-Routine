import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// Placeholder images from Unsplash
const banners = [
  { id: 1, image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80", text: "Education is the key to success" },
  { id: 2, image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80", text: "Start your day with a plan" },
  { id: 3, image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80", text: "Knowledge is power" },
  { id: 4, image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80", text: "Stay focused, stay humble" },
];

export default function BannerSlider() {
  return (
    <div className="w-full h-48 rounded-2xl overflow-hidden shadow-md mb-6 relative">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="h-full w-full"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id} className="relative">
            <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-end p-4">
                <p className="text-white font-medium text-sm md:text-base drop-shadow-md">
                    {banner.text}
                </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
