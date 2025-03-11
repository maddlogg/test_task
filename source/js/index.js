import Swiper from "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs";

const swiper = new Swiper(".slider", {
  direction: "horizontal",
  loop: true,
  pagination: {
    el: ".slider__pagination",
    clickable: true,
  },
});
