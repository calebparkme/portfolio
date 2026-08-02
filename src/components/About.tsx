import { galleryImages } from "@/data/gallery";
import { withBasePath } from "@/lib/basePath";

// caleb-2026-07-19-01.jpg (originally IMG_1204.jpeg)
const featured = galleryImages.find((image) => image.src.endsWith("photo-12.jpg"))!;

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-5 sm:gap-16">
        <div className="sm:col-span-2">
          <img
            src={withBasePath(featured.src)}
            alt="Caleb Park"
            width={featured.width}
            height={featured.height}
            className="aspect-4/5 w-full rounded-sm object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-center sm:col-span-3">
          <p className="mb-4 text-xs tracking-[0.3em] text-neutral-400 uppercase">
            About
          </p>
          <p className="text-xl leading-relaxed font-light text-neutral-800 sm:text-2xl">
            오랜 시간 IT업계에 종사하다,
            <br />
            이제는 나의 즐거움을 찾아가고 있습니다.
          </p>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-neutral-500">
            내가 진정 무엇을 좋아하는지는 아직도 알 수가 없습니다.
            <br />
            단지 나에게 소리로, 모양으로 말을 걸어오는 모든 것들과
            소통을 하고 교감을 가지려 노력합니다.
            <br />
            그리고 그것들을 기록합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
