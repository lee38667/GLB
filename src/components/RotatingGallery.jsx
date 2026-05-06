import Image from 'next/image'
import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/autoplay'
import { GALLERY } from '../data/gallery'

export default function RotatingGallery(){
  return (
    <section className="lookbook" aria-labelledby="lookbook-heading">
      <div className="lookbook-inner">
        <div className="section-intro">
          <span className="eyebrow">Lookbook // Field Tested</span>
          <h2 id="lookbook-heading">Cityproof Frames</h2>
          <p>Captured across elevated carparks, floodlit courts, and heavy transit corridors after dark.</p>
        </div>
      </div>
      <div className="gallery">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 0, disableOnInteraction: false }}
          speed={5200}
          loop
          freeMode
          slidesPerView={2}
          breakpoints={{ 640:{slidesPerView:3}, 900:{slidesPerView:4}, 1200:{slidesPerView:5} }}
          spaceBetween={20}
          className="gallery-swiper"
        >
          {GALLERY.map((file, i)=> (
            <SwiperSlide key={i}>
              <div className="gallery-item relative">
                <Image
                  src={`/assets/${file}`}
                  alt="Lookbook still"
                  fill
                  sizes="(min-width: 1280px) 260px, (min-width: 768px) 220px, 180px"
                  className="object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
